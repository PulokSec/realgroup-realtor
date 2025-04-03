import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
