"use client"

import { useEffect, useRef } from "react"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize editor with initial value
    if (editorRef.current) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted p-2 border-b flex gap-2">
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("bold", false)}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("italic", false)}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("underline", false)}
        >
          <u>U</u>
        </button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("insertUnorderedList", false)}
        >
          • List
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("insertOrderedList", false)}
        >
          1. List
        </button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => {
            const url = prompt("Enter link URL")
            if (url) document.execCommand("createLink", false, url)
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/20 rounded"
          onClick={() => document.execCommand("removeFormat", false)}
        >
          Clear
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] p-4 focus:outline-none"
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}

