<script setup lang="ts">
import { computed,inject } from 'vue'
import { LocParam } from '../Utils'
import { skills } from '../Data'
import text from '../Text';
const props = defineProps<{
  id: number
}>();
const goto = inject<(newLoc:LocParam)=>void>('goto')!;
const onclick = function(){
  goto({
    page: 'skill',
    id: props.id,
  });
}
const colors = [
  [0,0,0],[79,102,156],[161,89,66],[],[],[140,73,73],[81,85,157],[153,80,153],[],[],[],[],[],[133,68,158]
];
const skill = computed(()=>skills.get(props.id));
const color = computed(()=>{
  const scope = skill.value?.scope ?? 0;
  return '#' + text.scopeColor[scope];
})
</script>
<template>
    <el-tag @click="onclick" v-if="skill" class="tag" :color="color" effect="dark">
        {{skill.name}}
    </el-tag>
</template>
<style scoped>
.tag {
  margin: 1px;
  min-width: 80px;
  text-align: center;
  cursor: pointer;
}
</style>