<script setup lang="ts">
import { ref, shallowRef, readonly, computed, provide, onMounted } from 'vue'
import Skill from './components/PageSkill.vue'
import Enemy from './components/PageEnemy.vue';
import State from './components/PageState.vue';
import Attr from './components/PageAttr.vue';
import { Location, LocParam } from './Utils';
import text from './Text';
const list = [
  //{text:text.actor, key:'actor', component: undefined},
  {text:text.skill, key:'skill', component: Skill},
  //{text:text.item, key:'item', component: undefined},
  {text:text.enemy, key:'enemy', component: Enemy},
  {text:text.attribute, key:'attr', component: Attr},
  {text:text.state, key:'state', component: State},
];
function GetRoute(){
  const search = Location.getSearch();
  const loc:Record<string, string> = {};
  Object.entries(search).forEach(kvp=>{
    loc[kvp[0]] = kvp[1];
  });
  if (!loc['page']) loc['page'] = 'skill';
  return loc as LocParam;
}
const loc = shallowRef(GetRoute());
const goto = (newLoc:LocParam)=>{ // 广播事件
  loc.value = newLoc;
}
provide('loc', readonly(loc));
provide('goto', goto);
onMounted(()=>window.addEventListener('popstate', ()=>{ // 浏览器历史前进或后退
  goto({...GetRoute(), force: true});
}));
const cur=ref<any>(null);
const filter = ref('');
const plainFilter = computed(()=>filter.value.replace(
  new RegExp('([' + '\\[].?*-+^$'.split('').map(c=>'\\'+c).join('') + '])' ,'g'),
  '\\$1'
));
const specialFilter = (text:string, cb:(list:{value:string}[])=>void)=>{
  if (text===''||text==='@'){
    try{
      const record = cur.value.advancedFilters;
      const keys = Object.keys(record);
      cb(keys.map(k=>({value:'@'+k+'@'})));
    }
    catch{
      cb([]);
    }
  }
  else{
    cb([]);
  }
}
</script>

<template>
  <el-container style="height: 100%;width: 100%;">
    <el-tabs :model-value="loc.page" @update:model-value="goto({page:$event})" style="width: 100%;">
      <el-tab-pane v-for="setting in list" :label="setting.text" :name="setting.key">
        <component :visible="loc.page === setting.key" :is="setting.component"
          :ref="el => { if (loc.page === setting.key) cur = el }"
          :filter="plainFilter"></component>
      </el-tab-pane>
    </el-tabs>
    <el-autocomplete v-model="filter" :fetch-suggestions="specialFilter"
     placeholder="search" clearable prefix-icon="el-icon-search" class="filter"/>
  </el-container>
</template>

<style lang="postcss">
html, body, #app{
  height: 100%;
}
body{
  margin: 0;
}
.el-tabs{
  display: flex;
  flex-direction: column;
  & .el-tab-pane{
    height: 100%;
  }
  & .el-tabs__nav{
    width: 100%;
    text-align: center;
  }
}

.el-autocomplete.filter{
  position: absolute; 
  left: 0; top: 0; 
  width: 150px; 
  z-index: 9999; 
  --padding: 3px;
  padding: var(--padding);
  --height: 30px;
  height: var(--height);
  line-height: var(--height);
  &>.el-input{
    height: 100%;
    line-height: var(--height);
    &>.el-input__inner{
      height: 100%;
      line-height: var(--height);
    }
    &>.el-input__prefix>.el-input__icon, &>.el-input__suffix>.el-input__suffix-inner>.el-input__icon{
      line-height: var(--height);
    }
  }
}
</style>
