'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

interface DeleteEntityDialogProps {
  /** Display name used in copy ("Delete Inside Out Iowa?"). */
  entityLabel: string
  /** Slug the user must type verbatim to enable the destructive button. */
  confirmSlug: string
  /** "client" | "project" — shapes the warning copy. */
  entityKind: 'client' | 'project'
  /** Fetch endpoint; receives DELETE. */
  endpoint: string
  /** Path to push to after a successful delete (typically the parent). */
  redirectTo: string
  /** Optional extra warning details (e.g. "this also deletes N projects"). */
  warning?: string
  triggerVariant?: 'ghost' | 'outline' | 'destructive'
  triggerLabel?: string
}

export function DeleteEntityDialog({
  entityLabel,
  confirmSlug,
  entityKind,
  endpoint,
  redirectTo,
  warning,
  triggerVariant = 'ghost',
  triggerLabel = 'Delete…',
}: DeleteEntityDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTyped('')
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  const canDelete = typed === confirmSlug && !submitting

  async function onConfirm() {
    if (!canDelete) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Status ${res.status}` }))
        throw new Error(typeof body.error === 'string' ? body.error : `Status ${res.status}`)
      }
      setOpen(false)
      router.push(redirectTo)
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
          <Button variant={triggerVariant} size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="ml-1.5 text-xs">{triggerLabel}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {entityLabel}?</DialogTitle>
          <DialogDescription>
            This removes the {entityKind} from <span className="font-mono">clients.yaml</span> immediately.
            {entityKind === 'client' && ' All projects nested under it are removed too.'}
            {' '}
            Comments in the file outside the deleted block are preserved. Use <span className="font-mono">git</span> to undo.
          </DialogDescription>
        </DialogHeader>

        {warning && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
            {warning}
          </div>
        )}

        <div>
          <label htmlFor="delete-confirm-input" className="block text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
            Type <span className="font-mono text-foreground">{confirmSlug}</span> to confirm
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={confirmSlug}
            autoFocus
            autoComplete="off"
            className={cn(
              'w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/70',
              typed.length > 0 && typed !== confirmSlug
                ? 'border-destructive/60 focus-visible:border-destructive/80'
                : 'border-input focus-visible:border-ring',
            )}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={onConfirm}
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span className="ml-1.5 text-xs">{submitting ? 'Deleting…' : `Delete ${entityKind}`}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
