"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"

export default function TipTapEditor({
    value,
    onChange,
    disabled
} : {
    value: string,
    onChange: (val: string) => void,
    disabled?: boolean 
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || "",
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        }
    })

// aktualizacja wartości formularza w przypadku resetu
useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);
    return (
        <div>
            <EditorContent editor={editor}/>
        </div>
    )
}