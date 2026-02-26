"""
Extract only Nominative Plural forms from forms.ttl to reduce file size.
Line-by-line processing for memory efficiency.
"""

import re
from pathlib import Path
from collections import defaultdict

INPUT_FILE = Path(__file__).parent.parent / "kg/morphology/forms.ttl"
OUTPUT_FILE = Path(__file__).parent.parent / "kg/morphology/forms_plural_only.ttl"

def main():
    print(f"Reading {INPUT_FILE}...")
    
    entry_to_forms = defaultdict(list)
    form_data = {}  # form_uri -> written_rep
    
    current_entry = None
    current_form = None
    current_written_rep = None
    is_nominative = False
    is_plural = False
    
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for line in f:
            # Check for entry-to-form link start
            entry_match = re.match(r'^<(http://ailand\.org/[^>]+)>\s+ontolex:otherForm\s+', line)
            if entry_match:
                current_entry = entry_match.group(1)
            
            # Collect form URIs from entry-to-form lines
            if current_entry and '/form/' not in line.split('>')[0] if '>' in line else True:
                form_uris = re.findall(r'<(http://ailand\.org/[^>]+/form/[^>]+)>', line)
                entry_to_forms[current_entry].extend(form_uris)
                if line.strip().endswith('.'):
                    current_entry = None
            
            # Check for form definition start
            form_match = re.match(r'^<(http://ailand\.org/[^>]+/form/[^>]+)>\s+ontolex:writtenRep', line)
            if form_match:
                # Save previous form if it was Nominative Plural
                if current_form and is_nominative and is_plural and current_written_rep:
                    form_data[current_form] = current_written_rep
                
                current_form = form_match.group(1)
                current_written_rep = None
                is_nominative = False
                is_plural = False
            
            # Extract written rep
            if current_form:
                rep_match = re.search(r'"([^"]+)"@de', line)
                if rep_match and not current_written_rep:
                    current_written_rep = rep_match.group(1)
                
                if 'olia.owl#Nominative>' in line:
                    is_nominative = True
                if 'olia.owl#Plural>' in line:
                    is_plural = True
                
                # End of form definition
                if line.strip().endswith('.') and not line.strip().startswith('<http://ailand'):
                    if is_nominative and is_plural and current_written_rep:
                        form_data[current_form] = current_written_rep
                    current_form = None
    
    # Save last form
    if current_form and is_nominative and is_plural and current_written_rep:
        form_data[current_form] = current_written_rep
    
    print(f"Found {len(entry_to_forms)} entries")
    print(f"Found {len(form_data)} Nominative Plural forms")
    
    # Match entries to their nominative plural forms
    entry_to_plural = {}
    for entry_uri, form_uris in entry_to_forms.items():
        for form_uri in form_uris:
            if form_uri in form_data:
                entry_to_plural[entry_uri] = (form_uri, form_data[form_uri])
                break
    
    print(f"Entries with Nominative Plural: {len(entry_to_plural)}")
    
    # Write output
    print(f"Writing {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("@prefix ontolex: <http://www.w3.org/ns/lemon/ontolex#> .\n")
        f.write("@prefix olia: <http://purl.org/olia/olia.owl#> .\n\n")
        
        for entry_uri, (form_uri, written_rep) in sorted(entry_to_plural.items()):
            f.write(f"<{entry_uri}> ontolex:otherForm <{form_uri}> .\n")
        
        f.write("\n")
        
        written_forms = set()
        for entry_uri, (form_uri, written_rep) in entry_to_plural.items():
            if form_uri not in written_forms:
                f.write(f'<{form_uri}> ontolex:writtenRep "{written_rep}"@de ;\n')
                f.write(f'  olia:hasCase olia:Nominative ;\n')
                f.write(f'  olia:hasNumber olia:Plural .\n\n')
                written_forms.add(form_uri)
    
    input_size = INPUT_FILE.stat().st_size / (1024 * 1024)
    output_size = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    print(f"Original: {input_size:.1f} MB")
    print(f"Trimmed:  {output_size:.2f} MB ({output_size*1024:.0f} KB)")
    print(f"Reduction: {(1 - output_size/input_size) * 100:.1f}%")

if __name__ == "__main__":
    main()
