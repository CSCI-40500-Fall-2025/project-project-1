import type { User } from "../const";
import { logAction } from "../logger";
const API_URL = "https://project-project-1.onrender.com/api"; //"http://localhost:3000/api"//

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const res = await fetch(`${API_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
    //credentials: "include", registration endpoint doesn’t need cookies cause you are creating a new user
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    console.error("Failed to parse JSON:", err);
  }

  if (!res.ok) {
    const errMessage = data?.error || "Failed to create user";
    logAction("error", "Create User", "Failed");
    throw new Error(errMessage);
  }

  return {
    username: data.username,
    email: data.email,
    userID: data.id,
  };
}

export async function loginUser(email: string, password: string) {
  const credentials = {
    email: email,
    password: password,
  };

  const res = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include", // include cookies in the request
  });

  if (!res.ok) {
    let errData = { error: "Login failed" };
    try {
      errData = await res.json();
    } catch (e) {
      console.error("Failed to parse error JSON:", e);
    }
    throw new Error(errData.error || "Login failed, please try again.");
  }

  return res.json();
}

export async function getUser() {
  //for testing
  // const res = await fetch(`${API_URL}/user`, {
  const res = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // include cookies in the request
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function logoutUser() {
  try {
    const res = await fetch(`${API_URL}/user/logout`, {
      method: "POST",
      credentials: "include", // include cookie to overwrite it
    });
    if (!res.ok) {
      let errData = { error: "Failed to log out" };
      try {
        errData = await res.json();
      } catch (e) {
        console.error("Failed to parse error JSON:", e);
      }
      throw new Error(errData.error);
    }
    return res.json();
  } catch (err) {
    // Handle network errors (backend down, etc.)
    // Don't throw - let the frontend handle logout even if backend is down
    if (err instanceof TypeError) {
      console.warn(
        "Backend unavailable during logout, but frontend state will be cleared"
      );
      return { message: "Logged out (backend unavailable)" };
    }
    throw err;
  }
}

export async function checkLogin() {
  try {
    const res = await fetch(`${API_URL}/user/me`, {
      credentials: "include",
    });
    if (!res.ok) {
      let errData = { error: "Failed to check Login" };
      try {
        errData = await res.json();
      } catch (e) {
        console.error("Failed to parse error JSON:", e);
      }
      throw new Error(errData.error);
    }
    return await res.json();
  } catch (err) {
    // Handle network errors (backend down, CORS issues, etc.)
    // TypeError occurs when fetch fails (network error, connection refused, etc.)
    if (err instanceof TypeError) {
      throw new Error("Cannot connect to server");
    }
    // Re-throw other errors (like Error from !res.ok)
    throw err;
  }
}
