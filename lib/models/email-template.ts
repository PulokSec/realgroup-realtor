import mongoose from "mongoose"

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
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

export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema)

