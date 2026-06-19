import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client, Lawyer } from '@/types'
import { mockClients, mockLawyers } from '@/data/mock'

interface ClientStore {
  clients: Client[]
  lawyers: Lawyer[]
  getClient: (id: string) => Client | undefined
  getLawyerName: (id: string) => string
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [...mockClients],
      lawyers: [...mockLawyers],
      getClient: (id) => get().clients.find((c) => c.id === id),
      getLawyerName: (id) => {
        const lawyer = get().lawyers.find((l) => l.id === id)
        return lawyer?.name ?? ''
      },
      addClient: (c) => set((s) => ({
        clients: [...s.clients, { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }],
      })),
      updateClient: (id, data) => set((s) => ({
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
      })),
      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
    }),
    { name: 'law-firm-clients' }
  )
)
