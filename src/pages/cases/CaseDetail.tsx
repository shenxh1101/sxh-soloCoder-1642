import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Save, Trash2, PlusCircle, Clock, ChevronDown, Circle, CheckCircle, FileText, Calendar } from 'lucide-react'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_STATUSES, DEFAULT_STAGES } from '@/types'
import type { Case, Stage } from '@/types'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

const STATUS_BADGE: Record<Case['status'], string> = {
  '进行中': 'badge-active',
  '已结案': 'badge-closed',
  '已归档': 'badge-archived',
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCase, updateCase, deleteCase, addStage, updateStage, deleteStage } = useCaseStore()

  const caseData = id ? getCase(id) : undefined

  const { clients, lawyers, getClient } = useClientStore()
  const { documents } = useDocumentStore()
  const { schedules } = useScheduleStore()
  const addToast = useToastStore((s) => s.addToast)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Case>>({})
  const [statusDropdown, setStatusDropdown] = useState(false)
  const [stageModal, setStageModal] = useState(false)
  const [editStageModal, setEditStageModal] = useState<Stage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteStageTarget, setDeleteStageTarget] = useState<Stage | null>(null)
  const [stageForm, setStageForm] = useState({ name: '', startTime: '', notes: '' })

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-ivory-400 mb-4">案件不存在</p>
        <button className="btn-secondary" onClick={() => navigate('/cases')}>
          <ArrowLeft size={16} /> 返回列表
        </button>
      </div>
    )
  }

  const lawyer = lawyers.find((l) => l.id === caseData.lawyerId)
  const client = getClient(caseData.clientId)
  const caseDocs = documents.filter((d) => d.caseId === caseData.id)
  const caseSchedules = schedules.filter((s) => s.caseId === caseData.id)
  const currentStageOrder = caseData.stages.find((s) => s.name === caseData.currentStage)?.order ?? 0

  const startEdit = () => {
    setEditForm({
      cause: caseData.cause,
      filingDate: caseData.filingDate,
      opposingParty: caseData.opposingParty,
      lawyerId: caseData.lawyerId,
      clientId: caseData.clientId,
    })
    setEditing(true)
  }

  const saveEdit = () => {
    updateCase(caseData.id, editForm)
    setEditing(false)
    addToast('案件信息已更新', 'success')
  }

  const handleDeleteCase = () => {
    deleteCase(caseData.id)
    addToast('案件已删除', 'success')
    navigate('/cases')
  }

  const openStageModal = () => {
    setStageForm({ name: '', startTime: '', notes: '' })
    setStageModal(true)
  }

  const openEditStageModal = (stage: Stage) => {
    setStageForm({ name: stage.name, startTime: stage.startTime, notes: stage.notes })
    setEditStageModal(stage)
  }

  const handleAddStage = () => {
    if (!stageForm.name || !stageForm.startTime) return
    const newStage: Stage = {
      id: Date.now().toString(),
      name: stageForm.name,
      startTime: stageForm.startTime,
      notes: stageForm.notes,
      order: caseData.stages.length + 1,
    }
    addStage(caseData.id, newStage)
    setStageModal(false)
    addToast('阶段已添加', 'success')
  }

  const handleUpdateStage = () => {
    if (!editStageModal || !stageForm.name || !stageForm.startTime) return
    updateStage(caseData.id, editStageModal.id, {
      name: stageForm.name,
      startTime: stageForm.startTime,
      notes: stageForm.notes,
    })
    setEditStageModal(null)
    addToast('阶段已更新', 'success')
  }

  const handleDeleteStage = () => {
    if (!deleteStageTarget) return
    deleteStage(caseData.id, deleteStageTarget.id)
    setDeleteStageTarget(null)
    addToast('阶段已删除', 'success')
  }

  const handleStatusChange = (status: Case['status']) => {
    updateCase(caseData.id, { status })
    setStatusDropdown(false)
    addToast('案件状态已更新', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="btn-secondary !px-2 !py-1" onClick={() => navigate('/cases')}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="page-title">{caseData.caseNumber}</h1>
          <span className={STATUS_BADGE[caseData.status]}>{caseData.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="btn-secondary" onClick={() => setStatusDropdown(!statusDropdown)}>
              状态 <ChevronDown size={14} />
            </button>
            {statusDropdown && (
              <div className="absolute right-0 mt-1 bg-white border border-ivory-200 rounded shadow-lg z-10 min-w-[120px]">
                {CASE_STATUSES.map((s) => (
                  <button
                    key={s}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-ivory-50 transition-colors"
                    onClick={() => handleStatusChange(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn-secondary !text-red-500 !border-red-200 hover:!bg-red-50" onClick={() => setDeleteConfirm(true)}>
            <Trash2 size={16} /> 删除
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">基本信息</h2>
          {!editing ? (
            <button className="btn-secondary !px-2 !py-1" onClick={startEdit}>
              <Edit size={14} /> 编辑
            </button>
          ) : (
            <button className="btn-primary !px-2 !py-1" onClick={saveEdit}>
              <Save size={14} /> 保存
            </button>
          )}
        </div>
        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">案由</label>
              <input className="input-field" value={editForm.cause ?? ''} onChange={(e) => setEditForm({ ...editForm, cause: e.target.value })} />
            </div>
            <div>
              <label className="label-text">立案日期</label>
              <input type="date" className="input-field" value={editForm.filingDate ?? ''} onChange={(e) => setEditForm({ ...editForm, filingDate: e.target.value })} />
            </div>
            <div>
              <label className="label-text">对方当事人</label>
              <input className="input-field" value={editForm.opposingParty ?? ''} onChange={(e) => setEditForm({ ...editForm, opposingParty: e.target.value })} />
            </div>
            <div>
              <label className="label-text">承办律师</label>
              <select className="input-field" value={editForm.lawyerId ?? ''} onChange={(e) => setEditForm({ ...editForm, lawyerId: e.target.value })}>
                {lawyers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">客户名称</label>
              <select className="input-field" value={editForm.clientId ?? ''} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div><span className="label-text">案由</span><p className="text-sm text-navy-500">{caseData.cause}</p></div>
            <div><span className="label-text">立案日期</span><p className="text-sm text-navy-500">{caseData.filingDate}</p></div>
            <div><span className="label-text">对方当事人</span><p className="text-sm text-navy-500">{caseData.opposingParty}</p></div>
            <div><span className="label-text">承办律师</span><p className="text-sm text-navy-500">{lawyer?.name ?? '-'}</p></div>
            <div><span className="label-text">客户名称</span><p className="text-sm text-navy-500">{client?.name ?? '-'}</p></div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">案件进度</h2>
          <button className="btn-secondary !px-2 !py-1" onClick={openStageModal}>
            <PlusCircle size={14} /> 添加阶段
          </button>
        </div>
        <div className="relative ml-4">
          {caseData.stages.length === 0 ? (
            <p className="text-ivory-400 text-sm">暂无阶段记录</p>
          ) : (
            caseData.stages.map((stage, idx) => {
              const isActive = stage.order <= currentStageOrder
              const isLast = idx === caseData.stages.length - 1
              return (
                <div key={stage.id} className="relative flex gap-4 pb-6">
                  {!isLast && <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-ivory-300" />}
                  <div className="mt-1 flex-shrink-0">
                    {isActive ? (
                      <CheckCircle size={16} className="text-gold-500 fill-gold-200" />
                    ) : (
                      <Circle size={16} className="text-ivory-300" />
                    )}
                  </div>
                  <div className="flex-1 bg-ivory-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isActive ? 'text-navy-500' : 'text-ivory-400'}`}>
                        {stage.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="text-ivory-400 hover:text-navy-500 transition-colors" onClick={() => openEditStageModal(stage)}>
                          <Edit size={12} />
                        </button>
                        <button className="text-ivory-400 hover:text-red-500 transition-colors" onClick={() => setDeleteStageTarget(stage)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-ivory-400">
                      <Clock size={12} /> {stage.startTime}
                    </div>
                    {stage.notes && <p className="text-xs text-ivory-500 mt-1">{stage.notes}</p>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">关联文书</h2>
        {caseDocs.length === 0 ? (
          <p className="text-ivory-400 text-sm">暂无关联文书</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {caseDocs.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 bg-ivory-50 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                <FileText size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-navy-500">{doc.title}</p>
                  <p className="text-xs text-ivory-400 mt-0.5">{doc.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">关联日程</h2>
        {caseSchedules.length === 0 ? (
          <p className="text-ivory-400 text-sm">暂无关联日程</p>
        ) : (
          <div className="space-y-2">
            {caseSchedules.map((sch) => (
              <div key={sch.id} className="flex items-center gap-3 p-3 bg-ivory-50 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
                <Calendar size={16} className="text-navy-400 flex-shrink-0" />
                <span className="badge bg-navy-50 text-navy-500 border border-navy-200">{sch.type}</span>
                <span className="text-sm text-navy-500">{sch.dateTime}</span>
                <span className="text-xs text-ivory-400">{sch.location}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={stageModal} onClose={() => setStageModal(false)} title="添加阶段">
        <div className="space-y-4">
          <div>
            <label className="label-text">阶段名称</label>
            <input className="input-field" placeholder="输入阶段名称" value={stageForm.name} onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })} list="default-stages" />
            <datalist id="default-stages">
              {DEFAULT_STAGES.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="label-text">开始时间</label>
            <input type="date" className="input-field" value={stageForm.startTime} onChange={(e) => setStageForm({ ...stageForm, startTime: e.target.value })} />
          </div>
          <div>
            <label className="label-text">备注</label>
            <textarea className="input-field min-h-[80px]" value={stageForm.notes} onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setStageModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleAddStage}>确认添加</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editStageModal} onClose={() => setEditStageModal(null)} title="编辑阶段">
        <div className="space-y-4">
          <div>
            <label className="label-text">阶段名称</label>
            <input className="input-field" value={stageForm.name} onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">开始时间</label>
            <input type="date" className="input-field" value={stageForm.startTime} onChange={(e) => setStageForm({ ...stageForm, startTime: e.target.value })} />
          </div>
          <div>
            <label className="label-text">备注</label>
            <textarea className="input-field min-h-[80px]" value={stageForm.notes} onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setEditStageModal(null)}>取消</button>
            <button className="btn-primary" onClick={handleUpdateStage}>保存</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} onConfirm={handleDeleteCase} title="确认删除案件" message={`确定要删除案件「${caseData.caseNumber}」吗？此操作不可撤销。`} />

      <ConfirmDialog isOpen={!!deleteStageTarget} onClose={() => setDeleteStageTarget(null)} onConfirm={handleDeleteStage} title="确认删除阶段" message={`确定要删除阶段「${deleteStageTarget?.name}」吗？`} />
    </div>
  )
}
