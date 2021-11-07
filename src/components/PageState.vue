<script setup lang="ts">
import { ref, Ref, computed, watch, inject, defineExpose,h } from 'vue'
import * as $ from '../Utils'
import { states as data, skills, Datum } from '../Data'
import text from '../Text'
import TagSkill from './TagSkill.vue'
import MenuList from './MenuList.vue'
const name = 'state';
const props = defineProps<{visible: boolean}>();
const id = ref(props.visible ? $.GetIdFromURL() : 0); // 初始id，首页从url获取，其他页为0
const cur = computed(()=>data.get(id.value) || data[0]);
const menuList = ref<any>();
const filter = ref('');
const pack = {
  name,
  id,
  menuList,
  data,
  filter,
}
const Select = $.Select.bind(pack); // 页内切换
watch(inject<Ref<$.LocParam>>('loc')!, $.OnUpdate.bind(pack)); // 监听关于本页的广播，设置url
const list = computed($.ApplyFilter.bind(pack, ['name', 'message_actor', 'message_already', 'message_affected', 'message_recovery']));
defineExpose({
  preset: [],
  filter,
  name
});;
const column = 4;
//#region private
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
//#endregion
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
