# Merchant Web 项目文档

## 📋 项目概览

**项目名称**: Merchant Web（商户管理系统前端）  
**项目描述**: AI 生成的纯前端项目，基于 Ant Design + Vue 3 构建的商户管理应用  
**开发者**: xuailiang  
**创建时间**: 2026年2月9日  
**仓库状态**: 私有仓库  
**主要语言**: Vue 3 + TypeScript

---

## 🎯 项目目的

本项目是一个商户端管理系统的前端应用，提供商户进行日常业务管理、数据查看和操作的用户界面。通过 AI 生成的方式创建初始项目框架，采用现代化的前端技术栈实现高效、美观的用户体验。

---

## 🛠️ 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue** | ^3.4.38 | 进行式的JavaScript框架，用于构建用户界面 |
| **Vue Router** | ^4.4.0 | Vue应用的官方路由库 |
| **TypeScript** | ^5.5.4 | 为JavaScript添加类型支持 |

### UI组件库
| 技术 | 版本 | 说明 |
|------|------|------|
| **Ant Design Vue** | ^4.2.6 | Ant Design在Vue中的实现，提供丰富的UI组件 |
| **Ant Design Icons Vue** | ^7.0.1 | Ant Design图标库Vue版本 |

### 数据可视化
| 技术 | 版本 | 说明 |
|------|------|------|
| **@antv/g2plot** | ^2.4.31 | 蚂蚁集团开源的图表库，用于数据可视化 |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| **dayjs** | ^1.11.11 | 轻量级的日期时间处理库 |
| **xlsx** | ^0.18.5 | Excel文件读写库，支持导入导出功能 |

### 构建工具
| 技术 | 版本 | 说明 |
|------|------|------|
| **Vite** | ^5.4.1 | 新一代前端构建工具，提供极速开发体验 |
| **@vitejs/plugin-vue** | ^5.1.2 | Vite官方Vue 3插件 |
| **vue-tsc** | ^2.0.29 | Vue文件的TypeScript类型检查工具 |

---

## 📁 项目结构

```
merchant-web/
├── src/                      # 源代码目录
│   ├── components/          # 可复用组件
│   ├── views/              # 页面组件
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理（Pinia）
│   ├── api/                # API请求模块
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型定义
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口文件
├── public/                  # 静态资源
│   ├── favicon.ico
│   └── 其他静态文件
├── docs/                    # 项目文档
├── index.html              # HTML入口文件
├── package.json            # 项目配置文件
├── package-lock.json       # 依赖锁定文件
├── vite.config.ts          # Vite配置文件
├── tsconfig.json           # TypeScript配置文件
├── tsconfig.node.json      # Node相关的TypeScript配置
└── .gitignore              # Git忽略文件

```

---

## ⚙️ 配置文件说明

### package.json
当前项目依赖配置包括：
- **生产依赖**: Vue 3、Ant Design Vue、图表库、数据处理库
- **开发依赖**: Vite、TypeScript、Vue插件等

### tsconfig.json
配置TypeScript编译器选项：
- 目标: ES2020
- 启用严格模式检查
- 检查未使用的变量和参数
- 禁止Switch的fall-through

---

## 🚀 快速开始

### 前置要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn / pnpm

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行。

**开发特性:**
- 热模块更新 (HMR)
- 实时TypeScript类型检查
- 快速的编译和刷新

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

---

## 📚 核心依赖详解

### Ant Design Vue
企业级UI库，提供50+高质量组件：
- 布局、菜单、表格
- 表单、输入框、选择框
- 模态框、抽屉、气泡卡片
- 日期选择、时间选择、级联选择

### Vue Router
单页应用路由库：
- 动态路由匹配
- 嵌套路由
- 路由懒加载
- 导��守卫

### @antv/g2plot
图表库，支持：
- 折线图、柱状图
- 散点图、热力图
- 仪表盘、漏斗图

### xlsx
Excel处理库：
- 读取/生成Excel文件
- 数据导入导出
- 格式处理

### dayjs
日期时间处理：
- 日期格式化
- 日期计算
- 国际化支持

---

## 📝 开发规范

### TypeScript使用
- ✅ 启用严格模式
- ✅ 检查未使用的变量
- ✅ 为函数添加类型注解
- ✅ 为对象属性添加类型定义

### 代码风格
- 使用TypeScript进行类型检查
- 遵循Vue 3 Composition API最佳实践
- 组件使用单文件组件格式 (.vue)
- 正确处理模块导入

---

## 🔧 常见问题

### Q: 如何添加新的页面？
A: 在 `src/views` 目录创建新的Vue文件，然后在路由文件中注册。

### Q: 如何使用Ant Design组件？
A: 直接从 `ant-design-vue` 导入所需组件。

### Q: 如何处理日期？
A: 使用 dayjs 库进行日期处理。

### Q: 如何导出Excel文件？
A: 使用 xlsx 库创建和导出Excel文件。

---

## 📦 部署指南

### 构建优化
1. 运行 `npm run build` 生成生产版本
2. 分析构建产物大小
3. 配置CDN加速静态资源
4. 启用gzip压缩

### 部署步骤
```bash
# 1. 构建
npm run build

# 2. 上传dist文件夹到服务器
# 3. 配置Web服务器（nginx/apache）
# 4. 配置反向代理
# 5. 测试验证
```

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 仓库大小 | 1.9 MB |
| Stars | 0 |
| Forks | 0 |
| Open Issues | 0 |
| 最后更新 | 2026年2月9日 |

---

## ✨ 特色功能（计划）

- [ ] 商户账户管理
- [ ] 订单管理系统
- [ ] 数据分析仪表板
- [ ] 财务报表统计
- [ ] 商品库存管理
- [ ] 客户关系管理(CRM)
- [ ] 权限控制系统
- [ ] 实时通知提醒

---

## 📚 推荐学习资源

- [Vue 3官方文档](https://vuejs.org/)
- [Vite官方文档](https://vitejs.dev/)
- [Ant Design Vue文档](https://www.antdv.com/)
- [Vue Router文档](https://router.vuejs.org/)
- [TypeScript文档](https://www.typescriptlang.org/)

---

**最后更新**: 2026年2月9日  
**版本**: 0.0.0（初始版本）