<template>
  <div>
    <div class="page-title">资源管理</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">资源总数</div>
          <div class="stat-value">{{ assets.length }}</div>
          <div class="stat-meta">图片 {{ imageCount }} · 视频 {{ videoCount }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">已使用</div>
          <div class="stat-value">{{ usedCount }}</div>
          <div class="stat-meta">使用率 {{ usageRate }}%</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">占用空间</div>
          <div class="stat-value">{{ totalSize }}GB</div>
          <div class="stat-meta">近7天上传 {{ recentUploads }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">分类数</div>
          <div class="stat-value">{{ folderCount }}</div>
          <div class="stat-meta">默认/活动/商品/装修</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="filters.keyword" placeholder="搜索文件名/标签" allow-clear style="width: 220px" />
          <a-select
            v-model:value="filters.folder"
            :options="folderOptions"
            allow-clear
            placeholder="全部分类"
            style="width: 160px"
            :get-popup-container="getPopupContainer"
          />
          <a-select
            v-model:value="filters.usage"
            :options="usageOptions"
            allow-clear
            placeholder="使用状态"
            style="width: 140px"
            :get-popup-container="getPopupContainer"
          />
        </div>
        <a-space>
          <a-button type="primary" @click="uploadOpen = true">上传素材</a-button>
          <a-button @click="folderOpen = true">新建分类</a-button>
          <a-button type="dashed">批量删除</a-button>
        </a-space>
      </div>

      <a-tabs v-model:activeKey="activeTab" class="asset-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="image" tab="图片" />
        <a-tab-pane key="video" tab="视频" />
      </a-tabs>

      <div class="asset-grid">
        <a-card
          v-for="item in filteredAssets"
          :key="item.key"
          class="asset-card"
          :body-style="{ padding: '12px' }"
          @click="openDetail(item)"
        >
          <div class="asset-thumb" :class="{ 'is-video': item.type === 'video' }">
            <img :src="item.cover" alt="asset" />
            <div v-if="item.type === 'video'" class="asset-play">▶</div>
          </div>
          <div class="asset-title">{{ item.name }}</div>
          <div class="asset-meta">{{ item.folder }} · {{ item.size }}MB</div>
          <div class="asset-tags">
            <a-tag v-for="tag in item.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>
          <div class="asset-footer">
            <a-tag :color="item.used ? 'green' : 'default'">{{ item.used ? '已使用' : '未使用' }}</a-tag>
            <span class="asset-date">{{ item.updatedAt }}</span>
          </div>
        </a-card>
      </div>
    </a-card>

    <a-drawer v-model:open="detailOpen" title="资源详情" width="520" :destroy-on-close="true">
      <template v-if="currentAsset">
        <div class="detail-cover">
          <img :src="currentAsset.cover" alt="cover" />
        </div>
        <a-descriptions :column="2" size="small" class="detail-info">
          <a-descriptions-item label="名称">{{ currentAsset.name }}</a-descriptions-item>
          <a-descriptions-item label="类型">{{ currentAsset.type === 'video' ? '视频' : '图片' }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ currentAsset.folder }}</a-descriptions-item>
          <a-descriptions-item label="大小">{{ currentAsset.size }}MB</a-descriptions-item>
          <a-descriptions-item label="分辨率">{{ currentAsset.resolution }}</a-descriptions-item>
          <a-descriptions-item label="上传人">{{ currentAsset.owner }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentAsset.updatedAt }}</a-descriptions-item>
          <a-descriptions-item label="使用状态">{{ currentAsset.used ? '已使用' : '未使用' }}</a-descriptions-item>
        </a-descriptions>
        <a-card class="detail-card" title="使用位置">
          <a-space wrap>
            <a-tag v-for="place in currentAsset.usage" :key="place" color="purple">{{ place }}</a-tag>
            <div v-if="currentAsset.usage.length === 0" class="detail-empty">暂无使用记录</div>
          </a-space>
        </a-card>
        <a-card class="detail-card" title="操作">
          <a-space>
            <a-button type="primary">复制链接</a-button>
            <a-button>下载</a-button>
            <a-button danger>删除</a-button>
          </a-space>
        </a-card>
      </template>
    </a-drawer>

    <a-modal v-model:open="uploadOpen" title="上传素材" width="640px" :footer="null">
      <a-form layout="vertical">
        <a-form-item label="上传到分类" required>
          <a-select
            v-model:value="uploadForm.folder"
            :options="folderOptions"
            placeholder="请选择分类"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="素材类型" required>
          <a-radio-group v-model:value="uploadForm.type">
            <a-radio value="image">图片</a-radio>
            <a-radio value="video">视频</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="选择文件" required>
          <a-upload v-model:file-list="uploadForm.files" :before-upload="() => false" list-type="picture-card">
            <div>
              <div class="upload-plus">+</div>
              <div>上传文件</div>
            </div>
          </a-upload>
          <div class="detail-empty">支持 jpg/png/mp4，单文件不超过 50MB。</div>
        </a-form-item>
        <a-form-item label="标签">
          <a-select v-model:value="uploadForm.tags" mode="tags" placeholder="输入标签后回车" />
        </a-form-item>
        <a-space>
          <a-button @click="uploadOpen = false">取消</a-button>
          <a-button type="primary" @click="submitUpload">确认上传</a-button>
        </a-space>
      </a-form>
    </a-modal>

    <a-modal v-model:open="folderOpen" title="新建分类" width="420px" :footer="null">
      <a-form layout="vertical">
        <a-form-item label="分类名称" required>
          <a-input v-model:value="newFolder" placeholder="请输入分类名称" />
        </a-form-item>
        <a-space>
          <a-button @click="folderOpen = false">取消</a-button>
          <a-button type="primary" @click="createFolder">确认创建</a-button>
        </a-space>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { ASSETS, type AssetItem, getAssetFolders } from '../mock/assets'

const activeTab = ref('all')
const detailOpen = ref(false)
const currentAsset = ref<AssetItem | null>(null)

const filters = ref({
  keyword: '',
  folder: '',
  usage: '',
})

const folderOptions = ref(getAssetFolders().map((item) => ({ label: item, value: item })))
const usageOptions = [
  { label: '已使用', value: 'used' },
  { label: '未使用', value: 'unused' },
]

const assets = ref<AssetItem[]>([...ASSETS])
const uploadOpen = ref(false)
const folderOpen = ref(false)
const newFolder = ref('')
const uploadForm = ref({
  folder: '',
  type: 'image',
  files: [] as any[],
  tags: [] as string[],
})
const folderCount = computed(() => folderOptions.value.length)

const filteredAssets = computed(() => {
  return assets.value.filter((item) => {
    if (activeTab.value !== 'all' && item.type !== activeTab.value) return false
    if (filters.value.keyword && !item.name.includes(filters.value.keyword)) return false
    if (filters.value.folder && item.folder !== filters.value.folder) return false
    if (filters.value.usage === 'used' && !item.used) return false
    if (filters.value.usage === 'unused' && item.used) return false
    return true
  })
})

const openDetail = (item: AssetItem) => {
  currentAsset.value = item
  detailOpen.value = true
}

const imageCount = computed(() => assets.value.filter((item) => item.type === 'image').length)
const videoCount = computed(() => assets.value.filter((item) => item.type === 'video').length)
const usedCount = computed(() => assets.value.filter((item) => item.used).length)
const usageRate = computed(() => (assets.value.length ? Math.round((usedCount.value / assets.value.length) * 100) : 0))
const totalSize = 3.6
const recentUploads = 8

const submitUpload = () => {
  if (!uploadForm.value.folder || uploadForm.value.files.length === 0) {
    message.warning('请选择分类并上传文件')
    return
  }
  uploadForm.value.files.forEach((file: any, index: number) => {
    const key = `u-${Date.now()}-${index}`
    assets.value.unshift({
      key,
      name: file.name ?? '新素材',
      type: uploadForm.value.type as 'image' | 'video',
      folder: uploadForm.value.folder,
      size: 2.1,
      tags: uploadForm.value.tags.length ? uploadForm.value.tags : ['新素材'],
      used: false,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      cover: file.thumbUrl || 'https://picsum.photos/seed/newasset/400/300',
      url: file.thumbUrl || 'https://picsum.photos/seed/newasset/1200/800',
      resolution: '1200x800',
      owner: '当前用户',
      usage: [],
    })
  })
  uploadForm.value = { folder: '', type: 'image', files: [], tags: [] }
  uploadOpen.value = false
  message.success('素材已上传')
}

const createFolder = () => {
  const name = newFolder.value.trim()
  if (!name) {
    message.warning('请输入分类名称')
    return
  }
  const exists = folderOptions.value.some((item) => item.value === name)
  if (exists) {
    message.warning('分类已存在')
    return
  }
  folderOptions.value.push({ label: name, value: name })
  newFolder.value = ''
  folderOpen.value = false
  message.success('分类已创建')
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.stat-title {
  color: var(--text-secondary);
  font-size: 12px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 4px;
}

.stat-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.asset-tabs {
  margin-bottom: 12px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.asset-card {
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.asset-card:hover {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.asset-thumb {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.asset-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  background: rgba(15, 23, 42, 0.35);
}

.asset-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.asset-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.asset-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.upload-plus {
  font-size: 20px;
  line-height: 20px;
}

.detail-cover {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.detail-cover img {
  width: 100%;
  display: block;
}

.detail-info {
  margin-bottom: 12px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-empty {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
