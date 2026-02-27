export type DashboardPeriod = 'week' | 'month' | 'quarter'

export type ReportDomain = 'orders' | 'profit' | 'inventory' | 'channel'

export type HealthLevel = 'normal' | 'warning' | 'danger'

export type SeverityLevel = 'low' | 'medium' | 'high'

export interface RouteTarget {
  path: string
  query?: Record<string, string>
}

export interface KpiCard {
  key: string
  title: string
  value: string
  trend: number
  note: string
  tone: 'scale' | 'efficiency' | 'risk'
  action: RouteTarget
}

export interface TodoAction {
  key: string
  label: string
  value: number
  hint: string
  level: HealthLevel
  action: RouteTarget
}

export interface RiskSignal {
  key: string
  label: string
  value: string
  level: SeverityLevel
  action: RouteTarget
}

export interface DualAxesPoint {
  period: string
  gmv: number
  margin: number
}

export interface FunnelNode {
  stage: string
  value: number
  action?: RouteTarget
}

export interface HeatmapPoint {
  weekday: string
  hour: string
  value: number
}

export interface HeatmapAnomaly {
  key: string
  weekday: string
  hour: string
  orderId: string
  issue: string
  delayMinutes: number
  action: RouteTarget
}

export interface ChannelContributionPoint {
  channel: string
  gmv: number
  margin: number
}

export interface RiskOrderItem {
  key: string
  orderId: string
  period: string
  issue: string
  amount: string
  status: string
  level: SeverityLevel
  action: RouteTarget
}

export interface ReportCard {
  domain: ReportDomain
  title: string
  value: string
  meta: string
  mom: number
  yoy: number
  abnormal: boolean
}

export interface ReportTableColumn {
  title: string
  dataIndex: string
  key: string
}

export interface ReportTableRow {
  key: string
  [field: string]: string | number
}

export interface ReportDomainDetail {
  title: string
  columns: ReportTableColumn[]
  rows: ReportTableRow[]
}

export interface DashboardSnapshot {
  kpiCards: KpiCard[]
  todoActions: TodoAction[]
  riskSignals: RiskSignal[]
  dualAxes: DualAxesPoint[]
  funnel: FunnelNode[]
  heatmap: HeatmapPoint[]
  heatmapAnomalies: HeatmapAnomaly[]
  gaugeScore: number
  gaugeHint: string
  channelContribution: ChannelContributionPoint[]
  riskOrders: RiskOrderItem[]
  reportCards: ReportCard[]
  reportDetails: Record<ReportDomain, ReportDomainDetail>
}
