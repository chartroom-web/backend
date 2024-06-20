import { WebSocket } from 'ws';
import {onlineUsersMap} from '../store/online';
import {v4 as uuidv4} from 'uuid';
import { on } from 'events';


class WebSocketController{
  clients: Map<number, WebSocket[]>;
  constructor() {
    this.clients = new Map();
  }

  boradcast(data: any) {
    for (const [key, client] of this.clients) {
      for (const c of client) {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify(data));
        }
      }
    }
  }

  addClient(id: number, ws: WebSocket) {
    if (!this.clients.has(id)) {
      this.clients.set(id, []);
    }
    this.clients.get(id)!.push(ws);
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
      to: to,
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
      const fromClient = this.clients.get(from);
      for(const c of client!){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
      for(const c of fromClient!){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
    }
  }
}

export default WebSocketController;