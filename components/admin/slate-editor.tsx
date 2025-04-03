"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { Slate, Editable, withReact, useSlate } from "slate-react"
import { createEditor, type Descendant, Editor, Element as SlateElement, Transforms, Range } from "slate"
import { withHistory } from "slate-history"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Quote,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { BaseEditor } from "slate"

// Define custom element types
type CustomElement = {
  type:
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "block-quote"
    | "numbered-list"
    | "bulleted-list"
    | "list-item"
    | "image"
    | "link"
  align?: "left" | "center" | "right"
  url?: string
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
}

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor 
    Element: CustomElement
    Text: CustomText
  }
}

type SlateEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

const SlateEditor: React.FC<SlateEditorProps> = ({ value, onChange }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  // Define a rendering function based on the element type
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case "heading-one":
        return <Heading1Element {...props} />
      case "heading-two":
        return <Heading2Element {...props} />
      case "heading-three":
        return <Heading3Element {...props} />
      case "block-quote":
        return <BlockquoteElement {...props} />
      case "numbered-list":
        return <ol {...props.attributes}>{props.children}</ol>
      case "bulleted-list":
        return <ul {...props.attributes}>{props.children}</ul>
      case "list-item":
        return <li {...props.attributes}>{props.children}</li>
      case "image":
        return <ImageElement {...props} />
      case "link":
        return <LinkElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // Define a rendering function for text formatting
  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />
  }, [])

  return (
    <div className="border rounded-md">
      <Slate editor={editor} value={value} onChange={onChange}>
        <Toolbar />
        <div className="p-4">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            className="min-h-[200px] focus:outline-none"
          />
        </div>
      </Slate>
    </div>
  )
}

// Element components
const DefaultElement = (props: any) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }
  return (
    <p style={style} {...attributes}>
      {children}
    </p>
  )
}

const Heading1Element = (props: any) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }
  return (
    <h1 style={style} className="text-3xl font-bold my-4" {...attributes}>
      {children}
    </h1>
  )
}

const Heading2Element = (props: any) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }
  return (
    <h2 style={style} className="text-2xl font-bold my-3" {...attributes}>
      {children}
    </h2>
  )
}

const Heading3Element = (props: any) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }
  return (
    <h3 style={style} className="text-xl font-bold my-2" {...attributes}>
      {children}
    </h3>
  )
}

const BlockquoteElement = (props: any) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }
  return (
    <blockquote style={style} className="border-l-4 border-gray-300 pl-4 italic my-4" {...attributes}>
      {children}
    </blockquote>
  )
}

const ImageElement = (props: any) => {
  const { attributes, children, element } = props
  return (
    <div {...attributes}>
      <div contentEditable={false} className="my-4">
        <img src={element.url || "/placeholder.svg"} alt="" className="max-w-full h-auto" />
      </div>
      {children}
    </div>
  )
}

const LinkElement = (props: any) => {
  const { attributes, children, element } = props
  return (
    <a {...attributes} href={element.url} className="text-blue-500 underline">
      {children}
    </a>
  )
}

// Leaf component for text formatting
const Leaf = (props: any) => {
  let { attributes, children, leaf } = props

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.code) {
    children = <code className="bg-gray-100 px-1 rounded">{children}</code>
  }

  return <span {...attributes}>{children}</span>
}

// Toolbar component
const Toolbar = () => {
  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
      <TooltipProvider>
        <MarkButton format="bold" icon={<Bold className="h-4 w-4" />} tooltip="Bold" />
        <MarkButton format="italic" icon={<Italic className="h-4 w-4" />} tooltip="Italic" />
        <MarkButton format="underline" icon={<Underline className="h-4 w-4" />} tooltip="Underline" />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <BlockButton format="heading-one" icon={<Heading1 className="h-4 w-4" />} tooltip="Heading 1" />
        <BlockButton format="heading-two" icon={<Heading2 className="h-4 w-4" />} tooltip="Heading 2" />
        <BlockButton format="heading-three" icon={<Heading3 className="h-4 w-4" />} tooltip="Heading 3" />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <BlockButton format="block-quote" icon={<Quote className="h-4 w-4" />} tooltip="Quote" />
        <BlockButton format="numbered-list" icon={<ListOrdered className="h-4 w-4" />} tooltip="Numbered List" />
        <BlockButton format="bulleted-list" icon={<List className="h-4 w-4" />} tooltip="Bulleted List" />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <AlignButton format="left" icon={<AlignLeft className="h-4 w-4" />} tooltip="Align Left" />
        <AlignButton format="center" icon={<AlignCenter className="h-4 w-4" />} tooltip="Align Center" />
        <AlignButton format="right" icon={<AlignRight className="h-4 w-4" />} tooltip="Align Right" />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <InsertLinkButton icon={<Link className="h-4 w-4" />} tooltip="Insert Link" />
        <InsertImageButton icon={<Image className="h-4 w-4" />} tooltip="Insert Image" />
      </TooltipProvider>
    </div>
  )
}

// Helper button components
interface ToolbarButtonProps {
  icon: React.ReactNode
  tooltip: string
  isActive?: boolean
  onMouseDown: (event: React.MouseEvent) => void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, tooltip, isActive, onMouseDown }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", isActive && "bg-gray-200")}
          onMouseDown={onMouseDown}
        >
          {icon}
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

// Text formatting button
interface MarkButtonProps {
  format: keyof Omit<CustomText, "text">
  icon: React.ReactNode
  tooltip: string
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon, tooltip }) => {
  const editor = useSlate()

  const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format as keyof typeof marks] === true : false
  }

  const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  return (
    <ToolbarButton
      icon={icon}
      tooltip={tooltip}
      isActive={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    />
  )
}

// Block formatting button
interface BlockButtonProps {
  format: string
  icon: React.ReactNode
  tooltip: string
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon, tooltip }) => {
  const editor = useSlate()

  const isBlockActive = (editor: Editor, format: string) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
      }),
    )

    return !!match
  }

  const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format)
    const isList = format === "numbered-list" || format === "bulleted-list"

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ["numbered-list", "bulleted-list"].includes(n.type as string),
      split: true,
    })

    const newProperties: Partial<SlateElement> = {
      type: isActive ? "paragraph" : isList ? "list-item" : (format as any),
    }

    Transforms.setNodes(editor, newProperties)

    if (!isActive && isList) {
      const block = { type: format as any, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }

  return (
    <ToolbarButton
      icon={icon}
      tooltip={tooltip}
      isActive={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    />
  )
}

// Alignment button
interface AlignButtonProps {
  format: "left" | "center" | "right"
  icon: React.ReactNode
  tooltip: string
}

const AlignButton: React.FC<AlignButtonProps> = ({ format, icon, tooltip }) => {
  const editor = useSlate()

  const isAlignActive = (editor: Editor, format: string) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === format,
      }),
    )

    return !!match
  }

  const toggleAlign = (editor: Editor, format: string) => {
    const isActive = isAlignActive(editor, format)

    Transforms.setNodes(
      editor,
      { align: isActive ? undefined : (format as any) },
      { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) },
    )
  }

  return (
    <ToolbarButton
      icon={icon}
      tooltip={tooltip}
      isActive={isAlignActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleAlign(editor, format)
      }}
    />
  )
}

// Insert link button
interface InsertButtonProps {
  icon: React.ReactNode
  tooltip: string
}

const InsertLinkButton: React.FC<InsertButtonProps> = ({ icon, tooltip }) => {
  const editor = useSlate()

  const insertLink = (editor: Editor) => {
    const url = prompt("Enter a URL:")
    if (!url) return

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)

    const link: CustomElement = {
      type: "link",
      url,
      children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
      Transforms.insertNodes(editor, link)
    } else {
      Transforms.wrapNodes(editor, link, { split: true })
      Transforms.collapse(editor, { edge: "end" })
    }
  }

  return (
    <ToolbarButton
      icon={icon}
      tooltip={tooltip}
      onMouseDown={(event) => {
        event.preventDefault()
        insertLink(editor)
      }}
    />
  )
}

// Insert image button
const InsertImageButton: React.FC<InsertButtonProps> = ({ icon, tooltip }) => {
  const editor = useSlate()

  const insertImage = (editor: Editor) => {
    const url = prompt("Enter image URL:")
    if (!url) return

    const image: CustomElement = {
      type: "image",
      url,
      children: [{ text: "" }],
    }

    Transforms.insertNodes(editor, image)
  }

  return (
    <ToolbarButton
      icon={icon}
      tooltip={tooltip}
      onMouseDown={(event) => {
        event.preventDefault()
        insertImage(editor)
      }}
    />
  )
}

export default SlateEditor

