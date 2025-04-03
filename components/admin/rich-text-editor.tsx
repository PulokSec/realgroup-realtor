"use client"

import { useEffect, useState } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    (async () => {
      const [{ CKEditor }, { default: ClassicEditor }] = await Promise.all([
        import('@ckeditor/ckeditor5-react'),
        import('@ckeditor/ckeditor5-build-classic')
      ])

      setEditor(() => (props: any) => (
        <CKEditor
          editor={ClassicEditor}
          {...props}
        />
      ))
    })()
  }, [])

  return Editor ? (
    <Editor
      data={value}
      onChange={(_event: any, editor: any) => {
        const data = editor.getData()
        onChange(data)
      }}
      config={{
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "outdent",
          "indent",
          "|",
          "blockQuote",
          "insertTable",
          "mediaEmbed",
          "undo",
          "redo",
        ],
      }}
    />
  ) : (
    <div className="h-64 border rounded-md flex items-center justify-center">
      Loading editor...
    </div>
  )
}