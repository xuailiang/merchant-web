import { Column, DualAxes, Funnel, Gauge, Heatmap } from '@antv/g2plot'
import type {
  ChannelContributionPoint,
  DualAxesPoint,
  FunnelNode,
  HeatmapPoint,
} from '../types/dashboard'

type ClickHandler<T> = (datum: T) => void

export const createDualAxesChart = (
  container: HTMLElement,
  data: DualAxesPoint[],
  onClick?: ClickHandler<DualAxesPoint>
): DualAxes => {
  const chart = new DualAxes(container, {
    autoFit: true,
    height: 320,
    data: [data, data],
    xField: 'period',
    yField: ['gmv', 'margin'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#1d4ed8',
        columnWidthRatio: 0.56,
      },
      {
        geometry: 'line',
        color: '#059669',
        smooth: true,
        lineStyle: { lineWidth: 2.4 },
        point: { size: 4, shape: 'circle' },
      },
    ],
    yAxis: {
      gmv: {
        min: 0,
        label: {
          formatter: (value: string) => `¥${value}w`,
        },
      },
      margin: {
        min: 0,
        max: 40,
        label: {
          formatter: (value: string) => `${value}%`,
        },
      },
    },
    tooltip: {
      shared: true,
    },
    legend: {
      position: 'top-left',
    },
    interactions: [{ type: 'element-active' }],
  })

  if (onClick) {
    chart.on('element:click', (evt: { data?: { data?: DualAxesPoint } }) => {
      const datum = evt?.data?.data as DualAxesPoint | undefined
      if (datum) onClick(datum)
    })
  }

  return chart
}

export const createFunnelChart = (
  container: HTMLElement,
  data: FunnelNode[],
  onClick?: ClickHandler<FunnelNode>
): Funnel => {
  const chart = new Funnel(container, {
    autoFit: true,
    height: 320,
    data,
    xField: 'stage',
    yField: 'value',
    conversionTag: {},
    legend: false,
    label: {
      formatter: (datum: Record<string, unknown>) => `${datum.stage}\n${datum.value}`,
      style: {
        fontWeight: 600,
      },
    },
    funnelStyle: {
      stroke: '#fff',
      lineWidth: 1,
    },
    color: ['#1d4ed8', '#3b82f6', '#10b981', '#22c55e', '#84cc16'],
    interactions: [{ type: 'element-active' }],
  })

  if (onClick) {
    chart.on('element:click', (evt: { data?: { data?: FunnelNode } }) => {
      const datum = evt?.data?.data as FunnelNode | undefined
      if (datum) onClick(datum)
    })
  }

  return chart
}

export const createHeatmapChart = (
  container: HTMLElement,
  data: HeatmapPoint[],
  onClick?: ClickHandler<HeatmapPoint>
): Heatmap => {
  const chart = new Heatmap(container, {
    autoFit: true,
    height: 320,
    data,
    xField: 'weekday',
    yField: 'hour',
    colorField: 'value',
    color: ['#dbeafe', '#93c5fd', '#60a5fa', '#2563eb', '#1e3a8a'],
    legend: {
      position: 'bottom',
    },
    xAxis: {
      tickLine: null,
    },
    yAxis: {
      tickLine: null,
    },
    tooltip: {
      formatter: (datum: Record<string, unknown>) => ({
        name: `${datum.weekday as string} ${datum.hour as string}`,
        value: `${datum.value as number} 单`,
      }),
    },
    interactions: [{ type: 'element-active' }],
  })

  if (onClick) {
    chart.on('element:click', (evt: { data?: { data?: HeatmapPoint } }) => {
      const datum = evt?.data?.data as HeatmapPoint | undefined
      if (datum) onClick(datum)
    })
  }

  return chart
}

export const createGaugeChart = (container: HTMLElement, score: number): Gauge => {
  return new Gauge(container, {
    autoFit: true,
    height: 320,
    percent: Math.max(0, Math.min(score / 100, 1)),
    range: {
      ticks: [0, 0.7, 0.85, 1],
      color: ['#ef4444', '#f59e0b', '#10b981'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#1f2937',
          lineWidth: 3,
        },
      },
      pin: {
        style: {
          stroke: '#111827',
          lineWidth: 2,
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '30px',
          fontWeight: 700,
          color: '#111827',
        },
        formatter: () => `${score}`,
      },
    },
    axis: {
      label: {
        formatter: (value: string) => `${Math.round(Number(value) * 100)}`,
      },
    },
  })
}

export const createChannelChart = (
  container: HTMLElement,
  data: ChannelContributionPoint[]
): Column => {
  const transformed = data.flatMap((item) => [
    { channel: item.channel, metric: '成交额', value: item.gmv },
    { channel: item.channel, metric: '毛利率', value: item.margin },
  ])

  return new Column(container, {
    autoFit: true,
    height: 320,
    data: transformed,
    isGroup: true,
    xField: 'channel',
    yField: 'value',
    seriesField: 'metric',
    columnWidthRatio: 0.48,
    color: ['#2563eb', '#16a34a'],
    legend: {
      position: 'top-left',
    },
    label: {
      position: 'top',
      style: {
        fill: '#475569',
        fontSize: 11,
      },
    },
    interactions: [{ type: 'element-active' }],
  })
}
