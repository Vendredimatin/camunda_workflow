<template>
  <section :addinName="name" ref="main" :style="{'width': colWidth}">
    <div v-if="t_preview" :style="[bindStylePreview]" class="clearfix">
      <h3 class="blank-mark" :style="{'color': args_title_fontColor, 'font-size': args_lfsize}">{{ args._title }}</h3>
      <hr style="margin-bottom: 10px" v-show="args._title">
      <div style="width: 100%;" :style="{'min-height': arg_container_height}" :dropTarget="0" addin="layout"
           class="clearfix">
        <draggable
          class='dragArea'
          draggable=".vue-draggable-addin"
          group='addin'
          :list="formAddinList"
          ghost-class="vue-draggable-ghost"
          @change='jsonDataChange'
        >
          <FormAddinList
            v-for="(childrenAddin, index) in addin.elements"
            :key="childrenAddin.self.uuid"
            :addin="childrenAddin"
            v-bind="addinProps"
            :ref="`FormAddinList${childrenAddin.self.uuid}`"
            @activeAddin="activeAddin"
            @copyAddin="copyAddin"
            @removeAddin="removeAddin"
            @deleteAddin="deleteAddin"
            @commentAddin="commentAddin"
            @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
          >

          </FormAddinList>
        </draggable>
      </div>
      <!--编辑框-->
      <slot name="widget"></slot>
      <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args">
        <div slot="attribute">
          <p class="margin1">标题</p>
          <Input class="margin1" v-model="args._title"></Input>
          <p class="margin1">内边距</p>
          <Input class="margin1" v-model="args.padding"></Input>
          <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
              边框
              <i-switch style="float: right" v-model="args.border"/>
          </div>
        </div>
        <div slot="layout">
          <div class="margin1" style="margin: 10px 0 10px 0">
            标题字体颜色
            <ColorPicker v-model="args.title_fontColor"/>
          </div>
        </div>
        <div slot="operation">
        </div>
      </EditBox>
    </span>

    </div>

    <div v-else>
      <div class="form-addin-icon">
        <i class="icon iconfont icon-fenzukuang"></i>
      </div>
      <Tooltip class="form-addin-name" content="分组框" style="width: 100%" :transfer="true">分组框</Tooltip>
    </div>
  </section>
</template>

<script>
import _global from '@/views/global.vue'
import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import {uuid} from "@/util/assist";
import draggable from "vuedraggable";
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

const name = "GroupBox";

export default {
  name: name,
  props: [
    'addin',
    'activeUUID',
    'basicArgs',
    'argsProps',
    'widgetAnnotation',
    'editExtendInfo',
    'itemValue',
    'attributes',
    'relation',
    'query_oprs',
    'route',
    'router',
    'root',
    'store',
    'formCanvas',
  ],
  components: {
    EditBox,
    draggable,
  },
  data() {
    return {
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,
      name: name,

      // 图标地址
      icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",
      baseUrl: '',


      // 编辑框

      actEdit: false,
      args: {
        layout: true,
        border: false,
        padding: "6px",
        style: "",
        _title: "默认标题",
        title: "分组框",
        id: "",
        hided: false,

        // 适配控件升级 主要针对标题
        label_fontColor: 'initial',
        txt_fontColor: 'initial',
        title_fontColor: 'initial',
        lfsize: 14,
        lfsizeType: 'px',
        fsize: 14,
        fsizeType: 'px',
        height: 40,                  // 整体高度=
        heightType: "px",                  // 整体高度=
        width: 100,
        widthType: '%',
        imgOrigin: 'imgSelf',
        back_color: "#fff",
        back_picture: "",           // 背景图片,超链接
        bgStyle: 'cover',           // 背景图片显示方式
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgPercent: 100,
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
      },

      node: null,
      timer: null,

      // inherit: ["label_width", "main_width", "main_align", "label_align", "lfsize", "lfsizeType", "fsize", "fsizeType", "label_fontColor", "txt_fontColor"],
      inherit: [],
      // formAddinList: [],
    }
  },

  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  inject: [
    'GetJsonById',
    'GenerateID',
    'setBasicArgs',
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      this.baseUrl = _global.baseUrl;
    }
  },
  mounted() {
    if (this.t_preview) {
      let that = this;
      this.timer = setInterval(() => {
        that.node = that.GetJsonById(that.itemValue.data, that.args.id);
        if (that.node) {
          console.log("node:", that.node);
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 100);
    }
    // this.$refs.main.querySelector("h3.blank-mark").style.fontSize = 'inherit';
    // this.$refs.main.querySelector("h3.blank-mark").style.color = 'inherit';
  },


  methods: {
    // refreshFormAddinList(){
    //   this.formAddinList = this.addin.length !== 0 ? this.addin.map(addin => {
    //     return {
    //       name: addin.self.elementType.replace('addin_', ''),
    //       uuid: addin.self.uuid,
    //       addin: addin,
    //     }
    //   }) : [];
    // },

    getInherit() {
      let res = {};
      this.inherit.forEach(x => {
        res[x] = this.args[x];
      })
      return res;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return [];
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      if (this.args.back_color == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.back_color = 'transparent';
      delete this.args['label_fontColor'];
      delete this.args['txt_fontColor'];
      delete this.args['lfsize'];
      delete this.args['lfsizeType'];
      delete this.args['fsize'];
      delete this.args['fsizeType'];
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取插件名
    getName() {
      return name;
    },

    // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
    setDisplayType(type) {
      this.t_preview = type == 0;
      return this;
    },

    // 设置插件的图标
    setIcon(id) {
      this.icon_url = id;
      return this;
    },

    getIcon() {
      return this.icon_url;
    },

    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return null;
    },

    jsonDataChange(evt) {
      for (let type in evt) {
        switch (type) {
          case 'added':
            if (evt.added.element.addin) {
              //非收藏控件拖入
              this.addin.elements.splice(evt.added.newIndex, 0, evt.added.element.addin);
            } else if (evt.added.element.nameProps){
              //超级控件
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.nameProps}`,
                  properties: {
                    ...evt.added.element.argsProps,
                    id: this.GenerateID(evt.added.element.nameProps),
                    collectId: evt.added.element.oidProps,
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            } else if(evt.added.element.groupOid){
              //小组件控件
              try {
                let addin = {
                  self: {
                    elementType: `addin_FormEngine`,
                    properties: {
                      bindTargetClass: "Component&e",
                      viewName: evt.added.element.viewName,
                      groupDisplayName: evt.added.element.groupDisplayName,
                      groupOid: evt.added.element.groupOid,
                      componentOid: evt.added.element.oid,
                      componentDisplayName: evt.added.element.displayName,
                    },
                    dropTarget: 0,
                    uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                  },
                  elements: [],
                }
                this.addin.elements.splice(evt.added.newIndex, 0, addin);
              }catch (e){
                console.error(`小组件控件${e}`)
              }
            } else if (evt.added.element.ISASSEMBLE) {
              //sdk控件
              let addin = {
                self: {
                  elementType: `addin_AssembleAddin`,
                  properties: {
                    _ASSEMBLECONFIG: evt.added.element
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            } else {
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.name}`,
                  properties: {},
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            }
            this.$emit('snapShotHistory');
            break;
          case 'moved':
            this.addin.elements.move(evt.moved.oldIndex, evt.moved.newIndex)
            this.$emit('snapShotHistory');
            break;
          case 'removed':
            this.$emit('removeAddin', evt.removed.element.uuid, this.addin.self.uuid)
            break;
          default:
            break;
        }
      }
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      // if(parentUUID === this.addin.self.uuid){
      //   //点击复制按钮联动更新draggable的list
      //   let element = {
      //     name: addin.self.elementType.replace('addin_', ''),
      //     uuid: addin.self.uuid,
      //     addin: addin,
      //   }
      //   this.formAddinList.push(element);
      // }
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton){
      // if(parentUUID === this.addin.self.uuid){
      //   //点击删除按钮联动删除draggable的list
      //   let index = this.formAddinList.findIndex(addin => addin.uuid === uuid);
      //   this.formAddinList.splice(index, 1);
      // }
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
  },
  computed: {
    arg_height() {
      return this.args.height + this.args.heightType;
    },
    arg_container_height() {
      switch (this.args.heightType) {
        case 'px':
          return this.args.height + this.args.heightType;
          break;
        case 'vw':
          return this.args.height + this.args.heightType;
          break;
        case 'vh':
          return this.args.height + this.args.heightType;
          break;
        case 'rem':
          return this.args.height + this.args.heightType;
          break;
      }
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    arg_bgPic() {
      let finalBg = '';
      if (this.args.imgOrigin == 'imgSelf') {
        finalBg = `url(${this.args.back_picture})`
      } else {
        finalBg = this.args.back_picture == '' ? this.args.back_picture : `url(${this.baseUrl}/files-download/${this.args.back_picture})`;
      }
      return finalBg;
    },
    args_title_fontColor() {
      return this.args.title_fontColor
    },
    bindStylePreview() {
      return {
        "width": "100%",
        "border": this.args.border ? "1px solid #233" : "1px dashed #bbb",
        "padding": this.args.padding,
        'backgroundImage': this.arg_bgPic,
        'backgroundSize': this.args.bgSize,
        'backgroundRepeat': this.args.bgRepeat,
        "background-color": this.args.back_color,
        'min-height': this.arg_height
      }
    },
    bindStyleShow() {
      return {
        "width": "100%",
        "border": this.args.border ? "1px solid #233" : "none",
        "padding": this.args.padding,
        "background-color": "#fff",
      }
    },
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + " !important";
    },
    args_lfcolor() {
      return this.args.label_fontColor;
    },
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + " !important";
    },
    args_fcolor() {
      return this.args.txt_fontColor;
    },
    args_label_width() {
      return this.args.label_width;
    },
    args_main_width() {
      return this.args.main_width;
    },
    args_label_align() {
      return this.args.label_align;
    },
    args_main_align() {
      return this.args.main_align;
    },
    //初始化控件props
    addinProps() {
      return {
        store: this.store,
        activeUUID: this.activeUUID,
        basicArgs: this.basicArgs,
        itemValue: this.itemValue,
        attributes: this.attributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        Message: this.$Message,
        echarts: this.$echarts,
        formCanvas: this.formCanvas,
      }
    },

    formAddinList(){
      return this.addin.elements.map(addin => {
        return {
          name: addin.self.elementType.replace('addin_', ''),
          uuid: addin.self.uuid,
          addin: addin,
        }
      })
    }
  },
  watch: {
    args_lfsize(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("lfsize" in x.self.properties) {
          x.self.properties.lfsize = this.args.lfsize;
          x.self.properties.lfsizeType = this.args.lfsizeType;
        }
      })
    },
    args_lfcolor(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_fontColor" in x.self.properties) {
          x.self.properties.label_fontColor = this.args.label_fontColor;
        }
      })
    },
    args_fsize(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("fsize" in x.self.properties) {
          x.self.properties.fsize = this.args.fsize;
          x.self.properties.fsizeType = this.args.fsizeType;
        }
      })
    },
    args_fcolor(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("txt_fontColor" in x.self.properties) {
          x.self.properties.txt_fontColor = this.args.txt_fontColor;
        }
      })
    },
    args_label_width(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_width" in x.self.properties) {
          x.self.properties.label_width = this.args.label_width;
        }
      })
    },
    args_main_width(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("main_width" in x.self.properties) {
          x.self.properties.main_width = this.args.main_width;
        }
      })
    },
    args_label_align(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_align" in x.self.properties) {
          x.self.properties.label_align = this.args.label_align;
        }
      })
    },
    args_main_align(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("main_align" in x.self.properties) {
          x.self.properties.main_align = this.args.main_align;
        }
      })
    },
  }
}
</script>

<style scoped>
section {
  display: inline-block;
  vertical-align: top;
}

p {
  margin: 10px 0;
}

.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.blank-mark {

}
</style>
