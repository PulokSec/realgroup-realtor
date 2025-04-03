import { Star } from "lucide-react"

export function BlogRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : i < rating
                ? "text-yellow-400 fill-yellow-400 opacity-50"
                : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

