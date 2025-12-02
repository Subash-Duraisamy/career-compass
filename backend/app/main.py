# main.py
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import extract_text_from_pdf_bytes, simple_skill_extraction
import numpy as np
import traceback

# Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        groq_client = None
        print("Failed to import groq client:", e)
else:
    groq_client = None

# Embeddings model (sentence-transformers)
USE_LOCAL_EMBEDDINGS = True
if USE_LOCAL_EMBEDDINGS:
    try:
        from sentence_transformers import SentenceTransformer
        embed_model = SentenceTransformer(os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))
    except Exception as e:
        embed_model = None
        print("Failed to load sentence-transformers:", e)
else:
    embed_model = None

app = FastAPI(title="Career Compass - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Request models
# --------------------
class JDIn(BaseModel):
    jd_text: str

class TextIn(BaseModel):
    text: str

class MatchIn(BaseModel):
    resume_text: str
    jd_text: str
    resume_skills: list = []
    jd_skills: list = []

# --------------------
# Groq LLM helpers
# --------------------
def call_groq(prompt: str, system: str = ""):
    """Call Groq chat completions wrapper, return raw content or None"""
    if not groq_client:
        print("Groq client not configured.")
        return None
    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        resp = groq_client.chat.completions.create(
            model="llama3-8b-instruct",
            messages=messages,
            temperature=0.15,
            max_tokens=1024
        )
        return resp.choices[0].message.content
    except Exception as e:
        print("Groq error:", e)
        traceback.print_exc()
        return None

# --------------------
# Existing endpoints
# --------------------
@app.post("/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_pdf_bytes(content)
    return {"text": text}

@app.post("/process-jd")
async def process_jd(payload: JDIn):
    jd = payload.jd_text.strip()
    return {"jd_text": jd}

# Keep previously added skill extraction (tries Groq first)
@app.post("/extract-skills")
async def extract_skills(payload: TextIn):
    text = payload.text.strip()
    # try Groq
    try:
        if groq_client:
            prompt = f"""
Extract all technical skills, programming languages, tools, frameworks,
cloud platforms, databases, soft skills and technologies mentioned in the text.
Respond ONLY with a comma-separated list (no extra commentary).

Text:
{text}
"""
            skills_text = call_groq(prompt)
            if skills_text:
                skills = [s.strip().lower() for s in skills_text.split(",") if s.strip()]
                return {"skills": sorted(set(skills)), "source": "groq-ai"}
    except Exception as e:
        print("extract-skills groq exception:", e)
    # fallback
    simple = simple_skill_extraction(text)
    return {"skills": simple, "source": "simple"}

# --------------------
# New: Gap Analysis endpoint using Groq
# --------------------
@app.post("/gap-analysis")
async def gap_analysis(payload: MatchIn):
    """
    Compares resume and JD and returns missing skills/keywords and a short professional explanation.
    """
    resume_text = payload.resume_text.strip()
    jd_text = payload.jd_text.strip()
    # Basic skill extraction (local) as fallback
    jd_skills = payload.jd_skills or simple_skill_extraction(jd_text)
    resume_skills = payload.resume_skills or simple_skill_extraction(resume_text)

    # Clean lists
    jd_skills_set = set([s.lower() for s in jd_skills])
    resume_skills_set = set([s.lower() for s in resume_skills])

    missing = sorted(list(jd_skills_set - resume_skills_set))

    # Use Groq to create a professional gap analysis text if available
    analysis_text = None
    if groq_client:
        try:
            prompt = f"""
You are a professional career advisor. Given a job description and a candidate resume text,
produce a short, clear "gap analysis" that lists:
1) specific technical skills and tools required by the job but missing from the resume,
2) soft-skills and experience keywords that are missing,
3) one or two concise suggestions the candidate can use to improve their resume quickly.

Provide the output as JSON with fields:
- missing_skills: [list of strings]
- missing_keywords: [list of strings]
- suggestions: [list of 1-2 short strings]

Job Description:
{jd_text}

Resume:
{resume_text}
"""
            resp = call_groq(prompt)
            if resp:
                # Try to parse a simple JSON from model output. If parsing fails, fallback to plain text.
                import json
                try:
                    # sometimes ML output contains trailing text; attempt to find first JSON block
                    start = resp.find("{")
                    end = resp.rfind("}") + 1
                    json_block = resp[start:end]
                    parsed = json.loads(json_block)
                    return {"analysis": parsed, "source": "groq-ai", "missing": missing}
                except Exception:
                    # fallback: return the raw text as analysis
                    analysis_text = resp
        except Exception as e:
            print("Groq gap analysis failed:", e)

    # Fallback simple analysis (no Groq)
    suggestions = []
    if missing:
        suggestions.append(f"Consider learning/adding: {', '.join(missing[:6])}.")
    else:
        suggestions.append("Good match on explicit skills — consider adding projects that show depth.")
    result = {
        "analysis": {
            "missing_skills": missing,
            "missing_keywords": [],
            "suggestions": suggestions
        },
        "source": "simple",
    }
    return result

# --------------------
# New: One-line recommendation endpoint (Groq)
# --------------------
@app.post("/suggestion")
async def suggestion(payload: MatchIn):
    resume_text = payload.resume_text.strip()
    jd_text = payload.jd_text.strip()
    if groq_client:
        prompt = f"""
You are a concise career coach. Read the job description and the candidate resume.
Provide ONE specific, actionable, two-line maximum suggestion the candidate can follow to improve
their chances for the given job. Start the output with 'Suggestion:'.

Job Description:
{jd_text}

Resume:
{resume_text}
"""
        resp = call_groq(prompt)
        if resp:
            # Return as plain text
            return {"suggestion": resp.strip(), "source": "groq-ai"}
    # fallback
    return {"suggestion": "Add a short bullet under projects that highlights related experience and keywords from the JD.", "source": "simple"}

# --------------------
# New: Embeddings-based match score
# --------------------
@app.post("/embeddings-match")
async def embeddings_match(payload: MatchIn):
    """
    Use sentence-transformers to compute embeddings for resume_text and jd_text
    and return a cosine-similarity-based score on a 0-10 scale.
    """
    resume = payload.resume_text.strip()
    jd = payload.jd_text.strip()
    if not resume or not jd:
        return {"score": 0.0, "explanation": "Resume or JD text is empty."}
    if embed_model is None:
        # fallback: token-overlap score (like earlier)
        resume_skills = set([s.lower() for s in (payload.resume_skills or [])])
        jd_skills = set([s.lower() for s in (payload.jd_skills or [])])
        if not jd_skills:
            return {"score": 0.0, "explanation": "No JD skills"}
        overlap = resume_skills.intersection(jd_skills)
        raw = len(overlap) / max(len(jd_skills), 1)
        score = round(float(raw) * 10, 1)
        return {"score": score, "explanation": "Fallback overlap-based score."}

    # Compute embeddings
    try:
        texts = [resume, jd]
        embs = embed_model.encode(texts, convert_to_numpy=True)
        a = embs[0]
        b = embs[1]
        # Cosine similarity
        dot = float(np.dot(a, b))
        na = float(np.linalg.norm(a))
        nb = float(np.linalg.norm(b))
        if na == 0 or nb == 0:
            sim = 0.0
        else:
            sim = dot / (na * nb)
        score = round(float(sim) * 10, 2)  # 0-10 scale
        return {"score": score, "similarity": float(sim)}
    except Exception as e:
        print("Embeddings error:", e)
        return {"score": 0.0, "explanation": "Embedding computation failed."}

# --------------------
# Match score endpoint (kept for compatibility)
# --------------------
@app.post("/match-score")
async def match_score(payload: dict):
    resume_skills = set([s.lower() for s in payload.get("resume_skills", [])])
    jd_skills = set([s.lower() for s in payload.get("jd_skills", [])])

    if not jd_skills:
        return {"score": 0.0, "explanation": "No skills found in JD"}

    overlap = resume_skills.intersection(jd_skills)
    raw = len(overlap) / max(len(jd_skills), 1)
    score = round(float(raw) * 10, 1)  # 0-10 scale
    explanation = {
        "matched": sorted(list(overlap)),
        "missing": sorted(list(jd_skills - resume_skills))
    }
    return {"score": score, "explanation": explanation}
