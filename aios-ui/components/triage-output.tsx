import { ExternalLink } from 'lucide-react'

interface TriageOutputProps {
  markdown: string
}

const GMAIL_LINK_BASE = 'https://mail.google.com/mail/u/0/#inbox/'
// Match lines like:  Thread: `19e20c28fc120342`
const THREAD_ID_REGEX = /Thread:\s*`?([0-9a-f]{12,20})`?/g

export function TriageOutput({ markdown }: TriageOutputProps) {
  const enhanced = markdown.replace(THREAD_ID_REGEX, (match, id) => {
    return `Thread: [\`${id}\`](${GMAIL_LINK_BASE}${id})`
  })

  return (
    <article className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-mono text-xs leading-relaxed">
      {enhanced.split('\n').map((line, i) => {
        const linkMatch = line.match(/\[`([^`]+)`\]\((https:\/\/mail\.google\.com[^)]+)\)/)
        if (linkMatch) {
          const before = line.slice(0, linkMatch.index!)
          const [, id, url] = linkMatch
          const after = line.slice((linkMatch.index ?? 0) + linkMatch[0].length)
          return (
            <div key={i}>
              {before}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
              >
                <code className="text-xs">{id}</code>
                <ExternalLink className="h-3 w-3" />
              </a>
              {after}
            </div>
          )
        }
        return <div key={i}>{line}</div>
      })}
    </article>
  )
}
