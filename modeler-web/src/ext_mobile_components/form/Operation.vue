<template>
  <section :addinName="name" ref="main" :style="{'width': arg_width}">  
    <span v-if="t_preview" style="width: 100%">
        <span v-show="self" style="width: 100%">
            <van-badge :dot="args.showBadge && args.badge_type=='dot'" :content="arg_content" :max="args.badge_max" :color="args.badge_color" 
            :style="{'width': '100%', 'vertical-align': 'middle'}">
                <template slot='content' v-if="args.badge_type=='icon'" >
                  <van-icon :name="args.badge_icon" class="badge-icon" />
                </template>
                <van-button
                        :type="args.type"
                        :round="args.shape"
                        :icon="args.icon"
                        :plain="args.needBorder"
                        :style="{'color': args.main_fontColor, 'width': '100%', 'height': arg_height, 'line-height': arg_height}"
                        :disabled="args.disabled"
                >{{ args.text }} </van-button>
            </van-badge>
        </span>
        <span v-show="!self" ref="body">
        </span>
            <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                         :router="router"
                         :route="route"
                         :root="root"
                         :itemValue="itemValue"
                         :query_oprs="query_oprs"
                         :attributes="attributes"
                         :targetclass="itemValue.data.targetClass"
                         @handleChangeEventOfOperationBar="handleChangeEventOfOperationBar"
                >
                    <div slot="attribute">
                      <p class="margin1">目标类</p>
                      <Input class="margin1" disabled :placeholder="getTargetClass()"/>
<!--                      <p class="margin1">绑定操作</p>-->
<!--                      <BindOperationBar class="margin1" index="1"-->
<!--                                        :opr_path="args.opr_path"-->
<!--                                        :opr_type="args.opr_type"-->
<!--                                        :opr_name="args.opr_name"-->
<!--                                        :form_targetclass="itemValue.data.targetClass"-->
<!--                                        :form_json="itemValue"-->
<!--                                        :load_query_oprs="query_oprs"-->
<!--                                        :route="route"-->
<!--                                        :router="router"-->
<!--                                        :root="root"-->
<!--                                        v-on:on-change="handleChangeEventOfOperationBar"-->
<!--                                        style="width:100%"></BindOperationBar>-->
                    <p class="margin1">文字</p>
                    <Input class="margin1" v-model="args.text"/>
                    <div class="margin1">
                      选择绑定的多对象控件:
                        <Button type="default" size="small" shape="circle" icon="md-sync" @click="freshTable"></Button>
                    </div>
                    <Select class="margin1" v-model="args.chooseTable" multiple>
                        <Option v-for="item in tableList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                    <p class="margin1">
                      <span class="margin1">开启授权</span> &nbsp;
                      <i-Switch  style="float: right" v-model="args.auth" @on-change="onChangeOfSwitch"></i-Switch> &nbsp;
                      <Button type="primary" size="small" @click="openAuthDialog" :disabled="!args.auth">管理授权</Button>
                    </p>
                    </div>
                    <div slot="layout">
                    <p class="margin1">按钮样式</p>
                    <Select class="margin1" v-model="args.type" clearable>
                        <Option value="default">默认</Option>
                        <Option value="info">蓝色</Option>
                        <Option value="primary">绿色</Option>
                        <Option value="warning">橙色</Option>
                        <Option value="danger">红色</Option>
                    </Select>
                    <p class="margin1">图标</p>
                    <Select class="margin1" v-model="args.icon" filterable clearable>
                      <Option value="">无</Option>
                      <Option v-for="icon in iconlist" :value="icon.value" :key="icon.value" :label="icon.label">
                          <van-icon :name="`${icon.value}`" style="font-size: 20px !important;"></van-icon>
                          <span style="float:right;color:#ccc">{{ icon.label }}</span>
                      </Option>
                      <!-- <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">
                          <i class="iconfont" :class="x.value" style="font-size: 20px !important;"></i>
                      </Option> -->
                    </Select>
                      <!-- <p class="margin1">文字颜色</p>
                      <Input class="margin1" v-model="args.main_fontColor" placeholder="输入常用颜色的英文名或者#RGB值,如red, #1f1f1f" /> -->
                    <div class="margin1" style="margin: 10px 0 10px 0">
                        文字颜色
                        <ColorPicker v-model="args.main_fontColor" />
                    </div>
                    <div class="margin1" style="margin: 10px 0 10px 0">
                        圆角
                        <i-switch style="float: right" v-model="args.shape" />
                    </div>
                    <div class="margin1" style="margin: 10px 0 10px 0">
                        边框
                        <i-switch style="float: right" v-model="args.needBorder" />
                    </div>
                    <div class="margin1" style="margin: 10px 0 10px 0">
                        禁用
                        <i-switch style="float: right" v-model="args.disabled" />
                    </div>
                    </div>
                </EditBox>
            </span>
    <OperationAuthModal
            ref="operationAuthModal"
            :auth_item="args.auth_item"
            :listStyle="listStyle"
            :transferTitles="transferTitles"
            :targetClass="itemValue.data.targetClass"
    >

      </OperationAuthModal>
      <slot name="widget"></slot>
    </span>
    <span v-else style="text-align: center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe62f;</i>
            </div>
            <div class="form-addin-name">
              按钮xxx
            </div>
        </span>
    <!--      <Modal v-model="show_auth_dialog" title="管理授权" @on-ok="onUpdateAuth" width="700">-->
    <!--        <Transfer-->
    <!--          :data="tem_users_and_groups"-->
    <!--          :target-keys="authed"-->
    <!--          :render-format="transferRender"-->
    <!--          @on-change="handleChangeOfTransfer"-->
    <!--          :list-style="listStyle"-->
    <!--          :titles="transferTitles">-->
    <!--          <div class="selfTransInput">-->
    <!--            <Input v-model="searchQuery" search placeholder="Enter text" style="width: 92%; margin-left: 4%;" @on-enter="selfFilter" @on-change="changeQuery" @on-search="selfFilter" />-->
    <!--          </div>-->
    <!--        </Transfer>-->
    <!--      </Modal>-->
  </section>
</template>

<script>
import '@/styles/component/iconfont.css';
import EditBox from "@/ext_components/form/_EditBox.vue"
import {getEntryOperations} from '@/api/others.js';
import axios from "@/libs/anotherAxios";
import {getAddinFunc} from '@/util/addin.js';
// import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue"
import OperationAuthModal from "@/ext_components/form/subcomponent/OperationAuthModal.vue"
import iconlist from "@/views/functional-model/components/vantIcon.js";
import {mapGetters, mapActions, mapMutations} from "vuex";

const name = "Operation";
export default {
  // 插件名
  name: name,
  // 属性值传入
  props: [
    'addin',
    'basicArgs',
    'argsProps',
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
  ],

    components: {EditBox, OperationAuthModal},

    data() {
      return {
        // 插件名
        name: name,

        // 展示模式
        t_preview: true,
        t_edit: false,
        actEdit: false,

        // 支持的数据类型
        dataTypes: ['Operation'],

        plugType: 'operationPlugin',

        tableList: [],
        tableMap: {},
        searchQuery: '',

        // 编辑框
        args: {
          dynamic: false,
          extend: false,
          opr_path: "",
          opr_name: 'tip',
          type: "info",
          shape: false,
          width:  'auto',
          widthType: "px",
          heightType: "px",
          height: 34,
          icon: "",
          text: "按钮",
          opr_type: null,
          auth: false,
          auth_item: null,
          disabled: false,
          id: "",                     // 控件代号,一般为必须
          main_fontColor: "#fff",     // 主区域字体颜色
          hided: false,               // 是否隐藏

          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "按钮",               // 插件中文名,需要填入默认值
          col: true,                  // 是否不占满全部
          cols: 3,                    // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null,       // 目标数据类型

          chooseTable: [],             // 按钮需要控制的表格
          events: [],
          eventRange: ["单击"],
          showBadge: false,
          badge_type: 'dot',
          badge_color: "red",             // 徽标颜色
          badge_max: null,
          badge_content: null,
          badge_icon: '',
          badge_size: '',
          badge_stype: 'px',
          needBorder: false,
          badge_atrr:'',

        },

      oprs: [
        {
          id: 0,
          path: "save",
          displayName: "新增"
        },
        {
          id: 1,
          path: "edit",
          displayName: "编辑"
        },
        {
          id: 2,
          path: "delete",
          displayName: "删除"
        },
        {
          id: 3,
          path: "refresh",
          displayName: "刷新"
        }
      ],
      targetClass: null,
      targetClassDisplayName: null,
      self: true,
      iconlist: iconlist,
      // iList: ilist,
      show_auth_dialog: false,
      users_and_groups: [],
      tem_users_and_groups: [],
      authed: [],
      listStyle: {
        width: '300px',
        height: '500px'
      },
      transferTitles: ["未授权", "已授权"],
      badge_obj: {},
      show_badge_content:'',
    }
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    // this.loadQueryOprList();
    if (this.t_preview) {
      this.$store = this.store;
    }
  },
  beforeDestroy() {
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

      let that = this;
      if (this.t_preview){
        if (this.args.chooseTable.length > 0) {
          setTimeout(() => {
            that.freshTable();
          }, 300);
        } else that.freshTable();
      }
      if (this.getTargetClass()) {
        let queryObj = {}
        if (!this.relation) {
            queryObj['targetClass'] = this.getTargetClass();
            queryObj['fresh'] = true;
            queryObj['query'] = {
              startIndex: 0,
              pageSize: 1,
            };
        }
        else {
            queryObj = {
                query: {
                  type: 'relation',
                  startIndex: 0,
                  pageSize: 1
                },
                relationClass: this.getTargetClass(),
                fresh: true
            };
        }
        let objs = await this.handleQueryData(queryObj);
        this.badge_obj = objs? objs[0] : {}
        console.log(this.badge_obj)
        if (this.badge_obj && this.args.badge_atrr) {
          if((this.args.badge_type=='number'||this.args.badge_type=='text') &&this.args.badge_atrr != '') {
            this.show_badge_content = this.badge_obj[this.args.badge_atrr]
          }
        }
      }

    },
    watch:{
      'args.badge_type'(){
        this.changeBadgeSize();
      },
      'args.badge_size'(){
        this.changeBadgeSize();
      },
      'args.badge_stype'() {
        this.changeBadgeSize();
      },
      'args.badge_content'(){
        this.changeBadgeSize();
      },
      'args.badge_atrr'() {
        if (this.badge_obj && this.args.badge_atrr) {
          if((this.args.badge_type=='number'||this.args.badge_type=='text') &&this.args.badge_atrr != '') {
            this.show_badge_content = this.badge_obj[this.args.badge_atrr]
          }
        }
      },
    },
    computed: {
    ...mapGetters("DWF_form", [
      "Entities",
      "Relations",
    ]),
      arg_content() {
        if(this.badge_obj && this.args.badge_atrr) {
          if (this.show_badge_content && this.show_badge_content.length && this.show_badge_content.length > 5) {
            return this.show_badge_content.substring(0,5) +'...'
          }

          return this.show_badge_content;
        }
        if (this.args.badge_content && this.args.badge_content.length && this.args.badge_content.length > 5) {
          return this.args.badge_content.substring(0,5) +'...'
        }
        return this.args.badge_content
      },
      arg_width() {
        return this.args.width == "auto" ? 'auto' : this.args.width + this.args.widthType ;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      }
    },
    // 定义组件的函数接口
    methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),

      changeBadgeSize(){
        console.log('chagne size')
        let that = this;
        setTimeout(function(){
          that.$refs.main.querySelector(".van-badge")? that.$refs.main.querySelector(".van-badge").style.fontSize = that.args.badge_size+that.args.badge_stype:'';
        },0)
      },
      loadQueryOprList() {
        console.log(1233333333)
        let that = this;
        getEntryOperations('Root').then(globalOprRes => {
          getEntryOperations(that.targetclass).then(localOprRes => {
            that.query_oprs = globalOprRes.data.data.queryOprConfigs.concat(localOprRes.data.data.queryOprConfigs);
          })
        });
      },

      changeQuery(e) {

        if(this.searchQuery == '') {
          this.tem_users_and_groups = this.users_and_groups.slice(0, 100);
        }
      },

      selfFilter() {

        this.tem_users_and_groups  = [];
        if(this.searchQuery == '') {
          this.tem_users_and_groups = this.users_and_groups.slice(0, 100);
        } else {
          this.tem_users_and_groups = this.users_and_groups.filter(val => {
            return val.filterName.indexOf(this.searchQuery) != -1;
          })
        }

      },

      // 刷新表格列表
      freshTable() {
        this.tableList = this.getTables(this.itemValue.data);
        this.tableMap = {};
        let that = this;
        this.tableList.forEach(x => {
          that.tableMap[x.value] = x.obj;
        })
      },

      getTables(node) {
        var res = [];
        if (node.obj && node.obj.getSelected) {
          res.push({
            obj: node.obj,
            label: node.self.properties.id,
            value: node.self.properties.id
          });
        }
        if (node.elements) {
          for (var i = 0;i < node.elements.length;i++) {
            res = res.concat(this.getTables(node.elements[i]));
          }
        }
        return res;
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
        if (args.text != null && args.text != "")
          setTimeout(() => {
            this.args.text = args.text
          }, 200);
        this.compatibleEvent();

        return this;
      },

      //兼容以前操作按钮
      compatibleEvent(){
        try {
          if(this.args.opr_path && this.args.opr_type && this.args.events.length === 0){
            this.args.eventRange = ["单击"];
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
      getEditBoxComponent(){
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
        if (type == 0) this.t_preview = true;
        else this.t_preview = false;
        return this;
      },

      // 设置插件支持的数据类型，返回类型为数据类型的列表
      getDataType(args) {
        return this.dataTypes;
      },

      getTargetClass() {
        return this.itemValue.data.targetClass;
      },

      async onChangeOfSwitch(state){
        if(state){
          if(!this.args.auth_item){
            this.args.auth_item = await this.getAuthItem();
          }
        }
      },
      openAuthDialog(){
        this.$refs.operationAuthModal.initAuthModal();
      },
      // async openAuthDialog() {
      //   this.show_auth_dialog = true;
      //   // 下载用户和用户组列表
      //   let users = (await getAllUsers()).data.data;
      //   let groups = (await getGroups()).data.data;
      //   let authItem = this.args.auth_item;
      //   let condition = `and r.className='${this.getTargetClass()}' and r.authority='${authItem}'`;
      //   // 获取当前的已授权用户
      //   let authedRules = (await axios.get(`auth/rules?condition=${condition}`)).data.data;
      //   this.authed = [];
      //   this.users_and_groups = [];
      //   this.tem_users_and_groups = [];
      //
      //   if(authedRules.length > 0) {
      //
      //     for(let i=0; i<authedRules.length; i++){
      //       this.authed.push(authedRules[i].participant);
      //
      //       let isGroups = groups.filter(val => {
      //         return val.name == authedRules[i].participant
      //       })
      //       if(isGroups && isGroups.length > 0) {
      //
      //         this.tem_users_and_groups.push({
      //           key: authedRules[i].participant,
      //           displayName: authedRules[i].participant,
      //           filterName: authedRules[i].participant,
      //           type: "group"
      //         })
      //
      //       } else {
      //
      //         let isUsers = users.filter(item => {
      //           return item.name == authedRules[i].participant
      //         })
      //         this.tem_users_and_groups.push({
      //           key: isUsers[0].name,
      //           displayName: isUsers[0].displayName,
      //           filterName: `${isUsers[0].name}-${isUsers[0].displayName}`,
      //           type: "user"
      //         })
      //
      //       }
      //     }
      //
      //   }
      //   for (let i = 0; i < users.length; i++) {
      //     let user = users[i];
      //     this.users_and_groups.push({
      //       key: user.name,
      //       displayName: user.displayName,
      //       filterName: `${user.name}-${user.displayName}`,
      //       type: "user"
      //     })
      //   }
      //
      //   for (let i = 0; i < groups.length; i++) {
      //     let group = groups[i];
      //     this.users_and_groups.push({
      //       key: group.name,
      //       displayName: group.name,
      //       filterName: group.name,
      //       type: "group"
      //     })
      //   }
      //   this.tem_users_and_groups = this.tem_users_and_groups.concat(this.users_and_groups.slice(0, 100));
      //   console.log(this.tem_users_and_groups, this.tem_users_and_groups.length)
      // },

      // transferRender(item) {
      //   return item.displayName + " - " + (item.type == "user" ? "用户" : "用户组");
      // },
      //
      // handleChangeOfTransfer(newTargetKeys) {
      //   console.log(newTargetKeys)
      //   this.authed = newTargetKeys;
      // },

      async getAuthItem(){
        let authItem;
        if(this.args.opr_type == "sys"){
          authItem = this.args.opr_path;
        }else if(this.args.opr_type == "query"){
          let query_opr = (await axios.get(`meta/queryoperations/${this.args.opr_path}`)).data.data;
          authItem = query_opr.authority;
        }
        return authItem;
      },

      // async onUpdateAuth() {
      //   let className = this.getTargetClass();
      //   let authItem = this.args.auth_item;
      //   // 删除已有规则
      //   await axios.post(`auth/rules-delete?className=${className}&authItem=${authItem}`);
      //   // 新增现有规则
      //   let newRules = [];
      //   for(let i=0; i<this.authed.length; i++){
      //     newRules.push({
      //       authority : authItem,
      //       className : className,
      //       participant : this.authed[i],
      //       conditionId : "AlwaysTrue"
      //     })
      //   }
      //   let res = await axios.post('auth/rules-create', newRules);
      //   if(res.data.code == 200){
      //     this.$Message.info("授权成功");
      //   }else{
      //     this.$Message.error(res.data.message);
      //   }
      // },

      handleChangeEventOfOperationBar(event) {
        this.args.extend = false;
        // 处理无的情况
        if (event.conf.opr_type == "none" || event.conf.opr_type == "" || event.conf.opr_path == "") {
          this.self = true;
          this.args.opr_path = event.conf.opr_path;
          this.args.text = "操作";
          this.args.opr_type = event.conf.opr_type;
          this.args.auth_item = "";
        }
        // 处理基本操作
        else if (event.conf.opr_type == 'sys') {
          this.args.opr_path = event.conf.opr_path;
          this.args.text = event.opr_displayName;
          this.args.opr_type = "sys";
          this.self = true;
          this.args.auth_item = event.conf.opr_path;
        } else {
          // 快速查询操作
          // this.loadQueryOprList();
          this.self = true;
          let _id = this.query_oprs.findIndex(x => x.oid == event.conf.opr_path);
          if (_id == -1) {
            this.query_oprs.splice(0, 0, event.query_opr);
          } else {
            this.query_oprs[_id] = event.query_opr;
          }
          //修改操作不更换text
          if(this.args.opr_path === event.conf.opr_path){
            this.args.text = this.args.text === '按钮' ? event.query_opr.displayName : this.args.text;
          }else{
            this.args.text = event.query_opr.displayName;
          }
          this.args.opr_path = event.conf.opr_path;
          this.args.opr_type = "query";
          this.args.auth_item = event.query_opr.authority;
          try {
            if(event.query_opr.oprScript){
              //如果是前后端脚本统一之后的情况
              if(event.query_opr.action == "implement" && ['addin', 'addinAlias'].includes(event.query_opr.implementType)){
                this.args.extend = true;
                let _path = event.query_opr.conditionExpre;
                if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
                let _addin = getAddinFunc(_path, "operation");
                let addin = new _addin({
                  propsData: {
                    itemValue: this.itemValue,
                    store: this.store
                  }
                });
                if (addin.canShow && addin.canShow()) {
                  this.self = false;
                  for (var j = this.$refs.body.children.length; j > 0; j--) {
                    this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                  }
                  this.$refs.body.appendChild(addin.setArgs(this.args).$mount().$el);
                }
              }
            }else{
              if (event.query_opr.action == "implement"
              && !event.query_opr.conditionExpre.startsWith("procedure:")
              && !event.query_opr.conditionExpre.startsWith("serverScript:")
              && !event.query_opr.conditionExpre.startsWith("clientScript:")) {
                this.args.extend = true;
                let _path = event.query_opr.conditionExpre;
                if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
                let _addin = getAddinFunc(_path, "operation");
                let addin = new _addin({
                  propsData: {
                    itemValue: this.itemValue,
                    store: this.store
                  }
                });
                if (addin.canShow && addin.canShow()) {
                  this.self = false;
                  for (var j = this.$refs.body.children.length; j > 0; j--) {
                    this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                  }
                  this.$refs.body.appendChild(addin.setArgs(this.args).$mount().$el);
                }
              }
            }
          }catch (e) {
            console.error(e)
          }
          return;
        }
      },

    }
  }
</script>

<style>
.badge-icon{

  display: block;
}
.van-badge{
  padding: 2px;
  z-index: 7;
}
</style>

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
  .ivu-transfer-list:nth-of-type(3) .selfTransInput{
    opacity: 0
  }
  /* .van-button {
  line-height: 0;
} */


.van-button__text{
  max-width: 100%;
  line-height: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
