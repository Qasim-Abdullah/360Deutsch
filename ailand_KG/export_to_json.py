#!/usr/bin/env python3
"""
Export KG TTL data to a single JSON file for frontend use.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Simple TTL parser without external dependencies
def parse_ttl_file(filepath):
    """Parse a TTL file and extract triples."""
    triples = []
    current_subject = None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove comments
    lines = []
    for line in content.split('\n'):
        if '#' in line and not line.strip().startswith('@'):
            # Keep everything before # unless it's in a string
            in_string = False
            result = []
            for i, char in enumerate(line):
                if char == '"' and (i == 0 or line[i-1] != '\\'):
                    in_string = not in_string
                if char == '#' and not in_string:
                    break
                result.append(char)
            lines.append(''.join(result))
        else:
            lines.append(line)
    
    content = '\n'.join(lines)
    
    # Extract prefixes
    prefixes = {}
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('@prefix'):
            parts = line.split()
            if len(parts) >= 3:
                prefix = parts[1].rstrip(':')
                uri = parts[2].strip('<>').rstrip('.')
                prefixes[prefix] = uri
    
    return content, prefixes


def extract_uri_local(uri, prefixes):
    """Extract the local name from a URI."""
    if uri.startswith('<') and uri.endswith('>'):
        uri = uri[1:-1]
    
    # Check for ailand prefix
    if 'ailand.org/' in uri:
        return uri.split('ailand.org/')[-1]
    
    # Check for lexinfo prefix
    if 'lexinfo' in uri and '#' in uri:
        return uri.split('#')[-1]
    
    return uri


def parse_entries(filepath):
    """Parse entries.ttl to extract word entries with gender, POS, IPA."""
    entries = {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by entry (each entry starts with <http://ailand.org/...)
    blocks = content.split('<http://ailand.org/')
    
    for block in blocks[1:]:  # Skip first empty block
        lines = block.strip().split('\n')
        if not lines:
            continue
        
        # Get word ID from first line
        first_line = lines[0]
        word_id = first_line.split('>')[0].strip()
        
        entry = {
            'id': word_id,
            'german': None,
            'gender': None,
            'pos': None,
            'ipa': None,
        }
        
        full_block = '\n'.join(lines)
        
        # Extract gender
        if 'lexinfo:masculine' in full_block:
            entry['gender'] = 'masculine'
        elif 'lexinfo:feminine' in full_block:
            entry['gender'] = 'feminine'
        elif 'lexinfo:neuter' in full_block:
            entry['gender'] = 'neuter'
        
        # Extract POS
        if 'lexinfo:noun' in full_block:
            entry['pos'] = 'noun'
        elif 'lexinfo:verb' in full_block:
            entry['pos'] = 'verb'
        elif 'lexinfo:adjective' in full_block:
            entry['pos'] = 'adjective'
        elif 'lexinfo:adverb' in full_block:
            entry['pos'] = 'adverb'
        elif 'lexinfo:preposition' in full_block:
            entry['pos'] = 'preposition'
        elif 'lexinfo:conjunction' in full_block:
            entry['pos'] = 'conjunction'
        elif 'lexinfo:pronoun' in full_block:
            entry['pos'] = 'pronoun'
        elif 'lexinfo:interjection' in full_block:
            entry['pos'] = 'interjection'
        elif 'lexinfo:number' in full_block or 'lexinfo:numeral' in full_block:
            entry['pos'] = 'number'
        elif 'lexinfo:article' in full_block:
            entry['pos'] = 'article'
        elif 'lexinfo:particle' in full_block:
            entry['pos'] = 'particle'
        
        # Extract written form
        import re
        written_match = re.search(r'ontolex:writtenRep\s+"([^"]+)"@de', full_block)
        if written_match:
            entry['german'] = written_match.group(1)
        
        # Extract IPA
        ipa_match = re.search(r'ontolex:phoneticRep\s+"([^"]+)"@de-fonipa', full_block)
        if ipa_match:
            entry['ipa'] = ipa_match.group(1)
        
        if entry['german']:
            entries[word_id] = entry
    
    return entries


def parse_levels(filepath):
    """Parse levels.ttl to extract word-level mappings."""
    levels = {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if 'ailand:level' in line:
                # Format: ailand:WordId ailand:level "A1" .
                parts = line.split()
                if len(parts) >= 3:
                    word_id = parts[0].replace('ailand:', '')
                    level = parts[2].strip('"').strip('.')
                    levels[word_id] = level
    
    return levels


def parse_senses(filepath):
    """Parse senses.ttl to extract English translations."""
    translations = defaultdict(list)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    import re
    
    # Find all word IDs and their glosses
    # Pattern: <http://ailand.org/word> ontolex:sense ... ontolex:gloss "translation"@en
    current_word = None
    
    for line in content.split('\n'):
        line = line.strip()
        
        # Check for word URI
        if line.startswith('<http://ailand.org/'):
            word_match = re.match(r'<http://ailand\.org/([^>]+)>', line)
            if word_match:
                current_word = word_match.group(1)
        
        # Check for gloss
        gloss_match = re.search(r'ontolex:gloss\s+"([^"]+)"@en', line)
        if gloss_match and current_word:
            translation = gloss_match.group(1)
            if translation not in translations[current_word]:
                translations[current_word].append(translation)
    
    return dict(translations)


def parse_meanings(filepath):
    """Parse meanings.ttl to extract German and English meanings."""
    meanings_de = defaultdict(list)
    meanings_en = defaultdict(list)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    import re
    
    # Pattern: ailand:word ailand:meaning "text"@lang
    for line in content.split('\n'):
        line = line.strip()
        if 'ailand:meaning' not in line:
            continue
        
        # Extract word ID
        word_match = re.match(r'ailand:(\S+)', line)
        if not word_match:
            continue
        word_id = word_match.group(1)
        
        # Extract German meanings
        de_matches = re.findall(r'"([^"]+)"@de', line)
        for meaning in de_matches:
            if meaning not in meanings_de[word_id]:
                meanings_de[word_id].append(meaning)
        
        # Extract English meanings
        en_matches = re.findall(r'"([^"]+)"@en', line)
        for meaning in en_matches:
            if meaning not in meanings_en[word_id]:
                meanings_en[word_id].append(meaning)
    
    return dict(meanings_de), dict(meanings_en)


def parse_examples(filepath):
    """Parse examples.ttl to extract example sentences."""
    examples = defaultdict(list)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    import re
    
    for line in content.split('\n'):
        line = line.strip()
        if 'ailand:example' not in line:
            continue
        
        # Extract word ID
        word_match = re.match(r'ailand:(\S+)', line)
        if not word_match:
            continue
        word_id = word_match.group(1)
        
        # Extract examples
        example_matches = re.findall(r'"([^"]+)"@de', line)
        for example in example_matches:
            if example not in examples[word_id]:
                examples[word_id].append(example)
    
    return dict(examples)


def main():
    # Paths
    kg_dir = Path(__file__).parent / 'kg'
    output_file = Path(__file__).parent.parent / 'ailand-frontend' / 'src' / 'data' / 'vocabulary.json'
    
    print("Parsing TTL files...")
    
    # Parse all data
    entries = parse_entries(kg_dir / 'lexicon' / 'entries.ttl')
    print(f"  - Entries: {len(entries)} words")
    
    levels = parse_levels(kg_dir / 'metadata' / 'levels.ttl')
    print(f"  - Levels: {len(levels)} mappings")
    
    translations = parse_senses(kg_dir / 'lexicon' / 'senses.ttl')
    print(f"  - Translations: {len(translations)} words with translations")
    
    meanings_de, meanings_en = parse_meanings(kg_dir / 'metadata' / 'meanings.ttl')
    print(f"  - Meanings DE: {len(meanings_de)} words")
    print(f"  - Meanings EN: {len(meanings_en)} words")
    
    examples = parse_examples(kg_dir / 'metadata' / 'examples.ttl')
    print(f"  - Examples: {len(examples)} words with examples")
    
    # Combine into final structure
    words = {}
    level_words = defaultdict(list)
    
    for word_id, entry in entries.items():
        level = levels.get(word_id)
        if not level:
            continue  # Skip words without level assignment
        
        word_data = {
            'id': word_id,
            'german': entry['german'],
            'level': level,
            'pos': entry['pos'] or 'unknown',
            'gender': entry['gender'],
            'ipa': entry['ipa'],
            'translations': translations.get(word_id, []),
            'meanings_de': meanings_de.get(word_id, []),
            'meanings_en': meanings_en.get(word_id, []),
            'examples': examples.get(word_id, []),
        }
        
        words[word_id] = word_data
        level_words[level].append(word_id)
    
    # Build output structure
    output = {
        'words': words,
        'levels': {}
    }
    
    for level in ['A1', 'A2', 'B1']:
        word_list = sorted(level_words[level])
        output['levels'][level] = {
            'word_count': len(word_list),
            'words': word_list
        }
    
    # Create output directory if needed
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    print(f"\nWriting {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    file_size = output_file.stat().st_size / 1024 / 1024
    print(f"Done! Output: {file_size:.2f} MB")
    
    # Summary
    print(f"\nSummary:")
    print(f"  Total words: {len(words)}")
    for level in ['A1', 'A2', 'B1']:
        print(f"  {level}: {output['levels'][level]['word_count']} words")


if __name__ == '__main__':
    main()
