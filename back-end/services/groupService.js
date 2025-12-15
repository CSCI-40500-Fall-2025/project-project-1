import { sql } from "../db/neon.js";

export async function getAllGroups() {
  return await sql`SELECT * FROM groups`;
}

export async function getGroupsForUser(userId) {
  const result = await sql`
    SELECT
      g.group_id,
      g.group_name,
      g.invitation_code,
      g.num_members
    FROM groups g
    INNER JOIN group_users gu ON g.group_id = gu.group_id
    WHERE gu.user_id = ${userId}
    ORDER BY g.group_name
  `;
  return result;
}

export async function createGroup({
  group_id,
  group_name,
  invitation_code,
  num_members,
}) {
  const [group] = await sql`
        INSERT INTO groups
        (group_id, group_name, invitation_code, num_members)
        VALUES
        (${group_id}, ${group_name}, ${invitation_code}, ${num_members})
        RETURNING group_id, group_name, invitation_code, num_members
    `;
  return group;
}

export async function getGroupByInvitationCode(invitation_code) {
  console.log(
    `[DEBUG] Looking up group with invitation code: ${invitation_code}`
  );
  const result = await sql`
    SELECT * FROM groups
    WHERE invitation_code = ${invitation_code}
  `;
  console.log(`[DEBUG] User is member: ${result.length > 0}`);
  return result.length > 0 ? result[0] : null;
}

export async function checkUserInGroup(userId, groupId) {
  const result = await sql`
    SELECT * FROM group_users
    WHERE user_id = ${userId} AND group_id = ${groupId}
  `;
  return result.length > 0;
}

export async function addUserToGroup(userId, groupId) {
  try {
    // First, add the user to group_users table
    console.log(`[DEBUG] Inserting into group_users...`);
    await sql`
      INSERT INTO group_users (user_id, group_id)
      VALUES (${userId}, ${groupId})
    `;
    console.log(`[DEBUG] Insert successful`);

    // Then increment the num_members in groups table
    console.log(`[DEBUG] Updating group member count...`);
    const [updatedGroup] = await sql`
      UPDATE groups
      SET num_members = num_members + 1
      WHERE group_id = ${groupId}
      RETURNING group_id, group_name, invitation_code, num_members
    `;
    console.log(`[DEBUG] Update successful:`, updatedGroup);

    return updatedGroup;
  } catch (error) {
    console.error(`[DEBUG] addUserToGroup ERROR:`, error.message);
    console.error(`[DEBUG] Error code:`, error.code);
    console.error(`[DEBUG] Error detail:`, error.detail);
    throw error;
  }
}

export async function getGroupMembers(groupId) {
  const result = await sql`
    SELECT
      u.id,
      u.username,
      u.email
    FROM users u
    INNER JOIN group_users gu ON u.id = gu.user_id
    WHERE gu.group_id = ${groupId}
    ORDER BY u.username
  `;
  return result;
}

export async function getGroupById(groupId) {
  const result = await sql`
    SELECT * FROM groups
    WHERE group_id = ${groupId}
  `;
  return result.length > 0 ? result[0] : null;
}
