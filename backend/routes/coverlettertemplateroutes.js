import express from 'express';
import CoverLetterTemplate from '../models/coverlettertemplatemodel.js';

const router = express.Router();

// Route to fetch the global cover letter template
router.get('/global', async (req, res) => {
  try {
    const globalCoverLetter = await CoverLetterTemplate.findOne({ templateType: 'global' });
    if (!globalCoverLetter) {
      return res.status(404).json({ message: 'No global cover letter template found' });
    }
    res.status(200).json(globalCoverLetter);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving global cover letter template', error: err.message });
  }
});

// Create a new cover letter template
router.post('/', async (req, res) => {
  const { title, subject, body, templateType, placeholders } = req.body;

  if (!title || !subject || !body || !templateType) {
    return res.status(400).json({ message: 'Title, Subject, Body, and Template Type are required.' });
  }

  try {
    const newCoverLetterTemplate = new CoverLetterTemplate({
      title,
      subject,
      body,
      templateType,
      placeholders: placeholders || ['{name}', '{company}', '{position}']
    });

    await newCoverLetterTemplate.save();
    res.status(201).json({
      message: 'Cover letter template created successfully',
      coverLetterTemplate: newCoverLetterTemplate
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating cover letter template', error: err.message });
  }
});

// Get all cover letter templates
router.get('/', async (req, res) => {
  try {
    const coverLetterTemplates = await CoverLetterTemplate.find();
    res.status(200).json(coverLetterTemplates);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cover letter templates', error: err.message });
  }
});

// Get a cover letter template by ID
router.get('/:id', async (req, res) => {
  try {
    const coverLetterTemplate = await CoverLetterTemplate.findById(req.params.id);
    if (!coverLetterTemplate) {
      return res.status(404).json({ message: 'Cover letter template not found' });
    }
    res.status(200).json(coverLetterTemplate);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cover letter template', error: err.message });
  }
});

// Update a cover letter template by ID
router.put('/:id', async (req, res) => {
  const { title, subject, body, templateType, placeholders } = req.body;

  if (!title || !subject || !body || !templateType) {
    return res.status(400).json({ message: 'Title, Subject, Body, and Template Type are required.' });
  }

  try {
    const updatedCoverLetterTemplate = await CoverLetterTemplate.findByIdAndUpdate(
      req.params.id,
      { title, subject, body, templateType, placeholders },
      { new: true }
    );

    if (!updatedCoverLetterTemplate) {
      return res.status(404).json({ message: 'Cover letter template not found' });
    }

    res.status(200).json({
      message: 'Cover letter template updated successfully',
      coverLetterTemplate: updatedCoverLetterTemplate
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cover letter template', error: err.message });
  }
});

// Delete a cover letter template by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCoverLetterTemplate = await CoverLetterTemplate.findByIdAndDelete(req.params.id);
    if (!deletedCoverLetterTemplate) {
      return res.status(404).json({ message: 'Cover letter template not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting cover letter template', error: err.message });
  }
});

export default router;
