"""
This file enriches the German A1–B1 knowledge graph with morphological forms.

What it does:
- Loads the base KG from data/de_a1_b1_words.ttl
- Queries the Zenodo / DBnary repository for morphological forms
- Adds inflected forms as ontolex:otherForm with OLiA features
- Supports reflexive verbs by querying "sich + verb"
- Writes all updates back to the same TTL file
- Saves words without morphology to report/morphology_incomplete.json

Purpose:
- Add full morphological information for grammar-aware learning
- Enable accurate form handling for the AI assistant
"""


from rdflib import Graph, Namespace, Literal, URIRef
from SPARQLWrapper import SPARQLWrapper, JSON
import json
import uuid
from dotenv import load_dotenv
import os

load_dotenv()

WORDS_TTL = "./data/de_a1_b1_words.ttl"
ENDPOINT = os.getenv("GRAPH_ZENODO")
OUT_INCOMPLETE = "./report/morphology_incomplete.json"

ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")
OLIA = Namespace("http://purl.org/olia/olia.owl#")
AILAND = Namespace("http://ailand.org/")

def run_query(sparql, word):
    query = f"""
    SELECT ?form ?num ?case ?tense ?person ?mood ?voice
    WHERE {{
      ?e <http://www.w3.org/ns/lemon/ontolex#canonicalForm> [
        <http://www.w3.org/ns/lemon/ontolex#writtenRep> "{word}"@de
      ] .
      OPTIONAL {{
        ?e <http://www.w3.org/ns/lemon/ontolex#otherForm> ?f .
        ?f <http://www.w3.org/ns/lemon/ontolex#writtenRep> ?form .
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasNumber> ?num }}
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasCase> ?case }}
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasTense> ?tense }}
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasPerson> ?person }}
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasMood> ?mood }}
        OPTIONAL {{ ?f <http://purl.org/olia/olia.owl#hasVoice> ?voice }}
      }}
    }}
    """
    sparql.setQuery(query)
    return sparql.query().convert()["results"]["bindings"]

def run():
    g = Graph()
    with open(WORDS_TTL, "r", encoding="utf-8") as f:
        g.parse(data=f.read(), format="turtle")

    sparql = SPARQLWrapper(ENDPOINT)
    sparql.setReturnFormat(JSON)

    incomplete = []

    for entry in g.subjects(ONT.canonicalForm, None):
        form = g.value(entry, ONT.canonicalForm)
        word = g.value(form, ONT.writtenRep)

        if not word:
            continue

        w = str(word)
        is_reflexive = g.value(entry, AILAND.reflexive)

        res = run_query(sparql, w)

        if not res and is_reflexive and str(is_reflexive).lower() == "true":
            res = run_query(sparql, f"sich {w}")

        if not res:
            incomplete.append({"word": w})
            continue

        has_morph = False

        for r in res:
            if "form" not in r:
                continue

            has_morph = True
            fnode = URIRef(f"{entry}/form/{uuid.uuid4()}")

            g.add((entry, ONT.otherForm, fnode))
            g.add((fnode, ONT.writtenRep, Literal(r["form"]["value"], lang="de")))

            if "num" in r:
                g.add((fnode, OLIA.hasNumber, URIRef(r["num"]["value"])))
            if "case" in r:
                g.add((fnode, OLIA.hasCase, URIRef(r["case"]["value"])))
            if "tense" in r:
                g.add((fnode, OLIA.hasTense, URIRef(r["tense"]["value"])))
            if "person" in r:
                g.add((fnode, OLIA.hasPerson, URIRef(r["person"]["value"])))
            if "mood" in r:
                g.add((fnode, OLIA.hasMood, URIRef(r["mood"]["value"])))
            if "voice" in r:
                g.add((fnode, OLIA.hasVoice, URIRef(r["voice"]["value"])))

        if not has_morph:
            incomplete.append({"word": w})

    with open(OUT_INCOMPLETE, "w", encoding="utf-8") as f:
        json.dump(incomplete, f, ensure_ascii=False, indent=2)

    g.serialize(destination=WORDS_TTL, format="turtle")

    print("INCOMPLETE:", len(incomplete))
