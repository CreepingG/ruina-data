<script setup lang="ts">
import { computed,ref,onMounted } from 'vue'
import { Datum } from '../Data' 
const props = defineProps<{
  hidden:(id:number)=>boolean,
  id: number,
  data:Datum[],
}>();
const emit = defineEmits<{
    (event: 'select', id: number):void
}>();

const data = props.data! as Datum[];
const id = computed(()=>props.id);

const menuFocus = ref<HTMLSpanElement|null>(null);
onMounted(function(){
  menuFocus.value?.scrollIntoView({block:'center'});
});
</script>

<template>
  <el-container style="height:100%;">
    <el-aside width="180px" style="padding: 0;">
      <el-menu :default-active="id.toString()" >
        <el-menu-item v-for="item in data" :key="item['@id']" :index="item['@id'].toString()" 
          :hidden="hidden(item['@id'])"
          @click="emit('select', item['@id'])" class="menu-item">
          <span v-if="item['@id'] === id" ref="menuFocus"></span>
          {{item.name}}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <slot></slot>
    </el-main>
  </el-container>
</template>

<style scoped>
.menu-item{
  padding: 0;
  height: 40px;
  line-height: 40px;
}
</style>
