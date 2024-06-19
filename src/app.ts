import express from 'express';
import cors from 'cors';
import { create_router } from "./routes/router";
import session from 'express-session';
import sessionStore from './models/sessionStore';
import * as dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const app: express.Application = express();
const port: number = 4876;

app.use(cors({
  origin: [process.env.FRONTEND_SERVER_PORT! || "http://localhost:5173"], // 允许的前端地址
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // 允许发送 Cookie
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: '48763',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    secure: false
  }
}));

// 創建 HTTP 伺服器
export const server = http.createServer(app);

// load router
const router = create_router(server);
for (const route of router) {
  app.use(route.getPrefix(), route.getRouter());
  console.log(`Router loaded: ${route.getPrefix()}`);
}

// 啟動伺服器
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

export default app;