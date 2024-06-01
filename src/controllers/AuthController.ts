import { Request, Response, NextFunction } from "express";
import {query} from "../models/db";
import {sendMailToVertifyUsers} from '../models/mail'
import {create_verified_token} from '../models/verification'
import bcrypt from 'bcryptjs';
import googleOAuth2Client from '../config/GoogleOauth2Client';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

class AuthController {
  echo(request: Request, response: Response, next: NextFunction) {
    response.type('text/plain');
    response.send('echo');
  }  
  
  async mail_login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    console.log(email, password);

    try {
      const userResults = await query('select * from users where email = ?', [email]);
      if (userResults.length > 0) {
        // check password
        if (!bcrypt.compareSync(password, userResults[0].password_hash)) {
          return res.status(400).send('Invalid email or password');
        } else if (userResults[0].is_email_verified === 0) {

          // 每五分鐘最多寄一次
          const lastEmailResults = await query('select * from VerificationTokens where user_id = ? order by created_at desc limit 1', [userResults[0].id]);
          if (lastEmailResults.length > 0) {
            const lastEmailTime = new Date(lastEmailResults[0].created_at).getTime();
            const currentTime = new Date().getTime();
            // 檢查五分鐘內是否有寄過
            if (currentTime - lastEmailTime < 300000) {
              return res.status(400).send('Email not verified, please wait before trying again');
            }
          }

          const verifiedToken : string = await create_verified_token(userResults[0].id);
          await sendMailToVertifyUsers(email, verifiedToken);
          return res.status(400).send('Email not verified yet, verification email sent');

        } else {
          const session: any = req.session;
          session.user_id = userResults[0].id;
          return res.status(200).send({user_id: userResults[0].id, message: 'Logged in' });
        }
      } else {
        return res.status(400).send('Invalid email or password');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Error logging in');
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const { username, password, email } = req.body;
    console.log('Registering user');
    console.log(username, password, email);

    try {
      const emailResults = await query('select email, is_email_verified from users where email = ?', [email]);
      if (emailResults.length > 0) {
        return res.status(400).send('Email already registered');
      } else {
        const hash_password = bcrypt.hashSync(password, 8);
        const result : any = await query('insert into users (username, email, password_hash, login_method) values (?, ?, ?, ?)', [username, email, hash_password, 1]);
        const verifiedToken : string = await create_verified_token(result.insertId);
        await sendMailToVertifyUsers(email, verifiedToken);
        return res.status(201).send('User registered');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Error registering user');
    }
  }
  google_login(req: Request, res: Response, next: NextFunction){
    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.redirect(authUrl);
  }
  async google_callback(req: Request, res: Response, next: NextFunction) {
    const code: string = req.query.code as string;
    try {
      const { tokens } = await googleOAuth2Client.getToken(code);
      googleOAuth2Client.setCredentials(tokens);
      const { data }: any = await googleOAuth2Client.request({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo'
      });

      // 检查邮箱是否已经注册
      const emailCheckResults = await query('select * from users where email = ? AND login_method = ?', [data.email, 1]);
      if (emailCheckResults.length > 0) {
          console.log('User found');
          return res.status(400).send('Email already registered');
      }

      // 检查 Google ID 是否已经存在
      const googleIdCheckResults = await query('select count(*) as count from users where google_id = ?', [data.sub]);
      if (googleIdCheckResults[0].count === 0) {
        // 插入新用户
        await query('insert into users (username, email, google_id, login_method, picture, is_email_verified) values (?, ?, ?, ?, ?, ?)', [data.name, data.email, data.sub, 2, data.picture, true]);
      }
      // 设置用户会话并发送响应
      const newUserResults = await query('select id from users where google_id = ?', [data.sub]);
      const session: any = req.session;
      session.user_id = newUserResults[0].id;
      console.log(data);
      res.redirect(`http://localhost:${process.env.FRONTEND_SERVER_PORT}/home`);

    } catch (err) {
        console.error('Error authenticating with Google:', err);
        return res.status(500).send('Error authenticating with Google');
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    const session: any = req.session;
    if (session.user_id) {
      try {
        const results = await query('select * from users where id = ?', [session.user_id]);
        if (results.length > 0) {
          res.status(200).send(results[0]);
        } else {
          res.status(404).send('User not found');
        }
      } catch (err) {
        console.log(err);
        res.status(500).send('Error getting user');
      }
    } else {
      res.status(401).send('User not logged in');
    }
  }
  
  async verify(req: Request, res: Response, next: NextFunction) {
    console.log('Verifying email')
    const token = req.query.token;
    if (!token) {
      return res.status(400).send('No token provided');
    }
    try {
      const tokenResults = await query('select user_id from VerificationTokens where token = ?', [token]);
      if (tokenResults.length > 0) {
        await query('update users set is_email_verified = 1 where id = ?', [tokenResults[0].user_id]);
        await query('delete from VerificationTokens where token = ?', [token]);
        await query('delete from VerificationTokens where user_id = ?', [tokenResults[0].user_id]);
        return res.status(200).send('Email verified');
      } else {
        return res.status(400).send('Invalid token');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Error verifying email');
    }
  }
}

export default AuthController;
