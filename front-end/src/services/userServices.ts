const API_URL = "http://localhost:3000/api"

export async function createTestUser() {
    const testUser = {
        id: 'test1',
        email: "testuser@example.com",
        username: "testuser",
        password: "password123"
    };

    const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
    });

    if (!res.ok) throw new Error("Failed to create test user");

    return res.json();
}
