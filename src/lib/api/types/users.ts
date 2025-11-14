// src/lib/api/types/users.ts
import axiosClient from "./axiosClient";

// ----------------------
// API Response Wrapper
// ----------------------
export interface ApiWrapper<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
  messages?: string[];
  errors?: string[];
}

// ----------------------
// Profile Models
// ----------------------
export interface SubscriptionInfo {
  planName?: string;
  status?: string;
  renewalDate?: string; // ISO date
  isFreeTrial?: boolean;
}

export interface UserProfileData {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string | null;
  learningGoals?: string[];
  preferredLanguage?: string;
  timeZone?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string; // ISO
  age?: number;
  subscription?: SubscriptionInfo;
  walletBalance?: number;
  referralCode?: string | null;
  referralStats?: {
    totalInvites?: number;
    successful?: number;
    pendingRewards?: number;
  };
}

// ----------------------
// User List Model
// ----------------------
export interface UserListItem {
  id: string;
  userName?: string;
  email?: string;
  fullName?: string;
  role?: string;
}

// ----------------------
// API: List Users
// ----------------------
export async function listUsers(
  page?: number,
  pageSize?: number
): Promise<ApiWrapper<{ items: UserListItem[]; total?: number }>> {
  const params: any = {};
  if (page != null) params.Page = page;
  if (pageSize != null) params.PageSize = pageSize;

  const resp = await axiosClient.get<ApiWrapper<{ items: UserListItem[]; total?: number }>>(
    "/api/v1/users",
    { params }
  );
  return resp.data;
}

// ----------------------
// API: Create User
// ----------------------
export async function createUser(payload: {
  userName: string;
  password: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  role?: string;
}): Promise<ApiWrapper> {
  const resp = await axiosClient.post<ApiWrapper>("/api/v1/users", payload);
  return resp.data;
}

// ----------------------
// API: Get Profile
// ----------------------
export async function getProfile(): Promise<ApiWrapper<UserProfileData>> {
  const resp = await axiosClient.get<ApiWrapper<UserProfileData>>("/api/v1/users/profile");
  return resp.data;
}

// ----------------------
// API: Update Profile
// ----------------------
export async function updateProfile(
  payload: Partial<UserProfileData>
): Promise<ApiWrapper<null>> {
  const resp = await axiosClient.put<ApiWrapper<null>>("/api/v1/users/profile", payload);
  return resp.data;
}

// ----------------------
// API: Upload Avatar
// ----------------------
export async function uploadAvatar(
  formData: FormData
): Promise<ApiWrapper<{ avatarUrl: string }>> {
  const resp = await axiosClient.post<ApiWrapper<{ avatarUrl: string }>>(
    "/api/v1/users/profile/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return resp.data;
}

// ----------------------
// API: Lock / Unlock User
// ----------------------
export async function lockUser(id: string): Promise<ApiWrapper> {
  const resp = await axiosClient.patch<ApiWrapper>(`/api/v1/users/${id}/lock`);
  return resp.data;
}

export async function unlockUser(id: string): Promise<ApiWrapper> {
  const resp = await axiosClient.patch<ApiWrapper>(`/api/v1/users/${id}/unlock`);
  return resp.data;
}

// ----------------------
// Legacy Exports (for backward compatibility)
// ----------------------
export interface UpdateUserProfileCommand {
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  languagePreference?: string;
  avatarUrl?: string;
}

export interface ReviewInstructorPayload {
  status: "Approved" | "Rejected";
  comments?: string;
}

// ----------------------
// Default Export with Legacy API
// ----------------------
const UsersAPI = {
  /** ✅ Get instructors list */
  getInstructors: async () => {
    const res = await axiosClient.get(`/Admin/instructors`);
    return res.data;
  },

  /** ✅ Approve or reject instructor */
  approveInstructor: async (id: string, payload: ReviewInstructorPayload) => {
    const res = await axiosClient.post(`/Admin/instructors/${id}/review`, payload);
    return res.data;
  },

  /** ✅ Get authenticated user profile */
  getUserProfile: async () => {
    const res = await axiosClient.get(`/users/profile`);
    return res.data;
  },

  /** ✅ Update user profile */
  updateUserProfile: async (payload: UpdateUserProfileCommand) => {
    const res = await axiosClient.put(`/users/profile`, payload);
    return res.data;
  },

  /** ✅ Upload avatar */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post(`/users/profile/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // New API functions
  listUsers,
  createUser,
  getProfile,
  updateProfile,
  lockUser,
  unlockUser,
};

export default UsersAPI;
