import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import type { JSONContent } from '@tiptap/core'

export const EMPTY_DOC: JSONContent = { type: 'doc', content: [] }

export function hasTiptapText(doc: JSONContent | null | undefined): boolean {
  if (!doc) return false
  if (typeof doc.text === 'string' && doc.text.trim() !== '') return true
  return (doc.content ?? []).some(hasTiptapText)
}

export function diaryEditorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder }),
  ]
}
