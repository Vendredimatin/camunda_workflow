<template>
  <div class="side-menu-wrapper">
    <slot></slot>
    <Menu ref="menu" :accordion="accordion" v-show="!collapsed" :active-name="activeName" :open-names="openedNames" :theme="theme" width="auto" @on-select="handleSelect" @on-open-change="handleChange">
      <template v-for="(item, index) in menuList">
        <side-menu-item v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
        <menu-item v-else :name="`${item.name}`" :key="`menu-${item.name}`"><Icon :type="item.icon"/><span>{{ showTitle(item) }}</span></menu-item>
<!--        <side-menu-item v-if="showChildren(item)" :key="index" :parent-item="item"></side-menu-item>-->
<!--        <menu-item v-else :name="`${item.name}`" :key="index"><Icon :type="item.icon"/><span>{{ showTitle(item) }}</span></menu-item>-->
      </template>
    </Menu>
    <div class="menu-collapsed" v-show="collapsed" :list="menuList">
      <collapsed-menu @on-click="handleSelect" hide-title :root-icon-size="rootIconSize" :icon-size="iconSize" :theme="theme" v-for="(item, index) in menuList" :parent-item="item" :key="`drop-menu-${item.name}`"></collapsed-menu>
<!--      <collapsed-menu @on-click="handleSelect" hide-title :root-icon-size="rootIconSize" :icon-size="iconSize" :theme="theme" v-for="(item, index) in menuList" :parent-item="item" :key="index"></collapsed-menu>-->
    </div>
  </div>
</template>

<script>
import sideMenuItem from "./side-menu-item.vue";
import collapsedMenu from "./collapsed-menu.vue";
import { getIntersection } from "../../../../libs/utils";
import mixin from "./mixin";
export default {
  name: "sideMenu",
  mixins: [mixin],
  components: {
    sideMenuItem,
    collapsedMenu
  },
  props: {
    menuList: {
      type: Array,
      default() {
        return [];
      }
    },
    collapsed: {
      type: Boolean
    },
    theme: {
      type: String,
      default: "dark"
    },
    rootIconSize: {
      type: Number,
      default: 20
    },
    iconSize: {
      type: Number,
      default: 16
    },
    accordion: Boolean,
    activeName: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      openedNames: []
    };
  },
  methods: {
    handleChange(name) {
      this.openedNames = name;
    },
    handleSelect(name) {
      this.$emit("on-select", name);
    },
    getOpenedNamesByActiveName(name) {
      return this.$route.matched
        .map(item => item.name)
        .filter(item => item !== name);
    }
  },
  watch: {
    activeName(name) {
      if (this.accordion)
        this.openedNames = this.getOpenedNamesByActiveName(name);
      else
        this.openedNames = getIntersection(
          this.openedNames,
          this.getOpenedNamesByActiveName(name)
        );
    },
    openedNames() {
      this.$nextTick(() => {
        this.$refs.menu.updateOpened();
      });
    }
  },
  mounted() {
    this.openedNames = getIntersection(
      this.openedNames,
      this.getOpenedNamesByActiveName(name)
    );
  }
};
</script>

<style lang="less">
.side-menu-wrapper {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .menu-collapsed {
    padding-top: 10px;
    a.drop-menu-a {
      display: inline-block;
      padding: 6px 15px;
      width: 100%;
      text-align: center;
      color: #495060;
    }
    .ivu-dropdown {
      width: 100%;
      .ivu-dropdown-rel button {
        width: 100%;
      }
    }
    .menu-title {
      margin-left: 6px;
    }
    .ivu-select-dropdown {
      width: 160px;
      margin-left: 4px;
    }
  }
  .ivu-menu-vertical{
    .ivu-menu-submenu-title{
      padding-right: 50px;
    }
  }
}
</style>
