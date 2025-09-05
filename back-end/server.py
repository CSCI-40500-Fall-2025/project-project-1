from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # or ["*"] for all, but not recommended in prod. Set to hosted url later
)

@app.get("/")
def read_root():
    return {"message": "Hi this is server"}


@app.post("/user")
async def test(request: Request):
    body = await request.json()   # raw JSON from client
    username = body.get("username")

    if not username:
        return {"error": "username is required"}

    return {"message": f"Hi {username}! Server works :D"}