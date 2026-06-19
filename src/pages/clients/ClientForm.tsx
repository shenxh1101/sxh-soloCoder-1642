import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_TYPES } from '@/types'

export default function ClientForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClient, addClient, updateClient } = useClientStore()
  const { addToast } = useToastStore()

  const isEdit = !!id
  const existing = isEdit ? getClient(id) : null

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    contact: existing?.contact ?? '',
    caseType: existing?.caseType ?? CASE_TYPES[0],
    notes: existing?.notes ?? '',
  })
  const [nameError, setNameError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)

    if (isEdit) {
      updateClient(id, form)
      addToast('客户信息已更新', 'success')
    } else {
      addClient(form)
      addToast('客户创建成功', 'success')
    }
    navigate('/clients')
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">{isEdit ? '编辑客户' : '新增客户'}</h1>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">客户名称 <span className="text-red-500">*</span></label>
            <input
              className={`input-field ${nameError ? 'border-red-400 focus:ring-red-300' : ''}`}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                if (e.target.value.trim()) setNameError(false)
              }}
              placeholder="请输入客户名称"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">客户名称不能为空</p>}
          </div>

          <div>
            <label className="label-text">联系方式</label>
            <input
              className="input-field"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="请输入联系方式"
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
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="请输入备注信息"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">
              {isEdit ? '保存修改' : '创建客户'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              <X size={16} />
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
