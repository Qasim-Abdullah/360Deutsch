from app.core.settings import settings
from app.util.intent import UserIntentRouter, UserIntentRequestType, KGIntent
from app.services.kg_service import KGService
import requests
import random
from typing import Optional

class ChatService:
    """
    Orchestrates the conversation flow:
    1. Detect user Intent
    2. Route to appropriate handler (KG, LLM, or Hardcoded)
    3. Construct Response
    """
    
    # In-Memory Session History: {client_id: [{"role": "user", "content": "..."}, ...]}
    user_sessions = {}
    
    # KG Service Instance
    kg_service = KGService()
    
    @staticmethod
    async def process_message(client_id: str, message: str, image: Optional[str] = None, user_level: str = "A1", user_progress: Optional[dict] = None) -> dict:
        user_intent = UserIntentRouter.detect_intention(message)
        history = ChatService.user_sessions.get(client_id, [])
        kg_concepts = ChatService.kg_service.check_grammar_concept(message)
        kg_words = []
        words = [w.strip("?,.!").strip() for w in message.split() if len(w) > 2]
        unique_words = list(set(words))
        for word in unique_words:
            if len(word)<3: continue
            res = ChatService.kg_service.check_word_in_kg(word)
            if res.get("exists"):
                kg_words.append(res)
        
        kg_context = ""
        if kg_concepts:
            kg_context += f"\n[KG GRAMMAR DATA]: {kg_concepts}. (Use this as GROUND TRUTH).\n"
        if kg_words:
           
            words_str = ", ".join([f"{w['label']} ({w.get('pos', 'Unknown')})" for w in kg_words])
            kg_context += f"\n[KG LEXICAL DATA]: Found entities: {words_str}. (Use this POS/Data as FACT).\n"

        debug_trace = {
            "step_1_intent": user_intent.value,
            "step_2_routing": "LLM (Default)",
            "history_len": len(history),
            "kg_concepts": [c['label'] for c in kg_concepts],
            "kg_words": [w['label'] for w in kg_words],
            "has_image": image is not None
        }

        response_text = ""
        recommendation = None
        
        recent_history = history[-6:]
        history_str = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in recent_history])
        
        progress_context = ""
        if user_progress:
            progress_context = (
                f"\nUSER ROADMAP PROGRESS:\n"
                f"- Rooms Completed: {user_progress.get('roomsCompleted', 0)}/{user_progress.get('totalRooms', 0)}\n"
                f"- Points: {user_progress.get('totalPoints', 0)}\n"
                f"- Streak: {user_progress.get('dayStreak', 0)} days\n"
                f"- Words Learned: {user_progress.get('wordsLearned', 0)}\n"
            )

        system_prompt_base = (
            f"You are a German tutor for a {user_level} student.\n"
            f"Previous Conversation:\n{history_str}\n"
            f"{kg_context}\n"
            f"{progress_context}\n"
            f"Current Message: '{message}'\n\n"
            f"PROFICIENCY LEVEL: {user_level}\n"
            f"ADAPTATION & BEHAVIOR RULES:\n"
            f"1. CONCISENESS: Be extremely minimal and to-the-point. Avoid fluff, greetings, or 'Happy to help'.\n"
            f"2. CURIOSITY APPRECIATION: If the user (A1) asks about advanced concepts (B1+), appreciate the curiosity briefly before explaining.\n"
            f"3. LEVEL-BASED EXPLANATIONS: Adapt complexity to {user_level}.\n\n"
            f"INSTRUCTIONS:\n"
            f"1. CRITICAL: Provide the shortest possible accurate answer unless the user asks for 'details' or a 'full explanation'.\n"
            f"2. MASTERY/DEEP DIVE: ONLY use ### EXPLANATION_CARD if the user explicitly requests 'full explanation' or 'details'.\n"
            f"3. FORMATTING SCHEMAS:\n"
            f"   - ### VOCAB_CARD\n"
            f'     {{"word": "GermanWord", "article": "der/die/das", "plural": "PluralForm", "translation": "English", "example": "Sentence.", "gender": "Masculine/..."}}\n'
            f"   - ### CORRECTION_CARD\n"
            f'     {{"incorrect": "error", "correct": "fix", "explanation": "why"}}\n'
            f"   - ### EXPLANATION_CARD\n"
            f'     {{"title": "Mastery: [Topic]", "sections": [{{"title": "Rule", "content": "Text", "icon": "bulb/layers/tag/palette/calendar"}}]}}\n'
        )
        

        # 0. Visual Vocabulary (Object Detection)
        if user_intent == UserIntentRequestType.IMAGE_ANALYSIS and image:
            debug_trace["step_2_routing"] = "Gemini Visual Object Detection"
            response_text = await ChatService.llm_reponse(
                f"{system_prompt_base}"
                f"ACTION: Identify prominent objects in this image.\n"
                f"For each object, provide the German word (with article and plural) and the English translation.\n"
                f"Return as a structured VOCAB_LIST.\n"
                f"Format: ### VOCAB_LIST\n"
                f"- [article] **word** (plural: ...) — English meaning. Example: ...\n",
                image
            )

        # 1. KG Vocabulary Request
        elif user_intent == UserIntentRequestType.VOCAB_REQUEST:
            debug_trace["step_2_routing"] = "KG Vocab Request (Gemini Entity Extraction)"

            # Step 1: check user intention
            kg_intent = await UserIntentRouter.extract_kg_intent(message)
            debug_trace["kg_intent"] = repr(kg_intent)

            if kg_intent.has_filters():
                # Step 2: Fetch data from KG
                bindings = ChatService.kg_service.get_subtopic_data(
                    subtopic=kg_intent.subtopic,
                    topic=kg_intent.topic,
                    level=kg_intent.level,
                )

                if bindings:
                    response_text = ChatService.format_kg_reponse(bindings, kg_intent)
                else:
                    # KG has no data -> strictly return no data instead of using LLM
                    searched = " / ".join(filter(None, [kg_intent.subtopic, kg_intent.topic, kg_intent.level]))
                    response_text = (
                        f"### No Vocabulary Found\n"
                        f"I couldn't find any words in the Knowledge Graph for **{searched}**.\n\n"
                        f"### Suggestions\n"
                        f"- Show me A1 vocabulary\n"
                        f"- Give me words for the *Küche*\n"
                        f"- Show me words about *Arbeitszimmer*"
                    )
            else:
                # Gemini couldn't extract entities — ask user to clarify
                response_text = (
                    "### Zu welchem Thema?\n"
                    "I'd love to show you vocabulary! Please tell me the topic, for example:\n\n"
                    "### Suggestions\n"
                    "- Give me words for the *Küche* (kitchen)\n"
                    "- Show me A1 vocabulary\n"
                    "- I want to learn words about *Arbeitszimmer*"
                )

        elif user_intent == UserIntentRequestType.EXPLAIN:
            debug_trace["step_2_routing"] = "Gemini LLM (Explain Mode)"
            response_text = await ChatService.llm_reponse(
                f"{system_prompt_base}"
                f"Explain concisely. Use ### EXPLANATION_CARD ONLY if the user asked for details/full explanation.",
                image
            )

        # 2. Advice/Translation (LLM)
        elif user_intent == UserIntentRequestType.ADVISE:
            debug_trace["step_2_routing"] = "Gemini LLM (Translation Mode)"
            response_text = await ChatService.llm_reponse(
                f"{system_prompt_base}"
                f"Provide a minimal and to-the-point translation/advice.",
                image
            )

        # 3. Practice (Mocked for now)
        elif user_intent == UserIntentRequestType.PRACTICE:
            debug_trace["step_2_routing"] = "Practice Module (Mock)"
            response_text = (
                "### Practice\n"
                "Would you like to practice vocabulary or take a quiz? (Möchtest du üben?)\n"
                "### Options\n"
                "- Vocabulary Quiz\n"
                "- Grammar Check"
            )
            recommendation = {"action": "start_quiz", "topic": "general"}

        # 4. Meta/Progress
        elif user_intent == UserIntentRequestType.PROGRESS:
            response_text = (
                "### Progress Update\n"
                "Level: A1 (Beginner)\n"
                "### Stats\n"
                "Words learned: 42"
            )

        # 5. Fallback / Chit-Chat
        else:
            debug_trace["step_2_routing"] = "Gemini LLM (Chit-Chat)"
            response_text = await ChatService.llm_reponse(
                f"{system_prompt_base}"
                f"MANDATORY FORMATTING RULES:\n"
                f"1. For SINGLE NOUNS: Use ### VOCAB_CARD.\n"
                f'   Format: {{"word": "GermanWord", "article": "der/die/das", "plural": "PluralForm", "translation": "English", "example": "Sentence.", "gender": "Masculine/..."}}\n'
                f"2. For ALL CONCEPT EXPLANATIONS, GRAMMAR RULES, or 'HOW TO SAY' SENTENCES: YOU MUST USE ### EXPLANATION_CARD.\n"
                f"   Format: ### EXPLANATION_CARD\n"
                f'   {{"title": "Mastery: [Topic]", "sections": [{{"title": "Rule/Point", "content": "Detailed text", "icon": "bulb/layers/tag/palette/calendar"}}, ...]}}\n'
                f"   (Icons: bulb=idea, layers=rule, tag=vocab, palette=visual, calendar=time/group).\n\n"
                f"3. For normal conversation, use '### Explanation' or just text if none of the above apply.\n\n"
                f"STYLE RULES:\n"
                f"1. BE CONCISE. No fluff. No 'I am your teacher' or 'Happy to help'. Just the answer.\n"
                f"2. ALWAYS end with a '### Suggestions' section containing 3 short, relevant follow-up questions the user might want to ask next.\n"
                f"Format:\n"
                f"### Suggestions\n"
                f"- [Option 1]\n"
                f"- [Option 2]\n"
                f"- [Option 3]",
                image
            )
        
        if not response_text:
            response_text = "Entschuldigung, ich habe gerade Verbindungsprobleme. Kannst du das wiederholen?"

        # --- UPDATE HISTORY ---
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": response_text})
        ChatService.user_sessions[client_id] = history

        return {
            "message": response_text,
            "type": "success",
            "recommendation": recommendation,
            "debug": debug_trace if settings.DEMO_MODE else None
        }

    @staticmethod
    async def llm_reponse(prompt: str, image: Optional[str] = None) -> str:
        if not settings.GEMINI_API_KEY:
             return "[Error: GEMINI_API_KEY not set]"
             
        try:
            import google.generativeai as genai
            import base64
            import time
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            content = [prompt]
            if image:
                # Handle base64 image
                if "," in image:
                    header, data = image.split(",")
                    mime_type = header.split(";")[0].split(":")[1]
                else:
                    data = image
                    mime_type = "image/jpeg" # fallback
                
                image_bytes = base64.b64decode(data)
                content.append({"mime_type": mime_type, "data": image_bytes})
            
            # Retry up to 3 times on rate limit (429)
            for attempt in range(3):
                try:
                    response = model.generate_content(content)
                    return response.text.strip()
                except Exception as retry_err:
                    err_str = str(retry_err)
                    if "429" in err_str or "ResourceExhausted" in err_str:
                        if attempt < 2:
                            wait = 30 * (attempt + 1)  # 30s, 60s
                            print(f"[ChatService] Rate limited, waiting {wait}s... (attempt {attempt+1})")
                            time.sleep(wait)
                        else:
                            return "⚠️ The AI is temporarily busy due to API rate limits. Please wait a moment and try again."
                    else:
                        raise
            
        except Exception as e:
            print(f"[ChatService] Gemini Error: {e}")
            return f"[Error: Could not connect to Gemini. check logs.]"

    @staticmethod
    def format_kg_reponse(bindings: list, kg_intent: "KGIntent") -> str:       
        seen = {}
        for v_binding in bindings:
            uri = v_binding.get("entry", {}).get("value", "")
            if uri not in seen:
                seen[uri] = {
                    "label":  v_binding.get("label",  {}).get("value", "?"),
                    "gender": v_binding.get("gender", {}).get("value", ""),     
                    "plural": v_binding.get("plural", {}).get("value", ""),
                    "ipa":    v_binding.get("ipa",    {}).get("value", ""),
                    "pos":    v_binding.get("pos",    {}).get("value", "").split("#")[-1],  
                    "translation": v_binding.get("translation", {}).get("value", ""),
                    "example": v_binding.get("example", {}).get("value", ""),
                }

        de_articles = {"masculine": "der", "feminine": "die", "neuter": "das"}

        # Build header
        filters = []
        if kg_intent.subtopic: filters.append(f"*{kg_intent.subtopic}*")
        if kg_intent.topic:    filters.append(f"*{kg_intent.topic}*")
        if kg_intent.level:    filters.append(f"Level {kg_intent.level}")
        header_str = " — ".join(filters) if filters else "Vocabulary"

        lines = [f"### VOCAB_LIST"]

        # Sort entries
        entries = sorted(seen.values(), key=lambda x: x["label"])
        
        for e in entries:
            de_article = de_articles.get(e["gender"], "-")
            label_str = e['label']
            
            plural_str = f" (plural: {e['plural']})" if e["plural"] else ""
            translation = e["translation"] or "translation not available"
            example_str = f". Example: {e['example']}" if e["example"] else ""
            
            lines.append(f"- [{de_article}] **{label_str}**{plural_str} — {translation}{example_str}")

        lines.append("")
        
        # Follow-up suggestions
        subtopic_label = kg_intent.subtopic or kg_intent.topic or "this topic"
        lines += [
            "### Suggestions",
            f"- Show me more words for {subtopic_label}",
            f"- Quiz me on {subtopic_label} vocabulary",
            f"- Explain the grammar rules for these words",
        ]

        return "\n".join(lines)
