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
        tooltip: '图片修改压缩是一款浏览器端在线图片处理工具，支持压缩、调整尺寸和格式转换，图片尽量在本地处理，适合日常上传、分享和网页优化。',
    },
    {
        name: 'HEIC 转换',
        href: 'https://imgzip.i41.cn/heic-converter/',
        tooltip: 'HEIC 转换工具可在浏览器本地将 HEIC、HEIF 和 WebP 转为 JPG 或 PNG。',
    },
    {
        name: '智能抠图',
        href: 'https://imgzip.i41.cn/remove-background/',
        tooltip: '智能抠图在浏览器中自动移除图片背景，适合人像和商品图快速换背景。',
    },
    {
        name: '多图拼接',
        href: 'https://imgzip.i41.cn/collage/',
        tooltip: '多图拼接支持在浏览器中组合多张图片并调整布局。',
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
        name: '证件照',
        href: 'https://idphoto.i41.cn',
        tooltip: '证件照工作室是一款浏览器端证件照制作工具，支持本地智能抠图、背景换色、常用证件尺寸和 300DPI 多图拼版，照片无需上传到业务服务器。',
    },
];

function closeMobileMenu() {
    mobileMenuOpen.value = false;
}
</script>

<template>
    <nav class="sticky top-0 z-50 w-full overflow-x-hidden border-b border-gray-100 bg-white font-['Inter','PingFang_SC','Microsoft_YaHei',sans-serif] shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-label="i41 工具导航">
        <div class="mx-auto max-w-[1104px] px-4">
            <div class="flex h-16 items-center justify-between gap-3">
                <div class="flex min-w-0 shrink-0 items-center">
                    <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80 dark:text-white">
                        <span class="text-2xl" aria-hidden="true">🧰</span>
                        <span>PDF 工具箱</span>
                    </RouterLink>
                </div>

                <div class="hidden items-center gap-1 whitespace-nowrap lg:flex">
                    <a
                        v-for="item in companyTools"
                        :key="item.name"
                        :href="item.href"
                        :aria-describedby="`ecosystem-tip-${item.name}`"
                        :class="['group relative inline-flex whitespace-nowrap justify-center rounded-lg px-2 py-[7px] text-[13px] font-[650] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', item.primary ? 'min-w-[72px] bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white']"
                    >
                        {{ item.name }}
                        <span
                            :id="`ecosystem-tip-${item.name}`"
                            role="tooltip"
                            class="invisible absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 whitespace-normal rounded-md bg-gray-950 px-3 py-2 text-center text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
                        >
                            {{ item.tooltip }}
                        </span>
                    </a>
                    <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" @click="toggleDarkMode">
                        <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
                    </button>
                    <LanguageSwitcher />
                </div>

                <button type="button" class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-[7px] text-[12px] font-[650] text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-700" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen" :aria-label="mobileMenuOpen ? '关闭更多工具菜单' : '打开更多工具菜单'" @click="mobileMenuOpen = !mobileMenuOpen">
                    <span aria-hidden="true">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
                    <span>更多工具</span>
                </button>
            </div>
        </div>

        <div v-if="mobileMenuOpen" id="mobile-menu" class="flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto overscroll-contain border-t border-gray-200 bg-white px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden dark:border-gray-700 dark:bg-gray-800">
            <div class="mx-auto grid w-full max-w-[1104px] gap-2 sm:grid-cols-2">
                <a
                    v-for="item in companyTools"
                    :key="item.name"
                    :href="item.href"
                    :class="['rounded-lg px-2 py-[7px] text-right text-[12px] font-[650]', item.primary ? 'min-w-[72px] bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200']"
                    @click="closeMobileMenu"
                >
                    <span class="block text-right">{{ item.name }}</span>
                    <span class="mt-1 block text-right text-[12px] font-normal opacity-75">{{ item.tooltip }}</span>
                </a>
            </div>
            <div class="mx-auto mt-3 flex max-w-[1104px] items-center justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                <LanguageSwitcher />
                <button type="button" :aria-label="isDark ? '切换浅色模式' : '切换深色模式'" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" @click="toggleDarkMode">{{ isDark ? '☀️' : '🌙' }}</button>
            </div>
        </div>
    </nav>
</template>
