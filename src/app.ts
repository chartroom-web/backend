import express from 'express';
import cors from 'cors';
import {router} from "./routes/router";
import session from 'express-session';
import sessionStore from './models/sessionStore';
import * as dotenv from 'dotenv';


dotenv.config();

const app: express.Application = express();
const port : number = process.env.BACKEND_SERVER_PORT ? parseInt(process.env.BACKEND_SERVER_PORT) : 3000;
app.use(cors({
  origin: 'http://localhost:5173', // 允许的前端地址
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

// load router
for (const route of router) {
  app.use(route.getPrefix(), route.getRouter());
  console.log(`Router loaded: ${route.getPrefix()}`);
}

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

module.exports = app;
