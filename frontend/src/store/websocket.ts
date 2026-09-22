export class WebSocketClient {
  private ws: WebSocket | null = null;

  connect(familyId: string) {
    this.ws = new WebSocket(`ws://api/ws/family/${familyId}`);
    this.ws.onmessage = (event) => {
      console.log('WS Message:', event.data);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
export const wsClient = new WebSocketClient();
