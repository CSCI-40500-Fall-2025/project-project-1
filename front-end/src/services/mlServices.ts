const API_URL = "http://localhost:5001/api";

export interface TimeSlotRecommendation {
  datetime: string;
  score: number;
  hour: number;
  day: string;
  date: string;
}

export interface RecommendTimeSlotsRequest {
  user_id: string;
  existing_events: Array<{
    // Prefer explicit start/end times; legacy 'event_datetime' is still supported
    start_time?: string;
    end_time?: string;
    event_datetime?: string;
    event_title?: string;
    location?: string;
  }>;
  date_range_start: string;
  date_range_end: string;
  duration_hours?: number;
}

export interface RecommendTimeSlotsResponse {
  success: boolean;
  recommendations: TimeSlotRecommendation[];
  preferences_used?: {
    preferred_hours: number[];
    preferred_days: number[];
    avg_hour: number;
    weekend_preference: number;
  };
  error?: string;
}

export async function getTimeSlotRecommendations(
  request: RecommendTimeSlotsRequest
): Promise<RecommendTimeSlotsResponse> {
  try {
    const res = await fetch(`${API_URL}/ml/recommend-timeslots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error("Failed to get time slot recommendations");
    }

    return await res.json();
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/ml/health`);
    const data = await res.json();
    return data.status === "healthy";
  } catch (error) {
    console.error("ML service is not available:", error);
    return false;
  }
}
