
(() => {
  const originalUrl = location.href;

  // Excepciones explícitas pedidas por el usuario.
  const ALLOW_URLS = [
    /^https?:\/\/(?:www\.)?manga-oni\.com\/(?:lector|manga)\/blue-lock(?:[/?#]|$)/i,
    /^https?:\/\/(?:www\.)?manga-oni\.com\/(?:lector|manga)\/wind-breaker(?:[/?#]|$)/i,
    /^https?:\/\/(?:www\.)?manga-oni\.com\/(?:lector|manga)\/one-piece(?:[/?#]|$)/i
  ];

  if (ALLOW_URLS.some(rx => rx.test(originalUrl))) return;

  const host = location.hostname.toLowerCase();
  const path = location.pathname.toLowerCase();

  const KNOWN_ANIME_HOST = /(?:^|\.)((?:animeflv|veranime|veranimes|jkanime|animefenix|crunchyroll|anilist)\.[a-z.]+)$/i.test(host)
    || host.includes("animeflv")
    || host.includes("veranime")
    || host.includes("veranimes");

  const ANIMEISH_PATH = /\/(?:anime|animes|manga|manhwa|manhua|webtoon|episodio|episode|capitulo|chapter|genero|genre)\b/i.test(path);

  const strictCandidate = KNOWN_ANIME_HOST || ANIMEISH_PATH;

  // Oculta inmediatamente las páginas candidatas mientras se decide.
  let guardStyle = null;
  if (strictCandidate) {
    guardStyle = document.createElement("style");
    guardStyle.id = "__anime_guard_hide__";
    guardStyle.textContent = "html{visibility:hidden!important;background:#111!important}";
    (document.documentElement || document).appendChild(guardStyle);
  }

  const PAGE_PATTERNS = [
    [/\bhentai\b/i, "La página indica Hentai."],
    [/\becchi\b/i, "La página indica Ecchi."],
    [/\bnsfw\b/i, "La página indica NSFW."],
    [/\bsin[\s_-]*censura\b/i, "La página indica “Sin Censura”."],
    [/\buncensored\b/i, "La página indica “Uncensored”."],
    [/\bcontenido\s+(?:para\s+)?adultos?\b/i, "La página indica contenido para adultos."],
    [/\badult\s+content\b/i, "La página indica contenido para adultos."],
    [/\b18\s*\+\b/i, "La página indica 18+."],
    [/\b(?:nudity|nude|desnud[oa]s?|desnudez)\b/i, "La página indica desnudez."],
    [/\b(?:porn|porno|pornograf(?:ia|ico|ica))\b/i, "La página contiene una señal pornográfica."],
    [/\brule[\s_-]*34\b/i, "La página contiene Rule 34."],
    [/\b(?:erotic|erotico|erotica)\b/i, "La página indica contenido erótico."]
  ];

  function cleanTitle(s) {
    return (s || "")
      .replace(/\s*[|•–—-]\s*(?:AnimeFLV|Ver Anime|VerAnime|Anime Online|AniList).*$/i, "")
      .replace(/^Ver\s+/i, "")
      .replace(/\b(?:Sub\s+español|español\s+latino|Online|HD)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fromUrl() {
    const parts = path.split("/").filter(Boolean);
    const markers = new Set(["anime","animes","manga","manhwa","manhua","webtoon"]);
    for (let i = 0; i < parts.length - 1; i++) {
      if (markers.has(parts[i])) {
        return parts[i + 1].replace(/[-_]+/g, " ");
      }
    }
    return "";
  }

  function extractTitle() {
    const values = [
      document.querySelector('meta[property="og:title"]')?.content,
      document.querySelector('meta[name="twitter:title"]')?.content,
      document.querySelector("main h1")?.textContent,
      document.querySelector("h1")?.textContent,
      fromUrl(),
      document.title
    ].filter(Boolean).map(cleanTitle).filter(Boolean);

    // Prefiere valores razonablemente cortos y no genéricos.
    return values.find(v => v.length >= 2 && v.length <= 120 && !/^(anime|manga|inicio|home)$/i.test(v))
      || values[0]
      || "";
  }

  function collectRelevantText() {
    const chunks = [];

    for (const sel of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '[class*="genre"]',
      '[class*="genero"]',
      '[class*="tag"]',
      '[rel="tag"]',
      'main h1',
      'main h2',
      'article h1',
      'article h2'
    ]) {
      document.querySelectorAll(sel).forEach(el => {
        const t = el.content || el.textContent || "";
        if (t && t.length < 2500) chunks.push(t);
      });
    }

    // También revisa un trozo inicial del contenido principal, no toda la página,
    // para evitar falsos positivos de menús laterales enormes.
    const main = document.querySelector("main, article, #content, .content, .anime, .anime-single");
    if (main) chunks.push((main.innerText || "").slice(0, 7000));

    return chunks.join("\n");
  }

  function pageReasons(text) {
    const reasons = [];
    for (const [rx, reason] of PAGE_PATTERNS) {
      if (rx.test(text)) reasons.push(reason);
    }
    return [...new Set(reasons)];
  }

  function reveal() {
    const el = document.getElementById("__anime_guard_hide__");
    if (el) el.remove();
    document.documentElement.style.visibility = "";
  }

  function block(title, reasons) {
    chrome.runtime.sendMessage({
      type: "BLOCK_CURRENT_TAB",
      url: originalUrl,
      title,
      reasons
    });
  }

  async function run() {
    const title = extractTitle();
    const text = collectRelevantText();
    const reasons = pageReasons(text);

    chrome.runtime.sendMessage({
      type: "CHECK_ANIME",
      title,
      url: originalUrl,
      pageReasons: reasons,
      strictCandidate
    }, response => {
      if (chrome.runtime.lastError) {
        if (strictCandidate) {
          block(title, ["No se pudo ejecutar el verificador; modo estricto bloqueó la página."]);
        } else {
          reveal();
        }
        return;
      }

      if (response?.action === "block") {
        block(title, response.reasons || ["Contenido bloqueado."]);
      } else {
        reveal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(run, 250), { once: true });
  } else {
    setTimeout(run, 250);
  }

  // Failsafe visual: en páginas no candidatas nunca dejar oculto.
  if (!strictCandidate) reveal();
})();
