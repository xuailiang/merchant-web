# Merchant Admin (商家管理后台)

这是一个基于 Vue 3 + Vite + Ant Design Vue 构建的高性能电子商务商家管理平台。该项目为商家提供了一站式的商品管理、订单处理、店铺装修、财务结算及营销推广方案。

## 🚀 技术栈

- **框架**: [Vue 3](https://v3.vuejs.org/) (Composition API, `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库**: [Ant Design Vue 4.x](https://www.antdv.com/)
- **路由**: [Vue Router 4.x](https://next.router.vuejs.org/)
- **图表**: [AntV G2Plot](https://g2plot.antv.vision/)
- **网络请求**: [Axios](https://axios-http.com/)
- **本地 Mock**: [MSW (Mock Service Worker)](https://mswjs.io/)
- **代码规范**: ESLint, Prettier, Husky, lint-staged

## 📂 项目结构

```text
merchant-admin
├── src
│   ├── api           // API 接口定义与配置
│   ├── components    // 公用组件 (包含业务模块化组件)
│   │   ├── create-product  // 商品发布向导组件
│   │   ├── decor           // 店铺装修引擎组件
│   │   └── products        // 商品列表及筛选组件
│   ├── composables   // 组合式 API (业务逻辑复用)
│   ├── layouts       // 页面布局模板
│   ├── mock          // MSW 模拟数据与处理函数
│   ├── pages         // 路由页面 (40+ 业务页面)
│   ├── router        // 路由配置
│   ├── styles        // 全局样式与模块化样式
│   ├── types         // TypeScript 类型定义
│   └── utils         // 工具函数与 Hooks
├── public            // 静态资源文件
├── vite.config.ts    // Vite 配置文件
└── package.json      // 项目依赖与脚本
```

## ✨ 核心功能

- **商品发布系统**: 四步向导式发布流程，集成自动保存、复杂规格 (SKU) 管理及多媒体素材管理。
- **店铺装修引擎**: 可视化拖拽构建移动端店铺首页，支持多种组件配置与实时预览。
- **订单管理中心**: 全面的订单处理流程、售后服务、发货管理及面单打印。
- **财务结算中心**: 包含对账单管理、提现申请、发票处理结算分析。
- **营销中心**: 支持优惠券创建、活动报名、推广归因分析等功能。
- **运营任务**: 集成操作日志、任务流转及权限 (RBAC) 细粒度控制。

## 🛠️ 快速开始

### 1. 安装环境

确保你已安装 Node.js (建议 v18+)

### 2. 安装依赖

```bash
npm install
```

### 3. 开发环境运行

```bash
npm run dev
```

### 4. 代码质量检查 (Lint)

```bash
# 检查并自动修复错误
npm run lint:fix

# 运行类型检查
npm run typecheck
```

### 5. 构建生产版本

```bash
npm run build
```

## 📜 开发标准

- **组件化**: 优先将复杂组件拆分为更小的功能单元。
- **类型安全**: 必须为所有 API 返回值 and 业务对象定义 TypeScript 接口。
- **状态管理**: 简单状态优先使用 `reactive`/`ref`，复杂状态可考虑跨组件 Context。
- **Mock**: 开发新功能前，优先在 `src/mock` 中定义接口模拟数据。

## 📦 部署

运行 `npm run build` 后，将 `dist` 目录下的静态文件部署至 Nginx 或类似 Web 服务器即可。
