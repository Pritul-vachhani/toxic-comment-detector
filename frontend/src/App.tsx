import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './App.css'

// 🔌 Backend API URL
const API_URL = 'http://127.0.0.1:8000/predict'

type ApiPrediction = {
  label: number // 1 = toxic, 0 = non-toxic
  prob: number  // probability toxic (0–1)
}

type VerdictLevel = 'low' | 'medium' | 'high'

type Verdict = {
  score: number
  level: VerdictLevel
  label: string
  message: string
  triggers: string[]
}

const toxicityLexicon = [
  { words: ['hate', 'stupid', 'idiot'], weight: 0.35 },
  { words: ['kill', 'die', 'trash'], weight: 0.35 },
  { words: ['dumb', 'ugly', 'worthless', 'annoying'], weight: 0.25 },
  { words: ['please', 'thank', 'appreciate'], weight: -0.1 },
]

const tips: Record<VerdictLevel, string> = {
  low: 'Looks safe. Still give it a quick read for tone.',
  medium: 'Trim harsh qualifiers or rephrase to focus on ideas.',
  high: 'Pause before posting. Consider a calmer, specific rewrite.',
}

const strictnessDescriptions: Record<number, string> = {
  [-2]: 'very sensitive',
  [-1]: 'sensitive',
  0: 'balanced',
  1: 'tolerant',
  2: 'very tolerant',
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const highlightedPreview = (text: string, tokens: string[]) => {
  if (!text) return text
  const unique = Array.from(new Set(tokens.map((token) => token.toLowerCase())))
  if (unique.length === 0) return text
  const regex = new RegExp(`(${unique.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(regex)
  const tokenSet = new Set(unique)
  return parts.map((part, index) =>
    tokenSet.has(part.toLowerCase()) ? (
      <mark key={`${part}-${index}`} className="highlight">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  )
}

const highlightForCsv = (text: string, tokens: string[]) => {
  if (!text) return ''
  const unique = Array.from(new Set(tokens.map((token) => token.toLowerCase())))
  if (unique.length === 0) return text
  const regex = new RegExp(`(${unique.map(escapeRegExp).join('|')})`, 'gi')
  return text.replace(regex, (match) => `<<${match}>>`)
}

// ⬇️ Lexicon-based evaluator (still used for triggers + CSV)
const evaluateComment = (input: string, strictness: number): Verdict => {
  const normalized = input.toLowerCase()
  const triggers: string[] = []

  const rawScore = toxicityLexicon.reduce((score, { words, weight }) => {
    const hits = words.filter((word) => normalized.includes(word))
    if (hits.length > 0) {
      triggers.push(...hits)
      return score + weight * hits.length
    }
    return score
  }, 0)

  const score = Math.max(0, Math.min(1, rawScore))
  const adjustment = strictness * 0.1
  const mediumThreshold = Math.max(0.1, Math.min(0.55, 0.35 + adjustment))
  const highThreshold = Math.max(
    mediumThreshold + 0.05,
    Math.min(0.85, 0.65 + adjustment),
  )

  const level: VerdictLevel =
    score > highThreshold ? 'high' : score > mediumThreshold ? 'medium' : 'low'

  const label =
    level === 'high' ? 'Toxic' : level === 'medium' ? 'Caution' : 'Clean'

  return {
    score,
    level,
    label,
    message: tips[level],
    triggers,
  }
}

const encodeCell = (value: string) => {
  const safe = value.replace(/"/g, '""')
  return /[",\n]/.test(value) ? `"${safe}"` : safe
}

function App() {
  const [comment, setComment] = useState('')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [loading, setLoading] = useState(false)
  const [strictness, setStrictness] = useState(0)
  const [showConfidence, setShowConfidence] = useState(false)
  const [csvStatus, setCsvStatus] = useState('')
  const [csvUrl, setCsvUrl] = useState<string | null>(null)
  const [csvFileName, setCsvFileName] = useState('classified-comments.csv')

  const highlightedComment = useMemo(
    () => highlightedPreview(comment, verdict?.triggers ?? []),
    [comment, verdict?.triggers],
  )

  // 🔁 Analyze a single comment using BACKEND model + lexicon triggers
  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      setVerdict(null)
      setShowConfidence(false)
      return
    }

    setShowConfidence(false)
    setLoading(true)

    try {
      // 1) Call FastAPI backend
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data: ApiPrediction = await res.json() // { label, prob }

      const score = data.prob // backend probability of toxic

      // 2) Map model score to level/label using strictness slider
      const adjustment = strictness * 0.1
      const mediumThreshold = Math.max(0.1, Math.min(0.55, 0.35 + adjustment))
      const highThreshold = Math.max(
        mediumThreshold + 0.05,
        Math.min(0.85, 0.65 + adjustment),
      )

      const level: VerdictLevel =
        score > highThreshold ? 'high' : score > mediumThreshold ? 'medium' : 'low'

      const label =
        level === 'high' ? 'Toxic' : level === 'medium' ? 'Caution' : 'Clean'

      // 3) Still use lexicon to find triggers for highlighting
      const lexiconVerdict = evaluateComment(trimmed, strictness)

      setVerdict({
        ...lexiconVerdict,
        score, // override score with real model prob
        level,
        label,
        message: tips[level],
      })
    } catch (error) {
      console.error(error)
      setVerdict(null)
    } finally {
      setLoading(false)
    }
  }

  // 🔁 When strictness changes, re-map existing score to a new level/label
  const handleStrictnessChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setStrictness(value)

    setVerdict((current) => {
      if (!current) return current

      const score = current.score
      const adjustment = value * 0.1
      const mediumThreshold = Math.max(0.1, Math.min(0.55, 0.35 + adjustment))
      const highThreshold = Math.max(
        mediumThreshold + 0.05,
        Math.min(0.85, 0.65 + adjustment),
      )

      const level: VerdictLevel =
        score > highThreshold ? 'high' : score > mediumThreshold ? 'medium' : 'low'

      const label =
        level === 'high' ? 'Toxic' : level === 'medium' ? 'Caution' : 'Clean'

      return {
        ...current,
        level,
        label,
        message: tips[level],
      }
    })
  }

  // 📁 CSV upload still uses lexicon-based evaluateComment for bulk moderation
  const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = String(reader.result || '')
        const rows = raw.replace(/\r/g, '').split('\n').filter(Boolean)
        if (rows.length === 0) {
          setCsvStatus('CSV appears empty.')
          setCsvUrl(null)
          return
        }
        const headers = rows[0].split(',').map((header) => header.trim())
        const commentIndex = headers.findIndex((header) =>
          /comment|text/i.test(header),
        )
        if (commentIndex === -1) {
          setCsvStatus('No column named comment/text detected.')
          setCsvUrl(null)
          return
        }

        const outputHeaders = [
          ...headers,
          'verdict',
          'risk_score',
          'triggers',
          'highlighted_text',
        ]
        const outputRows = [outputHeaders.map(encodeCell).join(',')]
        rows.slice(1).forEach((row) => {
          if (!row.trim()) return
          const cells = row.split(',')
          while (cells.length < headers.length) {
            cells.push('')
          }
          const content = cells[commentIndex] ?? ''
          const result = evaluateComment(content, strictness)
          const enriched = [
            ...cells,
            result.label,
            `${Math.round(result.score * 100)}%`,
            result.triggers.join(' | '),
            highlightForCsv(content, result.triggers),
          ].map((value) => encodeCell(value))

          outputRows.push(enriched.join(','))
        })

        const csvText = outputRows.join('\n')
        if (csvUrl) {
          URL.revokeObjectURL(csvUrl)
        }
        const blob = new Blob([csvText], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        setCsvUrl(url)
        setCsvFileName(`moderated-${file.name}`)
        setCsvStatus(
          `Processed ${outputRows.length - 1} row${
            outputRows.length - 1 === 1 ? '' : 's'
          } using the ${strictnessDescriptions[strictness]} threshold.`,
        )
      } catch (error) {
        setCsvStatus('Unable to parse CSV. Please try again.')
        setCsvUrl(null)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  useEffect(
    () => () => {
      if (csvUrl) {
        URL.revokeObjectURL(csvUrl)
      }
    },
    [csvUrl],
  )

  return (
    <div className="app">
      <header className="hero">
        <h1>Catch toxic language before you comment.</h1>
        <p className="subtitle">
          Paste your comment or upload a csv file and preview
          exactly what will be flagged.
        </p>
      </header>

      <section className="panel">
        <form className="analyzer" onSubmit={handleAnalyze}>
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            placeholder="Type or paste your comment here…"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            aria-label="Comment content"
          />
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze comment'}
            </button>
          </div>
        </form>

        <div className="strictness-card">
          <p className="stat-label">Strictness (threshold)</p>
          <p className="strictness-value">
            Level {strictness} · {strictnessDescriptions[strictness]}
          </p>
          <input
            type="range"
            min={-2}
            max={2}
            step={1}
            value={strictness}
            onChange={handleStrictnessChange}
            aria-label="Strictness threshold"
          />
          <div className="strictness-legend">
            <span>-2 · Very Sensitive moderation</span>
            <span>-1 · Sensitive moderation</span>
            <span>0 · Balanced moderation</span>
            <span>+1 · Tolerant moderation</span>
            <span>+2 · Very tolerant moderation</span>
          </div>
        </div>

        <div
          className={`verdict ${
            verdict ? `verdict-${verdict.level}` : 'verdict-idle'
          }`}
        >
          {verdict ? (
            <>
              <p className="verdict-label">{verdict.label}</p>
              <div className="confidence-row">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setShowConfidence((state) => !state)}
                >
                  {showConfidence ? 'Hide confidence score' : 'Show confidence'}
                </button>
                <p className="score">
                  {showConfidence
                    ? `Confidence ${Math.round(verdict.score * 100)}%`
                    : 'Confidence score hidden'}
                </p>
              </div>
              <p className="message">{verdict.message}</p>
              {verdict.triggers.length > 0 && (
                <div className="trigger-cloud" aria-live="polite">
                  {verdict.triggers.map((word, index) => (
                    <span key={`${word}-${index}`} className="chip">
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="message">Results will appear once you analyze.</p>
          )}
        </div>
      </section>

      <section className="preview-card">
        <p className="stat-label">Highlighted toxic phrases</p>
        <div className="highlight-box">
          {verdict && verdict.triggers.length > 0 ? (
            highlightedComment
          ) : (
            <span>
              Run an analysis to see harmful words highlighted in your original
              text.
            </span>
          )}
        </div>
      </section>

      <section className="csv-panel">
        <div>
          <p className="stat-label">Batch moderation</p>
          <h2>Upload a CSV to audit comments in bulk.</h2>
          <p className="subtitle">
            Use a column named “comment” or “text” and download the enriched CSV
            with verdicts and highlighted phrases.
          </p>
        </div>
        <label className="csv-upload">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            aria-label="Upload CSV file"
          />
          <span>Upload CSV</span>
        </label>
        {csvStatus && <p className="csv-status">{csvStatus}</p>}
        {csvUrl && (
          <a className="download-btn" href={csvUrl} download={csvFileName}>
            Download processed CSV
          </a>
        )}
      </section>
    </div>
  )
}

export default App
