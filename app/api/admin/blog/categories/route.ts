import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Category } from "@/lib/models/category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().lean();

    return NextResponse.json({ categories: categories.map(cat => cat.name) });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req : NextRequest) {
  try {
    await connectDB();

    const { category } = await req.json();
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: category });
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    // Create new category
    await Category.create({ name: category });

    return NextResponse.json({ message: "Category added successfully" });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}