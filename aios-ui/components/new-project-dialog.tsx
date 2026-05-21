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
import type { ProjectStatus } from '@/lib/types'

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
]

interface NewProjectDialogProps {
  clientSlug: string
  clientName: string
  triggerVariant?: 'default' | 'outline' | 'ghost'
  triggerLabel?: string
}

export function NewProjectDialog({
  clientSlug,
  clientName,
  triggerVariant = 'outline',
  triggerLabel = 'Add project',
}: NewProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDirty, setSlugDirty] = useState(false)
  const [status, setStatus] = useState<ProjectStatus>('active')
  const [contract, setContract] = useState('')
  const [mrr, setMrr] = useState('')
  const [docsText, setDocsText] = useState('')
  const [contactsText, setContactsText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const derivedSlug = useMemo(() => slugify(name), [name])
  const effectiveSlug = slugDirty ? slug : derivedSlug

  useEffect(() => {
    if (!open) {
      setName('')
      setSlug('')
      setSlugDirty(false)
      setStatus('active')
      setContract('')
      setMrr('')
      setDocsText('')
      setContactsText('')
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

    const docs_paths = splitLines(docsText)
    const contacts = splitLines(contactsText)
    const mrr_monthly = mrr.trim() === '' ? undefined : Number(mrr)
    if (mrr_monthly !== undefined && Number.isNaN(mrr_monthly)) {
      setError('MRR must be a number')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: effectiveSlug,
          status,
          contract: contract.trim() || undefined,
          mrr_monthly,
          docs_paths: docs_paths.length > 0 ? docs_paths : undefined,
          contacts: contacts.length > 0 ? contacts : undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Status ${res.status}` }))
        throw new Error(typeof body.error === 'string' ? body.error : `Status ${res.status}`)
      }
      const body = (await res.json()) as { project: { slug: string } }
      setOpen(false)
      router.push(`/clients/${clientSlug}/projects/${body.project.slug}`)
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
          <DialogTitle>New project for {clientName}</DialogTitle>
          <DialogDescription>
            Adds the project under <span className="font-mono">{clientSlug}</span> in clients.yaml.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Name" htmlFor="new-project-name" required>
            <input
              id="new-project-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Website redesign"
              autoFocus
              required
              className={inputClass}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="new-project-slug"
            hint={slugDirty ? 'Custom — must be kebab-case' : 'Auto-derived from name'}
          >
            <input
              id="new-project-slug"
              type="text"
              value={effectiveSlug}
              onChange={e => {
                setSlugDirty(true)
                setSlug(e.target.value)
              }}
              placeholder="website-redesign"
              className={cn(inputClass, 'font-mono text-xs')}
            />
          </Field>

          <Field label="Status" htmlFor="new-project-status" required>
            <select
              id="new-project-status"
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contract" htmlFor="new-project-contract" hint="Free-form, e.g. $400/mo Bonsai">
              <input
                id="new-project-contract"
                type="text"
                value={contract}
                onChange={e => setContract(e.target.value)}
                placeholder="$400/mo Bonsai"
                className={inputClass}
              />
            </Field>
            <Field label="MRR ($/mo)" htmlFor="new-project-mrr" hint="Number, no $ sign.">
              <input
                id="new-project-mrr"
                type="number"
                inputMode="numeric"
                min={0}
                value={mrr}
                onChange={e => setMrr(e.target.value)}
                placeholder="400"
                className={cn(inputClass, 'tabular-nums')}
              />
            </Field>
          </div>

          <Field label="Docs paths" htmlFor="new-project-docs" hint="One per line. Relative to claude-os or absolute.">
            <textarea
              id="new-project-docs"
              rows={2}
              value={docsText}
              onChange={e => setDocsText(e.target.value)}
              placeholder={'references/project-plan.md\n/Users/justinlobaito/repos/foo/docs'}
              className={cn(inputClass, 'font-mono text-xs resize-y')}
            />
          </Field>

          <Field label="Contacts" htmlFor="new-project-contacts" hint="One per line. Emails or @domain.com patterns.">
            <textarea
              id="new-project-contacts"
              rows={2}
              value={contactsText}
              onChange={e => setContactsText(e.target.value)}
              placeholder={'jane@example.com\n@example.com'}
              className={cn(inputClass, 'font-mono text-xs resize-y')}
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
              <span className="ml-1.5 text-xs">{submitting ? 'Creating…' : 'Create project'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
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
