import re
import yaml
import os

LEXICON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../specs/safety-crisis-lexicon.md'))

def load_lexicon():
    with open(LEXICON_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'```yaml(.*?)```', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find YAML block in lexicon")
    
    yaml_content = match.group(1)
    return yaml.safe_load(yaml_content)

class LexiconMatcher:
    def __init__(self):
        self.lexicon = load_lexicon()
        self.patterns = []
        for category, data in self.lexicon.items():
            if category == 'version':
                continue
            phrases = data.get('phrases', [])
            action = data.get('action')
            flag = data.get('flag')
            for phrase in phrases:
                # Normalize phrase for regex
                norm_phrase = phrase.lower().strip()
                # word-boundary match
                pattern = r'\b' + re.escape(norm_phrase) + r'\b'
                self.patterns.append({
                    'regex': re.compile(pattern, re.IGNORECASE),
                    'action': action,
                    'flag': flag,
                    'category': category
                })

    def match(self, text: str) -> dict:
        text = text.lower()
        # Normalization: keep apostrophes, collapse other punct
        text = re.sub(r'[^\w\s\']', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        for p in self.patterns:
            if p['regex'].search(text):
                return {
                    "matched": True,
                    "action": p['action'],
                    "flag": p['flag'],
                    "category": p['category']
                }
        return {"matched": False}

matcher = LexiconMatcher()

def check_lexicon(text: str) -> dict:
    return matcher.match(text)
