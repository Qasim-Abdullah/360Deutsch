from pathlib import Path
from collections import defaultdict
from rdflib import Graph, Namespace, URIRef, Literal

BASE = Path(__file__).parent

ENTRIES = BASE / "kg/lexicon/entries.ttl"
LEVELS = BASE / "kg/metadata/levels.ttl"
CATEGORIES = BASE / "kg/metadata/categories.ttl"

AILAND = Namespace("http://ailand.org/")
ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")

ARTICLES = {"der", "die", "das"}


def normalize_word(w: str) -> str:
    parts = w.strip().split()
    if parts and parts[0].lower() in ARTICLES:
        parts = parts[1:]
    return " ".join(parts).strip().lower()


def label_of(node):
    s = str(node)
    return s.rsplit("/", 1)[-1]


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

    # Read category blank nodes (hasCategory model)
    for cat_node in g.objects(e, AILAND.hasCategory):
        topics = [str(t) for t in g.objects(cat_node, AILAND.topic)]
        subs = [str(s) for s in g.objects(cat_node, AILAND.subTopic)]

        for topic in topics:
            for sub in subs:
                m[topic][sub].update(words)


for topic in sorted(m):
    print("\n", topic)

    for sub in sorted(m[topic]):
        print("  >", sub)

        for w in sorted(m[topic][sub]):
            print("     -", w)
