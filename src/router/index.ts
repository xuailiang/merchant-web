import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { getRole, getToken } from '../utils/auth'
import type { UserRole } from '../utils/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

type RouteMeta = {
  title?: string
  key?: string
  parentKey?: string
  requiresAuth?: boolean
  roles?: UserRole[]
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: { title: '登录' } as RouteMeta,
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true } as RouteMeta,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../pages/Dashboard.vue'),
          meta: { title: '仪表盘', key: 'dashboard', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('../pages/Orders.vue'),
          meta: { title: '订单管理', key: 'orders', parentKey: 'orders-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'orders/:id',
          name: 'OrderDetail',
          component: () => import('../pages/OrderDetail.vue'),
          meta: { title: '订单详情', key: 'orders-detail', parentKey: 'orders-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'orders/ship/:id',
          name: 'OrderShip',
          component: () => import('../pages/OrderShip.vue'),
          meta: { title: '订单发货', key: 'orders-ship', parentKey: 'orders-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'orders/after-sales',
          name: 'AfterSales',
          component: () => import('../pages/AfterSales.vue'),
          meta: { title: '售后/退款中心', key: 'orders-after-sales', parentKey: 'orders-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'shipping/fee',
          name: 'ShippingFee',
          component: () => import('../pages/ShippingFee.vue'),
          meta: { title: '运费管理', key: 'shipping-fee', parentKey: 'shipping-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'shipping',
          name: 'ShippingCenter',
          component: () => import('../pages/ShippingCenter.vue'),
          meta: { title: '发货管理中心', key: 'shipping-center', parentKey: 'shipping-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'supply/suppliers',
          name: 'SupplierManagement',
          component: () => import('../pages/SupplierManagement.vue'),
          meta: { title: '供货商管理', key: 'supplier-management', parentKey: 'supply-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'supply/purchase',
          name: 'PurchaseInbound',
          component: () => import('../pages/PurchaseInbound.vue'),
          meta: { title: '采购入库', key: 'purchase-inbound', parentKey: 'supply-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'supply/reconciliation',
          name: 'Reconciliation',
          component: () => import('../pages/Reconciliation.vue'),
          meta: { title: '对账单', key: 'reconciliation', parentKey: 'supply-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('../pages/Products.vue'),
          meta: { title: '商品管理', key: 'products', parentKey: 'products-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'products/create',
          name: 'ProductCreate',
          component: () => import('../pages/CreateProduct.vue'),
          meta: { title: '创建商品', key: 'products-create', parentKey: 'products-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'products/brands',
          name: 'ProductBrands',
          component: () => import('../pages/Brands.vue'),
          meta: { title: '品牌管理', key: 'products-brands', parentKey: 'products-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'products/review',
          name: 'ProductsReview',
          component: () => import('../pages/ProductsReview.vue'),
          meta: { title: '商品审核', key: 'products-review', parentKey: 'products-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'products/:id',
          name: 'ProductDetail',
          component: () => import('../pages/ProductDetail.vue'),
          meta: { title: '商品详情', key: 'products-detail', parentKey: 'products-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'customers',
          name: 'Customers',
          component: () => import('../pages/Customers.vue'),
          meta: { title: '客户管理', key: 'customers', parentKey: 'customers-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'customers/:id',
          name: 'CustomerDetail',
          component: () => import('../pages/CustomerDetail.vue'),
          meta: { title: '客户详情', key: 'customers-detail', parentKey: 'customers-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'customers/membership',
          name: 'Membership',
          component: () => import('../pages/Membership.vue'),
          meta: { title: '会员体系', key: 'customers-membership', parentKey: 'customers-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'marketing',
          name: 'Marketing',
          component: () => import('../pages/Marketing.vue'),
          meta: { title: '营销中心', key: 'marketing', parentKey: 'marketing-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'marketing/coupons',
          name: 'Coupons',
          component: () => import('../pages/Coupons.vue'),
          meta: { title: '优惠券管理', key: 'marketing-coupons', parentKey: 'marketing-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'marketing/coupons/create',
          name: 'CouponCreate',
          component: () => import('../pages/CouponCreate.vue'),
          meta: { title: '创建优惠券', key: 'marketing-coupons-create', parentKey: 'marketing-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'marketing/campaigns/create',
          name: 'CampaignCreate',
          component: () => import('../pages/CampaignCreate.vue'),
          meta: { title: '创建活动', key: 'marketing-campaigns-create', parentKey: 'marketing-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'ops/alerts',
          name: 'OpsAlerts',
          component: () => import('../pages/OpsAlerts.vue'),
          meta: { title: '异常提醒', key: 'ops-alerts', parentKey: 'ops-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'ops/tasks',
          name: 'OpsTasks',
          component: () => import('../pages/OpsTasks.vue'),
          meta: { title: '待办任务', key: 'ops-tasks', parentKey: 'ops-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'ops/logs',
          name: 'OpsLogs',
          component: () => import('../pages/OpsLogs.vue'),
          meta: { title: '操作日志', key: 'ops-logs', parentKey: 'ops-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'exports',
          name: 'Exports',
          component: () => import('../pages/Exports.vue'),
          meta: { title: '下载中心', key: 'exports-center', parentKey: 'ops-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'finance',
          name: 'Finance',
          component: () => import('../pages/Finance.vue'),
          meta: { title: '财务中心', key: 'finance', parentKey: 'finance-root', requiresAuth: true, roles: ['admin', 'finance'] } as RouteMeta,
        },
        {
          path: 'finance/settlements',
          name: 'Settlements',
          component: () => import('../pages/Settlements.vue'),
          meta: { title: '结算管理', key: 'finance-settlements', parentKey: 'finance-root', requiresAuth: true, roles: ['admin', 'finance'] } as RouteMeta,
        },
        {
          path: 'finance/invoices',
          name: 'InvoiceList',
          component: () => import('../pages/InvoiceList.vue'),
          meta: { title: '发票管理', key: 'finance-invoices', parentKey: 'finance-root', requiresAuth: true, roles: ['admin', 'finance'] } as RouteMeta,
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../pages/Settings.vue'),
          meta: { title: '系统设置', key: 'settings', parentKey: 'settings-root', requiresAuth: true, roles: ['admin'] } as RouteMeta,
        },
        {
          path: 'settings/merchant',
          name: 'MerchantInfo',
          component: () => import('../pages/MerchantInfo.vue'),
          meta: { title: '商户信息', key: 'settings-merchant', parentKey: 'settings-root', requiresAuth: true, roles: ['admin'] } as RouteMeta,
        },
        {
          path: 'settings/roles',
          name: 'Roles',
          component: () => import('../pages/Roles.vue'),
          meta: { title: '角色权限', key: 'settings-roles', parentKey: 'settings-root', requiresAuth: true, roles: ['admin'] } as RouteMeta,
        },
        {
          path: 'settings/assets',
          name: 'Assets',
          component: () => import('../pages/Assets.vue'),
          meta: { title: '资源管理', key: 'settings-assets', parentKey: 'settings-root', requiresAuth: true, roles: ['admin'] } as RouteMeta,
        },
        {
          path: 'settings/permissions',
          name: 'Permissions',
          component: () => import('../pages/Permissions.vue'),
          meta: { title: '权限矩阵', key: 'settings-permissions', parentKey: 'settings-root', requiresAuth: true, roles: ['admin'] } as RouteMeta,
        },
        {
          path: 'account/settings',
          name: 'AccountSettings',
          component: () => import('../pages/AccountSettings.vue'),
          meta: { title: '账户设置', key: 'account-settings', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'account/store',
          name: 'StoreInfo',
          component: () => import('../pages/StoreInfo.vue'),
          meta: { title: '门店信息', key: 'store-info', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'help',
          name: 'HelpCenter',
          component: () => import('../pages/HelpCenter.vue'),
          meta: { title: '帮助中心', key: 'help-center', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'decor/home',
          name: 'DecorHome',
          component: () => import('../pages/DecorHome.vue'),
          meta: { title: '首页装修', key: 'decor-home', parentKey: 'decor-root', requiresAuth: true } as RouteMeta,
        },
        {
          path: 'decor/page',
          name: 'DecorPage',
          component: () => import('../pages/DecorPage.vue'),
          meta: { title: '页面装修', key: 'decor-page', parentKey: 'decor-root', requiresAuth: true } as RouteMeta,
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  NProgress.start()
  const meta = to.meta as RouteMeta
  if (!meta?.requiresAuth) {
    next()
    return
  }

  const token = getToken()
  if (!token) {
    next('/login')
    return
  }

  const requiredRoles = meta.roles
  if (requiredRoles && requiredRoles.length > 0) {
    const role = getRole()
    if (!role || !requiredRoles.includes(role)) {
      next('/dashboard')
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
