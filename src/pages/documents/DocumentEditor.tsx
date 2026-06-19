import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, Eye, Edit3 } from 'lucide-react'
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import { useDocumentStore } from '@/stores/documentStore'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useToastStore } from '@/stores/toastStore'

function htmlToDocxParagraphs(html: string): Paragraph[] {
  const result: Paragraph[] = []
  const tagPattern = /<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let match
  while ((match = tagPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = match[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')
    const isHeading = tag.startsWith('h')
    inner.split('\n').forEach((line) => {
      const text = line.trim()
      if (!text) return
      if (isHeading) {
        result.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text, bold: true, size: 32, font: 'SimSun' })],
            spacing: { after: 200 },
            alignment: 'center',
          })
        )
      } else {
        result.push(
          new Paragraph({
            children: [new TextRun({ text, size: 24, font: 'SimSun' })],
            spacing: { after: 200 },
          })
        )
      }
    })
  }
  if (result.length === 0) {
    const fallback = html.replace(/<[^>]*>/g, '').split('\n').filter(Boolean)
    fallback.forEach((line) => {
      result.push(
        new Paragraph({
          children: [new TextRun({ text: line.trim(), size: 24, font: 'SimSun' })],
          spacing: { after: 200 },
        })
      )
    })
  }
  return result.length > 0 ? result : [new Paragraph({ children: [new TextRun('')] })]
}

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { documents, templates, updateDocument } = useDocumentStore()
  const getCase = useCaseStore((s) => s.getCase)
  const getClient = useClientStore((s) => s.getClient)
  const lawyers = useClientStore((s) => s.lawyers)
  const addToast = useToastStore((s) => s.addToast)

  const document = documents.find((d) => d.id === id)
  const [content, setContent] = useState(document?.content || '')
  const [preview, setPreview] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (document?.content) {
      setContent(document.content)
      if (editorRef.current && !preview) {
        editorRef.current.innerHTML = document.content
      }
    }
  }, [document?.content])

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
  const lawyer = caseData ? lawyers.find((l) => l.id === caseData.lawyerId) : undefined

  const handleSave = () => {
    const currentContent = editorRef.current?.innerHTML || content
    updateDocument(document.id, { content: currentContent })
    addToast('保存成功')
  }

  const handleDownload = () => {
    const currentContent = editorRef.current?.innerHTML || content
    const paragraphs = htmlToDocxParagraphs(currentContent)
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${document.title}.docx`)
      addToast('下载成功')
    })
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML)
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
          <button
            className="btn-secondary"
            onClick={() => setPreview(!preview)}
          >
            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
            {preview ? '编辑' : '预览'}
          </button>
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
                <span className="label-text">案号</span>
                <span className="text-navy-500">{caseData?.caseNumber || '-'}</span>
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
                <span className="label-text">承办律师</span>
                <span className="text-navy-500">{lawyer?.name || '-'}</span>
              </div>
              <div>
                <span className="label-text">立案日期</span>
                <span className="text-navy-500">{caseData?.filingDate || '-'}</span>
              </div>
              <div>
                <span className="label-text">创建日期</span>
                <span className="text-navy-500">{document.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">文书内容</h3>
              <span className="text-xs text-ivory-400">
                {preview ? '预览模式' : '编辑模式 - 直接编辑格式化文本'}
              </span>
            </div>
            <div className="border border-ivory-200 rounded-lg overflow-hidden">
              {preview ? (
                <div
                  className="min-h-[520px] p-6 text-sm leading-8 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[520px] p-6 text-sm leading-8 outline-none prose prose-sm max-w-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-1"
                  dangerouslySetInnerHTML={{ __html: content }}
                  onInput={handleInput}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
