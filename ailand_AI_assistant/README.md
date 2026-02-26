# 360°Deutsch AI Assistant API

## Run the Server

```bash
cd ailand_AI_assistant
python -m app.main
```

Server starts at: `http://127.0.0.1:8005`

---

## Endpoints

### Health Check
```
GET /health_check
```

---

### KG Vocabulary — `POST /api/v1/kg/ar_ai`

Accepts a **natural language query**, extracts the topic using AI, and returns structured vocabulary from the Knowledge Graph.

**Request:**
```json
POST /api/v1/kg/ar_ai
{ "query": "give me dataset for Arbeitszimmer" }
```

Other example queries:
```
"A1 words about the kitchen"
"Vokabeln für Küche"
"show me vocabulary for Schlafzimmer"
```

**Success response:**
```json
{
  "ok": true,
  "message": "Knowledge graph loaded successfully.",
  "data": {
    "id": "KG_ROOT",
    "type": "root",
    "children": [{
      "id": "A1", "type": "level",
      "children": [{
        "id": "Home_and_Living", "type": "category",
        "children": [{
          "id": "Arbeitszimmer", "type": "subcategory",
          "children": [{
            "id": "Noun", "label": "Nouns", "type": "pos",
            "children": [{
              "id": "Schreibtisch",
              "label": "Schreibtisch",
              "type": "entry",
              "gender": "der",
              "plural": "Schreibtische",
              "ipa": "ˈʃʁaɪ̯pˌtɪʃ",
              "examples": [{ "de": "Der Schreibtisch steht im Zimmer." }],
              "children": []
            }]
          }]
        }]
      }]
    }]
  }
}
```

**Error response:**
```json
{
  "ok": false,
  "reason": "Could not identify a specific topic from: 'hello'. Please mention a room, topic, or level."
}
```

**How AI extraction works:**
1. Gemini extracts `subtopic / topic / level` from the query
2. If Gemini is unavailable → regex fallback (e.g. `"for Arbeitszimmer"` → `subtopic = "Arbeitszimmer"`)

---

### KG Entry Detail — `GET /api/v1/kg/entry/{id}`

Returns examples and meanings for a single word.

```
GET /api/v1/kg/entry/Schreibtisch
```

---

### Chat — `POST /chat/message`

AI-powered chat. Detects intent and routes automatically.

```json
{
  "client_id": "user_123",
  "message": "was ist Schreibtisch?"
}
```

| Message type | Routed to |
|---|---|
| `"give me vocabulary for X"` | KG dataset fetch |
| `"was ist ..."` | Gemini explanation |
| `"quiz me"` | Practice mode |
| anything else | German tutor chat |

---

## Requirements

```bash
pip install -r requirements.txt
```

`.env` file:
```
GEMINI_API_KEY=your_key
GRAPH_360_DEUTSCH=http://localhost:7200/repositories/GRAPH_360_DEUTSCH
```

> GraphDB must be running on port `7200` with the `GRAPH_360_DEUTSCH` repository loaded.
