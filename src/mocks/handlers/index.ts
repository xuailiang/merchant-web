import { authHandlers } from './auth'
import { marketingHandlers } from './marketing'
import { orderHandlers } from './orders'
import { productHandlers } from './products'
import { shippingHandlers } from './shipping'

export const handlers = [
  ...authHandlers,
  ...orderHandlers,
  ...productHandlers,
  ...shippingHandlers,
  ...marketingHandlers,
]
