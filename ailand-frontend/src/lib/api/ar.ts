export type ARNode = {
  id: string;
  label: string;
  type: "root" | "level" | "category" | "subcategory" | "pos" | "entry";
  children?: ARNode[];
};

export type ApiResponse =
  | {
      ok: true;
      data: ARNode;
      message: string;
    }
  | {
      ok: false;
      reason: string;
    };

import arData from "@/data/ardata.json";
import otherData from "@/data/kg.json";

let toggle = true; 

export async function getData(prompt: string): Promise<ApiResponse> {
  await new Promise((r) => setTimeout(r, 1000));

  if (prompt.toLowerCase().includes("error")) {
    return {
      ok: false,
      reason: "Request failed. Please try again.",
    };
  }

  toggle = !toggle;

  const selectedData = toggle ? arData : otherData;

  return {
    ok: true,
    data: selectedData as ARNode,
    message: toggle
      ? "Loaded Dataset A"
      : "Loaded Dataset B",
  };
}