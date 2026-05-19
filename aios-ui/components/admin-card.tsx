// aios-ui/components/admin-card.tsx
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export function AdminCard() {
  return (
    <Link href="/admin">
      <Card className="hover:bg-accent/40 transition-colors cursor-pointer h-full border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-lg">Admin</CardTitle>
          </div>
          <CardDescription>Operator rituals + strategic work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Coming in v3 — level-up · audit · weekly status · business plans &amp; research
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
