import { useNavigate } from 'react-router-dom'
import { Briefcase, Clock, TrendingUp, Calendar, UserPlus, FolderPlus, FileText, ChevronRight } from 'lucide-react'
import { useCaseStore } from '@/stores/caseStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useClientStore } from '@/stores/clientStore'

const statusBadgeMap: Record<string, string> = {
  '进行中': 'badge-active',
  '已结案': 'badge-closed',
  '已归档': 'badge-archived',
}

const typeColorMap: Record<string, string> = {
  '开庭': 'bg-red-500',
  '会见': 'bg-blue-500',
  '其他': 'bg-gray-400',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { cases } = useCaseStore()
  const getUpcoming = useScheduleStore((s) => s.getUpcoming)
  const getLawyerName = useClientStore((s) => s.getLawyerName)

  const totalCases = cases.length
  const activeCases = cases.filter((c) => c.status === '进行中').length
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newThisMonth = cases.filter((c) => new Date(c.createdAt) >= thisMonthStart).length
  const upcoming = getUpcoming(7)
  const pendingSchedules = upcoming.length

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const statCards = [
    { label: '案件总数', value: totalCases, bg: 'bg-navy-500', valueColor: 'text-gold-400', icon: Briefcase },
    { label: '进行中', value: activeCases, bg: 'bg-blue-600', valueColor: 'text-white', icon: Clock },
    { label: '本月新增', value: newThisMonth, bg: 'bg-green-600', valueColor: 'text-white', icon: TrendingUp },
    { label: '待办日程', value: pendingSchedules, bg: 'bg-amber-600', valueColor: 'text-white', icon: Calendar },
  ]

  const quickActions = [
    { label: '新增客户', path: '/clients/new', icon: UserPlus },
    { label: '新增案件', path: '/cases/new', icon: FolderPlus },
    { label: '生成文书', path: '/documents', icon: FileText },
    { label: '查看日程', path: '/schedule', icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <h1 className="page-title">工作台</h1>

      <div className="grid grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-lg p-6 text-white relative overflow-hidden`}>
            <card.icon className="absolute top-4 right-4 w-10 h-10 opacity-20" />
            <div className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</div>
            <div className="text-sm opacity-80 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">快捷入口</h2>
        <div className="flex gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="btn-gold cursor-pointer"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">待办日程</h2>
        {upcoming.length === 0 ? (
          <p className="text-ivory-400 text-sm py-4">暂无待办日程</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-ivory-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/cases/${s.caseId}`)}
              >
                <div className={`w-1 h-10 rounded-full ${typeColorMap[s.type] ?? 'bg-gray-400'}`} />
                <span className="badge bg-ivory-100 text-navy-500 border border-ivory-300 text-xs shrink-0">
                  {s.type}
                </span>
                <span className="text-sm text-navy-500 shrink-0">{s.dateTime}</span>
                <span className="text-sm text-navy-300">{s.location}</span>
                <span className="text-sm text-navy-400 ml-auto truncate">{s.notes}</span>
                <ChevronRight className="w-4 h-4 text-ivory-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">近期案件</h2>
        <div className="space-y-2">
          {recentCases.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-ivory-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/cases/${c.id}`)}
            >
              <span className="text-sm font-medium text-navy-500 w-32 shrink-0">{c.caseNumber}</span>
              <span className="text-sm text-navy-400 flex-1 truncate">{c.cause}</span>
              <span className={statusBadgeMap[c.status] ?? 'badge'}>{c.status}</span>
              <span className="text-sm text-navy-300 w-20 text-center shrink-0">{c.currentStage}</span>
              <span className="text-sm text-navy-400 w-20 text-right shrink-0">{getLawyerName(c.lawyerId)}</span>
              <ChevronRight className="w-4 h-4 text-ivory-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
