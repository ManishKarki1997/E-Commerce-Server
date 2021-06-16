require("dotenv").config();
import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, html: string) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
