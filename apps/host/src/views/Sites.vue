<script setup lang="ts">
import { useHostStore } from '@/stores'
import { BaseSwitch, IconWrapper } from 'shared'
import { ref } from 'vue'

const hostStore = useHostStore()

function handleCopyUrl(siteKey?: string | number) {
  const url = `${hostStore.clientUrl}${siteKey ? '&site=' + siteKey : ''}`
  navigator.clipboard.writeText(url)
  console.log('copied url:', url)
}
const newSiteName = ref('')

async function handleAddSite() {
  hostStore.addSite(newSiteName.value).then(() => {
    newSiteName.value = ''
  })
}

const showDeleteGuard = ref(false)
const stageDeleteKey = ref('')
function openDeleteGuard(key: string | number) {
  stageDeleteKey.value = String(key)
  showDeleteGuard.value = true
}
function closeDeleteGuard() {
  console.log('!!')
  showDeleteGuard.value = false
}
async function handleDelete() {
  hostStore.deleteSite(stageDeleteKey.value).then(() => (showDeleteGuard.value = false))
}
</script>
<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center border-b pb-2 text-gray-400 transition-colors active:text-white">
      <div>
        <p>無使用者設定連結：</p>
        <p class="text-xs">
          <a :href="`${hostStore.clientUrl}`" target="_blank">{{ `${hostStore.clientUrl}` }}</a>
        </p>
      </div>
      <button type="button" @click="handleCopyUrl()" class="inline-block h-10 w-10">
        <IconWrapper name="file-copy-line" class="text-2xl" />
      </button>
    </div>
    <aside class="-mx-5 overflow-auto">
      <ul class="divide-y px-5">
        <li class="py-4 text-base" v-for="(i, key) in hostStore.sites" :key="key">
          <div class="flex items-center justify-between">
            <div>
              <span>使用者名稱：</span>
              <input
                :value="i.name"
                type="text"
                class="bg-tertiary-2 rounded px-3 py-2 text-lg shadow-inner"
                @change="hostStore.updateSites(key, { name: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <BaseSwitch
              :key="key"
              :modelValue="i.need_review"
              :disabled="hostStore.settings?.top_switch"
              @update:modelValue="hostStore.updateSites(key, { need_review: $event })"
            />
          </div>
          <div class="mt-1 flex text-neutral-400 transition-colors duration-150 active:text-white">
            <a :href="`${hostStore.clientUrl}&site=${key}`" target="_blank" class="text-start text-xs">
              URL: {{ `${hostStore.clientUrl}&site=` }}<span class="text-natural-gray1">{{ key }}</span>
            </a>
            <div class="whitespace-nowrap">
              <button class="inline-block h-10 w-10" @click="openDeleteGuard(key)">
                <IconWrapper name="delete-bin-line" class="text-system-error2 text-2xl" />
              </button>
              <button class="inline-block h-10 w-10" @click="handleCopyUrl(key)">
                <IconWrapper name="file-copy-line" class="text-2xl" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </aside>

    <aside class="-mx-5 mt-auto space-y-3 border-t px-5 pt-3">
      <div class="flex items-center text-2xl">
        <BaseSwitch
          :modelValue="!!hostStore.settings?.top_switch"
          label="All Pass"
          class="w-14"
          @update:modelValue="hostStore.updateSettings({ top_switch: $event })"
        />
      </div>
      <form @submit.prevent="handleAddSite" class="flex items-center">
        <label for="add_new_site" class="align-middle">新增：</label>
        <input
          v-model="newSiteName"
          id="add_new_site"
          type="text"
          class="bg-tertiary-2 flex-1 rounded px-3 py-2 text-lg shadow-inner"
        />
        <button
          type="button"
          class="ml-3 flex h-10 w-10 items-center justify-center rounded-md border text-lg"
          @click="handleAddSite"
        >
          <IconWrapper name="add-line" class="!text-2xl" />
        </button>
      </form>
    </aside>

    <Transition
      enterActiveClass="transition-opacity"
      leaveActiveClass="transition-opacity"
      enterToClass="opacity-100"
      enterFromClass="opacity-0"
      leaveFromClass="opacity-100"
      leaveToClass="opacity-0"
    >
      <div v-if="showDeleteGuard" class="fixed inset-0">
        <div class="bg-tertiary-1/30 fixed inset-0 z-20 backdrop-blur" @click="closeDeleteGuard" />

        <div class="relative z-30 flex h-full w-full items-center justify-center">
          <div class="bg-tertiary-2 shadow-10 space-y-4 rounded-lg p-5 !text-gray-50 shadow-slate-900">
            <h3 class="text-2xl">確定要刪除？</h3>
            <p>刪除的話，即使新增了一樣名稱的 Site<br />也必須重新印 QRcode / 把網址做更新。</p>
            <div class="flex justify-end gap-4">
              <button type="button" class="border px-4 py-2" @click="closeDeleteGuard">取消</button>
              <button type="button" class="bg-primary px-4 py-2" @click="handleDelete">確定刪除</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
