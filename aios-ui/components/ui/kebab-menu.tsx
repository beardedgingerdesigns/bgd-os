'use client'

// Shared kebab (⋮) actions menu — a thin house-styled shell over Base UI's
// Menu. Used by the triage cards in both views/triage-view.tsx and
// triage-row-actions.tsx. Callers pass Menu.Item / Menu.Separator children and
// style items with kebabItemClass / kebabItemDestructiveClass.

import type { ReactNode } from 'react'
import { Loader2, MoreVertical } from 'lucide-react'
import { Menu } from '@base-ui/react/menu'
import { Button } from '@/components/ui/button'

export { Menu }

export const kebabItemClass =
  'flex w-full cursor-default select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-foreground outline-none hover:bg-muted focus:bg-muted data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

export const kebabItemDestructiveClass =
  'flex w-full cursor-default select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10 data-[highlighted]:bg-destructive/10'

export function KebabMenu({
  label,
  busy = false,
  children,
}: {
  label: string
  busy?: boolean
  children: ReactNode
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={<Button size="icon-xs" variant="ghost" aria-label={label} />}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
          <Menu.Popup className="min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
