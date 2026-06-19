import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Document, DocumentTemplate } from '@/types'
import { mockDocuments, mockTemplates } from '@/data/mock'

interface DocumentState {
  documents: Document[]
  templates: DocumentTemplate[]
  generateDocument: (templateId: string, caseId: string) => Document
  updateDocument: (id: string, data: Partial<Document>) => void
  deleteDocument: (id: string) => void
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: mockDocuments,
      templates: mockTemplates,
      generateDocument: (templateId, caseId) => {
        const template = get().templates.find((t) => t.id === templateId)
        const newDoc: Document = {
          id: `d${Date.now()}`,
          templateId,
          caseId,
          clientId: '',
          title: template?.name || '新文书',
          content: template?.content || '',
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
