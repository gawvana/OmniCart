from fastapi import APIRouter, WebSocket

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

manager = ConnectionManager()

@router.websocket("/family/{family_id}")
async def websocket_endpoint(websocket: WebSocket, family_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception:
        pass
