import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScheduleItem } from '@/types'
import { mockSchedules } from '@/data/mock'
import { useCaseStore } from '@/stores/caseStore'

interface ScheduleStore {
  schedules: ScheduleItem[]
  getUpcoming: (days: number) => ScheduleItem[]
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem
  updateSchedule: (id: string, data: Partial<ScheduleItem>) => void
  deleteSchedule: (id: string) => void
  checkReminders: () => ScheduleItem[]
  addScheduleWithStage: (item: Omit<ScheduleItem, 'id'>) => { schedule: ScheduleItem; stageAdded: boolean }
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
      addSchedule: (item) => {
        const schedule = { ...item, id: crypto.randomUUID() }
        set((s) => ({
          schedules: [...s.schedules, schedule],
        }))
        return schedule
      },
      addScheduleWithStage: (item) => {
        const schedule = get().addSchedule(item)
        let stageAdded = false
        if (schedule.type === '开庭') {
          const caseStore = useCaseStore.getState()
          const caseItem = caseStore.getCase(schedule.caseId)
          if (caseItem) {
            const date = new Date(schedule.dateTime)
            const stageName = `开庭(${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')})`
            caseStore.addStage(schedule.caseId, {
              id: crypto.randomUUID(),
              name: stageName,
              startTime: schedule.dateTime,
              notes: '',
              order: caseItem.stages.length + 1,
            })
            caseStore.updateCase(schedule.caseId, { currentStage: stageName })
            stageAdded = true
          }
        }
        return { schedule, stageAdded }
      },
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
