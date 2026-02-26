import { http, HttpResponse } from 'msw'

const ok = <T>(data: T) =>
  HttpResponse.json({
    code: 0,
    message: 'ok',
    data,
  })

export const shippingHandlers = [
  http.get('*/shipping/orders', () =>
    ok({
      total: 1,
      list: [
        {
          id: 'DD2026020417142',
          receiver: '周女士',
          phone: '13567546709',
          address: '山东省济南市历下区新泺大街888号',
          status: '待发货',
        },
      ],
    })
  ),
  http.get('*/shipping/templates', () =>
    ok({
      total: 2,
      list: [
        { id: 'tpl_01', name: '指定地区运费设置', mode: '按件数', freeShipping: false },
        { id: 'tpl_02', name: '包邮模板', mode: '包邮', freeShipping: true },
      ],
    })
  ),
]
