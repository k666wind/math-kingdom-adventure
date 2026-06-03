import React from 'react'

// ── Button ────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', className = '', children, ...props
}) => {
  const base = 'font-fredoka rounded-xl active:scale-95 transition-transform duration-75 select-none disabled:opacity-50'
  const variants = {
    primary:   'bg-kingdom-orange text-white shadow-md',
    secondary: 'bg-white/15 text-white border border-white/25',
    danger:    'bg-kingdom-red text-white shadow-md',
    ghost:     'bg-transparent text-white/70 border border-white/20',
  }
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-3 text-base', lg: 'px-5 py-4 text-lg w-full' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── HPBar ─────────────────────────────────────────────────────
interface HPBarProps { current: number; max: number; color?: string; height?: string }
export const HPBar: React.FC<HPBarProps> = ({ current, max, color = '#6BCB77', height = 'h-3' }) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const barColor = pct > 50 ? color : pct > 25 ? '#FFE66D' : '#FF4D6D'
  return (
    <div className={`w-full ${height} bg-white/20 rounded-full overflow-hidden`}>
      <div
        className="h-full rounded-full hp-bar-fill"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
interface ModalProps { children: React.ReactNode; onClose?: () => void }
export const Modal: React.FC<ModalProps> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-slide-up">
    <div className="w-full max-w-[480px] bg-kingdom-cream rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400">✕</button>
      )}
      {children}
    </div>
  </div>
)

// ── Badge ─────────────────────────────────────────────────────
export const RarityBadge: React.FC<{ rarity: string }> = ({ rarity }) => {
  const colors: Record<string, string> = {
    common: 'bg-gray-200 text-gray-600',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    legendary: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-nunito font-bold capitalize ${colors[rarity] ?? colors.common}`}>
      {rarity}
    </span>
  )
}

// ── Stars ─────────────────────────────────────────────────────
export const StarRating: React.FC<{ stars: 0|1|2|3 }> = ({ stars }) => (
  <div className="flex gap-0.5">
    {[1,2,3].map(i => (
      <span key={i} className={`text-sm ${i <= stars ? 'text-kingdom-gold' : 'text-white/20'}`}>★</span>
    ))}
  </div>
)

// ── FloatingText ──────────────────────────────────────────────
export const FloatingText: React.FC<{ text: string; color?: string }> = ({ text, color = '#FF6B35' }) => (
  <div className="pointer-events-none absolute top-0 right-4 font-fredoka text-xl animate-float-up z-10" style={{ color }}>
    {text}
  </div>
)
