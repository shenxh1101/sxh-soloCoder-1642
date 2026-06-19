import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Document, DocumentTemplate } from '@/types'
import { mockDocuments, mockTemplates } from '@/data/mock'
import { useClientStore } from './clientStore'
import { useCaseStore } from './caseStore'

interface DocumentState {
  documents: Document[]
  templates: DocumentTemplate[]
  generateDocument: (templateId: string, caseId: string) => Document
  updateDocument: (id: string, data: Partial<Document>) => void
  deleteDocument: (id: string) => void
}

function fillTemplate(content: string, vars: Record<string, string>) {
  let result = content
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value)
  })
  return result
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: mockDocuments,
      templates: mockTemplates,
      generateDocument: (templateId, caseId) => {
        const template = get().templates.find((t) => t.id === templateId)
        const caseData = useCaseStore.getState().getCase(caseId)
        const client = caseData ? useClientStore.getState().getClient(caseData.clientId) : undefined
        const lawyer = caseData ? useClientStore.getState().lawyers.find((l) => l.id === caseData.lawyerId) : undefined

        const vars: Record<string, string> = {
          clientName: client?.name || '',
          opposingParty: caseData?.opposingParty || '',
          cause: caseData?.cause || '',
          caseNumber: caseData?.caseNumber || '',
          filingDate: caseData?.filingDate || '',
          lawyerName: lawyer?.name || '',
          courtName: '',
          lawFirmName: '律信律师事务所',
        }

        const filledContent = template ? fillTemplate(template.content, vars) : ''

        const newDoc: Document = {
          id: `d${Date.now()}`,
          templateId,
          caseId,
          clientId: caseData?.clientId || '',
          title: `${template?.name || '文书'}-${caseData?.cause || ''}`,
          content: filledContent,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ documents: [...state.documents, newDoc] }))
        return newDoc
      },
      updateDocument: (id, data) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
    }),
    { name: 'law-firm-documents' }
  )
)
