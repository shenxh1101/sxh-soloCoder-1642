import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_STATUSES, ARCHIVE_ITEMS } from '@/types'
import type { Case } from '@/types'

export default function CaseForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { cases, addCase, updateCase } = useCaseStore()
  const { clients, lawyers } = useClientStore()
  const addToast = useToastStore((s) => s.addToast)

  const existing = id ? cases.find((c) => c.id === id) : undefined
  const isEdit = !!existing

  const [form, setForm] = useState({
    cause: existing?.cause ?? '',
    filingDate: existing?.filingDate ?? '',
    opposingParty: existing?.opposingParty ?? '',
    lawyerId: existing?.lawyerId ?? lawyers[0]?.id ?? '',
    clientId: existing?.clientId ?? clients[0]?.id ?? '',
    status: existing?.status ?? '进行中' as Case['status'],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.cause.trim()) e.cause = '案由不能为空'
    if (!form.filingDate) e.filingDate = '立案日期不能为空'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const generateCaseNumber = () => {
    const year = new Date().getFullYear()
    const count = cases.filter((c) => c.createdAt.startsWith(String(year))).length + 1
    return `${year}-民-${String(count).padStart(3, '0')}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEdit && existing) {
      updateCase(existing.id, form)
      addToast('案件已更新', 'success')
    } else {
      let stages = [{ id: Date.now().toString(), name: '立案', startTime: form.filingDate, notes: '已提交起诉状', order: 1 }]
      let currentStage = '立案'

      if (form.status === '已结案') {
        stages = [
          { id: `${Date.now()}-1`, name: '立案', startTime: form.filingDate, notes: '', order: 1 },
          { id: `${Date.now()}-2`, name: '证据交换', startTime: '', notes: '', order: 2 },
          { id: `${Date.now()}-3`, name: '开庭', startTime: '', notes: '', order: 3 },
          { id: `${Date.now()}-4`, name: '判决', startTime: new Date().toISOString().slice(0, 10), notes: '案件结案', order: 4 },
        ]
        currentStage = '判决'
      } else if (form.status === '已归档') {
        stages = [
          { id: `${Date.now()}-1`, name: '立案', startTime: form.filingDate, notes: '', order: 1 },
          { id: `${Date.now()}-2`, name: '证据交换', startTime: '', notes: '', order: 2 },
          { id: `${Date.now()}-3`, name: '开庭', startTime: '', notes: '', order: 3 },
          { id: `${Date.now()}-4`, name: '判决', startTime: new Date().toISOString().slice(0, 10), notes: '案件结案', order: 4 },
          { id: `${Date.now()}-5`, name: '归档', startTime: new Date().toISOString().slice(0, 10), notes: '案件归档', order: 5 },
        ]
        currentStage = '归档'
      }

      const newCase: Case = {
        id: Date.now().toString(),
        caseNumber: generateCaseNumber(),
        ...form,
        currentStage,
        stages,
        createdAt: new Date().toISOString().slice(0, 10),
        review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
        execution: { totalAmount: '', receivedAmount: '', records: [] },
        archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
        archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
      }
      addCase(newCase)
      addToast('案件已创建', 'success')
    }
    navigate('/cases')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button className="btn-secondary !px-2 !py-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <h1 className="page-title">{isEdit ? '编辑案件' : '新增案件'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">案由 *</label>
            <input
              className="input-field"
              value={form.cause}
              onChange={(e) => setForm({ ...form, cause: e.target.value })}
            />
            {errors.cause && <p className="text-xs text-red-500 mt-1">{errors.cause}</p>}
          </div>
          <div>
            <label className="label-text">立案日期 *</label>
            <input
              type="date"
              className="input-field"
              value={form.filingDate}
              onChange={(e) => setForm({ ...form, filingDate: e.target.value })}
            />
            {errors.filingDate && <p className="text-xs text-red-500 mt-1">{errors.filingDate}</p>}
          </div>
          <div>
            <label className="label-text">对方当事人</label>
            <input
              className="input-field"
              value={form.opposingParty}
              onChange={(e) => setForm({ ...form, opposingParty: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">承办律师</label>
            <select
              className="input-field"
              value={form.lawyerId}
              onChange={(e) => setForm({ ...form, lawyerId: e.target.value })}
            >
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">客户</label>
            <select
              className="input-field"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">状态</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Case['status'] })}
            >
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ivory-200">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>取消</button>
          <button type="submit" className="btn-primary">
            <Save size={16} /> {isEdit ? '保存修改' : '创建案件'}
          </button>
        </div>
      </form>
    </div>
  )
}
