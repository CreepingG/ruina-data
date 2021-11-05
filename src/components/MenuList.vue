<script setup lang="ts">
import { ref,onMounted } from 'vue'
import { Datum } from '../Data' 
const props = defineProps<{
  id: number,
  data:Pick<Datum, '@id'|'name'>[],
}>();
const emit = defineEmits<{
    (event: 'select', id: number):void
}>();
const menuFocus = ref<HTMLSpanElement|null>(null);
const scroll = ()=>menuFocus.value?.scrollIntoView({block:'center'});
onMounted(scroll);
</script>

<template>
  <el-container style="height:100%;">
    <el-aside width="180px" style="padding: 0;">
      <el-menu :default-active="props.id.toString()" >
        <el-menu-item v-for="item in props.data" :key="item['@id']" :index="item['@id'].toString()" 
          @click="emit('select', item['@id'])" class="menu-item">
          <span v-if="item['@id'] === props.id" ref="menuFocus"></span>
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
