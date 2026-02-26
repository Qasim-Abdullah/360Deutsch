"""
Print the Knowledge Graph hierarchy.

Order: Level → Category → SubCategory → POS → Word → Word Properties

Supports both local TTL files (rdflib) and GraphDB SPARQL endpoint.
"""

import os
import sys
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv
from rdflib import Graph, Namespace, Literal

load_dotenv()

# ============================================================
# CONFIGURATION - Change this to switch between local and GraphDB
# ============================================================
USE_GRAPHDB = True  # Set to True to use GraphDB instead of local TTL files
# ============================================================

BASE_DIR = Path(__file__).parent
SPARQL_ENDPOINT = os.getenv("GRAPH_360DEUTSCH", "http://localhost:7200/repositories/360Deutsch")

# TTL files to load (when USE_GRAPHDB = False)
# Note: forms.ttl is 254MB - loading it locally is slow, GraphDB is preferred
TTL_FILES = [
    BASE_DIR / "kg/lexicon/entries.ttl",
    BASE_DIR / "kg/lexicon/senses.ttl",
    BASE_DIR / "kg/metadata/levels.ttl",
    BASE_DIR / "kg/metadata/categories.ttl",
    BASE_DIR / "kg/metadata/meanings.ttl",
    BASE_DIR / "kg/metadata/examples.ttl",
    BASE_DIR / "kg/metadata/frequency.ttl",
    BASE_DIR / "kg/phonetics/phonetics.ttl",
    BASE_DIR / "kg/morphology/forms.ttl",  # 254MB - included now
]

AILAND = Namespace("http://ailand.org/")
ONTOLEX = Namespace("http://www.w3.org/ns/lemon/ontolex#")
LEXINFO = Namespace("http://www.lexinfo.net/ontology/2.0/lexinfo#")
OLIA = Namespace("http://purl.org/olia/olia.owl#")


def log(msg):
    print(msg, flush=True)


def load_local_graph():
    """Load all TTL files into a single graph."""
    g = Graph()
    log("Loading TTL files...")
    for ttl in TTL_FILES:
        if ttl.exists():
            g.parse(ttl, format="turtle")
            log(f"  Loaded: {ttl.name}")
    log(f"Total triples: {len(g)}\n")
    return g


def label_of(node):
    """Extract local name from URI or literal."""
    s = str(node)
    if "#" in s:
        return s.rsplit("#", 1)[-1]
    if "/" in s:
        return s.rsplit("/", 1)[-1]
    return s


def print_predicates(g):
    """Print all unique predicates."""
    log("=" * 70)
    log("PREDICATES IN THE KNOWLEDGE GRAPH")
    log("=" * 70)

    predicates = set()
    for s, p, o in g:
        predicates.add(str(p))

    for p in sorted(predicates):
        log(f"  {p}")
    log("")


def build_hierarchy(g):
    """Build hierarchy using direct graph traversal (faster than SPARQL)."""
    log("Building hierarchy...")

    hierarchy = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(dict))))

    # Get all LexicalEntries
    entries = list(g.subjects(None, ONTOLEX.LexicalEntry))
    log(f"Found {len(entries)} lexical entries")

    count = 0
    for entry in entries:
        count += 1
        if count % 500 == 0:
            log(f"  Processing entry {count}...")

        # Get canonical word
        word = None
        for form in g.objects(entry, ONTOLEX.canonicalForm):
            for w in g.objects(form, ONTOLEX.writtenRep):
                if w.language == "de":
                    word = str(w)
                    break

        if not word:
            continue

        # Get level
        level = "No_Level"
        for lvl in g.objects(entry, AILAND.level):
            level = str(lvl)
            break

        # Get POS
        pos = "No_POS"
        for p in g.objects(entry, LEXINFO.partOfSpeech):
            pos = label_of(p)
            break

        # Get gender
        gender = None
        for gen in g.objects(entry, LEXINFO.gender):
            gender = label_of(gen)
            break

        # Get translation
        translation = None
        for sense in g.objects(entry, ONTOLEX.sense):
            for gloss in g.objects(sense, ONTOLEX.gloss):
                if gloss.language == "en":
                    translation = str(gloss)
                    break

        # Get frequency
        frequency = None
        for freq in g.objects(entry, AILAND.frequency):
            frequency = str(freq)
            break

        # Get categories (can be multiple via hasCategory blank nodes)
        categories = []
        for cat_node in g.objects(entry, AILAND.hasCategory):
            topic = "No_Topic"
            subtopic = "No_SubTopic"
            for t in g.objects(cat_node, AILAND.topic):
                topic = str(t)
            for s in g.objects(cat_node, AILAND.subTopic):
                subtopic = str(s)
            categories.append((topic, subtopic))

        if not categories:
            categories = [("No_Topic", "No_SubTopic")]

        # Add to hierarchy for each category
        for topic, subtopic in categories:
            if word not in hierarchy[level][topic][subtopic][pos]:
                hierarchy[level][topic][subtopic][pos][word] = {
                    "gender": gender,
                    "translation": translation,
                    "frequency": frequency,
                }

    log(f"Processed {count} entries\n")
    return hierarchy


def print_hierarchy(hierarchy):
    """Print the hierarchy."""
    log("=" * 70)
    log("KNOWLEDGE GRAPH HIERARCHY")
    log("Level -> Category -> SubCategory -> POS -> Word -> Properties")
    log("=" * 70)

    for level in sorted(hierarchy.keys()):
        log(f"\n{'='*70}")
        log(f"LEVEL: {level}")
        log(f"{'='*70}")

        for topic in sorted(hierarchy[level].keys()):
            log(f"\n  CATEGORY: {topic}")
            log(f"  {'-'*60}")

            for subtopic in sorted(hierarchy[level][topic].keys()):
                log(f"\n    SUBCATEGORY: {subtopic}")

                for pos in sorted(hierarchy[level][topic][subtopic].keys()):
                    log(f"\n      POS: {pos}")

                    for word, props in sorted(hierarchy[level][topic][subtopic][pos].items()):
                        parts = [f"WORD: {word}"]
                        if props.get("gender"):
                            parts.append(f"Gender: {props['gender']}")
                        if props.get("translation"):
                            parts.append(f"EN: {props['translation'][:40]}")
                        if props.get("frequency"):
                            parts.append(f"Freq: {props['frequency']}")
                        if props.get("forms"):
                            parts.append(f"Forms: {props['forms']}")

                        log(f"        {' | '.join(parts)}")


def print_summary(hierarchy):
    """Print summary."""
    log("\n" + "=" * 70)
    log("SUMMARY")
    log("=" * 70)

    levels = set()
    topics = set()
    subtopics = set()
    pos_set = set()
    words = set()

    for level in hierarchy:
        levels.add(level)
        for topic in hierarchy[level]:
            topics.add(topic)
            for subtopic in hierarchy[level][topic]:
                subtopics.add(subtopic)
                for pos in hierarchy[level][topic][subtopic]:
                    pos_set.add(pos)
                    for word in hierarchy[level][topic][subtopic][pos]:
                        words.add(word)

    log(f"  Levels: {len(levels)} ({', '.join(sorted(levels))})")
    log(f"  Categories: {len(topics)}")
    log(f"  SubCategories: {len(subtopics)}")
    log(f"  POS types: {len(pos_set)}")
    log(f"  Total Words: {len(words)}")


def main():
    mode = "GraphDB" if USE_GRAPHDB else "Local TTL files"
    log(f"Mode: {mode}")
    if USE_GRAPHDB:
        log(f"Endpoint: {SPARQL_ENDPOINT}")
    log("")

    if USE_GRAPHDB:
        # GraphDB mode - use SPARQL queries
        from SPARQLWrapper import SPARQLWrapper, JSON
        sparql = SPARQLWrapper(SPARQL_ENDPOINT)
        sparql.setReturnFormat(JSON)

        # Print predicates
        log("Fetching predicates...")
        sparql.setQuery("""
            SELECT DISTINCT ?p WHERE { ?s ?p ?o }
            ORDER BY ?p
        """)
        try:
            results = sparql.query().convert()
            log("=" * 70)
            log("PREDICATES IN THE KNOWLEDGE GRAPH")
            log("=" * 70)
            for row in results["results"]["bindings"]:
                log(f"  {row['p']['value']}")
            log("")
        except Exception as e:
            log(f"Error fetching predicates: {e}")
            return

        # Build hierarchy via SPARQL
        log("Fetching word data (this may take a while)...")
        sparql.setQuery("""
            PREFIX ailand: <http://ailand.org/>
            PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
            PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

            SELECT ?word ?level ?topic ?subtopic ?pos ?gender ?translation ?frequency 
                   (COUNT(DISTINCT ?otherForm) AS ?formCount)
            WHERE {
                ?entry a ontolex:LexicalEntry .
                ?entry ontolex:canonicalForm ?form .
                ?form ontolex:writtenRep ?word .
                FILTER(lang(?word) = "de")

                OPTIONAL { ?entry ailand:level ?level }
                OPTIONAL { 
                    ?entry ailand:hasCategory ?cat .
                    ?cat ailand:topic ?topic .
                    ?cat ailand:subTopic ?subtopic .
                }
                OPTIONAL { ?entry lexinfo:partOfSpeech ?pos }
                OPTIONAL { ?entry lexinfo:gender ?gender }
                OPTIONAL { 
                    ?entry ontolex:sense ?sense .
                    ?sense ontolex:gloss ?translation .
                    FILTER(lang(?translation) = "en")
                }
                OPTIONAL { ?entry ailand:frequency ?frequency }
                OPTIONAL { ?entry ontolex:otherForm ?otherForm }
            }
            GROUP BY ?word ?level ?topic ?subtopic ?pos ?gender ?translation ?frequency
            ORDER BY ?level ?topic ?subtopic ?pos ?word
        """)

        try:
            results = sparql.query().convert()
            rows = results["results"]["bindings"]
            log(f"Got {len(rows)} result rows\n")

            # Build hierarchy from SPARQL results
            hierarchy = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(dict))))

            for row in rows:
                word = row.get("word", {}).get("value", "unknown")
                level = row.get("level", {}).get("value", "No_Level")
                topic = label_of(row.get("topic", {}).get("value", "")) or "No_Topic"
                subtopic = label_of(row.get("subtopic", {}).get("value", "")) or "No_SubTopic"
                pos = label_of(row.get("pos", {}).get("value", "")) or "No_POS"

                if word not in hierarchy[level][topic][subtopic][pos]:
                    hierarchy[level][topic][subtopic][pos][word] = {
                        "gender": None,
                        "translation": None,
                        "frequency": None,
                        "forms": 0,
                    }

                props = hierarchy[level][topic][subtopic][pos][word]
                if "gender" in row:
                    props["gender"] = label_of(row["gender"]["value"])
                if "translation" in row:
                    props["translation"] = row["translation"]["value"]
                if "frequency" in row:
                    props["frequency"] = row["frequency"]["value"]
                if "formCount" in row:
                    props["forms"] = int(row["formCount"]["value"])

            print_hierarchy(hierarchy)
            print_summary(hierarchy)

        except Exception as e:
            log(f"Error fetching words: {e}")
            import traceback
            traceback.print_exc()
            return
    else:
        # Local TTL files mode
        g = load_local_graph()
        print_predicates(g)
        hierarchy = build_hierarchy(g)
        print_hierarchy(hierarchy)
        print_summary(hierarchy)


if __name__ == "__main__":
    main()
