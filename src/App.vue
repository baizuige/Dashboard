<script setup>
import IncomeDetail from '@/pages/IncomeDetail.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <a-config-provider :locale="zhCN">
    <IncomeDetail />
  </a-config-provider>
</template>

<style scoped></style>
