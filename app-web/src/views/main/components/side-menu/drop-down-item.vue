<template>
  <DropdownItem :name="`${!showChildren(item) ? item.name : ''}`">
    <Icon v-if="item.icon.indexOf('iconfont') == -1" :type="item.icon"/>
    <i v-else :class="item.icon"></i>
    {{showTitle(item)}}
    <template>
      <Icon type="ios-arrow-forward" v-if="showChildren(item)"></Icon>
    </template>
  </DropdownItem>
</template>
<script>
import mixin from "./mixin";
import itemMixin from "./item-mixin";
import "@/styles/component/iconfont.css";
export default {
  name: "dropDownItem",
  mixins: [mixin, itemMixin],
  props: ['item']
};
</script>