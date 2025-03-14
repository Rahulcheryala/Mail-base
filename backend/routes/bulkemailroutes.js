import express from 'express';
import { getAuthUrl, handleOAuth2Callback, createTransporter } from '../services/gmailauth.js';
import path from 'path';
import fs from 'fs';
import EmailTemplate from '../models/emailtemplatemodel.js';

const router = express.Router();

// ✅ Add back the Google Auth URL route
router.get("/auth-url", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const authUrl = getAuthUrl(userId);
    res.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// ✅ Add back the OAuth2 callback route
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  console.log(req.query);
  if (!code || !state) {
    return res.status(400).json({ error: "Missing authorization code or userId (state)" });
  }

  try {
    await handleOAuth2Callback(req, res);
  } catch (err) {
    console.error("Error in OAuth Callback:", err);
    res.status(500).json({ error: "Failed to handle callback", message: err.message });
  }
});

// ✅ Your bulk email logic (unchanged)
router.post("/send-bulk-emails", async (req, res) => {
  console.log(req.body);
  const { userId, emailTemplateId, recipients } = req.body;
  const db = req.db;

  if (!userId || !emailTemplateId || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Missing required fields or invalid recipients" });
  }

  try {
    const emailTemplate = await EmailTemplate.findById(emailTemplateId);
    if (!emailTemplate) {
      return res.status(404).json({ error: "Email template not found" });
    }

    const subject = emailTemplate.subject;
    const template = emailTemplate.body;

    const { transporter, userEmail,updatedAccessToken,refreshToken } = await createTransporter(userId, db);
    console.log(transporter, userEmail);
    if (!transporter || !userEmail) {
      return res.status(401).json({ error: "Failed to authenticate with Gmail." });
    }

    const results = [];

    for (const recipient of recipients) {
      const customizedText = template
        .replace(/{{name}}/g, recipient.name || "")
        .replace(/{{company}}/g, recipient.company || "")
        .replace(/{{jobTitle}}/g, recipient.jobTitle || "");

      const attachments = [];
      if (recipient.resumePath) {
        const resumeFullPath = path.resolve(recipient.resumePath);
        if (fs.existsSync(resumeFullPath)) {
          attachments.push({
            filename: path.basename(resumeFullPath),
            path: resumeFullPath,
          });
        } else {
          console.warn(`Resume not found for ${recipient.email}`);
        }
      }

      const mailOptions = {
        from: userEmail,
        to: recipient.email,
        subject,
        text: customizedText,
        attachments,
        auth: {
          user: userEmail,
          refreshToken: refreshToken,
          accessToken: updatedAccessToken
        },
      };
      console.log(mailOptions);
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${recipient.email}`);
        results.push({ email: recipient.email, status: "success", response: info.response });
      } catch (error) {
        console.error(`❌ Failed to send to ${recipient.email}:`, error.message);
        results.push({ email: recipient.email, status: "failed", error: error.message });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.status(200).json({ message: "Emails processed", results });

  } catch (error) {
    console.error("❌ Error in send-bulk-emails:", error);
    res.status(500).json({ error: "Failed to send emails", message: error.message });
  }
});

export default router;
