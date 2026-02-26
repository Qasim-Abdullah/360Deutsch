from rdflib import Graph

def validate(path):
    g = Graph()
    g.parse(path, format="turtle")
    print("TTL OK")
