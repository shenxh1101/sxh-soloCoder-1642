import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Case, Stage } from '@/types'
import { mockCases } from '@/data/mock'

interface CaseState {
  cases: Case[]
  getCase: (id: string) => Case | undefined
  addCase: (c: Case) => void
  updateCase: (id: string, data: Partial<Case>) => void
  deleteCase: (id: string) => void
  addStage: (caseId: string, stage: Stage) => void
  updateStage: (caseId: string, stageId: string, data: Partial<Stage>) => void
  deleteStage: (caseId: string, stageId: string) => void
}

export const useCaseStore = create<CaseState>()(
  persist(
    (set, get) => ({
      cases: mockCases,
      getCase: (id) => get().cases.find((c) => c.id === id),
      addCase: (c) => set((state) => ({ cases: [...state.cases, c] })),
      updateCase: (id, data) =>
        set((state) => ({
          cases: state.cases.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCase: (id) =>
        set((state) => ({ cases: state.cases.filter((c) => c.id !== id) })),
      addStage: (caseId, stage) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId ? { ...c, stages: [...c.stages, stage] } : c
          ),
        })),
      updateStage: (caseId, stageId, data) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, stages: c.stages.map((st) => (st.id === stageId ? { ...st, ...data } : st)) }
              : c
          ),
        })),
      deleteStage: (caseId, stageId) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId ? { ...c, stages: c.stages.filter((st) => st.id !== stageId) } : c
          ),
        })),
    }),
    { name: 'law-firm-cases' }
  )
)
