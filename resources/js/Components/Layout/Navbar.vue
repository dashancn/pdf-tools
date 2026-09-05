<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { isDark, toggleDarkMode } from '@/Composables/useDarkMode';

const mobileMenuOpen = ref(false);

const companyTools = [
    {
        name: 'i方案',
        href: 'https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=ecosystem_nav',
        primary: true,
        tooltip: '内容创作、客户跟单、文生图与视频制作方案。',
    },
    {
        name: '开发者工具',
        href: 'https://tools.i41.cn',
        tooltip: '编码转换、格式化、加密、网络、文本和图片等常用在线工具。',
    },
    {
        name: '图片压缩',
        href: 'https://imgzip.i41.cn',
        tooltip: '在线压缩、调整图片尺寸和转换格式。',
    },
    {
        name: '智能抠图',
        href: 'https://imgzip.i41.cn/remove-background/',
        tooltip: '自动识别主体并移除图片背景。',
    },
    {
        name: '多图拼接',
        href: 'https://imgzip.i41.cn/collage/',
        tooltip: '将多张图片快速拼接为一张长图或网格图。',
    },
    {
        name: 'PDF 工具',
        href: '/',
        active: true,
        tooltip: 'PDF 合并、拆分、压缩、转换、编辑和发票拼版等工具。',
    },
    {
        name: '证件水印',
        href: 'https://watermark.i41.cn',
        tooltip: '为证件和合同截图添加用途水印。',
    },
    {
        name: '临时剪贴板',
        href: 'https://clip.i41.cn',
        tooltip: '跨设备传递自动过期的临时文本。',
    },
    {
        name: '证件照',
        href: 'https://idphoto.i41.cn',
        tooltip: '制作常用尺寸和背景颜色的证件照。',
    },
];

function closeMobileMenu() {
    mobileMenuOpen.value = false;
}
</script>

<template>
    <nav class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-label="i41 工具导航">
        <div class="mx-auto max-w-[1104px] px-4">
            <div class="flex h-16 items-center justify-between gap-3">
                <div class="flex shrink-0 items-center gap-3">
                    <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80 dark:text-white">
                        <span class="text-2xl" aria-hidden="true">🧰</span>
                        <span>PDF 工具箱</span>
                    </RouterLink>
                    <span class="hidden rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 xl:inline-flex dark:bg-emerald-950/40 dark:text-emerald-300">文件尽量在本地处理</span>
                </div>

                <div class="hidden items-center gap-1 lg:flex">
                    <template v-for="item in companyTools" :key="item.name">
                        <RouterLink
                            v-if="item.active"
                            to="/"
                            aria-current="page"
                            :title="item.tooltip"
                            class="rounded-md bg-blue-50 px-2 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:px-2.5 dark:bg-blue-950/50 dark:text-blue-200"
                        >
                            {{ item.name }}
                        </RouterLink>
                        <a
                            v-else
                            :href="item.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            :title="item.tooltip"
                            :class="['rounded-md px-2 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:px-2.5', item.primary ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white']"
                        >
                            {{ item.name }}
                        </a>
                    </template>
                    <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" @click="toggleDarkMode">
                        <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
                    </button>
                    <LanguageSwitcher />
                </div>

                <button type="button" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-700" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen" aria-label="打开工具导航" @click="mobileMenuOpen = !mobileMenuOpen">
                    <span aria-hidden="true">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
                </button>
            </div>
        </div>

        <div v-if="mobileMenuOpen" id="mobile-menu" class="border-t border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-gray-700 dark:bg-gray-800">
            <div class="mx-auto grid max-w-[1104px] gap-2 sm:grid-cols-2">
                <template v-for="item in companyTools" :key="item.name">
                    <RouterLink v-if="item.active" to="/" aria-current="page" :title="item.tooltip" class="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-200" @click="closeMobileMenu">{{ item.name }}</RouterLink>
                    <a v-else :href="item.href" target="_blank" rel="noopener noreferrer" :title="item.tooltip" :class="['rounded-md px-3 py-2 text-sm font-semibold', item.primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200']" @click="closeMobileMenu">{{ item.name }}</a>
                </template>
            </div>
            <div class="mx-auto mt-3 flex max-w-[1104px] items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <LanguageSwitcher />
                <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" @click="toggleDarkMode">{{ isDark ? '☀️' : '🌙' }}</button>
            </div>
        </div>
    </nav>
</template>
