/**
 * Pronunciation API Service
 * Handles all API calls with Bearer token auth and correct schemas
 */

import {
  ParagraphsListResponse,
  SingleParagraphResponse,
  CreateParagraphRequest,
  UpdateParagraphRequest,
  AssessmentHistoryResponse,
  AttemptDetailResponse,
} from './pronunciationTypes';

import axiosClient from '@/lib/api/types/axiosClient';

class PronunciationApiService {
  private client = axiosClient;

  /**
   * List all paragraphs with pagination and optional filters
   */
  async listParagraphs(
    page: number = 1,
    pageSize: number = 10,
    difficulty?: string,
    language?: string
  ): Promise<ParagraphsListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (difficulty) params.append('difficulty', difficulty);
    if (language) params.append('language', language);

    const response = await this.client.get<ParagraphsListResponse>(
      `/pronunciation/paragraphs?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single paragraph by ID
   */
  async getParagraph(id: string): Promise<SingleParagraphResponse> {
    const response = await this.client.get<SingleParagraphResponse>(
      `/pronunciation/paragraphs/${id}`
    );
    return response.data;
  }

  /**
   * Create a new paragraph (admin)
   * Returns plain text ID string
   */
  async createParagraph(request: CreateParagraphRequest): Promise<string> {
    const response = await this.client.post<string>(
      '/pronunciation/paragraphs',
      request
    );
    return response.data;
  }

  /**
   * Update an existing paragraph (admin)
   * Returns 204 No Content
   */
  async updateParagraph(request: UpdateParagraphRequest): Promise<void> {
    await this.client.put(
      `/pronunciation/paragraphs/${request.id}`,
      request
    );
  }

  /**
   * Delete a paragraph (admin)
   * Returns 204 No Content
   */
  async deleteParagraph(id: string): Promise<void> {
    await this.client.delete(`/pronunciation/paragraphs/${id}`);
  }

  /**
   * Submit audio for assessment
   * Sends multipart/form-data with ParagraphId and AudioFile
   * Returns plain text feedback string
   */
  async assess(paragraphId: string, audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('ParagraphId', paragraphId);
    formData.append('AudioFile', audioBlob, 'audio.webm');

    const response = await this.client.post<string>(
      '/pronunciation/assess',
      formData
    );
    return response.data;
  }

  /**
   * Get assessment history (paginated)
   */
  async getHistory(
    page: number = 1,
    pageSize: number = 10
  ): Promise<AssessmentHistoryResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await this.client.get<AssessmentHistoryResponse>(
      `/pronunciation/history?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get a specific attempt detail by ID
   */
  async getAttempt(id: string): Promise<AttemptDetailResponse> {
    const response = await this.client.get<AttemptDetailResponse>(
      `/pronunciation/attempts/${id}`
    );
    return response.data;
  }
}

export const pronunciationApi = new PronunciationApiService();
