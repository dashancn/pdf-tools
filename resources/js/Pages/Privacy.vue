<script setup lang="ts">
import { onMounted } from 'vue';
import { trans } from '@/i18n';
import { useSeoMeta } from '@/Composables/useSeoMeta';

onMounted(() => {
    useSeoMeta(
        `${trans('privacy.title')} - PDF 工具箱`,
        trans('privacy.intro'),
        '/#/privacy',
        null,
    );
});
</script>

<template>
    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{{ trans('privacy.title') }}</h1>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{ trans('privacy.last_updated') }}: 2026-09-03</p>

        <div class="space-y-8 text-gray-700 leading-relaxed dark:text-gray-300">
            <!-- Intro -->
            <section>
                <p>{{ trans('privacy.intro') }}</p>
            </section>

            <!-- No file upload -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.no_upload_title') }}</h2>
                <p>{{ trans('privacy.no_upload_text') }}</p>
                <p class="mt-2">文件、文件名、OCR 内容和用户输入仍只在浏览器本地处理，不会发送给匿名统计服务，也不会生成用于识别用户的永久标识。</p>
            </section>

            <!-- Data collected -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.data_collected_title') }}</h2>
                <p class="mb-2">{{ trans('privacy.data_collected_text') }}</p>
                <ul class="ml-6 list-disc space-y-1">
                    <li>{{ trans('privacy.data_locale') }}</li>
                    <li>本站使用 i41 匿名统计记录访问、性能、UTM 与跨站点击，不包含文件、文件名、OCR 内容、用户输入或永久标识。</li>
                    <li>生产环境保留由 Cloudflare Pages 注入的 Cloudflare Web Analytics。</li>
                </ul>
            </section>

            <!-- Cookies -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.cookies_title') }}</h2>
                <p class="mb-2">{{ trans('privacy.cookies_text') }}</p>
                <ul class="ml-6 list-disc space-y-1">
                    <li><strong>localStorage</strong> — {{ trans('privacy.cookies_locale') }}</li>
                </ul>
            </section>

            <!-- Third party links -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.third_party_title') }}</h2>
                <p>{{ trans('privacy.third_party_text') }}</p>
            </section>

            <!-- Children -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.children_title') }}</h2>
                <p>{{ trans('privacy.children_text') }}</p>
            </section>

            <!-- Changes -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.changes_title') }}</h2>
                <p>{{ trans('privacy.changes_text') }}</p>
            </section>

            <!-- Contact -->
            <section>
                <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{{ trans('privacy.contact_title') }}</h2>
                <p>{{ trans('privacy.contact_text') }}</p>
            </section>
        </div>
    </div>
</template>
