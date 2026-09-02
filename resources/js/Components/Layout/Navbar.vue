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
        featured: true,
        tooltip: 'i方案是一套面向本地实体商家、内容运营人员和营销服务团队的智能内容工作平台。平台围绕行业、平台、品类、风格和使用场景，提供文案生成、文案诊断、客户跟单话术、文生图、视频包制作和精品模板等能力，帮助用户从内容构思、表单草稿、生成优化到后续复用形成完整工作链路。',
    },
    {
        name: '开发者工具',
        href: 'https://tools.i41.cn',
        tooltip: '开发者工具箱汇集编码转换、格式化、加密、网络、文本和图片等常用在线工具，强调快速、易用和浏览器端处理。',
    },
    {
        name: '图片压缩',
        href: 'https://imgzip.i41.cn',
        tooltip: '图片修改压缩是一款浏览器端在线图片处理工具，支持压缩、调整尺寸和格式转换，适合日常上传、分享和网页优化。',
    },
    {
        name: '证件照',
        href: 'https://idphoto.i41.cn',
        tooltip: '证件照工作室支持本地智能抠图、背景换色、常用证件尺寸和 300DPI 多图拼版，照片无需上传到业务服务器。',
    },
    {
        name: '证件水印',
        href: 'https://watermark.i41.cn',
        tooltip: '证件水印工具支持为身份证、营业执照和合同截图添加用途水印，图片仅在浏览器本地处理。',
    },
    {
        name: '临时剪贴板',
        href: 'https://clip.i41.cn',
        tooltip: '临时剪贴板支持客户端加密、自动过期、读取次数限制和阅后即焚，适合跨设备传递临时文本。',
    },
    {
        name: 'PDF 工具',
        href: '/',
        tooltip: 'PDF 工具箱提供 PDF 合并、拆分、压缩、转换、编辑和发票拼版等浏览器端工具，文件无需上传。',
    },
];

function closeMobileMenu() {
    mobileMenuOpen.value = false;
}
</script>

<template>
    <nav class="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/30" aria-label="i41 工具导航">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex min-h-16 items-center justify-between gap-4">
                <RouterLink to="/" class="flex shrink-0 items-center gap-2 text-xl font-bold text-gray-900 transition-opacity hover:opacity-80 dark:text-white">
                    <span class="text-2xl" aria-hidden="true">🧰</span>
                    <span>PDF 工具箱</span>
                </RouterLink>

                <div class="hidden items-center gap-0.5 xl:flex">
                    <template v-for="item in companyTools" :key="item.name">
                        <RouterLink
                            v-if="item.href === '/'"
                            to="/"
                            class="group relative rounded-md px-2 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 2xl:px-3 2xl:text-sm dark:text-blue-300 dark:hover:bg-gray-700"
                        >
                            {{ item.name }}
                            <span role="tooltip" class="invisible absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100">{{ item.tooltip }}</span>
                        </RouterLink>
                        <a
                            v-else
                            :href="item.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            :class="['group relative rounded-md px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 2xl:px-3 2xl:text-sm', item.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white']"
                        >
                            {{ item.name }}
                            <span role="tooltip" class="invisible absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100">{{ item.tooltip }}</span>
                        </a>
                    </template>
                    <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" @click="toggleDarkMode">
                        <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
                    </button>
                    <LanguageSwitcher />
                </div>

                <button type="button" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 xl:hidden dark:hover:bg-gray-700" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen" aria-label="打开工具导航" @click="mobileMenuOpen = !mobileMenuOpen">
                    <span aria-hidden="true">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
                </button>
            </div>
        </div>

        <div v-if="mobileMenuOpen" id="mobile-menu" class="border-t border-gray-200 bg-white px-4 py-3 xl:hidden dark:border-gray-700 dark:bg-gray-800">
            <div class="grid gap-2 sm:grid-cols-2">
                <template v-for="item in companyTools" :key="item.name">
                    <RouterLink v-if="item.href === '/'" to="/" :title="item.tooltip" class="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-gray-700 dark:text-blue-300" @click="closeMobileMenu">{{ item.name }}<span class="block text-xs font-normal opacity-75">{{ item.tooltip }}</span></RouterLink>
                    <a v-else :href="item.href" target="_blank" rel="noopener noreferrer" :title="item.tooltip" :class="['rounded-md px-3 py-2 text-sm font-semibold', item.featured ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200']" @click="closeMobileMenu">{{ item.name }}<span class="block text-xs font-normal opacity-75">{{ item.tooltip }}</span></a>
                </template>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <LanguageSwitcher />
                <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" @click="toggleDarkMode">{{ isDark ? '☀️' : '🌙' }}</button>
            </div>
        </div>
    </nav>
</template>
