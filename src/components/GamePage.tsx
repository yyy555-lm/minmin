import { useState, useMemo, useCallback } from 'react'
import type { GameRoom, RoomItem, RoomType } from '../types'

interface Props {
  rooms: GameRoom[]
  tasks: { id: number; text: string; done: boolean; date: string }[]
  points: number
  onInitRooms: (rooms: GameRoom[]) => void
  onAddItem: (roomType: string, item: RoomItem) => void
  onCompleteTask: (taskId: number) => void
  onAddTasks: (tasks: { id: number; text: string; done: boolean; date: string }[]) => void
  onToast: (msg: string) => void
}

const ROOM_CONFIG: { type: RoomType; name: string; emoji: string }[] = [
  { type: 'garden', name: '花园', emoji: '🌷' },
  { type: 'master', name: '主卧', emoji: '👑' },
  { type: 'living', name: '客厅', emoji: '🛋️' },
  { type: 'bedroom', name: '次卧一', emoji: '🛏️' },
  { type: 'bedroom', name: '次卧二', emoji: '🌟' },
  { type: 'bathroom', name: '主卫', emoji: '🛁' },
  { type: 'bedroom', name: '次卧三', emoji: '🎀' },
  { type: 'bathroom', name: '次卫', emoji: '🚿' },
]

const SHOP_ITEMS: RoomItem[] = [
  { id: 0, emoji: '🪴', name: '绿植' },
  { id: 0, emoji: '💡', name: '吊灯' },
  { id: 0, emoji: '🖼️', name: '挂画' },
  { id: 0, emoji: '🕯️', name: '蜡烛' },
  { id: 0, emoji: '🧸', name: '毛绒熊' },
  { id: 0, emoji: '💐', name: '鲜花' },
  { id: 0, emoji: '🪞', name: '镜子' },
  { id: 0, emoji: '🎹', name: '钢琴' },
  { id: 0, emoji: '📚', name: '书架' },
  { id: 0, emoji: '🛁', name: '浴缸' },
  { id: 0, emoji: '🪟', name: '落地窗' },
  { id: 0, emoji: '🫧', name: '水晶灯' },
  { id: 0, emoji: '🛌', name: '大床' },
  { id: 0, emoji: '📺', name: '电视' },
  { id: 0, emoji: '🍽️', name: '餐桌' },
  { id: 0, emoji: '🎀', name: '蝴蝶结' },
  { id: 0, emoji: '☁️', name: '云朵灯' },
  { id: 0, emoji: '🧴', name: '香薰瓶' },
  { id: 0, emoji: '🪻', name: '风信子' },
  { id: 0, emoji: '🎪', name: '帐篷' },
]

const TASK_POOL = [
  '一起看一部电影 🎬',
  '为对方做一顿饭 🍳',
  '一起散步30分钟 🚶',
  '说三句情话 💕',
  '给对方一个拥抱 🤗',
  '一起听一首歌 🎵',
  '为对方倒一杯水 🥛',
  '一起刷牙2分钟 🪥',
  '给对方按摩5分钟 💆',
  '一起拍照一张 📸',
  '说早安和晚安 🌅',
  '一起整理床铺 🛏️',
  '为对方削一个苹果 🍎',
  '牵手逛一圈 👫',
  '一起深呼吸10次 🌬️',
  '给对方写一句小纸条 📝',
  '一起做5分钟拉伸 🧘',
  '赞美对方三个优点 🌟',
]

function shuffle<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

export function GamePage({
  rooms,
  tasks,
  points,
  onInitRooms,
  onAddItem,
  onCompleteTask,
  onAddTasks,
  onToast,
}: Props) {
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null)
  const [shopOpen, setShopOpen] = useState(false)

  const today = new Date().toLocaleDateString('zh-CN')
  const initialized = rooms.length > 0

  const handleInit = useCallback(() => {
    const initRooms: GameRoom[] = ROOM_CONFIG.map((c) => ({
      type: c.type,
      name: c.name,
      items: [],
    }))
    onInitRooms(initRooms)
    const dailyTasks = shuffle(TASK_POOL, 5).map((text, i) => ({
      id: Date.now() + i,
      text,
      done: false,
      date: today,
    }))
    onAddTasks(dailyTasks)
    onToast('欢迎入住你们的爱巢！🏠')
  }, [onInitRooms, onAddTasks, onToast, today])

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.date === today),
    [tasks, today]
  )

  const needsNewTasks = initialized && todayTasks.length === 0

  const handleGenerateTasks = useCallback(() => {
    const dailyTasks = shuffle(TASK_POOL, 5).map((text, i) => ({
      id: Date.now() + i,
      text,
      done: false,
      date: today,
    }))
    onAddTasks(dailyTasks)
    onToast('今日任务已更新！')
  }, [onAddTasks, onToast, today])

  const handleComplete = useCallback(
    (taskId: number) => {
      onCompleteTask(taskId)
      onToast('任务完成！获得 1 个装饰币 ✨')
    },
    [onCompleteTask, onToast]
  )

  const handleBuy = useCallback(
    (item: RoomItem) => {
      if (!selectedRoom || points < 1) return
      const newItem: RoomItem = { ...item, id: Date.now() }
      onAddItem(selectedRoom.type, newItem)
      setSelectedRoom((prev) =>
        prev ? { ...prev, items: [...prev.items, newItem] } : null
      )
      onToast(`已添加${item.name}到${selectedRoom.name}！`)
    },
    [selectedRoom, points, onAddItem, onToast]
  )

  const handleSelectRoom = useCallback(
    (room: GameRoom) => {
      setSelectedRoom(room)
      setShopOpen(false)
    },
    []
  )

  const doneCount = todayTasks.filter((t) => t.done).length
  const totalCount = todayTasks.length

  if (!initialized) {
    return (
      <div className="game-page">
        <div className="game-welcome">
          <div className="game-welcome-icon">🏠</div>
          <h2>欢迎来到你们的爱巢</h2>
          <p>四室一厅两卫 + 花园豪宅</p>
          <p className="game-welcome-detail">
            每天完成情侣任务赚取装饰币<br />
            一起把家装饰得温馨浪漫
          </p>
          <button className="game-start-btn" onClick={handleInit}>
            开始打造爱巢 💕
          </button>
        </div>
      </div>
    )
  }

  const roomMap = new Map(rooms.map((r) => [r.name, r]))
  const roomEmoji = (name: string) => ROOM_CONFIG.find((c) => c.name === name)?.emoji || '🏠'

  return (
    <div className="game-page">
      <div className="game-layout">
        {/* 左侧面板 */}
        <div className="game-left">
          <div className="game-points">
            <span className="game-points-icon">🪙</span>
            <span className="game-points-value">{points}</span>
            <span className="game-points-label">装饰币</span>
          </div>

          {selectedRoom ? (
            <div className="game-room-editor">
              <div className="game-editor-header">
                <h3>
                  {roomEmoji(selectedRoom.name)} {selectedRoom.name}
                </h3>
                <button onClick={() => { setSelectedRoom(null); setShopOpen(false) }}>
                  ✕
                </button>
              </div>

              <div className="game-room-items-display">
                {selectedRoom.items.length === 0 ? (
                  <div className="game-room-empty">还空着呢，快去装饰吧~</div>
                ) : (
                  selectedRoom.items.map((item) => (
                    <span key={item.id} className="game-room-item-emoji">
                      {item.emoji}
                    </span>
                  ))
                )}
              </div>

              {!shopOpen && (
                <button
                  className="game-decorate-btn"
                  onClick={() => setShopOpen(true)}
                  disabled={points < 1}
                >
                  🛒 装饰房间（消耗1币）
                </button>
              )}
              {points < 1 && (
                <p className="game-no-coins">完成右侧任务赚取装饰币</p>
              )}

              {shopOpen && (
                <div className="game-shop">
                  <div className="game-shop-title">选择装饰品</div>
                  <div className="game-shop-grid">
                    {SHOP_ITEMS.map((item, i) => (
                      <button
                        key={i}
                        className="game-shop-item"
                        disabled={points < 1}
                        onClick={() => handleBuy(item)}
                      >
                        <span className="game-shop-emoji">{item.emoji}</span>
                        <span className="game-shop-name">{item.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="game-shop-close"
                    onClick={() => setShopOpen(false)}
                  >
                    收起
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="game-tasks-panel">
              <div className="game-tasks-header">
                <span>📋 今日任务</span>
                <span className="game-tasks-progress">
                  {doneCount}/{totalCount}
                </span>
                {needsNewTasks && (
                  <button className="game-refresh-btn" onClick={handleGenerateTasks}>
                    生成
                  </button>
                )}
              </div>
              {todayTasks.length > 0 ? (
                <div className="game-tasks-list">
                  {todayTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`game-task-item${t.done ? ' done' : ''}`}
                    >
                      <span className="game-task-text">{t.text}</span>
                      {!t.done ? (
                        <button
                          className="game-task-done-btn"
                          onClick={() => handleComplete(t.id)}
                        >
                          完成
                        </button>
                      ) : (
                        <span className="game-task-check">✅</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !needsNewTasks && (
                  <div className="game-tasks-empty">今日暂无任务</div>
                )
              )}
            </div>
          )}
        </div>

        {/* 右侧房子模型 */}
        <div className="game-right">
          <div className="game-model-title">🏠</div>
          <div className="game-house-model">
            {ROOM_CONFIG.map((cfg) => {
              const room = roomMap.get(cfg.name)
              const itemCount = room?.items.length || 0
              const isSelected = selectedRoom?.name === cfg.name
              return (
                <div
                  key={cfg.name}
                  className={`game-house-room room-${cfg.type}${isSelected ? ' selected' : ''}`}
                  onClick={() => handleSelectRoom(room!)}
                >
                  <div className="game-house-room-emoji">{cfg.emoji}</div>
                  <div className="game-house-room-name">{cfg.name}</div>
                  <div className="game-house-room-items">
                    {room?.items.slice(-3).map((item) => (
                      <span key={item.id} className="game-house-item-dot">
                        {item.emoji}
                      </span>
                    ))}
                    {itemCount > 3 && (
                      <span className="game-house-more">+{itemCount - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="game-model-hint">👆 点击房间开始装饰</p>
        </div>
      </div>
    </div>
  )
}
