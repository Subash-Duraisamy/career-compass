# utils.py
import io
from PyPDF2 import PdfReader
import re

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        # fallback naive decode
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except:
            return ""
            
def simple_skill_extraction(text: str):
    """
    Simple heuristic: look for known skill keywords from a small list.
    Later: replace with LLM or embeddings + NER.
    """
    SKILLS = [
        "python","java","c++","c","javascript","react","node","express","django",
        "flask","fastapi","sql","mysql","postgres","mongodb","aws","docker","kubernetes",
        "git","html","css","tensorflow","pytorch","nlp","machine learning","data science",
        "docker","linux","aws","azure","gcp","rest api","api","redux","typescript"
    ]
    text_lower = text.lower()
    found = set()
    for s in SKILLS:
        if s in text_lower:
            found.add(s)
    # also simple regex to detect "skills:" list
    m = re.search(r"skills[:\-\n]+(.+)", text_lower[:4000])
    if m:
        extra = re.findall(r"[a-zA-Z\+\#]{2,}", m.group(1))
        for e in extra:
            found.add(e)
    return sorted(found)
