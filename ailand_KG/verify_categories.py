import json
from pathlib import Path
from collections import defaultdict
from rdflib import Graph, Namespace, URIRef, Literal

BASE = Path(__file__).parent

ENTRIES = BASE / "kg/lexicon/entries.ttl"
LEVELS = BASE / "kg/metadata/levels.ttl"
CATEGORIES = BASE / "kg/metadata/categories.ttl"
JSON_FILE = BASE / "a1_words.json"

AILAND = Namespace("http://ailand.org/")
ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")

ARTICLES = {"der", "die", "das"}


def normalize_word(w: str) -> str:
    parts = w.strip().split()
    if len(parts) > 1 and parts[0].lower() in ARTICLES:
        parts = parts[1:]
    return " ".join(parts).strip().lower()


def build_json_map():
    with open(JSON_FILE, encoding="utf-8") as f:
        data = json.load(f)["categories"]

    m = defaultdict(lambda: defaultdict(set))
    for topic, submap in data.items():
        for sub, words in submap.items():
            for w in words:
                m[str(topic)][str(sub)].add(normalize_word(str(w)))
    return m


def build_ttl_map():
    g = Graph()
    g.parse(ENTRIES, format="turtle")
    g.parse(LEVELS, format="turtle")
    g.parse(CATEGORIES, format="turtle")

    a1_entries = set(g.subjects(AILAND.level, Literal("A1")))

    m = defaultdict(lambda: defaultdict(set))

    for e in a1_entries:
    
        words = set()
        for f in g.objects(e, ONT.canonicalForm):
            for w in g.objects(f, ONT.writtenRep):
                words.add(normalize_word(str(w)))

    
        for cat_node in g.objects(e, AILAND.hasCategory):
            topics = [str(t) for t in g.objects(cat_node, AILAND.topic)]
            subs = [str(s) for s in g.objects(cat_node, AILAND.subTopic)]

            for topic in topics:
                for sub in subs:
                    m[topic][sub].update(words)

    return m


def flatten(m):
    out = set()
    for topic in m:
        for sub in m[topic]:
            for w in m[topic][sub]:
                out.add((topic, sub, w))
    return out


json_map = build_json_map()
ttl_map = build_ttl_map()

json_set = flatten(json_map)
ttl_set = flatten(ttl_map)

only_in_json = sorted(json_set - ttl_set)
only_in_ttl = sorted(ttl_set - json_set)

print("JSON triples:", len(json_set))
print("TTL triples:", len(ttl_set))

if only_in_json or only_in_ttl:
    print("\nMISMATCH")

    if only_in_json:
        print("\nOnly in JSON:", len(only_in_json))
        for topic, sub, w in only_in_json[:200]:
            print(topic, ">", sub, ">", w)

    if only_in_ttl:
        print("\nOnly in TTL:", len(only_in_ttl))
        for topic, sub, w in only_in_ttl[:200]:
            print(topic, ">", sub, ">", w)

    raise SystemExit(1)

print("\nOK: categories.ttl matches a1_words.json exactly")
