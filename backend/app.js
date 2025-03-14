import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailroutes.js';
import emailTemplateRoutes from './routes/emailtemplateroutes.js';
import coverLetterTemplateRoutes from './routes/coverlettertemplateroutes.js';
import authRoutes from "./routes/authroutes.js";
import bulkEmailRoutes from "./routes/bulkemailroutes.js";
import cors from "cors";

dotenv.config();  // Load environment variables
console.log("Cliend ID:", process.env.CLIENT_ID)

const app = express();
app.use(cors({
  origin: 'http://localhost:3002', 
  credentials: true                
}));

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 5005;
console.log(mongoURI);
// Middleware to parse JSON body data
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// Connect to MongoDB with Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Pass Mongoose connection to routes
app.use((req, res, next) => {
  req.db = mongoose.connection;  // Making the MongoDB connection available
  next();
});

app.use('/emails', emailRoutes);
app.use('/emailtemplates', emailTemplateRoutes);
app.use('/coverlettertemplates', coverLetterTemplateRoutes);
app.use("/auth", authRoutes);
app.use("/bulkemails", bulkEmailRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
