<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { trans } from '@/i18n';
import pdfjsLib from '@/Services/pdfjsSetup';
import QRCode from 'qrcode';
import type { QrCodeOptions } from '@/Services/pdf/addQrCode';

const props = defineProps<{
    pdfFile: File | null;
}>();

// --- QR input ---
const qrText = ref('');
const qrDataUrl = ref('');
const qrSize = ref(100); // PDF points
const allPages = ref(false);

// --- PDF preview ---
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const previewContainer = ref<HTMLDivElement | null>(null);
const previewLoaded = ref(false);
const previewScale = ref(1);
const pdfPageWidth = ref(595);
const pdfPageHeight = ref(842);

// Page navigation
const currentPage = ref(1);
const totalPages = ref(1);

// --- Draggable QR on preview ---
const qrX = ref(50); // percentage 0-100
const qrY = ref(50);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const startQrX = ref(0);
const startQrY = ref(0);

const hasQrCode = computed(() => qrDataUrl.value !== '');
const scaledQrSize = computed(() => qrSize.value * previewScale.value);

// --- Generate QR code from text ---
watch(qrText, async (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
        qrDataUrl.value = '';
        return;
    }
    try {
        qrDataUrl.value = await QRCode.toDataURL(trimmed, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#000000', light: '#ffffff' },
        });
    } catch {
        qrDataUrl.value = '';
    }
});

// --- PDF Preview Rendering ---
async function renderPreview() {
    if (!props.pdfFile || !previewCanvas.value) return;
    try {
        const arrayBuffer = await props.pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        totalPages.value = pdf.numPages;
        const page = await pdf.getPage(currentPage.value);

        const containerWidth = previewContainer.value?.clientWidth ?? 600;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        previewCanvas.value.width = scaledViewport.width;
        previewCanvas.value.height = scaledViewport.height;
        const ctx = previewCanvas.value.getContext('2d');
        if (!ctx) return;

        await page.render({ canvas: previewCanvas.value, viewport: scaledViewport }).promise;

        previewScale.value = scale;
        pdfPageWidth.value = viewport.width;
        pdfPageHeight.value = viewport.height;
        previewLoaded.value = true;
    } catch (err) {
        console.error('Failed to render PDF preview:', err);
        previewLoaded.value = false;
    }
}

// --- Drag QR on preview ---
function startDrag(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    isDragging.value = true;
    const pos = getEventPos(e);
    dragStartX.value = pos.x;
    dragStartY.value = pos.y;
    startQrX.value = qrX.value;
    startQrY.value = qrY.value;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e: MouseEvent | TouchEvent) {
    if (!isDragging.value || !previewContainer.value) return;
    e.preventDefault();
    const pos = getEventPos(e);
    const rect = previewContainer.value.getBoundingClientRect();
    const dx = ((pos.x - dragStartX.value) / rect.width) * 100;
    const dy = ((pos.y - dragStartY.value) / rect.height) * 100;
    qrX.value = Math.max(0, Math.min(100, startQrX.value + dx));
    qrY.value = Math.max(0, Math.min(100, startQrY.value + dy));
}

function stopDrag() {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
}

function getEventPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in e && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

// --- Page navigation ---
async function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    await renderPreview();
}

// --- Build options for processing ---
function getQrCodeOptions(): QrCodeOptions | null {
    if (!hasQrCode.value) return null;

    const pdfX = (qrX.value / 100) * pdfPageWidth.value - qrSize.value / 2;
    const pdfY = pdfPageHeight.value - ((qrY.value / 100) * pdfPageHeight.value) - qrSize.value / 2;

    return {
        pageIndex: currentPage.value - 1,
        x: Math.max(0, Math.min(pdfPageWidth.value - qrSize.value, pdfX)),
        y: Math.max(0, Math.min(pdfPageHeight.value - qrSize.value, pdfY)),
        size: qrSize.value,
        pngDataUrl: qrDataUrl.value,
        allPages: allPages.value,
    };
}

defineExpose({ getQrCodeOptions });

// --- Watchers ---
watch(() => props.pdfFile, async (newFile) => {
    if (newFile) {
        currentPage.value = 1;
        await nextTick();
        renderPreview();
    } else {
        previewLoaded.value = false;
    }
});

onMounted(() => {
    if (props.pdfFile) renderPreview();
});

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
});
</script>

<template>
    <div class="space-y-5">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ trans('tool.qrcode.action') }}</h3>

        <!-- QR Text Input -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ trans('tool.qrcode.text_label') }}</label>
            <textarea
                v-model="qrText"
                rows="3"
                maxlength="2000"
                class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                :placeholder="trans('tool.qrcode.text_placeholder')"
            />
        </div>

        <!-- QR Preview -->
        <div v-if="qrDataUrl" class="flex items-center gap-4">
            <img :src="qrDataUrl" class="h-24 w-24 rounded border border-gray-200" alt="QR Code preview" />
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ trans('tool.qrcode.preview_label') }}</p>
        </div>

        <!-- QR Size -->
        <div v-if="hasQrCode" class="space-y-1">
            <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ trans('tool.qrcode.size_label') }}</label>
                <span class="text-sm tabular-nums text-gray-500">{{ qrSize }}pt</span>
            </div>
            <input v-model.number="qrSize" type="range" min="30" max="300" step="5" class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-violet-500" />
        </div>

        <!-- All pages checkbox -->
        <label v-if="hasQrCode" class="flex items-center gap-3 cursor-pointer">
            <input v-model="allPages" type="checkbox" class="h-4 w-4 rounded text-violet-500 focus:ring-violet-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ trans('tool.qrcode.all_pages') }}</span>
        </label>

        <!-- PDF Preview -->
        <div v-if="pdfFile">
            <label v-if="previewLoaded && hasQrCode" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ trans('tool.qrcode.position_label') }}</label>
            <div
                ref="previewContainer"
                class="relative mx-auto overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-inner"
            >
                <canvas ref="previewCanvas" class="block w-full" />

                <!-- Draggable QR overlay -->
                <div
                    v-if="previewLoaded && hasQrCode"
                    class="absolute cursor-move select-none"
                    :class="{ 'ring-2 ring-violet-400 ring-offset-1 rounded': isDragging }"
                    :style="{
                        left: qrX + '%',
                        top: qrY + '%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                    }"
                    @mousedown="startDrag"
                    @touchstart="startDrag"
                >
                    <img
                        :src="qrDataUrl"
                        :style="{ width: scaledQrSize + 'px', height: scaledQrSize + 'px' }"
                        class="pointer-events-none border-2 border-dashed border-violet-400 rounded bg-white object-contain"
                        draggable="false"
                    />
                </div>

                <!-- Loading state -->
                <div
                    v-if="!previewLoaded"
                    class="flex h-64 items-center justify-center text-gray-400"
                >
                    <p class="text-sm">{{ trans('tool.watermark.no_preview') }}</p>
                </div>
            </div>

            <p v-if="previewLoaded && hasQrCode" class="mt-2 text-center text-xs text-gray-400">{{ trans('tool.qrcode.drag_hint') }}</p>

            <!-- Page navigation -->
            <div v-if="previewLoaded && totalPages > 1" class="mt-3 flex items-center justify-center gap-3">
                <button
                    type="button"
                    :disabled="currentPage <= 1"
                    class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="goToPage(currentPage - 1)"
                >
                    &laquo;
                </button>
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ currentPage }} / {{ totalPages }}</span>
                <button
                    type="button"
                    :disabled="currentPage >= totalPages"
                    class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="goToPage(currentPage + 1)"
                >
                    &raquo;
                </button>
            </div>
        </div>
    </div>
</template>
