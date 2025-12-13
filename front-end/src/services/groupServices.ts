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

  let data: any;

  try {
    data = JSON.parse(responseText);
    console.log("Parsed data:", data);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    console.error("Response text:", responseText);
    throw new Error(
      `Invalid server response: ${responseText.substring(0, 100)}`
    );
  }

  if (!res.ok) {
    const errMessage = data?.error || `Server error: ${res.status}`;
    console.error("Server error:", errMessage);
    throw new Error(errMessage);
  }

  return data;
}
