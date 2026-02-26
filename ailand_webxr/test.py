import json
import os
import re
from collections import defaultdict
from SPARQLWrapper import SPARQLWrapper, JSON

# ================= CONFIG =================

ENDPOINT = os.getenv(
    "GRAPH_360_DEUTSCH",
    "http://localhost:7200/repositories/360_deutsch"
)

INPUT_JSON = "room1.json"
OUTPUT_JSON = "room1_from_kg.json"

# =========================================

sparql = SPARQLWrapper(ENDPOINT)
sparql.setReturnFormat(JSON)

def strip_article(word):
    return re.sub(r"^(der|die|das)\s+", "", word, flags=re.IGNORECASE).strip()

def query(q):
    sparql.setQuery(q)
    return sparql.query().convert()["results"]["bindings"]

def simplify_morphology(d):
    lemma = d["lemma"]

    # ---- ONE PLURAL ----
    plural = None
    for p in d["morphology"]["plural_forms"]:
        if p.startswith("die "):
            plural = p
            break
    d["morphology"]["plural_forms"] = [plural] if plural else []

    # ---- ONE FORM PER CASE ----
    case_priority = {
        "nominative": [f"das {lemma}", f"die {lemma}"],
        "accusative": [f"das {lemma}", f"die {lemma}"],
        "dative": [f"dem {lemma}", f"den {lemma}"],
        "genitive": [f"des {lemma}", f"des {lemma}s"]
    }

    simplified = {}
    for case, preferred in case_priority.items():
        forms = d["morphology"]["cases"].get(case, [])
        for p in preferred:
            if p in forms:
                simplified[case] = p
                break

    d["morphology"]["cases"] = simplified

def fetch_from_graph(lemma):
    res = query(f"""
    PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
    PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
    PREFIX ailand: <http://ailand.org/>
    PREFIX olia: <http://purl.org/olia/olia.owl#>

    SELECT
      ?pos ?gender ?ipa ?form ?num ?case
      ?reflexive ?bound ?meaning ?example
    WHERE {{
      ?e a ontolex:LexicalEntry ;
         ontolex:canonicalForm ?cf .
      ?cf ontolex:writtenRep "{lemma}"@de .

      OPTIONAL {{ ?e lexinfo:partOfSpeech ?pos }}
      OPTIONAL {{ ?e lexinfo:gender ?gender }}
      OPTIONAL {{ ?cf ontolex:phoneticRep ?ipa }}
      OPTIONAL {{ ?e ailand:reflexive ?reflexive }}
      OPTIONAL {{ ?e ailand:boundForm ?bound }}
      OPTIONAL {{ ?e ailand:meaning ?meaning }}
      OPTIONAL {{ ?e ailand:example ?example }}

      OPTIONAL {{
        ?e ontolex:otherForm ?of .
        ?of ontolex:writtenRep ?form .
        OPTIONAL {{ ?of olia:hasNumber ?num }}
        OPTIONAL {{ ?of olia:hasCase ?case }}
      }}
    }}
    """)

    if not res:
        return None

    data = {
        "lemma": lemma,
        "part_of_speech": None,
        "gender": None,
        "pronunciation": {"ipa": []},
        "morphology": {
            "plural_forms": [],
            "cases": defaultdict(list)
        },
        "grammar_flags": {
            "reflexive": False,
            "bound_form": False
        },
        "meanings": {"de": [], "en": []},
        "examples": []
    }

    for r in res:
        if "pos" in r:
            data["part_of_speech"] = r["pos"]["value"].split("#")[-1]

        if "gender" in r:
            g = r["gender"]["value"].split("#")[-1]
            data["gender"] = {
                "masculine": "der",
                "feminine": "die",
                "neuter": "das"
            }.get(g, g)

        if "ipa" in r:
            ipa = r["ipa"]["value"]
            if ipa not in data["pronunciation"]["ipa"]:
                data["pronunciation"]["ipa"].append(ipa)

        if "reflexive" in r:
            data["grammar_flags"]["reflexive"] = r["reflexive"]["value"].lower() == "true"

        if "bound" in r:
            data["grammar_flags"]["bound_form"] = r["bound"]["value"].lower() == "true"

        if "meaning" in r:
            m = r["meaning"]
            if m["xml:lang"] == "de" and m["value"] not in data["meanings"]["de"]:
                data["meanings"]["de"].append(m["value"])
            if m["xml:lang"] == "en" and m["value"] not in data["meanings"]["en"]:
                data["meanings"]["en"].append(m["value"])

        if "example" in r:
            ex = r["example"]["value"]
            if ex not in data["examples"]:
                data["examples"].append(ex)

        if "form" in r:
            form = r["form"]["value"]
            num = r.get("num", {}).get("value", "")
            case = r.get("case", {}).get("value", "")

            if num.endswith("Plural"):
                if form not in data["morphology"]["plural_forms"]:
                    data["morphology"]["plural_forms"].append(form)

            if case:
                cname = case.split("#")[-1].lower()
                if form not in data["morphology"]["cases"][cname]:
                    data["morphology"]["cases"][cname].append(form)

    simplify_morphology(data)
    return data

# ================= MAIN =================

with open(INPUT_JSON, "r", encoding="utf-8") as f:
    room_words = json.load(f)

output = []
missing = []

for item in room_words:
    german_raw = item["german"]          # <-- FIXED HERE
    lemma = strip_article(german_raw)

    data = fetch_from_graph(lemma)
    if data:
        data["english"] = item["english"]  # keep original English label
        output.append(data)
    else:
        missing.append(german_raw)

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("DONE")
print("Found:", len(output))
print("Missing:", len(missing))
