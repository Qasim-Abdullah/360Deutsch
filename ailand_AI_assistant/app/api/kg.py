from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union, Dict
from app.services.kg_service import KGService
from app.util.intent import UserIntentRouter

router = APIRouter()
kg_service = KGService()
class Example(BaseModel):
    model_config = ConfigDict(exclude_none=True)
    de: str
    en: Optional[str] = None

class KGNode(BaseModel):
    model_config = ConfigDict(exclude_none=True)
    id: str
    label: str
    type: str                                      
    gender: Optional[str] = None                    
    plural: Optional[str] = None                   
    ipa: Optional[str] = None
    conjugation: Optional[Dict[str, str]] = None
    examples: Optional[List[Example]] = None        
    children: List["KGNode"] = []

KGNode.model_rebuild()

class PositiveResponse(BaseModel):
    ok: bool = True
    message: str = "Knowledge graph loaded successfully."
    data: KGNode

class NegativeResponse(BaseModel):
    ok: bool = False
    reason: str

ARTICLE_GENDER = {
    "masculine": "der",
    "feminine":  "die",
    "neuter":    "das",
}

def find_article(plural: str) -> str:
    
    for art in ("die ", "der ", "das ", "den ", "dem "):
        if plural.startswith(art):
            return plural[len(art):]
    return plural

def check_sparql_kg_hierarchy(bindings: List[Dict], primary: str = "level") -> KGNode:
    """
    Build the KG tree starting from *primary* downward only.
    - primary="level"    → Level → Topic → SubTopic → POS → Entry
    - primary="topic"    → Topic → SubTopic → POS → Entry
    - primary="subtopic" → SubTopic → POS → Entry
    """
    field_defs = {
        "level":    {"bind_key": "level",    "type": "level",       "default": "Unknown"},
        "topic":    {"bind_key": "topic",    "type": "category",    "default": "General"},
        "subtopic": {"bind_key": "subTopic", "type": "subcategory", "default": "Other"},
    }

    full_order = ["level", "topic", "subtopic"]
    start_idx = full_order.index(primary) if primary in full_order else 0
    order = full_order[start_idx:]  # only include primary and layers below it

    root = KGNode(id="KG_ROOT", label="360°Deutsch KG", type="root")
    entry_examples: Dict[str, set] = {}

    # We'll build nested dicts dynamically based on how many layers we have
    tree: Dict = {}

    for b in bindings:
        values = {}
        for key, fdef in field_defs.items():
            values[key] = b.get(fdef["bind_key"], {}).get("value", fdef["default"])

        pos_raw     = b.get("pos", {}).get("value", "Unknown")
        pos_label   = pos_raw.split("#")[-1]
        entry_uri   = b["entry"]["value"]
        entry_label = b["label"]["value"]
        example_val = b.get("example", {}).get("value")
        if example_val:
            entry_examples.setdefault(entry_uri, set()).add(example_val)

        # Build hierarchy layers dynamically
        current_dict = tree
        parent_node = root
        last_layer_data = None

        for i, field_name in enumerate(order):
            val = values[field_name]
            fdef = field_defs[field_name]
            is_last_field = (i == len(order) - 1)
            child_key = "pos" if is_last_field else "children"

            if val not in current_dict:
                node_id = val if i == 0 else f"{parent_node.id}_{val}"
                node = KGNode(id=node_id, label=val, type=fdef["type"])
                current_dict[val] = {"node": node, child_key: {}}
                parent_node.children.append(node)

            layer_data = current_dict[val]
            parent_node = layer_data["node"]
            current_dict = layer_data[child_key]
            last_layer_data = layer_data

        # POS layer
        pos_key = pos_label.capitalize()
        pos_dict = last_layer_data["pos"]
        if pos_key not in pos_dict:
            pos_node = KGNode(id=pos_key, label=f"{pos_key}s", type="pos")
            pos_dict[pos_key] = {"node": pos_node, "entries": {}}
            parent_node.children.append(pos_node)
        pos_data = pos_dict[pos_key]

        # Entry layer
        if entry_uri not in pos_data["entries"]:
            gender_raw = b.get("gender", {}).get("value", "")
            plural_raw = b.get("plural", {}).get("value", "")
            entry_node = KGNode(
                id=entry_label,
                label=entry_label,
                type="entry",
                gender=ARTICLE_GENDER.get(gender_raw) or None,
                plural=find_article(plural_raw) if plural_raw else None,
                ipa=b.get("ipa", {}).get("value") or None,
                children=[],
            )
            pos_data["entries"][entry_uri] = entry_node
            pos_data["node"].children.append(entry_node)

    # Attach examples to entry nodes
    def _attach_examples(d: Dict, depth: int):
        for val, layer_data in d.items():
            if depth < len(order) - 1:
                _attach_examples(layer_data["children"], depth + 1)
            else:
                for pos_data in layer_data["pos"].values():
                    for uri, entry_node in pos_data["entries"].items():
                        examples = entry_examples.get(uri)
                        if examples:
                            entry_node.examples = [Example(de=ex) for ex in sorted(examples)]

    _attach_examples(tree, 0)

    return root


class KGRequest(BaseModel):
    query: str   # Natural language, e.g. "give me dataset for Arbeitszimmer"


@router.post("/ar_ai", response_model=Union[PositiveResponse, NegativeResponse], response_model_exclude_none=True)
async def get_kg_data(request: KGRequest):
    """
    Accepts a natural language query, extracts the KG filters using AI,
    and returns structured vocabulary data in the standard format.

    Example body: { "query": "give me dataset for Arbeitszimmer" }
    """
    query = request.query.strip()
    if not query:
        return NegativeResponse(reason="Query cannot be empty. Please describe what vocabulary you are looking for.")

    # Step 1: Extract filters from natural language (Gemini → regex fallback)
    kg_intent = await UserIntentRouter.extract_kg_intent(query)

    if not kg_intent.has_filters():
        return NegativeResponse(
            reason=(
                f"Could not identify a specific topic from: '{query}'. "
                f"Please mention a room, topic, or level. "
                f"Example: 'give me dataset for Arbeitszimmer' or 'A1 vocabulary about food'."
            )
        )

    # Step 2: Fetch from KG
    try:
        bindings = kg_service.get_subtopic_data(
            subtopic=kg_intent.subtopic,
            topic=kg_intent.topic,
            level=kg_intent.level,
        )

        if not bindings:
            searched = " + ".join(filter(None, [kg_intent.subtopic, kg_intent.topic, kg_intent.level]))
            return NegativeResponse(
                reason=f"No vocabulary data found for '{searched}' in the Knowledge Graph. "
                       f"Please check the spelling or try a different topic."
            )

        # Determine which field drives the tree root:
        # most-specific first: subtopic > topic > level
        if kg_intent.subtopic:
            primary = "subtopic"
        elif kg_intent.topic:
            primary = "topic"
        else:
            primary = "level"

        root_node = check_sparql_kg_hierarchy(bindings, primary=primary)
        return PositiveResponse(data=root_node)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return NegativeResponse(reason=f"An error occurred while loading the Knowledge Graph: {str(e)}")


@router.get("/entry/{entry_id}", response_model_exclude_none=True)
async def get_entry_detail(entry_id: str):   
    try:
        details = kg_service.get_entry_details(entry_id)
        if not details or (not details.get("examples") and not details.get("meaning_de")):
            return NegativeResponse(
                reason=f"No detail data found for entry '{entry_id}'. "
                       f"Use /structure to find valid entry IDs."
            )
        return {"ok": True, "id": entry_id, **details}
    except Exception as e:
        return NegativeResponse(reason=f"Error fetching entry details: {str(e)}")


@router.get("/full", response_model=Union[PositiveResponse, NegativeResponse], response_model_exclude_none=True)
async def get_full_kg():
    """
    Returns the complete KG hierarchy (all levels: A1, A2, B1).
    No filters applied — returns everything.
    """
    try:
        bindings = kg_service.get_subtopic_data()  # no filters = full data

        if not bindings:
            return NegativeResponse(reason="No vocabulary data found in the Knowledge Graph.")

        root_node = check_sparql_kg_hierarchy(bindings, primary="level")
        return PositiveResponse(data=root_node)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return NegativeResponse(reason=f"An error occurred while loading the Knowledge Graph: {str(e)}")
