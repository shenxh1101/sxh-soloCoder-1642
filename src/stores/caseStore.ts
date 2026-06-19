import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Case, Stage, CaseReview, ExecutionRecord } from '@/types'
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
  setReview: (caseId: string, review: Partial<CaseReview>) => void
  addExecutionRecord: (caseId: string, record: ExecutionRecord) => void
  removeExecutionRecord: (caseId: string, recordId: string) => void
  updateExecutionAmounts: (caseId: string, totalAmount: string, receivedAmount: string) => void
  toggleArchiveItem: (caseId: string, itemId: string) => void
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
      setReview: (caseId, review) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId ? { ...c, review: { ...c.review, ...review } } : c
          ),
        })),
      addExecutionRecord: (caseId, record) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, execution: { ...c.execution, records: [...(c.execution?.records || []), record] } }
              : c
          ),
        })),
      removeExecutionRecord: (caseId, recordId) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, execution: { ...c.execution, records: (c.execution?.records || []).filter((r) => r.id !== recordId) } }
              : c
          ),
        })),
      updateExecutionAmounts: (caseId, totalAmount, receivedAmount) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, execution: { ...c.execution, totalAmount, receivedAmount } }
              : c
          ),
        })),
      toggleArchiveItem: (caseId, itemId) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, archiveChecklist: (c.archiveChecklist || []).map((item) => item.id === itemId ? { ...item, checked: !item.checked } : item) }
              : c
          ),
        })),
    }),
    { name: 'law-firm-cases' }
  )
)
