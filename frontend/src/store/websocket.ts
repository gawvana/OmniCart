/**
 * Realtime synchronization is natively provided by Supabase Realtime Channels.
 * @see frontend/src/lib/supabase/client.ts
 */
export class WebSocketClient {
  connect(_familyId: string): void {
    // No-op: Supabase Realtime manages websocket connections automatically
  }

  disconnect(): void {
    // No-op
  }
}

export const wsClient = new WebSocketClient();
