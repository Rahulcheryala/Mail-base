import dotenv from "dotenv";
import { createTransporter } from "../services/gmailauth.js";

dotenv.config();

/**
 * Sends an email using the authenticated user's Gmail account via OAuth2.
 *
 * @param {Object} params - Email parameters
 * @param {string} params.userId - MongoDB user ID
 * @param {Object} params.db - MongoDB database instance
 * @param {string} params.to - Recipient's email address
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Email body text
 */
export const sendEmail = async ({ userId, db, to, subject, text }) => {
  try {
    const transporter = await createTransporter(userId, db);
    console.log("@@@@@@")
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const fromEmail = user.gmail.gmailEmail;

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      text,
    };
    console.log("#######")
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};
