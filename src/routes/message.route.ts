import MessageController from "../controllers/MessageController"
import Route from "./route";
import { Server as ServerSocket, WebSocket } from 'ws';
import http from 'http';

class MessageRoute extends Route{
  private MessageController = new MessageController();
  private wss: ServerSocket;

  constructor(server: http.Server) {
    super();
    this.prefix = '/message';
    this.MessageController = new MessageController();
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
        
      });
    });
  }
}

export default MessageRoute;
