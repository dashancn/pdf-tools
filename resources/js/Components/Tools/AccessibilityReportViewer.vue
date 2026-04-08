<script setup lang="ts">
import { computed } from 'vue';
import { trans } from '@/i18n';
import type { AccessibilityReport, CheckStatus } from '@/Services/pdf/accessibilityChecker';

const props = defineProps<{
    report: AccessibilityReport;
}>();

const emit = defineEmits<{ (e: 'reset'): void }>();

const checkLabels: Record<string, string> = {
    'tagged-pdf': 'Tagged PDF (/MarkInfo)',
    'document-language': 'Document Language (/Lang)',
    'document-title': 'Document Title',
    'bookmarks': 'Bookmarks / Outlines',
    'alt-text': 'Alt Text on Figures',
    'reading-order': 'Structure Tree (reading order)',
    'font-embedding': 'Font Embedding',
    'form-labels': 'Form Field Labels (/TU)',
    'tab-order': 'Tab Order (/Tabs)',
    'xmp-metadata': 'XMP Metadata',
};

const statusIcon: Record<CheckStatus, string> = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
    na: '➖',
};

const statusColor: Record<CheckStatus, string> = {
    pass: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
    fail: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30',
    warn: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
    na: 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800',
};

const scoreColor = computed(() => {
    if (props.report.score >= 80) return 'text-green-600';
    if (props.report.score >= 50) return 'text-amber-600';
    return 'text-red-600';
});

const scoreBg = computed(() => {
    if (props.report.score >= 80) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (props.report.score >= 50) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
});

const counts = computed(() => {
    const c = { pass: 0, fail: 0, warn: 0, na: 0 };
    for (const check of props.report.checks) c[check.status]++;
    return c;
});
</script>

<template>
    <div class="space-y-4">
        <!-- Score Card -->
        <div :class="['rounded-xl border p-6 text-center', scoreBg]">
            <div :class="['text-5xl font-bold mb-1', scoreColor]">{{ report.score }}/100</div>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ report.fileName }} &middot; {{ report.pageCount }} {{ report.pageCount === 1 ? 'page' : 'pages' }}</p>
            <div class="mt-3 flex justify-center gap-4 text-sm">
                <span class="text-green-700 dark:text-green-400">{{ counts.pass }} passed</span>
                <span class="text-red-700 dark:text-red-400">{{ counts.fail }} failed</span>
                <span class="text-amber-700 dark:text-amber-400">{{ counts.warn }} warnings</span>
                <span v-if="counts.na > 0" class="text-gray-500">{{ counts.na }} n/a</span>
            </div>
        </div>

        <!-- Checks List -->
        <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="check in report.checks" :key="check.id" class="flex items-start gap-3 px-4 py-3">
                <span :class="['shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg text-sm', statusColor[check.status]]">
                    {{ statusIcon[check.status] }}
                </span>
                <div class="min-w-0">
                    <div class="font-medium text-gray-900 dark:text-white text-sm">{{ checkLabels[check.id] ?? check.id }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ check.detail }}</div>
                </div>
            </div>
        </div>

        <!-- Reset -->
        <div class="text-center">
            <button type="button" class="text-sm text-gray-500 hover:text-gray-700 underline dark:text-gray-400 dark:hover:text-gray-200" @click="emit('reset')">
                {{ trans('tool.process') }}
            </button>
        </div>
    </div>
</template>
