import mongoose from "mongoose"

export interface IVerificationCode extends mongoose.Document {
  email: string
  code: string
  expires: Date
  createdAt: Date
}

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create an index that automatically expires documents
verificationCodeSchema.index({ expires: 1 }, { expireAfterSeconds: 0 })

export const VerificationCode =
  mongoose.models.VerificationCode || mongoose.model<IVerificationCode>("VerificationCode", verificationCodeSchema)

