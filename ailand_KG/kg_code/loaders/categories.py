"""
This file converts A1 word categories from a1_words.json into categories.ttl.

What it does:
- Reads categories from a1_words.json
- Looks up each word's actual URI from entries.ttl (so URIs always match)
- Writes kg/metadata/categories.ttl
- Uses blank nodes to group each topic+subTopic pair, avoiding cross-product
- Words appearing in multiple subcategories get one blank node per assignment

Purpose:
- Map each A1 word to its topic and subcategory for room-based navigation
"""

import os
import json
import re
from rdflib import Graph, Namespace, Literal, URIRef, BNode

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

INPUT_FILE = os.path.join(BASE_DIR, "a1_words.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "kg", "metadata", "categories.ttl")
ENTRIES_FILE = os.path.join(BASE_DIR, "kg", "lexicon", "entries.ttl")

AILAND = Namespace("http://ailand.org/")
ONT = Namespace("http://www.w3.org/ns/lemon/ontolex#")

ARTICLES = {"der", "die", "das"}


def safe_uri(s):
    return re.sub(r"[^A-Za-z0-9_]", "_", s)


def strip_article(word):
    """Strip article prefix, but only if there's a word after it."""
    parts = word.strip().split()
    if len(parts) > 1 and parts[0].lower() in ARTICLES:
        return " ".join(parts[1:])
    return word.strip()


def build_word_to_uri_map():
    """Build a lookup: lowercased canonical word -> list of URIs from entries.ttl.

    Multiple URIs can exist for the same word (e.g. ailand:kosten and ailand:Kosten)
    so we collect ALL of them to ensure category triples are written to every match.
    """
    from collections import defaultdict

    g = Graph()
    g.parse(ENTRIES_FILE, format="turtle")

    word_to_uris = defaultdict(set)
    for entry in g.subjects(None, None):
        if not str(entry).startswith(str(AILAND)):
            continue
        for form in g.objects(entry, ONT.canonicalForm):
            for w in g.objects(form, ONT.writtenRep):
                word_to_uris[str(w).lower()].add(entry)
    return word_to_uris


def run():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    categories = data.get("categories", {})

    # Build lookup from entries.ttl so URIs match exactly
    word_to_uris = build_word_to_uri_map()

    g = Graph()
    g.bind("ailand", AILAND)

    added = 0
    not_found = []

    for topic, subcategories in categories.items():
        for subtopic, words in subcategories.items():
            for word in words:
                clean = strip_article(word)
                key = clean.lower()

                # Look up ALL URIs from entries.ttl, fall back to safe_uri
                uris = word_to_uris.get(key)
                if not uris:
                    uris = {AILAND[safe_uri(clean)]}
                    not_found.append((topic, subtopic, word, clean))

                for uri in uris:
                    # Use a blank node to group topic+subTopic together
                    cat_node = BNode()
                    g.add((uri, AILAND.hasCategory, cat_node))
                    g.add((cat_node, AILAND.topic, Literal(topic)))
                    g.add((cat_node, AILAND.subTopic, Literal(subtopic)))
                    added += 1

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    g.serialize(destination=OUTPUT_FILE, format="turtle")

    print(f"Categories written: {added} word-category assignments")

    if not_found:
        print(f"\nWords not found in entries.ttl ({len(not_found)}):")
        for topic, sub, orig, clean in not_found:
            print(f"  {topic} > {sub} > \"{orig}\" (looked up: \"{clean}\")")

    # Verify counts
    verify = Graph()
    verify.parse(OUTPUT_FILE, format="turtle")

    q = """
    PREFIX ailand: <http://ailand.org/>
    SELECT ?sub (COUNT(DISTINCT ?e) AS ?count)
    WHERE {
        ?e ailand:hasCategory ?cat .
        ?cat ailand:subTopic ?sub .
    }
    GROUP BY ?sub
    ORDER BY ?sub
    """
    print("\nSubtopic counts from TTL:")
    for row in verify.query(q):
        print(f"  {row[0]}: {row[1]}")


if __name__ == "__main__":
    run()
