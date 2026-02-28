<template>
  <a-card title="素材信息" class="wizard-section-card">
    <a-form layout="vertical">
      <a-form-item label="商品图片" required>
        <div class="help-text">建议上传高清图片，最多8张，首图为主图。</div>
        <a-upload
          list-type="picture-card"
          :file-list="imageList"
          :before-upload="beforeUpload"
          @preview="onPreviewImage"
          @remove="onRemoveImage"
        >
          <div v-if="imageList.length < 8">
            <PlusOutlined />
            <div style="margin-top: 8px">上传图片</div>
          </div>
        </a-upload>
        <a-space>
          <a-button size="small" @click="emit('openAssetPicker', 'image', null)"
            >从素材库选择</a-button
          >
          <a-tag v-if="imageList.length" color="blue">主图：第 1 张</a-tag>
        </a-space>
      </a-form-item>

      <a-form-item label="商品视频">
        <div class="video-grid">
          <div class="video-box">
            <div class="video-box-head">主图视频</div>
            <div class="video-cover">
              <img :src="mainVideo.cover" alt="主图视频封面" />
              <div class="video-overlay"><PlayCircleOutlined /></div>
              <a-button class="video-delete" type="text" @click="emit('removeVideo', 'main')">
                <CloseOutlined />
              </a-button>
            </div>
            <div class="video-meta">
              <div class="video-name">{{ mainVideo.name || '未选择视频' }}</div>
              <div class="video-source">{{ mainVideo.source || '素材库' }}</div>
            </div>
            <a-button block @click="emit('openAssetPicker', 'video', 'main')"
              >选择主图视频</a-button
            >
          </div>

          <div class="video-box">
            <div class="video-box-head">
              <span>详情视频</span>
              <a-button type="link" size="small" @click="emit('syncVideo')">同步主图视频</a-button>
            </div>
            <div class="video-cover">
              <img :src="detailVideo.cover" alt="详情视频封面" />
              <div class="video-overlay"><PlayCircleOutlined /></div>
              <a-button class="video-delete" type="text" @click="emit('removeVideo', 'detail')">
                <CloseOutlined />
              </a-button>
            </div>
            <div class="video-meta">
              <div class="video-name">{{ detailVideo.name || '未选择视频' }}</div>
              <div class="video-source">{{ detailVideo.source || '素材库' }}</div>
            </div>
            <a-button block @click="emit('openAssetPicker', 'video', 'detail')"
              >选择详情视频</a-button
            >
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { CloseOutlined, PlayCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'
import type { MediaUploadItem, ProductVideoDraft } from '../../types/create-product'

defineProps<{
  imageList: MediaUploadItem[]
  mainVideo: ProductVideoDraft
  detailVideo: ProductVideoDraft
}>()

const emit = defineEmits<{
  (event: 'previewImage', file: MediaUploadItem): void
  (event: 'removeImage', file: MediaUploadItem): boolean
  (event: 'openAssetPicker', type: 'image' | 'video', target: 'main' | 'detail' | null): void
  (event: 'removeVideo', type: 'main' | 'detail'): void
  (event: 'syncVideo'): void
}>()

const beforeUpload: UploadProps['beforeUpload'] = () => false

const onPreviewImage: UploadProps['onPreview'] = (file) => {
  emit('previewImage', file as unknown as MediaUploadItem)
}

const onRemoveImage: UploadProps['onRemove'] = (file) =>
  emit('removeImage', file as unknown as MediaUploadItem)
</script>
