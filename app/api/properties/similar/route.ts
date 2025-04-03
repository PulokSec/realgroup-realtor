import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Property } from "@/lib/models/property"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/user"

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    

    await connectDB()
    const cookieStore = await cookies()
            const token = cookieStore.get("auth_token")?.value
        const user = token ? await getUserFromToken(token) : null
    
        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get("id")
    console.log(id);

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    // Find the reference property
    const property = await Property.findOne({ "properties.listing_id": id }).lean()

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Extract relevant details for finding similar properties
    let numericPrice: number
    let type: string, city: string, province: string

    if (!Array.isArray(property) && property.properties) {
      const { type: propType, price, city: propCity, province: propProvince, bedrooms_total } = property.properties
      type = propType
      city = propCity
      province = propProvince
      numericPrice = Number.parseFloat(price)
    } else {
      return NextResponse.json({ error: "Invalid property data" }, { status: 400 })
    }

    // Define price range (±20% of the reference property's price)
    const minPrice = numericPrice * 0.8
    const maxPrice = numericPrice * 1.2

    // Find similar properties
    const similarProperties = await Property.find({
      "properties.id": { $ne: id }, // Exclude the reference property
      "properties.type": type,
      "properties.price": { $gte: minPrice.toString(), $lte: maxPrice.toString() },
      $or: [
        { "properties.city": { $regex: new RegExp(city, "i") } },
        { "properties.province": { $regex: new RegExp(province, "i") } },
      ],
    })
      .sort({ "properties.last_updated": -1 })
      .limit(5)
      .lean()

    // Convert Map to Object for all_photos if it exists
    similarProperties.forEach((prop) => {
      if (prop.properties.all_photos instanceof Map) {
        const photosObj: Record<string, string> = {}
        prop.properties.all_photos.forEach((value: string, key: string) => {
          photosObj[key] = value
        })
        prop.properties.all_photos = photosObj
      }
    })

    return NextResponse.json(similarProperties)
  } catch (error) {
    console.error("Error fetching similar properties:", error)
    return NextResponse.json({ error: "Failed to fetch similar properties" }, { status: 500 })
  }
}

