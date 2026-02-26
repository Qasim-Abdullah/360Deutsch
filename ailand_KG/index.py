from rdflib import Graph, Namespace
from collections import Counter
import os

FILES = {
    "A1 Vocab": "kg/vocab/a1_words.ttl",
    "A2 Vocab": "kg/vocab/a2_words.ttl",
    "B1 Vocab": "kg/vocab/b1_words.ttl",
    "IPA": "kg/ipa/ipa.ttl",
    "Examples": "kg/examples/examples.ttl",
    "Meanings": "kg/ai/meanings.ttl",
    "Morphology": "kg/morphology/forms.ttl",
}

ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")
LEX = Namespace("http://www.lexinfo.net/ontology/2.0/lexinfo#")
AILAND = Namespace("http://ailand.org/")


def short(u):
    return u.split("/")[-1]


for name, path in FILES.items():

    if not os.path.exists(path):
        print(f"\n{name}: FILE NOT FOUND")
        continue


    g = Graph()
    g.parse(path, format="turtle")


    print("\n" + "=" * 60)
    print(name)
    print("File:", path)
    print("Triples:", len(g))


    # ---- words ----
    words = set()

    for s, p, o in g:
        if str(s).startswith("http://ailand.org/") and "/form/" not in str(s):
            words.add(str(s))

    print("Entries:", len(words))


    # ---- property usage ----
    props = Counter()

    for s, p, o in g:
        props[short(str(p))] += 1


    print("\nTop Properties:")
    for k, v in props.most_common(10):
        print(f"  {k}: {v}")


    # ---- specific features ----
    pos = sum(1 for _ in g.triples((None, LEX.partOfSpeech, None)))
    gender = sum(1 for _ in g.triples((None, LEX.gender, None)))
    ipa = sum(1 for _ in g.triples((None, ONT.phoneticRep, None)))
    ex = sum(1 for _ in g.triples((None, AILAND.example, None)))
    mean = sum(1 for _ in g.triples((None, AILAND.meaning, None)))


    print("\nFeatures:")
    print("  POS:", pos)
    print("  Gender:", gender)
    print("  IPA:", ipa)
    print("  Examples:", ex)
    print("  Meanings:", mean)


print("\n" + "=" * 60)
print("END OF KG REPORT")

