export type XRView =
  | "levels"
  | "rooms"
  | "pos"
  | "adjectiveCategory"
  | "word"
  | "wordDetails";

type ViewContext = {
  level?: string;
  room?: string;
  type?: "noun" | "verb" | "adjective";
  adjectiveCategory?: "regular" | "irregular";
};

export const XRState = {
  view: "levels" as XRView,
  context: {} as ViewContext,
  interactionEnabled: false,

  setView(v: XRView, context: ViewContext = {}) {
    this.view = v;
    this.context = context;
  },
};
