<script setup lang="ts">
import AppLayout from '@/Components/Layout/AppLayout.vue';
import ErrorBoundary from '@/Components/Layout/ErrorBoundary.vue';
import ToastContainer from '@/Components/UI/ToastContainer.vue';
</script>

<template>
    <AppLayout>
        <ErrorBoundary>
            <router-view />
        </ErrorBoundary>
    </AppLayout>
    <ToastContainer />
</template>
