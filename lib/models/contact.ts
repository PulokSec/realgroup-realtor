import mongoose from "mongoose"

export interface IContact extends mongoose.Document {
  name: string
  email: string
  phoneNumber?: string
  message: string
  status: "new" | "in-progress" | "completed"
  createdAt: Date
}

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: String,
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["new", "in-progress", "completed"],
    default: "new",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema)

