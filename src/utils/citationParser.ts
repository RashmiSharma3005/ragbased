import { CitationMeta, DocumentChunk, RetrievedResult } from "../types";

export const CITATION_REGEX = /\[Source:\s*([^,\]]+),\s*Page\s*([^\]]+)\]/g;

export const ABSENCE_OF_INFO_PHRASE =
  "I'm sorry, but the provided documents do not contain enough information to answer this question.";

export function extractCitations(text: string, chunks?: DocumentChunk[]): CitationMeta[] {
  const citations: CitationMeta[] = [];
  const matches = Array.from(text.matchAll(CITATION_REGEX));

  for (const match of matches) {
    const raw = match[0];
    const docTitleOrFile = match[1].trim();
    const pageNumber = match[2].trim();

    // Try to find matching chunk
    const matchedChunk = chunks?.find(
      (c) =>
        (c.filename.toLowerCase() === docTitleOrFile.toLowerCase() ||
          c.docTitle.toLowerCase().includes(docTitleOrFile.toLowerCase())) &&
        c.pageNumber.toString() === pageNumber
    );

    citations.push({
      raw,
      docTitle: docTitleOrFile,
      pageNumber,
      chunkId: matchedChunk?.id,
      snippet: matchedChunk?.text.slice(0, 140),
    });
  }

  // Deduplicate
  const seen = new Set<string>();
  return citations.filter((c) => {
    const key = `${c.docTitle}-${c.pageNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isAbsenceResponse(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase().replace(/['"]/g, "");
  const target = ABSENCE_OF_INFO_PHRASE.toLowerCase().replace(/['"]/g, "");
  return clean.includes(target) || clean.includes("do not contain enough information to answer");
}

export function detectConflictResolution(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const conflictKeywords = [
    "discrepancy",
    "contradict",
    "conflict",
    "differs",
    "whereas",
    "supersedes",
    "overrides",
    "amended",
    "inconsistent",
    "differing values",
    "however, according to",
  ];
  return conflictKeywords.some((kw) => lower.includes(kw));
}

export interface GroundingAudit {
  citationCount: number;
  verifiedCitations: number;
  unverifiedCitations: number;
  isStrictlyGrounded: boolean;
  isAbsenceOfInfo: boolean;
  hasConflictResolution: boolean;
  citations: CitationMeta[];
}

export function auditAnswerGrounding(
  answer: string,
  retrievedChunks: RetrievedResult[]
): GroundingAudit {
  const allChunks = retrievedChunks.map((r) => r.chunk);
  const citations = extractCitations(answer, allChunks);
  const isAbsence = isAbsenceResponse(answer);
  const hasConflict = detectConflictResolution(answer);

  let verified = 0;
  let unverified = 0;

  for (const cit of citations) {
    const isPresent = allChunks.some((c) => {
      const matchFile =
        c.filename.toLowerCase() === cit.docTitle.toLowerCase() ||
        c.docTitle.toLowerCase().includes(cit.docTitle.toLowerCase());
      const matchPage = c.pageNumber.toString() === cit.pageNumber.toString();
      return matchFile && matchPage;
    });

    if (isPresent) {
      verified++;
    } else {
      unverified++;
    }
  }

  return {
    citationCount: citations.length,
    verifiedCitations: verified,
    unverifiedCitations: unverified,
    isStrictlyGrounded: citations.length > 0 && unverified === 0,
    isAbsenceOfInfo: isAbsence,
    hasConflictResolution: hasConflict,
    citations,
  };
}
