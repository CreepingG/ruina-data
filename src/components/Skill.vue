<script setup lang="ts">
import { computed,ref,defineProps,onMounted } from 'vue'
import { Location } from './Utils'
import { skills, text, attributes, states } from './Data' 
import MenuList from './ListMenu.vue';
const props = defineProps({
  filter:String
});

const map = new Map(skills.map(v=>[v['@id'],v]));
const idFromLocation = Number(Location.getSearch('id')) || skills[0]['@id'] as number;
const id = ref(idFromLocation);
const cur = computed(()=>map.get(id.value) || skills[0]);

const column = 4;
const colors = [
  [0,0,0],[79,102,156],[161,89,66],[],[],[140,73,73],[81,85,157],[153,80,153],[],[],[],[],[],[133,68,158]
];

const affects = computed(()=>['affect_hp','affect_sp','affect_attack','affect_defense','affect_spirit','affect_agility']
              .map((k,i)=>[cur.value[k] as boolean, text.effect[i]])
              .filter(pair=>pair[0])
              .map(pair=>pair[1] as string));
const tags = computed(()=>['absorb_damage','ignore_defense', 'affect_attr_defence']
              .map((k,i)=>[cur.value[k] as boolean, text.tags[i]])
              .filter(pair=>pair[0])
              .map(pair=>pair[1] as string));
const power = computed(()=>[
                cur.value.power ?? 0,
                cur.value.magical_rate ? (text.magic + '×' + cur.value.magical_rate*2.5 + '%') : '',
                cur.value.physical_rate ? (text.attack + '×' + cur.value.physical_rate*5 + '%') : ''
              ].filter(v=>v).join(' + '));
const variance = computed(()=>cur.value.variance ? ('± ' + cur.value.variance*5 + '%') : '');

function Any(list:any[]|null|undefined){
  return list && list.some(v=>v);
}
function TrueForThis(source:{'@id':any, 'name'?:any}[], oneHot:any):any[]{
  return source.filter(v=>oneHot[(v['@id'] as number)-1]);
}

function Hidden(id:number){
  const filter = props.filter;
  if (!filter) return false;
  if (filter.match(/\d+/)){
    if (id === Number(filter)) return false;
  }
  const skill = map.get(id);
  if (!skill) return true;
  return !['name', 'description', 'using_message1', 'using_message2'].some(key=>{
    const value = skill[key];
    return typeof value === 'string' && value.match(filter);
  });
}
function Select(i:number){
  id.value = i;
  Location.set({search:{id:i.toString()}}, false);
}

const menuFocus:{value:HTMLSpanElement} = ref(null) as any;
onMounted(function(){
  menuFocus.value?.scrollIntoView({block:'center'});
});
</script>

<template>
  <MenuList :id="id" :data="skills" :hidden="Hidden" @select="Select">
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
      <el-descriptions-item :label="text.scope">
        {{text.scope[cur.scope || 0]}}
      </el-descriptions-item>
      <el-descriptions-item :label="text.mp">
        {{cur.sp_cost}}
      </el-descriptions-item>
      <template v-if="cur.type === 0"><!--一般-->
        <el-descriptions-item :label="text.hit">{{cur.hit + '%'}}</el-descriptions-item>
        <!--效果-->
        <template v-if="cur.affect_hp || cur.affect_sp || cur.affect_attack || cur.affect_defense || cur.affect_spirit || cur.affect_agility || cur.affect_attr_defence">
          <el-descriptions-item :label="text.effect" :span="4">
            {{[
              ...(affects ? [text.valueDirection[cur.scope >= 2 ? 0 : 1] + affects.join(text.sep), power, variance] : []), 
              ...tags
              ].filter(v=>v).join(' || ')}}
          </el-descriptions-item>
        </template>
        <!--属性-->
        <el-descriptions-item v-if="Any(cur.attribute_effects)" :label="text.attribute" :span="column">
          <el-tag v-for="attr in TrueForThis(attributes, cur.attribute_effects)" :key="attr['@id']" class="label">
            {{attr.name}}
          </el-tag>
        </el-descriptions-item>
        <!--状态-->
        <el-descriptions-item v-if="Any(cur.state_effects)" :label="text.state" :span="column">
          <el-tag v-for="effect in TrueForThis(states, cur.state_effects)" :key="effect['@id']" class="label"
            :color="'rgb(' + colors[effect.color??6].join(',') + ')'" effect="dark">
            {{effect.name}}
          </el-tag>
        </el-descriptions-item>
      </template>
      <template v-if="cur.type === 3"><!--开关-->
        <el-descriptions-item v-if="cur.type === 3" :label="text.occasion">
          {{[cur.occasion_field?0:-1,cur.occasion_battle?1:-1].filter(v=>v>=0).map(i=>text.occasion[i]).join(text.sep) || text.none}}
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </MenuList>
</template>

<style scoped>
.label {
  margin: 0 1px;
  width: 80px;
  text-align: center;
}
</style>
