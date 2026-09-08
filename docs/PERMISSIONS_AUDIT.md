# Auditoría de permisos

Estado: `manifest_version: 3`. El manifest se genera en `scripts/build-extension.mjs`
(`createManifest`). Hoy declara:

```json
"permissions": ["storage", "tabs"]
```

Sin `host_permissions`, sin `optional_permissions`, sin `content_scripts`.

Regla: ningún permiso entra al manifest sin una entrada en este documento que
explique para qué se usa y si hay una alternativa de menor alcance. El test
`tests/security/permissions-audit.spec.ts` verifica que el manifest y este
documento no se desincronicen.

## Permisos declarados

### `storage`

- **Para qué se usa:** persistir la configuración local del usuario (activado/
  desactivado, umbrales, listas locales) mediante `chrome.storage.local`, detrás
  de `BrowserAdapter.storage`.
- **Datos a los que da acceso:** únicamente las claves que la propia extensión
  escribe en su área `local`. No expone historial, cookies ni identidad.
- **Alternativa de menor alcance:** no existe una más acotada. Se descarta
  `storage.sync` (replicaría datos en la nube del navegador, contrario al
  principio local-first) y `unlimitedStorage` (no se necesita ese volumen).
- **Decisión:** se mantiene.

### `tabs`

- **Para qué se usa:** obtener el `url`/`hostname` de la pestaña activa para
  alimentar `SensitiveSiteGuard` (SG-29) y decidir si el pipeline de
  clasificación debe cortarse antes de cualquier análisis.
- **Datos a los que da acceso:** `tab.id` y `tab.url` de las pestañas. No se usa
  `tabs.executeScript`, no se lee `title`, `favIconUrl` ni el historial de
  navegación, y no se rastrean pestañas en segundo plano.
- **Alternativa de menor alcance:**
  - `activeTab`: da acceso puntual a la pestaña activa **solo tras un gesto del
    usuario** (click en la acción, atajo, menú contextual). Insuficiente: el
    producto debe evaluar cada navegación automáticamente, no solo tras un click.
  - **Mensaje desde el content script:** una vez exista `content_scripts`, el
    `hostname` puede viajar desde el content script al background por el canal
    validado de mensajería (SG-31), y `tabs` deja de ser necesario para el
    background. Esta es la reducción objetivo; ver "Reducciones pendientes".
- **Decisión:** se mantiene por ahora; marcado para eliminación cuando el content
  script esté declarado.

## Host permissions y `<all_urls>`

### `<all_urls>`

- **Estado actual: NO declarado.** El manifest no pide `host_permissions` ni
  `<all_urls>`, y no hay `content_scripts`.
- **Análisis (evidencia para una decisión futura, no una copia por defecto):**
  el análisis de contenido de SG-27/28 corre sobre el DOM de las páginas que el
  usuario visita. El contenido objetivo puede aparecer en cualquier dominio, por
  lo que una allowlist curada volvería el producto inútil y daría una falsa
  sensación de protección. Opciones cuando llegue la historia de inyección:
  1. `content_scripts` con `matches: ["<all_urls>"]` y `run_at` temprano. Da
     acceso al DOM de las páginas visitadas **sin** `host_permissions`, es decir
     sin autoridad ambiental de red ni cookies entre orígenes desde el background.
     Opción preferida.
  2. `host_permissions: ["<all_urls>"]`. Más amplio: habilita fetch/cookies entre
     orígenes desde el background. No se necesita; se descarta salvo que un
     provider lo exija y quede justificado aquí.
  3. `optional_host_permissions` + registro dinámico de content scripts, pedido
     en tiempo de ejecución. Se evaluará como refinamiento de la opción 1.
- **Justificación técnica si `<all_urls>` se mantiene (opción 1):** el valor del
  producto es la protección durante toda la navegación; el alcance amplio se
  limita a **leer y anotar el DOM** de la página visible, nunca a interceptar
  red, leer cookies ni acceder a otras pestañas. `PrivacyBoundary` (SG-27) y
  `SafeDOMScanner` (SG-28) acotan qué se lee dentro de esa página.

## Permisos sensibles NO solicitados

Ninguno de estos está en el manifest. Se listan explícitamente porque su
ausencia es una decisión de diseño, no un olvido. Añadir cualquiera exige
reemplazar su fila por una justificación con la marca `JUSTIFICADO`.

### `cookies`

No se solicita. La clasificación es local sobre el DOM; nunca se leen sesiones ni
estado de autenticación.

### `history`

No se solicita. La evaluación es en vivo por navegación; no se consulta ni se
modifica el historial.

### `identity`

No se solicita. No hay cuentas, OAuth ni telemetría con identidad; todo es
local-first.

### `clipboardRead`

No se solicita. `PrivacyBoundary` (SG-27) prohíbe explícitamente leer el
portapapeles o eventos de teclado.

### `clipboardWrite`

No se solicita. La extensión no escribe en el portapapeles del usuario.

### `downloads`

No se solicita. No se generan, observan ni interceptan descargas.

### `management`

No se solicita. No se inspeccionan ni controlan otras extensiones.

### `webRequestBlocking`

No se solicita. Si en el futuro hace falta bloquear a nivel de red, se usará
`declarativeNetRequest` (reglas declarativas, sin ejecutar código sobre cada
request), y se documentará aquí.

## Reducciones pendientes

- **`tabs` → mensajería del content script:** cuando exista `content_scripts`,
  mover la obtención del `hostname` al content script y quitar `tabs`.
- **`activeTab` para el popup:** si el popup necesita acción sobre la pestaña
  actual, usar `activeTab` en vez de ampliar `tabs`.
- **Opción 1 de `<all_urls>`:** al declarar `content_scripts`, añadir aquí su
  entrada (patrones `matches`, `run_at`) antes del merge.
