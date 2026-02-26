"""
This file enriches the existing German A1–B1 knowledge graph with meanings.

What it does:
- Loads the existing TTL file: data/de_a1_b1_words.ttl
- Reads meanings from: data/manually/meaning.json
- Adds German and English meanings to each word using :meaning
- Writes all updated data back to the same TTL file
- Creates a report (report/missing_meanings.json) for words without meanings
- Validates the final TTL syntax

Purpose:
- Attach semantic meanings to existing lexical entries
- Keep track of missing meanings for later completion
"""


import os
import json
import re
from rdflib import Graph, Namespace, Literal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

TTL_FILE = os.path.join(BASE_DIR, "data", "de_a1_b1_words.ttl")
MEANING_FILE = os.path.join(BASE_DIR, "data", "manually", "meaning.json")
REPORT_FILE = os.path.join(BASE_DIR, "report", "missing_meanings.json")

BASE = Namespace("http://ailand.org/")
AILAND = Namespace("http://ailand.org/")

def safe_uri(s):
    return re.sub(r"[^A-Za-z0-9_]", "_", s)

def safe_literal(s):
    if not s:
        return None
    return (
        s.replace("\\", "\\\\")
         .replace('"', '\\"')
         .replace("\n", " ")
         .replace("\r", " ")
         .replace("\t", " ")
    )

def run():
    g = Graph()
    with open(TTL_FILE, "r", encoding="utf-8") as f:
        g.parse(data=f.read(), format="turtle")

    with open(MEANING_FILE, "r", encoding="utf-8") as f:
        meaning_data = json.load(f)

    missing = []

    for item in meaning_data:
        word = item.get("word")
        if not word:
            continue

        uri = BASE[safe_uri(word)]

        german = safe_literal(item.get("german"))
        english = safe_literal(item.get("english"))

        if not german and not english:
            missing.append(word)
            continue

        if german:
            g.add((uri, AILAND.meaning, Literal(german, lang="de")))
        if english:
            g.add((uri, AILAND.meaning, Literal(english, lang="en")))

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)

    g.serialize(destination=TTL_FILE, format="turtle")

    print("Meanings added:", len(meaning_data) - len(missing))
    print("Missing meanings:", len(missing))

    try:
        Graph().parse(data=open(TTL_FILE, "r", encoding="utf-8").read(), format="turtle")
        print("TTL OK")
    except Exception as e:
        print("TTL ERROR")
        print(e)
