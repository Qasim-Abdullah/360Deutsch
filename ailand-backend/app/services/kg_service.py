
from SPARQLWrapper import SPARQLWrapper, JSON
from typing import Optional, List, Dict, Any
from app.core.config import settings


class KGService:
    
    def __init__(self):
        self.sparql = SPARQLWrapper(settings.SPARQL_ENDPOINT)
        self.sparql.setReturnFormat(JSON)
    
    def _query(self, query: str) -> List[Dict[str, Any]]:
        self.sparql.setQuery(query)
        try:
            results = self.sparql.query().convert()
            return results.get("results", {}).get("bindings", [])
        except Exception as e:
            print(f"SPARQL query error: {e}")
            return []
    
    def get_levels(self) -> List[Dict[str, Any]]:
        results = self._query("""
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
        
        return [
            {
                "level": r["level"]["value"],
                "word_count": int(r["count"]["value"])
            }
            for r in results
        ]
    


    def get_subjects_by_level(self, level: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        results = self._query(f"""
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
    
    def get_word_details(self, word_id: str) -> Optional[Dict[str, Any]]:
        uri = f"<http://ailand.org/{word_id}>"
        
        basic = self._query(f"""
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
        
        meanings = self._query(f"""
            PREFIX : <http://ailand.org/>
            
            SELECT ?meaning
            WHERE {{
                {uri} :meaning ?meaning .
            }}
        """)
        
        
        examples = self._query(f"""
            PREFIX : <http://ailand.org/>
            
            SELECT ?example
            WHERE {{
                {uri} :example ?example .
            }}
        """)
        

        glosses = self._query(f"""
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
    
    def get_word_as_graph(self, word_id: str) -> Optional[Dict[str, Any]]:
        details = self.get_word_details(word_id)
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


kg_service = KGService()