import mongoose from "mongoose"

const adminWhitelistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin"],
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const AdminWhitelist = mongoose.models.AdminWhitelist || mongoose.model("AdminWhitelist", adminWhitelistSchema)

