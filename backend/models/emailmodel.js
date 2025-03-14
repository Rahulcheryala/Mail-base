import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  name: { type: String, required: true },     // HR Name
  email: { type: String, required: true, unique: true },
  company: { type: String, required: true },  // Company Name
  role: { type: String, required: true },     // Role Name
});

const Email = mongoose.model('Email', emailSchema);

export default Email;
