<script setup lang="ts">
import { ref,onMounted } from 'vue'
import SkillVue from './components/PageSkill.vue'
import EnemyVue from './components/PageEnemy.vue';
import { Location } from './Utils';
const list = [
  {text:'角色', route:'/actor', component: undefined},
  {text:'技能', route:'/skill', component: SkillVue},
  {text:'物品', route:'/item', component: undefined},
  {text:'敌人', route:'/enemy', component: EnemyVue},
];
function GetRoute(){
  const path = window.location.pathname;
  if (path === '/') return '/skill';
  return path;
}
const route = ref(GetRoute());
function handleClick(pane:any) {
  Location.set({path:pane.paneName}, false);
}
onMounted(()=>window.addEventListener('popstate', ()=>{route.value = GetRoute();}));
const filter = ref('');
</script>

<template>
  <el-container style="height:100%;width: 100%;">
    <el-tabs v-model="route" @tab-click="handleClick" style="width: 100%;">
      <el-tab-pane v-for="setting in list" :label="setting.text" :name="setting.route">
        <component :visible="route === setting.route" :is="setting.component" :filter="filter"></component>
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
