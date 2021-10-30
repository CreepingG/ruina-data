<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { attributes } from '../Data'
const props = defineProps({
  id: Number
});
const attr = computed(()=>attributes.get(props.id || -1));
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