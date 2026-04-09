<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { trans } from '@/i18n';
import { useSeoMeta } from '@/Composables/useSeoMeta';
import HeroSection from '@/Components/UI/HeroSection.vue';
import ToolCard from '@/Components/UI/ToolCard.vue';
import ToolSearch from '@/Components/UI/ToolSearch.vue';

interface ToolItem {
    slug: string;
    icon: string;
    color: string;
    bgColor: string;
}

interface ToolSection {
    key: string;
    color: string;
    tools: ToolItem[];
}

onMounted(() => {
    useSeoMeta(
        'PDF Worker - Free Online PDF Tools',
        trans('home.description'),
        '/',
        null,
    );
});

const searchQuery = ref('');

const sections: ToolSection[] = [
    {
        key: 'organize',
        color: 'text-blue-600 dark:text-blue-400',
        tools: [
            { slug: 'merge-pdf', icon: '🔗', color: 'text-red-600', bgColor: 'bg-red-50' },
            { slug: 'split-pdf', icon: '✂️', color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { slug: 'organize-pdf', icon: '📋', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
            { slug: 'rotate-pdf', icon: '🔄', color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { slug: 'reverse-pages', icon: '🔃', color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { slug: 'add-blank-page', icon: '📃', color: 'text-sky-600', bgColor: 'bg-sky-50' },
            { slug: 'remove-blank-pages', icon: '🧹', color: 'text-rose-600', bgColor: 'bg-rose-50' },
            { slug: 'crop-pdf', icon: '✂️', color: 'text-rose-600', bgColor: 'bg-rose-50' },
            { slug: 'resize-pdf', icon: '📐', color: 'text-pink-600', bgColor: 'bg-pink-50' },
            { slug: 'nup-pdf', icon: '📑', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
            { slug: 'booklet-pdf', icon: '📕', color: 'text-rose-600', bgColor: 'bg-rose-50' },
        ],
    },
    {
        key: 'convert',
        color: 'text-emerald-600 dark:text-emerald-400',
        tools: [
            { slug: 'pdf-to-jpg', icon: '🖼️', color: 'text-amber-600', bgColor: 'bg-amber-50' },
            { slug: 'pdf-to-png', icon: '🎨', color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
            { slug: 'pdf-to-webp', icon: '🌐', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            { slug: 'pdf-to-text', icon: '📝', color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { slug: 'pdf-to-markdown', icon: '⬇️', color: 'text-gray-600', bgColor: 'bg-gray-50' },
            { slug: 'pdf-to-epub', icon: '📖', color: 'text-violet-600', bgColor: 'bg-violet-50' },
            { slug: 'jpg-to-pdf', icon: '📄', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
            { slug: 'text-to-pdf', icon: '📝', color: 'text-teal-600', bgColor: 'bg-teal-50' },
            { slug: 'markdown-to-pdf', icon: '📝', color: 'text-violet-600', bgColor: 'bg-violet-50' },
        ],
    },
    {
        key: 'annotate',
        color: 'text-purple-600 dark:text-purple-400',
        tools: [
            { slug: 'watermark-pdf', icon: '💧', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { slug: 'page-numbers', icon: '🔢', color: 'text-teal-600', bgColor: 'bg-teal-50' },
            { slug: 'header-footer', icon: '📝', color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { slug: 'sign-pdf', icon: '✍️', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            { slug: 'edit-pdf', icon: '✏️', color: 'text-sky-600', bgColor: 'bg-sky-50' },
            { slug: 'add-qr-code', icon: '🔳', color: 'text-violet-600', bgColor: 'bg-violet-50' },
            { slug: 'edit-metadata', icon: '📋', color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
        ],
    },
    {
        key: 'optimize',
        color: 'text-amber-600 dark:text-amber-400',
        tools: [
            { slug: 'compress-pdf', icon: '📦', color: 'text-green-600', bgColor: 'bg-green-50' },
            { slug: 'flatten-pdf', icon: '🗜️', color: 'text-amber-600', bgColor: 'bg-amber-50' },
            { slug: 'grayscale-pdf', icon: '⚫', color: 'text-stone-600', bgColor: 'bg-stone-50' },
            { slug: 'invert-colors', icon: '🔲', color: 'text-gray-600', bgColor: 'bg-gray-100' },
            { slug: 'repair-pdf', icon: '🔧', color: 'text-red-600', bgColor: 'bg-red-50' },
            { slug: 'redact-pdf', icon: '█', color: 'text-gray-600', bgColor: 'bg-gray-100' },
        ],
    },
    {
        key: 'security',
        color: 'text-red-600 dark:text-red-400',
        tools: [
            { slug: 'protect-pdf', icon: '🔒', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { slug: 'unlock-pdf', icon: '🔓', color: 'text-lime-600', bgColor: 'bg-lime-50' },
            { slug: 'ocr-pdf', icon: '👁️', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        ],
    },
    {
        key: 'analyze',
        color: 'text-teal-600 dark:text-teal-400',
        tools: [
            { slug: 'compare-pdf', icon: '🔍', color: 'text-amber-600', bgColor: 'bg-amber-50' },
            { slug: 'extract-images', icon: '🖼️', color: 'text-violet-600', bgColor: 'bg-violet-50' },
            { slug: 'check-accessibility', icon: '♿', color: 'text-teal-600', bgColor: 'bg-teal-50' },
        ],
    },
];

// Flat list for search filtering
const allTools = sections.flatMap(s => s.tools);

const filteredSections = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return sections;
    return sections
        .map(section => ({
            ...section,
            tools: section.tools.filter(t => {
                const name = trans(`tools.${t.slug}.name`).toLowerCase();
                const desc = trans(`tools.${t.slug}.description`).toLowerCase();
                return name.includes(q) || desc.includes(q);
            }),
        }))
        .filter(section => section.tools.length > 0);
});

const hasResults = computed(() => filteredSections.value.some(s => s.tools.length > 0));
</script>

<template>
    <div>
        <HeroSection />

        <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <!-- Search -->
            <div class="mb-10">
                <ToolSearch v-model="searchQuery" />
            </div>

            <!-- No results -->
            <p
                v-if="!hasResults"
                class="py-12 text-center text-gray-500 dark:text-gray-400"
            >
                {{ trans('home.no_results') }}
            </p>

            <!-- Sections -->
            <div v-for="section in filteredSections" :key="section.key" class="mb-12 last:mb-0">
                <h2 :class="['mb-5 text-lg font-semibold', section.color]">
                    {{ trans(`home.section.${section.key}`) }}
                </h2>
                <TransitionGroup
                    tag="div"
                    class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    enter-active-class="transition ease-out duration-300"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-200"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                    move-class="transition-all duration-300"
                >
                    <ToolCard
                        v-for="tool in section.tools"
                        :key="tool.slug"
                        :slug="tool.slug"
                        :icon="tool.icon"
                        :color="tool.color"
                        :bg-color="tool.bgColor"
                    />
                </TransitionGroup>
            </div>
        </section>
    </div>
</template>
