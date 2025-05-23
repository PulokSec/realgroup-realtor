import mongoose from "mongoose"

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  type: "system" | "property" | "message" | "lead"
  title: string
  message: string
  read: boolean
  createdAt: Date
}

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["system", "property", "message", "lead"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema)

