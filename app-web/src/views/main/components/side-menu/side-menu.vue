<template>
  <div v-if="menuFlex" class="side-menu-wrapper">
    <slot></slot>
    <Menu :accordion="accordion" ref="menu" class="self-side-menu" v-show="!collapsed" :active-name="activeName" :open-names="openedNames" :theme="theme" width="auto" @on-select="handleSelect" @on-open-change="handleChange">
      <template v-for="item in menuList">
        <side-menu-item direction="hor" v-if="showChildren(item)" :key="`menu-${item.name}`" :parent-item="item"></side-menu-item>
        <menu-item v-else :name="`${item.name}`" :key="`menu-${item.name}`">
          <Icon v-if="item.icon.indexOf('iconfont') == -1" :type="item.icon"/>
          <i v-else :class="item.icon"></i>
          <span>{{ showTitle(item) }}</span>
        </menu-item>
      </template>
    </Menu>
    <div class="menu-collapsed" v-show="collapsed" :list="menuList">
      <collapsed-menu @on-click="handleSelect" hide-title :root-icon-size="rootIconSize" :icon-size="iconSize" :theme="theme" v-for="item in menuList" :parent-item="item" :key="`drop-menu-${item.name}`"></collapsed-menu>
    </div>
  </div>

  <div v-else class="side-menu-wrapper">
    <Row>
      <Col span="4">
        <slot></slot>
      </Col>
      <Col span="19">
        <Menu ref="menu" class="org-side-menu self-hori-sidemenu" mode="horizontal" v-show="!collapsed" :active-name="activeName" :theme="theme" width="auto" @on-select="handleSelect">
          <template v-if="menuList.length <= containNumber">
            <template v-for="item in menuList">
              <drop-list :items="item" :is-more="false" @on-click="handleClick" :key="item.name"></drop-list>
            </template>
          </template>
          <!-- 菜单长度大于8-->
          <template v-else>
            <template v-for="item in menuList.slice(0, containNum)">
              <drop-list :items="item" :is-more="false" @on-click="handleClick" :key="item.name"></drop-list>
            </template>
             <!-- 添加下拉菜单：更多 -->
            <drop-list :list="menuList.slice(containNum)" :is-more="true" @on-click="handleClick"></drop-list>
          </template>
        </Menu>
        <div class="menu-collapsed" v-show="collapsed" :list="menuList">
          <collapsed-menu @on-click="handleSelect" hide-title :root-icon-size="rootIconSize" :icon-size="iconSize" :theme="theme" v-for="item in menuList" :parent-item="item" :key="`drop-menu-${item.name}`"></collapsed-menu>
        </div>
      </Col>
    </Row>

  </div>
</template>

<script>
import sideMenuItem from "./side-menu-item.vue";
import dropList from "./drop-list.vue";
import collapsedMenu from "./collapsed-menu.vue";
import { getIntersection } from "../../../../libs/utils";
import mixin from "./mixin";
import "@/styles/component/iconfont.css";
export default {
  name: "sideMenu",
  mixins: [mixin],
  components: {
    sideMenuItem,
    collapsedMenu,
    dropList
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
      openedNames: [],
      menuFlex: true,
      visible: false,
      containNumber: 0,
      containNum: 0
    };
  },
  created() {
    const appFlex = sessionStorage.getItem('appDirection');
    if(appFlex == '左右任务栏布局') {
      this.menuFlex = true;
    } else {
      this.menuFlex = false;
    }
  },
  methods: {
    handleChange(name) {
      this.openedNames = name;
    },
    handleSelect(name) {
      this.$emit("on-select", name);
    },
    handleClick(name) {
      this.$emit("on-click", name);
    },
    getOpenedNamesByActiveName(name) {
      return this.$route.matched
        .map(item => item.name)
        .filter(item => item !== name);
    },
    menuStyle() {
      let block = document.querySelector('.org-side-menu')
      if(!block)return
      let blockWidth = block.scrollWidth
      // 能容纳的菜单个数
      this.containNumber = parseInt(blockWidth / 110)
      this.containNum = this.containNumber - 1
      console.log(parseInt(blockWidth / 110))
      // 下拉菜单触发区域样式调整
      this.$nextTick(() => {
        // 菜单名称过长
        let list = document.querySelectorAll('.ivu-col-span-19 .ivu-dropdown-rel')
        let listTooltip= document.querySelectorAll('.ivu-col-span-19 .ivu-tooltip-rel')
        list.forEach((item) => {
          item.style.height = '100%'
          item.style.overflow = 'hidden'
        })
        listTooltip.forEach((item) => {
          item.style.height = '100%'
        })
      })
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
    this.menuStyle()
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
  .org-side-menu {
    display: flex; 
    // justify-content: center;
    // 上下排列，下拉框太长的处理
    // .ivu-select-dropdown{
    //   max-height: calc(100vh - 160px)!important;
    //   overflow-y: auto!important;
    // }
  }
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
}
</style>
