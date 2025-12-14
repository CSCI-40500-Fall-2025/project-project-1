// services/groupServices.ts
const API_URL = "http://localhost:3000/api"; //

export interface Group {
  group_id: string;
  group_name: string;
  invitation_code: string;
  num_members: number;
}

export interface JoinGroupResponse {
  message: string;
  group: Group;
}

export async function createGroup(
  group_name: string,
  user_id: string
): Promise<Group> {
  console.log("Creating group:", { group_name, user_id });

  const res = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include", // include cookies for authentication
    body: JSON.stringify({
      group_name: group_name.trim(),
      user_id,
    }),
  });

  console.log("Response status:", res.status);

  const responseText = await res.text();
  console.log("Raw response:", responseText);

  let data: Group | { error?: string };

  try {
    data = JSON.parse(responseText) as Group | { error?: string };
    console.log("Parsed data:", data);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    console.error("Response text:", responseText);
    throw new Error(
      `Invalid server response: ${responseText.substring(0, 100)}`
    );
  }

  if (!res.ok) {
    const errMessage =
      "error" in data ? data.error : `Server error: ${res.status}`;
    console.error("Server error:", errMessage);
    throw new Error(errMessage || `Server error: ${res.status}`);
  }

  return data as Group;
}

export async function getUserGroups(user_id: string): Promise<Group[]> {
  console.log("Fetching groups for user:", user_id);

  const res = await fetch(`${API_URL}/groups/user?user_id=${user_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include", // include cookies for authentication
  });

  console.log("Response status:", res.status);

  const responseText = await res.text();
  console.log("Raw response:", responseText);

  let data: Group[] | { error?: string };

  try {
    data = JSON.parse(responseText) as Group[] | { error?: string };
    console.log("Parsed data:", data);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    console.error("Response text:", responseText);
    throw new Error(
      `Invalid server response: ${responseText.substring(0, 100)}`
    );
  }

  if (!res.ok) {
    const errMessage =
      "error" in data ? data.error : `Server error: ${res.status}`;
    console.error("Server error:", errMessage);
    throw new Error(errMessage || `Server error: ${res.status}`);
  }

  return data as Group[];
}

export async function joinGroup(
  invitation_code: string,
  user_id: string
): Promise<JoinGroupResponse> {
  console.log("Joining group:", { invitation_code, user_id });

  const res = await fetch(`${API_URL}/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      invitation_code: invitation_code.trim(),
      user_id,
    }),
  });

  console.log("Response status:", res.status);

  const responseText = await res.text();
  console.log("Raw response:", responseText);

  let data: JoinGroupResponse | { error?: string };

  try {
    data = JSON.parse(responseText) as JoinGroupResponse | { error?: string };
    console.log("Parsed data:", data);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    console.error("Response text:", responseText);
    throw new Error(
      `Invalid server response: ${responseText.substring(0, 100)}`
    );
  }

  if (!res.ok) {
    const errMessage =
      "error" in data ? data.error : `Server error: ${res.status}`;
    console.error("Server error:", errMessage);
    throw new Error(errMessage || `Server error: ${res.status}`);
  }

  return data as JoinGroupResponse;
}
