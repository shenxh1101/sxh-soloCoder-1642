import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Plus, Eye, Trash2 } from 'lucide-react'
import { useClientStore } from '@/stores/clientStore'
import { useCaseStore } from '@/stores/caseStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_TYPES } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function ClientList() {
  const navigate = useNavigate()
  const { clients, deleteClient } = useClientStore()
  const { cases } = useCaseStore()
  const { addToast } = useToastStore()

  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('全部')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.caseType.toLowerCase().includes(search.toLowerCase())
    const matchType = activeType === '全部' || c.caseType === activeType
    return matchSearch && matchType
  })

  const getCaseCount = (clientId: string) =>
    cases.filter((cs) => cs.clientId === clientId).length

  const handleDelete = () => {
    if (!deleteId) return
    deleteClient(deleteId)
    addToast('客户已删除', 'success')
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">客户管理</h1>
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          <Plus size={16} />
          新增客户
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type="text"
              placeholder="搜索客户名称或案件类型..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeType === '全部'
                ? 'bg-navy-500 text-white'
                : 'bg-ivory-100 text-navy-400 hover:bg-ivory-200'
            }`}
            onClick={() => setActiveType('全部')}
          >
            全部
          </button>
          {CASE_TYPES.map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-navy-500 text-white'
                  : 'bg-ivory-100 text-navy-400 hover:bg-ivory-200'
              }`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-navy-300">
            <p className="text-lg mb-1">暂无客户数据</p>
            <p className="text-sm">请尝试调整筛选条件或新增客户</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ivory-200">
                  <th className="text-left py-3 px-4 text-navy-400 font-medium">客户名称</th>
                  <th className="text-left py-3 px-4 text-navy-400 font-medium">联系方式</th>
                  <th className="text-left py-3 px-4 text-navy-400 font-medium">案件类型</th>
                  <th className="text-left py-3 px-4 text-navy-400 font-medium">关联案件数</th>
                  <th className="text-left py-3 px-4 text-navy-400 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-b border-ivory-100 hover:bg-ivory-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-navy-500">{client.name}</td>
                    <td className="py-3 px-4 text-navy-300">{client.contact}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-gold-50 text-gold-700 border border-gold-200">
                        {client.caseType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-navy-300">{getCaseCount(client.id)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/clients/${client.id}`}
                          className="inline-flex items-center gap-1 text-navy-400 hover:text-navy-500 text-sm transition-colors"
                        >
                          <Eye size={14} />
                          查看详情
                        </Link>
                        <button
                          onClick={() => setDeleteId(client.id)}
                          className="inline-flex items-center gap-1 text-red-400 hover:text-red-500 text-sm transition-colors"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="确认删除"
        message="确定要删除该客户吗？此操作不可撤销。"
      />
    </div>
  )
}
