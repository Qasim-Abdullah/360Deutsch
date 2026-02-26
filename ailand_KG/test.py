import os
from SPARQLWrapper import SPARQLWrapper, JSON
from collections import defaultdict

ENDPOINT = os.getenv("GRAPH_360_DEUTSCH", "http://localhost:7200/repositories/360_deutsch_full")

sparql = SPARQLWrapper(ENDPOINT)
sparql.setReturnFormat(JSON)

q = """
PREFIX ailand: <http://ailand.org/>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

SELECT ?level ?cat ?sub ?pos (COUNT(?e) AS ?count)
WHERE {
  ?e a ontolex:LexicalEntry ;
     ailand:level ?level ;
     lexinfo:partOfSpeech ?pos .

  OPTIONAL { ?e ailand:topic ?cat . }
  OPTIONAL { ?e ailand:subTopic ?sub . }
}
GROUP BY ?level ?cat ?sub ?pos
ORDER BY ?level ?cat ?sub ?pos
"""

sparql.setQuery(q)
data = sparql.query().convert()

tree = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))

for r in data["results"]["bindings"]:
    level = r["level"]["value"]
    cat = r["cat"]["value"] if "cat" in r else "Uncategorized"
    sub = r["sub"]["value"] if "sub" in r else "NoSubcategory"
    pos = r["pos"]["value"].split("#")[-1]
    count = int(r["count"]["value"])

    tree[level][cat][sub][pos] += count


for level, cats in tree.items():
    print(level)

    for cat, subs in cats.items():
        print(f"  └─ {cat}")

        for sub, poses in subs.items():
            print(f"      └─ {sub}")

            for pos, c in poses.items():
                print(f"          └─ {pos}: {c}")