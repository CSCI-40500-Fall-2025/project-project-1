import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, loginUser } from "../userController.js";
import { sql } from "../../db/neon.js";

jest.mock("../../db/neon.js", () => ({
  sql: { query: jest.fn() },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  return res;
}

describe("createUser", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      },
    };
    res = mockResponse();
  });

  test("returns 400 if missing fields", async () => {
    req.body = {};
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Username, email and password required",
    });
  });

  test("hashes password and inserts user", async () => {
    bcrypt.hash.mockResolvedValue("hashed123");
    sql.query.mockResolvedValue([
      { id: 1, username: "testuser", email: "test@example.com" },
    ]);

    await createUser(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(sql.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    });
  });

  test("handles duplicate email error", async () => {
    const error = new Error("duplicate");
    error.constraint = "users_email_key";
    sql.query.mockRejectedValue(error);

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already in use" });
  });

  test("handles duplicate username error", async () => {
    const error = new Error("duplicate");
    error.constraint = "users_username_key";
    sql.query.mockRejectedValue(error);

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Username already in use" });
  });

  test("handles generic DB error", async () => {
    const error = new Error("DB failure");
    sql.query.mockRejectedValue(error);

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("loginUser", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: { email: "test@example.com", password: "password123" },
    };
    res = mockResponse();
  });

  test("returns 400 if missing fields", async () => {
    req.body = {};
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email and password required",
    });
  });

  test("returns 400 if email not found", async () => {
    sql.query.mockResolvedValue([]);
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid email or password",
    });
  });

  test("returns 400 if password incorrect", async () => {
    sql.query.mockResolvedValue([
      {
        id: 1,
        username: "user",
        email: "test@example.com",
        password: "hashed",
      },
    ]);
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid email or password",
    });
  });

  test("returns success and sets cookie when credentials valid", async () => {
    sql.query.mockResolvedValue([
      {
        id: 1,
        username: "user",
        email: "test@example.com",
        password: "hashed",
      },
    ]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocktoken");

    await loginUser(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      id: 1,
      username: "user",
      email: "test@example.com",
    });
  });

  test("handles DB error gracefully", async () => {
    sql.query.mockRejectedValue(new Error("DB down"));
    await loginUser(req, res);
    expect(res.json).not.toHaveBeenCalledWith({
      message: "Login successful",
    });
  });
});
