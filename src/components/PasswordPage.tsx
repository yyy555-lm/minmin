import { useState } from 'react'

interface Props {
  isSetting: boolean
  onPassword: (password: string) => boolean
  onSet: (password: string) => void
  onReset: () => void
}

export function PasswordPage({ isSetting, onPassword, onSet, onReset }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const hint = isSetting ? '请设置6位情侣密码' : '请输入情侣密码'
  const displayHint = error || hint

  function handleInput(n: string) {
    if (input.length >= 6) return
    setError('')
    const next = input + n
    setInput(next)
    if (next.length === 6) {
      setTimeout(() => {
        if (isSetting) {
          onSet(next)
          setInput('')
        } else {
          const ok = onPassword(next)
          if (!ok) {
            setError('密码错误，请重试')
            setInput('')
          }
        }
      }, 250)
    }
  }

  function handleDelete() {
    setError('')
    setInput((prev) => prev.slice(0, -1))
  }

  const dots = Array.from({ length: 6 }, (_, i) => (
    <div key={i} className={`pw-dot ${i < input.length ? 'filled' : ''}`}>
      {i < input.length ? '●' : ''}
    </div>
  ))

  return (
    <div className="password-page">
      <div className="pw-logo">💕</div>
      <div className="pw-title">敏 敏</div>
      <div className="pw-subtitle">我们的情侣空间</div>

      <div className={`pw-hint ${error ? 'error' : ''}`}>{displayHint}</div>

      <div className="pw-dots-row">{dots}</div>

      <div className="num-pad">
        {['1','2','3','4','5','6','7','8','9','','0','del'].map((n) => {
          if (n === '') {
            return <div key="empty" className="num-btn empty" />
          }
          if (n === 'del') {
            return (
              <button key="del" className="num-btn del-btn" onClick={handleDelete}>
                删除
              </button>
            )
          }
          return (
            <button key={n} className="num-btn" onClick={() => handleInput(n)}>
              {n}
            </button>
          )
        })}
      </div>

      {!isSetting && (
        <span className="pw-reset" onClick={onReset}>
          忘记密码？（重置所有数据）
        </span>
      )}
    </div>
  )
}
