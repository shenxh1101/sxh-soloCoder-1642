import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { useDocumentStore } from '@/stores/documentStore'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { DocumentTemplate } from '@/types'

function TemplateCard({ template, onGenerate }: { template: DocumentTemplate; onGenerate: (id: string) => void }) {
  return (
    <div className="border border-ivory-200 rounded-lg p-4 flex flex-col items-center gap-3 hover:border-navy-200 hover:shadow-sm transition-all">
      <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center">
        <FileText size={24} className="text-gold-500" />
      </div>
      <span className="font-medium text-sm text-navy-500">{template.name}</span>
      <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-xs">{template.category}</span>
      <button className="btn-primary text-xs mt-auto" onClick={() => onGenerate(template.id)}>
        <Plus size={14} /> 生成文书
      </button>
    </div>
  )
}

export default function DocumentList() {
  const navigate = useNavigate()
  const { documents, templates, deleteDocument } = useDocumentStore()
  const getCase = useCaseStore((s) => s.getCase)
  const getClient = useClientStore((s) => s.getClient)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleGenerate = (templateId: string) => {
    navigate(`/documents/generate?templateId=${templateId}`)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteDocument(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">文书管理</h1>

      <div className="card">
        <h2 className="section-title mb-4">文书模板</h2>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onGenerate={handleGenerate} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">已生成文书</h2>
        {documents.length === 0 ? (
          <div className="text-center py-12 text-ivory-400 text-sm">暂无已生成的文书</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ivory-200">
                <th className="text-left py-3 text-navy-400 font-medium">文书名称</th>
                <th className="text-left py-3 text-navy-400 font-medium">关联案件</th>
                <th className="text-left py-3 text-navy-400 font-medium">模板类型</th>
                <th className="text-left py-3 text-navy-400 font-medium">创建日期</th>
                <th className="text-left py-3 text-navy-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const caseData = getCase(doc.caseId)
                const client = caseData ? getClient(caseData.clientId) : undefined
                const template = templates.find((t) => t.id === doc.templateId)
                return (
                  <tr key={doc.id} className="border-b border-ivory-100 hover:bg-ivory-50 transition-colors">
                    <td className="py-3 font-medium text-navy-500">{doc.title}</td>
                    <td className="py-3 text-navy-300">
                      {caseData ? `${caseData.caseNumber} - ${caseData.cause}` : '-'}
                      {client && <span className="text-ivory-400 ml-2">({client.name})</span>}
                    </td>
                    <td className="py-3">
                      <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-xs">{template?.name || '-'}</span>
                    </td>
                    <td className="py-3 text-navy-300">{doc.createdAt}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="btn-secondary text-xs" onClick={() => navigate(`/documents/edit/${doc.id}`)}>
                          <Edit size={14} /> 编辑
                        </button>
                        <button
                          className="border border-red-200 text-red-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-1"
                          onClick={() => setDeleteId(doc.id)}
                        >
                          <Trash2 size={14} /> 删除
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
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除文书"
        message="确定要删除该文书吗？此操作不可撤销。"
      />
    </div>
  )
}
