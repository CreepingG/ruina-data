<script setup lang="ts">
import { ref, Ref, computed, watch, inject, defineExpose, h } from 'vue'
import { Location, LocParam } from '../Utils'
import { attributes as data, skills, Datum } from '../Data'
import text from '../Text'
import TagSkill from './TagSkill.vue'
import MenuList from './MenuList.vue';
const name = 'attr';
const props = defineProps<{
  filter: string,
  visible: boolean,
}>();
const loc = inject<Ref<LocParam>>('loc')!;
function GetId(){
  const search = Location.getSearch()['id'];
  return Number(search) || 0;
}
const id = ref(props.visible ? GetId() : 0); // 初始id，首页从url获取，其他页为0
function SetURL(){
  Location.setSearch({page:name, id:id.value ? id.value.toString() : null}, false);
}
function Select(i:number){ // 页内切换
  id.value = i;
  SetURL();
}
watch(loc, (loc)=>{ // 监听关于本页的广播，设置url
  if (loc.page !== name) return;
  const newId = Number(loc.id);
  if (newId && data.has(newId)){
    id.value = newId;
  }
  else{
    id.value = loc.force ? 0 : id.value;
  }
  setTimeout(()=>menuList.value.scroll(), 0);
  if (!loc.force) SetURL();
});
const cur = computed(()=>data.get(id.value) || data[0]);

const advancedFilters:Record<string, (list:Datum[])=>Datum[]> = {
}
const list = computed(()=>{
  let result:Datum[] = data;
  const filter = props.filter;
  if (filter){
    const match = filter.match(/^@(.*)@$/);
    const action = match && advancedFilters[match[1]];
    if (action){
      result = action(result);
    }
    else{
      const int = filter.match(/^\d+$/) ? Number(filter) : NaN;
      result = result.filter(v=>{
        if (v['@id']===int) return true;
        return ['name', 'description', 'using_message1', 'using_message2'].some(key=>{
          const value = v[key];
          return typeof value === 'string' && value.match(filter);
        });
      });
    }
  }
  return result.map(v=>{
    return {
      '@id': v['@id'],
      name: v.name,
    };
  });
});
const menuList = ref<any>();

const column = 4;

const relatedSkills = computed(()=>{
  return skills.filter(v=>v.attribute_effects && v.attribute_effects[id.value - 1]).map(v=>h(TagSkill, {id:v['@id']}));
});

defineExpose({
  advancedFilters,
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
