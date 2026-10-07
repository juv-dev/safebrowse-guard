# Flujo de cambios y releases

Mantén `main` como la línea estable: integra cambios mediante PRs cortos y acepta una release solo con checks técnicos y pruebas manuales documentadas para el commit exacto. Esta guía define una política de trabajo; no configura protecciones de ramas ni añade automatización de tags o publicación.

## v0.4.2 Sprint 5 candidate

`v0.4.2` is the Sprint 5 prerelease candidate after `v0.4.1`. Its scope is the explicit consent and role gate, the Privacy Policy no-sale/no-advertising-share clause, the Utah/Louisiana/Texas accountability research, and the Bitdefender desktop coexistence evidence plan. This release does not claim production legal approval, store approval, real-device Bitdefender compatibility, or complete product blocking efficacy.

Required evidence before tagging or publishing the GitHub Release:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- generated Chrome and Firefox manifests report version `0.4.2`
- manual review acknowledges that legal and Bitdefender documents are drafts and evidence plans, not final legal or compatibility claims


## Flujo de trabajo

1. **Rama:** en proyectos que usan solo `main`, crea `feature/<slug>` para una funcionalidad o `bugfix/<slug>` para una corrección y abre un PR a `main`. Para una corrección urgente, usa `hotfix/<slug>` desde `main` y abre también un PR a `main`.
2. **`develop` existente:** si un proyecto ya tiene `develop`, sigue su flujo vigente hasta acordar expresamente una transición. No cambies el destino de PRs ni crees o elimines ramas como parte de esta guía.
3. **Revisión y checks:** el PR debe identificar el cambio y su alcance, pasar los checks técnicos requeridos y adjuntar la evidencia manual aplicable antes de integrarse en `main`.
4. **Release:** tras integrar el commit aceptado, prepara el artefacto desde ese commit, verifica el artefacto y registra la release con referencias a ambos. No atribuyas a CI pasos de tag o publicación que no estén configurados y verificados.

`main` representa el estado estable aceptado; los cambios en curso permanecen en ramas breves hasta su revisión. Un check en curso, pendiente, omitido o fallido no equivale a aprobado. Resuelve o explica explícitamente cualquier check no aprobado según la política del repositorio antes de aceptar el cambio.

## Checks técnicos de CI

El README describe el workflow actual `.github/workflows/ci.yml`: en push y PR se ejecutan jobs independientes para lint, typecheck, tests y builds de Chrome/Firefox. La política de aceptación propuesta es revisar todos los checks requeridos del commit del PR; esta guía no confirma reglas de protección de ramas ni modifica la configuración CI.

| Área | Verificación técnica | Evidencia que registrar |
| --- | --- | --- |
| Dependencias | Instalación reproducible con `pnpm install --frozen-lockfile` | Resultado del job y SHA probado |
| Lint | `pnpm lint` | Estado y enlace al check |
| Tipos | `pnpm typecheck` | Estado y enlace al check |
| Tests | `pnpm test` | Estado, resumen y enlace al check |
| Build | `pnpm build:chrome` y `pnpm build:firefox` (jobs separados en CI) | Estado de cada target y enlaces a los artefactos generados |

Si se requiere cobertura para el cambio, registra además `pnpm test:coverage` y su resultado; no la presentes como check de CI sin confirmar que esté configurada como tal. Una suite verde valida solo los comportamientos cubiertos por esos tests, no la aceptación en navegador ni la eficacia del producto completo.

## Aceptación manual en navegador

Realiza las comprobaciones en cada navegador objetivo incluido en el cambio y usando el artefacto de ese build, no una copia distinta o un build local sin identificar. Para SafeBrowse Guard, `docs/DISTRIBUTION.md` describe `dist/chrome/` y `dist/firefox/` como artefactos para pruebas locales; el build por sí solo no publica una extensión.

- [ ] Registra navegador y versión, sistema operativo, SHA completo del commit y nombre/enlace o hash del artefacto probado.
- [ ] Instala/carga el artefacto de prueba siguiendo el mecanismo de desarrollo del navegador; confirma que el navegador lo acepta y que la extensión se inicia sin errores visibles en su consola.
- [ ] Comprueba únicamente la interacción implementada por el cambio: anota escenario, pasos, resultado esperado y observado. Si el cambio no añade interacción de usuario, registra esa limitación; no inventes una prueba funcional.
- [ ] Confirma que el manifiesto y el artefacto corresponden al navegador y versión del commit identificados. Adjunta capturas, logs o pasos reproducibles, evitando datos personales.
- [ ] Marca cada punto como `aprobado`, `fallido`, `pendiente` o `no aplica`, con motivo. Solo `aprobado` cuenta como pasado; los otros estados no deben resumirse como aceptación completa.

### Alcance que no se debe sobreafirmar

La aceptación manual debe cubrir lo que el código del commit realmente implementa y el PR declara. No afirmes que SafeBrowse Guard ya detecta, clasifica o bloquea pornografía durante la navegación como producto completo: la documentación de permisos indica que actualmente no hay `content_scripts` ni `host_permissions`. En particular, cargar la extensión o abrirla sin errores es una prueba de instalación/inicio, no evidencia de detección, bloqueo, cobertura de páginas ni eficacia. Marca esos comportamientos como no implementados/no verificados hasta que exista implementación y una prueba aplicable.

## Tags, Releases y versiones

| Elemento | Qué representa | Qué no representa |
| --- | --- | --- |
| Tag Git | Referencia versionada a un commit concreto, por ejemplo `v0.5.0`. | No crea por sí solo un artefacto ni una publicación descargable. |
| GitHub Release | Registro de entrega asociado a un tag; puede describir el cambio y adjuntar artefactos con su procedencia. | No demuestra que el artefacto corresponda al commit si no se registra y verifica esa relación. |
| Prerelease | Estado/etiqueta de una GitHub Release para indicar una entrega previa a la estable. | No es una versión de manifiesto distinta que el navegador acepte automáticamente. |

En SemVer, `v0.5.0-rc.1` puede usarse como nombre de tag Git y etiqueta de Release prerelease; el prefijo `v` y el sufijo `-rc.1` no deben copiarse sin más a versiones de paquete o manifiesto. Los manifests de extensiones requieren versiones numéricas: comprueba el formato admitido por cada navegador y mantén ahí una versión numérica válida. No documentes como existente ningún comando de tagging, publicación o flujo automático que no esté implementado y verificado.

Para que la entrega sea auditable, conserva juntos: SHA completo del commit, tag asociado si lo hay, resultado de checks para ese SHA, identidad del artefacto probado/publicado y evidencia manual. Si un artefacto se reconstruye, registra el SHA de origen y el nuevo hash; no supongas que dos builds son idénticos.

## Referencias

- [Distribución y contrato de artefactos](DISTRIBUTION.md)
- [README: scripts y jobs CI documentados](../README.md#integración-continua)
