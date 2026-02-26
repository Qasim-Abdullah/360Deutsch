
from functools import lru_cache
from SPARQLWrapper import SPARQLWrapper, JSON
from typing import Optional, List, Dict, Any
from app.core.config import settings


# Global SPARQLWrapper instance (singleton)
_sparql: Optional[SPARQLWrapper] = None


def _get_sparql() -> SPARQLWrapper:
    """Get or create the global SPARQLWrapper instance."""
    global _sparql
    if _sparql is None:
        _sparql = SPARQLWrapper(settings.SPARQL_ENDPOINT)
        _sparql.setReturnFormat(JSON)
        if "ngrok" in settings.SPARQL_ENDPOINT:
            _sparql.addCustomHttpHeader("ngrok-skip-browser-warning", "true")
    return _sparql


def _query(query: str) -> List[Dict[str, Any]]:
    """Execute a SPARQL query and return results."""
    sparql = _get_sparql()
    sparql.setQuery(query)
    try:
        results = sparql.query().convert()
        return results.get("results", {}).get("bindings", [])
    except Exception as e:
        print(f"SPARQL query error: {e}")
        return []


# ============================================================================
# CACHED FUNCTIONS - These are the actual implementations with caching
# ============================================================================

@lru_cache(maxsize=1)
def _cached_get_levels() -> tuple:
    """Cached: Get all levels with word counts. Returns tuple for hashability."""
    results = _query("""
        PREFIX : <http://ailand.org/>
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        
        SELECT ?level (COUNT(?entry) AS ?count)
        WHERE {
            ?entry a ontolex:LexicalEntry ;
                   :level ?level .
        }
        GROUP BY ?level
        ORDER BY ?level
    """)
    
    return tuple(
        {
            "level": r["level"]["value"],
            "word_count": int(r["count"]["value"])
        }
        for r in results
    )


@lru_cache(maxsize=128)
def _cached_get_subjects_by_level(level: str, limit: int, offset: int) -> dict:
    """Cached: Get paginated subjects for a level."""
    results = _query(f"""
        PREFIX : <http://ailand.org/>
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
        
        SELECT DISTINCT ?entry ?writtenRep ?pos ?gloss
        WHERE {{
            ?entry a ontolex:LexicalEntry ;
                   :level "{level}" ;
                   lexinfo:partOfSpeech ?pos ;
                   ontolex:canonicalForm ?form ;
                   ontolex:sense ?sense .
            ?form ontolex:writtenRep ?writtenRep .
            ?sense ontolex:gloss ?gloss .
            FILTER(lang(?gloss) = "en")
        }}
        ORDER BY ?writtenRep
        LIMIT {limit} OFFSET {offset}
    """)
    
    return {
        "level": level,
        "limit": limit,
        "offset": offset,
        "subjects": [
            {
                "id": r["entry"]["value"].split("/")[-1],
                "german": r["writtenRep"]["value"],
                "english": r["gloss"]["value"],
                "pos": r["pos"]["value"].split("#")[-1]
            }
            for r in results
        ]
    }


@lru_cache(maxsize=512)
def _cached_get_word_details(word_id: str) -> Optional[dict]:
    """Cached: Get full word details (4 SPARQL queries combined)."""
    uri = f"<http://ailand.org/{word_id}>"
    
    basic = _query(f"""
        PREFIX : <http://ailand.org/>
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
        
        SELECT ?writtenRep ?ipa ?level ?gender ?pos
        WHERE {{
            {uri} a ontolex:LexicalEntry ;
                  :level ?level ;
                  lexinfo:partOfSpeech ?pos ;
                  ontolex:canonicalForm ?form .
            ?form ontolex:writtenRep ?writtenRep .
            OPTIONAL {{ ?form ontolex:phoneticRep ?ipa }}
            OPTIONAL {{ {uri} lexinfo:gender ?gender }}
        }}
        LIMIT 1
    """)
    
    if not basic:
        return None
    
    meanings = _query(f"""
        PREFIX : <http://ailand.org/>
        
        SELECT ?meaning
        WHERE {{
            {uri} :meaning ?meaning .
        }}
    """)
    
    examples = _query(f"""
        PREFIX : <http://ailand.org/>
        
        SELECT ?example
        WHERE {{
            {uri} :example ?example .
        }}
    """)

    glosses = _query(f"""
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        
        SELECT ?gloss
        WHERE {{
            {uri} ontolex:sense ?sense .
            ?sense ontolex:gloss ?gloss .
        }}
    """)
    
    b = basic[0]

    meanings_de = []
    meanings_en = []
    for m in meanings:
        meaning_val = m["meaning"]["value"]
        lang = m["meaning"].get("xml:lang", "")
        if lang == "de":
            meanings_de.append(meaning_val)
        elif lang == "en":
            meanings_en.append(meaning_val)
    
    return {
        "id": word_id,
        "german": b["writtenRep"]["value"],
        "ipa": b.get("ipa", {}).get("value") if b.get("ipa") else None,
        "level": b["level"]["value"],
        "pos": b["pos"]["value"].split("#")[-1],
        "gender": b.get("gender", {}).get("value", "").split("#")[-1] if b.get("gender") else None,
        "translations": [g["gloss"]["value"] for g in glosses],
        "meanings_de": meanings_de,
        "meanings_en": meanings_en,
        "examples": [e["example"]["value"] for e in examples]
    }


@lru_cache(maxsize=256)
def _cached_get_word_as_graph(word_id: str) -> Optional[dict]:
    """Cached: Get word as graph visualization."""
    details = _cached_get_word_details(word_id)
    if not details:
        return None
    
    nodes = [
        {
            "id": "center",
            "type": "word",
            "label": details["german"],
            "data": {
                "ipa": details["ipa"],
                "pos": details["pos"],
                "gender": details["gender"],
                "level": details["level"]
            }
        }
    ]
    edges = []
    
    for i, trans in enumerate(details["translations"][:3]):
        node_id = f"trans_{i}"
        nodes.append({
            "id": node_id,
            "type": "translation",
            "label": trans
        })
        edges.append({
            "source": "center",
            "target": node_id,
            "relation": "translates_to"
        })
    
    for i, meaning in enumerate(details["meanings_en"][:3]):
        node_id = f"meaning_{i}"
        label = meaning[:150] + "..." if len(meaning) > 150 else meaning
        nodes.append({
            "id": node_id,
            "type": "meaning",
            "label": label
        })
        edges.append({
            "source": "center",
            "target": node_id,
            "relation": "means"
        })
    
    for i, example in enumerate(details["examples"][:3]):
        node_id = f"example_{i}"
        nodes.append({
            "id": node_id,
            "type": "example",
            "label": example
        })
        edges.append({
            "source": "center",
            "target": node_id,
            "relation": "used_in"
        })
    
    return {
        "word": details,
        "graph": {
            "nodes": nodes,
            "edges": edges
        }
    }


# ============================================================================
# CACHE UTILITIES
# ============================================================================

def get_cache_stats() -> Dict[str, Dict[str, int]]:
    """Get cache statistics for all cached functions."""
    return {
        "get_levels": _cached_get_levels.cache_info()._asdict(),
        "get_subjects_by_level": _cached_get_subjects_by_level.cache_info()._asdict(),
        "get_word_details": _cached_get_word_details.cache_info()._asdict(),
        "get_word_as_graph": _cached_get_word_as_graph.cache_info()._asdict(),
    }


def clear_all_caches() -> None:
    """Clear all caches."""
    _cached_get_levels.cache_clear()
    _cached_get_subjects_by_level.cache_clear()
    _cached_get_word_details.cache_clear()
    _cached_get_word_as_graph.cache_clear()


def warm_cache() -> None:
    """Pre-warm the levels cache on startup."""
    print("Pre-warming KG cache...")
    _cached_get_levels()
    print("KG cache warmed successfully")


# ============================================================================
# KGService CLASS - Thin wrapper for backward compatibility
# ============================================================================

class KGService:
    """Knowledge Graph Service - delegates to cached module-level functions."""
    
    def __init__(self):
        # Initialize the global SPARQLWrapper on first use
        _get_sparql()
    
    def _query(self, query: str) -> List[Dict[str, Any]]:
        """Execute a SPARQL query (for backward compatibility)."""
        return _query(query)
    
    def get_levels(self) -> List[Dict[str, Any]]:
        """Get all levels with word counts (cached)."""
        return list(_cached_get_levels())
    
    def get_subjects_by_level(self, level: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Get paginated subjects for a level (cached)."""
        return _cached_get_subjects_by_level(level, limit, offset)
    
    def get_word_details(self, word_id: str) -> Optional[Dict[str, Any]]:
        """Get full word details (cached)."""
        return _cached_get_word_details(word_id)
    
    def get_word_as_graph(self, word_id: str) -> Optional[Dict[str, Any]]:
        """Get word as graph visualization (cached)."""
        return _cached_get_word_as_graph(word_id)


kg_service = KGService()
