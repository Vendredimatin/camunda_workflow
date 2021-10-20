<template>
  <Submenu :name="`${parentName}`">
    <template slot="title">
      <!-- <Icon :type="parentItem.icon"/> -->
      <Icon v-if="parentItem.icon.indexOf('iconfont') == -1" :type="parentItem.icon"/>
      <i v-else :class="parentItem.icon"></i>
      <span>{{ showTitle(parentItem) }}</span>
    </template>
    <template v-for="item in children">
      <side-menu-item v-if="item.children && item.children.length !== 0" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
      <!-- <menu-item v-else :name="`${item.name}`" :key="`menu-${item.name}`"><Icon :type="item.icon"/><span>{{ showTitle(item) }}</span></menu-item> -->
      <menu-item v-else :name="`${item.name}`" :key="`menu-${item.name}`">
        <!-- <Icon :type="item.icon"/> -->
        <Icon v-if="item.icon.indexOf('iconfont') == -1" :type="item.icon"/>
        <i v-else :class="item.icon"></i>
        <span>{{ showTitle(item) }}</span>
      </menu-item>
    </template>
  </Submenu>
</template>
<script>
import mixin from "./mixin";
import itemMixin from "./item-mixin";
import "@/styles/component/iconfont.css";
export default {
  name: "sideMenuItem",
  mixins: [mixin, itemMixin]
};
</script>
