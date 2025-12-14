import { sql } from "../db/neon.js";

export async function getUsernameById(userId) {
  try {
    const result = await sql`
      SELECT username FROM users
      WHERE id = ${userId}
    `;
    return result.length > 0 ? result[0].username : null;
  } catch (err) {
    console.error("Error fetching username by ID:", err);
    return null;
  }
}

export async function getUsernamesByIds(userIds) {
  try {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    const result = await sql`
      SELECT id, username FROM users
      WHERE id = ANY(${userIds})
    `;

    // Create a map of user_id -> username
    const usernameMap = {};
    result.forEach((user) => {
      usernameMap[user.id] = user.username;
    });

    return usernameMap;
  } catch (err) {
    console.error("Error fetching usernames by IDs:", err);
    return {};
  }
}

