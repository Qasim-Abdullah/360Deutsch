from SPARQLWrapper import SPARQLWrapper, JSON
from app.core.settings import settings
import re

class KGService:
    def __init__(self):
        endpoint = settings.GRAPH_360_DEUTSCH or settings.GRAPHDB_ENDPOINT
        self.sparql = SPARQLWrapper(endpoint)
        self.sparql.setReturnFormat(JSON)

    def get_subtopic_data(self, subtopic: str = None, topic: str = None, level: str = None):      
        # Build category filter: use a single blank node so subTopic and topic
        # always come from the same category node (avoids cross-matching).
        cat_required = []
        cat_optional = []
        bind_block = ""

        if subtopic:
            cat_required.append(f'?cat ailand:subTopic "{subtopic}" .')
            bind_block += f'BIND("{subtopic}" AS ?subTopic)\n            '
        else:
            cat_optional.append("OPTIONAL { ?cat ailand:subTopic ?subTopic . }")

        if topic:
            cat_required.append(f'?cat ailand:topic "{topic}" .')
            bind_block += f'BIND("{topic}" AS ?topic)\n            '
        else:
            cat_optional.append("OPTIONAL { ?cat ailand:topic ?topic . }")

        # Category block: if any category filter is required, use a required
        # pattern with a shared ?cat variable; otherwise make it fully optional.
        if cat_required:
            cat_block = "?entry ailand:hasCategory ?cat .\n            "
            cat_block += "\n            ".join(cat_required) + "\n            "
            cat_block += "\n            ".join(cat_optional)
        else:
            cat_block = (
                "OPTIONAL {\n"
                "                ?entry ailand:hasCategory ?cat .\n"
                "                " + "\n                ".join(cat_optional) + "\n"
                "            }"
            )

        # Level filter (separate from category)
        level_required = ""
        level_optional = ""
        if level:
            level_required = f'?entry ailand:level "{level}" .'
            bind_block += f'BIND("{level}" AS ?level)\n            '
        else:
            level_optional = "OPTIONAL { ?entry ailand:level ?level . }"

        query = f"""
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
        PREFIX ailand: <http://ailand.org/>

        SELECT DISTINCT ?entry ?label ?pos ?level ?topic ?subTopic ?gender ?plural ?ipa ?example ?translation WHERE {{
            ?entry a ontolex:LexicalEntry ;
                   ontolex:canonicalForm ?form .

            ?form ontolex:writtenRep ?label .

            {cat_block}
            {level_required}
            {bind_block}
            {level_optional}

            OPTIONAL {{ ?entry lexinfo:partOfSpeech ?pos . }}
            OPTIONAL {{ ?entry lexinfo:gender ?gender_uri . BIND(STRAFTER(STR(?gender_uri), "#") AS ?gender) }}
            OPTIONAL {{
                ?entry ontolex:otherForm ?pluralForm .
                ?pluralForm <http://purl.org/olia/olia.owl#hasNumber> <http://purl.org/olia/olia.owl#Plural> ;
                            ontolex:writtenRep ?plural .
            }}
            OPTIONAL {{ ?form ontolex:phoneticRep ?ipa . }}
            OPTIONAL {{ ?entry ailand:example ?example . }}
            OPTIONAL {{ ?entry ailand:meaning ?translation . FILTER(LANG(?translation) = "en") }}
        }}
        """
        self.sparql.setQuery(query)
        try:
            results = self.sparql.query().convert()
            return results["results"]["bindings"]
        except Exception as e:
            print(f"KG SubTopic Query Error: {e}")
            return []

    def get_entry_details(self, entry_id: str):       
        entry_uri = f"http://ailand.org/{entry_id}"
        query = f"""
        PREFIX ailand: <http://ailand.org/>
        SELECT ?example ?meaning_de ?meaning_en WHERE {{
            OPTIONAL {{ <{entry_uri}> ailand:example ?example . }}
            OPTIONAL {{ <{entry_uri}> ailand:meaning ?meaning_de . FILTER(LANG(?meaning_de) = "de") }}
            OPTIONAL {{ <{entry_uri}> ailand:meaning ?meaning_en . FILTER(LANG(?meaning_en) = "en") }}
        }}
        """
        self.sparql.setQuery(query)
        try:
            results = self.sparql.query().convert()
            bindings = results["results"]["bindings"]
            examples = list({b["example"]["value"] for b in bindings if "example" in b})
            meaning_de = list({b["meaning_de"]["value"] for b in bindings if "meaning_de" in b})
            meaning_en = list({b["meaning_en"]["value"] for b in bindings if "meaning_en" in b})
            return {
                "examples": examples or None,
                "meaning_de": meaning_de or None,
                "meaning_en": meaning_en or None,
            }
        except Exception as e:
            print(f"KG Entry Detail Error: {e}")
            return {}

    def query_dbpedia(self, term: str):
        """
        Queries DBpedia for an abstract/description of a given term (e.g., 'Dative case').
        """
        sparql_dbpedia = SPARQLWrapper(settings.DBPEDIA_ENDPOINT)
        sparql_dbpedia.setReturnFormat(JSON)
        
        # Try both English and German labels for broader coverage
        query = f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?label ?comment WHERE {{
            {{
                ?res rdfs:label "{term}"@en .
            }} UNION {{
                ?res rdfs:label "{term}"@de .
            }}
            ?res rdfs:comment ?comment .
            FILTER (lang(?comment) = "en" || lang(?comment) = "de")
        }}
        LIMIT 2
        """
        sparql_dbpedia.setQuery(query)
        try:
            results = sparql_dbpedia.query().convert()
            bindings = results["results"]["bindings"]
            if bindings:
                # Prefer German comment if available, otherwise English
                comment_de = next((b["comment"]["value"] for b in bindings if b["comment"]["xml:lang"] == "de"), None)
                comment_en = next((b["comment"]["value"] for b in bindings if b["comment"]["xml:lang"] == "en"), None)
                
                desc = comment_de or comment_en or ""
                return {
                    "label": term,
                    "desc": desc[:300] + "..." if len(desc) > 300 else desc,
                    "uri": "https://dbpedia.org/page/" + term.replace(" ", "_"),
                    "source": "DBpedia"
                }
            return None
        except Exception as e:
            print(f"DBpedia Query Error: {e}")
            return None

    def get_full_hierarchy(self):       
        return self.get_subtopic_data()

    def get_verb_conjugations(self, entry_uri: str):       
        query = f"""
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX olia: <http://purl.org/olia/olia.owl#>
        
        SELECT ?writtenRep ?person ?number WHERE {{
             <{entry_uri}> ontolex:otherForm ?form .
             ?form ontolex:writtenRep ?writtenRep ;
                   olia:hasTense olia:Present ;
                   olia:hasPerson ?person_uri ;
                   olia:hasNumber ?number_uri .
             BIND(STRAFTER(STR(?person_uri), "#") AS ?person)
             BIND(STRAFTER(STR(?number_uri), "#") AS ?number)
        }}
        """
        self.sparql.setQuery(query)
        try:
            results = self.sparql.query().convert()
            return results["results"]["bindings"]
        except Exception as e:
            print(f"KG Conjugation Error: {e}")
            return []

    def check_word_in_kg(self, word: str):       
        query = f"""
        PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>
        
        SELECT ?entry ?writtenRep ?pos WHERE {{
            ?entry a ontolex:LexicalEntry ;
                   ontolex:canonicalForm ?form .
            ?form ontolex:writtenRep ?writtenRep .
            OPTIONAL {{ ?entry lexinfo:partOfSpeech ?pos . }}
            FILTER (regex(str(?writtenRep), "^{word}$", "i"))
        }}
        LIMIT 1
        """
        
        self.sparql.setQuery(query)
        
        try:
            results = self.sparql.query().convert()
            bindings = results["results"]["bindings"]
            if bindings:
                return {
                    "exists": True,
                    "uri": bindings[0]["entry"]["value"],
                    "label": bindings[0]["writtenRep"]["value"],
                    "pos": bindings[0].get("pos", {}).get("value", "Unknown")
                }
            return {"exists": False}
        except Exception as e:
            print(f"KG Error: {e}")
            return {"exists": False, "error": str(e)}

    def check_grammar_concept(self, text: str):
        """
        Checks if the text mentions a known grammar concept in the KG.
        """
        # Mocking KG Grammar Concepts for MVP          
        known_concepts = {
            "plural": {
                "label": "Plural Formation",
                "desc": "In German, plurals are formed using -e, -er, -n, -en, -s, or no change, often with umlauts.",
                "uri": "http://example.org/grammar#Plural"
            },
            "article": {
                "label": "Definite Articles",
                "desc": "German has three grammatical genders: der (masc), die (fem), das (neut).",
                "uri": "http://example.org/grammar#DefiniteArticle"
            },
            "gender": {
                "label": "Grammatical Gender",
                "desc": "Every noun has a gender that must be learned with the noun.",
                "uri": "http://example.org/grammar#Gender"
            },
            "case": {
                "label": "Cases",
                "desc": "German has four cases: Nominative, Accusative, Dative, and Genitive.",
                "uri": "http://example.org/grammar#Case"
            },
            "dativ": {
                "label": "The Dative Case",
                "desc": "The Dative case is used for the indirect object (to whom/for whom). Articles change: der/das -> dem, die -> der, plural die -> den (+n on noun).",
                "uri": "http://example.org/grammar#Dativ"
            }
        }
        
        text_lower = text.lower()
        found = []
        
        for key, data in known_concepts.items():
            if key in text_lower:
                found.append(data)
                
        # If no local concepts found, try DBpedia as fallback
        if not found:
            # Simple heuristic: if the user asks "what is X" or "tell me about X"
            match = re.search(r"(?:what is|tell me about|explain|was ist|erkläre)\s+([^?.]+)", text_lower)
            if match:
                term = match.group(1).strip()
                dbp_data = self.query_dbpedia(term.capitalize())
                if dbp_data:
                    found.append(dbp_data)

        return found