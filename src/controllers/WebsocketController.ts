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
      try {
        const obj : any = onlineUsersMap.get(id)!;
        console.log(obj)
        this.message({
          type: 'message',
          from: id, to: -1, text: `${obj.username!}已離開聊天室`, isAnnouncement: true, image: obj.image, sender: obj
        })
        onlineUsersMap.delete(id);
        this.boradcast({ type: 'online' })
      } catch (error) {
        console.log(error)
      }
    });
  }

  online(obj: any, ws: WebSocket){
    onlineUsersMap.set(obj.id, obj);
    this.message({
      type: 'message',
      from: obj.id, to: -1, text: `${obj.username}已加入聊天室`, isAnnouncement: true, image: obj.image, timestamp: obj.timestamp, sender: onlineUsersMap.get(obj.from)
    })
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
    const isAnnouncement = obj.isAnnouncement;
    const data = {
      type: 'message',
      isAnnouncement: isAnnouncement,
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
      if (client){
        for(const c of client){
          if(c.readyState === WebSocket.OPEN){
            c.send(JSON.stringify(data));
          }
        }
      }
      if(fromClient){
        for(const c of fromClient){
          if(c.readyState === WebSocket.OPEN){
            c.send(JSON.stringify(data));
          }
        }
      }
    }
  }

  message_game(obj: any){
    console.log('message_game')
    const to = obj.to;
    const from = obj.from;
    const isAnnouncement = obj.isAnnouncement;
    const data = {
      type: 'message_game',
      isAnnouncement: isAnnouncement,
      from: from,
      to: to,
      time: new Date().getTime(),
      sender: onlineUsersMap.get(from),
      timestamp: obj.timestamp
    };
    const client = this.clients.get(to);
    const fromClient = this.clients.get(from);
    if (client){
      for(const c of client){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
    }
    if(fromClient){
      for(const c of fromClient){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
    }
  }

  delete_message_game(obj: any){
    console.log(obj)
    const to = obj.to;
    const from = obj.from;
    const id = obj.id;
    const data = {
      type: 'delete_message_game',
      from: from,
      to: to,
      id: id,
    };
    const client = this.clients.get(to);
    const fromClient = this.clients.get(from);
    if (client){
      for(const c of client){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
    }
    if(fromClient){
      for(const c of fromClient){
        if(c.readyState === WebSocket.OPEN){
          c.send(JSON.stringify(data));
        }
      }
    }
  }
}

export default WebSocketController;