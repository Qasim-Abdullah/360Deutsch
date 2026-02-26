import json
from rdflib import Graph, Namespace, Literal

TTL_FILE = "data/de_a1_b1_words.ttl"
JSON_FILE = "data/manually/exemple sentence.json"

ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")
AILAND = Namespace("http://ailand.org/")

def run():
    g = Graph()
    with open(TTL_FILE, "r", encoding="utf-8") as f:
        g.parse(data=f.read(), format="turtle")

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        examples = json.load(f)

    example_map = {item["word"]: item.get("examples", []) for item in examples}

    for entry in g.subjects(ONT.canonicalForm, None):
        form = g.value(entry, ONT.canonicalForm)
        word = g.value(form, ONT.writtenRep)

        if not word or word.language != "de":
            continue

        w = str(word)
        if w not in example_map:
            continue

        for ex in example_map[w]:
            g.add((entry, AILAND.example, Literal(ex, lang="de")))

    g.serialize(destination=TTL_FILE, format="turtle")

    print("EXAMPLES ADDED")

if __name__ == "__main__":
    run()
