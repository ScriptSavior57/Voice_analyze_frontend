/**
 * Platform service for Qari, Student, and Admin functionality.
 */
import { getAuthHeader } from "./authService";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface QariContent {
  id: string;
  reference_id: string;
  surah_number?: number;
  surah_name?: string;
  ayah_number?: number;
  maqam?: string;
  reference_title?: string;
  reference_duration?: number;
  created_at?: string;
}

export interface StudentInfo {
  student_id: string;
  student_email: string;
  student_name?: string;
  joined_at: string;
  last_active: string;
  latest_score?: number;
  improvement?: number;
  statistics?: StudentStatistics;
}

export interface StudentStatistics {
  total_sessions: number;
  average_score: number;
  best_score: number;
  latest_score: number;
  improvement_trend: number[];
  weakest_verses: Array<{ text: string; frequency: number }>;
}

export interface StudentProgress {
  id: string;
  session_id: string;
  overall_score: number;
  previous_score?: number;
  improvement?: number;
  verse_scores?: Array<{
    start: number;
    end: number;
    score: number;
    text: string;
  }>;
  weakest_verses?: Array<{
    start: number;
    end: number;
    score: number;
    text: string;
  }>;
  reference_id?: string;
  created_at: string;
  file_path?: string;
}

export interface QariInfo {
  qari_id: string;
  qari_email: string;
  qari_name?: string;
  joined_at: string;
}

/**
 * Get available content based on user role
 */
export const getAvailableContent = async (): Promise<{
  content: QariContent[];
  qari?: string;
  message?: string;
}> => {
  const response = await fetch(`${API_URL}/api/platform/content/available`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get available content");
  }

  return response.json();
};

/**
 * Qari: Add content to library
 */
export const addQariContent = async (content: {
  reference_id: string;
  surah_number?: number;
  surah_name?: string;
  ayah_number?: number;
  maqam?: string;
}): Promise<{ success: boolean; content_id: string }> => {
  const response = await fetch(`${API_URL}/api/platform/qari/content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to add content");
  }

  return response.json();
};

/**
 * Qari: Get my content library
 */
export const getQariContent = async (): Promise<{
  content: QariContent[];
  count: number;
}> => {
  const response = await fetch(`${API_URL}/api/platform/qari/content`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Qari content");
  }

  return response.json();
};

/**
 * Qari: Get my students (Dashboard)
 */
export const getQariStudents = async (): Promise<{
  students: StudentInfo[];
  count: number;
}> => {
  const response = await fetch(`${API_URL}/api/platform/qari/students`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Qari students");
  }

  return response.json();
};

/**
 * Student: Assign to a Qari
 */
export const assignToQari = async (qariId: string, referralCode?: string): Promise<{
  success: boolean;
  relationship_id: string;
}> => {
  const response = await fetch(`${API_URL}/api/platform/student/assign-qari`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      qari_id: qariId,
      referral_code: referralCode,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to assign to Qari");
  }

  return response.json();
};

/**
 * Student: Get my active Qari
 */
export const getMyQari = async (): Promise<{
  qari: QariInfo | null;
  message?: string;
}> => {
  const response = await fetch(`${API_URL}/api/platform/student/my-qari`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Qari");
  }

  return response.json();
};

/**
 * Student: Get my progress
 */
export const getStudentProgress = async (limit: number = 50): Promise<{
  progress: StudentProgress[];
  count: number;
}> => {
  const response = await fetch(
    `${API_URL}/api/platform/student/progress?limit=${limit}`,
    {
      headers: {
        ...getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get progress");
  }

  return response.json();
};

/**
 * Student: Get my statistics
 */
export const getStudentStatistics = async (): Promise<StudentStatistics> => {
  const response = await fetch(`${API_URL}/api/platform/student/statistics`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get statistics");
  }

  return response.json();
};

/**
 * Get available Qaris (for students to select from)
 */
export const getAvailableQaris = async (): Promise<{
  qaris: Array<{
    id: string;
    email: string;
    full_name?: string;
    is_approved: boolean;
    is_active: boolean;
    created_at?: string;
  }>;
}> => {
  const response = await fetch(`${API_URL}/api/platform/qaris/available`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to list Qaris");
  }

  return response.json();
};

/**
 * Admin: List all Qaris
 */
export const listAllQaris = async (): Promise<{
  qaris: Array<{
    id: string;
    email: string;
    full_name?: string;
    is_approved: boolean;
    is_active: boolean;
    created_at: string;
  }>;
}> => {
  const response = await fetch(`${API_URL}/api/platform/admin/qaris`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to list Qaris");
  }

  return response.json();
};

/**
 * Admin: Approve Qari
 */
export const approveQari = async (qariId: string): Promise<{
  success: boolean;
  message: string;
  referral_code?: string;
}> => {
  const response = await fetch(
    `${API_URL}/api/platform/admin/approve-qari/${qariId}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to approve Qari");
  }

  return response.json();
};

/**
 * Qari: Get referral code
 */
export const getQariReferralCode = async (): Promise<{
  referral_code: string;
  commission_rate: number;
}> => {
  const response = await fetch(`${API_URL}/api/platform/qari/referral-code`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get referral code");
  }

  return response.json();
};

/**
 * Qari: Get commission statistics
 */
export const getQariCommissionStats = async (): Promise<{
  active_students: number;
  referral_code: string;
  commission_rate: number;
  referral_breakdown: Array<{ code: string; count: number }>;
}> => {
  const response = await fetch(`${API_URL}/api/platform/qari/commission-stats`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get commission stats");
  }

  return response.json();
};
