import { createTransporter } from "./gmailauth.js";
import EmailTemplate from "../models/emailtemplatemodel.js";

export const sendBulkEmails = async (userId, emailTemplateId, recipientEmails, db) => {
  const transporter = await createTransporter(userId, db);

  // Fetch the email template
  const emailTemplate = await EmailTemplate.findById(emailTemplateId);
  if (!emailTemplate) throw new Error("Email template not found!");

  const { subject, body } = emailTemplate;

  const results = [];

  for (let recipient of recipientEmails) {
    try {
      // Customize subject and body for each recipient
      const customizedSubject = subject
        .replace(/{{name}}/g, recipient.name)
        .replace(/{{company}}/g, recipient.company)
        .replace(/{{role}}/g, recipient.role);

      const customizedBody = body
        .replace(/{{name}}/g, recipient.name)
        .replace(/{{company}}/g, recipient.company)
        .replace(/{{role}}/g, recipient.role);

      const info = await transporter.sendMail({
        from: `${transporter.options.auth.user}`,
        to: recipient.email, // recipient must have .email field
        subject: customizedSubject,
        html: customizedBody,
      });

      results.push({
        recipient: recipient.email,
        status: "success",
        messageId: info.messageId,
      });
    } catch (error) {
      console.error("Error sending to", recipient.email, ":", error.message);
      results.push({
        recipient: recipient.email,
        status: "error",
        error: error.message,
      });
    }
  }

  return results;
};
