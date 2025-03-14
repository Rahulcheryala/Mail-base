import express from 'express';
import EmailTemplate from '../models/emailtemplatemodel.js';

const router = express.Router();

// Route to fetch the global email template
router.get('/global', async (req, res) => {
  try {
    const globalTemplate = await EmailTemplate.findOne({ templateType: 'global' });
    if (!globalTemplate) {
      return res.status(404).json({ message: 'No global email template found' });
    }
    res.status(200).json(globalTemplate);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving global email template', error: err.message });
  }
});

// Route to fetch all email templates
router.get('/', async (req, res) => {
  try {
    const emailTemplates = await EmailTemplate.find();
    res.status(200).json({ message: 'Email templates fetched successfully', emailTemplates });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching email templates', error: err.message });
  }
});

// Route to fetch an email template by ID
router.get('/:id', async (req, res) => {
  try {
    const emailTemplate = await EmailTemplate.findById(req.params.id);
    if (!emailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(200).json({ message: 'Email template fetched successfully', emailTemplate });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching email template', error: err.message });
  }
});

// Route to add a new email template
router.post('/', async (req, res) => {
  const { title, subject, body, templateType, placeholders } = req.body;

  if (!title || !subject || !body || !templateType) {
    return res.status(400).json({ message: 'Title, Subject, Body, and Template Type are required.' });
  }

  try {
    const newEmailTemplate = new EmailTemplate({
      title,
      subject,
      body,
      templateType,
      placeholders: placeholders || ['{name}', '{company}', '{position}'], // Optional field
    });

    await newEmailTemplate.save();
    res.status(201).json({ message: 'Email template added successfully', emailTemplate: newEmailTemplate });
  } catch (error) {
    res.status(500).json({ message: 'Error adding email template', error: error.message });
  }
});

// Route to update an email template by ID
router.put('/:id', async (req, res) => {
  const { title, subject, body, templateType, placeholders } = req.body;

  if (!title || !subject || !body || !templateType) {
    return res.status(400).json({ message: 'Title, Subject, Body, and Template Type are required.' });
  }

  try {
    const updatedEmailTemplate = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { title, subject, body, templateType, placeholders },
      { new: true }
    );
    if (!updatedEmailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(200).json({ message: 'Email template updated successfully', emailTemplate: updatedEmailTemplate });
  } catch (err) {
    res.status(500).json({ message: 'Error updating email template', error: err.message });
  }
});

// Route to delete an email template by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmailTemplate = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!deletedEmailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(204).json({ message: 'Email template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting email template', error: err.message });
  }
});

export default router;
