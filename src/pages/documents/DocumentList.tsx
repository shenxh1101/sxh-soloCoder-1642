import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react'
import { useDocumentStore } from '@/stores/documentStore'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { addToast } from '@/stores/toastStore'
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
  const { documents, templates, deleteDocument, duplicateDocument } = useDocumentStore()
  const { cases, getCase } = useCaseStore()
  const getClient = useClientStore((s) => s.getClient)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [selectedCase, setSelectedCase] = useState<string>('all')

  const handleGenerate = (templateId: string) => {
    navigate(`/documents/generate?templateId=${templateId}`)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteDocument(deleteId)
      setDeleteId(null)
    }
  }

  const handleDuplicate = (docId: string) => {
    duplicateDocument(docId)
    addToast('已生成新版本', 'success')
  }

  const filteredDocuments = documents.filter((doc) => {
    const templateMatch = selectedTemplate === 'all' || doc.templateId === selectedTemplate
    const caseMatch = selectedCase === 'all' || doc.caseId === selectedCase
    return templateMatch && caseMatch
  })

  const templateOrder = ['t1', 't2', 't3']
  const groupedDocuments = templateOrder.reduce((acc, templateId) => {
    const docs = filteredDocuments.filter((d) => d.templateId === templateId)
    if (docs.length > 0) {
      acc.push({ templateId, docs })
    }
    return acc
  }, [] as { templateId: string; docs: typeof filteredDocuments }[])

  const renderTitleWithVersion = (title: string) => {
    return title.split(/(\[v\d+\])/).map((part, i) =>
      part.match(/\[v\d+\]/) ? (
        <span key={i} className="text-gold-500">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
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

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex rounded-lg border border-ivory-200 overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${selectedTemplate === 'all' ? 'bg-navy-500 text-white' : 'text-navy-400 hover:bg-ivory-50'}`}
              onClick={() => setSelectedTemplate('all')}
            >
              全部
            </button>
            {templates.map((t) => (
              <button
                key={t.id}
                className={`px-4 py-2 text-sm font-medium transition-colors ${selectedTemplate === t.id ? 'bg-navy-500 text-white' : 'text-navy-400 hover:bg-ivory-50'}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>

          <select
            className="px-4 py-2 border border-ivory-200 rounded-lg text-sm text-navy-500 bg-white focus:outline-none focus:border-navy-300"
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
          >
            <option value="all">全部案件</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.caseNumber} - {c.cause}</option>
            ))}
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-ivory-400 text-sm">暂无符合条件的文书</div>
        ) : (
          <div className="space-y-6">
            {groupedDocuments.map(({ templateId, docs }) => {
              const template = templates.find((t) => t.id === templateId)
              const sortedDocs = [...docs].sort((a, b) => {
                const va = a.title.match(/\[v(\d+)\]/)
                const vb = b.title.match(/\[v(\d+)\]/)
                if (!va && !vb) return a.createdAt.localeCompare(b.createdAt)
                if (!va) return -1
                if (!vb) return 1
                return parseInt(va[1]) - parseInt(vb[1])
              })
              return (
                <div key={templateId}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-sm font-medium">
                      {template?.name || '-'}
                    </span>
                    <span className="text-navy-400 text-sm">共 {docs.length} 份文书</span>
                  </div>
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
                      {sortedDocs.map((doc) => {
                        const caseData = getCase(doc.caseId)
                        const client = caseData ? getClient(caseData.clientId) : undefined
                        const docTemplate = templates.find((t) => t.id === doc.templateId)
                        return (
                          <tr key={doc.id} className="border-b border-ivory-100 hover:bg-ivory-50 transition-colors">
                            <td className="py-3 font-medium text-navy-500">{renderTitleWithVersion(doc.title)}</td>
                            <td className="py-3 text-navy-300">
                              {caseData ? `${caseData.caseNumber} - ${caseData.cause}` : '-'}
                              {client && <span className="text-ivory-400 ml-2">({client.name})</span>}
                            </td>
                            <td className="py-3">
                              <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-xs">{docTemplate?.name || '-'}</span>
                            </td>
                            <td className="py-3 text-navy-300">{doc.createdAt}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button className="btn-secondary text-xs" onClick={() => handleDuplicate(doc.id)}>
                                  <Copy size={14} /> 复制新版本
                                </button>
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
                </div>
              )
            })}
          </div>
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
