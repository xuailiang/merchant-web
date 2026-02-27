merchant-web
AI 生成的纯前端 项目 ant + vue3

商户后台接口文档（草案）
说明：当前项目为静态 mock 数据。此文档用于后续接入真实接口。 约定：所有接口返回统一结构 { code: 0, message: 'ok', data: ... }。

通用约定
Base URL: VITE_API_BASE_URL
Header: Authorization: Bearer <token>
Header: Content-Type: application/json
时间格式：YYYY-MM-DD HH:mm:ss
分页参数：page（页码）、pageSize（每页数量）
商品管理
GET /products
用途：获取商品列表
Query

name 商品名称
code 商品编码
category 类目
brand 品牌
statuses 商品状态（支持多选，重复参数）
priceMin / priceMax 售价区间
stockMin / stockMax 库存区间
startDate / endDate 上架日期区间
page / pageSize
Response

{
"code": 0,
"message": "ok",
"data": {
"total": 120,
"list": [
{
"key": "p1",
"name": "星曜Pro 智能手机 256G",
"category": "数码/手机",
"price": 3499,
"cost": 2899,
"stock": 58,
"sales": 326,
"status": "上架中",
"listedAt": "2026-01-22",
"updatedAt": "2026-02-01 12:01:12",
"code": "10242601000224",
"brand": "星曜",
"image": "https://...",
"channel": "积分商城",
"shop": "星辰旗舰店"
}
]
}
}
订单管理
GET /orders
用途：获取订单列表
Query

orderId 订单编号
statuses 订单状态（多选）
orderCode 下单号码
productName 商品名称
phone 收货人手机号
orderStart / orderEnd 下单时间区间
payStart / payEnd 支付时间区间
page / pageSize
Response

{
"code": 0,
"message": "ok",
"data": {
"total": 80,
"list": [
{
"id": "DD2026020501703",
"status": "取消",
"orderTime": "2026-02-05 17:03",
"payTime": "暂未获取到支付信息",
"orderCode": "13567546709",
"quantity": 1,
"unitPrice": "¥55",
"paidAmount": "¥60",
"payMethod": "暂未获取到支付信息",
"receiver": "admin",
"phone": "13567546709",
"note": "/",
"settlement": "未结算",
"items": [
{
"name": "测试1129 颜色 包色 内存 4G 容量规格 128GB",
"spec": "颜色：包色 / 内存：4G / 128GB",
"spu": "1002251200002102",
"image": "https://...",
"price": "¥55",
"qty": 1
}
]
}
]
}
}
售后/退款中心
GET /after-sales
用途：获取售后列表
Query

keyword 关键词（售后单号/订单号/客户）
type 售后类型
status 状态
startDate / endDate 申请时间区间
page / pageSize
Response

{
"code": 0,
"message": "ok",
"data": {
"total": 20,
"list": [
{
"id": "AS20260204001",
"orderId": "DD2026020417142",
"customer": "周女士",
"type": "仅退款",
"status": "待审核",
"refundAmount": 60,
"payAmount": 60,
"reason": "未收到货",
"phone": "13567546709",
"applyTime": "2026-02-04 10:12"
}
]
}
}
结算管理
GET /settlements/payments
用途：打款单列表
Query

supplier 供货商名称
status 是否结算
summary 是否汇总
startDate / endDate 结算日期区间
page / pageSize
GET /settlements/details
用途：打款单明细
Query

supplier 供货商名称
status 是否结算
startDate / endDate 结算日期区间
page / pageSize
Response 同上，字段参考页面表格结构

资源管理（可选）
GET /assets
用途：素材列表（图片/视频）
Query

type 素材类型（image/video）
folderId 分类
keyword 搜索关键词
page / pageSize
POST /assets
用途：上传素材
Body

type 素材类型
name 名称
url 文件地址（或上传后回填）
folderId
如果你需要，我可以继续补充 “登录、角色权限、营销活动、发货管理”等接口文档。

登录 / 权限
POST /auth/login
用途：登录并获取 Token
Body

username 用户名/手机号
password 密码
Response

{
"code": 0,
"message": "ok",
"data": {
"token": "Bearer xxx",
"user": {
"id": "u1",
"name": "管理员",
"role": "admin",
"permissions": ["dashboard:view", "orders:view", "..."]
}
}
}
GET /auth/profile
用途：获取当前用户信息
Header

Authorization: Bearer <token>
GET /auth/permissions
用途：获取权限矩阵与角色
Response

{
"code": 0,
"message": "ok",
"data": {
"roles": [
{ "key": "admin", "name": "管理员" },
{ "key": "operator", "name": "运营人员" }
],
"permissions": [
{ "key": "orders:view", "label": "订单查看" },
{ "key": "orders:ship", "label": "订单发货" }
],
"matrix": {
"admin": ["orders:view", "orders:ship"],
"operator": ["orders:view"]
}
}
}
营销活动 / 优惠券
GET /marketing/coupons
用途：优惠券列表
Query

keyword 关键词
status 状态
startDate / endDate 有效期
page / pageSize
POST /marketing/coupons
用途：创建优惠券
Body

name 名称
type 类型（满减/折扣/无门槛）
amount 面额
threshold 使用门槛
stock 发放数量
startTime / endTime 有效期
scopes 使用范围（类目/商品ID）
GET /marketing/campaigns
用途：活动列表
Query

type 活动类型（秒杀/满减/拼团等）
status 状态
page / pageSize
POST /marketing/campaigns
用途：创建活动
Body

name 活动名称
type 活动类型
startTime / endTime
rules 活动规则
products 关联商品列表
发货管理
GET /shipping/orders
用途：待发货订单
Query

keyword 订单号/收件人
status 状态（待发货/已发货）
page / pageSize
POST /shipping/ship
用途：发货
Body

orderId 订单号
expressList 多快递数组
company 快递公司
trackingNo 运单号
items 发货商品明细
POST /shipping/batch
用途：批量发货
Body

开放平台
GET /open-platform/webhooks
用途：Webhook 列表
Query

keyword 名称/回调地址
enabled 是否启用
page / pageSize
POST /open-platform/webhooks
用途：创建 Webhook
Body

name 名称
url 回调地址
events 订阅事件数组（如 order.created）
timeoutSec 超时秒数
retryLimit 重试次数
enabled 是否启用
GET /open-platform/api-keys
用途：API Key 列表
Query

keyword 应用名称
status 状态（active/disabled/revoked）
page / pageSize
POST /open-platform/api-keys
用途：创建 API Key
Body

appName 应用名称
scopes 权限范围数组
ipWhitelist IP 白名单
expireAt 过期时间（YYYY-MM-DD）
Response

{
"code": 0,
"message": "ok",
"data": {
"id": "ak_102",
"keyPrefix": "ak_live_ab12",
"secret": "sk_xxx"
}
}
GET /open-platform/integrations
用途：第三方对接列表（ERP/WMS）
Query

category ERP/WMS
status connected/error/disconnected
page / pageSize
PUT /open-platform/integrations/:id
用途：更新对接配置
Body

syncMode push/pull
endpoint 对接地址
appKey 应用密钥
warehouseMapping 仓库映射
POST /open-platform/integrations/:id/sync
用途：手动触发同步
Response

{
"code": 0,
"message": "ok",
"data": { "taskId": "sync_202602271104" }
}

fileUrl 上传的模板文件地址
GET /shipping/tracking
用途：物流轨迹
Query

trackingNo 运单号
company 快递公司
运费管理
GET /shipping/templates
用途：运费模板列表
Query

keyword 模板名称
type 计费方式（按件/按重）
page / pageSize
POST /shipping/templates
用途：新增运费模板
Body

name 模板名称
shopId 店铺
type 计费方式
defaultRule 默认运费规则
areaRules 指定地区规则数组
freeRules 包邮规则
excludeAreas 不配送区域
