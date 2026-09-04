# Anime Guard Strict

Extensión Chrome/Chromium (Manifest V3) para bloquear páginas de anime/manga con señales sexuales/adultas.

## Qué hace

- Oculta inmediatamente una página candidata mientras la verifica.
- Bloquea por señales presentes en la propia ficha: Ecchi, Hentai, Sin Censura, NSFW, 18+, desnudez, etc.
- Consulta la API pública de AniList para revisar:
  - `isAdult`
  - género `Ecchi`
  - tags adultos
  - tags relevantes como `Nudity`, `Sexual...`, `Hypersexuality`, etc.
- Modo estricto por defecto: si una web claramente de anime no puede identificarse con confianza, se bloquea por precaución.
- Excepciones explícitas:
  - manga-oni.com/.../blue-lock
  - manga-oni.com/.../wind-breaker
  - manga-oni.com/.../one-piece

## Instalación

1. Descomprime la carpeta.
2. Abre `chrome://extensions/`.
3. Activa `Modo de desarrollador`.
4. Pulsa `Cargar descomprimida`.
5. Selecciona la carpeta `anime_guard_strict`.
6. En Detalles de la extensión, activa `Permitir en incógnito` si también quieres que funcione allí.

## Nota

No necesitas iniciar sesión en AniList ni proporcionar contraseña/token: la extensión usa consultas públicas a `https://graphql.anilist.co`.

No existe una base de datos perfecta. El modo estricto está diseñado para favorecer el bloqueo ante dudas.
