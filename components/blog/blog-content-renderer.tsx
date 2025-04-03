import { cn } from "@/lib/utils"

interface BlogContentRendererProps {
  content: string
  className?: string
}

export function BlogContentRenderer({ content, className }: BlogContentRendererProps) {
  // Try to parse the content as Slate JSON
  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch (e) {
    // If parsing fails, it's probably plain text or HTML
    return <div className={cn("prose max-w-none", className)} dangerouslySetInnerHTML={{ __html: content }} />
  }

  // If we have parsed content, render it as React components
  return (
    <div className={cn("prose max-w-none", className)}>
      {parsedContent.map((node: any, i: number) => renderNode(node, i))}
    </div>
  )
}

function renderNode(node: any, index: number) {
  const { type, children, align, url } = node

  const textAlign = align ? { textAlign: align } : {}

  switch (type) {
    case "paragraph":
      return (
        <p key={index} style={textAlign}>
          {children.map((child: any, i: number) => renderText(child, i))}
        </p>
      )
    case "heading-one":
      return (
        <h1 key={index} style={textAlign}>
          {children.map((child: any, i: number) => renderText(child, i))}
        </h1>
      )
    case "heading-two":
      return (
        <h2 key={index} style={textAlign}>
          {children.map((child: any, i: number) => renderText(child, i))}
        </h2>
      )
    case "heading-three":
      return (
        <h3 key={index} style={textAlign}>
          {children.map((child: any, i: number) => renderText(child, i))}
        </h3>
      )
    case "block-quote":
      return (
        <blockquote key={index} style={textAlign}>
          {children.map((child: any, i: number) => renderText(child, i))}
        </blockquote>
      )
    case "numbered-list":
      return <ol key={index}>{children.map((child: any, i: number) => renderNode(child, i))}</ol>
    case "bulleted-list":
      return <ul key={index}>{children.map((child: any, i: number) => renderNode(child, i))}</ul>
    case "list-item":
      return (
        <li key={index}>
          {children.map((child: any, i: number) =>
            typeof child.text === "undefined" ? renderNode(child, i) : renderText(child, i),
          )}
        </li>
      )
    case "image":
      return (
        <div key={index}>
          <img src={url || "/placeholder.svg"} alt="" className="max-w-full h-auto my-4" />
        </div>
      )
    case "link":
      return (
        <a key={index} href={url} className="text-blue-500 underline">
          {children.map((child: any, i: number) => renderText(child, i))}
        </a>
      )
    default:
      return null
  }
}

function renderText(node: any, index: number) {
  const { text, bold, italic, underline, code } = node

  let renderedText = text

  if (bold) {
    renderedText = <strong key={index}>{renderedText}</strong>
  }

  if (italic) {
    renderedText = <em key={index}>{renderedText}</em>
  }

  if (underline) {
    renderedText = <u key={index}>{renderedText}</u>
  }

  if (code) {
    renderedText = (
      <code key={index} className="bg-gray-100 px-1 rounded">
        {renderedText}
      </code>
    )
  }

  return renderedText
}

