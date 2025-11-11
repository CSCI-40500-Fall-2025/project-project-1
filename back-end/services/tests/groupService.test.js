jest.mock("../../db/neon.js", () => ({
  sql: jest.fn() ,
}));

import * as groupService from "../../services/groupService";
import { sql } from "../../db/neon.js";

describe("Group Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllGroups", () => {
    test("return all groups", async () => {
      const fakeGroups = [{ group_id: 1, group_name: "Test Group" }];
      sql.mockResolvedValue(fakeGroups);

      const result = await groupService.getAllGroups();
      expect(sql).toHaveBeenCalledWith`SELECT * FROM groups`;
      expect(result).toEqual(fakeGroups);
    });
  });

  describe("createGroup", () => {
    test("insert a new group and return test", async () => {
      const newGroup = {
        group_id: "g1",
        group_name: "Study Group",
        invitation_code: "invite123",
        num_members: 5,
      };

      const fakeDbResult = [newGroup];
      sql.mockResolvedValue(fakeDbResult);
      const result = await groupService.createGroup(newGroup);

      expect(sql).toHaveBeenCalled();
      expect(result).toEqual(newGroup);
    });
  });
});
