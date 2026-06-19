import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Plus, Search } from 'lucide-react'
import { useDocumentStore } from '@/stores/documentStore'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'
import type { DocumentTemplate } from '@/types'

function TemplateSelectCard({ template, onSelect }: { template: DocumentTemplate; onSelect: (id: string) => void }) {
  return (
    <div className="border border-ivory-200 rounded-lg p-4 flex flex-col items-center gap-3 hover:border-gold-300 hover:shadow-sm transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
        <FileText size={24} className="text-gold-500" />
      </div>
      <span className="font-medium text-sm text-navy-500">{template.name}</span>
      <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-xs">{template.category}</span>
      <button className="btn-primary text-xs mt-auto" onClick={() => onSelect(template.id)}>
        <Plus size={14} /> 选择此模板
      </button>
    </div>
  )
}

export default function DocumentGenerate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlTemplateId = searchParams.get('templateId')

  const { templates, generateDocument } = useDocumentStore()
  const cases = useCaseStore((s) => s.cases)
  const getClient = useClientStore((s) => s.getClient)
  const addToast = useToastStore((s) => s.addToast)

  const [selectedTemplateId, setSelectedTemplateId] = useState(urlTemplateId || '')
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  const filteredCases = cases.filter(
    (c) =>
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cause.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGenerate = () => {
    if (!selectedTemplateId || !selectedCaseId) return
    const newDoc = generateDocument(selectedTemplateId, selectedCaseId)
    addToast('文书生成成功', 'success')
    navigate(`/documents/edit/${newDoc.id}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">生成文书</h1>

      {!selectedTemplateId ? (
        <div className="card">
          <h2 className="section-title mb-4">选择文书模板</h2>
          <div className="grid grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateSelectCard key={template.id} template={template} onSelect={setSelectedTemplateId} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card">
              <h2 className="section-title mb-4">已选模板</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center">
                  <FileText size={20} className="text-gold-500" />
                </div>
                <div>
                  <div className="font-medium text-sm text-navy-500">{selectedTemplate?.name}</div>
                  <span className="badge bg-gold-50 text-gold-700 border border-gold-200 text-xs">{selectedTemplate?.category}</span>
                </div>
              </div>
              <button className="btn-secondary text-sm" onClick={() => setSelectedTemplateId('')}>
                重新选择模板
              </button>
            </div>

            <div className="card">
              <h2 className="section-title mb-4">选择关联案件</h2>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-400" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="搜索案件编号或案由..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-6 text-ivory-400 text-sm">未找到匹配的案件</div>
                ) : (
                  filteredCases.map((c) => {
                    const client = getClient(c.clientId)
                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCaseId === c.id
                            ? 'border-navy-500 bg-navy-50 ring-1 ring-navy-200'
                            : 'border-ivory-200 hover:border-navy-200'
                        }`}
                        onClick={() => setSelectedCaseId(c.id)}
                      >
                        <div className="font-medium text-sm text-navy-500">{c.caseNumber}</div>
                        <div className="text-xs text-navy-300 mt-0.5">{c.cause}</div>
                        <div className="text-xs text-ivory-400 mt-0.5">客户：{client?.name || '-'}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <button
              className={`btn-primary w-full justify-center ${!selectedCaseId ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selectedCaseId}
              onClick={handleGenerate}
            >
              <Plus size={16} /> 生成文书
            </button>
          </div>

          <div className="card">
            <h2 className="section-title mb-4">模板预览</h2>
            <div
              className="prose prose-sm max-w-none text-navy-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedTemplate?.content || '' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
