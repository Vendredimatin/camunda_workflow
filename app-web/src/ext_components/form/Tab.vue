<template>
  <section :addinName="name" :style="{ 'width': colWidth}">
    <div :style="{
      'backgroundColor': args.back_color}">
      <Tabs ref="main" class="org-tabs self-tabs self-color"
            v-show="!args.hided"
            :animated="animated"
            :name="tabUUID"
            v-model="tab" :style="{'min-height': arg_height,
      'overflow': 'initial',
      'overflow-x': 'hidden',
      'backgroundImage': arg_bgPic,
      'backgroundSize': args.bgSize,
      'backgroundRepeat': args.bgRepeat,
      'border': this.args.border ? '1px solid #233' : 'none',
      'padding': this.args.padding}" @on-click="updateLabelFont">
        <TabPane :tab="tabUUID" v-for="(label, index) in args.tabs" :key="index" :label="label.name" :name="label.name" :disabled="tabDisabled[label.name]">
          <TabPaneComponent
            :label="label"
            :addinProps="addinProps"
            :addin="tabAddinList[index]"
          >

          </TabPaneComponent>
        </TabPane>
      </Tabs>
    </div>
  </section>
</template>

<script>
  import _global from '@/views/global.vue'
  import '@/styles/component/iconfont.css';
  import TabPaneComponent from '@/ext_components/form/TabPaneComponent';
  import { uuid } from '@/util/assist'

  const name = "Tab";
  var echarts = require("echarts");
  export default {
    name: name,
    props: [
      'argsProps',
      'addin',
      'query',
      'store',
      'itemValue',
      'attributes',
      'relation',
      'route',
      'root',
      'Message',
      'echarts',
      'formEngine',
      'dwf_ctx',
    ],
    components: {
      TabPaneComponent
    },
    data() {
      return {
        t_preview: false,
        t_show: false,
        t_icon: true,
        t_edit: false,
        animated: false,
        baseUrl: '',
        name: name,
        addTabName: "",
        // 图标地址
        icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",
        // 点击事件的重载
        onclick_flag: false,
        onclick_callback: null,
        // 编辑框
        args: {
          //固定的
          tabs: [{
            name: "默认标签",
            dropName: "默认标签",
            isRead: false,
            tabTxt: '编辑'
          }],
          border:false,
          padding:"6px",
          title: "标签页",
          id: "",
          hided: false,
          imgOrigin: 'imgSelf',
          back_color: "#fff",             // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          // 适配控件升级 主要针对标题
          // label_fontColor: 'initial',
          // txt_fontColor: 'initial',
          title_fontColor: 'initial',
          // lfsize: 14,
          // lfsizeType: 'px',
          // fsize: 14,
          // fsizeType: 'px',
          height: 200,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',
        },
        tab: "",
        tabDisabled: {},
        selectedTab: '',
        tabUUID: uuid(),
      }
    },
    inject:[
      'GetAllAddin',
    ],
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.baseUrl = _global.baseUrl;
    },
    mounted() {
      if (this.args.tabs.length > 0) this.tab = this.args.tabs[0].name;
      this.args.tabs.forEach(x => this.tabDisabled[x.name] = false);
      setTimeout(() => {this.setInheritStyle();}, 50)
    },
    methods: {
      setInheritStyle() {
        try {
          this.$refs.main.$el.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab') && this.$refs.main.$el.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab').length != 0
            ? this.$refs.main.$el.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab').forEach(item => {
              item.style.color = this.args.title_fontColor == 'initial' ? 'inherit' :  this.args.title_fontColor;
            })
            : '';
        } catch (e) {
        }
      },
      setError(error) {
        return this;
      },
      validate() {
        return true;
      },
      setDisable(name, flag) {
        this.tabDisabled[name] = flag;
        let tab = this.tab;
        this.tab = "";
        this.tab = tab;
      },
      turnTo(name) {
        this.tab = name;
      },
      // 公共移动操作
      moveItem(arr, oldIndex, newIndex) {
        arr[oldIndex] = arr.splice(newIndex, 1, arr[oldIndex])[0];
        return arr;
      },
      /**
       * @description 上移标签
      */
      upItem(index) {
        if(index == 0) return;
        let tabBox = this.$refs.main;
        let targetBox = tabBox.$el.children[1];

        let boxChild = targetBox.children;
        let preInner = boxChild[index - 1].lastChild;
        let selfInner = boxChild[index].lastChild;
        this.$refs.tab.$el.children[1].children[index - 1].appendChild(selfInner);
        this.$refs.tab.$el.children[1].children[index].appendChild(preInner);
        // let preDropStr = `droptarget="${index - 1}"`;
        // let selfDropStr = `droptarget="${index}"`;
        this.moveItem(this.args.tabs, index, index - 1);

      },
      /**
       * @description 下移标签
      */
      downItem(index) {
        if(index == this.args.tabs.length - 1) return;
        let tabBox = this.$refs.main;
        let targetBox = tabBox.$el.children[1];

        let boxChild = targetBox.children;
        let aftInner = boxChild[index + 1].lastChild;
        let selfInner = boxChild[index].lastChild;
        this.$refs.tab.$el.children[1].children[index + 1].appendChild(selfInner);
        this.$refs.tab.$el.children[1].children[index].appendChild(aftInner);
        this.moveItem(this.args.tabs, index, index + 1);

      },
      addTab() {
        if (this.addTabName) {
          let hasName = this.args.tabs.findIndex(n => {
            return n.name == this.addTabName;
          })
          if(hasName == -1) {
            this.args.tabs.push({name: this.addTabName, dropName: this.addTabName});
          } else {
            this.$Message.warning('tab标签不能重复哟');
          }
        }
        this.addTabName = "";
      },
      delTab(index) {
        if (this.args.tabs.length > 1) {
          this.args.tabs.splice(index, 1);
        }
      },
      // 获取控件属性值
      getValue() {
        return null;
      }
      ,
      // 设置控件属性值
      setValue(item) {
        //这里传入的是整个对象的 object
      }
      ,
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
        console.log(this.args.tabs)
        if(this.args.tabs.length > 0) {
          this.args.tabs = this.args.tabs.map((tab, ind) => {
            if(typeof tab == 'string') {
              return {name: tab, dropName: ind, isRead: false, tabTxt: '编辑'}
            } else {
              if(!'isRead' in tab) tab['isRead'] = false;
              if(!'tabTxt' in tab) tab['tabTxt'] = '编辑';
              return tab
            }

          })
        }
        if ("name" in args) this.args_name = this.args.name;
        if(this.args.back_color == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.back_color = 'transparent';
        delete this.args['label_fontColor'];
        delete this.args['txt_fontColor'];
        delete this.args['lfsize'];
        delete this.args['lfsizeType'];
        delete this.args['fsize'];
        delete this.args['fsizeType'];
        return this;
      }
      ,
      // 获取表单项名
      getFormName() {
        return null;
      }
      ,
      // 获取插件的属性编辑框的dom元素
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
      getSelectedTab() {
        return this.selectedTab;
      },
      updateLabelFont(name){
        console.log(name)
        this.selectedTab = name;
        //FIXME: 当前修改方法可能导致内嵌Tab也一起修改
        let that = this;
        this.$nextTick(()=>{
          let allElements = that.$refs.main.$el.querySelectorAll('div.ivu-tabs-tab');
          for(let i=0; i<allElements.length; i++){
            if (allElements[i].classList.contains("ivu-tabs-tab-focused")){
              allElements[i].style.setProperty('color', that.args.txt_fontColor);
              // can do it but not suit other css
              // allElements[i].style.cssText = "font-size: " + this.args_fsize;
            }else {
              allElements[i].style.color = that.args.label_fontColor;
            }
          }

          // visualChart tab切换 resize
          let allCharts = that.$refs.main.$el.querySelectorAll('div.echart-bar');
          if(allCharts) {
            for(var i = 0; i < allCharts.length; i++){
              var myChart = echarts.getInstanceByDom(allCharts[i]);
              myChart ? myChart.resize() : '';
            }
          }


          let addins = this.GetAllAddin(this.itemValue.data);
          for (var i = 0;i < addins.length;i++) {
            // 自定义可视化
            if (typeof  addins[i].run === 'function') {
              addins[i].run();
            }
            // 自定义拖拽块
            if (typeof  addins[i].resetLayoutHeight === 'function') {
              addins[i].resetAllGridItem()
            }
            // 自定义表格
            if (typeof  addins[i].sizeColumnsToFit === 'function') {
              addins[i].sizeColumnsToFit()
            }
          }
          // let addins = this.GetAllAddin(this.itemValue.data);
          // for (var i = 0;i < addins.length;i++) {
          //   if (addins[i].reloadDom) {
          //     addins[i].reloadDom();
          //   }
          // }
        })
      },
    },
    computed: {
      arg_height() {
        return this.args.height + this.args.heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      arg_bgPic() {
        let finalBg = '';
        if(this.args.imgOrigin == 'imgSelf') {
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
      args_fsize(){
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      label_fontColor(){
        return this.args.label_fontColor;
      },
      txt_fontColor(){
        return this.args.txt_fontColor;
      },

      //初始化控件props
      addinProps() {
        return {
          addin: this.addin,
          store: this.store,
          itemValue: this.itemValue,
          query: this.query,
          attributes: this.attributes,
          relation: this.relation,
          route: this.route,
          root: this.root,
          Message: this.Message,
          echarts: this.echarts,
          formEngine: this.formEngine,
          dwf_ctx: this.dwf_ctx
        }
      },

      tabAddinList(){
        let tabAddinList = [];
        this.args.tabs.forEach((tab, index) => {
          tabAddinList[index] = this.addin.elements.filter(addin => addin.self.dropTarget == tab.dropName);
        })
        return tabAddinList;
      },
    },
    watch: {
      'args.title_fontColor'(){
        this.setInheritStyle();
      },
      args_lfsize(){
        this.updateLabelFont();
      },
      label_fontColor(){
        this.updateLabelFont();
      },
      args_fsize(){
        this.updateLabelFont();
      },
      txt_fontColor(){
        this.updateLabelFont();
      }
    }
  }
</script>
<style scoped>
.org-tabs {
  background: #fff;
}
</style>
