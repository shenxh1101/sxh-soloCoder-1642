import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Trash2 } from 'lucide-react'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_STATUSES } from '@/types'
import type { Case } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

const STATUS_BADGE: Record<Case['status'], string> = {
  '进行中': 'badge-active',
  '已结案': 'badge-closed',
  '已归档': 'badge-archived',
}

export default function CaseList() {
  const navigate = useNavigate()
  const { cases, deleteCase } = useCaseStore()
  const { lawyers, getClient } = useClientStore()
  const addToast = useToastStore((s) => s.addToast)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Case['status'] | '全部'>('全部')
  const [lawyerFilter, setLawyerFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null)

  const filtered = cases.filter((c) => {
    if (search && !c.cause.includes(search) && !c.caseNumber.includes(search)) return false
    if (statusFilter !== '全部' && c.status !== statusFilter) return false
    if (lawyerFilter && c.lawyerId !== lawyerFilter) return false
    return true
  })

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCase(deleteTarget.id)
    addToast('案件已删除', 'success')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">案件管理</h1>
        <button className="btn-primary" onClick={() => navigate('/cases/new')}>
          <Plus size={16} />
          新增案件
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索案由或案号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto"
            value={lawyerFilter}
            onChange={(e) => setLawyerFilter(e.target.value)}
          >
            <option value="">全部律师</option>
            {lawyers.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 border-b border-ivory-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === '全部'
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-ivory-400 hover:text-navy-300'
            }`}
            onClick={() => setStatusFilter('全部')}
          >
            全部
          </button>
          {CASE_STATUSES.map((s) => (
            <button
              key={s}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === s
                  ? 'border-navy-500 text-navy-500'
                  : 'border-transparent text-ivory-400 hover:text-navy-300'
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ivory-400">暂无案件数据</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ivory-200 text-ivory-400">
                <th className="text-left py-3 font-medium">案号</th>
                <th className="text-left py-3 font-medium">案由</th>
                <th className="text-left py-3 font-medium">客户</th>
                <th className="text-left py-3 font-medium">承办律师</th>
                <th className="text-left py-3 font-medium">当前阶段</th>
                <th className="text-left py-3 font-medium">状态</th>
                <th className="text-left py-3 font-medium">归档信息</th>
                <th className="text-right py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const client = getClient(c.clientId)
                const lawyer = lawyers.find((l) => l.id === c.lawyerId)
                return (
                  <tr key={c.id} className={`border-b border-ivory-100 hover:bg-ivory-50 transition-colors ${c.status === '已归档' ? 'opacity-75' : ''}`}>
                    <td className="py-3 font-medium text-navy-500">{c.caseNumber}</td>
                    <td className="py-3">{c.cause}</td>
                    <td className="py-3">{client?.name ?? '-'}</td>
                    <td className="py-3">{lawyer?.name ?? '-'}</td>
                    <td className="py-3">{c.currentStage}</td>
                    <td className="py-3">
                      <span className={STATUS_BADGE[c.status]}>{c.status}</span>
                    </td>
                    <td className="py-3 text-xs">
                      {c.status === '已归档' ? (
                        c.archiveAudit?.cabinetLocation ? (
                          <span className="text-navy-500">{c.archiveAudit.cabinetLocation}</span>
                        ) : (
                          <span className="text-amber-500">未填写</span>
                        )
                      ) : '-'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="btn-secondary !px-2 !py-1"
                          onClick={() => navigate(`/cases/${c.id}`)}
                        >
                          <Eye size={14} />
                          查看详情
                        </button>
                        <button
                          className="btn-secondary !px-2 !py-1 !text-red-500 !border-red-200 hover:!bg-red-50"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="确认删除"
        message={`确定要删除案件「${deleteTarget?.caseNumber}」吗？此操作不可撤销。`}
      />
    </div>
  )
}
