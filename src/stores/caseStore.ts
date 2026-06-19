import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Case, Stage, CaseReview, ExecutionRecord, ArchiveAudit } from '@/types'
import { ARCHIVE_ITEMS } from '@/types'
import { mockCases } from '@/data/mock'

function ensureCaseDefaults(c: any): Case {
  return {
    ...c,
    review: c.review || { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: c.execution || { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: c.archiveChecklist || ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: c.archiveAudit || { archiveDate: '', cabinetLocation: '', handler: '' },
    stages: c.stages || [],
  }
}

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
  setArchiveAudit: (caseId: string, audit: Partial<ArchiveAudit>) => void
  getExecutionStats: (caseId: string) => { total: number; received: number; unreceived: number; ratio: number }
}

export const useCaseStore = create<CaseState>()(
  persist(
    (set, get) => ({
      cases: mockCases.map(ensureCaseDefaults),
      getCase: (id) => get().cases.find((c) => c.id === id),
      addCase: (c) => set((state) => ({ cases: [...state.cases, ensureCaseDefaults(c)] })),
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
          cases: state.cases.map((c) => {
            if (c.id !== caseId) return c
            const newRecords = [...(c.execution?.records || []), record]
            const receivedAmount = newRecords
              .filter(r => r.type === '回款')
              .reduce((sum, r) => sum + (parseFloat(r.amount.replace(/[^0-9.]/g, '')) || 0), 0)
              .toString()
            return { ...c, execution: { ...c.execution, records: newRecords, receivedAmount } }
          }),
        })),
      removeExecutionRecord: (caseId, recordId) =>
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id !== caseId) return c
            const newRecords = (c.execution?.records || []).filter((r) => r.id !== recordId)
            const receivedAmount = newRecords
              .filter(r => r.type === '回款')
              .reduce((sum, r) => sum + (parseFloat(r.amount.replace(/[^0-9.]/g, '')) || 0), 0)
              .toString()
            return { ...c, execution: { ...c.execution, records: newRecords, receivedAmount } }
          }),
        })),
      updateExecutionAmounts: (caseId, totalAmount, _receivedAmount) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, execution: { ...c.execution, totalAmount } }
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
      setArchiveAudit: (caseId, audit) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, archiveAudit: { ...c.archiveAudit, ...audit } }
              : c
          ),
        })),
      getExecutionStats: (caseId) => {
        const c = get().getCase(caseId)
        if (!c?.execution) return { total: 0, received: 0, unreceived: 0, ratio: 0 }
        const total = parseFloat(c.execution.totalAmount?.replace(/[^0-9.]/g, '') || '0') || 0
        const received = parseFloat(c.execution.receivedAmount?.replace(/[^0-9.]/g, '') || '0') || 0
        const unreceived = Math.max(0, total - received)
        const ratio = total > 0 ? Math.min(1, received / total) : 0
        return { total, received, unreceived, ratio }
      },
    }),
    {
      name: 'law-firm-cases',
      merge: (persisted, current) => {
        const p = persisted as any
        if (p?.cases) {
          p.cases = p.cases.map(ensureCaseDefaults)
        }
        return { ...current, ...p }
      },
    }
  )
)
