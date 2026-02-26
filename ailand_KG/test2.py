# # from rdflib import Graph
# # import os

# # FILE = "kg/ontology/schema.ttl"

# # # 1. Check file exists
# # if not os.path.exists(FILE):
# #     raise Exception("schema.ttl does not exist")

# # # 2. Check file not empty
# # if os.path.getsize(FILE) == 0:
# #     raise Exception("schema.ttl is empty")

# # # 3. Load and parse
# # g = Graph()
# # g.parse(FILE, format="turtle")

# # # 4. Count triples
# # count = len(g)

# # print("OK")
# # print("Triples:", count)


# # from rdflib import Graph
# # import os

# # FILE = "kg/lexicon/entries.ttl"

# # # 1. Check file exists
# # if not os.path.exists(FILE):
# #     raise Exception("entries.ttl does not exist")

# # # 2. Check file not empty
# # if os.path.getsize(FILE) == 0:
# #     raise Exception("entries.ttl is empty")

# # # 3. Load and parse
# # g = Graph()
# # g.parse(FILE, format="turtle")

# # # 4. Count triples
# # count = len(g)

# # # 5. Count LexicalEntry
# # q = """
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # SELECT (COUNT(?e) AS ?c)
# # WHERE {
# #   ?e a ontolex:LexicalEntry .
# # }
# # """

# # res = list(g.query(q))
# # entries = int(res[0][0])

# # print("OK")
# # print("Triples:", count)
# # print("LexicalEntries:", entries)



# # from rdflib import Graph
# # import os

# # FILE = "kg/lexicon/senses.ttl"
# # ENTRIES_FILE = "kg/lexicon/entries.ttl"

# # # Check files
# # if not os.path.exists(FILE):
# #     raise Exception("senses.ttl does not exist")

# # if not os.path.exists(ENTRIES_FILE):
# #     raise Exception("entries.ttl does not exist")

# # # Load graphs
# # g_sense = Graph()
# # g_sense.parse(FILE, format="turtle")

# # g_entries = Graph()
# # g_entries.parse(ENTRIES_FILE, format="turtle")

# # # Count total words
# # q_total = """
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # SELECT (COUNT(?e) AS ?c)
# # WHERE {
# #   ?e a ontolex:LexicalEntry .
# # }
# # """
# # total_words = int(list(g_entries.query(q_total))[0][0])

# # # Words with sense
# # q_with = """
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # SELECT (COUNT(DISTINCT ?e) AS ?c)
# # WHERE {
# #   ?e ontolex:sense ?s .
# # }
# # """
# # with_sense = int(list(g_sense.query(q_with))[0][0])

# # # Words without sense
# # without_sense = total_words - with_sense

# # print("OK")
# # print("Total words:", total_words)
# # print("Words with sense:", with_sense)
# # print("Words without sense:", without_sense)





# # from rdflib import Graph
# # import os

# # FORMS_FILE = "kg/morphology/forms.ttl"
# # ENTRIES_FILE = "kg/lexicon/entries.ttl"

# # # Check files
# # if not os.path.exists(FORMS_FILE):
# #     raise Exception("forms.ttl does not exist")

# # if not os.path.exists(ENTRIES_FILE):
# #     raise Exception("entries.ttl does not exist")

# # if os.path.getsize(FORMS_FILE) == 0:
# #     raise Exception("forms.ttl is empty")

# # # Load graphs
# # g_forms = Graph()
# # g_forms.parse(FORMS_FILE, format="turtle")

# # g_entries = Graph()
# # g_entries.parse(ENTRIES_FILE, format="turtle")

# # # Count triples
# # triples = len(g_forms)

# # # Count forms
# # q_forms = """
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # SELECT (COUNT(DISTINCT ?f) AS ?c)
# # WHERE {
# #   ?e ontolex:otherForm ?f .
# # }
# # """
# # form_count = int(list(g_forms.query(q_forms))[0][0])

# # # Count words with forms
# # q_words = """
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # SELECT (COUNT(DISTINCT ?e) AS ?c)
# # WHERE {
# #   ?e ontolex:otherForm ?f .
# # }
# # """
# # words_with_forms = int(list(g_forms.query(q_words))[0][0])

# # print("OK")
# # print("Triples:", triples)
# # print("Forms:", form_count)
# # print("Words with forms:", words_with_forms)


# # from SPARQLWrapper import SPARQLWrapper, JSON

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(JSON)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>

# # SELECT ?node ?type
# # WHERE {
# #   ?node ontolex:phoneticRep ?ipa .
# #   OPTIONAL { ?node a ?type . }
# # }
# # LIMIT 20
# # """)

# # results = sparql.query().convert()

# # for row in results["results"]["bindings"]:
# #     print(
# #         row["node"]["value"],
# #         row.get("type", {}).get("value", "NO TYPE")
# #     )


# # from rdflib import Graph
# # import os

# # FILE = "kg/metadata/levels.ttl"

# # if not os.path.exists(FILE):
# #     raise Exception("levels.ttl does not exist")

# # if os.path.getsize(FILE) == 0:
# #     raise Exception("levels.ttl is empty")

# # g = Graph()
# # g.parse(FILE, format="turtle")

# # # Total with level
# # q_total = """
# # PREFIX ailand: <http://ailand.org/>

# # SELECT (COUNT(?e) AS ?c)
# # WHERE {
# #   ?e ailand:level ?l .
# # }
# # """
# # total = int(list(g.query(q_total))[0][0])

# # # Count per level
# # q_levels = """
# # PREFIX ailand: <http://ailand.org/>

# # SELECT ?l (COUNT(?e) AS ?c)
# # WHERE {
# #   ?e ailand:level ?l .
# # }
# # GROUP BY ?l
# # ORDER BY ?l
# # """
# # rows = list(g.query(q_levels))

# # print("OK")
# # print("Total with level:", total)

# # print("Per level:")
# # for r in rows:
# #     print(r[0], ":", int(r[1]))


# from SPARQLWrapper import SPARQLWrapper, JSON

# ENDPOINT = "http://localhost:7200/repositories/360_deutsch_full"

# sparql = SPARQLWrapper(ENDPOINT)
# sparql.setReturnFormat(JSON)

# queries = {
#     "Entries": """
#         SELECT (COUNT(?e) AS ?c)
#         WHERE { ?e a <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> . }
#     """,

#     "Senses": """
#         SELECT (COUNT(?s) AS ?c)
#         WHERE { ?s a <http://www.w3.org/ns/lemon/ontolex#LexicalSense> . }
#     """,

#     "WithLevel": """
#         SELECT (COUNT(DISTINCT ?e) AS ?c)
#         WHERE { ?e <http://ailand.org/level> ?l . }
#     """,

#     "WithFrequency": """
#         SELECT (COUNT(DISTINCT ?e) AS ?c)
#         WHERE { ?e <http://ailand.org/frequency> ?f . }
#     """,

#     "WithMeaning": """
#         SELECT (COUNT(DISTINCT ?e) AS ?c)
#         WHERE { ?e <http://ailand.org/meaning> ?m . }
#     """,

#     "WithExample": """
#         SELECT (COUNT(DISTINCT ?e) AS ?c)
#         WHERE { ?e <http://ailand.org/example> ?ex . }
#     """
# }

# print("INTEGRITY CHECK\n")

# for name, q in queries.items():
#     sparql.setQuery(q)
#     res = sparql.query().convert()

#     count = res["results"]["bindings"][0]["c"]["value"]
#     print(f"{name}: {count}")
    
    
    
    
    
    
# # ///////////////////////////////////////////////////////////////////////

# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/ontology/schema.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # CONSTRUCT {
# #   ?s ?p ?o .
# # }
# # WHERE {
# #   {
# #     ?s a <http://www.w3.org/2000/01/rdf-schema#Class> .
# #     ?s ?p ?o .
# #   }
# #   UNION
# #   {
# #     ?s a <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
# #     ?s ?p ?o .
# #   }
# #   UNION
# #   {
# #     ?s a <http://www.w3.org/2002/07/owl#TransitiveProperty> .
# #     ?s ?p ?o .
# #   }
# #   UNION
# #   {
# #     ?s a <http://www.w3.org/2002/07/owl#SymmetricProperty> .
# #     ?s ?p ?o .
# #   }
# #   UNION
# #   {
# #     ?s <http://www.w3.org/2000/01/rdf-schema#domain> ?o .
# #   }
# #   UNION
# #   {
# #     ?s <http://www.w3.org/2000/01/rdf-schema#range> ?o .
# #   }
# #   UNION
# #   {
# #     ?s <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?o .
# #   }
# #   UNION
# #   {
# #     ?s <http://www.w3.org/2000/01/rdf-schema#subPropertyOf> ?o .
# #   }
# #   UNION
# #   {
# #     ?s <http://www.w3.org/2002/07/owl#inverseOf> ?o .
# #   }
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)




# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/lexicon/entries.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
# # PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

# # CONSTRUCT {
# #   ?entry a ontolex:LexicalEntry ;
# #          ontolex:canonicalForm ?form ;
# #          lexinfo:partOfSpeech ?pos ;
# #          lexinfo:gender ?gender .
# #   ?form ?fp ?fo .
# # }
# # WHERE {
# #   ?entry a ontolex:LexicalEntry ;
# #          ontolex:canonicalForm ?form .

# #   OPTIONAL { ?entry lexinfo:partOfSpeech ?pos . }
# #   OPTIONAL { ?entry lexinfo:gender ?gender . }

# #   OPTIONAL {
# #     ?form ?fp ?fo .
# #   }
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)



# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/lexicon/senses.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>

# # CONSTRUCT {
# #   ?entry ontolex:sense ?sense .
# #   ?sense a ontolex:LexicalSense ;
# #          ontolex:gloss ?gloss .
# # }
# # WHERE {
# #   ?entry a ontolex:LexicalEntry ;
# #          ontolex:sense ?sense .

# #   ?sense a ontolex:LexicalSense .

# #   OPTIONAL {
# #     ?sense ontolex:gloss ?gloss .
# #   }
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)



# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/morphology/forms.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>

# # CONSTRUCT {
# #   ?entry ontolex:otherForm ?form .
# #   ?form ?p ?o .
# # }
# # WHERE {
# #   ?entry a ontolex:LexicalEntry ;
# #          ontolex:otherForm ?form .

# #   ?form ?p ?o .
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)



# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/phonetics/phonetics.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>

# # CONSTRUCT {
# #   ?form ontolex:phoneticRep ?ipa .
# # }
# # WHERE {
# #   ?form ontolex:phoneticRep ?ipa .
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)


# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/phonetics/phonetics.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>

# # CONSTRUCT {
# #   ?form ontolex:phoneticRep ?ipa .
# # }
# # WHERE {
# #   ?form ontolex:phoneticRep ?ipa .
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)


# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/metadata/levels.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ailand: <http://ailand.org/>

# # CONSTRUCT {
# #   ?e ailand:level ?level .
# # }
# # WHERE {
# #   ?e ailand:level ?level .
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)

# # import os
# # from SPARQLWrapper import SPARQLWrapper, TURTLE

# # ENDPOINT = "http://localhost:7200/repositories/360_deutsch"
# # OUTPUT_FILE = "kg/metadata/frequency.ttl"

# # os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# # sparql = SPARQLWrapper(ENDPOINT)
# # sparql.setReturnFormat(TURTLE)

# # sparql.setQuery("""
# # PREFIX ailand: <http://ailand.org/>

# # CONSTRUCT {
# #   ?e ailand:frequency ?f .
# # }
# # WHERE {
# #   ?e ailand:frequency ?f .
# # }
# # """)

# # data = sparql.query().convert()

# # with open(OUTPUT_FILE, "wb") as f:
# #     f.write(data)
    
    
    
    
# import os
# from SPARQLWrapper import SPARQLWrapper, TURTLE

# ENDPOINT = "http://localhost:7200/repositories/360_deutsch"

# BASE_DIR = "kg/metadata"
# os.makedirs(BASE_DIR, exist_ok=True)

# sparql = SPARQLWrapper(ENDPOINT)
# sparql.setReturnFormat(TURTLE)


# def export(query, path):
#     sparql.setQuery(query)
#     data = sparql.query().convert()

#     with open(path, "wb") as f:
#         f.write(data)

#     print("Saved:", path)


# # 1. Levels
# export("""
# PREFIX ailand: <http://ailand.org/>

# CONSTRUCT {
#   ?e ailand:level ?v .
# }
# WHERE {
#   ?e ailand:level ?v .
# }
# """, f"{BASE_DIR}/levels.ttl")


# # 2. Frequency
# export("""
# PREFIX ailand: <http://ailand.org/>

# CONSTRUCT {
#   ?e ailand:frequency ?v .
# }
# WHERE {
#   ?e ailand:frequency ?v .
# }
# """, f"{BASE_DIR}/frequency.ttl")


# # 3. Examples
# export("""
# PREFIX ailand: <http://ailand.org/>

# CONSTRUCT {
#   ?e ailand:example ?v .
# }
# WHERE {
#   ?e ailand:example ?v .
# }
# """, f"{BASE_DIR}/examples.ttl")


# # 4. Meanings
# export("""
# PREFIX ailand: <http://ailand.org/>

# CONSTRUCT {
#   ?e ailand:meaning ?v .
# }
# WHERE {
#   ?e ailand:meaning ?v .
# }
# """, f"{BASE_DIR}/meanings.ttl")
    
    
    
    
from rdflib import Graph
from collections import Counter

FILES = [
    "kg/lexicon/entries.ttl",
    "kg/lexicon/senses.ttl",
    "kg/phonetics/phonetics.ttl",
    "kg/ontology/schema.ttl",
    "kg/metadata/levels.ttl",
    "kg/metadata/frequency.ttl",
]

g = Graph()

print("LOADING FILES\n")

for f in FILES:
    g.parse(f, format="turtle")
    print("Loaded:", f)

print("\nTOTAL TRIPLES:", len(g))


type_counter = Counter()
pred_counter = Counter()

for s, p, o in g:
    pred_counter[str(p)] += 1
    if str(p) == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
        type_counter[str(o)] += 1


print("\nTYPES\n")

for t, c in type_counter.most_common():
    print(c, t)


print("\nPREDICATES\n")

for p, c in pred_counter.most_common():
    print(c, p)


print("\nLEVEL COUNTS\n")

q_levels = """
PREFIX ailand: <http://ailand.org/>

SELECT ?l (COUNT(?e) AS ?c)
WHERE {
  ?e ailand:level ?l .
}
GROUP BY ?l
ORDER BY ?l
"""

for r in g.query(q_levels):
    print(r[0], ":", r[1])


print("\nCATEGORY COUNTS\n")

q_cat = """
PREFIX ailand: <http://ailand.org/>

SELECT (COUNT(DISTINCT ?e) AS ?c)
WHERE {
  { ?e ailand:topic ?t }
  UNION
  { ?e ailand:subTopic ?s }
}
"""

for r in g.query(q_cat):
    print("Categorized entries:", r[0])


print("\nA1 STATUS\n")

q_a1 = """
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX ailand: <http://ailand.org/>

SELECT
 (COUNT(DISTINCT ?e) AS ?total)
 (COUNT(DISTINCT ?c) AS ?withCat)
WHERE {
  ?e a ontolex:LexicalEntry ;
     ailand:level "A1" .

  OPTIONAL {
    { ?e ailand:topic ?t }
    UNION
    { ?e ailand:subTopic ?s }
    BIND(?e AS ?c)
  }
}
"""

for r in g.query(q_a1):
    total = int(r[0])
    with_cat = int(r[1])

    print("A1 total:", total)
    print("A1 categorized:", with_cat)
    print("A1 uncategorized:", total - with_cat)


print("\nDONE")