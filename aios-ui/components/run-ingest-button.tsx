'use client'

// aios-ui/components/run-ingest-button.tsx
// Client wrapper that owns modal open/close state and triggers WikiIngestModal.

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { WikiIngestModal } from '@/components/wiki-ingest-modal'

interface Props {
  clientSlug: string
  projectSlug: string
  count: number
}

export function RunIngestButton({ clientSlug, projectSlug, count }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        disabled={count === 0}
        aria-label={`Run wiki ingest (${count} pending drop${count === 1 ? '' : 's'})`}
      >
        <Play className="h-4 w-4 mr-2" />
        Run wiki ingest
      </Button>
      <WikiIngestModal
        clientSlug={clientSlug}
        projectSlug={projectSlug}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
