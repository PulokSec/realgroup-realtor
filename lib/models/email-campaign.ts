import mongoose from "mongoose"

const emailCampaignSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  listId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "sending", "sent", "completed", "failed"],
    default: "draft",
  },
  scheduledFor: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  stats: {
    sent: {
      type: Number,
      default: 0,
    },
    opened: {
      type: Number,
      default: 0,
    },
    clicked: {
      type: Number,
      default: 0,
    },
    bounced: {
      type: Number,
      default: 0,
    },
    unsubscribed: {
      type: Number,
      default: 0,
    },
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

export const EmailCampaign = mongoose.models.EmailCampaign || mongoose.model("EmailCampaign", emailCampaignSchema)

