import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Save } from 'lucide-react'
import { useClientStore } from '@/stores/clientStore'
import { useCaseStore } from '@/stores/caseStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_TYPES } from '@/types'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClient, updateClient } = useClientStore()
  const { cases } = useCaseStore()
  const { addToast } = useToastStore()

  const client = getClient(id!)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', caseType: '', notes: '' })

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-navy-300 mb-4">客户不存在</p>
        <button className="btn-secondary" onClick={() => navigate('/clients')}>
          <ArrowLeft size={16} />
          返回列表
        </button>
      </div>
    )
  }

  const relatedCases = cases.filter((c) => c.clientId === client.id)

  const startEdit = () => {
    setForm({
      name: client.name,
      contact: client.contact,
      caseType: client.caseType,
      notes: client.notes,
    })
    setEditing(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('客户名称不能为空', 'error')
      return
    }
    updateClient(client.id, form)
    addToast('客户信息已更新', 'success')
    setEditing(false)
  }

  const statusBadge = (status: string) => {
    if (status === '进行中') return 'badge-active'
    if (status === '已结案') return 'badge-closed'
    return 'badge-archived'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="btn-secondary" onClick={() => navigate('/clients')}>
            <ArrowLeft size={16} />
            返回
          </button>
          <h1 className="page-title">{client.name}</h1>
        </div>
        {editing ? (
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} />
            保存
          </button>
        ) : (
          <button className="btn-secondary" onClick={startEdit}>
            <Edit size={16} />
            编辑
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">基本信息</h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">客户名称</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">联系方式</label>
              <input
                className="input-field"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">案件类型</label>
              <select
                className="input-field"
                value={form.caseType}
                onChange={(e) => setForm({ ...form, caseType: e.target.value })}
              >
                {CASE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">备注</label>
              <textarea
                className="input-field"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-navy-300">客户名称</span>
              <p className="font-medium text-navy-500 mt-1">{client.name}</p>
            </div>
            <div>
              <span className="text-navy-300">联系方式</span>
              <p className="font-medium text-navy-500 mt-1">{client.contact}</p>
            </div>
            <div>
              <span className="text-navy-300">案件类型</span>
              <p className="mt-1">
                <span className="badge bg-gold-50 text-gold-700 border border-gold-200">{client.caseType}</span>
              </p>
            </div>
            <div>
              <span className="text-navy-300">创建日期</span>
              <p className="font-medium text-navy-500 mt-1">{client.createdAt}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-navy-300">备注</span>
              <p className="font-medium text-navy-500 mt-1">{client.notes || '—'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">关联案件 ({relatedCases.length})</h2>
        {relatedCases.length === 0 ? (
          <p className="text-sm text-navy-300">暂无关联案件</p>
        ) : (
          <div className="space-y-3">
            {relatedCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-center justify-between p-3 rounded border border-ivory-200 hover:border-navy-200 hover:bg-ivory-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-navy-500 text-sm">{c.caseNumber}</span>
                  <span className="text-navy-300 text-sm">{c.cause}</span>
                </div>
                <span className={statusBadge(c.status)}>{c.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
