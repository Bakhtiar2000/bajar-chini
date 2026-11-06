import { Fragment, type ReactNode } from 'react'

/**
 * Minimal, safe renderer for article text: "## " headings, "- " bullet lists,
 * **bold** and blank-line paragraphs. No raw HTML is ever injected.
 */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
}

export function ArticleBody({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <div className="text-ink space-y-5 text-[17px] leading-[1.8]">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim())
        if (!lines.length) return null
        if (lines[0].startsWith('## ')) {
          const rest = lines.slice(1)
          return (
            <Fragment key={i}>
              <h2 className="text-brand-dark pt-2 text-2xl font-bold">{lines[0].slice(3)}</h2>
              {rest.length ? <ArticleBody content={rest.join('\n')} /> : null}
            </Fragment>
          )
        }
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="marker:text-brand list-disc space-y-2 pl-6">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inline(lines.join(' '))}</p>
      })}
    </div>
  )
}
