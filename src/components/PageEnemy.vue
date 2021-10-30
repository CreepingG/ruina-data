<script setup lang="ts">
import { ref,computed,watch,onMounted,onUnmounted } from 'vue'
import { Location } from '../Utils'
import { enemies as data, items, max_id } from '../Data' 
import text from '../Text'
import MenuList from './ListMenu.vue';
import AttrTag from './TagAttr.vue';
import StateTag from './TagState.vue';
const name = 'enemy';
const props = defineProps({
  filter:String,
  visible:Boolean
});
function SetLocation(){
  Location.set({search:{id:id.value === 0 ? null : id.value.toString()}}, false);
}
function GetId(){
  const search = Location.getSearch('id');
  const n = Number(search);
  if (Number.isNaN(n)) return data[0]['@id'];
  return n;
}
const id = ref(0);
watch(()=>props.visible, (v)=>{if(v) SetLocation()});
function Select(i:number){
  id.value = i;
  SetLocation();
}
const menuFocus:{value:HTMLSpanElement} = ref(null) as any;
const listener = ()=>{if (props.visible) id.value = GetId();}
onMounted(()=>{
  if (props.visible) {
    id.value = GetId();
    menuFocus.value?.scrollIntoView({block:'center'});
  }
  window.addEventListener('popstate', listener);
});
onUnmounted(()=>window.removeEventListener('popstate', listener));
onMounted(()=>menuFocus.value?.scrollIntoView({block:'center'}));
const cur = computed(()=>data.get(id.value) || data[0]);

function Hidden(id:number){
  const filter = props.filter;
  if (!filter) return false;
  if (filter.match(/\d+/)){
    if (id === Number(filter)) return false;
  }
  const enemy:any = data.get(id);
  if (!enemy) return true;
  return !['name'].some(key=>{
    const value = enemy[key];
    return typeof value === 'string' && value.match(filter);
  });
}

const column = 4;

function GroupRank(list:number[], max:number, default_rank:number=2){
  const result:number[][] = [[],[],[],[],[]];
  for(let i=0;i<max;i++){
    const rank = list.length<=i ? default_rank : list[i];
    result[rank].push(i + 1);
  }
  return result;
}
function Argmax(list:number[]){
  if (list.length<=0) return [-1, 0];
  let index = 0;
  let max = list[0];
  for(let i=list.length-1;i>0;i--){
    if (list[i] > max){
      index = i;
      max = list[i];
    }
  }
  return [index, max];
}
function Rank(ranks:number[]|undefined|null, max:number):({rank:string, type: 'text', text:string} | {rank:string, type: 'list', list:number[]})[]{
  if (!ranks) return [{rank: text.rank[2], type: 'text', text:text.all}];
  const groups = GroupRank(ranks, max);
  const major = Argmax(groups.map(g=>g.length));
  if (major[1] === max) return [{rank:text.rank[major[0]], type: 'text', text:text.all}]; // 所有rank相同
  return groups.map((g,i)=>{
    if (g.length === 0) return;
    return {
      rank: text.rank[i],
      ...(i === major[0] ? {
        type: 'text',
        text: text.other
      } : {
        type: 'list',
        list: g
      })
    }
  }).filter(v=>v) as any;
}
const attrRanks = computed(()=>Rank(cur.value.attribute_ranks, max_id.attr));
const stateRanks = computed(()=>Rank(cur.value.state_ranks, max_id.state));
</script>

<template>
  <MenuList :id="id" :data="data" :hidden="Hidden" @select="Select">
    <el-descriptions :title="(cur.name || '') + '@' + cur['@id']" :column="column" border>
      <el-descriptions-item :label="text.ability" :span="column">
        {{[cur.max_hp, cur.max_sp, cur.attack, cur.defense, cur.spirit, cur.agility]
        .map((v,i)=>(text.ability[i] + ': ' + v)).join(' || ')
         + (cur.critical_hit ? ' || ' + text.crit + ': 1/' + cur.critical_hit_chance : '')
         + (cur.miss ? ' || ' + text.miss : '')
        }}
      </el-descriptions-item>
      <el-descriptions-item :label="text.drop" :span="column">
        {{[cur.exp+text.exp, cur.gold+text.gold, cur.drop_id && cur.drop_prob && cur.drop_prob + '% ' + items.get(cur.drop_id)?.name]
        .filter(v=>v).join(' || ')}}
      </el-descriptions-item>
      <!--属性-->
      <el-descriptions-item :label="text.attribute + text.rank" :span="column">
        <el-descriptions border>
          <el-descriptions-item v-for="o of attrRanks" :key="o.rank" :label="o.rank">
            {{o.type==="text" ? o.text : ''}}
            <template v-if="o.type==='list'">
                <AttrTag v-for="attrId of o.list" :id="attrId"></AttrTag>
            </template>
          </el-descriptions-item>
        </el-descriptions>
      </el-descriptions-item>
      <!--状态-->
      <el-descriptions-item :label="text.state + text.rank" :span="column">
        <el-descriptions border>
          <el-descriptions-item v-for="o of stateRanks" :key="o.rank" :label="o.rank">
            {{o.type==="text" ? o.text : ''}}
            <template v-if="o.type==='list'">
                <StateTag v-for="stateId of o.list" :id="stateId"></StateTag>
            </template>
          </el-descriptions-item>
        </el-descriptions>
      </el-descriptions-item>
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
