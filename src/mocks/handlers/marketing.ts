import { http, HttpResponse } from 'msw'

const ok = <T>(data: T) =>
  HttpResponse.json({
    code: 0,
    message: 'ok',
    data,
  })

export const marketingHandlers = [
  http.get('*/marketing/coupons', () =>
    ok({
      total: 2,
      list: [
        { id: 'cp_01', name: '满199减20', type: '满减券', status: '进行中' },
        { id: 'cp_02', name: '运费券', type: '运费券', status: '未开始' },
      ],
    })
  ),
  http.get('*/marketing/campaigns', () =>
    ok({
      total: 2,
      list: [
        { id: 'act_01', name: '周末秒杀', type: '秒杀活动', status: '进行中' },
        { id: 'act_02', name: '新客满减', type: '满减活动', status: '进行中' },
      ],
    })
  ),
]
