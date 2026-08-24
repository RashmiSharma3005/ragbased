import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// System instructions strictly following DocuMind AI specification
const DOCUMIND_SYSTEM_INSTRUCTION = `You are DocuMind AI, a high-precision retrieval-augmented generation (RAG) assistant. Your core purpose is to deliver accurate, context-grounded answers based strictly on retrieved document snippets provided by the user system.

### OPERATIONAL RULES:
1. STRICT GROUNDING: Rely ONLY on the information provided in the "RETRIEVED CONTEXT" section. Do not infer, extrapolate, or bring in external training knowledge unless explicitly requested.
2. ABSENCE OF INFORMATION: If the provided context does not contain enough evidence to answer the user query, state clearly:
   "I'm sorry, but the provided documents do not contain enough information to answer this question."
3. CITATIONS & SOURCES: For every claim, stat, or main point in your answer, append an inline citation referencing the document title and page/section number using the format: [Source: Document Name, Page X].
4. CONFLICT RESOLUTION: If two context chunks contradict each other, explicitly note the discrepancy in your response and cite both sources.
5. CONCISE FORMATTING: Structure your answers using markdown (headers, bold text, bullet points) to make them scannable and easy to read.

### EXPECTED INPUT STRUCTURE:
The input will be formatted as follows:

RETRIEVED CONTEXT:
---
[Source: Filename_A.pdf, Page 3]
<Chunk text here>

[Source: Filename_B.pdf, Page 12]
<Chunk text here>
---

USER QUERY:
<User question here>

### OUTPUT FORMAT:
Provide a direct summary, followed by a structured bulleted breakdown, ensuring inline citations are included.`;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    name: "DocuMind AI Server"
  });
});

// DocuMind RAG Query endpoint
app.post("/api/documind/query", async (req, res) => {
  try {
    const { retrievedContext, userQuery, temperature = 0.1 } = req.body;

    if (!userQuery || typeof userQuery !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'userQuery'" });
    }

    const promptPayload = `RETRIEVED CONTEXT:
---
${retrievedContext || "No relevant document chunks retrieved."}
---

USER QUERY:
${userQuery.trim()}`;

    // If Gemini API Key is available, use GoogleGenAI
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptPayload,
        config: {
          systemInstruction: DOCUMIND_SYSTEM_INSTRUCTION,
          temperature: Number(temperature) || 0.1,
          topP: 0.95,
        },
      });

      const answer = response.text || "";
      return res.json({
        answer,
        model: "gemini-3.7-flash",
        promptPayload,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Fallback deterministic local RAG generator when API key is not configured
      const fallbackAnswer = generateDeterministicRAGResponse(retrievedContext || "", userQuery);
      return res.json({
        answer: fallbackAnswer,
        model: "documind-local-deterministic-engine",
        promptPayload,
        timestamp: new Date().toISOString(),
        note: "Generated using built-in deterministic grounding engine (API key not detected)."
      });
    }
  } catch (error: any) {
    console.error("Error generating DocuMind response:", error);
    res.status(500).json({
      error: error.message || "Failed to generate DocuMind RAG response",
    });
  }
});

// Deterministic grounding fallback engine
function generateDeterministicRAGResponse(context: string, query: string): string {
  const queryLower = query.toLowerCase();
  
  if (!context || context.trim() === "" || context.includes("No relevant document chunks retrieved.")) {
    return "I'm sorry, but the provided documents do not contain enough information to answer this question.";
  }

  // Parse chunks from the context format
  const chunkRegex = /\[Source:\s*([^,]+),\s*Page\s*([^\]]+)\]\n([\s\S]*?)(?=(?:\[Source:|$))/g;
  let match;
  const chunks: Array<{ source: string; page: string; text: string }> = [];
  
  while ((match = chunkRegex.exec(context)) !== null) {
    chunks.push({
      source: match[1].trim(),
      page: match[2].trim(),
      text: match[3].trim(),
    });
  }

  if (chunks.length === 0) {
    return "I'm sorry, but the provided documents do not contain enough information to answer this question.";
  }

  // Check relevance of chunks to query
  const queryWords = queryLower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !["what", "when", "where", "which", "how", "does", "have", "with", "this", "that", "from", "about"].includes(w));

  const relevantChunks = chunks.filter(c => {
    const textLower = c.text.toLowerCase();
    return queryWords.some(word => textLower.includes(word));
  });

  if (relevantChunks.length === 0) {
    return "I'm sorry, but the provided documents do not contain enough information to answer this question.";
  }

  // Extract sentences with citations
  const findings: string[] = [];
  for (const chunk of relevantChunks) {
    const sentences = chunk.text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
    for (const sentence of sentences) {
      const sentLower = sentence.toLowerCase();
      if (queryWords.some(w => sentLower.includes(w))) {
        findings.push(`${sentence.trim()} [Source: ${chunk.source}, Page ${chunk.page}]`);
      }
    }
  }

  if (findings.length === 0) {
    return "I'm sorry, but the provided documents do not contain enough information to answer this question.";
  }

  const summary = `Based on the provided documents, the retrieved context provides specific verified information regarding **${query.replace(/[?]/g, "")}**.`;
  const bullets = findings.slice(0, 5).map(f => `- ${f}`).join("\n");

  return `### Summary
${summary}

### Key Findings & Evidence
${bullets}`;
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DocuMind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
