import { useState, useRef, useCallback } from 'react'
import type { Note, Photo } from '../types'

interface Props {
  privatePassword: string
  appPassword: string
  notes: Note[]
  photos: Photo[]
  onAddNote: (note: Note) => void
  onDeleteNote: (id: number) => void
  onAddPhoto: (photo: Photo) => void
  onDeletePhoto: (id: number) => void
  onToast: (msg: string) => void
}

type SubTab = 'notes' | 'photos'

export function PrivatePage({
  privatePassword,
  appPassword,
  notes,
  photos,
  onAddNote,
  onDeleteNote,
  onAddPhoto,
  onDeletePhoto,
  onToast,
}: Props) {
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [subTab, setSubTab] = useState<SubTab>('notes')
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const targetPw = privatePassword || appPassword

  const handleNum = useCallback(
    (n: number) => {
      if (pwInput.length >= 6) return
      const next = pwInput + n
      setPwInput(next)
      setPwError(false)
      if (next.length === 6) {
        if (next === targetPw) {
          setUnlocked(true)
          setPwInput('')
          setPwError(false)
        } else {
          setPwError(true)
          setTimeout(() => {
            setPwInput('')
            setPwError(false)
          }, 600)
        }
      }
    },
    [pwInput, targetPw]
  )

  const handleDelete = useCallback(() => {
    setPwInput((prev) => prev.slice(0, -1))
    setPwError(false)
  }, [])

  const handleSaveNote = useCallback(() => {
    if (!noteText.trim()) {
      onToast('请输入内容')
      return
    }
    onAddNote({
      id: Date.now(),
      text: noteText.trim(),
      date: new Date().toLocaleDateString('zh-CN'),
    })
    onToast('笔记已保存！')
    setNoteText('')
    setShowNoteInput(false)
  }, [noteText, onAddNote, onToast])

  const handleDeleteNote = useCallback(
    (id: number) => {
      if (window.confirm('确定删除这条笔记吗？')) {
        onDeleteNote(id)
        onToast('笔记已删除')
      }
    },
    [onDeleteNote, onToast]
  )

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        onAddPhoto({
          id: Date.now(),
          data: reader.result as string,
          name: file.name,
          date: new Date().toLocaleDateString('zh-CN'),
        })
        onToast('照片已添加！')
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [onAddPhoto, onToast]
  )

  const handleDeletePhoto = useCallback(
    (id: number) => {
      if (window.confirm('确定删除这张照片吗？')) {
        onDeletePhoto(id)
        onToast('照片已删除')
        setViewingPhoto(null)
      }
    },
    [onDeletePhoto, onToast]
  )

  if (!unlocked) {
    return (
      <div className="private-page">
        <div className="private-lock">
          <div className="private-lock-icon">🔒</div>
          <p className="private-lock-title">私密空间</p>
          <p className="private-lock-hint">
            请输入{privatePassword ? '私密' : '登录'}密码
          </p>
          <div className="pw-dots-row">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`pw-dot${i < pwInput.length ? ' filled' : ''}${pwError ? ' error' : ''}`}
              />
            ))}
          </div>
          {pwError && (
            <p className="private-lock-error">密码错误，请重试</p>
          )}
          <div className="num-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                className="num-btn"
                onClick={() => handleNum(n)}
              >
                {n}
              </button>
            ))}
            <button className="num-btn empty" />
            <button className="num-btn" onClick={() => handleNum(0)}>
              0
            </button>
            <button className="num-btn del-btn" onClick={handleDelete}>
              删除
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="private-page">
      <div className="private-subtabs">
        <button
          className={`private-subtab${subTab === 'notes' ? ' active' : ''}`}
          onClick={() => setSubTab('notes')}
        >
          📝 私密笔记
        </button>
        <button
          className={`private-subtab${subTab === 'photos' ? ' active' : ''}`}
          onClick={() => setSubTab('photos')}
        >
          📷 私密相册
        </button>
      </div>

      {subTab === 'notes' && (
        <div className="private-notes">
          {!showNoteInput && (
            <button
              className="private-note-add-btn"
              onClick={() => setShowNoteInput(true)}
            >
              + 新建笔记
            </button>
          )}

          {showNoteInput && (
            <div className="private-note-editor">
              <textarea
                className="private-note-input"
                placeholder="写下只有我们知道的秘密..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
              <div className="private-note-actions">
                <button
                  className="private-note-cancel"
                  onClick={() => {
                    setShowNoteInput(false)
                    setNoteText('')
                  }}
                >
                  取消
                </button>
                <button className="private-note-save" onClick={handleSaveNote}>
                  保存
                </button>
              </div>
            </div>
          )}

          {notes.length === 0 && !showNoteInput ? (
            <div className="private-empty">
              <p>还没有私密笔记</p>
            </div>
          ) : (
            <div className="private-note-list">
              {notes.map((n) => (
                <div key={n.id} className="private-note-card">
                  <div className="private-note-text">{n.text}</div>
                  <div className="private-note-footer">
                    <span className="private-note-date">{n.date}</span>
                    <button
                      className="private-note-del"
                      onClick={() => handleDeleteNote(n.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'photos' && (
        <div className="private-photos">
          {photos.length === 0 ? (
            <div className="private-empty">
              <p>还没有私密照片</p>
            </div>
          ) : (
            <div className="album-grid">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="album-item"
                  onClick={() => setViewingPhoto(p)}
                >
                  <img src={p.data} alt={p.name} />
                  <div className="album-item-date">{p.date}</div>
                </div>
              ))}
            </div>
          )}

          <button
            className="album-add-btn"
            style={{ position: 'relative', bottom: 'auto', marginTop: '16px' }}
            onClick={() => photoInputRef.current?.click()}
          >
            <span>+</span> 上传照片
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />

          {viewingPhoto && (
            <div className="album-viewer" onClick={() => setViewingPhoto(null)}>
              <div className="album-viewer-bg" />
              <img
                src={viewingPhoto.data}
                alt={viewingPhoto.name}
                className="album-viewer-img"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="album-viewer-actions">
                <span className="album-viewer-name">
                  {viewingPhoto.name}
                </span>
                <button
                  className="album-delete-btn"
                  onClick={() => handleDeletePhoto(viewingPhoto.id)}
                >
                  删除
                </button>
              </div>
              <button
                className="album-viewer-close"
                onClick={() => setViewingPhoto(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
