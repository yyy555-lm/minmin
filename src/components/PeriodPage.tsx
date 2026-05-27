import { useState, useMemo, useCallback } from 'react'
import type { PeriodRecord, FlowType } from '../types'

interface Props {
  periods: PeriodRecord[]
  onAdd: (record: PeriodRecord) => void
  onDelete: (id: number) => void
  onToast: (msg: string) => void
}

const FLOW_MAP: Record<FlowType, { label: string; color: string; dot: string }> = {
  light: { label: '少量', color: '#FFB3C6', dot: '🩷' },
  medium: { label: '中量', color: '#FF6B8A', dot: '❤️' },
  heavy: { label: '大量', color: '#D4456A', dot: '🩸' },
}

const FLOWS: FlowType[] = ['light', 'medium', 'heavy']

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function predictNext(periods: PeriodRecord[]): {
  date: string
  iso: string
  daysLeft: number
  avgCycle: number
} | null {
  const sorted = [...periods].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  if (sorted.length === 0) return null

  const cycles: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff > 0 && diff < 60) cycles.push(diff)
  }

  const avgCycle =
    cycles.length > 0
      ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length)
      : 28
  const lastDate = new Date(sorted[sorted.length - 1].date)
  const nextDate = new Date(lastDate)
  nextDate.setDate(nextDate.getDate() + avgCycle)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysLeft = Math.round(
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  const y = nextDate.getFullYear()
  const m = String(nextDate.getMonth() + 1).padStart(2, '0')
  const d = String(nextDate.getDate()).padStart(2, '0')

  return {
    date: nextDate.toLocaleDateString('zh-CN'),
    iso: `${y}-${m}-${d}`,
    daysLeft,
    avgCycle,
  }
}

export function PeriodPage({ periods, onAdd, onDelete, onToast }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [dateInput, setDateInput] = useState(
    today.toISOString().slice(0, 10)
  )
  const [flowInput, setFlowInput] = useState<FlowType>('medium')
  const [showForm, setShowForm] = useState(false)

  const prediction = useMemo(() => predictNext(periods), [periods])

  const periodDates = useMemo(() => {
    const map = new Map<string, FlowType>()
    periods.forEach((p) => map.set(p.date, p.flow))
    return map
  }, [periods])

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }, [viewMonth])

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }, [viewMonth])

  const handleSave = useCallback(() => {
    if (!dateInput) return
    onAdd({
      id: Date.now(),
      date: dateInput,
      flow: flowInput,
    })
    onToast('已记录！')
    setShowForm(false)
    setDateInput(today.toISOString().slice(0, 10))
    setFlowInput('medium')
  }, [dateInput, flowInput, onAdd, onToast, today])

  const totalDays = daysInMonth(viewYear, viewMonth)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) calendarCells.push(null)
  for (let d = 1; d <= totalDays; d++) calendarCells.push(d)

  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="period-page">
      <div className="period-calendar">
        <div className="period-calendar-header">
          <button className="period-nav" onClick={handlePrevMonth}>
            ‹
          </button>
          <span className="period-month-label">
            {viewYear}年{viewMonth + 1}月
          </span>
          <button className="period-nav" onClick={handleNextMonth}>
            ›
          </button>
        </div>

        <div className="period-weekdays">
          {weekHeaders.map((w) => (
            <div key={w} className="period-weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="period-grid">
          {calendarCells.map((day, i) => {
            if (day === null) {
              return <div key={`e${i}`} className="period-cell empty" />
            }
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const record = periodDates.get(dateStr)
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear()
            const isPredicted = prediction?.iso === dateStr

            return (
              <div
                key={dateStr}
                className={`period-cell${record ? ' has-record' : ''}${isToday ? ' today' : ''}${isPredicted ? ' predicted' : ''}`}
              >
                <span className="period-day-num">{day}</span>
                {record && (
                  <span
                    className="period-dot"
                    style={{ background: FLOW_MAP[record].color }}
                  />
                )}
                {isPredicted && !record && (
                  <span className="period-predicted-ring" />
                )}
              </div>
            )
          })}
        </div>

        <div className="period-legend">
          {FLOWS.map((f) => (
            <span key={f} className="period-legend-item">
              <span
                className="period-legend-dot"
                style={{ background: FLOW_MAP[f].color }}
              />
              {FLOW_MAP[f].label}
            </span>
          ))}
          <span className="period-legend-item">
            <span className="period-legend-ring" />
            预测
          </span>
        </div>
      </div>

      {prediction && (
        <div className="period-predict-card">
          <div className="period-predict-icon">📅</div>
          <div className="period-predict-info">
            <div className="period-predict-label">下次预测</div>
            <div className="period-predict-date">{prediction.date}</div>
            <div className="period-predict-detail">
              平均周期 {prediction.avgCycle} 天
              {prediction.daysLeft > 0
                ? ` · 还有 ${prediction.daysLeft} 天`
                : prediction.daysLeft === 0
                  ? ' · 就是今天'
                  : ` · 已过 ${Math.abs(prediction.daysLeft)} 天`}
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          className="period-record-btn"
          onClick={() => setShowForm(true)}
        >
          + 记录生理期
        </button>
      )}

      {showForm && (
        <div className="period-form">
          <input
            type="date"
            className="period-date-input"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <div className="period-flow-selector">
            {FLOWS.map((f) => (
              <button
                key={f}
                className={`period-flow-btn${flowInput === f ? ' selected' : ''}`}
                style={
                  flowInput === f
                    ? { borderColor: FLOW_MAP[f].color, background: FLOW_MAP[f].color + '18' }
                    : {}
                }
                onClick={() => setFlowInput(f)}
              >
                {FLOW_MAP[f].dot} {FLOW_MAP[f].label}
              </button>
            ))}
          </div>
          <div className="period-form-actions">
            <button
              className="period-form-cancel"
              onClick={() => setShowForm(false)}
            >
              取消
            </button>
            <button className="period-form-save" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      )}

      {periods.length > 0 && (
        <div className="period-history">
          <h3 className="period-history-title">历史记录</h3>
          {[...periods]
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((p) => (
              <div key={p.id} className="period-history-item">
                <span className="period-history-dot">
                  {FLOW_MAP[p.flow].dot}
                </span>
                <span className="period-history-date">{p.date}</span>
                <span className="period-history-flow">
                  {FLOW_MAP[p.flow].label}
                </span>
                <button
                  className="period-history-del"
                  onClick={() => {
                    if (window.confirm('确定删除这条记录吗？')) {
                      onDelete(p.id)
                      onToast('已删除')
                    }
                  }}
                >
                  删除
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
