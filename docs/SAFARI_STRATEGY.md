# Estrategia de soporte para Safari

**Estado: BLOCKED / REQUIRES EXTERNAL ENVIRONMENT**

El adaptador de Safari (`src/browser/safari`) está definido a nivel de contrato pero
no implementado. `createSafariBrowserAdapter()` lanza un error de forma
intencional y remite a este documento.

## Por qué está bloqueado

Safari no distribuye extensiones como Chromium o Firefox. Una extensión web para
Safari se empaqueta como una **Safari Web Extension** dentro de una app nativa de
macOS/iOS, y ese empaquetado solo puede hacerse en el ecosistema de Apple.

## Qué falta (entorno externo)

| Requisito | Detalle | Disponible en CI/entorno actual |
| --- | --- | --- |
| macOS | El proyecto de la app contenedora y `safari-web-extension-converter` solo corren en macOS. | No |
| Xcode | Necesario para generar, firmar y compilar el target de Safari Web Extension. | No |
| Cuenta Apple Developer | Requerida para firmar y para distribución (App Store o notarización fuera de la tienda). | No |
| Dispositivo/simulador Apple | Para pruebas de humo en Safari de escritorio y iOS. | No |

## Plan cuando el entorno esté disponible

1. Ejecutar `xcrun safari-web-extension-converter` sobre el build de la extensión
   para generar el proyecto Xcode de la app contenedora.
2. Implementar `src/browser/safari/safari-adapter.ts` sobre `browser.*`
   (Safari expone la API WebExtensions con prefijo `browser`), reutilizando
   `createWebExtensionAdapter` igual que Firefox.
3. Cubrir las diferencias conocidas de Safari (límites de `storage`, disponibilidad
   de `tabs`, comportamiento de `runtime.sendMessage`) con tests dedicados.
4. Añadir el pipeline de firma y notarización en un runner macOS.
5. Quitar el `throw` de `createSafariBrowserAdapter()` y este estado de bloqueo.

## Impacto en el core

Ninguno. El core depende de `BrowserAdapter`, no de una implementación concreta.
Cuando el adaptador de Safari exista, `selectBrowserAdapter` lo devolverá sin
cambios en la lógica de negocio.
