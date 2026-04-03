from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI()

# ✅ CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms = {}

# ✅ Create Room
@app.get("/create-room")
def create_room():
    room_id = str(uuid.uuid4())[:6]
    rooms[room_id] = []
    print("Room created:", room_id)
    return {"room_id": room_id}


# ✅ WebSocket Chat
@app.websocket("/ws/{room_id}")
async def chat(websocket: WebSocket, room_id: str):
    print("👉 Connecting to room:", room_id)

    await websocket.accept()
    print("✅ Connected")

    if room_id not in rooms:
        rooms[room_id] = []

    if len(rooms[room_id]) >= 2:
        await websocket.send_text("Room full ❌")
        await websocket.close()
        return

    rooms[room_id].append(websocket)
    print("👥 Users:", len(rooms[room_id]))

    try:
        while True:
            data = await websocket.receive_text()
            print("📩 Message:", data)

            for client in rooms[room_id]:
                if client != websocket:
                    await client.send_text(data)

    except WebSocketDisconnect:
        print("❌ User disconnected")
        rooms[room_id].remove(websocket)

        if not rooms[room_id]:
            del rooms[room_id]