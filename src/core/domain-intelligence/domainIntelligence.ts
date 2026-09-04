import { normalizeHostname } from "../normalization/textNormalization";

export type DomainCategory =
  | "adult-platform"
  | "pornography"
  | "hentai"
  | "imageboard-adult"
  | "cam-platform";

interface AdultDomainSeed {
  readonly domain: string;
  readonly category: DomainCategory;
}

export const ADULT_DOMAIN_SEED_LIST: readonly AdultDomainSeed[] = [
  { domain: "pornhub.com", category: "pornography" },
  { domain: "xvideos.com", category: "pornography" },
  { domain: "xnxx.com", category: "pornography" },
  { domain: "redtube.com", category: "pornography" },
  { domain: "xhamster.com", category: "pornography" },
  { domain: "youporn.com", category: "pornography" },
  { domain: "spankbang.com", category: "pornography" },
  { domain: "tube8.com", category: "pornography" },
  { domain: "onlyfans.com", category: "adult-platform" },
  { domain: "fansly.com", category: "adult-platform" },
  { domain: "manyvids.com", category: "adult-platform" },
  { domain: "chaturbate.com", category: "cam-platform" },
  { domain: "stripchat.com", category: "cam-platform" },
  { domain: "bongacams.com", category: "cam-platform" },
  { domain: "cam4.com", category: "cam-platform" },
  { domain: "livejasmin.com", category: "cam-platform" },
  { domain: "myfreecams.com", category: "cam-platform" },
  { domain: "nhentai.net", category: "hentai" },
  { domain: "hanime.tv", category: "hentai" },
  { domain: "hentaihaven.xxx", category: "hentai" },
  { domain: "rule34.xxx", category: "imageboard-adult" },
  { domain: "e621.net", category: "imageboard-adult" },
  { domain: "gelbooru.com", category: "imageboard-adult" },
];

export type DomainIntelligenceResult =
  | { blocked: true; category: DomainCategory; matchedDomain: string }
  | { blocked: false };

function matchesSeedDomain(hostname: string, seed: string): boolean {
  return hostname === seed || hostname.endsWith(`.${seed}`);
}

export function classifyDomain(hostname: string): DomainIntelligenceResult {
  const normalized = normalizeHostname(hostname);
  const match = ADULT_DOMAIN_SEED_LIST.find((entry) => matchesSeedDomain(normalized, entry.domain));
  if (!match) {
    return { blocked: false };
  }
  return { blocked: true, category: match.category, matchedDomain: match.domain };
}
