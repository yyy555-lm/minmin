import { useState, useCallback } from 'react'
import type { Diary, Mood } from '../types'

const MOOD_MAP: Record<Mood, { emoji: string; label: string }> = {
  happy: { emoji: '😊', label: '开心' },
  love: { emoji: '🥰', label: '甜蜜' },
  touched: { emoji: '🥹', label: '感动' },
  miss: { emoji: '🥺', label: '想念' },
  normal: { emoji: '😌', label: '日常' },
}

const MOODS: Mood[] = ['happy', 'love', 'touched', 'miss', 'normal']

interface Props {
  diaries: Diary[]
  onAdd: (diary: Diary) => void
  onDelete: (id: number) => void
  onToast: (msg: string) => void
}

type Mode = 'list' | 'write' | 'view'

export function DiaryPage({ diaries, onAdd, onDelete, onToast }: Props) {
  const [mode, setMode] = useState<Mode>('list')
  const [viewing, setViewing] = useState<Diary | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood>('love')

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setMood('love')
  }, [])

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      onToast('请输入日记标题')
      return
    }
    if (!content.trim()) {
      onToast('请输入日记内容')
      return
    }
    const diary: Diary = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      mood,
      date: new Date().toLocaleDateString('zh-CN'),
    }
    onAdd(diary)
    onToast('日记已保存！')
    resetForm()
    setMode('list')
  }, [title, content, mood, onAdd, onToast, resetForm])

  const handleView = useCallback((diary: Diary) => {
    setViewing(diary)
    setMode('view')
  }, [])

  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm('确定删除这篇日记吗？')) {
        onDelete(id)
        onToast('日记已删除')
        setMode('list')
        setViewing(null)
      }
    },
    [onDelete, onToast]
  )

  const handleBack = useCallback(() => {
    setMode('list')
    setViewing(null)
    resetForm()
  }, [resetForm])

  if (mode === 'write') {
    return (
      <div className="diary-page">
        <div className="diary-editor">
          <div className="diary-editor-header">
            <button className="diary-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <span className="diary-editor-title">写日记</span>
            <button className="diary-save-btn" onClick={handleSave}>
              保存
            </button>
          </div>

          <input
            className="diary-title-input"
            placeholder="日记标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
          />

          <div className="diary-mood-selector">
            {MOODS.map((m) => (
              <button
                key={m}
                className={`diary-mood-btn${mood === m ? ' selected' : ''}`}
                onClick={() => setMood(m)}
              >
                <span className="diary-mood-emoji">{MOOD_MAP[m].emoji}</span>
                <span className="diary-mood-label">{MOOD_MAP[m].label}</span>
              </button>
            ))}
          </div>

          <textarea
            className="diary-content-input"
            placeholder="记录今天的甜蜜时刻..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (mode === 'view' && viewing) {
    return (
      <div className="diary-page">
        <div className="diary-view">
          <div className="diary-view-header">
            <button className="diary-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <button
              className="diary-view-delete"
              onClick={() => handleDelete(viewing.id)}
            >
              删除
            </button>
          </div>
          <div className="diary-view-mood">
            {MOOD_MAP[viewing.mood].emoji} {MOOD_MAP[viewing.mood].label}
          </div>
          <h2 className="diary-view-title">{viewing.title}</h2>
          <div className="diary-view-date">{viewing.date}</div>
          <div className="diary-view-content">{viewing.content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="diary-page">
      {diaries.length === 0 ? (
        <div className="diary-empty">
          <div className="diary-empty-icon">📖</div>
          <p>还没有日记</p>
          <p className="diary-empty-sub">记录你们在一起的点点滴滴</p>
        </div>
      ) : (
        <div className="diary-list">
          {diaries.map((d) => (
            <div
              key={d.id}
              className="diary-card"
              onClick={() => handleView(d)}
            >
              <div className="diary-card-left">
                <div className="diary-card-mood">{MOOD_MAP[d.mood].emoji}</div>
              </div>
              <div className="diary-card-body">
                <div className="diary-card-title">{d.title}</div>
                <div className="diary-card-preview">
                  {d.content.slice(0, 40)}
                  {d.content.length > 40 ? '...' : ''}
                </div>
                <div className="diary-card-date">{d.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="diary-write-btn"
        onClick={() => {
          resetForm()
          setMode('write')
        }}
      >
        ✏️ 写日记
      </button>
    </div>
  )
}
