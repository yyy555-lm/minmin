export type Mood = 'happy' | 'love' | 'touched' | 'miss' | 'normal'

export type FlowType = 'light' | 'medium' | 'heavy'

export type RoomType = 'master' | 'bedroom' | 'living' | 'bathroom' | 'garden'

export interface Photo {
  id: number
  data: string
  name: string
  date: string
}

export interface Diary {
  id: number
  title: string
  content: string
  mood: Mood
  date: string
}

export interface Note {
  id: number
  text: string
  date: string
}

export interface PeriodRecord {
  id: number
  date: string
  flow: FlowType
}

export interface RoomItem {
  id: number
  emoji: string
  name: string
}

export interface GameRoom {
  type: RoomType
  name: string
  items: RoomItem[]
}

export interface DailyTask {
  id: number
  text: string
  done: boolean
  date: string
}

export interface AppData {
  appPassword: string
  privatePassword: string
  anniversary: string
  albums: Photo[]
  diaries: Diary[]
  privateNotes: Note[]
  privatePhotos: Photo[]
  periods: PeriodRecord[]
  gameRooms: GameRoom[]
  gameTasks: DailyTask[]
  gamePoints: number
}

export const DEFAULT_DATA: AppData = {
  appPassword: '',
  privatePassword: '',
  anniversary: '',
  albums: [],
  diaries: [],
  privateNotes: [],
  privatePhotos: [],
  periods: [],
  gameRooms: [],
  gameTasks: [],
  gamePoints: 0,
}
