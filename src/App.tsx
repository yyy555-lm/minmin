import { useState, useCallback, useEffect } from 'react'
import { useAppData } from './hooks/useAppData'
import { PasswordPage } from './components/PasswordPage'
import { TabBar, PAGE_TITLES } from './components/TabBar'
import { AnnivPage } from './components/AnnivPage'
import { AlbumPage } from './components/AlbumPage'
import { DiaryPage } from './components/DiaryPage'
import { PrivatePage } from './components/PrivatePage'
import { PeriodPage } from './components/PeriodPage'
import { GamePage } from './components/GamePage'
import type { Page } from './components/TabBar'

function App() {
  const {
    data,
    hasPassword,
    setPassword,
    checkPassword,
    resetAll,
    setAnniversary,
    addPhoto,
    deletePhoto,
    addDiary,
    deleteDiary,
    addNote,
    deleteNote,
    addPrivatePhoto,
    deletePrivatePhoto,
    addPeriod,
    deletePeriod,
    initGameRooms,
    addRoomItem,
    completeTask,
    addGameTasks,
    exportData,
    importData,
  } = useAppData()

  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState<Page>('anniv')
  const [toast, setToast] = useState('')
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if ((window as any).__updateReady) setUpdateReady(true)
    const handler = () => setUpdateReady(true)
    window.addEventListener('app-update-ready', handler)
    return () => window.removeEventListener('app-update-ready', handler)
  }, [])

  const isSetting = !hasPassword

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }, [])

  const handlePassword = useCallback(
    (pw: string): boolean => {
      if (checkPassword(pw)) {
        setLoggedIn(true)
        return true
      }
      return false
    },
    [checkPassword]
  )

  const handleSet = useCallback(
    (pw: string) => {
      setPassword(pw)
      showToast('密码设置成功！')
      setTimeout(() => setLoggedIn(true), 500)
    },
    [setPassword, showToast]
  )

  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置吗？这将清除所有数据！')) {
      resetAll()
      showToast('已重置，请设置新密码')
    }
  }, [resetAll, showToast])

  const handleExport = useCallback(() => {
    exportData()
    showToast('数据已导出！')
  }, [exportData, showToast])

  const handleImport = useCallback(async () => {
    try {
      await importData()
      showToast('数据已导入！请刷新页面')
    } catch {
      showToast('导入失败，请检查文件')
    }
  }, [importData, showToast])

  const handleAnnivSave = useCallback(
    (date: string) => {
      setAnniversary(date)
      showToast('纪念日已更新！💕')
    },
    [setAnniversary, showToast]
  )

  const handleAlbumAdd = useCallback(
    (photo: Parameters<typeof addPhoto>[0]) => {
      addPhoto(photo)
    },
    [addPhoto]
  )

  const handleAlbumDelete = useCallback(
    (id: number) => {
      deletePhoto(id)
    },
    [deletePhoto]
  )

  const handleDiaryAdd = useCallback(
    (diary: Parameters<typeof addDiary>[0]) => {
      addDiary(diary)
    },
    [addDiary]
  )

  const handleDiaryDelete = useCallback(
    (id: number) => {
      deleteDiary(id)
    },
    [deleteDiary]
  )

  const handleNoteAdd = useCallback(
    (note: Parameters<typeof addNote>[0]) => {
      addNote(note)
    },
    [addNote]
  )

  const handleNoteDelete = useCallback(
    (id: number) => {
      deleteNote(id)
    },
    [deleteNote]
  )

  const handlePrivatePhotoAdd = useCallback(
    (photo: Parameters<typeof addPrivatePhoto>[0]) => {
      addPrivatePhoto(photo)
    },
    [addPrivatePhoto]
  )

  const handlePrivatePhotoDelete = useCallback(
    (id: number) => {
      deletePrivatePhoto(id)
    },
    [deletePrivatePhoto]
  )

  if (!loggedIn) {
    return (
      <div className="app-container">
        <PasswordPage
          isSetting={isSetting}
          onPassword={handlePassword}
          onSet={handleSet}
          onReset={handleReset}
        />
        {toast && <div className="toast">{toast}</div>}
      </div>
    )
  }

  function renderPage() {
    switch (page) {
      case 'anniv':
        return (
          <AnnivPage
            anniversary={data.anniversary}
            onSave={handleAnnivSave}
          />
        )
      case 'album':
        return (
          <AlbumPage
            photos={data.albums}
            onAdd={handleAlbumAdd}
            onDelete={handleAlbumDelete}
            onToast={showToast}
          />
        )
      case 'diary':
        return (
          <DiaryPage
            diaries={data.diaries}
            onAdd={handleDiaryAdd}
            onDelete={handleDiaryDelete}
            onToast={showToast}
          />
        )
      case 'period':
        return (
          <PeriodPage
            periods={data.periods}
            onAdd={addPeriod}
            onDelete={deletePeriod}
            onToast={showToast}
          />
        )
      case 'game':
        return (
          <GamePage
            rooms={data.gameRooms}
            tasks={data.gameTasks}
            points={data.gamePoints}
            onInitRooms={initGameRooms}
            onAddItem={addRoomItem}
            onCompleteTask={completeTask}
            onAddTasks={addGameTasks}
            onToast={showToast}
          />
        )
      case 'private':
        return (
          <PrivatePage
            privatePassword={data.privatePassword}
            appPassword={data.appPassword}
            notes={data.privateNotes}
            photos={data.privatePhotos}
            onAddNote={handleNoteAdd}
            onDeleteNote={handleNoteDelete}
            onAddPhoto={handlePrivatePhotoAdd}
            onDeletePhoto={handlePrivatePhotoDelete}
            onToast={showToast}
          />
        )
    }
  }

  return (
    <div className="app-container">
      {updateReady && (
        <div className="update-banner" onClick={() => window.location.reload()}>
          新版本已就绪，点击更新 ✨
        </div>
      )}
      <div className="nav-bar">{PAGE_TITLES[page]}</div>
      <div className="content-area">{renderPage()}</div>
      <div className="sync-bar">
        <button className="sync-btn" onClick={handleExport}>📤 导出</button>
        <span className="sync-hint">数据备份</span>
        <button className="sync-btn" onClick={handleImport}>📥 导入</button>
      </div>
      <TabBar current={page} onChange={setPage} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
