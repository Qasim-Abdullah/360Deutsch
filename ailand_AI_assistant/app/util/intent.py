from enum import Enum
from typing import Optional
from app.core.settings import settings
import google.generativeai as genai
import json
import re


class UserIntentRequestType(str, Enum):
    CHECK = "CHECK"
    PRACTICE = "PRACTICE"
    EXPLAIN = "EXPLAIN"
    ADVISE = "ADVISE"
    PROGRESS = "PROGRESS"
    TRANSLATE = "TRANSLATE"
    VOCAB_REQUEST = "VOCAB_REQUEST"   # user wants KG vocabulary for a topic
    IMAGE_ANALYSIS = "IMAGE_ANALYSIS" # AI identifies objects in an image/frame


class KGIntent:
    """Holds the extracted KG entities from a VOCAB_REQUEST message."""
    def __init__(self, subtopic: Optional[str] = None, topic: Optional[str] = None, level: Optional[str] = None):
        self.subtopic = subtopic
        self.topic = topic
        self.level = level

    def has_filters(self) -> bool:
        return bool(self.subtopic or self.topic or self.level)

    def __repr__(self):
        return f"KGIntent(subtopic={self.subtopic!r}, topic={self.topic!r}, level={self.level!r})"


# ── Simple keyword triggers (fast-path, no AI cost) ──────────────────────────
_VOCAB_KEYWORDS = (
    "vocabulary", "vokabeln", "vokabeln für", "wörter",
    "dataset", "word list", "wortliste", "wortschatz",
    "zeig mir", "show me words", "give me words",
    "give me the", "words for", "words about",
    "teach me", "lerne ich", "für das thema",
)

Predefined_intentions = {
    UserIntentRequestType.EXPLAIN: (
        "was ist", "was bedeutet", "was heißt", "was heisst",
        "erkläre", "explain", "why", "warum", "wieso", "weshalb",
        "how to", "wie man", "rules", "regeln"
    ),
    UserIntentRequestType.ADVISE: (
        "wie soll ich", "was soll ich", "should i",
        "what should i", "empfiehl", "empfehlung"
    ),
    UserIntentRequestType.PROGRESS: (
        "status", "fortschritt", "progress", "score"
    ),
    UserIntentRequestType.PRACTICE: (
        "übung", "übungen", "test", "quiz", "practice", "aufgabe"
    ),
    UserIntentRequestType.TRANSLATE: (
        "wie sagt man", "wie heißt", "wie heisst",
        "how to say", "übersetze", "übersetzen", "translate"
    ),
}


class UserIntentRouter:
    """
    Detects the intent of a user message.
    Uses AI (Gemini) to classify VOCAB_REQUEST and extract entities.
    Falls back to keyword matching for other intents.
    """

    @staticmethod
    def detect_intention(msg: str) -> UserIntentRequestType:
        """Fast-path keyword detector for non-KG intents."""
        if not msg:
            return UserIntentRequestType.CHECK

        message = msg.lower()

        # Fast-path: KG vocabulary keywords
        if any(kw in message for kw in _VOCAB_KEYWORDS):
            return UserIntentRequestType.VOCAB_REQUEST

        # Fast-path: other intents
        for intent, words in Predefined_intentions.items():
            if message.startswith(words):
                return intent

        # Visual Detection Check: if there are keywords and we would usually have an image (checked in ChatService)
        visual_keywords = ("what is this", "was ist das", "identify", "vokabeln im bild", "detect", "erkennen")
        if any(kw in message for kw in visual_keywords):
            return UserIntentRequestType.IMAGE_ANALYSIS

        return UserIntentRequestType.CHECK

    @staticmethod
    async def extract_kg_intent(msg: str) -> KGIntent:
        """
        Extracts KG entity filters from natural language.
        Primary: Gemini AI extraction (smart, handles any phrasing).
        Fallback: keyword-based regex extraction (fast, no API cost).

        Handles:
          - "give me vocabulary for Arbeitszimmer"
          - "zeig mir Wörter über das Büro"
          - "I want A1 words about Living Room"
        """
        # Try Gemini first
        if UserIntentRouter.check_api_key():
            result = await UserIntentRouter.check_intent_gemini(msg)
            if result.has_filters():
                return result

        # Fallback: keyword regex extraction
        return UserIntentRouter.main_word(msg)

    @staticmethod
    async def check_intent_gemini(msg: str) -> KGIntent:       
        prompt = f"""You are an entity extractor for a German vocabulary learning app.

The user sent this message: "{msg}"

The Knowledge Graph has vocabulary organized by:
- subtopic: specific room or area (e.g. "Arbeitszimmer", "Küche", "Schlafzimmer", "Bad")  
- topic: broader category (e.g. "Home_and_Living", "Work", "School", "Food")
- level: CEFR level (e.g. "A1", "A2", "B1", "B2")

Extract what vocabulary the user is requesting.
Return ONLY valid JSON (no markdown, no explanation):

{{
  "intent": "VOCAB_REQUEST" or "OTHER",
  "subtopic": "exact subtopic name or null",
  "topic": "exact topic name or null",
  "level": "CEFR level or null"
}}

Rules:
- Room/area mention → set subtopic (use German form, e.g. Arbeitszimmer)
- Broad theme → set topic
- Level like A1/beginner/Anfänger → set level (uppercase, e.g. "A1")
- Not about vocabulary → intent = "OTHER"
- Return null for fields you are not confident about
"""

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            raw = response.text.strip()
            raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()
            data = json.loads(raw)
            if data.get("intent") != "VOCAB_REQUEST":
                return KGIntent()
            return KGIntent(
                subtopic=data.get("subtopic"),
                topic=data.get("topic"),
                level=data.get("level"),
            )
        except Exception as e:
            print(f"[IntentRouter] Gemini extract error: {e}")
            return KGIntent()

    @staticmethod
    def main_word(msg: str) -> KGIntent:
        """
        Extracts level (A1-C2) and subtopic from the message.
        """    
        level_match = re.search(r"\b([ABC][12])\b", msg, re.IGNORECASE)
        level = level_match.group(1).upper() if level_match else None

        entity_match = re.search(
            r"(?:for|for the|für|über|about|about the|for my|im|im bereich|thema|topic)\s+([A-ZÄÖÜ][a-zA-ZÄÖÜäöüß_]+)",
            msg,
            re.IGNORECASE,
        )
        subtopic = entity_match.group(1) if entity_match else None

        return KGIntent(subtopic=subtopic, level=level)

    @staticmethod
    def check_api_key() -> bool:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return False
        return True
