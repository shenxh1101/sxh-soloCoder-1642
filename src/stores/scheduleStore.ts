import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScheduleItem } from '@/types'
import { mockSchedules } from '@/data/mock'

interface ScheduleStore {
  schedules: ScheduleItem[]
  getUpcoming: (days: number) => ScheduleItem[]
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => void
  updateSchedule: (id: string, data: Partial<ScheduleItem>) => void
  deleteSchedule: (id: string) => void
  checkReminders: () => ScheduleItem[]
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      schedules: [...mockSchedules],
      getUpcoming: (days: number) => {
        const now = new Date()
        const end = new Date()
        end.setDate(now.getDate() + days)
        return get().schedules.filter((s) => {
          const d = new Date(s.dateTime)
          return d >= now && d <= end
        })
      },
      addSchedule: (item) => set((s) => ({
        schedules: [...s.schedules, { ...item, id: crypto.randomUUID() }],
      })),
      updateSchedule: (id, data) => set((s) => ({
        schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...data } : sc)),
      })),
      deleteSchedule: (id) => set((s) => ({
        schedules: s.schedules.filter((sc) => sc.id !== id),
      })),
      checkReminders: () => {
        const now = new Date()
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const due = get().schedules.filter((s) => {
          const d = new Date(s.dateTime)
          return d >= now && d <= tomorrow && !s.reminded
        })
        if (due.length > 0) {
          const ids = due.map((s) => s.id)
          set((s) => ({
            schedules: s.schedules.map((sc) =>
              ids.includes(sc.id) ? { ...sc, reminded: true } : sc
            ),
          }))
        }
        return due
      },
    }),
    { name: 'law-firm-schedules' }
  )
)
