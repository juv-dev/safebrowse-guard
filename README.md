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
