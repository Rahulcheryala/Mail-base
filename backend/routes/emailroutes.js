import express from 'express';
import Email from '../models/emailmodel.js';

const router = express.Router();

// Route to fetch all email IDs, names, companies, and roles
router.get('/fetchemailsandnames', async (req, res) => {
  try {
    const emails = await Email.find({}, 'name email company role');
    res.status(200).json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emails', error: err.message });
  }
});

// Route to fetch all emails
router.get('/', async (req, res) => {
  try {
    const emails = await Email.find();
    res.status(200).json({ message: 'Emails fetched successfully', emails });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emails', error: err.message });
  }
});

// Route to fetch an email by ID
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(200).json({ message: 'Email fetched successfully', email });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching email', error: err.message });
  }
});

// Route to add a new email
router.post('/', async (req, res) => {
  const { name, email, company, role } = req.body;

  if (!name || !email || !company || !role) {
    return res.status(400).json({ message: 'All fields are required: name, email, company, role.' });
  }

  try {
    const newEmail = new Email({ name, email, company, role });
    await newEmail.save();
    res.status(201).json({ message: 'Email added successfully', email: newEmail });
  } catch (error) {
    res.status(500).json({ message: 'Error adding email', error: error.message });
  }
});

// Route to update an email by ID
router.put('/:id', async (req, res) => {
  const { name, email, company, role } = req.body;

  if (!name || !email || !company || !role) {
    return res.status(400).json({ message: 'All fields are required: name, email, company, role.' });
  }

  try {
    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      { name, email, company, role },
      { new: true }
    );

    if (!updatedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.status(200).json({ message: 'Email updated successfully', email: updatedEmail });
  } catch (err) {
    res.status(500).json({ message: 'Error updating email', error: err.message });
  }
});

// Route to delete an email by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmail = await Email.findByIdAndDelete(req.params.id);
    if (!deletedEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(204).json({ message: 'Email deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting email', error: err.message });
  }
});

export default router;
