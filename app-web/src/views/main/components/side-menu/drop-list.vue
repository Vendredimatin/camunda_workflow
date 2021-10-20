<template>
  <Dropdown @on-click="handleClick" style="padding-left: 10px;" v-if="isMore">
    <!-- 一级菜单 -->
    <a href="javascript:void(0)" style="color: rgba(255,255,255,.7)">
        更多
        <Icon type="ios-arrow-down"></Icon>
    </a>
    <DropdownMenu slot="list" class="no-height">
      <template v-for="item in list">
        <drop-item :item="item" :key="item.name"></drop-item>
      </template>
    </DropdownMenu>
  </Dropdown>
  <Tooltip :content="showTitle(items)" placement="right" v-else style="height: 100%">
    <Dropdown @on-click="handleClick" style="padding-left: 10px;height: 100%">
      <!-- 一级菜单 -->
      <a href="javascript:void(0)" class="menu_a" @click="handleClick(!showChildren(items) ? items.name : '')">
        <Icon v-if="items.icon.indexOf('iconfont') == -1" :type="items.icon"/>
        <i v-else :class="items.icon"></i>
        {{showTitle(items)}}
        <Icon type="ios-arrow-down" v-if="showChildren(items)"></Icon>
      </a>
      <DropdownMenu slot="list" v-if="showChildren(items)" class="no-height">
        <template v-for="item in items.children">
          <drop-item :item="item" :key="item.name"></drop-item>
        </template>
      </DropdownMenu>
    </Dropdown>
    </Tooltip>
</template>
<script>
import mixin from "./mixin";
import itemMixin from "./item-mixin";
import dropItem from "./drop-list-item.vue";
import "@/styles/component/iconfont.css";
export default {
  name: "dropList",
  mixins: [mixin, itemMixin],
  props: ['list', 'isMore', 'items'],
  components: {
    dropItem
  },
  mounted() {
    this.$nextTick(() => {
      // 下拉菜单的宽度去掉100%
      let list = document.querySelectorAll('.no-height .ivu-dropdown')
      list.forEach((item) => {
        item.style.minWidth = '100%'
        item.style.width = 'initial'
      })
    })
  },
  methods: {
    handleClick(name) {
      this.$emit('on-click', name)
    }
  }
};
</script>
<style lang="less" scoped>
// 有子集的高度问题
  .no-height{
      &.ivu-dropdown-menu{
        line-height: 1.5;
        max-height: 80vh;
        overflow-y: auto;
      }
  }
  .menu_a{
    overflow : hidden;
    display: inline-block;
    width:100px;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: rgba(255,255,255,.7);
  }
</style>