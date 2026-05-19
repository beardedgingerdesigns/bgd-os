// aios-ui/components/mrr-widget.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMRR } from '@/lib/format'

interface MRRWidgetProps {
  total: number
  paidClientCount: number
}

export function MRRWidget({ total, paidClientCount }: MRRWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Total monthly recurring revenue</CardDescription>
        <CardTitle className="text-4xl font-semibold">{formatMRR(total)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Summed across {paidClientCount} paying client{paidClientCount === 1 ? '' : 's'},
          active projects only.
        </p>
      </CardContent>
    </Card>
  )
}
