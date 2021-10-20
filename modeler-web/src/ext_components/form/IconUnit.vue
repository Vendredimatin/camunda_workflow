<template>
  <!-- 输入框 -->
  <section :addinName="addinName" style="text-align: center" @mouseenter="hover" @mouseleave="leave">
    <Modal v-model="editing" title="编辑" width="80%" :mask-closable="false" @on-cancel="cancel" @on-ok="run" ok-text="运行"
           :loading="true">
      <Tabs v-model="args.type">
        <TabPane label="HTML" name="html">
          <MonacoEditor v-model="args.htmlCode" ref="htmlEditor" v-if="editing" @init="editorInit" lang="html"
                        theme="chrome" width="100%" height="600"></MonacoEditor>
          <Spin fix v-if="loading"></Spin>
        </TabPane>
        <TabPane label="Vue" name="vue">
          <MonacoEditor v-model="args.vueCode" ref="vueEditor" v-if="editing" @init="editorInit" lang="html"
                        theme="chrome" width="100%" height="600"></MonacoEditor>
          <Spin fix v-if="loading"></Spin>
        </TabPane>
      </Tabs>
    </Modal>
    <Modal v-model="hint" title="删除控件" width="40%" :mask-closable="false" @on-ok="onHint">
      <p style='font-size: 16px; font-weight: bold'>您确定要删除 {{ args.uname }} 控件吗?</p>
      <p>当前控件已经在众多表单中使用,如果删除将无法统一修改调整相关引用的控件并需要重新运行相关引用控件</p>
    </Modal>
    <!--右上角按钮 start-->
    <div class="icon-button" @mouseenter="menu" v-show="isHover">
      <Icon type="ios-more" size="24"></Icon>
    </div>
    <!--右上角按钮 end-->

    <!--右上角弹出菜单 start-->
    <transition name="click-menu">
      <!--              <div class="icon-click-menu" v-show="isMenu" :style="{'right': (index+1) % 2 == 0 ? '30px' : '0px'}">-->
      <div class="icon-click-menu" v-show="isMenu" :style="{'right': '0px'}">
        <!-- <a @click="handlePreviewModal(className,title)">预览</a><br> -->
        <a @click="edit">编辑</a><br>

        <a @click="remove">删除</a>

        <br>
      </div>
    </transition>
    <!--右上角弹出菜单 end-->
    <span style="text-align:center">
                <div class="form-addin-icon">
                    <Icon v-if="iconType == 0" :type="icon" style="font-size: 12px !important;"></Icon>
                    <i v-if="iconType == 1" class="iconfont" :class="icon" style="font-size: 12px !important;"></i>
                </div>
                <div v-if="nameType == 0" class="form-addin-name">
                    {{ name }}
                </div>
                <Tooltip class="form-addin-name" max-width="200" v-else :content="name" style="width: 100%;"
                         :transfer="true">{{ nameS }}...</Tooltip>
            </span>
  </section>
</template>

<script>
const name = "IconUnit";
import axios from 'axios';
import {createView, updateView} from "@/api/others";
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";

export default {
  name: name,
  components: {
    MonacoEditor,
  },
  props: [
    'oidProps',
    'nameProps',
    'viewNameProps',
    'displayNameProps',
    'indexProps',
    'typeProps',
    'iconProps',
    'iconTypeProps',
    'argsProps',
    'rootProps',
  ],
  data() {
    return {
      type: 'SuperControl',
      name: '超级控件',
      nameS: "超级",
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
      init: true,
    }
  },
  created() {
    this.setName(this.displayNameProps);
    this.setIcon(this.iconProps, this.iconTypeProps);
    this.setIndex(this.indexProps);
    this.setType(this.typeProps);
    this.setArgs(this.argsProps);
    this.setRoot(this.rootProps);
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.init = false;
  },
  watch: {
    oidProps(val) {
      if (!this.init) {
        this.setName(this.displayNameProps);
        this.setIcon(this.iconProps, this.iconTypeProps);
        this.setIndex(this.indexProps);
        this.setType(this.typeProps);
        this.setArgs(this.argsProps);
        this.setRoot(this.rootProps);
      }
    }
  },
  methods: {
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    cancel() {
      console.log("cancel");
      this.args.htmlCode = this.args.old_htmlCode;
      this.args.vueCode = this.args.old_vueCode;
      this.args.type = this.args.old_type;
      this.$nextTick(() => {
        if (this.args.type == "html") {
          this.$refs.htmlEditor.setValue(this.args.htmlCode);
        } else {
          this.$refs.vueEditor.setValue(this.args.vueCode);
        }
      })
    },
    async run() {
      // if (this.loading) return;
      this.loading = true;
      let args = {
        ...this.args,
        old_htmlCode: this.args.htmlCode,
        old_vueCode: this.args.vueCode,
        old_type: this.args.type,
      };

      let targetFormType = sessionStorage.getItem('targetFormType') || 'PC';
      let item = {
        className: '*',
        hasThumbnail: false,
        v3Content: JSON.stringify(args),
        viewName: '@SuperControl',
        displayName: this.name,
        oid: this.oidProps,
        deviceType: 'actPc',
        formType: targetFormType

      };
      res = await updateView(item);
      if (!res.data.success) {
        let message = "编辑失败";
        if (res.data.message) message = res.data.message;
        this.$Message.error(message);
      }
      this.args.htmlCode = this.args.htmlCode.replace("&quot;", '"');

      let params = {
        type: this.args.type,
        html: this.args.htmlCode,
        css: this.args.cssCode,
        js: this.args.jsCode,
        vue: this.args.vueCode,
        uuid: this.oidProps
      };
      params.uuid = this.oidProps + '_' + params.type;


      let res = await axios({
        method: "post",
        url: `${Config.baseUrl}/code-upload`,
        data: JSON.stringify(params),
        headers: {"Content-Type": "application/json"},
      });
      // let url = `${global_.tomcatUrl}/code/${params.url_uuid}.html`;
      // this.args.url = url;
      this.loading = false;
      if (this.args.type == "html") this.args.old_htmlCode = this.args.htmlCode;
      else this.args.old_vueCode = this.args.vueCode;
      if (this.root && this.root.$refs.form && this.root.$refs.form.syncFresh) {
        this.root.$refs.form.syncFresh(this.args.type, this.args.htmlCode, this.args.vueCode, this.oidProps);
      }
      this.args.old_type = this.args.type;
      if (this.root && this.root.updateSuperControl) {
        this.root.updateSuperControl(this.oidProps, this.args.type, this.args.htmlCode, this.args.vueCode);
      }
      this.editing = false;
    },
    onHint() {
      if (this.root && this.root.deleteSuperControl) {
        this.root.deleteSuperControl(this.oidProps);
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
      this.editing = true;
      this.isMenu = false;
    },
    remove() {
      this.hint = true;
      this.isMenu = false;
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
      this.addinName = this.type + "_" + this.name;
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
  /*
      box-shadow: darkgrey 1px 0 1px 1px;
      border-radius: 2px;
  */

}

.icon-click-menu > a {
  text-decoration: none;
  color: #333;
  font-weight: 400;
}
</style>
