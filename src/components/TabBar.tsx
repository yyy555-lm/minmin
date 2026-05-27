type Page = 'anniv' | 'album' | 'diary' | 'private' | 'period' | 'game'

interface Tab {
  key: Page
  icon: string
  label: string
}

const tabs: Tab[] = [
  { key: 'anniv', icon: '💝', label: '纪念日' },
  { key: 'period', icon: '📅', label: '生理期' },
  { key: 'album', icon: '📷', label: '相册' },
  { key: 'diary', icon: '📖', label: '日记' },
  { key: 'game', icon: '🏠', label: '爱巢' },
  { key: 'private', icon: '🔒', label: '秘密' },
]

export const PAGE_TITLES: Record<Page, string> = {
  anniv: '敏敏 · 纪念日',
  period: '敏敏 · 生理期',
  album: '敏敏 · 情侣相册',
  diary: '敏敏 · 恋爱日记',
  game: '敏敏 · 爱巢',
  private: '敏敏 · 秘密空间',
}

interface Props {
  current: Page
  onChange: (page: Page) => void
}

export function TabBar({ current, onChange }: Props) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`tab-item ${current === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </div>
      ))}
    </div>
  )
}

export type { Page }
