import { getGroups, createGroup } from "../groupController.js";
import * as groupService from "../../services/groupService.js";
import { nanoid, customAlphabet } from "nanoid";

jest.mock("../../services/groupService.js");
jest.mock("nanoid");

describe("Group Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getGroups", () => {
    test("return all groups", async () => {
      const fakeGroups = [{ group_id: "a1b2", group_name: "Test Group" }];
      groupService.getAllGroups.mockResolvedValue(fakeGroups);

      await getGroups(req, res);

      expect(groupService.getAllGroups).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeGroups);
    });

    test("handle errors in getGroups", async () => {
      groupService.getAllGroups.mockRejectedValue(new Error("DB Error"));

      await getGroups(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch events",
      });
    });
  });

  describe("createGroup", () => {
    test("return 400 if group_name is missing", async () => {
      req = { body: {} };

      await createGroup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Group Name is required",
      });
    });

    test("create a new group successfully", async () => {
       req = { body: { group_name: "Cool Group" } };
      const fakeGroup = {
        group_id: "fixedID",
        group_name: "Cool Group",
        invitation_code: "ABC123",
        num_members: 1,
      };

      nanoid.mockReturnValue("fixedID");
      customAlphabet.mockReturnValue(() => "ABC123");

      groupService.createGroup.mockResolvedValue(fakeGroup);

      await createGroup(req, res);

      expect(nanoid).toHaveBeenCalledWith(8);
      expect(customAlphabet).toHaveBeenCalledWith(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        6
      );
      expect(groupService.createGroup).toHaveBeenCalledWith(fakeGroup);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeGroup);
    });

    test("retry on duplicate key error and eventually succeed", async () => {
       req = { body: { group_name: "Retry Group" } };
      const duplicateError = new Error("duplicate");
      duplicateError.code = "23505";

      const fakeGroup = {
        group_id: "uniqueID",
        group_name: "Retry Group",
        invitation_code: "ABC123",
        num_members: 1,
      };

      nanoid.mockReturnValue("uniqueID");
      customAlphabet.mockReturnValue(() => "ABC123");

      groupService.createGroup
        .mockRejectedValueOnce(duplicateError)
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce(fakeGroup);

      await createGroup(req, res);

      expect(groupService.createGroup).toHaveBeenCalledTimes(3);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeGroup);
    });

    test("fail after 3 retries on duplicate key error", async () => {
       req = { body: { group_name: "Fail Group" } };
      const duplicateError = new Error("duplicate");
      duplicateError.code = "23505";

      nanoid.mockReturnValue("failID");
      customAlphabet.mockReturnValue(() => "ABC123");

      groupService.createGroup.mockRejectedValue(duplicateError);

      await createGroup(req, res);

      expect(groupService.createGroup).toHaveBeenCalledTimes(3);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create group",
      });
    });
  });
});
