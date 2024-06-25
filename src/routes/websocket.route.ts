import WebsocketController from "../controllers/WebsocketController"
import Route from "./route";
import { Server as ServerSocket, WebSocket } from 'ws';
import http from 'http';

class WebsocketRoute extends Route{
  private WebsocketController = new WebsocketController();
  private wss: ServerSocket;

  constructor(server: http.Server) {
    super();
    this.prefix = '/message';
    this.wss = new ServerSocket({ server });
    this.setupWebSocket();
    this.setRoutes();
  }

  protected setRoutes() {
    
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[Client connected]');
      ws.on('close', () => {
        console.log('Close connected');
      });

      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        const obj = JSON.parse(message);
        const type = obj.type;
        if(type == 'online') this.WebsocketController.online(obj, ws);

        if(type == 'getonline') this.WebsocketController.getOnline();

        if(type == 'message') this.WebsocketController.message(obj);

        if(type == 'message_game') this.WebsocketController.message_game(obj);

        if(type == 'delete_message_game') this.WebsocketController.delete_message_game(obj);
      });
    });
  }
}

export default WebsocketRoute;
