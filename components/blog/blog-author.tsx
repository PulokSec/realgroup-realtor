import Image from "next/image"

interface AuthorProps {
  author: {
    name: string
    image: string
    bio: string
  }
}

export function BlogAuthor({ author }: AuthorProps) {
  return (
    <div className="border-t border-b py-8 my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden flex-shrink-0">
          <Image src={author.image || "/placeholder.svg"} alt={author.name} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{author.name}</h3>
          <p className="text-gray-600">{author.bio}</p>
        </div>
      </div>
    </div>
  )
}

