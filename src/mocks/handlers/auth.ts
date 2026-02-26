import { http, HttpResponse } from 'msw'

const ok = <T>(data: T) =>
  HttpResponse.json({
    code: 0,
    message: 'ok',
    data,
  })

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { username?: string; role?: string }
    return ok({
      token: `mock-token-${Date.now()}`,
      role: body.role ?? 'admin',
      name: body.username || '模拟商户',
    })
  }),
  http.get('*/auth/me', () =>
    ok({
      id: 'u_mock_001',
      role: 'admin',
      name: '模拟商户',
      permissions: ['*'],
    })
  ),
]
