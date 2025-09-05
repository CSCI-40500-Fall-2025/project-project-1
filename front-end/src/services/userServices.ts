const API_URL = "http://127.0.0.1:8000"

export async function testUser(username: string) {
    const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    })
    if (!res.ok) throw new Error("Failed to connect to server")
    return res.json()
}
