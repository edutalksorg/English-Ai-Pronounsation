// src/lib/api/pronunciation.ts
// Pronunciation API helper module — exports several names for compatibility
import api from "./axiosClient";

export type Paragraph = {
  id: string;
  title?: string;
  text?: string;
  difficulty?: string;
  language?: string;
  wordCount?: number;
  estimatedDurationSeconds?: number;
  phoneticTranscription?: string;
  createdAt?: string;
};

export type PronHistoryItem = {
  id: string;
  paragraphId?: string;
  paragraphTitle?: string;
  audioFileUrl?: string;
  audioDurationSeconds?: number;
  overallScore?: number;
  pronunciationAccuracy?: number;
  fluencyScore?: number;
  completenessScore?: number;
  wordLevelFeedback?: any[];
  processingStatus?: string;
  errorMessage?: string | null;
  submittedAt?: string;
  assessedAt?: string | null;
};

export type PaginatedResponse<T> = {
  messages?: string[];
  errors?: string[];
  succeeded?: boolean;
  statusCode?: number;
  data: T[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

/** GET /api/v1/pronunciation/paragraphs */
export async function listParagraphs(params?: {
  difficulty?: string;
  language?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  const resp = await api.get<PaginatedResponse<Paragraph>>("/api/v1/pronunciation/paragraphs", {
    params,
  });
  return resp.data;
}

/** GET /api/v1/pronunciation/paragraphs/{id} */
export async function getParagraph(id: string) {
  const resp = await api.get<{ messages?: string[]; data?: Paragraph }>(
    `/api/v1/pronunciation/paragraphs/${encodeURIComponent(id)}`
  );
  return resp.data;
}

/** POST /api/v1/pronunciation/paragraphs - create (admin/instructor) */
export async function createParagraph(payload: {
  title: string;
  text: string;
  difficulty?: string;
  language?: string;
  phoneticTranscription?: string;
}) {
  const resp = await api.post<string>("/api/v1/pronunciation/paragraphs", payload);
  return resp.data;
}

/** PUT /api/v1/pronunciation/paragraphs/{id} */
export async function updateParagraph(id: string, payload: Partial<Paragraph>) {
  const resp = await api.put<void>(`/api/v1/pronunciation/paragraphs/${encodeURIComponent(id)}`, payload);
  return resp.data;
}

/** DELETE /api/v1/pronunciation/paragraphs/{id} */
export async function deleteParagraph(id: string) {
  const resp = await api.delete<void>(`/api/v1/pronunciation/paragraphs/${encodeURIComponent(id)}`);
  return resp.data;
}

/**
 * POST /api/v1/pronunciation/assess
 * Accepts FormData with:
 *  - ParagraphId (string)
 *  - AudioFile (binary)
 *
 * We expose two helpers:
 *  - assessForm(form: FormData)         <-- name your UI originally called
 *  - assess(paragraphId, file)         <-- convenience helper
 *
 * Do NOT set Content-Type manually.
 */
export async function assessForm(form: FormData) {
  const resp = await api.post("/api/v1/pronunciation/assess", form);
  return resp.data;
}

export async function assess(paragraphId: string, file: Blob | File) {
  const fd = new FormData();
  fd.append("ParagraphId", paragraphId);
  fd.append("AudioFile", file, (file as File)?.name ?? "recording.webm");
  const resp = await api.post("/api/v1/pronunciation/assess", fd);
  return resp.data;
}

/** GET /api/v1/pronunciation/history */
export async function getHistory(pageNumber = 1, pageSize = 10) {
  const resp = await api.get<PaginatedResponse<PronHistoryItem>>("/api/v1/pronunciation/history", {
    params: { pageNumber, pageSize },
  });
  return resp.data;
}

/** GET /api/v1/pronunciation/attempts/{id} */
export async function getAttempt(id: string) {
  const resp = await api.get<{ messages?: string[]; data?: PronHistoryItem }>(
    `/api/v1/pronunciation/attempts/${encodeURIComponent(id)}`
  );
  return resp.data;
}

/** default export object for convenience */
const PronunciationAPI = {
  listParagraphs,
  getParagraph,
  createParagraph,
  updateParagraph,
  deleteParagraph,
  assessForm,   // <--- matches component calling assessForm()
  assess,       // <--- convenience
  getHistory,
  getAttempt,
};

export default PronunciationAPI;
