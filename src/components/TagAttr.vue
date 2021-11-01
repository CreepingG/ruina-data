<script setup lang="ts">
import { computed } from 'vue'
import { attributes } from '../Data'
const props = defineProps<{
  id: number
}>();
const attr = computed(()=>attributes.get(props.id));
</script>
<template>
    <el-tag v-if="attr" class="tag">
        {{attr.name}}
    </el-tag>
</template>
<style scoped>
.tag {
  margin: 1px;
  width: 80px;
  text-align: center;
}
</style>