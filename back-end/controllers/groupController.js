import { customAlphabet, nanoid } from "nanoid";
import {
  getAllGroups,
  createGroup as createGroupService,
} from "../services/groupService.js";

const alphabetAndNumbers =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export async function getGroups(req, res) {
  try {
    const events = await getAllGroups();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

export async function createGroup(req, res) {
  try {
    const { group_name } = req.body;

    if (!group_name) {
      return res.status(400).json({ error: "Group Name is required" });
    }

    const num_members = 1;
    const group = await createGroupWithRetry(group_name, num_members);

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Failed to create group" });
  }
}

async function createGroupWithRetry(group_name, num_members, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const group_id = nanoid(8);
      const invitation_code = customAlphabet(alphabetAndNumbers, 6)();

      const group = await createGroupService({
        group_id,
        group_name,
        invitation_code,
        num_members,
      });
      return group;
    } catch (err) {
      // Unique violation
      if (err.code === "23505") {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to generate unique IDs after multiple attempts");
}


