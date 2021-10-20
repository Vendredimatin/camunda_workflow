<template>
  <section :addinName="name" ref="main" :style="{'width': colWidth}">
    <div v-if="t_preview">
      <Tabs
        ref="tab"
        id="tabsWrap"
        :name="tabUUID"
        v-model="tabIndex"
        :animated="false"
        :style="{'min-height': arg_height,
                'overflow': 'initial',
                'overflow-x': 'hidden',
                'backgroundImage': arg_bgPic,
                'backgroundSize': args.bgSize,
                'backgroundRepeat': args.bgRepeat,
                'backgroundColor': args.back_color,
                'border': this.args.border ? '1px solid #233' : '1px dashed #bbb',
                'padding': this.args.padding}"
        @on-click="updateLabelFont"
      >
        <TabPane
          v-for="(label,index) in args.tabs"
          :tab="tabUUID"
          :name="`${String(index)}`"
          :label="label.name"
          :key="`Pane${label.dropName}`"
        >
          <TabPaneComponent
            :label="label"
            :height="arg_container_height"
            :addinProps="addinProps"
            :basicArgs="basicArgs"
            :addin="tabAddinList[index]"
            :originAddin="addin"
            :ref="`Pane${index}`"
            @activeAddin="activeAddin"
            @copyAddin="copyAddin"
            @removeAddin="removeAddin"
            @deleteAddin="deleteAddin"
            @commentAddin="commentAddin"
            @snapShotHistory="() => { $emit('snapShotHistory') }"
          >

          </TabPaneComponent>
        </TabPane>
      </Tabs>
      <!--编辑框-->
      <slot name="widget"></slot>
      <span v-show="t_edit" ref="edit">
        <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args">
          <div slot="attribute">
            <label class="margin1">添加</label>
            <Row class="margin1">
              <Col span="12">
                <Input v-model="addTabName" size="small"/>
              </Col>
              <Col span="3">
                <Button type="text" size="small" @click="addTab">添加</Button>
              </Col>
            </Row>
            <label class="margin1">标签列表</label>
            <Row class="margin1" v-for="(label,index) in args.tabs">
              <Col span="12">
                <Input v-model="args.tabs[index].name" size="small" :readonly="!label.isRead"/>
              </Col>
              <Col span="3">
                <Button type="text" size="small" @click="editTab(index, label.dropName)">{{ label.tabTxt }}</Button>
              </Col>
              <Col span="3">
                <Button type="text" size="small" @click="delTab(index, label.dropName)">删除</Button>
              </Col>
              <Col span="3">
                <Button type="text" size="small" icon="md-arrow-up" @click="upItem(index)"></Button>
              </Col>
              <Col span="3">
                <Button type="text" size="small" icon="md-arrow-down" @click="downItem(index)"></Button>
              </Col>
            </Row>
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


    <span v-else style="text-align: center">
            <div class="form-addin-icon">
                <i class="icon iconfont icon-biaoqianye"></i>
            </div>
       <div class="form-addin-name">
            标签页
          </div>
      <!--            <Tooltip class="form-addin-name" content="标签页" style="width:100%;" :transfer="true">标签页</Tooltip>-->
        </span>
  </section>
</template>

<script>
import _global from '@/views/global.vue'
import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import {uuid} from "@/util/assist";
import TabPaneComponent from '@/ext_components/form/TabPaneComponent';
import _ from 'lodash';

const name = "Tab";
var echarts = require("echarts");
export default {
  name: name,
  props: [
    'addin',
    'argsProps',
    'basicArgs',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
    'formCanvas',
  ],
  components: {
    EditBox,
    TabPaneComponent,
  },
  data() {
    return {
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,
      name: name,
      addTabName: "",
      temTabs: [{
        name: "默认标签",
        dropName: "默认标签",
        isRead: false,
        tabTxt: '编辑'
      }],
      // 图标地址
      icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",
      baseUrl: '',
      // 点击事件的重载
      onclick_flag: false,
      onclick_callback: null,

      // 编辑框

      actEdit: false,
      args: {
        layout: true,
        //固定的
        tabs: [{
          name: "默认标签",
          dropName: "默认标签",
          isRead: false,
          tabTxt: '编辑'
        }],
        border: false,
        padding: "6px",
        title: "标签页",
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
        imgOrigin: 'imgSelf',
        back_color: "#fff",             // 背景颜色
        back_picture: "",           // 背景图片,超链接
        bgStyle: 'cover',           // 背景图片显示方式
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgPercent: 100,
        height: 110,                  // 整体高度=
        heightType: "px",                  // 整体高度=
        width: 100,
        widthType: '%',
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
      },
      _addin: null,
      node: null,
      timer: null,
      tabIndex: '0',
      // inherit: ["label_width", "main_width", "main_align", "label_align", "lfsize", "lfsizeType", "fsize", "fsizeType", "label_fontColor", "txt_fontColor"],
      inherit: [],
      tabUUID: uuid(),
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
      this.$nextTick(() => {
        this.setInheritStyle();
      })
    }
  },

  methods: {
    // refreshFormAddinList(){
    //   this.args.tabs.forEach((tab, index) => {
    //     this.$refs[`Pane${index}`][0].refreshFormAddinList();
    //   })
    // },
    setInheritStyle() {
      try {
        this.$refs.main.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab') && this.$refs.main.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab').length != 0
          ? this.$refs.main.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab').forEach(item => {
            item.style.color = this.args.title_fontColor;
          })
          : '';
      } catch (e) {
      }
    },
    // 公共移动操作
    moveItem(arr, oldIndex, newIndex) {
      let element = this.args.tabs.splice(oldIndex, 1)[0];
      this.$nextTick(() => {this.$set(this.args.tabs, newIndex, element);})

      return arr;
    },
    upItem(index) {

      let hasOtherEdit = this.args.tabs.findIndex(n => {
        return n.tabTxt == '完成';
      })

      if (hasOtherEdit != -1) {
        this.$Message.warning('请先完成页签的编辑')
      } else {
        if (index == 0) return;
        // let tabBox = this.$refs.tab;
        // let targetBox = tabBox.$el.children[1];
        //
        // let boxChild = targetBox.children;
        // let preInner = boxChild[index - 1].lastChild;
        // let selfInner = boxChild[index].lastChild;
        // this.$refs.tab.$el.children[1].children[index - 1].appendChild(selfInner);
        // this.$refs.tab.$el.children[1].children[index].appendChild(preInner);
        let tabs = _.cloneDeep(this.args.tabs);
        this.args.tabs = [];
        this.$nextTick(() => {
          this.args.tabs = tabs.move(index, index - 1);
        })
        this.tabIndex = '0';
        // this.moveItem(this.args.tabs, index, index - 1);
        this.$refs.tab.$forceUpdate();
      }

      // let preDropStr = `droptarget="${index - 1}"`;
      // let selfDropStr = `droptarget="${index}"`;
      // // let preInner = boxChild[index - 1].innerHTML.replace(preDropStr, selfDropStr);
      // // let selfInner = boxChild[index].innerHTML.replace(selfDropStr, preDropStr);
      // let preInner = boxChild[index - 1].innerHTML
      // let selfInner = boxChild[index].innerHTML

      // this.$refs.tab.$el.children[1].children[index - 1].innerHTML = selfInner;
      // this.$refs.tab.$el.children[1].children[index].innerHTML = preInner;
    },
    downItem(index) {
      let hasOtherEdit = this.args.tabs.findIndex(n => {
        return n.tabTxt == '完成';
      })

      if (hasOtherEdit != -1) {
        this.$Message.warning('请先完成页签的编辑');
      } else {

        if (index == this.args.tabs.length - 1) return;
        // let tabBox = this.$refs.tab;
        // let targetBox = tabBox.$el.children[1];
        //
        // let boxChild = targetBox.children;
        // let aftInner = boxChild[index + 1].lastChild;
        // let selfInner = boxChild[index].lastChild;
        // this.$refs.tab.$el.children[1].children[index + 1].appendChild(selfInner);
        // this.$refs.tab.$el.children[1].children[index].appendChild(aftInner);
        let tabs = _.cloneDeep(this.args.tabs);
        this.args.tabs = [];
        this.$nextTick(() => {
          this.args.tabs = tabs.move(index, index + 1);
        })
        this.tabIndex = '0';
        // this.moveItem(this.args.tabs, index, index + 1);
        this.$forceUpdate();

      }

      // let boxChild = targetBox.children;
      // let aftInner = boxChild[index + 1].innerHTML;
      // let selfInner = boxChild[index].innerHTML;

      // this.$refs.tab.$el.children[1].children[index + 1].innerHTML = selfInner;
      // this.$refs.tab.$el.children[1].children[index].innerHTML = aftInner;
      // this.moveItem(this.args.tabs, index, index + 1);

    },
    getInherit() {
      let res = {};
      this.inherit.forEach(x => {
        res[x] = this.args[x];
      })
      return res;
    },
    addTab() {

      let hasOtherEdit = this.args.tabs.findIndex(n => {
        return n.tabTxt == '完成';
      })

      if (hasOtherEdit != -1) {
        this.$Message.warning('请先完成页签的编辑');
      } else {

        if (this.addTabName) {

          let hadName = '';
          let hasName = this.args.tabs.findIndex(n => {
            return n.name == this.addTabName;
          })

          if(hasName != -1) {
            hadName = this.temTabs[hasName].name;
          } else {
            hasName = this.args.tabs.findIndex(n => {
              return n.dropName == this.addTabName;
            })
            if(hasName != -1) {
              hadName = this.temTabs[hasName].dropName;
            }
          }

          if (hasName == -1) {
            this.args.tabs.push({name: this.addTabName, dropName: this.addTabName, isRead: false, tabTxt: '编辑'});
            this.temTabs.push({name: this.addTabName, dropName: this.addTabName, isRead: false, tabTxt: '编辑'});
          } else {
            this.$Message.info({
                content: `'${hadName}' 标签已被使用，请更换其他名称`,
                duration: 5
              });
          }
        }
        this.addTabName = "";
        setTimeout(() => {
          this.setInheritStyle();
        }, 50)

      }

      this.$refs.tab.$forceUpdate();
    },
    editTab(index, name) {
      console.log(index, name)
      if (this.args.tabs[index].tabTxt == '编辑') {

        let hasOtherEdit = this.args.tabs.findIndex(n => {
          return n.tabTxt == '完成';
        })

        if (hasOtherEdit != -1) {
          this.$Message.warning('请先完成页签的编辑');
        } else {

          this.args.tabs[index].tabTxt = '完成';
          this.args.tabs[index].isRead = true;

        }

      } else {

        if (this.args.tabs.length > 1) {

          let hadName = '';
          let hasName = this.temTabs.findIndex(n => {
            return n.name === this.args.tabs[index].name;
          })

          if(hasName != -1) {
            hadName = this.temTabs[hasName].name;
          } else {
            hasName = this.temTabs.findIndex(n => {
              return n.dropName === this.args.tabs[index].name;
            })
            if(hasName != -1) {
              hadName = this.temTabs[hasName].dropName;
            }
          }

          if (hasName == -1 || hasName == index) {

            if (index == 0 && hasName > 0) {
              this.$Message.info({
                content: `'${hadName}' 标签已被使用，请更换其他名称`,
                duration: 5
              });
              this.args.tabs[index].name = '默认标签'
            } else {

              this.args.tabs[index].tabTxt = '编辑'
              this.args.tabs[index].isRead = false;
              this.temTabs[index].name = this.args.tabs[index].name;

            }

          } else {
            this.$Message.info({
                content: `'${hadName}' 标签已被使用，请更换其他名称`,
                duration: 5
              });
            this.args.tabs[index].name = this.temTabs[index].name;
          }
        } else {
          this.args.tabs[index].tabTxt = '编辑'
          this.args.tabs[index].isRead = false;
          this.temTabs[index].name = this.args.tabs[index].name;
        }

      }
      this.$refs.tab.$forceUpdate();
    },
    delTab(index, name) {

      let hasOtherEdit = this.args.tabs.findIndex(n => {
        return n.tabTxt == '完成';
      })

      if (hasOtherEdit != -1) {
        this.$Message.warning('请先完成页签的编辑');
      } else {

        if (this.args.tabs.length > 1) {
          if (!this._addin) {
            let uuid = this.$refs.main.getAttribute("UUID");
            let _find = (ele, uuid) => {
              if (ele.self && ele.self.uuid == uuid) return ele;
              let res = null;
              if (ele.elements) {
                for (var i = 0; i < ele.elements.length; i++) {
                  res = _find(ele.elements[i], uuid);
                  if (res) break;
                }
              }
              return res;
            }
            this._addin = _find(this.itemValue.data, uuid);
          }
          let dropName = this.args.tabs[index].dropName;
          let elementIndex = this.addin.elements.findIndex(addin => addin.self.dropTarget == dropName);
          this.args.tabs.splice(index, 1);
          this.addin.elements.splice(elementIndex, 1);
          this.temTabs.splice(index, 1);
        }

      }

      this.$refs.tab.$forceUpdate();
    },
    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return [];
    }
    ,
    // 获取编辑框内容
    getArgs() {
      return this.args;
    }
    ,
    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if (this.args.tabs.length > 0) {
        this.args.tabs = this.args.tabs.map((tab, ind) => {
          if (typeof tab == 'string') {
            return {name: tab, dropName: ind, isRead: false, tabTxt: '编辑'}
          } else {
            if (!'isRead' in tab) tab['isRead'] = false;
            if (!'tabTxt' in tab) tab['tabTxt'] = '编辑';
            return tab
          }

        })
        this.temTabs = JSON.parse(JSON.stringify(this.args.tabs));
      }
      if (args && "name" in args) this.args_name = this.args.name;
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
      return null;
    }
    ,
    // 获取插件的属性编辑框的dom元素
    getEditBoxComponent() {
      return this.$refs.editbox;
    },
    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    }
    ,
    // 获取插件名
    getName() {
      return name;
    }
    ,
    // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
    setDisplayType(type) {
      this.t_preview = type == 0;
      return this;
    }
    ,
    // 设置插件的图标
    setIcon(id) {
      this.icon_url = id;
      return this;
    }
    ,
    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return [];
    },
    updateLabelFont() {
      //FIXME: 当前修改方法可能导致内嵌Tab也一起修改
      this.$nextTick(() => {

        let allElements = this.$refs.main.querySelectorAll('div.ivu-tabs-tab');
        for (let i = 0; i < allElements.length; i++) {
          if (allElements[i].classList.contains("ivu-tabs-tab-focused")) {
            allElements[i].style.setProperty('color', this.args.txt_fontColor);
            // can do it but not suit other css
            // allElements[i].style.cssText = "font-size: " + this.args_fsize;
          } else {
            allElements[i].style.color = this.args.label_fontColor;
          }
        }

        // 自定义可视化
        let allCharts = this.$refs.main.querySelectorAll('div.self-echart');
        if (allCharts) {
          setTimeout(() => {
            for (var i = 0; i < allCharts.length; i++) {
              var myChart = echarts.getInstanceByDom(allCharts[i]);
              myChart ? myChart.resize() : '';
            }

          }, 500);

        }

      })
    },
    activeAddin(type, addin, uuid, formAddin) {
      this.$emit('activeAddin', type, addin, uuid, formAddin);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      if(parentUUID === this.addin.self.uuid){
        //点击复制按钮联动更新draggable的list
        let element = {
          name: addin.self.elementType.replace('addin_', ''),
          uuid: addin.self.uuid,
          addin: addin,
        }
        let index = this.args.tabs.findIndex(tab => tab.dropName === addin.self.dropTarget);
      }
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton){
      if(parentUUID === this.addin.self.uuid){
        //点击删除按钮联动删除draggable的list
        let dropTarget = this.addin.elements.find(ele => ele.self.uuid === uuid).self.dropTarget;
        let index = this.args.tabs.findIndex(tab => tab.dropName === dropTarget)
      }
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
          return this.args.height - 70 + this.args.heightType;
          break;
        case 'vw':
          return this.args.height - 3 + this.args.heightType;
          break;
        case 'vh':
          return this.args.height - 10 + this.args.heightType;
          break;
        case 'rem':
          return this.args.height - 4 + this.args.heightType;
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
    bindStylePreview() {
      return {
        "width": "100%",
        "border": this.args.border ? "1px solid #233" : "1px dashed #bbb",
        "padding": this.args.padding,
        "min-height": "120px"
      }
    },
    bindStyleShow() {
      return {
        "width": "100%",
        "border": this.args.border ? "1px solid #233" : "none",
        "padding": this.args.padding
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

    tabAddinList(){
      let tabAddinList = [];
      this.args.tabs.forEach((tab, index) => {
        tabAddinList[index] = this.addin.elements.filter(addin => addin.self.dropTarget == tab.dropName)
      })
      return tabAddinList;
    },
  },
  watch: {
    'args.title_fontColor'() {
      this.setInheritStyle();
    },
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
</style>
