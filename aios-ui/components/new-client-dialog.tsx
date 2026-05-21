'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import type { Bucket } from '@/lib/types'

const BUCKETS: { value: Bucket; label: string; hint: string }[] = [
  { value: 'paying', label: 'Paying', hint: 'Active recurring revenue.' },
  { value: 'prospects', label: 'Prospects', hint: 'Lead or in-progress sales conversation.' },
  { value: 'internal', label: 'Internal', hint: 'Bearded Ginger / 2RM / personal — not a client.' },
]

interface NewClientDialogProps {
  triggerVariant?: 'default' | 'outline' | 'ghost'
  triggerLabel?: string
}

export function NewClientDialog({
  triggerVariant = 'outline',
  triggerLabel = 'New client',
}: NewClientDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDirty, setSlugDirty] = useState(false)
  const [bucket, setBucket] = useState<Bucket>('prospects')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const derivedSlug = useMemo(() => slugify(name), [name])
  const effectiveSlug = slugDirty ? slug : derivedSlug

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes so the next open is clean.
      setName('')
      setSlug('')
      setSlugDirty(false)
      setBucket('prospects')
      setNotes('')
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  const submitDisabled = submitting || name.trim().length === 0 || effectiveSlug.length === 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitDisabled) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: effectiveSlug,
          bucket,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Status ${res.status}` }))
        throw new Error(typeof body.error === 'string' ? body.error : `Status ${res.status}`)
      }
      const body = (await res.json()) as { client: { slug: string } }
      setOpen(false)
      // Navigate to the new client page so the user immediately sees their entry.
      router.push(`/clients/${body.client.slug}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} size="sm">
            <Plus className="h-3.5 w-3.5" />
            <span className="ml-1.5 text-xs">{triggerLabel}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>
            Adds a row to clients.yaml. You can add projects after creation, or run /onboard-client later to scaffold memory and references.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Name" htmlFor="new-client-name" required>
            <input
              id="new-client-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Inside Out Iowa"
              autoFocus
              required
              className={inputClass}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="new-client-slug"
            hint={slugDirty ? 'Custom — must be kebab-case' : 'Auto-derived from name'}
          >
            <input
              id="new-client-slug"
              type="text"
              value={effectiveSlug}
              onChange={e => {
                setSlugDirty(true)
                setSlug(e.target.value)
              }}
              placeholder="inside-out"
              className={cn(inputClass, 'font-mono text-xs')}
            />
          </Field>

          <Field label="Bucket" htmlFor="new-client-bucket-radiogroup" required>
            <div id="new-client-bucket-radiogroup" role="radiogroup" className="grid grid-cols-3 gap-2">
              {BUCKETS.map(b => (
                <label
                  key={b.value}
                  className={cn(
                    'border border-border rounded-md px-3 py-2 cursor-pointer transition-colors text-center',
                    bucket === b.value ? 'bg-muted border-foreground/30' : 'hover:bg-muted/40',
                  )}
                  title={b.hint}
                >
                  <input
                    type="radio"
                    name="new-client-bucket"
                    value={b.value}
                    checked={bucket === b.value}
                    onChange={() => setBucket(b.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{b.label}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Notes" htmlFor="new-client-notes" hint="Optional. One short line of context.">
            <textarea
              id="new-client-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What's load-bearing about this client?"
              className={cn(inputClass, 'resize-y')}
            />
          </Field>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitDisabled}>
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="ml-1.5 text-xs">{submitting ? 'Creating…' : 'Create client'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/70'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, htmlFor, hint, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
        {label}{required && <span className="text-foreground/60 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
