import type { Client, Case, Stage, DocumentTemplate, Document, ScheduleItem, Lawyer } from '@/types'
import { ARCHIVE_ITEMS } from '@/types'

export const mockLawyers: Lawyer[] = [
  { id: 'l1', name: '张明远', phone: '138-0001-1001', email: 'zhangmy@lawfirm.cn' },
  { id: 'l2', name: '李思涵', phone: '139-0002-2002', email: 'lish@lawfirm.cn' },
  { id: 'l3', name: '王建国', phone: '137-0003-3003', email: 'wangjg@lawfirm.cn' },
]

export const mockClients: Client[] = [
  { id: 'c1', name: '陈志强', contact: '135-6789-0001', caseType: '民事纠纷', notes: '老客户，多次委托', createdAt: '2025-03-15' },
  { id: 'c2', name: '刘芳', contact: '136-6789-0002', caseType: '婚姻家庭', notes: '离婚纠纷', createdAt: '2025-04-02' },
  { id: 'c3', name: '华鼎科技有限公司', contact: '021-5555-0003', caseType: '知识产权', notes: '商标侵权', createdAt: '2025-05-10' },
  { id: 'c4', name: '赵伟', contact: '138-6789-0004', caseType: '劳动争议', notes: '劳动仲裁', createdAt: '2025-06-20' },
  { id: 'c5', name: '孙丽华', contact: '139-6789-0005', caseType: '房产纠纷', notes: '二手房买卖纠纷', createdAt: '2025-07-08' },
]

export const mockCases: Case[] = [
  {
    id: 'cs1', caseNumber: '2025-民-001', cause: '民间借贷纠纷', filingDate: '2025-03-20',
    opposingParty: '周杰', lawyerId: 'l1', clientId: 'c1', status: '进行中', currentStage: '开庭',
    stages: [
      { id: 's1-1', name: '立案', startTime: '2025-03-20', notes: '已提交起诉状', order: 1 },
      { id: 's1-2', name: '证据交换', startTime: '2025-04-15', notes: '已提交银行转账记录', order: 2 },
      { id: 's1-3', name: '开庭', startTime: '2025-06-10', notes: '第一次开庭审理', order: 3 },
    ],
    createdAt: '2025-03-20',
    review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs2', caseNumber: '2025-民-002', cause: '离婚纠纷', filingDate: '2025-04-05',
    opposingParty: '刘强', lawyerId: 'l2', clientId: 'c2', status: '进行中', currentStage: '证据交换',
    stages: [
      { id: 's2-1', name: '立案', startTime: '2025-04-05', notes: '已提交离婚起诉状', order: 1 },
      { id: 's2-2', name: '证据交换', startTime: '2025-05-12', notes: '提交共同财产清单', order: 2 },
    ],
    createdAt: '2025-04-05',
    review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs3', caseNumber: '2025-商-001', cause: '商标侵权', filingDate: '2025-05-15',
    opposingParty: '创达科技', lawyerId: 'l1', clientId: 'c3', status: '进行中', currentStage: '立案',
    stages: [
      { id: 's3-1', name: '立案', startTime: '2025-05-15', notes: '已提交侵权证据', order: 1 },
    ],
    createdAt: '2025-05-15',
    review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs4', caseNumber: '2025-劳-001', cause: '劳动仲裁', filingDate: '2025-06-25',
    opposingParty: '恒通集团', lawyerId: 'l3', clientId: 'c4', status: '已结案', currentStage: '判决',
    stages: [
      { id: 's4-1', name: '立案', startTime: '2025-06-25', notes: '提交仲裁申请', order: 1 },
      { id: 's4-2', name: '证据交换', startTime: '2025-07-10', notes: '提交劳动合同及工资记录', order: 2 },
      { id: 's4-3', name: '开庭', startTime: '2025-08-05', notes: '仲裁庭审', order: 3 },
      { id: 's4-4', name: '判决', startTime: '2025-09-01', notes: '裁决支持申请人主张', order: 4 },
    ],
    createdAt: '2025-06-25',
    review: { verdictResult: '胜诉', recoveredAmount: '250,000元', executionMatters: '已申请强制执行，款项已到账', archiveNotes: '' },
    execution: { totalAmount: '250,000', receivedAmount: '250,000', records: [{ id: 'er1', date: '2025-09-15', description: '裁决款项到账', amount: '250,000', type: '回款' }] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs5', caseNumber: '2025-民-003', cause: '二手房买卖纠纷', filingDate: '2025-07-10',
    opposingParty: '张金龙', lawyerId: 'l2', clientId: 'c5', status: '进行中', currentStage: '证据交换',
    stages: [
      { id: 's5-1', name: '立案', startTime: '2025-07-10', notes: '已提交起诉状', order: 1 },
      { id: 's5-2', name: '证据交换', startTime: '2025-08-20', notes: '提交购房合同及付款凭证', order: 2 },
    ],
    createdAt: '2025-07-10',
    review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs6', caseNumber: '2024-民-015', cause: '交通事故赔偿', filingDate: '2024-11-20',
    opposingParty: '马超', lawyerId: 'l1', clientId: 'c1', status: '已结案', currentStage: '判决',
    stages: [
      { id: 's6-1', name: '立案', startTime: '2024-11-20', notes: '已提交起诉状', order: 1 },
      { id: 's6-2', name: '证据交换', startTime: '2024-12-15', notes: '提交交通事故认定书', order: 2 },
      { id: 's6-3', name: '开庭', startTime: '2025-01-10', notes: '庭审完成', order: 3 },
      { id: 's6-4', name: '判决', startTime: '2025-02-05', notes: '判决赔偿12万元', order: 4 },
    ],
    createdAt: '2024-11-20',
    review: { verdictResult: '调解', recoveredAmount: '120,000元', executionMatters: '双方达成调解协议，已一次性履行完毕', archiveNotes: '' },
    execution: { totalAmount: '120,000', receivedAmount: '120,000', records: [{ id: 'er2', date: '2025-03-01', description: '调解协议一次性履行', amount: '120,000', type: '回款' }] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
  {
    id: 'cs7', caseNumber: '2025-刑-001', cause: '故意伤害', filingDate: '2025-01-15',
    opposingParty: '李某', lawyerId: 'l3', clientId: 'c1', status: '已归档', currentStage: '归档',
    stages: [
      { id: 's7-1', name: '立案', startTime: '2025-01-15', notes: '接受委托', order: 1 },
      { id: 's7-2', name: '证据交换', startTime: '2025-02-20', notes: '阅卷完成', order: 2 },
      { id: 's7-3', name: '开庭', startTime: '2025-03-25', notes: '辩护意见已提交', order: 3 },
      { id: 's7-4', name: '判决', startTime: '2025-04-15', notes: '缓刑判决', order: 4 },
      { id: 's7-5', name: '归档', startTime: '2025-05-20', notes: '案卷材料已整理归档', order: 5 },
    ],
    createdAt: '2025-01-15',
    review: { verdictResult: '胜诉', recoveredAmount: '', executionMatters: '被告人已认罪认罚，判处缓刑一年', archiveNotes: '案卷共5卷，已存入档案室第3柜第2层' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: true })),
    archiveAudit: { archiveDate: '2025-12-01', cabinetLocation: 'A柜-03层', handler: '张明远' },
  },
  {
    id: 'cs8', caseNumber: '2025-商-002', cause: '合同纠纷', filingDate: '2025-08-01',
    opposingParty: '瑞丰贸易', lawyerId: 'l2', clientId: 'c3', status: '进行中', currentStage: '立案',
    stages: [
      { id: 's8-1', name: '立案', startTime: '2025-08-01', notes: '已提交起诉状', order: 1 },
    ],
    createdAt: '2025-08-01',
    review: { verdictResult: '', recoveredAmount: '', executionMatters: '', archiveNotes: '' },
    execution: { totalAmount: '', receivedAmount: '', records: [] },
    archiveChecklist: ARCHIVE_ITEMS.map(item => ({ ...item, checked: false })),
    archiveAudit: { archiveDate: '', cabinetLocation: '', handler: '' },
  },
]

export const mockTemplates: DocumentTemplate[] = [
  {
    id: 't1', name: '民事起诉状', category: '诉讼文书',
    content: `<div style="font-family: 'Noto Sans SC', sans-serif; line-height: 2;">
<h2 style="text-align: center; margin-bottom: 24px;">民 事 起 诉 状</h2>
<p><strong>原告：</strong>{{clientName}}</p>
<p><strong>被告：</strong>{{opposingParty}}</p>
<p><strong>案由：</strong>{{cause}}</p>
<br/>
<p><strong>诉讼请求：</strong></p>
<p>1. ________________</p>
<p>2. ________________</p>
<br/>
<p><strong>事实与理由：</strong></p>
<p>________________</p>
<br/>
<p>此致</p>
<p>{{courtName}}人民法院</p>
<br/>
<p style="text-align: right;">具状人：{{clientName}}</p>
<p style="text-align: right;">{{filingDate}}</p>
</div>`,
  },
  {
    id: 't2', name: '答辩状', category: '诉讼文书',
    content: `<div style="font-family: 'Noto Sans SC', sans-serif; line-height: 2;">
<h2 style="text-align: center; margin-bottom: 24px;">答 辩 状</h2>
<p><strong>答辩人：</strong>{{clientName}}</p>
<p><strong>被答辩人：</strong>{{opposingParty}}</p>
<p><strong>案由：</strong>{{cause}}</p>
<p><strong>案号：</strong>{{caseNumber}}</p>
<br/>
<p><strong>答辩意见：</strong></p>
<p>________________</p>
<br/>
<p><strong>事实与理由：</strong></p>
<p>________________</p>
<br/>
<p>此致</p>
<p>{{courtName}}人民法院</p>
<br/>
<p style="text-align: right;">答辩人：{{clientName}}</p>
<p style="text-align: right;">{{filingDate}}</p>
</div>`,
  },
  {
    id: 't3', name: '代理词', category: '诉讼文书',
    content: `<div style="font-family: 'Noto Sans SC', sans-serif; line-height: 2;">
<h2 style="text-align: center; margin-bottom: 24px;">代 理 词</h2>
<p><strong>审判长、审判员：</strong></p>
<br/>
<p>受{{clientName}}的委托，本律师担任其与{{opposingParty}}{{cause}}一案的诉讼代理人。现发表如下代理意见：</p>
<br/>
<p><strong>一、________________</strong></p>
<p>________________</p>
<br/>
<p><strong>二、________________</strong></p>
<p>________________</p>
<br/>
<p>综上所述，________________</p>
<br/>
<p style="text-align: right;">代理人：{{lawyerName}}</p>
<p style="text-align: right;">{{lawFirmName}}</p>
<p style="text-align: right;">{{filingDate}}</p>
</div>`,
  },
]

export const mockDocuments: Document[] = [
  { id: 'd1', templateId: 't1', caseId: 'cs1', clientId: 'c1', title: '民事起诉状-民间借贷纠纷', content: '', createdAt: '2025-03-18' },
  { id: 'd2', templateId: 't2', caseId: 'cs2', clientId: 'c2', title: '答辩状-离婚纠纷', content: '', createdAt: '2025-04-20' },
  { id: 'd3', templateId: 't3', caseId: 'cs1', clientId: 'c1', title: '代理词-民间借贷纠纷', content: '', createdAt: '2025-06-08' },
]

export const mockSchedules: ScheduleItem[] = [
  { id: 'sc1', caseId: 'cs1', type: '开庭', dateTime: '2026-06-22 09:30', location: '朝阳区人民法院第3法庭', notes: '第二次开庭，携带证据原件', reminded: false },
  { id: 'sc2', caseId: 'cs2', type: '会见', dateTime: '2026-06-21 14:00', location: '律所会议室A', notes: '调解方案讨论', reminded: false },
  { id: 'sc3', caseId: 'cs3', type: '开庭', dateTime: '2026-06-25 10:00', location: '海淀区人民法院第7法庭', notes: '商标侵权案庭审', reminded: false },
  { id: 'sc4', caseId: 'cs5', type: '会见', dateTime: '2026-06-23 15:30', location: '律所会议室B', notes: '购房合同条款讨论', reminded: false },
  { id: 'sc5', caseId: 'cs8', type: '其他', dateTime: '2026-06-28 09:00', location: '线上会议', notes: '合同纠纷案取证', reminded: false },
]
