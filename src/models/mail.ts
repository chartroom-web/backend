import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

export async function sendMailToVertifyUsers(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  await transporter.verify();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: 'verify your email address',
    text: `Please click the following link to verify your email address: ${process.env.BACKEND_SERVER_PORT}/auth/verify?token=${token}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(info);
    }
  });
}