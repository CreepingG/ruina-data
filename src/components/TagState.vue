<script setup lang="ts">
import { computed,inject } from 'vue'
import { LocParam } from '../Utils'
import { states } from '../Data'
const props = defineProps<{
  id: number
}>();
const goto = inject<(newLoc:LocParam)=>void>('goto')!;
const onclick = function(){
  goto({
    page: 'state',
    id: props.id,
  });
}
const colors = [
  [0,0,0],[79,102,156],[161,89,66],[],[],[140,73,73],[81,85,157],[153,80,153],[],[],[],[],[],[133,68,158]
];
const state = computed(()=>states.get(props.id));
</script>
<template>
    <el-tag @click="onclick" v-if="state && !state.name?.startsWith('-') && !state.name?.startsWith('↓')" class="tag" 
      :color="'rgb(' + colors[state.color??6].join(',') + ')'" :effect="id>=33 && id<=36 ? 'plain' : 'dark'">
        {{state.name}}
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