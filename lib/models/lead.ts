import mongoose from "mongoose"

export interface ILead extends mongoose.Document {
  fullName: string
  email: string
  phoneNumber: string
  source: string
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  notes: string
  createdAt: Date
  updatedAt: Date
}

const leadSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: "website",
  },
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "converted", "lost"],
    default: "new",
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export const Lead = mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema)

