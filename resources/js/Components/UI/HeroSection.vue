<script setup lang="ts">
import { trans } from '@/i18n';
</script>

<template>
    <section class="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-4 py-20 text-white sm:py-28">
        <div class="mx-auto max-w-4xl text-center">
            <h1 class="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
                PDF <span class="text-blue-200">工具箱</span>
            </h1>

            <p class="mb-6 text-xl font-medium text-blue-100 sm:text-2xl">
                {{ trans('home.subtitle') }}
            </p>

            <p class="mx-auto max-w-2xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
                {{ trans('home.description') }}
            </p>

            <aside class="mx-auto mt-8 flex max-w-3xl flex-col items-start justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-left text-gray-900 shadow-lg sm:flex-row sm:items-center">
                <div>
                    <strong class="block text-lg font-bold text-amber-950">关注 i方案</strong>
                    <span class="mt-1 block text-sm text-amber-800">获取内容创作、客户跟单、文生图与视频制作方案</span>
                </div>
                <a
                    href="https://www.i41.cn?utm_source=pdf&utm_medium=tool_referral&utm_campaign=ifangan&utm_content=promo_banner"
                    class="inline-flex shrink-0 items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    :title="trans('ecosystem.iplan_tip')"
                >
                    i方案 →
                </a>
            </aside>
        </div>
    </section>
</template>
