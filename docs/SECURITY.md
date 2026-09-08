# Seguridad

## Política zero-remote-code (regla absoluta)

SafeBrowse Guard **nunca ejecuta código que no venga empaquetado y firmado dentro
de la extensión**. Ningún `fetch`, provider externo (AniList u otros) ni respuesta
de servidor puede derivar en ejecución de código en el navegador del usuario.

Esta política se establece antes de integrar cualquier provider externo para que
ningún flujo de red futuro pueda convertirse en un vector de ejecución remota.

### 1. Content Security Policy estricta

Los manifests de Chromium y Firefox (`dist/<target>/manifest.json`, generados por
`scripts/build-extension.mjs`) declaran:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'"
}
```

- `script-src 'self'`: solo se ejecutan scripts empaquetados en la extensión.
  Quedan bloqueados los scripts remotos, `eval`, `new Function` y los handlers
  de eventos inline.
- `object-src 'none'`: sin `<object>`, `<embed>` ni `<applet>`.

### 2. Regla de lint (defensa en el código fuente)

`eslint.config.js` prohíbe, con nivel `error`, los patrones que introducen
ejecución dinámica de código:

| Patrón | Regla |
| --- | --- |
| `eval(...)` | `no-eval` |
| `new Function(...)` | `no-new-func`, `no-implied-eval` |
| `setTimeout` / `setInterval` con string | `no-implied-eval` |
| `import()` de URL remota (`http:`, `https:`, `//`) | `no-restricted-syntax` |
| `import()` con especificador no literal | `no-restricted-syntax` |

La regla se verifica en `tests/security/no-remote-code.spec.ts`: un módulo de
prueba (`tests/fixtures/csp-violations/remote-code.js`, excluido del lint normal)
que usa `new Function`, `eval`, timers con string e `import()` remoto debe ser
rechazado por ESLint; un módulo equivalente sin esos patrones no genera ningún
error de política.

## Reporte de vulnerabilidades

Abrir un issue privado o contactar al mantenedor. No divulgar públicamente hasta
que exista una corrección publicada.
