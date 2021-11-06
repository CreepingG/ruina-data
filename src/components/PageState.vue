<script setup lang="ts">
import { ref, Ref, computed, watch, inject, defineExpose,h } from 'vue'
import { Location, LocParam } from '../Utils'
import { states as data, skills, Datum } from '../Data'
import text from '../Text'
import TagSkill from './TagSkill.vue'
import MenuList from './MenuList.vue'
const name = 'state';
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

const effects = computed(()=>{
  const result = [];
  const v = cur.value;
  if (v.restriction) result.push(text.restriction[v.restriction]);
  if (v.reduce_hit_ratio !== 100) result.push(text.reduce_hit_ratio.replace('@', (v.reduce_hit_ratio??0).toString()));
  const list = [v.affect_attack, v.affect_defense, v.affect_spirit, v.affect_agility];
  if (list.some(v=>v)){
    const index = list.map((v,i)=>v ? i : -1).filter(i=>i!==-1);
    const labels = index.map(i=>text.ability[i + 2]).join(text.sep);
    console.log(index, labels);
    result.push(labels + text.half);
  }
  if (v.restrict_skill){
    result.push(text.restrict_skill.replace('@0', text.attack).replace('@1', (v.restrict_skill_level*5).toString()));
  }
  if (v.restrict_magic){
    result.push(text.restrict_skill.replace('@0', text.spirit).replace('@1', (v.restrict_magic_level*2.5).toString()));
  }
  if (v.hp_change_max || v.hp_change_val){
    result.push(text.state_value_change.replace('@0', text.hp).replace('@1', text.valueDirection[1])
      .replace('@2', [v.hp_change_max && v.hp_change_max + '%', v.hp_change_val].filter(v=>v).join('+')));
  }
  if (v.sp_change_max || v.sp_change_val){
    result.push(text.state_value_change.replace('@0', text.mp).replace('@1', text.valueDirection[1])
      .replace('@2', [v.sp_change_max && v.sp_change_max + '%', v.sp_change_val].filter(v=>v).join('+')));
  }
  return result;
});
const relatedSkills = computed(()=>{
  return skills.filter(v=>v.state_effects && v.state_effects[id.value - 1]).map(v=>h(TagSkill, {id:v['@id']}));
});

defineExpose({
  advancedFilters,
});
</script>

<template>
  <MenuList :id="id" :data="list" @select="Select" ref="menuList">
    <el-descriptions :title="(cur.name || '') + '@' + cur['@id']" :column="column" border>
      <el-descriptions-item v-if="cur.message_actor" :label="text.message" :span="column">
        {{[cur.message_actor, cur.message_affected, cur.message_already, cur.message_recovery]
          .filter(v=>v).map(v=>'['+text.actor+']'+v).join(' || ')}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.stateOccasion">
        {{text.stateOccasion[cur.type!]}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.priority">
        {{cur.priority!}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.release" :span="column">
        {{[cur.auto_release_prob!>0 
          && text.release[1].replace('@0', cur.hold_turn!.toString())
          .replace('@1', cur.auto_release_prob!.toString()),
          cur.release_by_damage!>0 && text.release[2].replace('@', cur.release_by_damage!.toString())
          ].filter(v=>v).join(text.sep) || text.release[0]}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.state_rate" :span="column">
        {{[cur.a_rate, cur.b_rate, cur.c_rate, cur.d_rate, cur.e_rate]
          .map((v,i)=>text.rank[i] + ':' + (v??0) + '%')
          .join(' || ')}}
      </el-descriptions-item>
      <el-descriptions-item v-if="effects.length>0" :label="text.effect" :span="column">
        {{effects.join(' || ')}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.related + text.skill" :span="column">
        <render :vnodes="relatedSkills.length>0 ? relatedSkills : text.none" />
      </el-descriptions-item>
    </el-descriptions>
  </MenuList>
</template>

<style scoped>
</style>
