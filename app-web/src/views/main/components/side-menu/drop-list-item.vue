<template>
  <div>
    <template  v-if="showChildren(item)" >
      <Dropdown  placement="right-start">
          <!-- <DropdownItem :name="`${item.name}`">
              {{showTitle(item)}}
              <Icon type="ios-arrow-forward"></Icon>
          </DropdownItem> -->
          <drop-down-item :item="item"></drop-down-item>
          <DropdownMenu slot="list">
              <template v-for="itemChild in item.children" >
                <!-- 有下级,调用自身 -->
                <drop-item v-if="showChildren(itemChild)" :item="itemChild"></drop-item>
                <!-- <DropdownItem :name="`${itemChild.name}`" v-else>{{showTitle(itemChild)}}</DropdownItem> -->
                <drop-down-item :item="itemChild" v-else></drop-down-item>
              </template>
          </DropdownMenu>
      </Dropdown>
    </template>
    <template  v-if="!showChildren(item)" >
      <!-- <DropdownItem :name="`${item.name}`">{{showTitle(item)}}</DropdownItem> -->
      <drop-down-item :item="item"></drop-down-item>
    </template>   
 </div>
</template>

<script>
import mixin from "./mixin";
import itemMixin from "./item-mixin";
import dropDownItem from "./drop-down-item.vue";
import "@/styles/component/iconfont.css";
export default {
  name: "dropItem",
  mixins: [mixin, itemMixin],
  props: ['item', 'isLeft'],
  components: {
    dropDownItem
  }
};
</script>
<style lang="less" scoped>
  .no-height{
      .ivu-dropdown-menu{
        max-height: 80vh;
        overflow-y: auto;
      }
      .ivu-dropdown .ivu-dropdown{
        width: initial!important;
      }
  }
</style>