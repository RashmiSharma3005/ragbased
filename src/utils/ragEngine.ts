import { DocumentChunk, DocumentItem, RetrievalConfig, RetrievedResult } from "../types";

export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Standard approximation: ~4 characters per token in English
  return Math.ceil(text.trim().length / 4);
}

/**
 * Splits documents into indexable chunks based on selected strategy
 */
export function chunkDocuments(
  documents: DocumentItem[],
  config: RetrievalConfig
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  for (const doc of documents) {
    if (!doc.enabled) continue;

    for (const page of doc.pages) {
      const pageText = page.content.trim();
      if (!pageText) continue;

      if (config.chunkStrategy === "page") {
        // Entire page as a single chunk
        chunks.push({
          id: `${doc.id}-p${page.pageNumber}-chunk0`,
          docId: doc.id,
          docTitle: doc.title,
          filename: doc.filename,
          pageNumber: page.pageNumber,
          text: pageText,
          charCount: pageText.length,
          estimatedTokens: estimateTokens(pageText),
        });
      } else if (config.chunkStrategy === "paragraph") {
        // Split by paragraphs (double newlines or logical sections)
        const paragraphs = pageText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 20);

        if (paragraphs.length === 0) {
          chunks.push({
            id: `${doc.id}-p${page.pageNumber}-chunk0`,
            docId: doc.id,
            docTitle: doc.title,
            filename: doc.filename,
            pageNumber: page.pageNumber,
            text: pageText,
            charCount: pageText.length,
            estimatedTokens: estimateTokens(pageText),
          });
        } else {
          paragraphs.forEach((para, idx) => {
            chunks.push({
              id: `${doc.id}-p${page.pageNumber}-chunk${idx}`,
              docId: doc.id,
              docTitle: doc.title,
              filename: doc.filename,
              pageNumber: page.pageNumber,
              text: para,
              charCount: para.length,
              estimatedTokens: estimateTokens(para),
            });
          });
        }
      } else {
        // Fixed sliding window
        const words = pageText.split(/\s+/);
        const chunkSizeWords = Math.floor(config.chunkSize / 1.3); // ~words
        const overlapWords = Math.floor(config.chunkOverlap / 1.3);

        let start = 0;
        let chunkIndex = 0;

        while (start < words.length) {
          const end = Math.min(start + chunkSizeWords, words.length);
          const chunkWords = words.slice(start, end);
          const text = chunkWords.join(" ");

          chunks.push({
            id: `${doc.id}-p${page.pageNumber}-c${chunkIndex}`,
            docId: doc.id,
            docTitle: doc.title,
            filename: doc.filename,
            pageNumber: page.pageNumber,
            text,
            charCount: text.length,
            estimatedTokens: estimateTokens(text),
          });

          if (end >= words.length) break;
          start += Math.max(1, chunkSizeWords - overlapWords);
          chunkIndex++;
        }
      }
    }
  }

  return chunks;
}

// Stop words to filter out common functional words
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s$%.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function extractBiGrams(tokens: string[]): string[] {
  const biGrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    biGrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return biGrams;
}

/**
 * High-precision Hybrid Retrieval:
 * Combines BM25-style term saturation, IDF weighting, bi-gram phrase matches,
 * numeric exact matches ($4.82B, 99.995%, 40mg, etc.), and document title matching.
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  config: RetrievalConfig
): RetrievedResult[] {
  if (!query.trim() || chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  const queryBiGrams = extractBiGrams(queryTokens);
  const queryLower = query.toLowerCase();

  // Extract explicit numbers and key symbols ($1,500, 40mg, Q4, etc.)
  const numericPattern = /\b(?:\$?\d+(?:\.\d+)?[%BbkKmM]?|q[1-4]|fy\d{2,4})\b/gi;
  const queryNumbers = (query.match(numericPattern) || []).map((s) => s.toLowerCase());

  // Calculate Document Frequencies (DF) for IDF calculation
  const docFreq: Record<string, number> = {};
  for (const chunk of chunks) {
    const chunkTokensSet = new Set(tokenize(chunk.text + " " + chunk.docTitle));
    for (const token of chunkTokensSet) {
      docFreq[token] = (docFreq[token] || 0) + 1;
    }
  }

  const N = chunks.length;
  const results: RetrievedResult[] = [];

  for (const chunk of chunks) {
    const chunkTextLower = chunk.text.toLowerCase();
    const chunkTitleLower = chunk.docTitle.toLowerCase();
    const combinedText = `${chunkTitleLower} ${chunkTextLower}`;
    const chunkTokens = tokenize(combinedText);
    const chunkTokenCount = chunkTokens.length || 1;

    let score = 0;
    const matchedTerms: string[] = [];

    // 1. BM25-style token frequency and IDF weighting
    const tokenCounts: Record<string, number> = {};
    for (const t of chunkTokens) {
      tokenCounts[t] = (tokenCounts[t] || 0) + 1;
    }

    const k1 = 1.2;
    const b = 0.75;
    const avgLen = 120;

    for (const qToken of queryTokens) {
      const tf = tokenCounts[qToken] || 0;
      if (tf > 0) {
        matchedTerms.push(qToken);
        const df = docFreq[qToken] || 1;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (chunkTokenCount / avgLen)));
        score += Math.max(0.2, idf) * tfNorm;
      }
    }

    // 2. Bi-gram phrase match bonus
    for (const biGram of queryBiGrams) {
      if (chunkTextLower.includes(biGram)) {
        score += 2.5;
        if (!matchedTerms.includes(biGram)) matchedTerms.push(biGram);
      }
    }

    // 3. Exact query substring / clause match bonus
    if (queryLower.length > 8 && chunkTextLower.includes(queryLower)) {
      score += 4.0;
    }

    // 4. Exact number / statistic match bonus
    for (const num of queryNumbers) {
      if (chunkTextLower.includes(num)) {
        score += 3.0;
        if (!matchedTerms.includes(num)) matchedTerms.push(num);
      }
    }

    // 5. Title affinity bonus (if query references document context)
    for (const qToken of queryTokens) {
      if (chunkTitleLower.includes(qToken)) {
        score += 1.2;
      }
    }

    if (score > 0) {
      // Normalize score into a friendly 0.0 - 1.0 range
      const normalizedScore = Math.min(0.99, Math.max(0.1, score / 12));
      if (normalizedScore >= config.minScore) {
        results.push({
          chunk,
          score: Math.round(normalizedScore * 100) / 100,
          matchedTerms: Array.from(new Set(matchedTerms)),
        });
      }
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  // Return Top-K
  return results.slice(0, config.topK);
}

/**
 * Builds the exact RETRIEVED CONTEXT format strictly mandated by DocuMind AI
 */
export function buildRetrievedContextPrompt(retrieved: RetrievedResult[]): string {
  if (!retrieved || retrieved.length === 0) {
    return "No relevant document chunks retrieved.";
  }

  return retrieved
    .map((r) => {
      const sourceHeader = `[Source: ${r.chunk.filename}, Page ${r.chunk.pageNumber}]`;
      return `${sourceHeader}\n${r.chunk.text.trim()}`;
    })
    .join("\n\n");
}

/**
 * Helper to build the complete input structure for the DocuMind model
 */
export function formatFullPromptPayload(contextString: string, query: string): string {
  return `RETRIEVED CONTEXT:
---
${contextString}
---

USER QUERY:
${query.trim()}`;
}
