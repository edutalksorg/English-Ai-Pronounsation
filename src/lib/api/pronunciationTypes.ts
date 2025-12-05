/**
 * TypeScript interfaces for Pronunciation API
 * Matches Swagger schemas exactly as defined
 */

// ============ List Paragraphs Response ============
export interface Paragraph {
  id: string;
  title: string;
  text: string;
  difficulty: string;
  language: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  phoneticTranscription: string;
  createdAt: string;
}

export interface ParagraphsListResponse {
  messages: string[];
  errors: string[];
  succeeded: boolean;
  statusCode: number;
  data: Paragraph[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============ Single Paragraph Response ============
export interface SingleParagraphResponse {
  id: string;
  title: string;
  text: string;
  difficulty: string;
  language: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  phoneticTranscription: string;
  createdAt: string;
}

// ============ Create Paragraph Request/Response ============
export interface CreateParagraphRequest {
  title: string;
  text: string;
  difficulty: string;
  language: string;
  phoneticTranscription: string;
}

// Create returns plain text (string), handled as-is

// ============ Update Paragraph Request/Response ============
export interface UpdateParagraphRequest {
  id: string;
  title: string;
  text: string;
  phoneticTranscription: string;
  isActive: boolean;
}

// Update returns 204 No Content

// ============ Assessment/Phoneme/Syllable Structure ============
export interface Phoneme {
  text: string;
  accuracyScore: number;
}

export interface Syllable {
  text: string;
  accuracyScore: number;
  phonemes: Phoneme[];
}

export interface WordLevelFeedback {
  word: string;
  accuracyScore: number;
  errorType: string;
  syllables: Syllable[];
}

// ============ Assessment History Response ============
export interface AssessmentAttempt {
  id: string;
  paragraphId: string;
  paragraphTitle: string;
  audioFileUrl: string;
  audioDurationSeconds: number;
  overallScore: number;
  pronunciationAccuracy: number;
  fluencyScore: number;
  completenessScore: number;
  wordLevelFeedback: WordLevelFeedback[];
  processingStatus: string;
  errorMessage: string;
  submittedAt: string;
  assessedAt: string;
}

export interface AssessmentHistoryResponse {
  messages: string[];
  errors: string[];
  succeeded: boolean;
  statusCode: number;
  data: AssessmentAttempt[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============ Attempt Detail Response ============
export interface AttemptDetailResponse {
  id: string;
  paragraphId: string;
  paragraphTitle: string;
  audioFileUrl: string;
  audioDurationSeconds: number;
  overallScore: number;
  pronunciationAccuracy: number;
  fluencyScore: number;
  completenessScore: number;
  wordLevelFeedback: WordLevelFeedback[];
  processingStatus: string;
  errorMessage: string;
  submittedAt: string;
  assessedAt: string;
}

// ============ Assess Request/Response ============
export interface AssessRequest {
  paragraphId: string;
  audioFile: Blob;
}

// Assess returns plain text (string) feedback, handled as-is

// ============ API Response Wrapper (for errors) ============
export interface ApiResponse<T> {
  messages: string[];
  errors: string[];
  succeeded: boolean;
  statusCode: number;
  data: T;
}

// ============ Generic Paginated Response ============
export interface PaginatedResponse<T> {
  messages: string[];
  errors: string[];
  succeeded: boolean;
  statusCode: number;
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
