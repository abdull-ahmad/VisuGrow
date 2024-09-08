import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

let userEmail = process.env.SENDER_EMAIL;
let clientID= process.env.EMAIL_CLIENTID;
let clientSecret= process.env.EMAIL_CLIENTSECRET;
let token= process.env.REFRESH_TOKEN;
let OAuth2Client = new google.auth.OAuth2(clientID, clientSecret, "https://developers.google.com/oauthplayground");

OAuth2Client.setCredentials({ refresh_token: token });

let accessToken = OAuth2Client.getAccessToken().toString();

export const sender = {
  email: userEmail,
  name: "Visugrow",
};

export const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: userEmail,
    clientId: clientID,
    clientSecret: clientSecret ,
    refreshToken: token,
    accessToken: accessToken,
  },
});