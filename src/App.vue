<script setup lang="ts">
import { ref, shallowRef, readonly, provide, onMounted } from 'vue'
import Skill from './components/PageSkill.vue'
import Enemy from './components/PageEnemy.vue';
import { Location, LocParam } from './Utils';
import text from './Text';
const list = [
  //{text:text.actor, key:'actor', component: undefined},
  {text:text.skill, key:'skill', component: Skill},
  //{text:text.item, key:'item', component: undefined},
  {text:text.enemy, key:'enemy', component: Enemy},
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
const filter = ref('');
</script>

<template>
  <el-container style="height: 100%;width: 100%;">
    <el-tabs :model-value="loc.page" @update:model-value="goto({page:$event})" style="width: 100%;">
      <el-tab-pane v-for="setting in list" :label="setting.text" :name="setting.key">
        <component :visible="loc.page === setting.key" :is="setting.component" :filter="filter"></component>
      </el-tab-pane>
    </el-tabs>
    <el-input v-model="filter" placeholder="search" size="small"
      style="position: absolute; left: 0; top: 0; width: 150px; height: 30px; z-index: 9999; padding: 3px;"/>
  </el-container>
</template>

<style>
html, body, #app{
  height: 100%;
}
body{
  margin: 0;
}
.el-tabs{
  display: flex;
  flex-direction: column;
}
.el-tab-pane{
  height: 100%;
}
.el-tabs__nav{
  width: 100%;
  text-align: center;
}
</style>
