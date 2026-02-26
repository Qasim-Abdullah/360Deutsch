from SPARQLWrapper import SPARQLWrapper, JSON
from dotenv import load_dotenv
import os

load_dotenv()
ENDPOINT = os.getenv("GRAPH_360DEUTSCH")

sparql = SPARQLWrapper(ENDPOINT)
sparql.setReturnFormat(JSON)

def query(q):
    sparql.setQuery(q)
    return sparql.query().convert()["results"]["bindings"]

print("\nGERMAN A1 B1 KNOWLEDGE GRAPH REPORT")
print("=" * 40)


total = query("""
SELECT (COUNT(?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> .
}
""")[0]["count"]["value"]

print(f"\nThis graph contains a total of {total} German words.")

# ---- levels ----
levels = {}
res = query("""
SELECT ?level (COUNT(?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ;
     <http://ailand.org/level> ?level .
}
GROUP BY ?level
ORDER BY ?level
""")

print("\nThe words are distributed across the following levels:")
for r in res:
    level = r["level"]["value"]
    count = int(r["count"]["value"])
    levels[level] = {
        "total": count,
        "pos": {},
        "ipa": 0,
        "meaning": 0,
        "example": 0
    }
    print(f"- Level {level}: {count} words")

# ---- POS per level ----
res = query("""
SELECT ?level ?pos (COUNT(?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ;
     <http://ailand.org/level> ?level ;
     <http://www.lexinfo.net/ontology/2.0/lexinfo#partOfSpeech> ?pos .
}
GROUP BY ?level ?pos
""")

for r in res:
    level = r["level"]["value"]
    pos = r["pos"]["value"].split("#")[-1]
    count = int(r["count"]["value"])
    levels[level]["pos"][pos] = count

# ---- IPA ----
res = query("""
SELECT ?level (COUNT(DISTINCT ?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ;
     <http://ailand.org/level> ?level ;
     <http://www.w3.org/ns/lemon/ontolex#canonicalForm> ?f .
  ?f <http://www.w3.org/ns/lemon/ontolex#phoneticRep> ?ipa .
}
GROUP BY ?level
""")

for r in res:
    levels[r["level"]["value"]]["ipa"] = int(r["count"]["value"])

# ---- meanings ----
res = query("""
SELECT ?level (COUNT(DISTINCT ?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ;
     <http://ailand.org/level> ?level ;
     <http://ailand.org/meaning> ?m .
}
GROUP BY ?level
""")

for r in res:
    levels[r["level"]["value"]]["meaning"] = int(r["count"]["value"])

# ---- examples ----
res = query("""
SELECT ?level (COUNT(DISTINCT ?e) AS ?count)
WHERE {
  ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ;
     <http://ailand.org/level> ?level ;
     <http://ailand.org/example> ?ex .
}
GROUP BY ?level
""")

for r in res:
    levels[r["level"]["value"]]["example"] = int(r["count"]["value"])

# ---- final report ----
print("\nDETAILED LEVEL REPORT:")
for level, data in levels.items():
    print(f"\nLevel {level} contains {data['total']} words.")
    print("Parts of speech:")
    for pos, cnt in data["pos"].items():
        print(f"  - {pos}: {cnt}")
    print(f"Words with pronunciation (IPA): {data['ipa']}")
    print(f"Words with meanings: {data['meaning']}")
    print(f"Words with example sentences: {data['example']}")

print("\nEND OF REPORT")
