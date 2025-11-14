import axiosClient from "./axiosClient";

/**
 * Daily Topics API client aligned with the backend contract shared in the docs.
 * All helpers normalize request params (camelCase -> PascalCase) and return
 * unwrapped data objects so consumers can work with plain arrays/objects.
 */

// ---------- Types ----------
export type TopicDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface TopicDto {
  topicId?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string | { id?: string; name?: string; [key: string]: any };
  categoryId?: string;
  categoryName?: string;
  /** Pre-computed friendly label for UI badges */
  categoryLabel?: string;
  difficulty?: TopicDifficulty | string;
  discussionPoints?: string[];
  vocabularyList?: string[];
  estimatedDurationMinutes?: number;
  /**
   * Human-readable duration (e.g. "15 min"). Guaranteed to be a string for the UI.
   */
  durationLabel?: string;
  author?: string;
  status?: "Draft" | "Published" | "Archived";
  isFeatured?: boolean;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface TopicRequest {
  title: string;
  description: string;
  categoryId: string;
  difficulty: TopicDifficulty;
  discussionPoints: string[];
  vocabularyList: string[];
  estimatedDurationMinutes: number;
  author?: string;
}

export interface UpdateTopicRequest extends TopicRequest {
  topicId: string;
}

export interface UpdateTopicStatusRequest {
  topicId: string;
  status: "Draft" | "Published" | "Archived";
}

export interface ListTopicsParams {
  categoryId?: string;
  difficulty?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  /** Allow direct API casing for backwards compatibility */
  CategoryId?: string;
  Difficulty?: string;
  SearchTerm?: string;
  PageNumber?: number;
  PageSize?: number;
}

const normalizeListParams = (params?: ListTopicsParams) => {
  if (!params) return undefined;
  return {
    CategoryId: params.CategoryId ?? params.categoryId,
    Difficulty: params.Difficulty ?? params.difficulty,
    SearchTerm: params.SearchTerm ?? params.searchTerm,
    PageNumber: params.PageNumber ?? params.pageNumber,
    PageSize: params.PageSize ?? params.pageSize,
  };
};

const coerceTopicArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (payload?.data && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
};

const resolveCategoryLabel = (topic: any): { label: string; id?: string } => {
  const categoryInput = topic.category ?? topic.categoryInfo ?? topic.categoryDetails;
  const id =
    topic.categoryId ??
    (typeof categoryInput === "object" && categoryInput !== null ? categoryInput.id ?? categoryInput.categoryId : undefined);

  const label =
    (typeof topic.category === "string" && topic.category) ||
    (typeof topic.categoryName === "string" && topic.categoryName) ||
    (typeof categoryInput === "object" && categoryInput
      ? categoryInput.name ?? categoryInput.title ?? categoryInput.displayName ?? categoryInput.id
      : undefined) ||
    (typeof topic.categoryId === "string" ? topic.categoryId : undefined) ||
    "General";

  return { label, id };
};

const resolveDurationLabel = (topic: any): { minutes?: number; label: string } => {
  const minutes =
    typeof topic.estimatedDurationMinutes === "number"
      ? topic.estimatedDurationMinutes
      : typeof topic.estimatedDuration === "number"
        ? topic.estimatedDuration
        : undefined;

  if (typeof topic.duration === "string" && topic.duration.trim().length > 0) {
    return { minutes, label: topic.duration };
  }

  if (typeof minutes === "number") {
    return { minutes, label: `${minutes} min` };
  }

  return { minutes, label: "—" };
};

const normalizeTopic = (topic: any): TopicDto => {
  const { label: categoryLabel, id: categoryId } = resolveCategoryLabel(topic);
  const { label: durationLabel, minutes } = resolveDurationLabel(topic);

  const normalizedId =
    topic.id ?? topic.topicId ?? topic.topic_id ?? topic.topicGuid ?? topic.topicIdString ?? topic.topicUuid ?? undefined;

  return {
    ...topic,
    id: normalizedId,
    topicId: topic.topicId ?? normalizedId,
    title: topic.title ?? topic.name ?? "Untitled topic",
    description: topic.description ?? topic.summary ?? "",
    categoryLabel,
    categoryId: categoryId ?? topic.categoryId,
    categoryName: categoryLabel,
    difficulty: topic.difficulty ?? topic.level ?? "Unknown",
    estimatedDurationMinutes: minutes ?? topic.estimatedDurationMinutes,
    durationLabel,
    completed: Boolean(topic.completed),
  };
};

// ---------- API Methods ----------
export const DailyTopicsAPI = {
  list: async (params?: ListTopicsParams) => {
    const res = await axiosClient.get<TopicDto[]>("/api/v1/topics", {
      params: normalizeListParams(params),
    });
    return coerceTopicArray(res.data).map(normalizeTopic);
  },

  create: async (data: TopicRequest) => normalizeTopic((await axiosClient.post("/api/v1/topics", data)).data),

  getById: async (id: string) => normalizeTopic((await axiosClient.get<TopicDto>(`/api/v1/topics/${id}`)).data),

  update: async (id: string, data: UpdateTopicRequest) => normalizeTopic((await axiosClient.put(`/api/v1/topics/${id}`, data)).data),

  delete: async (id: string) => (await axiosClient.delete(`/api/v1/topics/${id}`)).data,

  toggleFeatured: async (id: string, isFeatured: boolean) =>
    (await axiosClient.patch(`/api/v1/topics/${id}/featured`, null, { params: { isFeatured } })).data,

  addFavorite: async (id: string) => (await axiosClient.post(`/api/v1/topics/${id}/favorite`)).data,

  removeFavorite: async (id: string) => (await axiosClient.delete(`/api/v1/topics/${id}/favorite`)).data,

  getFavorites: async () => coerceTopicArray((await axiosClient.get<TopicDto[]>("/api/v1/topics/favorites")).data).map(normalizeTopic),

  updateStatus: async (id: string, data: UpdateTopicStatusRequest) =>
    (await axiosClient.patch(`/api/v1/topics/${id}/status`, data)).data,
};

export default DailyTopicsAPI;
