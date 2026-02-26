"""
This file converts German A1–B1 vocabulary from a JSON file into a Turtle (TTL)
knowledge graph using the OntoLex-Lemon model.

What it does:
- Reads words from data/manually/words.json
- Writes a TTL file: data/de_a1_b1_words.ttl
- Creates one ontolex:LexicalEntry per word
- Stores English translations as ontolex:LexicalSense
- Adds POS, gender, level, frequency, reflexive, and variants when present
- Marks non-standalone words (starting or ending with '-') with :boundForm true

Purpose:
- Clean lexical base for learners
- Reliable input for the AI assistant
"""


import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

INPUT_FILE = os.path.join(BASE_DIR, "data", "manually", "words.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "de_a1_b1_words.ttl")

def safe_uri(s):
    return re.sub(r"[^A-Za-z0-9_]", "_", s)

def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

def is_bound_form(word):
    return word.startswith("-") or word.endswith("-")

def run():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    ttl = []
    ttl.append("@prefix ontolex: <http://www.w3.org/ns/lemon/ontolex#> .")
    ttl.append("@prefix lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#> .")
    ttl.append("@prefix : <http://ailand.org/> .\n")

    written = 0

    for item in data:
        word = item.get("word")
        if not word:
            continue

        uri = safe_uri(word)
        bound = is_bound_form(word)

        block = f""":{uri} a ontolex:LexicalEntry ;
    ontolex:canonicalForm [ ontolex:writtenRep "{esc(word)}"@de ]"""

        if item.get("pos"):
            block += f" ;\n    lexinfo:partOfSpeech lexinfo:{item['pos'].lower()}"

        if item.get("gender"):
            block += f" ;\n    lexinfo:gender lexinfo:{item['gender'].lower()}"

        if item.get("translation"):
            block += f""" ;
    ontolex:sense [
        a ontolex:LexicalSense ;
        ontolex:gloss "{esc(item['translation'])}"@en
    ]"""

        if item.get("level"):
            block += f' ;\n    :level "{item["level"]}"'

        if item.get("frequency"):
            block += f' ;\n    :frequency "{item["frequency"]}"'

        if item.get("reflexive") is True:
            block += " ;\n    :reflexive true"

        if bound:
            block += " ;\n    :boundForm true"

        for v in item.get("variant", []):
            block += f""" ;
    ontolex:otherForm [ ontolex:writtenRep "{esc(v)}"@de ]"""

        block += " .\n"
        ttl.append(block)
        written += 1

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(ttl))

    print("TTL written:", written)
