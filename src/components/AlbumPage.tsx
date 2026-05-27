import { useRef, useState, useCallback } from 'react'
import type { Photo } from '../types'

interface Props {
  photos: Photo[]
  onAdd: (photo: Photo) => void
  onDelete: (id: number) => void
  onToast: (msg: string) => void
}

export function AlbumPage({ photos, onAdd, onDelete, onToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewing, setViewing] = useState<Photo | null>(null)

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const photo: Photo = {
          id: Date.now(),
          data: reader.result as string,
          name: file.name,
          date: new Date().toLocaleDateString('zh-CN'),
        }
        onAdd(photo)
        onToast('照片已添加！')
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [onAdd, onToast]
  )

  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm('确定删除这张照片吗？')) {
        onDelete(id)
        onToast('照片已删除')
        setViewing(null)
      }
    },
    [onDelete, onToast]
  )

  return (
    <div className="album-page">
      {photos.length === 0 ? (
        <div className="album-empty">
          <div className="album-empty-icon">📷</div>
          <p>还没有照片</p>
          <p className="album-empty-sub">点击下方按钮上传你们的甜蜜合照吧</p>
        </div>
      ) : (
        <div className="album-grid">
          {photos.map((p) => (
            <div
              key={p.id}
              className="album-item"
              onClick={() => setViewing(p)}
            >
              <img src={p.data} alt={p.name} />
              <div className="album-item-date">{p.date}</div>
            </div>
          ))}
        </div>
      )}

      <button
        className="album-add-btn"
        onClick={() => inputRef.current?.click()}
      >
        <span>+</span> 上传照片
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {viewing && (
        <div className="album-viewer" onClick={() => setViewing(null)}>
          <div className="album-viewer-bg" />
          <img
            src={viewing.data}
            alt={viewing.name}
            className="album-viewer-img"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="album-viewer-actions">
            <span className="album-viewer-name">{viewing.name}</span>
            <button
              className="album-delete-btn"
              onClick={() => handleDelete(viewing.id)}
            >
              删除
            </button>
          </div>
          <button
            className="album-viewer-close"
            onClick={() => setViewing(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
