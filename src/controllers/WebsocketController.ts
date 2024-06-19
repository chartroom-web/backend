import { WebSocket } from 'ws';
import {onlineUsersMap} from '../store/online';
import {v4 as uuidv4} from 'uuid';
import { on } from 'events';


class WebSocketController{
  clients: Map<number, WebSocket>;
  constructor() {
    this.clients = new Map();
  }

  boradcast(data: any) {
    for (const [key, client] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  }

  addClient(id: number, ws: WebSocket) {
    this.clients.set(id, ws);
    ws.on('close', () => {
      this.clients.delete(id);
      onlineUsersMap.delete(id);
      this.boradcast({ type: 'online' })
    });
  }

  online(obj: any, ws: WebSocket){
    onlineUsersMap.set(obj.id, obj);
    this.addClient(obj.id, ws);
    this.boradcast({ type: 'online' });
  }

  getOnline(){

    interface Online {
      type: string;
      usersMemberList?: any[];
    }

    let data: Online = {
      type: 'getonline',
    };
    
    let onlineUsers = [];
    for (const [key, value] of onlineUsersMap) {
      onlineUsers.push(value);
    }

    data['usersMemberList'] = onlineUsers;
    
    this.boradcast(data);
  }

  message(obj: any){
    const to = obj.to;
    const from = obj.from;
    const text = obj.text;
    const data = {
      type: 'message',
      from: from,
      text: text,
      image: obj.image,
      time: new Date().getTime(),
      sender: onlineUsersMap.get(from),
      timestamp: obj.timestamp
    };
    // console.log(to, from, text, onlineUsersMap, data)
    if (to === -1) {
      this.boradcast(data);
    } else {
      const client = this.clients.get(to);
      // console.log('client', client);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  }
}

export default WebSocketController;