# Distribución: paquete único (app + extensión)

## Principio

SafeBrowse Guard se distribuye como **un solo producto**. La extensión de
navegador viaja **dentro** del instalador de la aplicación de escritorio/móvil.
No se descarga, no se instala y no se compra por separado.

- **No hay** un listado independiente de la extensión en Chrome Web Store,
  Microsoft Edge Add-ons ni addons.mozilla.org (AMO) como producto que el usuario
  pueda encontrar e instalar por su cuenta.
- Cualquier presencia en una store existe **solo** como canal de firma/hosting
  del artefacto que embebe el instalador (self-distribution), nunca como una
  ficha descubrible o vendible.
- La documentación de instalación (README y guías de usuario) ofrece **únicamente**
  el instalador de la app.

## Contrato de artefactos

`pnpm build` produce, sin publicar nada:

| Ruta | Contenido |
| --- | --- |
| `dist/chrome/` | `manifest.json` MV3 + `background.js` para navegadores Chromium |
| `dist/firefox/` | `manifest.json` MV3 + `background.js` para Firefox (`browser_specific_settings.gecko`) |

Estos directorios son la **entrada** que el instalador de la app empaqueta y
deja en disco durante la instalación. El mismo `dist/` sirve hoy para pruebas
locales sin empaquetar.

Antes de firmar/empaquetar, el instalador necesitará:

- **Chromium:** un `.crx` firmado (o los archivos sin empaquetar más un
  `external_extensions` con `path`/`external_version`) y un `id` de extensión
  estable derivado de la clave pública.
- **Firefox:** un `.xpi` firmado por Mozilla mediante *self-distribution signing*
  (API de AMO), requisito incluso para sideload.

La gestión de esas claves de firma es una decisión abierta (ver "Pendiente").

## Escritorio: Windows / macOS / Linux

Durante la instalación de la app:

1. **Detección de navegadores.** El instalador inspecciona las rutas/claves de
   instalación estándar por SO para determinar qué navegadores soportados están
   presentes.
2. **Registro de la extensión** por navegador detectado, con el mecanismo nativo
   de "extensión externa" / política de cada uno. El desinstalador de la app
   revierte exactamente lo que registró.

### Navegadores Chromium (Chrome, Edge, Brave, Chromium)

Mecanismo *External Extensions* (instala una extensión local sin store):

| SO | Ubicación del registro |
| --- | --- |
| Windows | Clave de registro `HKLM\Software\Google\Chrome\Extensions\<id>` (Edge: `HKLM\Software\Microsoft\Edge\Extensions\<id>`) con `path` + `version`, apuntando al `.crx`/carpeta que el instalador dejó en disco. |
| macOS | `/Library/Application Support/Google/Chrome/External Extensions/<id>.json` (o el equivalente por navegador) con `external_crx` + `external_version`. |
| Linux | `/opt/google/chrome/extensions/<id>.json` (o `~/.config/<navegador>/External Extensions/<id>.json`). |

Alternativa de mayor control (y mayor intrusión, a evaluar): política de empresa
`ExtensionInstallForcelist` / `ExtensionSettings` con un `update_url`
auto-hospedado. Se prefiere el registro *External Extensions* local porque no
fuerza la extensión ni impide que el usuario la desactive.

### Firefox

- **Política `policies.json`** con `ExtensionSettings`:
  `"<id>": { "install_url": "file:///<ruta al .xpi firmado>", "installation_mode": "normal_installed" }`.
  Se coloca en la carpeta `distribution/` de la instalación de Firefox o en la
  ubicación de políticas del SO. `normal_installed` deja que el usuario la
  desactive; `force_installed` no.
- Alternativa: carpeta de sideload `distribution/extensions/` con el `.xpi`
  firmado.

### Safari

Bloqueado (ver `docs/SAFARI_STRATEGY.md`). Nota a favor del modelo: una extensión
de Safari **solo** puede distribuirse dentro de una app de macOS/iOS (Safari App
Extension / Safari Web Extension), lo que coincide con el paquete único.

## Móvil: Android / iOS

No hay registro silencioso. La app muestra instrucciones y, cuando el navegador
lo permite, un deep-link:

- **Android (Firefox / navegadores Gecko):** la app enlaza a una **colección de
  AMO propia** del proyecto para instalar la extensión desde la app del
  navegador. La colección es un canal de instalación, no una ficha de producto
  independiente.
- **iOS (Safari):** si existe app de iOS, la Safari Web Extension se empaqueta en
  el **mismo `.ipa`**. La app guía al usuario para habilitarla en
  *Ajustes → Safari → Extensiones*. Los deep-links a Ajustes de iOS no son
  fiables, así que se prioriza la guía dentro de la app.

## Pendiente (decisiones fuera del alcance de esta historia)

- Framework y repositorio de la app de escritorio/móvil y de su instalador
  (este repo es hoy solo la extensión).
- Gestión de claves de firma `.crx` / `.xpi` y del `id` estable de la extensión.
- Canal de auto-actualización de la extensión dentro del paquete.

Cuando exista el proyecto de la app, su instalador y su desinstalador deben
implementar la detección y el registro/reversión descritos arriba, y esta guía
se actualiza con las rutas y el mecanismo concretos elegidos.
