import { pipeline } from "@xenova/transformers";

// ------------------------------
// In-memory Vector Store
// ------------------------------
const vectorDB = []; // { text, embedding }

// ------------------------------
// Embedding Model Loader
// ------------------------------
let embedder = null;
async function getEmbedder() {
  if (!embedder) {
    console.log("📌 Loading MiniLM embedder...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

// ------------------------------
// Convert Text → Vector
// ------------------------------
export async function embedText(text) {
  const model = await getEmbedder();
  const out = await model(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

// ------------------------------
// Split Resume into Chunks
// ------------------------------
function chunkText(text, size = 150) {
  const words = text.split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(" "));
  }

  return chunks;
}

// ------------------------------
// Store Resume Chunks
// ------------------------------
export async function storeResumeChunks(resumeText) {
  console.log("📌 Storing resume chunks...");

  const chunks = chunkText(resumeText);

  for (let chunk of chunks) {
    const embedding = await embedText(chunk);
    vectorDB.push({ text: chunk, embedding });
  }

  return chunks.length;
}

// ------------------------------
// Cosine Similarity
// ------------------------------
function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ------------------------------
// Search Relevant Chunks (RAG)
// ------------------------------
export async function searchResume(query, topK = 5) {
  const queryVector = await embedText(query);

  const scored = vectorDB.map((item) => ({
    text: item.text,
    score: cosineSim(queryVector, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((s) => s.text);
}
