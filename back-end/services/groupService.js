import { sql } from "./neon.js";

export async function getAllGroups() {
  return await sql`SELECT * FROM groups`;
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

