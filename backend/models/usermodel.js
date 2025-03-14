import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },

    // Gmail OAuth2 fields
    gmail: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiryDate: { type: Number }, // Timestamp in milliseconds
      gmailEmail: { type: String }  // This will be used as 'from' in email
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});


// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcryptjs.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
