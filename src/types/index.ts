export interface Client {
  id: string
  name: string
  contact: string
  caseType: string
  notes: string
  createdAt: string
}

export interface Stage {
  id: string
  name: string
  startTime: string
  notes: string
  order: number
}

export interface CaseReview {
  verdictResult: string
  recoveredAmount: string
  executionMatters: string
  archiveNotes: string
}

export interface Case {
  id: string
  caseNumber: string
  cause: string
  filingDate: string
  opposingParty: string
  lawyerId: string
  clientId: string
  status: '进行中' | '已结案' | '已归档'
  currentStage: string
  stages: Stage[]
  createdAt: string
  review: CaseReview
}

export interface DocumentTemplate {
  id: string
  name: string
  category: string
  content: string
}

export interface Document {
  id: string
  templateId: string
  caseId: string
  clientId: string
  title: string
  content: string
  createdAt: string
}

export interface ScheduleItem {
  id: string
  caseId: string
  type: '开庭' | '会见' | '其他'
  dateTime: string
  location: string
  notes: string
  reminded: boolean
}

export interface Lawyer {
  id: string
  name: string
  phone: string
  email: string
}

export const CASE_TYPES = ['民事纠纷', '刑事辩护', '商事诉讼', '知识产权', '劳动争议', '行政纠纷', '婚姻家庭', '房产纠纷']

export const CASE_STATUSES: Case['status'][] = ['进行中', '已结案', '已归档']

export const SCHEDULE_TYPES: ScheduleItem['type'][] = ['开庭', '会见', '其他']

export const DEFAULT_STAGES = ['立案', '证据交换', '开庭', '判决']

export const VERDICT_RESULTS = ['胜诉', '败诉', '调解', '撤诉', '其他']
