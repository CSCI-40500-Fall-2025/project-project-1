import { customAlphabet, nanoid } from "nanoid";
import {
  getAllGroups,
  createGroup as createGroupService,
  getGroupByInvitationCode,
  checkUserInGroup,
  addUserToGroup,
  getGroupsForUser,
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

export async function getUserGroups(req, res) {
  try {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const groups = await getGroupsForUser(userId);
    res.json(groups);
  } catch (err) {
    console.error("Error fetching user groups:", err);
    res.status(500).json({ error: "Failed to fetch user groups" });
  }
}

export async function createGroup(req, res) {
  try {
    const { group_name } = req.body;
    const userId = req.user?.id || req.body.user_id;

    if (!group_name) {
      return res.status(400).json({ error: "Group Name is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Create group with 0 members initially
    const num_members = 0;
    const group = await createGroupWithRetry(group_name, num_members);

    // Add the current user as the first member
    const updatedGroup = await addUserToGroup(userId, group.group_id);

    res.status(201).json(updatedGroup);
  } catch (err) {
    console.error("Create group error:", err);
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

export async function joinGroupByInviteCode(req, res) {
  try {
    const { invitation_code } = req.body;
    const userId = req.user?.id || req.body.user_id;

    if (!invitation_code) {
      return res.status(400).json({ error: "Invitation code is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await joinGroupByInviteCodeWithRetry(
      userId,
      invitation_code
    );

    res.status(200).json({
      message: "Successfully joined group",
      group: result,
    });
  } catch (err) {
    if (err.message === "Group not found with this invitation code") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "User is already a member of this group") {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === "Failed to join group after multiple attempts") {
      return res.status(500).json({ error: err.message });
    }

    console.error("Join group error:", err);
    res.status(500).json({ error: "Failed to join group" });
  }
}

async function joinGroupByInviteCodeWithRetry(
  userId,
  invitation_code,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      const group = await getGroupByInvitationCode(invitation_code);

      if (!group) {
        throw new Error("Group not found with this invitation code");
      }

      const isMember = await checkUserInGroup(userId, group.group_id);

      if (isMember) {
        throw new Error("User is already a member of this group");
      }

      const updatedGroup = await addUserToGroup(userId, group.group_id);
      return updatedGroup;
    } catch (err) {
      if (
        err.message === "Group not found with this invitation code" ||
        err.message === "User is already a member of this group"
      ) {
        throw err;
      }

      if (err.code === "23505") {
        const group = await getGroupByInvitationCode(invitation_code);
        if (group) {
          const isMember = await checkUserInGroup(userId, group.group_id);
          if (isMember) {
            return group;
          }
        }
      }

      if (i === retries - 1) {
        throw new Error("Failed to join group after multiple attempts");
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
}
