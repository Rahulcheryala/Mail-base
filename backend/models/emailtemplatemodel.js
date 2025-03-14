import mongoose from 'mongoose';

// Define the schema for email templates
const emailTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title for easy display in dropdowns (e.g., "Tech Role Outreach")
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true, // Can include placeholders like {name}, {company}, etc.
  },
  templateType: {
    type: String,
    required: true, // Category/type of template (e.g., 'hr-outreach', 'follow-up')
  },
  placeholders: {
    type: [String],
    default: ['{name}', '{company}', '{role}'], // Optional list of supported placeholders
  },
}, {
  timestamps: true, // Automatically includes createdAt and updatedAt
});

// Create a model based on the schema
const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
