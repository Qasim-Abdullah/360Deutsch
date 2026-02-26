"""
This file enriches the German A1–B1 knowledge graph with IPA pronunciation data.

What it does:
- Loads the base KG from data/de_a1_b1_words.ttl
- Queries the Zenodo repository for IPA (phoneticRep) data
- Adds IPA pronunciations to the canonical form of each word
- Writes updated data back to the same TTL file
- Saves words without IPA to report/ipa_missing.json

Purpose:
- Provide pronunciation support for learners
- Enable phonetic-aware processing for the AI assistant
"""

from rdflib import Graph, Namespace, Literal
from SPARQLWrapper import SPARQLWrapper, JSON
import json

from dotenv import load_dotenv
import os
load_dotenv()
WORDS_TTL = "./data/de_a1_b1_words.ttl"
ENDPOINT = os.getenv("GRAPH_ZENODO") 
OUT_MISSING = "./report/ipa_missing.json"

os.makedirs("report", exist_ok=True)

ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")

def get_ipa(sparql, word):
    query = f"""
    SELECT ?ipa
    WHERE {{
      ?e <http://www.w3.org/ns/lemon/ontolex#canonicalForm> [
        <http://www.w3.org/ns/lemon/ontolex#writtenRep> "{word}"@de
      ] .
      ?f <http://www.w3.org/ns/lemon/ontolex#phoneticRep> ?ipa .
      {{
        ?e <http://www.w3.org/ns/lemon/ontolex#canonicalForm> ?f .
      }}
      UNION
      {{
        ?e <http://www.w3.org/ns/lemon/ontolex#otherForm> ?f .
      }}
    }}
    """
    sparql.setQuery(query)
    res = sparql.query().convert()["results"]["bindings"]
    return list({r["ipa"]["value"] for r in res})

def run():
    g = Graph()
    with open(WORDS_TTL, "r", encoding="utf-8") as f:
        g.parse(data=f.read(), format="turtle")

    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setReturnFormat(JSON)

    missing = []

    for entry in g.subjects(None, ONT.LexicalEntry):
        form = g.value(entry, ONT.canonicalForm)
        word = g.value(form, ONT.writtenRep) if form else None

        if not word:
            continue

        ipa_list = get_ipa(sparql, str(word))

        if not ipa_list:
            missing.append(str(word))
            continue

        for ipa in ipa_list:
            g.add((form, ONT.phoneticRep, Literal(ipa, lang="de-fonipa")))

    with open(OUT_MISSING, "w", encoding="utf-8") as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)

    g.serialize(destination=WORDS_TTL, format="turtle")

    print("UPDATED de_a1_b1_words.ttl")
    print("MISSING IPA:", len(missing))
