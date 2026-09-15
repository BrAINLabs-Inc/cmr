import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ExternalLink,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react'
import { diaryEditorExtensions } from '@/lib/tiptap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const extensions = diaryEditorExtensions('Start writing…')

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-primary/10 text-primary'
      )}
    >
      {children}
    </button>
  )
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function LinkToolbarButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const active = editor.isActive('link')

  function handleOpenChange(next: boolean) {
    if (next) setUrl((editor.getAttributes('link').href as string | undefined) ?? '')
    setOpen(next)
  }

  function applyLink(e: FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: normalizeUrl(trimmed) }).run()
    setOpen(false)
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Link"
          aria-pressed={active}
          title="Link"
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            active && 'bg-primary/10 text-primary'
          )}
        >
          <LinkIcon className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <form onSubmit={applyLink} className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{active ? 'Edit link' : 'Add link'}</p>
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            {active ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeLink}
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="size-3.5" />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {active && url.trim() && (
                <Button type="button" variant="ghost" size="icon-sm" asChild>
                  <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}
              <Button type="submit" size="sm" disabled={!url.trim()}>
                {active ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

type DiaryEditorProps = {
  initialContent: JSONContent
  editable: boolean
  onUpdate: (content: JSONContent, plainText: string) => void
}

export function DiaryEditor({ initialContent, editable, onUpdate }: DiaryEditorProps) {
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: 'diary-prose min-h-[45vh] text-foreground focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onUpdate(editor.getJSON(), editor.getText()),
  })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  if (!editor) return null

  return (
    <div className="space-y-3">
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-muted/30 p-1">
          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton
            label="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="size-4" />
          </ToolbarButton>
          <LinkToolbarButton editor={editor} />

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton
            label="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
