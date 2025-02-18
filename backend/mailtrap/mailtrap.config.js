// const { MailtrapClient } = require("mailtrap");
import {MailtrapClient} from "mailtrap";
import dotenv from "dotenv";

dotenv.config();


export const Client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: "DEMO@demomailtrap.com",
  name: "DEMO",
};
