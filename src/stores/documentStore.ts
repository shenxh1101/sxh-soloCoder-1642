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
  duplicateDocument: (id: string) => Document
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
      duplicateDocument: (id) => {
        const doc = get().documents.find((d) => d.id === id)
        if (!doc) throw new Error('Document not found')
        const sameGroup = get().documents.filter(
          (d) => d.caseId === doc.caseId && d.templateId === doc.templateId
        )
        let maxVersion = 0
        let unversionedCount = 0
        sameGroup.forEach((d) => {
          const match = d.title.match(/\[v(\d+)\]/)
          if (match) {
            const v = parseInt(match[1])
            if (v > maxVersion) maxVersion = v
          } else {
            unversionedCount++
          }
        })
        if (maxVersion === 0 && unversionedCount > 0) maxVersion = unversionedCount
        const nextVersion = maxVersion + 1
        const baseTitle = doc.title.replace(/\s*\[v\d+\]/, '').trim()
        const newDoc: Document = {
          ...doc,
          id: `d${Date.now()}`,
          title: `${baseTitle} [v${nextVersion}]`,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ documents: [...state.documents, newDoc] }))
        return newDoc
      },
    }),
    { name: 'law-firm-documents' }
  )
)
