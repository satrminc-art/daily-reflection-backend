import type { PageStylePresetId } from "@/theme/presets";

export interface PageStyleSystem {
  id: PageStylePresetId;
  fullVariant: "classic" | "editorial" | "ledger";
  compactVariant: "classic" | "editorial" | "ledger";
  noteVariant: "classic" | "editorial" | "ledger";
}

const PAGE_STYLE_SYSTEMS: Record<PageStylePresetId, PageStyleSystem> = {
  "classic-tearoff": {
    id: "classic-tearoff",
    fullVariant: "classic",
    compactVariant: "classic",
    noteVariant: "classic",
  },
  "framed-editorial": {
    id: "framed-editorial",
    fullVariant: "editorial",
    compactVariant: "editorial",
    noteVariant: "editorial",
  },
  "soft-ledger": {
    id: "soft-ledger",
    fullVariant: "ledger",
    compactVariant: "ledger",
    noteVariant: "ledger",
  },
};

export function resolvePageStyleSystem(pageStyleId: PageStylePresetId): PageStyleSystem {
  return PAGE_STYLE_SYSTEMS[pageStyleId] ?? PAGE_STYLE_SYSTEMS["classic-tearoff"];
}
