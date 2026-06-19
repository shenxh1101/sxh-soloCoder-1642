import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { Calendar, Plus, Edit, Trash2, ChevronLeft, ChevronRight, List, Grid, Clock, MapPin } from 'lucide-react'
import type { ScheduleItem } from '@/types'
import { SCHEDULE_TYPES } from '@/types'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCaseStore } from '@/stores/caseStore'
import { addToast } from '@/stores/toastStore'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

const TYPE_COLORS: Record<ScheduleItem['type'], string> = {
  '开庭': 'bg-red-500',
  '会见': 'bg-blue-500',
  '其他': 'bg-gray-400',
}

const TYPE_BADGE: Record<ScheduleItem['type'], string> = {
  '开庭': 'bg-red-50 text-red-700 border border-red-200',
  '会见': 'bg-blue-50 text-blue-700 border border-blue-200',
  '其他': 'bg-gray-50 text-gray-600 border border-gray-200',
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

const emptyForm = (): Omit<ScheduleItem, 'id'> => ({
  caseId: '', type: '开庭', dateTime: '', location: '', notes: '', reminded: false,
})

export default function SchedulePage() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, checkReminders } = useScheduleStore()
  const { cases, getCase } = useCaseStore()

  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('全部')
  const [caseFilter, setCaseFilter] = useState<string>('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [form, setForm] = useState(emptyForm())

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string>('')

  useEffect(() => {
    const reminders = checkReminders()
    reminders.forEach((item) => {
      const c = getCase(item.caseId)
      addToast(`日程提醒：${item.type} - ${c?.cause || '未知案件'} (${dayjs(item.dateTime).format('HH:mm')})`, 'warning')
    })
  }, [])

  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month')
    const startDay = start.day() === 0 ? 6 : start.day() - 1
    const days: dayjs.Dayjs[] = []
    for (let i = -startDay; i < 42 - startDay; i++) {
      days.push(start.add(i, 'day'))
    }
    return days
  }, [currentMonth])

  const schedulesForDate = (date: string) =>
    schedules.filter((s) => dayjs(s.dateTime).format('YYYY-MM-DD') === date)

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (typeFilter !== '全部' && s.type !== typeFilter) return false
      if (caseFilter && s.caseId !== caseFilter) return false
      return true
    })
  }, [schedules, typeFilter, caseFilter])

  const openAdd = () => {
    setEditingItem(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setForm({
      caseId: item.caseId,
      type: item.type,
      dateTime: item.dateTime,
      location: item.location,
      notes: item.notes,
      reminded: item.reminded,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.caseId || !form.dateTime) {
      addToast('请填写必填项', 'error')
      return
    }
    if (editingItem) {
      updateSchedule(editingItem.id, form)
      addToast('日程已更新', 'success')
    } else {
      addSchedule({ ...form, reminded: false })
      addToast('日程已添加', 'success')
    }
    setModalOpen(false)
  }

  const handleDelete = () => {
    deleteSchedule(deleteId)
    addToast('日程已删除', 'success')
  }

  const renderCalendar = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-secondary" onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-lg font-semibold text-navy-500">{currentMonth.format('YYYY年MM月')}</span>
        <button className="btn-secondary" onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-ivory-200 rounded overflow-hidden">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-ivory-100 text-center py-2 text-xs font-medium text-navy-300">
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isCurrentMonth = day.month() === currentMonth.month()
          const isToday = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
          const isSelected = dateStr === selectedDate
          const daySchedules = schedulesForDate(dateStr)
          return (
            <div
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={`bg-white p-1.5 min-h-[72px] cursor-pointer transition-colors hover:bg-ivory-50
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isSelected ? 'ring-2 ring-gold-500' : ''}
              `}
            >
              <div className={`text-sm mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? 'bg-gold-500 text-navy-800 font-bold' : 'text-navy-400'}`}
              >
                {day.date()}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {daySchedules.slice(0, 3).map((s) => (
                  <span key={s.id} className={`w-2 h-2 rounded-full ${TYPE_COLORS[s.type]}`} />
                ))}
                {daySchedules.length > 3 && (
                  <span className="text-[10px] text-navy-300">+{daySchedules.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderDayPanel = () => {
    if (!selectedDate) return null
    const items = schedulesForDate(selectedDate)
    return (
      <div className="card mt-4">
        <h3 className="section-title mb-3">{dayjs(selectedDate).format('MM月DD日')} 日程</h3>
        {items.length === 0 ? (
          <p className="text-sm text-ivory-400">当日暂无日程</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const c = getCase(item.caseId)
              return (
                <div key={item.id} className="flex items-start justify-between p-3 rounded bg-ivory-50">
                  <div>
                    <span className={`badge ${TYPE_BADGE[item.type]} mr-2`}>{item.type}</span>
                    <span className="text-sm text-navy-400">{c?.cause || '-'}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ivory-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{dayjs(item.dateTime).format('HH:mm')}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{item.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-navy-300 hover:text-gold-500" onClick={() => openEdit(item)}>
                      <Edit size={14} />
                    </button>
                    <button className="p-1 text-navy-300 hover:text-red-500" onClick={() => { setDeleteId(item.id); setConfirmOpen(true) }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderList = () => (
    <div className="card">
      <div className="flex gap-3 mb-4">
        <select className="input-field w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="全部">全部类型</option>
          {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input-field w-auto" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
          <option value="">全部案件</option>
          {cases.map((c) => <option key={c.id} value={c.id}>{c.caseNumber} - {c.cause}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ivory-200">
              <th className="text-left py-2 px-3 text-navy-300 font-medium">日程类型</th>
              <th className="text-left py-2 px-3 text-navy-300 font-medium">关联案件</th>
              <th className="text-left py-2 px-3 text-navy-300 font-medium">日期时间</th>
              <th className="text-left py-2 px-3 text-navy-300 font-medium">地点</th>
              <th className="text-left py-2 px-3 text-navy-300 font-medium">备注</th>
              <th className="text-left py-2 px-3 text-navy-300 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((item) => {
              const c = getCase(item.caseId)
              return (
                <tr key={item.id} className="border-b border-ivory-100 hover:bg-ivory-50">
                  <td className="py-2 px-3"><span className={`badge ${TYPE_BADGE[item.type]}`}>{item.type}</span></td>
                  <td className="py-2 px-3 text-navy-400">{c?.cause || '-'}</td>
                  <td className="py-2 px-3 text-navy-400">{dayjs(item.dateTime).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="py-2 px-3 text-navy-400">{item.location}</td>
                  <td className="py-2 px-3 text-ivory-400 max-w-[200px] truncate">{item.notes}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <button className="p-1 text-navy-300 hover:text-gold-500" onClick={() => openEdit(item)}>
                        <Edit size={14} />
                      </button>
                      <button className="p-1 text-navy-300 hover:text-red-500" onClick={() => { setDeleteId(item.id); setConfirmOpen(true) }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderModal = () => (
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? '编辑日程' : '新增日程'}>
      <div className="space-y-4">
        <div>
          <label className="label-text">关联案件</label>
          <select className="input-field" value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}>
            <option value="">请选择案件</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.caseNumber} - {c.cause}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">日程类型</label>
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ScheduleItem['type'] })}>
            {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">日期时间</label>
          <input type="datetime-local" className="input-field" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} />
        </div>
        <div>
          <label className="label-text">地点</label>
          <input type="text" className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label className="label-text">备注</label>
          <textarea className="input-field" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>
            <Plus size={14} />{editingItem ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </Modal>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">日程管理</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded overflow-hidden border border-ivory-300">
            <button
              className={`px-3 py-1.5 text-sm ${view === 'calendar' ? 'bg-navy-500 text-white' : 'bg-white text-navy-400'}`}
              onClick={() => setView('calendar')}
            >
              <Grid size={14} className="inline mr-1" />日历
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-navy-500 text-white' : 'bg-white text-navy-400'}`}
              onClick={() => setView('list')}
            >
              <List size={14} className="inline mr-1" />列表
            </button>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} />新增日程
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <>
          {renderCalendar()}
          {renderDayPanel()}
        </>
      ) : (
        renderList()
      )}

      {renderModal()}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="删除日程"
        message="确定要删除该日程吗？此操作不可撤销。"
      />
    </div>
  )
}
