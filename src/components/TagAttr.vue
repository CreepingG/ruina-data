<script setup lang="ts">
import { computed,inject } from 'vue'
import { LocParam } from '../Utils'
import { attributes } from '../Data'
const props = defineProps<{
  id: number
}>();
const goto = inject<(newLoc:LocParam)=>void>('goto')!;
const onclick = function(){
  goto({
    page: 'attr',
    id: props.id,
  });
}
const attr = computed(()=>attributes.get(props.id));
</script>
<template>
    <el-tag @click="onclick" v-if="attr" class="tag" :effect="attr.type ? 'plain' : 'dark'">
        {{attr.name}}
    </el-tag>
</template>
<style scoped>
.tag {
  margin: 1px;
  width: 80px;
  text-align: center;
  cursor: pointer;
}
</style>