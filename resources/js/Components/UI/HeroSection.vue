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

            <a
                href="https://www.i41.cn"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:bg-yellow-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                :title="trans('ecosystem.iplan_tip')"
            >
                {{ trans('ecosystem.iplan') }}
                <span class="text-lg" aria-hidden="true">→</span>
            </a>
        </div>
    </section>
</template>
