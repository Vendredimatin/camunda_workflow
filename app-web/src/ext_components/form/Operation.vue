<template>
  <section v-show="hasAuth && !args.hided" :addinName="name" :style="{'width': arg_width}">
    <span v-show="self" style="width: 100%">

      <Button
          :type="args.type"
          v-if="!needPop"
          :shape="args.shape ? 'circle' : null"
          :icon="args.icon"
          :style="{'color': args.disabled ? '#bbbec4' : args.main_fontColor, 'width': '100%', 'height': arg_height}"
          class="self-btn addin-operation"
          :disabled="args.disabled"
          :title="args.text"
          @click="handle"
        >{{ args.text }}</Button>

      <Poptip v-else trigger="hover" transfer :placement="popHoverDirection" :width="popHoverObj.popWidth">
        <Button
          :type="args.type"
          :shape="args.shape ? 'circle' : null"
          :icon="args.icon"
          :style="{'color': args.disabled ? '#bbbec4' : args.main_fontColor, 'width': '100%', 'height': arg_height}"
          class="self-btn addin-operation"
          :disabled="args.disabled"
          :title="args.text"
          @click="handle"
        >{{ args.text }}</Button>
        <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
        <div slot="content">
          <FormEngine
            v-if="!this.isHoverMesPop && popHoverPath"
            ref="form"
            :to_path="popHoverPath"
            :to_query="popHoverQuery"
            :store="store">
          </FormEngine>
          <p v-else>{{ this.popHoverMes }}</p>
        </div>
      </Poptip>
    </span>
    <span v-show="!self" style="width: 100%" ref="body">
    </span>
  </section>
</template>

<script>
  import '@/styles/component/iconfont.css';
  import axios from "@/libs/axios.js";
  import { getQueryOperation } from "@/api/others";
  import { checkClasses } from "@/api/auth-model/AuthEngine";
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import { getAddin, getAddinDom, getAddinFunc } from "@/util/addin.js";

  const name = "Operation";
  export default {
    // 插件名
    name: name,
    // 属性值传入
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'Message',
      'root',
      'formEngine',
      'dwf_ctx',
    ],
    data() {
      return {
        // 插件名
        name: name,

        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        needPop: false,
        isHoverMesPop: false,      // 脚本定义的浮窗文字
        popHoverMes: '',
        actions: {
        '上边': 'top',
        '上左': 'top-start',
        '上右': 'top-end',
        '右边': 'right',
        '右上': 'right-start',
        '右下': 'right-end',
        '下边': 'bottom',
        '下左': 'bottom-start',
        '下右': 'bottom-end',
        '左边': 'left',
        '左上': 'left-start',
        '左下': 'left-end',
      },

        // 支持的数据类型
        dataTypes: ['Operation'],

        popHoverObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popHoverDirection: 'right',
        popHoverPath: '',
        popHoverQuery: {
          query: ''
        },

        // 编辑框
        args: {
          opr_path: "",
          name: "",
          style: "",
          targetDataType: null,
          type: "default",
          shape: false,
          hided: false,
          icon: "",
          text: "操作",
          width:  "auto",
          widthType: "px",
          heightType: "px",
          height: 34,
          color: "#000",
          disabled: false,
          auth : false,    // 是否开启授权
          title: "操作",
          id : "",
          chooseTable: []             // 按钮需要控制的表格

        },

        modalIf: false,
        modal: true,
        modalTitle: "",
        modalPath: "",
        modalQuery: "",

        self: true,
        query_opr: null,
        addin: null,
        hasAuth : false,    // 根据是否开启授权以及真正的授权项判断当前按钮是否有权限显示
        vClick: null,
      }
    },
    inject:[
      'getEn',
      'getJsonData',
      'getParentJson',
      'getObj',
      'GetAddinById',
      'GetAddinByUUID',
      'GetAllAddin',
      'getParentAddin',
      '_getViewData',
      '_getViewDataByAttrs',
      'handleQueryData',
      'getClassObject',
      'getRClassObject',
      'invokeOperation',
      'parseEscapeString',
      'handleScript',
      'addExtraObj',
      'getEventOperation',
    ],
    // 生命周期函数，在获取数据和事件函数后调用
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.$store = this.store;
      // 如果开启了授权，判断是否有权限，否则默认有权限
    },
    components: {
      FormEngine
    },
    computed: {
      arg_width() {
        return this.args.width == "auto" ? 'auto' : this.args.width + this.args.widthType ;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      }
    },
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      this.vClick = this.args.events ? this.args.events.find((val) => {
        return val.name == '单击'
      }) : null;
      this.extend();
      if(this.vClick && this.vClick.opr_path != undefined && this.vClick.opr_path != '') {
        getQueryOperation(this.vClick.opr_path).then(response => {

          let res = response.data;
          if(res.success && res.data) {
            let oName = res.data.conType;

            if(oName == 'tip') {

              if(res.data.action == 'implement') {

                if(res.data.conditionExpre) {

                  this.popHoverMes = res.data.conditionExpre.slice(20);
                  this.popHoverMes = this.popHoverMes.replace(/\'/g, '');
                  this.popHoverMes = this.popHoverMes.replace(/\"/g, '');
                  this.isHoverMesPop = true;
                }

              } else {
                this.isHoverMesPop = false;
              }

              this.popHoverObj = JSON.parse(res.data.viewType);
              this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
              this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
              this.needPop = true;

            } else {

              this.needPop = false;

            }
          } else {
            console.log(res.message);
          }

        }).catch(e => {
          console.log(e);
        });
      }

    },
    // 定义组件的函数接口
    methods: {
      async extend() {
        if (this.args.extend) {
          let query_opr = await axios.get(`meta/queryoperations/${this.vClick.opr_path}`);
          this.query_opr = query_opr.data.data;
          let _path = this.query_opr.conditionExpre;
          if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
          let _addin = getAddinFunc(_path, "operation");
          let self = this;
          let mixins = {
            data(){
              return {
                dwf_ctx: self.dwf_ctx
              }
            }
          }
          let addin = new _addin({
            mixins: [mixins],
            propsData: {
              itemValue: self.itemValue,
              store: self.store,
              Message: self.Message,
              root: self.root,
            },
            methods: {
              getObj(data) {
                return self.getObj(data);
              },
              GetAllAddin() {
                return self.GetAllAddin(self.itemValue.data)
              },
              GetAddinById(id) {
                return self.GetAddinById(self.itemValue.data, id);
              },
              addExtraObj: self.addExtraObj,
            }
          });
          if (addin.canShow && addin.canShow()) {
            this.self = false;
            for (var j = this.$refs.body.children.length; j > 0; j--) {
              this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
            }
            addin.setArgs(this.args).$mount().$el.children[0].className = 'self-btn ' + addin.setArgs(this.args).$mount().$el.children[0].className;
            this.$refs.body.appendChild(addin.setArgs(this.args).$mount().$el);
          }
          this.addin = addin;
        }
      },
      getExtend() {
        return this.args.extend ? this.addin : null;
      },
      async handle() {
        if (this.args.extend) {
          let params = {
            originObj: this.itemValue.data.origin,
            obj: this.getObj(this.itemValue.data),
            className: this.itemValue.data.targetClass
          }
          this.addin.onHandle(params);
        } else {
          let temObj = {
            oidList: this.args.chooseTable
          }
          if(this.vClick){
            this.invokeOperation(this.vClick.opr_type, this.vClick.opr_path, this.itemValue, this.store, null, null, null, temObj);
          }
        }
      },
      invokeEvent(type, operation){
        let temObj = {
          oidList: this.args.chooseTable
        }
        switch (type) {
          case 'click':
            if(this.vClick && operation) {
              this.invokeOperation(operation.type, operation.path, this.itemValue, this.store, null, null, null, temObj);
            }
            break;
          default:
            if(this.vClick) {
              this.invokeOperation(this.vClick.opr_type, this.vClick.opr_path, this.itemValue, this.store, null, null, null, temObj);
            }
            break;
        }
      },
      setDisable(flag) {
        this.args.disabled = flag;
      },
      // 获取控件属性值
      getValue() {
        return null;
      },
      // 设置控件属性值,item是查询到的对象数组
      setValue(item) {
        return this;
      },
      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow() {
        return null;
      },
      // 获取编辑框内容
      getArgs() {
        return this.args;
      },
      // 设置基本属性
      setArgs(args) {
        for (var i in args) this.args[i] = args[i];
        if(this.args.auth){
          // this.hasAuth = false;
          let that = this;
          // 判断是否有权限
          checkClasses(this.args.auth_item, this.itemValue.data.targetClass).then(res => {
            that.hasAuth = res.data;
          });
          // axios.post(`auth/check-classes/${this.itemValue.data.targetClass}?authName=${this.args.auth_item}`).then(res => {
          //   that.hasAuth = res.data.data;
          // });
        }else this.hasAuth = true;
        if ("name" in args) this.args_name = this.args.name;
        this.compatibleEvent();
        return this;
      },

      //兼容以前操作按钮
      compatibleEvent(){
        try {
          if(this.args.opr_path && this.args.opr_type && !this.args.events){
            this.args.eventRange = ["单击"];
            this.args.events = [];
            this.args.events.push({
              name: '单击',
              opr_path: this.args.opr_path,
              opr_type: this.args.opr_type
            })
          }
        }catch (e) {
          console.log(`Operation兼容之前${e}`)
        }
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },
      // 获取插件的属性编辑框的dom元素
      getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },
      // 获取插件名
      getName() {
        return name;
      },
      /**
       * @description 手动设置浮窗
       * @param mes 浮窗显示的文字
       * @param type 浮窗触发的方式 默认鼠标经过触发
       * @param direction 浮窗的指定方向 不传默认top
       * @param width 浮窗的指定宽度 默认150px
      */
      setToolTip(mes, type, direction, width) {

        if(!type) type = 'hover';
        if(!direction) direction = 'top';
        if(!width) width = 150;
        this.popHoverDirection = direction;
        this.popHoverObj.popWidth = width;
        this.isHoverMesPop = true;
        this.popHoverMes = mes;

        this.needPop = true;

      },
      // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
        }
        else if (type == "edit") {
          this.t_edit = true;
        }
        else if (type == "visit") {
          this.t_visit = true;
        }
        return this;
      },
      // 设置插件支持的数据类型，返回类型为数据类型的列表
      getDataType(args) {
        return this.dataTypes;
      },
      async getAuthItem(){
        let authItem;
        if(this.vClick.opr_type == "sys"){
          authItem = this.vClick.opr_path;
        }else if(this.vClick.opr_type == "query"){
          let query_opr = (await axios.get(`meta/queryoperations/${this.vClick.opr_path}`)).data.data;
          authItem = query_opr.authority;
        }
        return authItem;
      },
      setError(error) {
        // var dom = this.$refs.main.querySelector(".i-input .ivu-input");
        // if (dom) dom.style.borderColor = error ? "red" : null;
      },
      hoverEvent() {
        if(this.args && this.args != undefined) {
          let temObj = {
            oidList: this.args.chooseTable
          }
          if(this.vClick){
            this.invokeOperation(this.vClick.opr_type, this.vClick.opr_path, this.itemValue, this.store, null, null, null, temObj);
          }
        }
      },
      validate() {
        return true;
      }
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
</style>
