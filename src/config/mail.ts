import * as nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport(
  {
    host: 'smtp.daum.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PW,
    },
  },
);