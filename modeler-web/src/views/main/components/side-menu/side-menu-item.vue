<template>
  <Submenu :name="`${parentName}`">
    <template slot="title">
      <Icon v-if="parentItem.icon.indexOf('iconfont') == -1" :type="parentItem.icon"/>
      <i v-else :class="parentItem.icon"></i>
      <!-- <Icon :type="parentItem.icon"/> -->
      <span>{{ showTitle(parentItem) }}</span>
    </template>
    <template v-for="item in children">
      <side-menu-item v-if="item.children && item.children.length !== 0" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
      <menu-item v-else :name="`${item.name}`" :key="`menu-${item.name}`">
        <Icon v-if="item.icon.indexOf('iconfont') == -1" :type="item.icon"/>
        <i v-else :class="item.icon"></i>
        <!-- <Icon :type="item.icon"/> -->
      <span>{{ showTitle(item) }}</span>
      </menu-item>
    </template>
  </Submenu>
</template>
<script>
import mixin from "./mixin";
import itemMixin from "./item-mixin";
export default {
  name: "sideMenuItem",
  mixins: [mixin, itemMixin]
};
</script>
