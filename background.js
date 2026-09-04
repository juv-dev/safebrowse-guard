
const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const BLOCK_GENRES = new Set(["ecchi"]);

const BLOCK_TAG_PARTS = [
  "nudity",
  "sexual",
  "hypersexual",
  "psychosexual",
  "hentai",
  "ecchi",
  "erotica",
  "erotic",
  "fetish",
  "bondage",
  "bdsm",
  "prostitution",
  "sex work",
  "sexual violence",
  "sexual content",
  "fanservice"
];

const QUERY = `
query ($search: String!) {
  Page(page: 1, perPage: 8) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      isAdult
      title { romaji english native }
      synonyms
      genres
      tags {
        name
        rank
        isAdult
        category
      }
      siteUrl
    }
  }
}`;

function norm(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreCandidate(search, media) {
  const q = norm(search);
  if (!q) return 0;
  const titles = [
    media?.title?.romaji,
    media?.title?.english,
    media?.title?.native,
    ...(media?.synonyms || [])
  ].filter(Boolean).map(norm);

  let best = 0;
  for (const t of titles) {
    if (!t) continue;
    if (t === q) best = Math.max(best, 1);
    else if (t.includes(q) || q.includes(t)) {
      const ratio = Math.min(t.length, q.length) / Math.max(t.length, q.length);
      best = Math.max(best, 0.78 + 0.2 * ratio);
    } else {
      const qa = new Set(q.split(" "));
      const ta = new Set(t.split(" "));
      let inter = 0;
      for (const x of qa) if (ta.has(x)) inter++;
      const union = new Set([...qa, ...ta]).size || 1;
      best = Math.max(best, inter / union);
    }
  }
  return best;
}

async function queryAniList(search) {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { search } })
  });

  if (!response.ok) {
    throw new Error(`AniList HTTP ${response.status}`);
  }
  const payload = await response.json();
  const list = payload?.data?.Page?.media || [];
  if (!list.length) return null;

  let best = null;
  let bestScore = -1;
  for (const item of list) {
    const s = scoreCandidate(search, item);
    if (s > bestScore) {
      best = item;
      bestScore = s;
    }
  }
  if (!best || bestScore < 0.58) return null;
  best._matchScore = bestScore;
  return best;
}

function evaluateMedia(media) {
  if (!media) {
    return { blocked: false, reasons: [], media: null };
  }
  const reasons = [];

  if (media.isAdult === true) reasons.push("AniList: marcado como contenido para adultos (18+).");

  for (const g of media.genres || []) {
    if (BLOCK_GENRES.has(norm(g))) reasons.push(`AniList: género ${g}.`);
  }

  for (const tag of media.tags || []) {
    const n = norm(tag.name);
    if (tag.isAdult === true) {
      reasons.push(`AniList: tag adulto “${tag.name}”.`);
      continue;
    }
    if ((tag.rank || 0) >= 35 && BLOCK_TAG_PARTS.some(p => n.includes(norm(p)))) {
      reasons.push(`AniList: tag “${tag.name}” (${tag.rank || 0}%).`);
    }
  }

  return { blocked: reasons.length > 0, reasons, media };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "CHECK_ANIME") return;

  (async () => {
    const settings = await chrome.storage.local.get({
      strictUnknown: true,
      enabled: true
    });

    if (!settings.enabled) {
      sendResponse({ action: "allow", reasons: ["Filtro desactivado."] });
      return;
    }

    if (msg.pageReasons?.length) {
      sendResponse({ action: "block", reasons: msg.pageReasons, source: "page" });
      return;
    }

    let media = null;
    let apiError = null;
    try {
      media = await queryAniList(msg.title || "");
    } catch (e) {
      apiError = String(e?.message || e);
    }

    if (media) {
      const verdict = evaluateMedia(media);
      if (verdict.blocked) {
        sendResponse({
          action: "block",
          reasons: verdict.reasons,
          source: "anilist",
          media: {
            id: media.id,
            title: media.title,
            siteUrl: media.siteUrl,
            matchScore: media._matchScore
          }
        });
        return;
      }
      sendResponse({
        action: "allow",
        reasons: ["AniList no encontró señales configuradas como bloqueables."],
        source: "anilist",
        media: {
          id: media.id,
          title: media.title,
          siteUrl: media.siteUrl,
          matchScore: media._matchScore
        }
      });
      return;
    }

    if (msg.strictCandidate && settings.strictUnknown) {
      sendResponse({
        action: "block",
        reasons: [
          apiError
            ? `No se pudo verificar de forma segura (${apiError}).`
            : "No se pudo identificar con suficiente confianza el anime; modo estricto bloquea por precaución."
        ],
        source: "unknown"
      });
      return;
    }

    sendResponse({ action: "allow", reasons: ["No parece una página de anime/manga que requiera verificación."] });
  })();

  return true;
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type !== "BLOCK_CURRENT_TAB" || !sender.tab?.id) return;
  const params = new URLSearchParams();
  params.set("url", msg.url || "");
  params.set("title", msg.title || "");
  params.set("reasons", JSON.stringify(msg.reasons || []));
  chrome.tabs.update(sender.tab.id, {
    url: chrome.runtime.getURL("blocked.html") + "?" + params.toString()
  });
});
