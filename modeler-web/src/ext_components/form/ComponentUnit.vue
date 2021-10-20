<template>
  <!-- 输入框 -->
  <section :addinName="addinName" style="text-align: center" @mouseenter="hover" @mouseleave="leave">
    <!--右上角按钮 start-->
    <div class="icon-button" @mouseenter="menu" v-show="isHover">
      <Icon type="ios-more" size="24"></Icon>
    </div>
    <!--右上角按钮 end-->

    <!--右上角弹出菜单 start-->
    <transition name="click-menu">
      <div class="icon-click-menu" v-show="isMenu" :style="{'right': '0px'}">
        <a @click="edit">编辑</a>
        <br>
        <a @click="remove">删除</a>
        <br>
      </div>
    </transition>
    <!--右上角弹出菜单 end-->
    <span style="text-align:center">
      <div class="form-addin-icon">
          <Icon v-if="iconType == 0" :type="componentIcon" style="font-size: 12px !important;"></Icon>
          <i v-if="iconType == 1" class="iconfont" :class="componentIcon" style="font-size: 12px !important;"></i>
      </div>
      <div v-if="nameType == 0" class="form-addin-name">
          {{ name }}
      </div>
      <Tooltip class="form-addin-name" max-width="200"  v-else :content="name" style="width: 100%;" :transfer="true">
        {{ nameS }}...
      </Tooltip>
    </span>
  </section>
</template>

<script>
const name = "ComponentUnit";
import moduleIconData from "@/views/functional-model/components/moduleIcon";
import fontIconData from "@/views/functional-model/components/iFontIcon";

export default {
  name: name,
  components: {
  },
  props: [
    'componentGroupOid',
    'componentOid',
    'relationOid',
    'viewName',
    'displayName',
    'componentIcon',
    'note',
  ],
  data() {
    return {
      type: 'ComponentUnit',
      name: '',
      nameS: "",
      nameType: 0,
      icon: 'Iotdb',
      iconType: 0,
      addinName: '',
      isHover: false,
      isMenu: false,
      index: 0,
      editing: false,

      actEdit: false,
      args: {
        type: 'html',
        htmlCode: '',
        vueCode: '',
        uname: '',
      },
      hint: false,
      loading: false,
      root: null,
    }
  },
  created() {
    if(this.componentIcon && moduleIconData.findIndex(i => i.value === this.componentIcon) !== -1){
      this.iconType = 0
    } else if(this.componentIcon && fontIconData.findIndex(i => i.value === this.componentIcon) !== -1){
      this.iconType = 1
    }
    this.setName(this.displayName)
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
  },
  watch: {
    displayName(val){
      this.setName(val)
    }
  },
  methods: {
    cancel() {

    },
    onHint() {
      if (this.root && this.root.deleteSuperControl) {
        this.root.deleteSuperControl(this.args.id);
      }
    },
    hover() {
      this.isHover = true;
    },
    leave() {
      this.isHover = false;
      this.isMenu = false;
    },
    menu() {
      this.isMenu = true;
    },
    edit() {
      this.$emit('editComponentAddin', {
        componentGroupOid: this.componentGroupOid,
        componentOid: this.componentOid,
        relationOid: this.relationOid,
        owner: this.componentGroupOid,
        viewName: this.viewName,
        displayName: this.displayName,
        componentIcon: this.componentIcon,
        note: this.note,
      })
    },
    remove() {
      this.$emit('deleteComponentAddin', this.componentOid);
    },
    setIndex(index) {
      this.index = index;
      return this;
    },
    decIndex() {
      this.index--;
    },
    setType(type) {
      this.type = type;
      this.addinName = this.type + "_" + this.name;
      return this;
    },
    setName(name) {
      this.name = name;
      // this.addinName = this.type + "_" + this.name;
      if (name.length > 3) {
        this.nameType = 1;
        this.nameS = name.substr(0, 4);
      } else this.nameType = 0;
      return this;
    },
    setIcon(icon, iconType) {
      this.icon = icon;
      if (iconType) this.iconType = iconType;
      return this;
    },
    setArgs(args) {
      this.args = args;
      return this;
    },
    setRoot(root) {
      this.root = root;
      return this;
    }
  }
};
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}

p {
  margin: 10px 0;
}

.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.icon-button {
  position: absolute;
  top: 0;
  right: 10px;
  z-index: 3;
  width: 15px;
  height: 20px;
  cursor: pointer;
}

.icon-click-menu {
  z-index: 4;
  position: absolute;
  right: -60px;
  top: 0;
  width: 60px;
  height: 60px;
  padding: 12px;

  font-size: 14px;
  background: #FFF;
  line-height: 20px;

  border-bottom: 1px solid #DDD;
  border-right: 1px solid #DDD;
  border-top: 1px solid #DDD;
}

.icon-click-menu > a {
  text-decoration: none;
  color: #333;
  font-weight: 400;
}
</style>
