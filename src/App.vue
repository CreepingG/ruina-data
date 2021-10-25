<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref } from 'vue'
import SkillVue from './components/Skill.vue'
import { Location } from './components/Utils';
const route = ref(window.location.pathname);
function handleClick() {
  Location.set({path:route.value}, false);
}
const filterText = ref('');
</script>

<template>
  <el-container style="height:100%;width: 100%;">
    <el-tabs v-model="route" @tab-click="handleClick" style="width: 100%;">
      <el-tab-pane label="角色" name="/actor">User</el-tab-pane>
      <el-tab-pane label="技能" name="/skill"><SkillVue :filter="filterText"/></el-tab-pane>
      <el-tab-pane label="物品" name="/item">Role</el-tab-pane>
      <el-tab-pane label="敌人" name="/enemy">Task</el-tab-pane>
    </el-tabs>
    <el-input v-model="filterText" placeholder="search" size="small"
      style="position: absolute; left: 0; top: 0; width: 150px; height: 30px; z-index: 9999; padding: 3px;"/>
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
}
.el-tab-pane{
  height: 100%;
}
.el-tabs__nav{
  width: 100%;
  text-align: center;
}
</style>
