<script setup lang="ts">
import { ref, Ref, computed, watch, inject, defineExpose } from 'vue'
import { Location, LocParam } from '../Utils'
import { skills as data, attributes, states, Datum } from '../Data'
import text from '../Text'
import MenuList from './MenuList.vue';
import AttrTag from './TagAttr.vue';
import StateTag from './TagState.vue';
const name = 'skill';
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
  attack(list){
    list = list.filter(v=>v.type===0 && v.physical_rate>0);
    return list.sort((a,b)=>b.physical_rate-a.physical_rate);
  },
  magic(list){
    list = list.filter(v=>v.type===0 && v.magical_rate>0);
    return list.sort((a,b)=>b.magical_rate-a.magical_rate);
  },
  mixed(list){
    list = list.filter(v=>v.type===0 && (v.physical_rate + v.magical_rate)>0);
    return list.sort((a,b)=>(b.physical_rate + b.magical_rate)-(a.physical_rate + a.magical_rate));
  },
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
const menuList = ref(null as any);

const column = 4;

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

defineExpose({
  advancedFilters,
});
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
            ...(affects.length>0 ? [text.valueDirection[(cur.scope??0) >= 2 ? 0 : 1] + affects.join(text.sep), power, variance] : []), 
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
