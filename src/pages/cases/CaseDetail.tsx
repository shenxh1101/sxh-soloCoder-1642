import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Save, Trash2, PlusCircle, Clock, ChevronDown, Circle, CheckCircle, FileText, Calendar, FilePlus, ArrowUp, ArrowDown, BookOpen, AlertTriangle, DollarSign, ClipboardCheck } from 'lucide-react'
import { useCaseStore } from '@/stores/caseStore'
import { useClientStore } from '@/stores/clientStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useToastStore } from '@/stores/toastStore'
import { CASE_STATUSES, DEFAULT_STAGES, VERDICT_RESULTS } from '@/types'
import type { Case, Stage, ExecutionRecord } from '@/types'
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
  const { getCase, updateCase, deleteCase, addStage, updateStage, deleteStage, setReview, addExecutionRecord, removeExecutionRecord, updateExecutionAmounts, toggleArchiveItem } = useCaseStore()

  const caseData = id ? getCase(id) : undefined

  const { clients, lawyers, getClient } = useClientStore()
  const { documents, generateDocument } = useDocumentStore()
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
  const [editingReview, setEditingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    verdictResult: '',
    recoveredAmount: '',
    executionMatters: '',
    archiveNotes: '',
  })
  const [execModal, setExecModal] = useState(false)
  const [execForm, setExecForm] = useState({ date: '', description: '', amount: '', type: '回款' as ExecutionRecord['type'] })
  const [editingExecAmounts, setEditingExecAmounts] = useState(false)
  const [execAmountsForm, setExecAmountsForm] = useState({ totalAmount: '', receivedAmount: '' })

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
  const uncheckedCount = (caseData.archiveChecklist || []).filter(i => !i.checked).length

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

  const startEditReview = () => {
    setReviewForm({
      verdictResult: caseData.review?.verdictResult ?? '',
      recoveredAmount: caseData.review?.recoveredAmount ?? '',
      executionMatters: caseData.review?.executionMatters ?? '',
      archiveNotes: caseData.review?.archiveNotes ?? '',
    })
    setEditingReview(true)
  }

  const saveEditReview = () => {
    setReview(caseData.id, reviewForm)
    setEditingReview(false)
    addToast('办案复盘已更新', 'success')
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
    updateCase(caseData.id, { currentStage: newStage.name })
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
    if (editStageModal.name === caseData.currentStage) {
      updateCase(caseData.id, { currentStage: stageForm.name })
    }
    setEditStageModal(null)
    addToast('阶段已更新', 'success')
  }

  const handleDeleteStage = () => {
    if (!deleteStageTarget) return
    deleteStage(caseData.id, deleteStageTarget.id)
    if (deleteStageTarget.name === caseData.currentStage) {
      const remainingStages = caseData.stages.filter(s => s.id !== deleteStageTarget.id)
      const newCurrent = remainingStages.length > 0 ? remainingStages[remainingStages.length - 1].name : ''
      updateCase(caseData.id, { currentStage: newCurrent })
    }
    setDeleteStageTarget(null)
    addToast('阶段已删除', 'success')
  }

  const moveStageUp = (idx: number) => {
    if (idx <= 0) return
    const newStages = [...caseData.stages]
    const temp = newStages[idx].order
    newStages[idx].order = newStages[idx - 1].order
    newStages[idx - 1].order = temp
    const sorted = newStages.sort((a, b) => a.order - b.order)
    updateCase(caseData.id, { stages: sorted })
  }

  const moveStageDown = (idx: number) => {
    if (idx >= caseData.stages.length - 1) return
    const newStages = [...caseData.stages]
    const temp = newStages[idx].order
    newStages[idx].order = newStages[idx + 1].order
    newStages[idx + 1].order = temp
    const sorted = newStages.sort((a, b) => a.order - b.order)
    updateCase(caseData.id, { stages: sorted })
  }

  const handleStatusChange = (status: Case['status']) => {
    let stages = [...caseData.stages]
    let currentStage = caseData.currentStage

    if (status === '已结案') {
      const hasVerdict = stages.some(s => s.name === '判决')
      if (!hasVerdict) {
        stages.push({
          id: Date.now().toString(),
          name: '判决',
          startTime: new Date().toISOString().slice(0, 10),
          notes: '案件结案',
          order: stages.length + 1,
        })
      }
      currentStage = '判决'
    } else if (status === '已归档') {
      const hasVerdict = stages.some(s => s.name === '判决')
      if (!hasVerdict) {
        stages.push({
          id: Date.now().toString(),
          name: '判决',
          startTime: new Date().toISOString().slice(0, 10),
          notes: '案件结案',
          order: stages.length + 1,
        })
      }
      const hasArchive = stages.some(s => s.name === '归档')
      if (!hasArchive) {
        stages.push({
          id: (Date.now() + 1).toString(),
          name: '归档',
          startTime: new Date().toISOString().slice(0, 10),
          notes: '案件归档',
          order: stages.length + 1,
        })
      }
      currentStage = '归档'
    }

    updateCase(caseData.id, { status, stages, currentStage })
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
          {caseData.status === '已归档' && (
            <span className="badge bg-ivory-100 text-ivory-600 border border-ivory-300">流程已完成</span>
          )}
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
            (() => {
              const sortedStages = [...caseData.stages].sort((a, b) => a.order - b.order)
              return sortedStages.map((stage, idx) => {
                const isActive = stage.order <= currentStageOrder
                const isLast = idx === sortedStages.length - 1
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
                          <button className="text-ivory-400 hover:text-navy-500" onClick={() => moveStageUp(idx)} disabled={idx === 0}>
                            <ArrowUp size={12} />
                          </button>
                          <button className="text-ivory-400 hover:text-navy-500" onClick={() => moveStageDown(idx)} disabled={idx === sortedStages.length - 1}>
                            <ArrowDown size={12} />
                          </button>
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
            })()
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">关联文书</h2>
        <div className="flex gap-2 mb-4">
          <button className="btn-secondary text-xs" onClick={() => { const doc = generateDocument('t1', caseData.id); navigate(`/documents/edit/${doc.id}`); addToast('起诉状已生成', 'success') }}>
            <FilePlus size={14} />生成起诉状
          </button>
          <button className="btn-secondary text-xs" onClick={() => { const doc = generateDocument('t2', caseData.id); navigate(`/documents/edit/${doc.id}`); addToast('答辩状已生成', 'success') }}>
            <FilePlus size={14} />生成答辩状
          </button>
          <button className="btn-secondary text-xs" onClick={() => { const doc = generateDocument('t3', caseData.id); navigate(`/documents/edit/${doc.id}`); addToast('代理词已生成', 'success') }}>
            <FilePlus size={14} />生成代理词
          </button>
        </div>
        {caseDocs.length === 0 ? (
          <p className="text-ivory-400 text-sm">暂无关联文书</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {caseDocs.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 bg-ivory-50 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer" onClick={() => navigate(`/documents/edit/${doc.id}`)}>
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
            {[...caseSchedules].sort((a, b) => a.dateTime.localeCompare(b.dateTime)).map((sch) => {
              const isPastHearing = sch.type === '开庭' && new Date(sch.dateTime) < new Date()
              const needsNotes = isPastHearing && (!sch.notes || sch.notes.length < 10)
              return (
                <div key={sch.id} className="flex items-center gap-3 p-3 bg-ivory-50 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
                  <Calendar size={16} className="text-navy-400 flex-shrink-0" />
                  <span className="badge bg-navy-50 text-navy-500 border border-navy-200">{sch.type}</span>
                  <span className="text-sm text-navy-500">{sch.dateTime}</span>
                  <span className="text-xs text-ivory-400">{sch.location}</span>
                  {needsNotes && (
                    <span className="badge bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1 ml-auto">
                      <AlertTriangle size={12} /> 请填写庭审备注
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {(caseData.status === '已结案' || caseData.status === '已归档') && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <BookOpen size={18} className="text-navy-500" />
              办案复盘
            </h2>
            {!editingReview ? (
              <button className="btn-secondary !px-2 !py-1" onClick={startEditReview}>
                <Edit size={14} /> 编辑
              </button>
            ) : (
              <button className="btn-primary !px-2 !py-1" onClick={saveEditReview}>
                <Save size={14} /> 保存
              </button>
            )}
          </div>
          {editingReview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">裁判结果</label>
                  <select
                    className="input-field"
                    value={reviewForm.verdictResult}
                    onChange={(e) => setReviewForm({ ...reviewForm, verdictResult: e.target.value })}
                  >
                    <option value="">请选择</option>
                    {VERDICT_RESULTS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">回款/赔付金额</label>
                  <input
                    type="text"
                    className="input-field"
                    value={reviewForm.recoveredAmount}
                    onChange={(e) => setReviewForm({ ...reviewForm, recoveredAmount: e.target.value })}
                    placeholder="请输入金额"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">后续执行事项</label>
                <textarea
                  className="input-field min-h-[80px]"
                  rows={3}
                  value={reviewForm.executionMatters}
                  onChange={(e) => setReviewForm({ ...reviewForm, executionMatters: e.target.value })}
                  placeholder="请输入后续执行事项"
                />
              </div>
              <div>
                <label className="label-text">归档备注</label>
                <textarea
                  className="input-field min-h-[60px]"
                  rows={2}
                  value={reviewForm.archiveNotes}
                  onChange={(e) => setReviewForm({ ...reviewForm, archiveNotes: e.target.value })}
                  placeholder="请输入归档备注"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="label-text">裁判结果</span>
                  <p className="text-sm text-navy-500">{caseData.review?.verdictResult || '-'}</p>
                </div>
                <div>
                  <span className="label-text">回款/赔付金额</span>
                  <p className="text-sm text-navy-500">{caseData.review?.recoveredAmount || '-'}</p>
                </div>
              </div>
              <div>
                <span className="label-text">后续执行事项</span>
                <p className="text-sm text-navy-500">{caseData.review?.executionMatters || '-'}</p>
              </div>
              <div>
                <span className="label-text">归档备注</span>
                <p className="text-sm text-navy-500">{caseData.review?.archiveNotes || '-'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2"><ClipboardCheck size={18} className="text-navy-500" />归档材料清单</h2>
          {caseData.status === '已归档' && uncheckedCount === 0 && (
            <span className="badge bg-green-50 text-green-700 border border-green-200">材料已齐</span>
          )}
          {uncheckedCount > 0 && (
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200">还有 {uncheckedCount} 项未完成</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(caseData.archiveChecklist || []).map((item) => (
            <label key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.checked ? 'bg-green-50 border-green-200' : 'bg-ivory-50 border-ivory-200 hover:border-ivory-300'}`}>
              <input type="checkbox" checked={item.checked} onChange={() => toggleArchiveItem(caseData.id, item.id)} className="w-4 h-4 text-navy-500 rounded border-ivory-300 focus:ring-navy-300" />
              <span className={`text-sm ${item.checked ? 'text-green-700 line-through' : 'text-navy-500'}`}>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      {(caseData.status === '已结案' || caseData.status === '已归档') && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2"><DollarSign size={18} className="text-navy-500" />执行进展</h2>
            <div className="flex gap-2">
              {!editingExecAmounts ? (
                <button className="btn-secondary !px-2 !py-1" onClick={() => { setExecAmountsForm({ totalAmount: caseData.execution?.totalAmount || '', receivedAmount: caseData.execution?.receivedAmount || '' }); setEditingExecAmounts(true) }}><Edit size={14} /> 编辑金额</button>
              ) : (
                <button className="btn-primary !px-2 !py-1" onClick={() => { updateExecutionAmounts(caseData.id, execAmountsForm.totalAmount, execAmountsForm.receivedAmount); setEditingExecAmounts(false); addToast('金额已更新', 'success') }}><Save size={14} /> 保存</button>
              )}
              <button className="btn-secondary !px-2 !py-1" onClick={() => setExecModal(true)}><PlusCircle size={14} /> 添加记录</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {editingExecAmounts ? (
              <>
                <div><label className="label-text">总金额</label><input className="input-field" value={execAmountsForm.totalAmount} onChange={(e) => setExecAmountsForm({ ...execAmountsForm, totalAmount: e.target.value })} /></div>
                <div><label className="label-text">已回款</label><input className="input-field" value={execAmountsForm.receivedAmount} onChange={(e) => setExecAmountsForm({ ...execAmountsForm, receivedAmount: e.target.value })} /></div>
              </>
            ) : (
              <>
                <div className="bg-ivory-50 rounded-lg p-4"><span className="label-text">总金额</span><p className="text-xl font-bold text-navy-500">{caseData.execution?.totalAmount || '-'}</p></div>
                <div className="bg-ivory-50 rounded-lg p-4"><span className="label-text">已回款</span><p className="text-xl font-bold text-gold-500">{caseData.execution?.receivedAmount || '-'}</p></div>
              </>
            )}
          </div>
          {(caseData.execution?.records?.length ?? 0) > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-ivory-200"><th className="text-left py-2 text-navy-400 font-medium">日期</th><th className="text-left py-2 text-navy-400 font-medium">类型</th><th className="text-left py-2 text-navy-400 font-medium">描述</th><th className="text-left py-2 text-navy-400 font-medium">金额</th><th className="text-left py-2 text-navy-400 font-medium">操作</th></tr></thead>
              <tbody>
                {[...(caseData.execution?.records || [])].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                  <tr key={r.id} className="border-b border-ivory-100">
                    <td className="py-2 text-navy-500">{r.date}</td>
                    <td className="py-2"><span className={`badge ${r.type === '回款' ? 'bg-green-50 text-green-700 border-green-200' : r.type === '强制执行' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-ivory-50 text-ivory-500 border-ivory-300'}`}>{r.type}</span></td>
                    <td className="py-2 text-navy-400">{r.description}</td>
                    <td className="py-2 text-navy-500 font-medium">{r.amount}</td>
                    <td className="py-2"><button className="text-ivory-400 hover:text-red-500" onClick={() => { removeExecutionRecord(caseData.id, r.id); addToast('记录已删除', 'success') }}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-ivory-400 text-sm">暂无执行记录</p>}
        </div>
      )}

      <Modal isOpen={execModal} onClose={() => setExecModal(false)} title="添加执行记录">
        <div className="space-y-4">
          <div><label className="label-text">日期</label><input type="date" className="input-field" value={execForm.date} onChange={(e) => setExecForm({ ...execForm, date: e.target.value })} /></div>
          <div><label className="label-text">类型</label><select className="input-field" value={execForm.type} onChange={(e) => setExecForm({ ...execForm, type: e.target.value as ExecutionRecord['type'] })}><option value="回款">回款</option><option value="赔付">赔付</option><option value="强制执行">强制执行</option><option value="其他">其他</option></select></div>
          <div><label className="label-text">描述</label><input className="input-field" value={execForm.description} onChange={(e) => setExecForm({ ...execForm, description: e.target.value })} /></div>
          <div><label className="label-text">金额</label><input className="input-field" value={execForm.amount} onChange={(e) => setExecForm({ ...execForm, amount: e.target.value })} placeholder="请输入金额" /></div>
          <div className="flex justify-end gap-3"><button className="btn-secondary" onClick={() => setExecModal(false)}>取消</button><button className="btn-primary" onClick={() => { if (!execForm.date || !execForm.amount) return; addExecutionRecord(caseData.id, { id: Date.now().toString(), ...execForm }); setExecModal(false); setExecForm({ date: '', description: '', amount: '', type: '回款' }); addToast('执行记录已添加', 'success') }}>确认添加</button></div>
        </div>
      </Modal>

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
