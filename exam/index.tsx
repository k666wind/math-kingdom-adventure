import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { ExamConfig } from '../../types'

// ─── Exam Setup Screen ───────────────────────────────────────
export const ExamSetupScreen: React.FC = () => {
  const navigate   = useGameStore(s => s.navigate)
  const startExam  = useGameStore(s => s.startExam)
  const player     = useGameStore(s => s.player)
  const [config, setConfig] = useState<ExamConfig>({
    questionCount: 25,
    timeLimitMinutes: 25,
    yearGroup: 'Y6',
    examBoard: 'GL',
  })

  if (!player) return null

  const handleStart = () => startExam(config)

  const rowBtn = (
    label: string,
    options: { value: string; label: string }[],
    current: string,
    onChange: (v: string) => void,
  ) => (
    <div className="rounded-2xl p-4 bg-white mb-3" style={{ border: '1px solid rgba(45,27,105,0.1)' }}>
      <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 py-2 rounded-xl font-nunito text-xs font-bold active:scale-95 transition-transform"
            style={{
              background: current === opt.value ? '#2D1B69' : '#f0eeff',
              color: current === opt.value ? 'white' : '#2D1B69',
            }}
          >{opt.label}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-white/60 text-xl">←</button>
        <div>
          <div className="font-fredoka text-white text-lg">📝 Mock Exam</div>
          <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>11+ Exam Simulator</div>
        </div>
      </div>

      <div className="flex-1 scroll-y px-4 py-4">
        {rowBtn('📚 Year Group', [
          { value: 'Y4', label: 'Year 4' },
          { value: 'Y5', label: 'Year 5' },
          { value: 'Y6', label: 'Year 6' },
          { value: 'mixed', label: 'Mixed (Y7+)' },
        ], config.yearGroup, v => setConfig(c => ({ ...c, yearGroup: v as ExamConfig['yearGroup'] })))}

        {rowBtn('🏛️ Exam Board', [
          { value: 'GL', label: 'GL Assessment' },
          { value: 'CEM', label: 'CEM' },
          { value: 'CSSE', label: 'CSSE' },
          { value: 'practice', label: 'Practice' },
        ], config.examBoard, v => setConfig(c => ({ ...c, examBoard: v as ExamConfig['examBoard'] })))}

        {rowBtn('❓ Questions', [
          { value: '25', label: '25 questions' },
          { value: '50', label: '50 questions' },
        ], String(config.questionCount), v => setConfig(c => ({
          ...c,
          questionCount: parseInt(v) as 25 | 50,
          timeLimitMinutes: parseInt(v) === 25 ? 25 : 45,
        })))}

        <div className="rounded-2xl p-4 bg-white mb-4" style={{ border: '1px solid rgba(45,27,105,0.1)' }}>
          <div className="font-fredoka text-sm mb-1" style={{ color: '#2D1B69' }}>⏱️ Time Limit</div>
          <div className="font-nunito text-2xl font-bold" style={{ color: '#FF6B35' }}>
            {config.timeLimitMinutes} minutes
          </div>
          <div className="font-nunito text-xs mt-1" style={{ color: '#888' }}>
            Auto-set based on question count. Matches real 11+ timing.
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-fredoka text-xl text-white active:scale-95 transition-transform shadow-lg"
          style={{ background: '#FF6B35' }}
        >
          🚀 Start Exam
        </button>

        {player.examHistory && player.examHistory.length > 0 && (
          <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(45,27,105,0.05)', border: '1px solid rgba(45,27,105,0.1)' }}>
            <div className="font-fredoka text-sm mb-2" style={{ color: '#2D1B69' }}>📊 Recent Results</div>
            {player.examHistory.slice(0, 3).map(r => (
              <div key={r.id} className="flex justify-between py-1 border-b last:border-0" style={{ borderColor: 'rgba(45,27,105,0.08)' }}>
                <span className="font-nunito text-xs" style={{ color: '#555' }}>
                  {r.config.yearGroup} · {r.config.examBoard} · {r.date}
                </span>
                <span className="font-nunito text-xs font-bold" style={{ color: r.accuracy >= 80 ? '#2d7a3f' : r.accuracy >= 60 ? '#7a5c00' : '#cc2244' }}>
                  {r.correctAnswers}/{r.totalQuestions} ({r.accuracy}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Exam Active Screen ──────────────────────────────────────
export const ExamActiveScreen: React.FC = () => {
  const navigate        = useGameStore(s => s.navigate)
  const examSession     = useGameStore(s => s.examSession)
  const submitExamAnswer = useGameStore(s => s.submitExamAnswer)
  const finishExam      = useGameStore(s => s.finishExam)
  const clearExam       = useGameStore(s => s.clearExam)
  const [flagged, setFlagged] = useState<boolean[]>([])
  const [localIdx, setLocalIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [secsLeft, setSecsLeft] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!examSession) return
    const totalSecs = examSession.config.timeLimitMinutes * 60
    setSecsLeft(totalSecs)
    setFlagged(new Array(examSession.questions.length).fill(false))
    timerRef.current = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          finishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  if (!examSession) return null

  const q = examSession.questions[localIdx]
  const totalQ = examSession.questions.length
  const answered = examSession.answers.filter(a => a !== null).length
  const mins = Math.floor(secsLeft / 60)
  const secs = secsLeft % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
  const timerColor = secsLeft < 300 ? '#FF4D6D' : secsLeft < 600 ? '#FF6B35' : '#2D1B69'
  const selectedForThis = examSession.answers[localIdx]

  const handleAnswer = (idx: number) => {
    submitExamAnswer(localIdx, idx)
    if (localIdx < totalQ - 1) setLocalIdx(localIdx + 1)
  }

  const toggleFlag = () => {
    const newFlagged = [...flagged]
    newFlagged[localIdx] = !newFlagged[localIdx]
    setFlagged(newFlagged)
  }

  const handleFinish = () => {
    if (!confirmed) { setConfirmed(true); return }
    if (timerRef.current) clearInterval(timerRef.current)
    finishExam()
  }

  const handleQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    clearExam()
    navigate('main_menu')
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#1a0e3a' }}>
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#2D1B69' }}>
        <div>
          <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Q {localIdx + 1} of {totalQ}
          </div>
          <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {answered}/{totalQ} answered
          </div>
        </div>
        <div className="font-fredoka text-2xl" style={{ color: timerColor }}>
          ⏱ {timeStr}
        </div>
        <button
          onClick={handleQuit}
          className="font-nunito text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(255,77,109,0.3)', color: '#FF4D6D' }}
        >Quit</button>
      </div>

      {/* Progress dots */}
      <div className="px-4 py-2 flex gap-1 flex-wrap" style={{ background: '#251555' }}>
        {examSession.questions.map((_, i) => {
          const ans = examSession.answers[i]
          const isFlag = flagged[i]
          const isCurrent = i === localIdx
          return (
            <button
              key={i}
              onClick={() => setLocalIdx(i)}
              className="w-4 h-4 rounded-full transition-all"
              style={{
                background: isCurrent ? '#FFE66D'
                  : isFlag ? '#FF6B35'
                  : ans !== null ? '#6BCB77'
                  : 'rgba(255,255,255,0.2)',
              }}
            />
          )
        })}
      </div>

      {/* Question */}
      <div className="flex-1 scroll-y px-4 py-4">
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="font-nunito text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,230,109,0.2)', color: '#FFE66D' }}>
              {q.type.replace(/_/g, ' ')}
            </span>
            <button
              onClick={toggleFlag}
              className="font-nunito text-xs px-2 py-0.5 rounded-full"
              style={{ background: flagged[localIdx] ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.1)', color: flagged[localIdx] ? '#FF6B35' : 'rgba(255,255,255,0.5)' }}
            >🚩 {flagged[localIdx] ? 'Flagged' : 'Flag'}</button>
          </div>
          <p className="font-nunito text-white text-base leading-relaxed whitespace-pre-wrap">{q.questionText}</p>
        </div>

        {/* MCQ options */}
        <div className="flex flex-col gap-2 mb-4">
          {q.answers.map((ans, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full py-3 px-4 rounded-2xl font-nunito text-sm text-left active:scale-95 transition-all"
              style={{
                background: selectedForThis === i ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                color: 'white',
                border: selectedForThis === i ? '2px solid #FF6B35' : '2px solid rgba(255,255,255,0.12)',
              }}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {ans}
            </button>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setLocalIdx(Math.max(0, localIdx - 1))}
            disabled={localIdx === 0}
            className="flex-1 py-2.5 rounded-xl font-nunito text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
          >← Prev</button>
          <button
            onClick={() => setLocalIdx(Math.min(totalQ - 1, localIdx + 1))}
            disabled={localIdx === totalQ - 1}
            className="flex-1 py-2.5 rounded-xl font-nunito text-sm disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
          >Next →</button>
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-3.5 rounded-2xl font-fredoka text-lg active:scale-95 transition-transform"
          style={{ background: confirmed ? '#FF4D6D' : '#6BCB77', color: 'white' }}
        >
          {confirmed ? '⚠️ Confirm Submit' : `✅ Submit Exam (${answered}/${totalQ} answered)`}
        </button>
        {confirmed && (
          <div className="mt-2 text-center font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {totalQ - answered} questions unanswered. Tap again to confirm.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Exam Results Screen ─────────────────────────────────────
export const ExamResultsScreen: React.FC = () => {
  const navigate    = useGameStore(s => s.navigate)
  const examSession = useGameStore(s => s.examSession)
  const startExam   = useGameStore(s => s.startExam)
  const clearExam   = useGameStore(s => s.clearExam)
  const player      = useGameStore(s => s.player)

  if (!examSession || !player) {
    navigate('main_menu')
    return null
  }

  const totalQ = examSession.config.questionCount
  const correct = examSession.answers.filter((a, i) => a !== null && a === examSession.questions[i].correctIndex).length
  const accuracy = Math.round((correct / totalQ) * 100)
  const startMs = new Date(examSession.startedAt).getTime()
  const finishMs = examSession.finishedAt ? new Date(examSession.finishedAt).getTime() : Date.now()
  const timeTakenSecs = Math.floor((finishMs - startMs) / 1000)
  const timeMins = Math.floor(timeTakenSecs / 60)
  const timeSecs = timeTakenSecs % 60

  // Topic breakdown
  const breakdown: Record<string, { attempted: number; correct: number }> = {}
  examSession.questions.forEach((q, i) => {
    const isCorrect = examSession.answers[i] !== null && examSession.answers[i] === q.correctIndex
    if (!breakdown[q.type]) breakdown[q.type] = { attempted: 0, correct: 0 }
    breakdown[q.type].attempted++
    if (isCorrect) breakdown[q.type].correct++
  })
  const topicRows = Object.entries(breakdown)
    .map(([type, data]) => ({
      type,
      ...data,
      pct: Math.round((data.correct / data.attempted) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)

  const grade = accuracy >= 90 ? 'Excellent! 🏆' : accuracy >= 80 ? 'Great! ⭐' : accuracy >= 60 ? 'Good effort 👍' : 'Keep practising 💪'
  const scoreColor = accuracy >= 80 ? '#6BCB77' : accuracy >= 60 ? '#FFE66D' : '#FF4D6D'

  const handleSaveReport = () => {
    const lines = [
      `Math Kingdom Adventure — Mock Exam Report`,
      `Date: ${examSession.startedAt.slice(0, 10)}`,
      `Year Group: ${examSession.config.yearGroup} | Board: ${examSession.config.examBoard}`,
      `Score: ${correct}/${totalQ} (${accuracy}%)`,
      `Time: ${timeMins}m ${timeSecs}s`,
      ``,
      `Topic Breakdown:`,
      ...topicRows.map(t => `  ${t.type.replace(/_/g,' ')}: ${t.correct}/${t.attempted} (${t.pct}%)`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `exam-report-${examSession.startedAt.slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="px-4 pt-5 pb-4" style={{ background: '#2D1B69' }}>
        <div className="text-center">
          <div className="font-fredoka text-white text-xl mb-1">Exam Complete!</div>
          <div className="font-nunito text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {examSession.config.yearGroup} · {examSession.config.examBoard}
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-y px-4 py-4">
        {/* Score card */}
        <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: '#2D1B69' }}>
          <div className="font-fredoka text-6xl mb-1" style={{ color: scoreColor }}>
            {correct}/{totalQ}
          </div>
          <div className="font-fredoka text-2xl mb-1" style={{ color: scoreColor }}>{accuracy}%</div>
          <div className="font-nunito text-sm text-white">{grade}</div>
          <div className="font-nunito text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ⏱ Time: {timeMins}m {timeSecs}s · 🪙 Gold earned: +{correct * 5}
          </div>
        </div>

        {/* 11+ assessment */}
        <div className="rounded-2xl p-4 mb-4" style={{
          background: accuracy >= 80 ? 'rgba(107,203,119,0.1)' : 'rgba(255,230,109,0.1)',
          border: `1px solid ${accuracy >= 80 ? 'rgba(107,203,119,0.4)' : 'rgba(255,230,109,0.4)'}`,
        }}>
          <div className="font-fredoka text-sm mb-1" style={{ color: '#2D1B69' }}>📋 11+ Assessment</div>
          <div className="font-nunito text-xs" style={{ color: '#555' }}>
            {accuracy >= 80
              ? `${player.name} is performing well at ${examSession.config.examBoard} level. Keep up the regular practice!`
              : accuracy >= 60
              ? `Good foundation. Focus on the weaker topics below and aim for 80%+ before the real exam.`
              : `More practice needed. Review the weak topics and try again. Consistent daily practice is key.`}
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="rounded-2xl p-4 mb-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
          <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>📊 Topic Breakdown (weakest first)</div>
          {topicRows.map(t => (
            <div key={t.type} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <span className="font-nunito text-xs capitalize" style={{ color: '#444' }}>
                  {t.type.replace(/_/g, ' ')}
                </span>
                <span className="font-nunito text-xs font-bold" style={{
                  color: t.pct >= 80 ? '#2d7a3f' : t.pct >= 60 ? '#7a5c00' : '#cc2244',
                }}>
                  {t.correct}/{t.attempted} ({t.pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(45,27,105,0.08)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${t.pct}%`,
                  background: t.pct >= 80 ? '#6BCB77' : t.pct >= 60 ? '#FFE66D' : '#FF4D6D',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleSaveReport}
            className="flex-1 py-3 rounded-2xl font-nunito text-sm font-bold active:scale-95"
            style={{ background: 'rgba(78,205,196,0.12)', color: '#1a7a74', border: '1px solid rgba(78,205,196,0.4)' }}
          >💾 Save Report</button>
          <button
            onClick={() => { clearExam(); startExam(examSession.config) }}
            className="flex-1 py-3 rounded-2xl font-nunito text-sm font-bold active:scale-95"
            style={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}
          >🔄 Try Again</button>
        </div>

        <button
          onClick={() => { clearExam(); navigate('main_menu') }}
          className="w-full py-3.5 rounded-2xl font-fredoka text-lg text-white active:scale-95"
          style={{ background: '#2D1B69' }}
        >🏠 Back to Menu</button>
      </div>
    </div>
  )
}
