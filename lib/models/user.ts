import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
  email: string
  fullName: string
  phoneNumber: string
  emailVerified: boolean
  isAdmin: boolean
  role: "user" | "admin"
  notificationPreferences: {
    webNotifications: boolean
    emailNotifications: boolean
    browsingHistory: boolean
  }
  savedSearches: mongoose.Types.ObjectId[]
  savedHomes: mongoose.Types.ObjectId[]
  createdAt: Date
  lastLogin: Date
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  notificationPreferences: {
    webNotifications: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    browsingHistory: {
      type: Boolean,
      default: true,
    },
  },
  savedSearches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Search",
    },
  ],
  savedHomes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
})

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)

