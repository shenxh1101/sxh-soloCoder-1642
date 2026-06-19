import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Download, FileText, FolderOpen, Scale } from 'lucide-react'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useDocumentStore } from '@/stores/documentStore'
import { addToast } from '@/stores/toastStore'
import { VERDICT_RESULTS } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  '进行中': '#2563EB',
  '已结案': '#16A34A',
  '已归档': '#9C9285',
}

const VERDICT_COLORS: Record<string, string> = {
  '胜诉': '#16A34A',
  '败诉': '#DC2626',
  '调解': '#C9A96E',
  '撤诉': '#9CA3AF',
  '其他': '#576A8D',
}

const STATUS_ICONS: Record<string, typeof Scale> = {
  '进行中': Scale,
  '已结案': FileText,
  '已归档': FolderOpen,
}

export default function StatisticsPage() {
  const { cases, getCase } = useCaseStore()
  const { clients } = useClientStore()
  const { documents } = useDocumentStore()

  const caseTypeData = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach((c) => {
      const client = clients.find((cl) => cl.id === c.clientId)
      const type = client?.caseType || '其他'
      map[type] = (map[type] || 0) + 1
    })
    return Object.entries(map).map(([name, count]) => ({ name, count }))
  }, [cases, clients])

  const statusData = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach((c) => {
      map[c.status] = (map[c.status] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [cases])

  const verdictData = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach((c) => {
      if (c.review?.verdictResult) {
        const result = VERDICT_RESULTS.includes(c.review.verdictResult) ? c.review.verdictResult : '其他'
        map[result] = (map[result] || 0) + 1
      }
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [cases])

  const summaryCards = useMemo(() => {
    return Object.entries(STATUS_COLORS).map(([status, color]) => {
      const count = cases.filter((c) => c.status === status).length
      return { status, count, color }
    })
  }, [cases])

  const exportCaseSummary = () => {
    const BOM = '\uFEFF'
    const headers = ['案号', '案由', '客户', '客户联系方式', '对方当事人', '承办律师', '律师联系方式', '立案日期', '当前阶段', '状态', '裁判结果', '回款金额', '执行事项', '归档备注']
    const rows = cases.map((c) => {
      const client = clients.find((cl) => cl.id === c.clientId)
      const lawyer = useClientStore.getState().lawyers.find((l) => l.id === c.lawyerId)
      return [
        c.caseNumber,
        c.cause,
        client?.name || '',
        client?.contact || '',
        c.opposingParty,
        lawyer?.name || '',
        lawyer?.phone || '',
        c.filingDate,
        c.currentStage,
        c.status,
        c.review?.verdictResult || '',
        c.review?.recoveredAmount || '',
        c.review?.executionMatters || '',
        c.review?.archiveNotes || '',
      ]
    })
    const csvContent = BOM + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `案件汇总表_${dayjs().format('YYYYMMDD')}.csv`)
    addToast('案件汇总表导出成功', 'success')
  }

  const exportDocArchive = () => {
    const BOM = '\uFEFF'
    const headers = ['文书名称', '关联案件', '模板类型', '创建日期']
    const { templates } = useDocumentStore.getState()
    const rows = documents.map((d) => {
      const c = getCase(d.caseId)
      const tpl = templates.find((t) => t.id === d.templateId)
      return [d.title, c?.caseNumber || '', tpl?.name || '', d.createdAt]
    })
    const csvContent = BOM + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `文书归档清单_${dayjs().format('YYYYMMDD')}.csv`)
    addToast('文书归档清单导出成功', 'success')
  }

  const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name} ${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">数据统计</h1>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={exportCaseSummary}>
            <Download size={14} />导出案件汇总表
          </button>
          <button className="btn-secondary" onClick={exportDocArchive}>
            <Download size={14} />导出文书归档清单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map(({ status, count, color }) => {
          const Icon = STATUS_ICONS[status] || Scale
          return (
            <div key={status} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-500">{count}</div>
                <div className="text-sm text-navy-300">{status}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title mb-4">案件类型统计</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={caseTypeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DE" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#576A8D' }} />
              <YAxis tick={{ fontSize: 12, fill: '#576A8D' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E3DE', borderRadius: '8px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {caseTypeData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? '#1B2A4A' : '#C9A96E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">案件状态分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={{ stroke: '#9C9285' }}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E3DE', borderRadius: '8px' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value: string) => <span className="text-sm text-navy-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">裁判结果统计</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verdictData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={{ stroke: '#9C9285' }}
              >
                {verdictData.map((entry) => (
                  <Cell key={entry.name} fill={VERDICT_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E3DE', borderRadius: '8px' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value: string) => <span className="text-sm text-navy-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
