import { useState, useEffect, useRef } from 'react'

interface Props {
  anniversary: string
  onSave: (date: string) => void
}

function daysBetween(d1: Date, d2: Date): number {
  const diff = d2.getTime() - d1.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function randomHeart(): string {
  const hearts = ['💕', '💖', '💗', '💝', '❤️', '💓', '🩷']
  return hearts[Math.floor(Math.random() * hearts.length)]
}

export function AnnivPage({ anniversary, onSave }: Props) {
  const [dateVal, setDateVal] = useState(anniversary)
  const days = anniversary ? daysBetween(new Date(anniversary), new Date()) : null
  const [hearts, setHearts] = useState<{ id: number; x: number; emoji: string; delay: number; dur: number; size: number }[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const id = nextId.current++
      setHearts((prev) => [
        ...prev.slice(-30),
        {
          id,
          x: Math.random() * 100,
          emoji: randomHeart(),
          delay: 0,
          dur: 5 + Math.random() * 6,
          size: 14 + Math.random() * 18,
        },
      ])
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  function handleSave() {
    if (dateVal) onSave(dateVal)
  }

  return (
    <div className="anniv-page">
      {/* Header */}
      <div className="anniv-header">
        <div className="anniv-days">{days !== null ? days : '?'}</div>
        <div className="anniv-days-label">天</div>
        <div className="anniv-date-text">
          {days !== null
            ? '我们已经在一起这么久啦'
            : '设置纪念日开始记录吧'}
        </div>
        {anniversary && (
          <div className="anniv-since">从 {anniversary} 起</div>
        )}
      </div>

      {/* 设置卡片 */}
      <div className="anniv-card">
        <div className="anniv-card-icon">💌</div>
        <h3>
          {anniversary ? '修改纪念日' : '设置纪念日'}
        </h3>
        <p className="anniv-card-desc">
          {anniversary
            ? '如果日期需要调整，可以在这里修改'
            : '选择你们在一起的第一天'}
        </p>
        <input
          type="date"
          className="anniv-date-input"
          value={dateVal}
          onChange={(e) => setDateVal(e.target.value)}
        />
        <br />
        <button className="anniv-save-btn" onClick={handleSave}>
          {anniversary ? '更新纪念日' : '保存纪念日'}
        </button>
      </div>

      {/* 爱心飘落 */}
      <div className="hearts-layer">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="falling-heart"
            style={{
              left: `${h.x}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.dur}s`,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
