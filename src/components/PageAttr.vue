<script setup lang="ts">
import { ref, Ref, computed, watch, inject, defineExpose, h } from 'vue'
import * as $ from '../Utils'
import { attributes as data, skills, Datum } from '../Data'
import text from '../Text'
import TagSkill from './TagSkill.vue'
import MenuList from './MenuList.vue';
const name = 'attribute';
const props = defineProps<{visible: boolean}>();
const loc = inject<Ref<$.LocParam>>('loc')!;
const menuList = ref(null as any);
const id = ref(props.visible ? $.GetIdFromURL() : 0); // 初始id，首页从url获取，其他页为0
const cur = computed(()=>data.get(id.value) || data[0]);
const filter = ref('');
const pack = {
  name,
  id,
  menuList,
  data,
  filter,
}
const Select = $.Select.bind(pack); // 页内切换
watch(loc, $.OnUpdate.bind(pack)); // 监听关于本页的广播，设置url
const list = computed($.ApplyFilter.bind(pack));
defineExpose({
  preset: [],
  filter,
  name
});
const column = 4;
const relatedSkills = computed(()=>{
  return skills.filter(v=>v.attribute_effects && v.attribute_effects[id.value - 1]).map(v=>h(TagSkill, {id:v['@id']}));
});
</script>

<template>
  <MenuList :id="id" :data="list" @select="Select" ref="menuList">
    <el-descriptions :title="(cur.name || '') + '@' + cur['@id']" :column="column" border>
      <el-descriptions-item :label="text.attr_type">
        {{text.attr_type[cur.type!]}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.attr_rate" :span="column-1">
        {{[cur.a_rate, cur.b_rate, cur.c_rate, cur.d_rate, cur.e_rate]
          .map((v,i)=>text.rank[i] + ':' + (v??0) + '%')
          .join(' || ')}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.related + text.skill" :span="column">
        <render :vnodes="relatedSkills.length>0 ? relatedSkills : text.none" />
      </el-descriptions-item>
    </el-descriptions>
  </MenuList>
</template>

<style scoped>
</style>
