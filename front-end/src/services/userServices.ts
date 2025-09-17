const API_URL = "http://localhost:3000/api"

export async function createUser(email: string, username: string, password: string) {
    const user = {
        email: email,
        username: username,
        password: password
    };

    const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    const data = await res.json();
    if (!res.ok) {
        throw data //new Error(data);
    }

    return data
}

export async function loginUser(email: string, password: string) {
    const credentials = {
        email: email,
        password: password
    };

    const res = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include" // include cookies in the request
    });

    const data = await res.json();

    if (!res.ok) {
        throw data //new Error(data);
    }

    return data
}

export async function getUser(){ //for testing
    // const res = await fetch(`${API_URL}/user`, {
    const res = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include" // include cookies in the request
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function logoutUser() {
    const res = await fetch(`${API_URL}/user/logout`, {
        method: "POST",
        credentials: "include", // include cookie to overwrite it
    });
    if (!res.ok) throw new Error("Failed to log out");
    return res.json()
}

export async function checkLogin() {
  const res = await fetch(`${API_URL}/user/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}