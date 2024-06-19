import { WebSocket } from 'ws';


class WebSocketController{
  clients: Set<WebSocket>;
  constructor() {
    this.clients = new Set();
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  online(obj: any){
    const message = JSON.stringify({ type: 'online', user: obj });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

export default WebSocketController;