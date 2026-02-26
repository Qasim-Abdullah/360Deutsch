import { LevelsView } from "../views/levels.view";
import { RoomsView } from "../views/rooms.view";
import { PosView } from "../views/pos.view";
import { AdjectiveCategoryView } from "../views/adjectiveCategory.view";
import { WordView } from "../views/words.view";
import { WordDetailsView } from "../views/wordDetails.view";
import { RoomView } from "../views/3droom.view";
import { CategoryView } from "../views/category.view";
import { ViewDefinition } from "./types";

export const ViewRegistry: Record<string, ViewDefinition> = {
  levels: LevelsView,
  category: CategoryView,
  rooms: RoomsView,
  pos: PosView,
  adjectiveCategory: AdjectiveCategoryView,
  word: WordView,
  wordDetails: WordDetailsView,
  room: RoomView
};