import { useState, useEffect, useCallback } from 'react'
import type { AppData, Photo, Diary, Note, PeriodRecord, GameRoom, RoomItem } from '../types'
import { DEFAULT_DATA } from '../types'

const STORAGE_KEY = 'yumin-app-data'

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw)
    return {
      appPassword: parsed.appPassword || '',
      privatePassword: parsed.privatePassword || '',
      anniversary: parsed.anniversary || '',
      albums: parsed.albums || [],
      diaries: parsed.diaries || [],
      privateNotes: parsed.privateNotes || [],
      privatePhotos: parsed.privatePhotos || [],
      periods: parsed.periods || [],
      gameRooms: parsed.gameRooms || [],
      gameTasks: parsed.gameTasks || [],
      gamePoints: parsed.gamePoints || 0,
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const hasPassword = data.appPassword !== ''

  const setPassword = useCallback((pw: string) => {
    setData((prev) => ({ ...prev, appPassword: pw }))
  }, [])

  const checkPassword = useCallback(
    (pw: string): boolean => {
      return pw === data.appPassword
    },
    [data.appPassword]
  )

  const resetAll = useCallback(() => {
    setData({ ...DEFAULT_DATA })
  }, [])

  const setAnniversary = useCallback((date: string) => {
    setData((prev) => ({ ...prev, anniversary: date }))
  }, [])

  const addPhoto = useCallback((photo: Photo) => {
    setData((prev) => ({ ...prev, albums: [photo, ...prev.albums] }))
  }, [])

  const deletePhoto = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      albums: prev.albums.filter((p) => p.id !== id),
    }))
  }, [])

  const addDiary = useCallback((diary: Diary) => {
    setData((prev) => ({ ...prev, diaries: [diary, ...prev.diaries] }))
  }, [])

  const deleteDiary = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      diaries: prev.diaries.filter((d) => d.id !== id),
    }))
  }, [])

  const addNote = useCallback((note: Note) => {
    setData((prev) => ({
      ...prev,
      privateNotes: [note, ...prev.privateNotes],
    }))
  }, [])

  const deleteNote = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      privateNotes: prev.privateNotes.filter((n) => n.id !== id),
    }))
  }, [])

  const addPrivatePhoto = useCallback((photo: Photo) => {
    setData((prev) => ({
      ...prev,
      privatePhotos: [photo, ...prev.privatePhotos],
    }))
  }, [])

  const deletePrivatePhoto = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      privatePhotos: prev.privatePhotos.filter((p) => p.id !== id),
    }))
  }, [])

  const checkPrivatePassword = useCallback(
    (pw: string): boolean => {
      const target = data.privatePassword || data.appPassword
      return pw === target
    },
    [data.privatePassword, data.appPassword]
  )

  const setPrivatePassword = useCallback((pw: string) => {
    setData((prev) => ({ ...prev, privatePassword: pw }))
  }, [])

  const addPeriod = useCallback((record: PeriodRecord) => {
    setData((prev) => ({ ...prev, periods: [record, ...prev.periods] }))
  }, [])

  const deletePeriod = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      periods: prev.periods.filter((p) => p.id !== id),
    }))
  }, [])

  const initGameRooms = useCallback((rooms: GameRoom[]) => {
    setData((prev) => ({ ...prev, gameRooms: rooms }))
  }, [])

  const addRoomItem = useCallback((roomType: string, item: RoomItem) => {
    setData((prev) => ({
      ...prev,
      gameRooms: prev.gameRooms.map((r) =>
        r.type === roomType ? { ...r, items: [...r.items, item] } : r
      ),
      gamePoints: prev.gamePoints - 1,
    }))
  }, [])

  const completeTask = useCallback((taskId: number) => {
    setData((prev) => ({
      ...prev,
      gameTasks: prev.gameTasks.map((t) =>
        t.id === taskId ? { ...t, done: true } : t
      ),
      gamePoints: prev.gamePoints + 1,
    }))
  }, [])

  const addGameTasks = useCallback((tasks: { id: number; text: string; done: boolean; date: string }[]) => {
    setData((prev) => ({
      ...prev,
      gameTasks: [...tasks, ...prev.gameTasks],
    }))
  }, [])

  const exportData = useCallback(() => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `敏敏-备份-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  const importData = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) { reject(new Error('No file')); return }
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const incoming = JSON.parse(reader.result as string)
            setData((prev) => ({
              ...incoming,
              albums: mergeById(prev.albums, incoming.albums || []),
              diaries: mergeById(prev.diaries, incoming.diaries || []),
              privateNotes: mergeById(prev.privateNotes, incoming.privateNotes || []),
              privatePhotos: mergeById(prev.privatePhotos, incoming.privatePhotos || []),
              periods: mergeById(prev.periods, incoming.periods || []),
              gameRooms: incoming.gameRooms || prev.gameRooms,
              gameTasks: mergeById(prev.gameTasks, incoming.gameTasks || []),
              gamePoints: Math.max(prev.gamePoints, incoming.gamePoints || 0),
            }))
            resolve()
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('Read error'))
        reader.readAsText(file)
      }
      input.click()
    })
  }, [setData])

  return {
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
    checkPrivatePassword,
    setPrivatePassword,
    addPeriod,
    deletePeriod,
    initGameRooms,
    addRoomItem,
    completeTask,
    addGameTasks,
    exportData,
    importData,
  }
}

function mergeById<T extends { id: number }>(existing: T[], incoming: T[]): T[] {
  const ids = new Set(existing.map((e) => e.id))
  const newItems = incoming.filter((i) => !ids.has(i.id))
  return [...existing, ...newItems]
}
