import type { Question, QuestionType, QuestionTier, DifficultyLevel } from '../../types'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

let _qId = 0
const qid = () => `q_${Date.now()}_${_qId++}`

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build a 4-option MCQ, placing the correct answer at a random position */
function buildMCQ(
  correctAnswer: string,
  distractors: string[],
): { answers: string[]; correctIndex: number } {
  const pool = shuffle([...new Set([...distractors])].filter(d => d !== correctAnswer)).slice(0, 3)
  while (pool.length < 3) pool.push(String(Number(correctAnswer) + rand(1, 5)))
  const answers = shuffle([correctAnswer, pool[0], pool[1], pool[2]])
  return { answers, correctIndex: answers.indexOf(correctAnswer) }
}

const timeLimit = (tier: QuestionTier, difficulty: DifficultyLevel, base = 18): number => {
  const tierOffset: Record<QuestionTier, number> = {
    Y3: 4, Y4: 2, Y5: 0, Y6: -2, Y7: 0, Y8: -1, Y9: -2, Y10: -3, Y11: -4,
  }
  const diffOffset: Record<DifficultyLevel, number> = { bronze: 2, silver: 0, gold: -3 }
  return Math.max(8, base + tierOffset[tier] + diffOffset[difficulty])
}

// ─────────────────────────────────────────────
// ADDITION
// ─────────────────────────────────────────────

export function generateAddition(diff: DifficultyLevel): Question {
  let a: number, b: number
  if (diff === 'bronze') { a = rand(1, 20);  b = rand(1, 20) }
  else if (diff === 'silver') { a = rand(10, 99); b = rand(10, 99) }
  else { a = rand(100, 999); b = rand(100, 999) }

  const correct = String(a + b)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(a + b + 1), String(a + b - 1), String(a + b + 10),
  ])
  return {
    id: qid(), tier: 'Y3', type: 'addition', difficulty: diff,
    questionText: `What is ${a} + ${b}?`,
    answers, correctIndex,
    explanation: `${a} + ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y3', diff),
  }
}

// ─────────────────────────────────────────────
// SUBTRACTION
// ─────────────────────────────────────────────

export function generateSubtraction(diff: DifficultyLevel): Question {
  let a: number, b: number
  if (diff === 'bronze') { a = rand(10, 30); b = rand(1, a) }
  else if (diff === 'silver') { a = rand(30, 100); b = rand(10, a) }
  else { a = rand(100, 500); b = rand(50, a) }

  const correct = String(a - b)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(a - b + 1), String(a - b - 1), String(b - a), String(a + b),
  ])
  return {
    id: qid(), tier: 'Y3', type: 'subtraction', difficulty: diff,
    questionText: `What is ${a} − ${b}?`,
    answers, correctIndex,
    explanation: `${a} − ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y3', diff),
  }
}

// ─────────────────────────────────────────────
// MULTIPLICATION
// ─────────────────────────────────────────────

export function generateMultiplication(diff: DifficultyLevel): Question {
  let a: number, b: number
  if (diff === 'bronze') {
    const tables = [2, 3, 5, 10]
    a = tables[rand(0, tables.length - 1)]; b = rand(1, 12)
  } else if (diff === 'silver') {
    a = rand(2, 12); b = rand(2, 12)
  } else {
    a = rand(12, 25); b = rand(2, 12)
  }

  const correct = String(a * b)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(a * b + a), String(a * b - a), String(a * (b + 1)), String((a - 1) * b),
  ])
  return {
    id: qid(), tier: 'Y3', type: 'multiplication', difficulty: diff,
    questionText: `What is ${a} × ${b}?`,
    answers, correctIndex,
    explanation: `${a} × ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y4', diff),
  }
}

// ─────────────────────────────────────────────
// DIVISION
// ─────────────────────────────────────────────

export function generateDivision(diff: DifficultyLevel): Question {
  let b: number, result: number
  if (diff === 'bronze') {
    b = rand(2, 5); result = rand(1, 10)
  } else if (diff === 'silver') {
    b = rand(2, 12); result = rand(2, 12)
  } else {
    b = rand(3, 12); result = rand(5, 20)
  }
  const a = b * result

  const correct = String(result)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(result + 1), String(result - 1), String(result + b), String(a - b),
  ])
  return {
    id: qid(), tier: 'Y4', type: 'division', difficulty: diff,
    questionText: `What is ${a} ÷ ${b}?`,
    answers, correctIndex,
    explanation: `${a} ÷ ${b} = ${correct}  (because ${b} × ${result} = ${a})`,
    timeLimitSeconds: timeLimit('Y4', diff),
  }
}

// ─────────────────────────────────────────────
// BODMAS / ORDER OF OPERATIONS
// ─────────────────────────────────────────────

export function generateBodmas(diff: DifficultyLevel): Question {
  type T = { q: string; correct: number; wrongs: number[]; exp: string }
  const bronze: T[] = [
    { q: '3 + 4 × 5',      correct: 23, wrongs: [35, 27, 20], exp: 'Multiply first: 4×5=20, then add 3. Answer: 23.' },
    { q: '20 − 3 × 4',     correct: 8,  wrongs: [68, 12, 5],  exp: 'Multiply first: 3×4=12, then 20−12=8.' },
    { q: '15 ÷ 3 + 7',     correct: 12, wrongs: [5, 15, 10],  exp: 'Divide first: 15÷3=5, then 5+7=12.' },
    { q: '2 + 6 × 3',      correct: 20, wrongs: [24, 18, 14], exp: 'Multiply first: 6×3=18, then 2+18=20.' },
    { q: '10 − 12 ÷ 4',    correct: 7,  wrongs: [0, 4, 13],   exp: 'Divide first: 12÷4=3, then 10−3=7.' },
  ]
  const silver: T[] = [
    { q: '(8 + 4) × 3',    correct: 36, wrongs: [20, 32, 24], exp: 'Brackets first: 8+4=12, then 12×3=36.' },
    { q: '(6 + 2) × (5 − 3)', correct: 16, wrongs: [38, 14, 20], exp: 'Brackets: 8 × 2 = 16.' },
    { q: '3 + 4² − 1',     correct: 18, wrongs: [48, 16, 20], exp: 'Powers first: 4²=16, then 3+16−1=18.' },
    { q: '(15 − 6) ÷ 3',   correct: 3,  wrongs: [13, 7, 1],   exp: 'Brackets first: 15−6=9, then 9÷3=3.' },
    { q: '2 × 3 + 4 × 5',  correct: 26, wrongs: [50, 22, 30], exp: 'Multiply both pairs first: 6+20=26.' },
  ]
  const gold: T[] = [
    { q: '4² + 3 × 2',     correct: 22, wrongs: [28, 38, 19], exp: 'Powers: 4²=16. Multiply: 3×2=6. Then 16+6=22.' },
    { q: '2³ − (4 + 1)',   correct: 3,  wrongs: [11, 7, 5],   exp: 'Powers: 2³=8. Brackets: 4+1=5. Then 8−5=3.' },
    { q: '(3 + 2)² − 4',  correct: 21, wrongs: [25, 7, 10],  exp: 'Brackets: 5. Powers: 5²=25. Then 25−4=21.' },
    { q: '18 ÷ (2 + 1) × 4', correct: 24, wrongs: [30, 9, 12], exp: 'Brackets: 2+1=3. Then 18÷3=6. Then 6×4=24.' },
  ]
  const pool = diff === 'bronze' ? bronze : diff === 'silver' ? silver : gold
  const t = pool[rand(0, pool.length - 1)]
  const { answers, correctIndex } = buildMCQ(String(t.correct), t.wrongs.map(String))
  return {
    id: qid(), tier: 'Y5', type: 'bodmas', difficulty: diff,
    questionText: `Calculate: ${t.q}`,
    answers, correctIndex,
    explanation: t.exp,
    timeLimitSeconds: timeLimit('Y5', diff),
  }
}

// ─────────────────────────────────────────────
// FRACTIONS
// ─────────────────────────────────────────────

export function generateFractions(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Fraction of a whole number: 1/2 of X
    const denoms = [2, 4, 5, 10]
    const d = denoms[rand(0, denoms.length - 1)]
    const result = rand(1, 10)
    const whole = d * result
    const correct = String(result)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(result + 1), String(result * 2), String(whole),
    ])
    return {
      id: qid(), tier: 'Y4', type: 'fractions', difficulty: diff,
      questionText: `What is 1/${d} of ${whole}?`,
      answers, correctIndex,
      explanation: `1/${d} of ${whole} = ${whole} ÷ ${d} = ${correct}`,
      timeLimitSeconds: timeLimit('Y4', diff),
    }
  }

  if (diff === 'silver') {
    // Adding fractions with same denominator
    const d = rand(3, 12)
    const n1 = rand(1, d - 1)
    const n2 = rand(1, d - n1)
    const numSum = n1 + n2
    let correct: string
    if (numSum >= d) {
      const whole = Math.floor(numSum / d)
      const rem = numSum % d
      correct = rem === 0 ? String(whole) : `${whole} ${rem}/${d}`
    } else {
      correct = `${numSum}/${d}`
    }
    const { answers, correctIndex } = buildMCQ(correct, [
      `${n1 + n2 + 1}/${d}`, `${n1}/${d}`, `${n1 + n2}/${d + 1}`,
    ])
    return {
      id: qid(), tier: 'Y5', type: 'fractions', difficulty: diff,
      questionText: `What is ${n1}/${d} + ${n2}/${d}?`,
      answers, correctIndex,
      explanation: `${n1}/${d} + ${n2}/${d} = ${numSum}/${d}${numSum >= d ? ` = ${correct}` : ''}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  // Gold: fraction of amount with non-trivial denominator
  const d = rand(3, 8)
  const n = rand(1, d - 1)
  const result = rand(2, 8)
  const whole = d * result
  const correct = String(n * result)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(n * result + n), String(result), String(whole - n * result),
  ])
  return {
    id: qid(), tier: 'Y5', type: 'fractions', difficulty: diff,
    questionText: `What is ${n}/${d} of ${whole}?`,
    answers, correctIndex,
    explanation: `${n}/${d} of ${whole}: first ${whole}÷${d}=${result}, then ×${n} = ${correct}`,
    timeLimitSeconds: timeLimit('Y5', diff),
  }
}

// ─────────────────────────────────────────────
// DECIMALS
// ─────────────────────────────────────────────

export function generateDecimals(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    const a = rand(1, 9) / 10
    const b = rand(1, 9) / 10
    const correct = String(Math.round((a + b) * 10) / 10)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(Math.round((a + b + 0.1) * 10) / 10),
      String(Math.round((a + b - 0.1) * 10) / 10),
      String(Math.round((a * b) * 10) / 10),
    ])
    return {
      id: qid(), tier: 'Y4', type: 'decimals', difficulty: diff,
      questionText: `What is ${a} + ${b}?`,
      answers, correctIndex,
      explanation: `${a} + ${b} = ${correct}`,
      timeLimitSeconds: timeLimit('Y4', diff),
    }
  }

  if (diff === 'silver') {
    // Money addition
    const pounds1 = rand(1, 9), pence1 = rand(0, 99)
    const pounds2 = rand(1, 9), pence2 = rand(0, 99)
    const total = pounds1 * 100 + pence1 + pounds2 * 100 + pence2
    const tp = Math.floor(total / 100), tc = total % 100
    const correct = `£${tp}.${String(tc).padStart(2, '0')}`
    const alt1 = `£${tp + 1}.${String(tc).padStart(2, '0')}`
    const alt2 = `£${tp}.${String((tc + 1) % 100).padStart(2, '0')}`
    const alt3 = `£${tp - 1}.${String(tc).padStart(2, '0')}`
    const { answers, correctIndex } = buildMCQ(correct, [alt1, alt2, alt3])
    return {
      id: qid(), tier: 'Y4', type: 'decimals', difficulty: diff,
      questionText: `£${pounds1}.${String(pence1).padStart(2, '0')} + £${pounds2}.${String(pence2).padStart(2, '0')} = ?`,
      answers, correctIndex,
      explanation: `Convert to pence: ${pounds1 * 100 + pence1}p + ${pounds2 * 100 + pence2}p = ${total}p = ${correct}`,
      timeLimitSeconds: timeLimit('Y4', diff),
    }
  }

  // Gold: multiply decimal by integer
  const a = rand(1, 9) + rand(1, 9) / 10
  const b = rand(2, 9)
  const result = Math.round(a * b * 10) / 10
  const correct = String(result)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(result + 0.1), String(result - 0.1), String(result + b),
  ])
  return {
    id: qid(), tier: 'Y5', type: 'decimals', difficulty: diff,
    questionText: `What is ${a} × ${b}?`,
    answers, correctIndex,
    explanation: `${a} × ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y5', diff),
  }
}

// ─────────────────────────────────────────────
// PERCENTAGES
// ─────────────────────────────────────────────

export function generatePercentages(diff: DifficultyLevel): Question {
  const nicePercentages = [10, 20, 25, 50, 75]

  if (diff === 'bronze') {
    // BUG-5 fix: only generate when result is a whole number
    let pct: number, whole: number, correct: number
    let attempts = 0
    do {
      pct = nicePercentages[rand(0, nicePercentages.length - 1)]
      whole = rand(1, 10) * 20
      correct = (pct / 100) * whole
      attempts++
    } while (!Number.isInteger(correct) && attempts < 20)
    const correctStr = String(correct)
    const { answers, correctIndex } = buildMCQ(correctStr, [
      String(correct + 5),
      String(whole - correct),
      String(correct * 2),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'percentages', difficulty: diff,
      questionText: `What is ${pct}% of ${whole}?`,
      answers, correctIndex,
      explanation: `${pct}% of ${whole} = ${whole} × ${pct}/100 = ${correctStr}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    const pct = rand(1, 9) * 5  // 5, 10, 15 ... 45
    const whole = rand(2, 20) * 10
    const result = Math.round((pct / 100) * whole)
    const correct = String(result)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(result + 5), String(result - 5), String(whole - result),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'percentages', difficulty: diff,
      questionText: `What is ${pct}% of ${whole}?`,
      answers, correctIndex,
      explanation: `${pct}% = ${pct}/100. ${whole} × ${pct}/100 = ${correct}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  // Gold: reverse percentage (find original)
  const pct = nicePercentages[rand(0, 3)]
  const result = rand(1, 10) * 10
  const original = result / (pct / 100)
  const correct = String(original)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(original + 10), String(original - 10), String(result),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'percentages', difficulty: diff,
    questionText: `${pct}% of a number is ${result}. What is the number?`,
    answers, correctIndex,
    explanation: `If ${pct}% = ${result}, then 1% = ${result / pct}, so 100% = ${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// RATIO
// ─────────────────────────────────────────────

export function generateRatio(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Simplify ratio
    const factor = rand(2, 6)
    const a = rand(1, 6) * factor
    const b = rand(1, 6) * factor
    const g = gcd(a, b)
    const correct = `${a / g}:${b / g}`
    const { answers, correctIndex } = buildMCQ(correct, [
      `${a}:${b}`, `${a / g + 1}:${b / g}`, `${a / g}:${b / g + 1}`,
    ])
    return {
      id: qid(), tier: 'Y6', type: 'ratio', difficulty: diff,
      questionText: `Simplify the ratio ${a}:${b}`,
      answers, correctIndex,
      explanation: `HCF of ${a} and ${b} is ${g}. ${a}÷${g} = ${a / g}, ${b}÷${g} = ${b / g}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  if (diff === 'silver') {
    // Share in ratio
    const a = rand(1, 5), b = rand(1, 5)
    const total = (a + b) * rand(2, 8)
    const shareA = (a / (a + b)) * total
    const correct = String(shareA)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(total - shareA), String(shareA + a), String(shareA - b),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'ratio', difficulty: diff,
      questionText: `Share £${total} in the ratio ${a}:${b}. What is the larger share?`,
      answers, correctIndex,
      explanation: `Total parts: ${a + b}. Each part = £${total / (a + b)}. Larger share (${Math.max(a, b)} parts) = £${correct}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  // Gold: unitary method
  const items = rand(3, 8)
  const cost = rand(2, 6) * items
  const newItems = rand(items + 1, items * 2 + 2)
  const correct = String((cost / items) * newItems)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(Number(correct) + cost / items),
    String(Number(correct) - cost / items),
    String(cost + newItems),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'ratio', difficulty: diff,
    questionText: `${items} pens cost £${cost}. How much do ${newItems} pens cost?`,
    answers, correctIndex,
    explanation: `1 pen = £${cost / items}. ${newItems} pens = £${cost / items} × ${newItems} = £${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

// ─────────────────────────────────────────────
// ALGEBRA
// ─────────────────────────────────────────────

export function generateAlgebra(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Substitution: if a = N, find 2a
    const a = rand(1, 12)
    const coeff = rand(2, 5)
    const correct = String(coeff * a)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(coeff * a + a), String(coeff + a), String(coeff * a - 1),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'algebra', difficulty: diff,
      questionText: `If a = ${a}, what is ${coeff}a?`,
      answers, correctIndex,
      explanation: `${coeff}a means ${coeff} × a = ${coeff} × ${a} = ${correct}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  if (diff === 'silver') {
    // Simple equation: ax + b = c
    const x = rand(1, 10)
    const a = rand(2, 5)
    const b = rand(1, 10)
    const c = a * x + b
    const correct = String(x)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(x + 1), String(x - 1), String(c - b),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'algebra', difficulty: diff,
      questionText: `Solve: ${a}x + ${b} = ${c}`,
      answers, correctIndex,
      explanation: `${a}x = ${c} − ${b} = ${c - b}. x = ${c - b} ÷ ${a} = ${correct}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  // Gold: two-step with subtraction
  const x = rand(1, 15)
  const a = rand(2, 6)
  const b = rand(1, 10)
  const c = a * x - b
  const correct = String(x)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(x + 1), String(x - 1), String(Math.floor((c + b) / a) + 1),
  ])
  return {
    id: qid(), tier: 'Y7', type: 'algebra', difficulty: diff,
    questionText: `Solve: ${a}x − ${b} = ${c}`,
    answers, correctIndex,
    explanation: `${a}x = ${c} + ${b} = ${c + b}. x = ${c + b} ÷ ${a} = ${correct}`,
    timeLimitSeconds: timeLimit('Y7', diff),
  }
}

// ─────────────────────────────────────────────
// SEQUENCES
// ─────────────────────────────────────────────

export function generateSequences(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Arithmetic sequence: find next term
    const start = rand(1, 20)
    const step = rand(2, 8)
    const terms = [start, start + step, start + 2 * step, start + 3 * step]
    const correct = String(start + 4 * step)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(Number(correct) + step),
      String(Number(correct) - step),
      String(Number(correct) + 1),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'sequences', difficulty: diff,
      questionText: `What is the next number? ${terms.join(', ')}, __?`,
      answers, correctIndex,
      explanation: `The rule is +${step} each time. ${terms[3]} + ${step} = ${correct}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    // Find missing term
    const start = rand(1, 15)
    const step = rand(3, 9)
    const pos = rand(1, 3)
    const terms = [0, 1, 2, 3, 4].map(i => start + i * step)
    const correct = String(terms[pos])
    terms[pos] = undefined as unknown as number
    const display = terms.map((t, i) => (i === pos ? '?' : String(t))).join(', ')
    const { answers, correctIndex } = buildMCQ(correct, [
      String(Number(correct) + step),
      String(Number(correct) - step),
      String(Number(correct) + 1),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'sequences', difficulty: diff,
      questionText: `Find the missing term: ${display}`,
      answers, correctIndex,
      explanation: `Rule is +${step}. Missing term = ${correct}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  // Gold: nth term
  const a = rand(2, 5), b = rand(0, 8)
  const n = rand(6, 15)
  const correct = String(a * n + b)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(a * n + b + a), String(a * n + b - a), String(a * (n + 1) + b),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'sequences', difficulty: diff,
    questionText: `A sequence has nth term: ${a}n + ${b}. What is the ${n}th term?`,
    answers, correctIndex,
    explanation: `Substitute n = ${n}: ${a} × ${n} + ${b} = ${a * n} + ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// GEOMETRY — AREA
// ─────────────────────────────────────────────

export function generateGeometryArea(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Rectangle area
    const w = rand(2, 15), h = rand(2, 15)
    const correct = String(w * h)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(2 * (w + h)), String(w * h + w), String((w + 1) * h),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'geometry_area', difficulty: diff,
      questionText: `A rectangle is ${w}cm wide and ${h}cm tall. What is its area?`,
      answers, correctIndex,
      explanation: `Area = width × height = ${w} × ${h} = ${correct} cm²`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    // Triangle area
    const b = rand(4, 20), h = rand(4, 20)
    const result = (b * h) / 2
    const correct = String(result)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(b * h), String(result + b), String(result - h / 2),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'geometry_area', difficulty: diff,
      questionText: `A triangle has base ${b}cm and height ${h}cm. What is its area?`,
      answers, correctIndex,
      explanation: `Area = ½ × base × height = ½ × ${b} × ${h} = ${correct} cm²`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  // Gold: trapezium
  const a = rand(3, 12), bSide = rand(a + 1, 20), h = rand(3, 12)
  const result = ((a + bSide) / 2) * h
  const correct = String(result)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(result + h), String((a + bSide) * h), String(result - a),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'geometry_area', difficulty: diff,
    questionText: `A trapezium has parallel sides ${a}cm and ${bSide}cm, height ${h}cm. Area?`,
    answers, correctIndex,
    explanation: `Area = ½ × (${a} + ${bSide}) × ${h} = ½ × ${a + bSide} × ${h} = ${correct} cm²`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// GEOMETRY — ANGLES
// ─────────────────────────────────────────────

export function generateGeometryAngles(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Angles in triangle
    const a = rand(30, 80), b = rand(30, 80)
    if (a + b >= 180) return generateGeometryAngles(diff)
    const c = 180 - a - b
    const correct = String(c)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(c + 10), String(c - 10), String(180 - a),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'geometry_angles', difficulty: diff,
      questionText: `A triangle has angles ${a}° and ${b}°. What is the third angle?`,
      answers, correctIndex,
      explanation: `Angles in a triangle add to 180°. ${a} + ${b} + ? = 180. ? = ${correct}°`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    // Angles on a straight line
    const a = rand(30, 140)
    const c = 180 - a
    const correct = String(c)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(c + 10), String(360 - a), String(a),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'geometry_angles', difficulty: diff,
      questionText: `Two angles on a straight line. One is ${a}°. What is the other?`,
      answers, correctIndex,
      explanation: `Angles on a straight line sum to 180°. 180 − ${a} = ${correct}°`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  // Gold: interior angle of regular polygon
  const sides = rand(5, 10)
  const interior = ((sides - 2) * 180) / sides
  const correct = String(interior)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(interior + 10), String(360 / sides), String(interior - 10),
  ])
  return {
    id: qid(), tier: 'Y7', type: 'geometry_angles', difficulty: diff,
    questionText: `What is the interior angle of a regular ${sides}-sided polygon?`,
    answers, correctIndex,
    explanation: `Interior angle = (${sides}−2) × 180 ÷ ${sides} = ${(sides - 2) * 180} ÷ ${sides} = ${correct}°`,
    timeLimitSeconds: timeLimit('Y7', diff),
  }
}

// ─────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────

export function generateStatistics(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Mean of small set
    const count = rand(3, 5)
    const vals = Array.from({ length: count }, () => rand(1, 20))
    const sum = vals.reduce((a, b) => a + b, 0)
    const mean = sum / count
    if (!Number.isInteger(mean)) return generateStatistics(diff)
    const correct = String(mean)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(mean + 1), String(mean - 1), String(Math.max(...vals)),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'statistics', difficulty: diff,
      questionText: `Find the mean of: ${vals.join(', ')}`,
      answers, correctIndex,
      explanation: `Sum = ${sum}. Mean = ${sum} ÷ ${count} = ${correct}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    // Median
    const count = rand(4, 6) * 2 - 1  // odd count for clean median
    const vals = Array.from({ length: count }, () => rand(1, 30)).sort((a, b) => a - b)
    const median = vals[Math.floor(count / 2)]
    const correct = String(median)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(vals[0]), String(vals[vals.length - 1]),
      String(Math.round(vals.reduce((a, b) => a + b, 0) / count)),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'statistics', difficulty: diff,
      questionText: `Find the median of: ${vals.join(', ')}`,
      answers, correctIndex,
      explanation: `Sorted: ${vals.join(', ')}. Middle value (position ${Math.floor(count / 2) + 1}) = ${correct}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  // Gold: range and mean together
  const count = rand(4, 6)
  const vals = Array.from({ length: count }, () => rand(5, 50))
  const sum = vals.reduce((a, b) => a + b, 0)
  const mean = Math.round(sum / count)
  const range = Math.max(...vals) - Math.min(...vals)
  const correct = String(range)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(range + 1), String(range - 2), String(mean),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'statistics', difficulty: diff,
    questionText: `Data: ${vals.join(', ')}. The mean is ${mean}. What is the range?`,
    answers, correctIndex,
    explanation: `Range = largest − smallest = ${Math.max(...vals)} − ${Math.min(...vals)} = ${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// NEGATIVE NUMBERS
// ─────────────────────────────────────────────

export function generateNegativeNumbers(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    const a = -rand(1, 10)
    const b = rand(a + 1, 15)
    // BUG-9 fix: difference between a (negative) and b = b - a (e.g. b - (-9) = b + 9)
    const correct = b - a
    const correctStr = String(correct)
    const { answers, correctIndex } = buildMCQ(correctStr, [
      String(correct - 1), String(correct + 2), String(b + a),  // b+a is common wrong answer
    ])
    return {
      id: qid(), tier: 'Y5', type: 'negative_numbers', difficulty: diff,
      questionText: `What is the difference between ${a} and ${b}?`,
      answers, correctIndex,
      explanation: `${b} − (${a}) = ${b} + ${Math.abs(a)} = ${correctStr}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    const a = -rand(5, 15)
    const b = rand(1, 15)
    const correct = String(a + b)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(a + b + 1), String(b - a), String(Math.abs(a) - b),
    ])
    return {
      id: qid(), tier: 'Y5', type: 'negative_numbers', difficulty: diff,
      questionText: `What is ${a} + ${b}?`,
      answers, correctIndex,
      explanation: `Starting at ${a}, add ${b}: ${a} + ${b} = ${correct}`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  // Gold: multiplication with negatives
  const a = -rand(2, 12)
  const b = rand(2, 12)
  const correct = String(a * b)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(Math.abs(a * b)), String(a * b + b), String(a - b),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'negative_numbers', difficulty: diff,
    questionText: `What is ${a} × ${b}?`,
    answers, correctIndex,
    explanation: `Negative × positive = negative. ${Math.abs(a)} × ${b} = ${Math.abs(a * b)}, so ${a} × ${b} = ${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// FACTORS & PRIMES
// ─────────────────────────────────────────────

export function generateFactorsPrimes(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    const notPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21]
    const isPrimeQ = Math.random() > 0.5
    const n = isPrimeQ
      ? primes[rand(0, primes.length - 1)]
      : notPrimes[rand(0, notPrimes.length - 1)]
    const correct = isPrimeQ ? 'Prime' : 'Not prime'
    const { answers, correctIndex } = buildMCQ(correct, ['Prime', 'Not prime', 'Neither'])
    return {
      id: qid(), tier: 'Y5', type: 'factors_primes', difficulty: diff,
      questionText: `Is ${n} a prime number?`,
      answers, correctIndex,
      explanation: isPrimeQ
        ? `${n} is prime — it only has 2 factors: 1 and ${n}`
        : `${n} is NOT prime — it has more than 2 factors`,
      timeLimitSeconds: timeLimit('Y5', diff),
    }
  }

  if (diff === 'silver') {
    // HCF
    const factor = rand(2, 6)
    const a = factor * rand(2, 6)
    const b = factor * rand(2, 6)
    const correct = String(gcd(a, b))
    const { answers, correctIndex } = buildMCQ(correct, [
      String(Number(correct) * 2), String(factor - 1), String(a * b),
    ])
    return {
      id: qid(), tier: 'Y6', type: 'factors_primes', difficulty: diff,
      questionText: `What is the HCF (highest common factor) of ${a} and ${b}?`,
      answers, correctIndex,
      explanation: `Factors of ${a}: list them. Factors of ${b}: list them. Highest common = ${correct}`,
      timeLimitSeconds: timeLimit('Y6', diff),
    }
  }

  // Gold: LCM
  const a = rand(3, 12), b = rand(3, 12)
  const lcm = (a * b) / gcd(a, b)
  const correct = String(lcm)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(a * b), String(lcm + a), String(lcm - b),
  ])
  return {
    id: qid(), tier: 'Y6', type: 'factors_primes', difficulty: diff,
    questionText: `What is the LCM (lowest common multiple) of ${a} and ${b}?`,
    answers, correctIndex,
    explanation: `LCM(${a}, ${b}) = ${a} × ${b} ÷ HCF(${a}, ${b}) = ${a * b} ÷ ${gcd(a, b)} = ${correct}`,
    timeLimitSeconds: timeLimit('Y6', diff),
  }
}

// ─────────────────────────────────────────────
// WORDED PROBLEMS (1-step)
// ─────────────────────────────────────────────

export function generateWorded1Step(diff: DifficultyLevel): Question {
  const templates = [
    () => {
      const price = rand(2, 15), qty = rand(2, 8)
      const correct = String(price * qty)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(price * qty + price), String(price + qty), String(price * qty - price),
      ])
      return {
        text: `A book costs £${price}. How much do ${qty} books cost?`,
        correct, answers, correctIndex,
        explanation: `${qty} books × £${price} each = £${correct}`,
      }
    },
    () => {
      const total = rand(3, 9) * rand(3, 9)
      const groups = rand(3, 9)
      const each = total / groups
      if (!Number.isInteger(each)) return null
      const correct = String(each)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(each + 1), String(total - groups), String(each * 2),
      ])
      return {
        text: `${total} sweets are shared equally among ${groups} children. How many each?`,
        correct, answers, correctIndex,
        explanation: `${total} ÷ ${groups} = ${correct}`,
      }
    },
    () => {
      const km = rand(3, 20), hours = rand(2, 5)
      const speed = km / hours
      if (!Number.isInteger(speed)) return null
      const correct = String(speed)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(speed + 1), String(speed * 2), String(km - hours),
      ])
      return {
        text: `A train travels ${km}km in ${hours} hours. What is its average speed in km/h?`,
        correct, answers, correctIndex,
        explanation: `Speed = distance ÷ time = ${km} ÷ ${hours} = ${correct} km/h`,
      }
    },
  ]

  let result = null
  while (!result) {
    result = templates[rand(0, templates.length - 1)]()
  }

  return {
    id: qid(), tier: 'Y5', type: 'worded_1step', difficulty: diff,
    questionText: result.text,
    answers: result.answers, correctIndex: result.correctIndex,
    explanation: result.explanation,
    timeLimitSeconds: timeLimit('Y5', diff, 20),
  }
}

// ─────────────────────────────────────────────
// WORDED PROBLEMS (2-step) — 11+ critical
// ─────────────────────────────────────────────

export function generateWorded2Step(diff: DifficultyLevel): Question {
  const templates = [
    () => {
      // Apples price + change
      const priceEach = rand(10, 30)  // pence
      const qty = rand(4, 10)
      const paid = Math.ceil((priceEach * qty) / 100 + rand(0, 2)) * 100  // round pounds
      const total = priceEach * qty
      const change = paid - total
      const correct = String(change)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(change + priceEach), String(paid - qty), String(total),
      ])
      return {
        text: `Apples cost ${priceEach}p each. I buy ${qty} apples and pay £${paid / 100}. How much change do I get (in pence)?`,
        correct, answers, correctIndex,
        explanation: `Total cost = ${qty} × ${priceEach}p = ${total}p. Change = ${paid}p − ${total}p = ${correct}p`,
      }
    },
    () => {
      // Scale recipe
      const baseServings = rand(2, 5)
      const newServings = baseServings * rand(2, 4)
      const ingredient = rand(3, 15) * baseServings * 10
      const newAmount = (ingredient / baseServings) * newServings
      const correct = String(newAmount)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(newAmount + ingredient / baseServings),
        String(ingredient + newServings),
        String(newAmount - ingredient / baseServings),
      ])
      return {
        text: `A recipe for ${baseServings} people uses ${ingredient}g of flour. How much flour is needed for ${newServings} people?`,
        correct, answers, correctIndex,
        explanation: `Per person: ${ingredient}g ÷ ${baseServings} = ${ingredient / baseServings}g. For ${newServings}: × ${newServings} = ${correct}g`,
      }
    },
    () => {
      // Percentage discount then find final price
      const original = rand(2, 20) * 10
      const discount = [10, 20, 25][rand(0, 2)]
      const discountAmount = (discount / 100) * original
      const final = original - discountAmount
      const correct = String(final)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(discountAmount), String(original + discountAmount), String(final + 5),
      ])
      return {
        text: `A jacket costs £${original}. It's reduced by ${discount}%. What is the sale price?`,
        correct, answers, correctIndex,
        explanation: `Discount = ${discount}% of £${original} = £${discountAmount}. Sale price = £${original} − £${discountAmount} = £${correct}`,
      }
    },
  ]

  let result = null
  while (!result) {
    result = templates[rand(0, templates.length - 1)]()
  }

  return {
    id: qid(), tier: 'Y6', type: 'worded_2step', difficulty: diff,
    questionText: result.text,
    answers: result.answers, correctIndex: result.correctIndex,
    explanation: result.explanation,
    timeLimitSeconds: timeLimit('Y6', diff, 22),
  }
}

// ─────────────────────────────────────────────
// COORDINATES
// ─────────────────────────────────────────────

export function generateCoordinates(diff: DifficultyLevel): Question {
  const templates = [
    () => {
      // Read a coordinate point
      const x = diff === 'bronze' ? rand(0, 5) : diff === 'silver' ? rand(-5, 10) : rand(-10, 10)
      const y = diff === 'bronze' ? rand(0, 5) : diff === 'silver' ? rand(-5, 10) : rand(-10, 10)
      const correct = `(${x}, ${y})`
      const { answers, correctIndex } = buildMCQ(correct, [
        `(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`,
      ])
      return {
        text: `A point is plotted at x = ${x} and y = ${y}. What are its coordinates?`,
        correct, answers, correctIndex,
        explanation: `Coordinates are always written as (x, y), so the answer is (${x}, ${y}).`,
      }
    },
    () => {
      // Find missing coordinate
      const x1 = rand(1, 8), y1 = rand(1, 8)
      const x2 = rand(1, 8)
      const correct = String(y1) // horizontal line, same y
      const { answers, correctIndex } = buildMCQ(correct, [
        String(y1 + 1), String(y1 - 1), String(x2),
      ])
      return {
        text: `Points A (${x1}, ${y1}) and B (${x2}, ?) lie on a horizontal line. What is the y-coordinate of B?`,
        correct, answers, correctIndex,
        explanation: `On a horizontal line, the y-coordinate is the same for all points. So the y-coordinate of B is ${correct}.`,
      }
    },
    () => {
      // Midpoint of two coordinates
      const x1 = rand(0, 8) * 2, y1 = rand(0, 8) * 2
      const x2 = rand(0, 8) * 2, y2 = rand(0, 8) * 2
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      const correct = `(${mx}, ${my})`
      const { answers, correctIndex } = buildMCQ(correct, [
        `(${mx + 1}, ${my})`, `(${mx}, ${my + 1})`, `(${x1}, ${y2})`,
      ])
      return {
        text: `What is the midpoint of (${x1}, ${y1}) and (${x2}, ${y2})?`,
        correct, answers, correctIndex,
        explanation: `Midpoint = ((${x1}+${x2})/2, (${y1}+${y2})/2) = (${mx}, ${my})`,
      }
    },
    () => {
      // Translation
      const x = rand(1, 6), y = rand(1, 6)
      const dx = rand(1, 4) * (Math.random() < 0.5 ? 1 : -1)
      const dy = rand(1, 4) * (Math.random() < 0.5 ? 1 : -1)
      const nx = x + dx, ny = y + dy
      const correct = `(${nx}, ${ny})`
      const { answers, correctIndex } = buildMCQ(correct, [
        `(${x - dx}, ${ny})`, `(${nx}, ${y - dy})`, `(${x + dy}, ${y + dx})`,
      ])
      const dxStr = dx >= 0 ? `right ${dx}` : `left ${Math.abs(dx)}`
      const dyStr = dy >= 0 ? `up ${dy}` : `down ${Math.abs(dy)}`
      return {
        text: `Point P is at (${x}, ${y}). It moves ${dxStr} and ${dyStr}. What are its new coordinates?`,
        correct, answers, correctIndex,
        explanation: `New x = ${x} + (${dx}) = ${nx}. New y = ${y} + (${dy}) = ${ny}. New coordinates: (${nx}, ${ny})`,
      }
    },
  ]

  const result = templates[rand(0, templates.length - 1)]()
  return {
    id: qid(), tier: 'Y6', type: 'coordinates', difficulty: diff,
    questionText: result.text,
    answers: result.answers, correctIndex: result.correctIndex,
    explanation: result.explanation,
    timeLimitSeconds: timeLimit('Y6', diff, 18),
  }
}

// ─────────────────────────────────────────────
// PROBABILITY
// ─────────────────────────────────────────────

export function generateProbability(diff: DifficultyLevel): Question {
  const templates = [
    () => {
      // Simple probability as fraction
      const total = diff === 'bronze' ? rand(2, 6) : diff === 'silver' ? rand(4, 10) : rand(5, 12)
      const favourable = rand(1, total - 1)
      const correct = `${favourable}/${total}`
      const { answers, correctIndex } = buildMCQ(correct, [
        `${total - favourable}/${total}`, `${favourable}/${total + 1}`, `${favourable + 1}/${total}`,
      ])
      return {
        text: `A bag contains ${total} balls, ${favourable} of which are red. What is the probability of picking a red ball?`,
        correct, answers, correctIndex,
        explanation: `Probability = favourable outcomes ÷ total outcomes = ${favourable}/${total}`,
      }
    },
    () => {
      // Probability as percentage
      const total = [4, 5, 10, 20][rand(0, 3)]
      const favourable = rand(1, total - 1)
      const pct = Math.round((favourable / total) * 100)
      const correct = `${pct}%`
      const { answers, correctIndex } = buildMCQ(correct, [
        `${100 - pct}%`, `${pct + 10}%`, `${pct - 10 > 0 ? pct - 10 : pct + 5}%`,
      ])
      return {
        text: `${favourable} out of ${total} students walk to school. What is the probability of a student walking to school? Give your answer as a percentage.`,
        correct, answers, correctIndex,
        explanation: `${favourable} ÷ ${total} × 100 = ${pct}%`,
      }
    },
    () => {
      // Probability of NOT event
      const total = rand(4, 10)
      const favourable = rand(1, total - 1)
      const notFavourable = total - favourable
      const correct = `${notFavourable}/${total}`
      const { answers, correctIndex } = buildMCQ(correct, [
        `${favourable}/${total}`, `${notFavourable}/${total + 1}`, `${favourable - 1}/${total}`,
      ])
      return {
        text: `There are ${total} counters in a box, ${favourable} are yellow. What is the probability of NOT picking a yellow counter?`,
        correct, answers, correctIndex,
        explanation: `Not yellow = ${total} − ${favourable} = ${notFavourable}. Probability = ${notFavourable}/${total}`,
      }
    },
    () => {
      // Expected frequency
      const trials = [10, 20, 50, 100][rand(0, 3)]
      const numr = rand(1, 4)
      const denom = rand(numr + 1, 6)
      const expected = Math.round((numr / denom) * trials)
      const correct = String(expected)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(expected + 2), String(expected - 2 > 0 ? expected - 2 : expected + 3), String(trials - expected),
      ])
      return {
        text: `The probability of an event is ${numr}/${denom}. If the experiment is carried out ${trials} times, how many times would you expect the event to happen?`,
        correct, answers, correctIndex,
        explanation: `Expected frequency = probability × trials = ${numr}/${denom} × ${trials} = ${correct}`,
      }
    },
  ]

  const result = templates[rand(0, templates.length - 1)]()
  return {
    id: qid(), tier: 'Y6', type: 'probability', difficulty: diff,
    questionText: result.text,
    answers: result.answers, correctIndex: result.correctIndex,
    explanation: result.explanation,
    timeLimitSeconds: timeLimit('Y6', diff, 20),
  }
}

// ─────────────────────────────────────────────
// WORDED 3-STEP
// ─────────────────────────────────────────────

export function generateWorded3Step(diff: DifficultyLevel): Question {
  const templates = [
    () => {
      // Money: earn, spend, share
      const hourlyRate = rand(6, 15)
      const hoursWorked = rand(4, 8)
      const earned = hourlyRate * hoursWorked
      const spent = rand(1, Math.floor(earned / 2)) * 2
      const remaining = earned - spent
      const sharePeople = rand(2, 4)
      const correct = String(remaining / sharePeople)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(earned / sharePeople), String(remaining / sharePeople + rand(1, 5)), String(spent / sharePeople),
      ])
      return {
        text: `Sam earns £${hourlyRate} per hour and works ${hoursWorked} hours. She spends £${spent} on shopping, then splits the rest equally with ${sharePeople - 1} friends. How much does Sam receive?`,
        correct: `£${correct}`, answers: answers.map(a => `£${a}`), correctIndex,
        explanation: `Earned: ${hourlyRate} × ${hoursWorked} = £${earned}. After shopping: £${earned} − £${spent} = £${remaining}. Split ${sharePeople} ways: £${remaining} ÷ ${sharePeople} = £${correct}`,
      }
    },
    () => {
      // Distance/speed/time then comparison
      const speed1 = rand(40, 80)
      const time1 = rand(2, 4)
      const dist1 = speed1 * time1
      const dist2 = dist1 + rand(10, 60)
      const time2 = rand(2, 5)
      const speed2 = Math.round(dist2 / time2)
      const diff2 = Math.abs(speed2 - speed1)
      const faster = speed2 > speed1 ? 'Train B' : 'Train A'
      const correct = String(diff2)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(diff2 + rand(5, 15)), String(diff2 - rand(1, 5) > 0 ? diff2 - rand(1, 5) : diff2 + rand(1, 5)), String(diff2 * 2),
      ])
      return {
        text: `Train A travels at ${speed1} km/h for ${time1} hours. Train B travels ${dist2} km in ${time2} hours. How many km/h faster is ${faster}?`,
        correct: `${correct} km/h`, answers: answers.map(a => `${a} km/h`), correctIndex,
        explanation: `Train A distance = ${speed1} × ${time1} = ${dist1} km. Train B speed = ${dist2} ÷ ${time2} = ${speed2} km/h. Difference = |${speed2} − ${speed1}| = ${correct} km/h`,
      }
    },
    () => {
      // Shopping with percentages and totals
      const items = rand(3, 6)
      const priceEach = rand(3, 12)
      const subtotal = items * priceEach
      const discountPct = [10, 15, 20][rand(0, 2)]
      const discount = (discountPct / 100) * subtotal
      const afterDiscount = subtotal - discount
      const deliveryCharge = rand(2, 6)
      const total = afterDiscount + deliveryCharge
      const correct = String(total)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(subtotal + deliveryCharge), String(total + rand(2, 8)), String(afterDiscount),
      ])
      return {
        text: `An online shop sells books at £${priceEach} each. Maya buys ${items} books, gets a ${discountPct}% discount, and pays £${deliveryCharge} delivery. How much does Maya pay in total?`,
        correct: `£${correct}`, answers: answers.map(a => `£${a}`), correctIndex,
        explanation: `Subtotal: ${items} × £${priceEach} = £${subtotal}. Discount: ${discountPct}% of £${subtotal} = £${discount}. After discount: £${afterDiscount}. With delivery: £${afterDiscount} + £${deliveryCharge} = £${correct}`,
      }
    },
    () => {
      // Perimeter → cost
      const length = rand(4, 14)
      const width = rand(3, length - 1)
      const perimeter = 2 * (length + width)
      const pricePerMetre = rand(3, 9)
      const fencingCost = perimeter * pricePerMetre
      const gatesCost = rand(2, 4) * rand(15, 40)
      const total = fencingCost + gatesCost
      const numGates = Math.round(gatesCost / Math.round(gatesCost / 3))
      const gateCost = Math.round(gatesCost / numGates)
      const correct = String(total)
      const { answers, correctIndex } = buildMCQ(correct, [
        String(fencingCost), String(total + rand(5, 20)), String(total - rand(5, 15)),
      ])
      return {
        text: `A rectangular garden is ${length} m long and ${width} m wide. Fencing costs £${pricePerMetre} per metre. There are also ${numGates} gates costing £${gateCost} each. What is the total cost to fence the garden?`,
        correct: `£${correct}`, answers: answers.map(a => `£${a}`), correctIndex,
        explanation: `Perimeter = 2 × (${length} + ${width}) = ${perimeter} m. Fencing: ${perimeter} × £${pricePerMetre} = £${fencingCost}. Gates: ${numGates} × £${gateCost} = £${gatesCost}. Total: £${fencingCost} + £${gatesCost} = £${correct}`,
      }
    },
  ]

  const result = templates[rand(0, templates.length - 1)]()
  return {
    id: qid(), tier: 'Y6', type: 'worded_3step', difficulty: diff,
    questionText: result.text,
    answers: result.answers, correctIndex: result.correctIndex,
    explanation: result.explanation,
    timeLimitSeconds: timeLimit('Y6', diff, 28),
  }
}

// ─────────────────────────────────────────────
// MASTER GENERATOR
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
export function generateQuadratics(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Simple: x² + bx = 0 → x(x + b) = 0 → roots: 0 and -b
    const b = rand(2, 9)
    const root2 = -b
    const correct = `x = 0 or x = ${root2}`
    const { answers, correctIndex } = buildMCQ(correct, [
      `x = 0 or x = ${b}`,
      `x = ${b} or x = ${-b}`,
      `x = ${root2} only`,
    ])
    return {
      id: qid(), tier: 'Y9', type: 'quadratics', difficulty: diff,
      questionText: `Solve: x² + ${b}x = 0`,
      answers, correctIndex,
      explanation: `Factorise: x(x + ${b}) = 0 → x = 0 or x = ${root2}`,
      timeLimitSeconds: 40,
    }
  }

  if (diff === 'silver') {
    // x² + (a+b)x + ab = 0 → (x+a)(x+b) = 0 → roots -a, -b
    const a = rand(1, 7), b = rand(1, 7)
    const sumAB = a + b, prodAB = a * b
    const r1 = -a, r2 = -b
    const correct = r1 === r2 ? `x = ${r1}` : `x = ${r1} or x = ${r2}`
    const wrong1 = `x = ${a} or x = ${b}`
    const wrong2 = `x = ${r1} or x = ${a}`
    const wrong3 = `x = ${r2} only`
    const { answers, correctIndex } = buildMCQ(correct, [wrong1, wrong2, wrong3])
    return {
      id: qid(), tier: 'Y9', type: 'quadratics', difficulty: diff,
      questionText: `Factorise and solve: x² + ${sumAB}x + ${prodAB} = 0`,
      answers, correctIndex,
      explanation: `(x + ${a})(x + ${b}) = 0 → x = ${r1} or x = ${r2}`,
      timeLimitSeconds: 45,
    }
  }

  // Gold: x² + (a-b)x - ab = 0 → (x+a)(x-b) with one positive, one negative root
  const a = rand(2, 8), b = rand(2, 8)
  const coefX = a - b, coefC = -(a * b)
  const r1 = -a, r2 = b
  const correct = r1 < r2 ? `x = ${r1} or x = ${r2}` : `x = ${r2} or x = ${r1}`
  const sign = coefX >= 0 ? `+${coefX}` : `${coefX}`
  const cSign = coefC >= 0 ? `+${coefC}` : `${coefC}`
  const { answers, correctIndex } = buildMCQ(correct, [
    `x = ${a} or x = ${-b}`,
    `x = ${-r1} or x = ${-r2}`,
    `x = ${r1} only`,
  ])
  return {
    id: qid(), tier: 'Y10', type: 'quadratics', difficulty: diff,
    questionText: `Solve: x²${sign}x${cSign} = 0`,
    answers, correctIndex,
    explanation: `Factorise: (x + ${a})(x − ${b}) = 0 → x = ${r1} or x = ${r2}`,
    timeLimitSeconds: 50,
  }
}

// ─────────────────────────────────────────────
// TRIGONOMETRY — SOH CAH TOA (Phase 2D)
// ─────────────────────────────────────────────
export function generateTrigonometry(diff: DifficultyLevel): Question {
  const roundTo1 = (n: number) => Math.round(n * 10) / 10

  if (diff === 'bronze') {
    // Find opposite: sin(angle) = opp/hyp → opp = hyp × sin(angle)
    const angles = [30, 45, 60]
    const sinVals: Record<number, string> = { 30: '0.5', 45: '0.707', 60: '0.866' }
    const angle = angles[rand(0, 2)]
    const hyp = rand(4, 12) * 2
    const opp = roundTo1(hyp * parseFloat(sinVals[angle]))
    const correct = String(opp)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(roundTo1(opp + 1.5)), String(roundTo1(opp - 1)), String(roundTo1(hyp / 2)),
    ])
    return {
      id: qid(), tier: 'Y9', type: 'trigonometry', difficulty: diff,
      questionText: `In a right-angled triangle, hypotenuse = ${hyp}cm, angle = ${angle}°. Find the opposite side (1 d.p.). sin${angle}° = ${sinVals[angle]}`,
      answers, correctIndex,
      explanation: `sin(${angle}°) = opp/hyp → opp = ${hyp} × ${sinVals[angle]} = ${correct}cm`,
      timeLimitSeconds: 45,
    }
  }

  if (diff === 'silver') {
    // Find adjacent: cos(angle) = adj/hyp → adj = hyp × cos(angle)
    const angles = [30, 45, 60]
    const cosVals: Record<number, string> = { 30: '0.866', 45: '0.707', 60: '0.5' }
    const angle = angles[rand(0, 2)]
    const hyp = rand(5, 15)
    const adj = roundTo1(hyp * parseFloat(cosVals[angle]))
    const correct = String(adj)
    const { answers, correctIndex } = buildMCQ(correct, [
      String(roundTo1(adj + 2)), String(roundTo1(adj - 1.5)), String(roundTo1(hyp * 0.5)),
    ])
    return {
      id: qid(), tier: 'Y9', type: 'trigonometry', difficulty: diff,
      questionText: `Right-angled triangle: hypotenuse = ${hyp}cm, angle = ${angle}°. Find the adjacent side (1 d.p.). cos${angle}° = ${cosVals[angle]}`,
      answers, correctIndex,
      explanation: `cos(${angle}°) = adj/hyp → adj = ${hyp} × ${cosVals[angle]} = ${correct}cm`,
      timeLimitSeconds: 45,
    }
  }

  // Gold: find the hypotenuse using tan and Pythagoras, or find angle via tan
  const opp = rand(3, 10), adj = rand(3, 10)
  const tanVal = roundTo1(opp / adj)
  const hyp = roundTo1(Math.sqrt(opp * opp + adj * adj))
  const correct = String(hyp)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(roundTo1(hyp + 1.5)), String(roundTo1(opp + adj)), String(roundTo1(hyp - 1)),
  ])
  return {
    id: qid(), tier: 'Y10', type: 'trigonometry', difficulty: diff,
    questionText: `Right-angled triangle: opposite = ${opp}cm, adjacent = ${adj}cm. Find the hypotenuse (1 d.p.).`,
    answers, correctIndex,
    explanation: `tan = ${opp}/${adj} = ${tanVal}. hyp² = ${opp}² + ${adj}² = ${opp*opp + adj*adj}, so hyp = √${opp*opp + adj*adj} ≈ ${correct}cm`,
    timeLimitSeconds: 50,
  }
}

// ─────────────────────────────────────────────
// SIMULTANEOUS EQUATIONS (Phase 2D)
// ─────────────────────────────────────────────
export function generateSimultaneous(diff: DifficultyLevel): Question {
  if (diff === 'bronze') {
    // Simple: same coefficient — e.g. x + y = S, x - y = D
    const x = rand(2, 9), y = rand(2, 9)
    const sum = x + y, diff2 = x - y
    const correct = `x = ${x}, y = ${y}`
    const { answers, correctIndex } = buildMCQ(correct, [
      `x = ${y}, y = ${x}`,
      `x = ${x + 1}, y = ${y - 1}`,
      `x = ${sum}, y = ${diff2}`,
    ])
    return {
      id: qid(), tier: 'Y8', type: 'simultaneous', difficulty: diff,
      questionText: `Solve:
  x + y = ${sum}
  x − y = ${diff2}`,
      answers, correctIndex,
      explanation: `Add the equations: 2x = ${sum + diff2} → x = ${x}. Then y = ${sum} − ${x} = ${y}`,
      timeLimitSeconds: 40,
    }
  }

  if (diff === 'silver') {
    // e.g. 2x + y = A, x + y = B → subtract to get x
    const x = rand(2, 8), y = rand(2, 8)
    const A = 2 * x + y, B = x + y
    const correct = `x = ${x}, y = ${y}`
    const { answers, correctIndex } = buildMCQ(correct, [
      `x = ${y}, y = ${x}`,
      `x = ${x + 1}, y = ${y + 1}`,
      `x = ${A - B}, y = ${B}`,
    ])
    return {
      id: qid(), tier: 'Y9', type: 'simultaneous', difficulty: diff,
      questionText: `Solve:
  2x + y = ${A}
  x + y = ${B}`,
      answers, correctIndex,
      explanation: `Subtract eq2 from eq1: x = ${A} − ${B} = ${x}. Substitute: y = ${B} − ${x} = ${y}`,
      timeLimitSeconds: 45,
    }
  }

  // Gold: 3x + 2y = A, x + y = B — multiply and subtract
  const x = rand(2, 7), y = rand(2, 7)
  const A = 3 * x + 2 * y, B = x + y
  const correct = `x = ${x}, y = ${y}`
  const { answers, correctIndex } = buildMCQ(correct, [
    `x = ${y}, y = ${x}`,
    `x = ${x + 1}, y = ${y - 1}`,
    `x = ${A - 2 * B}, y = ${3 * B - A}`,
  ])
  return {
    id: qid(), tier: 'Y9', type: 'simultaneous', difficulty: diff,
    questionText: `Solve:
  3x + 2y = ${A}
  x + y = ${B}`,
    answers, correctIndex,
    explanation: `Multiply eq2 by 2: 2x + 2y = ${2*B}. Subtract from eq1: x = ${A} − ${2*B} = ${x}. Then y = ${B} − ${x} = ${y}`,
    timeLimitSeconds: 50,
  }
}

const GENERATORS: Record<QuestionType, (d: DifficultyLevel) => Question> = {
  addition:          generateAddition,
  subtraction:       generateSubtraction,
  multiplication:    generateMultiplication,
  division:          generateDivision,
  bodmas:            generateBodmas,
  fractions:         generateFractions,
  decimals:          generateDecimals,
  percentages:       generatePercentages,
  ratio:             generateRatio,
  algebra:           generateAlgebra,
  sequences:         generateSequences,
  geometry_area:     generateGeometryArea,
  geometry_angles:   generateGeometryAngles,
  statistics:        generateStatistics,
  negative_numbers:  generateNegativeNumbers,
  factors_primes:    generateFactorsPrimes,
  worded_1step:      generateWorded1Step,
  worded_2step:      generateWorded2Step,
  // Phase 2B — real implementations
  coordinates:       generateCoordinates,
  probability:       generateProbability,
  worded_3step:      generateWorded3Step,
  // Phase 2D — real implementations
  quadratics:        generateQuadratics,
  trigonometry:      generateTrigonometry,
  simultaneous:      generateSimultaneous,
}


export function generateQuestion(
  type: QuestionType,
  difficulty: DifficultyLevel,
): Question {
  const gen = GENERATORS[type] ?? generateAddition
  return gen(difficulty)
}

// ─────────────────────────────────────────────────────────────
// 2G-2: Enhanced Gold-Tier Generators for Y7-Y11
// ─────────────────────────────────────────────────────────────

export function generateQuadraticsGold(): Question {
  // Completing the square variant
  const b = rand(2, 8) * (Math.random() < 0.5 ? 1 : -1)
  const c = rand(1, 10)
  const p = b / 2
  const q2 = c - p * p  // in form (x+p)² + q
  const bStr = b >= 0 ? `+${b}` : `${b}`
  const correct = String(Math.round(q2 * 100) / 100)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(Math.round((q2 + 2) * 100) / 100),
    String(Math.round((q2 - 2) * 100) / 100),
    String(Math.round((p * p) * 100) / 100),
  ])
  return {
    id: qid(), tier: 'Y10', type: 'quadratics', difficulty: 'gold',
    questionText: `Write x²${bStr}x + ${c} in the form (x + p)² + q. What is q?`,
    answers, correctIndex,
    explanation: `p = ${b}/2 = ${p}. q = ${c} − p² = ${c} − ${Math.round(p*p*100)/100} = ${correct}`,
    timeLimitSeconds: 60,
  }
}

export function generateTrigonometryGold(): Question {
  // Exact values and inverse trig
  const exactValues = [
    { angle: 30, fn: 'sin', val: '0.5',    exact: '1/2',    answerAngle: 30 },
    { angle: 60, fn: 'cos', val: '0.5',    exact: '1/2',    answerAngle: 60 },
    { angle: 45, fn: 'sin', val: '0.707',  exact: '√2/2',   answerAngle: 45 },
    { angle: 45, fn: 'cos', val: '0.707',  exact: '√2/2',   answerAngle: 45 },
    { angle: 45, fn: 'tan', val: '1',      exact: '1',      answerAngle: 45 },
    { angle: 60, fn: 'tan', val: '1.732',  exact: '√3',     answerAngle: 60 },
  ]
  const ev = exactValues[rand(0, exactValues.length - 1)]
  // Inverse trig question: find angle
  const correct = String(ev.answerAngle)
  const { answers, correctIndex } = buildMCQ(correct, [
    String(ev.answerAngle + 15),
    String(ev.answerAngle - 15 > 0 ? ev.answerAngle - 15 : ev.answerAngle + 30),
    String(90 - ev.answerAngle),
  ])
  return {
    id: qid(), tier: 'Y10', type: 'trigonometry', difficulty: 'gold',
    questionText: `Find x° if ${ev.fn}(x°) = ${ev.val}, where 0 ≤ x ≤ 90°`,
    answers, correctIndex,
    explanation: `${ev.fn}⁻¹(${ev.val}) = ${ev.answerAngle}°. Exact value: ${ev.fn}(${ev.answerAngle}°) = ${ev.exact}`,
    timeLimitSeconds: 45,
  }
}

export function generateSimultaneousGold(): Question {
  // Word problem: two numbers summing to A, difference B
  const x = rand(5, 15), y = rand(2, x - 1)
  const sumXY = x + y, diffXY = x - y
  const correct = `${x} and ${y}`
  const { answers, correctIndex } = buildMCQ(correct, [
    `${y} and ${x}`,
    `${x + 1} and ${y - 1}`,
    `${sumXY} and ${diffXY}`,
  ])
  return {
    id: qid(), tier: 'Y9', type: 'simultaneous', difficulty: 'gold',
    questionText: `Two numbers sum to ${sumXY} and their difference is ${diffXY}. Find both numbers.`,
    answers, correctIndex,
    explanation: `x + y = ${sumXY}, x − y = ${diffXY}. Adding: 2x = ${sumXY + diffXY} → x = ${x}. Then y = ${sumXY} − ${x} = ${y}`,
    timeLimitSeconds: 50,
  }
}

// ─────────────────────────────────────────────────────────────
// 2G-1: getGeneratorsForYearGroup helper
// ─────────────────────────────────────────────────────────────

type GenFn = (d: DifficultyLevel) => Question

export function getGeneratorsForYearGroup(yearGroup: string): GenFn[] {
  const base: GenFn[] = [generateAddition, generateSubtraction, generateMultiplication, generateDivision]
  if (yearGroup === 'Y4') return [...base, generateFractions, generateDecimals]
  if (yearGroup === 'Y5') return [...base, generateFractions, generatePercentages, generateWorded1Step]
  if (yearGroup === 'Y6') return [
    ...base, generateFractions, generatePercentages,
    generateRatio, generateAlgebra, generateGeometryArea, generateStatistics,
    generateWorded2Step, generateBodmas,
  ]
  // mixed: all types including Y7-Y11
  return [
    ...base, generateFractions, generatePercentages, generateRatio,
    generateAlgebra, generateSequences, generateGeometryArea, generateGeometryAngles,
    generateStatistics, generateProbability, generateWorded1Step, generateWorded2Step,
    generateWorded3Step, generateNegativeNumbers, generateBodmas, generateFactorsPrimes,
    generateCoordinates, generateDecimals, generateQuadratics, generateTrigonometry,
    generateSimultaneous,
  ]
}
