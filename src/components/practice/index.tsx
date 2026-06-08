import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { QuestionType, QuestionTier } from '../../types'

// ─── Topic metadata ───────────────────────────────────────────

interface TopicMeta {
  type: QuestionType
  label: string
  emoji: string
  years: QuestionTier[]
}

const ALL_TOPICS: TopicMeta[] = [
  { type: 'addition',            label: 'Addition',            emoji: '➕', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'subtraction',         label: 'Subtraction',         emoji: '➖', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'multiplication',      label: 'Multiplication',      emoji: '✖️', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'division',            label: 'Division',            emoji: '➗', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'long_division',       label: 'Long Division',       emoji: '📐', years: ['Y5','Y6'] },
  { type: 'fractions',           label: 'Fractions',           emoji: '½',  years: ['Y4','Y5','Y6'] },
  { type: 'decimals',            label: 'Decimals',            emoji: '🔢', years: ['Y4','Y5','Y6'] },
  { type: 'percentages',         label: 'Percentages',         emoji: '💯', years: ['Y5','Y6','Y7'] },
  { type: 'ratio',               label: 'Ratio',               emoji: '⚖️', years: ['Y6','Y7'] },
  { type: 'bodmas',              label: 'BODMAS',              emoji: '🧮', years: ['Y5','Y6'] },
  { type: 'negative_numbers',    label: 'Negative Numbers',    emoji: '🌡️', years: ['Y5','Y6','Y7'] },
  { type: 'factors_primes',      label: 'Factors & Primes',    emoji: '🔍', years: ['Y5','Y6','Y7'] },
  { type: 'roman_numerals',      label: 'Roman Numerals',      emoji: 'Ⅻ',  years: ['Y4','Y5','Y6'] },
  { type: 'money_problems',      label: 'Money',               emoji: '💰', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'time_problems',       label: 'Time',                emoji: '⏰', years: ['Y3','Y4','Y5','Y6'] },
  { type: 'algebra',             label: 'Algebra',             emoji: '🔤', years: ['Y6','Y7','Y8'] },
  { type: 'algebraic_expressions', label: 'Algebraic Expressions', emoji: '📊', years: ['Y7','Y8','Y9'] },
  { type: 'sequences',           label: 'Sequences',           emoji: '📈', years: ['Y6','Y7','Y8'] },
  { type: 'quadratics',          label: 'Quadratics',          emoji: '📉', years: ['Y9','Y10','Y11'] },
  { type: 'simultaneous',        label: 'Simultaneous Eqns',   emoji: '⚙️', years: ['Y9','Y10','Y11'] },
  { type: 'geometry_area',       label: 'Area & Perimeter',    emoji: '📐', years: ['Y5','Y6','Y7'] },
  { type: 'geometry_angles',     label: 'Angles',              emoji: '📏', years: ['Y5','Y6','Y7'] },
  { type: 'volume_3d',           label: '3D Volume',           emoji: '📦', years: ['Y6','Y7','Y8'] },
  { type: 'coordinates',         label: 'Coordinates',         emoji: '🗺️', years: ['Y5','Y6','Y7'] },
  { type: 'statistics',          label: 'Statistics',          emoji: '📊', years: ['Y6','Y7','Y8'] },
  { type: 'probability',         label: 'Probability',         emoji: '🎲', years: ['Y6','Y7','Y8'] },
  { type: 'trigonometry',        label: 'Trigonometry',        emoji: '📐', years: ['Y9','Y10','Y11'] },
  { type: 'venn_diagrams',       label: 'Venn Diagrams',       emoji: '🔵', years: ['Y6','Y7','Y8'] },
  { type: 'function_machines',   label: 'Function Machines',   emoji: '⚙️', years: ['Y5','Y6','Y7'] },
  { type: 'worded_1step',        label: 'Word Problems (1-step)', emoji: '📝', years: ['Y3','Y4','Y5'] },
  { type: 'worded_2step',        label: 'Word Problems (2-step)', emoji: '📝', years: ['Y5','Y6','Y7'] },
  { type: 'worded_3step',        label: 'Word Problems (3-step)', emoji: '📝', years: ['Y7','Y8','Y9'] },
]

const TIER_LABEL: Record<QuestionTier, string> = {
  Y3: 'Year 3', Y4: 'Year 4', Y5: 'Year 5', Y6: 'Year 6',
  Y7: 'Year 7', Y8: 'Year 8', Y9: 'Year 9', Y10: 'Year 10', Y11: 'Year 11',
}

// ─── PracticeSelectScreen ────────────────────────────────────

export function PracticeSelectScreen() {
  const navigate      = useGameStore(s => s.navigate)
  const startPractice = useGameStore(s => s.startPractice)
  const topicProgress = useGameStore(s => s.topicProgress)
  const getDueTopics  = useGameStore(s => s.getDueTopics)

  const [yearFilter, setYearFilter] = useState<QuestionTier | 'all'>('all')

  const dueTopics = getDueTopics()
  const dueSet = new Set(dueTopics.map(d => `${d.type}_${d.tier}`))

  const years: Array<QuestionTier | 'all'> = ['all','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10','Y11']

  const filteredTopics = yearFilter === 'all'
    ? ALL_TOPICS
    : ALL_TOPICS.filter(t => t.years.includes(yearFilter))

  const getAccuracy = (type: QuestionType): number | null => {
    const entries = Object.values(topicProgress).filter(tp => tp.type === type)
    if (entries.length === 0) return null
    const total   = entries.reduce((s, tp) => s + tp.totalAnswered, 0)
    const correct = entries.reduce((s, tp) => s + tp.totalCorrect,  0)
    return total === 0 ? null : Math.round((correct / total) * 100)
  }

  const getSRSBox = (type: QuestionType, tier: QuestionTier): number => {
    const tp = topicProgress[`${type}_${tier}`]
    return tp?.srsBox ?? 0
  }

  const accuracyColor = (acc: number | null) => {
    if (acc === null) return '#6b7280'
    if (acc >= 80) return '#10b981'
    if (acc >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const handleStart = (topic: TopicMeta, mode: 'free' | 'srs_review') => {
    const tier = yearFilter !== 'all' ? yearFilter : topic.years[0]
    startPractice(topic.type, tier, mode)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '16px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={() => navigate('main_menu')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>
          ← Back
        </button>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>📚 Practice Mode</h1>
      </div>

      {/* Due topics banner */}
      {dueTopics.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>🔔 {dueTopics.length} topic{dueTopics.length > 1 ? 's' : ''} due for review</span>
            <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '2px' }}>Spaced repetition keeps weak topics sharp</div>
          </div>
          <button
            onClick={() => {
              const due = dueTopics[0]
              startPractice(due.type, due.tier, 'srs_review')
            }}
            style={{ background: '#f59e0b', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            Start Review
          </button>
        </div>
      )}

      {/* Year filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            style={{
              border: 'none', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer',
              background: yearFilter === y ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: yearFilter === y ? 'bold' : 'normal',
              fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {y === 'all' ? 'All Years' : y}
          </button>
        ))}
      </div>

      {/* Topic grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {filteredTopics.map(topic => {
          const acc = getAccuracy(topic.type)
          const tier = yearFilter !== 'all' ? yearFilter : topic.years[0]
          const box = getSRSBox(topic.type, tier)
          const isDue = dueSet.has(`${topic.type}_${tier}`)

          return (
            <div
              key={topic.type}
              onClick={() => handleStart(topic, 'free')}
              style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px',
                cursor: 'pointer', position: 'relative',
                border: isDue ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'transform 0.1s',
              }}
            >
              {isDue && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#f59e0b', borderRadius: '50%', width: '8px', height: '8px' }} />
              )}
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{topic.emoji}</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', lineHeight: 1.2, marginBottom: '6px' }}>{topic.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {acc !== null ? (
                  <span style={{ fontSize: '12px', color: accuracyColor(acc), fontWeight: 'bold' }}>{acc}%</span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Not started</span>
                )}
                {box > 0 && (
                  <span style={{ fontSize: '10px', color: box >= 5 ? '#10b981' : '#a5b4fc', background: 'rgba(99,102,241,0.3)', borderRadius: '4px', padding: '2px 5px' }}>
                    Box {box}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Year label */}
      {yearFilter !== 'all' && (
        <div style={{ textAlign: 'center', marginTop: '16px', color: '#9ca3af', fontSize: '12px' }}>
          Showing {TIER_LABEL[yearFilter]} topics · Tap a topic to practice free-form
        </div>
      )}
    </div>
  )
}

// ─── PracticeActiveScreen ─────────────────────────────────────

export function PracticeActiveScreen() {
  const practiceSession    = useGameStore(s => s.practiceSession)
  const submitPracticeAnswer = useGameStore(s => s.submitPracticeAnswer)
  const endPractice        = useGameStore(s => s.endPractice)
  const navigate           = useGameStore(s => s.navigate)

  const [selectedIdx, setSelectedIdx]   = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [wasCorrect, setWasCorrect]     = useState(false)
  const [elapsed, setElapsed]           = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Reset selection when question changes
  const questionId = practiceSession?.currentQuestion?.id
  useEffect(() => {
    setSelectedIdx(null)
    setShowFeedback(false)
  }, [questionId])

  if (!practiceSession || !practiceSession.currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate('practice_select')} style={{ color: '#fff', background: '#6366f1', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer' }}>
          Back to Practice
        </button>
      </div>
    )
  }

  const q       = practiceSession.currentQuestion
  const session = practiceSession
  const total   = session.questions.length
  const correct = session.questions.filter(r => r.isCorrect).length

  const handleAnswer = (idx: number) => {
    if (showFeedback) return
    setSelectedIdx(idx)
    const result = submitPracticeAnswer(idx)
    setWasCorrect(result)
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    setSelectedIdx(null)
  }

  const answerColor = (idx: number) => {
    if (!showFeedback) {
      return selectedIdx === idx ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'
    }
    if (idx === q.correctIndex) return 'rgba(16,185,129,0.3)'
    if (idx === selectedIdx)    return 'rgba(239,68,68,0.3)'
    return 'rgba(255,255,255,0.04)'
  }

  const answerBorder = (idx: number) => {
    if (!showFeedback) return selectedIdx === idx ? '2px solid #6366f1' : '2px solid transparent'
    if (idx === q.correctIndex) return '2px solid #10b981'
    if (idx === selectedIdx)    return '2px solid #ef4444'
    return '2px solid transparent'
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '16px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => { endPractice(); navigate('practice_results') }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', cursor: 'pointer' }}
        >
          ✕ End
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a5b4fc', fontSize: '12px' }}>
            {session.mode === 'srs_review' ? '🔁 SRS Review' : '📚 Free Practice'}
          </div>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{correct}/{total} correct</div>
        </div>
        <div style={{ color: '#9ca3af', fontSize: '13px' }}>⏱ {formatTime(elapsed)}</div>
      </div>

      {/* Streak */}
      {session.streak >= 3 && (
        <div style={{ textAlign: 'center', marginBottom: '8px', color: '#fcd34d', fontSize: '14px', fontWeight: 'bold' }}>
          🔥 {session.streak} streak!
        </div>
      )}

      {/* Question card */}
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '6px', padding: '3px 8px', fontSize: '12px' }}>{q.type.replace(/_/g,' ')}</span>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>{q.difficulty} · {q.tier}</span>
        </div>
        <p style={{ color: '#fff', fontSize: '18px', lineHeight: 1.5, margin: 0, fontWeight: '500' }}>
          {q.questionText}
        </p>
      </div>

      {/* Answers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {q.answers.map((ans, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            style={{
              background: answerColor(idx),
              border: answerBorder(idx),
              borderRadius: '12px', padding: '14px 16px',
              color: '#fff', textAlign: 'left', cursor: showFeedback ? 'default' : 'pointer',
              fontSize: '16px', transition: 'all 0.2s',
            }}
          >
            {ans}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            background: wasCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${wasCorrect ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px', padding: '12px 16px', marginBottom: '10px',
          }}>
            <div style={{ color: wasCorrect ? '#10b981' : '#ef4444', fontWeight: 'bold', marginBottom: '4px' }}>
              {wasCorrect ? '✅ Correct!' : '❌ Wrong'}
            </div>
            <div style={{ color: '#d1d5db', fontSize: '13px' }}>{q.explanation}</div>
          </div>
          <button
            onClick={handleNext}
            style={{ width: '100%', background: '#6366f1', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Next Question →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── PracticeResultsScreen ────────────────────────────────────

export function PracticeResultsScreen() {
  const navigate        = useGameStore(s => s.navigate)
  const startPractice   = useGameStore(s => s.startPractice)

  // practiceSession is cleared on endPractice, so we capture results via a ref pattern
  // Since the store sets nav to practice_results BEFORE clearing session,
  // the session is still available when this screen first renders.
  // We freeze stats in local state on mount.
  const [stats] = useState(() => {
    const s = useGameStore.getState().practiceSession
    if (!s) return null
    const total   = s.questions.length
    const correct = s.questions.filter(r => r.isCorrect).length
    const elapsed = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000)
    return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0, elapsed, topic: s.topic, tier: s.tier, streak: s.streak, mode: s.mode }
  })

  // Clear session after capturing stats
  useEffect(() => {
    useGameStore.getState().endPractice()
    // endPractice sets nav to practice_results again which is fine (no-op)
    // Actually we want to stay on results — so we patch navigate after
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate('practice_select')} style={{ color: '#fff', background: '#6366f1', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer' }}>
          Back to Practice
        </button>
      </div>
    )
  }

  const stars = stats.accuracy >= 90 ? 3 : stats.accuracy >= 70 ? 2 : stats.accuracy >= 50 ? 1 : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '16px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Trophy */}
      <div style={{ fontSize: '64px', marginTop: '32px', marginBottom: '8px' }}>{stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '🥉' : '📚'}</div>
      <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 4px', fontWeight: 'bold' }}>Practice Complete!</h2>
      <div style={{ color: '#a5b4fc', fontSize: '14px', marginBottom: '24px' }}>
        {stats.topic.replace(/_/g,' ')} · {stats.tier} · {stats.mode === 'srs_review' ? 'SRS Review' : 'Free Practice'}
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ fontSize: '32px', filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', maxWidth: '360px', marginBottom: '24px' }}>
        {[
          { label: 'Correct',  value: `${stats.correct}/${stats.total}`, color: '#10b981' },
          { label: 'Accuracy', value: `${stats.accuracy}%`,              color: stats.accuracy >= 80 ? '#10b981' : stats.accuracy >= 50 ? '#f59e0b' : '#ef4444' },
          { label: 'Time',     value: formatTime(stats.elapsed),          color: '#a5b4fc' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: stat.color, fontSize: '20px', fontWeight: 'bold' }}>{stat.value}</div>
            <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SRS feedback */}
      <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ color: '#a5b4fc', fontSize: '13px' }}>
          🔁 Spaced repetition updated — topic difficulty adapts to your performance
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '360px' }}>
        <button
          onClick={() => startPractice(stats.topic, stats.tier, stats.mode)}
          style={{ background: '#6366f1', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔄 Practice Again
        </button>
        <button
          onClick={() => navigate('practice_select')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '16px', cursor: 'pointer' }}
        >
          Choose Another Topic
        </button>
        <button
          onClick={() => navigate('main_menu')}
          style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: '8px' }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}
