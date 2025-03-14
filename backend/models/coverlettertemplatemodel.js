import mongoose from 'mongoose';

const coverLetterTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Useful for UI dropdowns or easier identification
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true, // Can contain placeholders like {name}, {company}, {position}
  },
  templateType: {
    type: String,
    default: 'cover-letter',
  },
  placeholders: {
    type: [String],
    default: ['{name}', '{company}', '{position}'], // Optional: helps parse & personalize dynamically
  },
}, { timestamps: true });

const CoverLetterTemplate = mongoose.models.CoverLetterTemplate || mongoose.model('CoverLetterTemplate', coverLetterTemplateSchema);

export default CoverLetterTemplate;
