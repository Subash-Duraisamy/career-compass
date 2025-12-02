# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import extract_text_from_pdf_bytes, simple_skill_extraction
import numpy as np
from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
app = FastAPI(title="Career Compass - Backend (Starter)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JDIn(BaseModel):
    jd_text: str

class TextIn(BaseModel):
    text: str

@app.post("/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_pdf_bytes(content)
    return {"text": text}

@app.post("/process-jd")
async def process_jd(payload: JDIn):
    # For now, just return cleaned JD text
    jd = payload.jd_text.strip()
    return {"jd_text": jd}

@app.post("/extract-skills")
async def extract_skills(payload: TextIn):
    text = payload.text.strip()

    # First try Groq AI
    ai_skills = extract_skills_ai(text)
    if ai_skills:
        return {"skills": ai_skills, "source": "groq-ai"}

    # Fallback: simple keyword matching
    simple = simple_skill_extraction(text)
    return {"skills": simple, "source": "simple"}


@app.post("/match-score")
async def match_score(payload: dict):
    """
    payload = {
      "resume_skills": [...],
      "jd_skills": [...]
    }
    This is a simple overlap-based score (placeholder).
    Replace with embeddings-based cosine similarity for production.
    """
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

def extract_skills_ai(text: str):
    prompt = f"""
    Extract all technical skills, programming languages, tools, frameworks,
    cloud platforms, databases, soft skills, and technologies explicitly
    mentioned in the following text.

    Respond ONLY with a comma-separated list.

    Text:
    {text}
    """

    try:
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        skills_text = response.choices[0].message.content

        skills = [s.strip().lower() for s in skills_text.split(",") if s.strip()]
        return sorted(set(skills))

    except Exception as e:
        print("Groq error:", e)
        return []

