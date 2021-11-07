<script setup lang="ts">
import { ref, Ref, computed, watch, inject } from 'vue'
import * as $ from '../Utils'
import { skills as data, attributes, states, Datum } from '../Data'
import text from '../Text'
import MenuList from './MenuList.vue';
import AttrTag from './TagAttr.vue';
import StateTag from './TagState.vue';
const name = 'skill';
const props = defineProps<{visible: boolean}>();
const loc = inject<Ref<$.LocParam>>('loc')!;
const menuList = ref(null as any);
const id = ref(props.visible ? $.GetIdFromURL() : 0); // 初始id，首页从url获取，其他页为0
const cur = computed(()=>data.get(id.value) || data[0]);
const filter = ref('');
const advancedFilters:Record<string, (list:Datum[])=>Datum[]> = {
  attack(list){
    list = list.filter(v=>v.type===0 && v.scope<2 && v.affect_hp && v.physical_rate>0);
    return list.sort((a,b)=>(b.physical_rate*25+b.power) - (a.physical_rate*25+a.power));
  },
  magic(list){
    list = list.filter(v=>v.type===0 && v.scope<2 && v.affect_hp && v.magical_rate>0);
    return list.sort((a,b)=>(b.magical_rate*25+b.power) - (a.magical_rate*25+a.power));
  },
  mixed(list){ // 假设1000魔力500攻击
    list = list.filter(v=>v.type===0 && v.scope<2 && v.affect_hp && (v.physical_rate + v.magical_rate)>0);
    return list.sort((a,b)=>
      (b.physical_rate*25 + b.magical_rate*25 + b.power)
      - (a.physical_rate*25 + a.magical_rate*25 + a.power));
  },
}
const pack = {
  name,
  id,
  menuList,
  data,
  filter,
  advancedFilters,
}
const Select = $.Select.bind(pack); // 页内切换
watch(loc, $.OnUpdate.bind(pack)); // 监听关于本页的广播，设置url
const list = computed($.ApplyFilter.bind(pack, ['name', 'description', 'using_message1', 'using_message2']));
defineExpose({
  preset: Object.keys(advancedFilters),
  filter,
  name
});
const column = 4;
//#region private
const affects = computed(()=>['affect_hp','affect_sp','affect_attack','affect_defense','affect_spirit','affect_agility']
              .map((k,i)=>[(cur.value as any)[k] as boolean, text.ability[i]])
              .filter(pair=>pair[0])
              .map(pair=>pair[1] as string));
const tags = computed(()=>['absorb_damage','ignore_defense', 'affect_attr_defence']
              .map((k,i)=>[(cur.value as any)[k] as boolean, text.tag[i]])
              .filter(pair=>pair[0])
              .map(pair=>pair[1] as string));
const power = computed(()=>[
                cur.value.power ?? 0,
                cur.value.magical_rate ? (text.spirit + '×' + cur.value.magical_rate*2.5 + '%') : '',
                cur.value.physical_rate ? (text.attack + '×' + cur.value.physical_rate*5 + '%') : ''
              ].filter(v=>v).join(' + '));
const variance = computed(()=>cur.value.variance ? ('± ' + cur.value.variance*5 + '%') : '');

function Any(list:any){
  if (Array.isArray(list)) return list.some(v=>v);
  return false;
}
function TrueForThis(source:{'@id':any, 'name'?:any}[], oneHot:any):any[]{
  return source.filter(v=>oneHot[(v['@id'] as number)-1]);
}
//#endregion
</script>

<template>
  <MenuList :id="id" :data="list" @select="Select" ref="menuList">
    <el-descriptions :title="(cur.name || '') + '@' + cur['@id']" :column="column" border>
      <el-descriptions-item :label="text.description" :span="column">
        {{cur.description || text.none}}
      </el-descriptions-item>
      <el-descriptions-item v-if="cur.using_message1" :label="text.using_message" :span="column">
        {{[cur.using_message1 && '[' + text.actor + ']'+cur.using_message1, cur.using_message2]
        .filter(v=>v).join('&nbsp'.repeat(3))}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.type">
        {{text.type[cur.type || 0]}}
      </el-descriptions-item>
      <el-descriptions-item  v-if="cur.type === 0" :label="text.scope">
        {{text.scope[cur.scope || 0]}}
      </el-descriptions-item>
      <el-descriptions-item  v-if="cur.type === 3" :label="text.type[3]">
        {{cur.switch_id}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.mp + text.cost">
        {{cur.sp_cost}}
      </el-descriptions-item>
      <template v-if="cur.type === 0"><!--一般-->
        <el-descriptions-item :label="text.hit">{{cur.hit + '%'}}</el-descriptions-item>
        <!--效果-->
        <el-descriptions-item :label="text.effect" :span="4"
          v-if="cur.affect_hp || cur.affect_sp || cur.affect_attack || cur.affect_defense || cur.affect_spirit || cur.affect_agility || cur.affect_attr_defence">
          {{[
            ...(affects.length>0 ? [text.valueDirection[cur.scope! >= 2 ? 0 : 1] + affects.join(text.sep), power, variance] : []), 
            ...tags
            ].filter(v=>v).join(' || ')}}
        </el-descriptions-item>
        <!--属性-->
        <el-descriptions-item v-if="Any(cur.attribute_effects)" :label="text.attribute" :span="column">
          <AttrTag v-for="attr in TrueForThis(attributes, cur.attribute_effects)" :id="attr['@id']"></AttrTag>
        </el-descriptions-item>
        <!--状态-->
        <el-descriptions-item v-if="Any(cur.state_effects)" :label="text.state" :span="column">
          <StateTag v-for="effect in TrueForThis(states, cur.state_effects)" :id="effect['@id']"></StateTag>
        </el-descriptions-item>
      </template>
      <!--开关-->
      <el-descriptions-item v-if="cur.type === 3" :label="text.occasion">
        {{[cur.occasion_field?0:-1,cur.occasion_battle?1:-1].filter(v=>v>=0).map(i=>text.occasion[i]).join(text.sep) || text.none}}
      </el-descriptions-item>
    </el-descriptions>
  </MenuList>
</template>

<style scoped>
</style>
