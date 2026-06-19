import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, Eye } from 'lucide-react'
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { useDocumentStore } from '@/stores/documentStore'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { documents, templates, updateDocument } = useDocumentStore()
  const getCase = useCaseStore((s) => s.getCase)
  const getClient = useClientStore((s) => s.getClient)
  const addToast = useToastStore((s) => s.addToast)

  const document = documents.find((d) => d.id === id)
  const [content, setContent] = useState(document?.content || '')

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ivory-400 text-lg">文书不存在</p>
      </div>
    )
  }

  const template = templates.find((t) => t.id === document.templateId)
  const caseData = getCase(document.caseId)
  const client = caseData ? getClient(caseData.clientId) : undefined

  const handleSave = () => {
    updateDocument(document.id, { content })
    addToast('保存成功')
  }

  const handleDownload = () => {
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '')
    const paragraphs = stripHtml(content).split('\n').filter(Boolean)
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: paragraphs.map((p) => new Paragraph({ children: [new TextRun(p)] })),
        },
      ],
    })
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${document.title}.docx`)
      addToast('下载成功')
    })
  }

  const variables = template?.content.match(/\{\{(\w+)\}\}/g) || []

  const variableLabels: Record<string, string> = {
    '{{clientName}}': client?.name || '-',
    '{{opposingParty}}': caseData?.opposingParty || '-',
    '{{cause}}': caseData?.cause || '-',
    '{{caseNumber}}': caseData?.caseNumber || '-',
    '{{filingDate}}': caseData?.filingDate || '-',
    '{{courtName}}': '',
    '{{lawyerName}}': '',
    '{{lawFirmName}}': '',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => navigate('/documents')}>
            <ArrowLeft size={16} /> 返回
          </button>
          <h1 className="page-title">{document.title}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} /> 保存
          </button>
          <button className="btn-gold" onClick={handleDownload}>
            <Download size={16} /> 下载Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h3 className="section-title mb-3">文书信息</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="label-text">模板</span>
                <span className="text-navy-500">{template?.name || '-'}</span>
              </div>
              <div>
                <span className="label-text">案件</span>
                <span className="text-navy-500">{caseData ? `${caseData.caseNumber} - ${caseData.cause}` : '-'}</span>
              </div>
              <div>
                <span className="label-text">客户</span>
                <span className="text-navy-500">{client?.name || '-'}</span>
              </div>
              <div>
                <span className="label-text">对方当事人</span>
                <span className="text-navy-500">{caseData?.opposingParty || '-'}</span>
              </div>
              <div>
                <span className="label-text">创建日期</span>
                <span className="text-navy-500">{document.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-3">模板变量</h3>
            {variables.length === 0 ? (
              <div className="text-ivory-400 text-sm">无模板变量</div>
            ) : (
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-gold-500" />
                      <span className="text-navy-300 font-mono text-xs">{v}</span>
                    </div>
                    <span className="text-navy-500 text-xs">
                      {variableLabels[v] || '需手动填写'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">文书内容</h3>
              <span className="text-xs text-ivory-400">支持HTML格式编辑</span>
            </div>
            <div className="border border-ivory-200 rounded-lg overflow-hidden">
              <div className="bg-ivory-50 px-3 py-1.5 border-b border-ivory-200 text-xs text-ivory-400 flex gap-4">
                <span>&lt;h2&gt; 标题</span>
                <span>&lt;p&gt; 段落</span>
                <span>&lt;strong&gt; 加粗</span>
                <span>&lt;br/&gt; 换行</span>
              </div>
              <textarea
                className="w-full min-h-[520px] p-4 font-mono text-sm text-navy-500 bg-white resize-y focus:outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
