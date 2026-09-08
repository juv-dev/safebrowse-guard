# SafeBrowse Guard

Extensión multiplataforma que detecta, restringe y bloquea contenido pornográfico, sexual explícito y sexualizado durante la navegación.

## Estado

Repositorio reiniciado. La implementación comienza desde cero siguiendo la especificación del producto (arquitectura local-first, privada por diseño, con Risk Engine multiplataforma).

## Requisitos

- Node.js `>=20.11`
- pnpm `10.15.0` (fijado en `package.json` mediante `packageManager`)

Se recomienda habilitar Corepack para respetar la versión fijada:

```bash
corepack enable
```

## Gestor de paquetes

Este proyecto usa exclusivamente `pnpm`. No usar `npm`, `yarn` ni `bun`.

## Instalación

```bash
pnpm install --frozen-lockfile
```

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm lint` | ESLint sobre todo el repositorio (flat config, reglas type-checked para `.ts`). |
| `pnpm lint:fix` | ESLint con autofix. |
| `pnpm typecheck` | `tsc --noEmit` con la configuración strict. |
| `pnpm test` | Ejecuta la suite de Vitest una vez. |
| `pnpm test:watch` | Vitest en modo watch. |
| `pnpm test:coverage` | Vitest con reporte de cobertura (umbral 80%). |
| `pnpm build` | Genera los artefactos de Chrome y Firefox en `dist/`. |
| `pnpm build:chrome` | Genera solo `dist/chrome/` (manifest MV3 + `background.js`). |
| `pnpm build:firefox` | Genera solo `dist/firefox/` (manifest MV3 + `background.js`). |

## Build

`pnpm build` empaqueta la extensión con `esbuild-wasm` (sin binario nativo) y
escribe un directorio por navegador en `dist/`:

- `dist/chrome/` — `manifest.json` con `background.service_worker`.
- `dist/firefox/` — `manifest.json` con `background.scripts` y
  `browser_specific_settings.gecko`.

El build no publica nada. Los artefactos de `dist/` cumplen dos funciones:
instalarse sin empaquetar en cada navegador para pruebas locales, y ser la
entrada que embebe el instalador de la aplicación SafeBrowse Guard.

## Distribución

SafeBrowse Guard se distribuye como **un solo producto**: la extensión de
navegador viaja **dentro** del instalador de la aplicación de escritorio/móvil.
No se descarga ni se instala por separado, y **no existe** un listado
independiente de la extensión en las stores de navegador (Chrome Web Store,
Edge Add-ons, addons.mozilla.org).

El modelo de paquete único, la detección de navegadores y el registro de la
extensión por navegador y por sistema operativo están descritos en
[`docs/DISTRIBUTION.md`](docs/DISTRIBUTION.md).

## Integración continua

`.github/workflows/ci.yml` corre en cada push y en cada pull request. Cada paso
es un job independiente y reporta su estado por separado:

| Job | Comando |
| --- | --- |
| `lint` | `pnpm install --frozen-lockfile` + `pnpm lint` |
| `typecheck` | `pnpm install --frozen-lockfile` + `pnpm typecheck` |
| `test` | `pnpm install --frozen-lockfile` + `pnpm test` |
| `build` (matriz `chrome`, `firefox`) | `pnpm build:<target>` y subida del artefacto |

Un PR con un error de lint, de tipos o un test roto falla el job
correspondiente y bloquea el merge.

## Estructura de carpetas

```
src/
  core/            Lógica de dominio, sin dependencias de navegador
    classifier/    Clasificación de contenido
    rules/         Motor de reglas
    keywords/      Diccionarios y matching de términos
    domain-intelligence/  Reputación e inteligencia de dominios
    providers/     Integraciones con proveedores externos de señales
    visual/        Análisis visual de página
    risk/          Risk Engine y scoring
    normalization/ Normalización de texto y URLs
    whitelist/     Listas de permitidos
    local-blocklist/  Listas de bloqueo locales
    cache/         Cacheo de resultados
    privacy/       Garantías de privacidad
    security/      Controles de seguridad
    integrity/     Verificación de integridad
    entitlements/  Licencias y features habilitadas
    i18n/          Internacionalización
    types/         Tipos compartidos del core
  browser/         Capa de adaptación por navegador
    adapters/      Contratos y adaptadores comunes
    chromium/      Implementación Chromium
    firefox/       Implementación Firefox
    safari/        Implementación Safari
  background/      Service worker / script de fondo
  content/         Content scripts
  popup/           UI del popup
  options/         UI de opciones
  shared/          Utilidades compartidas entre capas
rulesets/          Conjuntos de reglas versionados
  global/          Reglas independientes de idioma
  en/ es/ fr/ pt/ de/ it/ ja/   Reglas por idioma
tests/
  unit/            Tests unitarios
  integration/     Tests de integración
  privacy/         Tests de garantías de privacidad
  security/        Tests de seguridad
  performance/     Tests de rendimiento
  fixtures/        Datos de prueba compartidos
docs/
  legal/           Documentación legal (privacidad, términos)
```

Cada historia siguiente coloca su código y sus tests dentro de la carpeta correspondiente de este árbol.
