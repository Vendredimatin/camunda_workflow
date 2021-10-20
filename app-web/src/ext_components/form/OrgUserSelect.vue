<template>
  <!--
        应用前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
     <!--
            标签, 一般的属性插件都有,如文本框
            对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
    -->
    <span
      v-if="args.required || args.label"
      :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}"
    >
      <span
        :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="ori-color self-color" :style="{'color': args_lfcolor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>
    <!--
            插件前端实现区域
    -->
    <span
      :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
    >
      <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'display': 'inline-block', 'vertical-align': mainYAlign}">
        <span>
          <Cascader
            class="i-input self-color"
            :disabled="readOnly || t_visit"
            :render-format="cascaderFormat"
            :data="orgUserList"
            :change-on-select="args.appointGroup"
            filterable
            transfer
            clearable
            v-model="selectedGroups"
            @on-visible-change="visibleChange"
            @on-change="handleChange"
            @on-clear="handleClear"
            :style="{'font-size':args_fsize,'color':args_fcolor,'border': border,'text-align': mainXAlign}"
          ></Cascader>

        </span>
        <!-- <span v-else>
          <label :style="{ 'color':args_fcolor,'font-size': args_fsize,'text-align': mainXAlign}">{{displayname}}</label>
        </span> -->
      </span>
    </span>
    <!-- 必填验证 -->
    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
      <span v-show="isRequired" class="wrongTips">该项不能为空</span>
      <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import { getAllUsers, getAllUserTree, getUserFromGroup, getGroup, getUser, getAllUserGroupTree} from "@/api/others";
// 设置插件英文名, 该name需要与插件文件名一致
const name = "OrgUserSelect";

export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要用到store时需要store
     */
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
    ],
  data() {
    return {
      name: name,
      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,
      isWrong: false,
      isRequired: false,
      errorMessage: '',

      // 属性配置项,按需设置
      args: {
        height: 30, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        readonly: false, // 是否只读
        hided: false
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String", "UUID", "Clob"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,
      times: 0,

      // 一般插件的实际值用this.value存储
      value: null,
      displayname :'',
      displayType:'',

      allGroupsUsersList: [],
      allUserList: [] ,// 所有的指定用户组的用户数组
      orgUserList: [],
      vChange:'',
      selectedGroups:[],
      displayValue:'',
      border: null,

      firstVisi: true,
    };
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
    'invokeEvent',
  ],
  // 生命周期函数，在获取数据和事件函数后调用，
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);
  },
  mounted() {
    // 需要动态设置高度时使用,不用可删去
    this.setHeight();
    this.$nextTick(() => {
      this.setInheritStyle();
      // 字体/颜色/ 默认继承
      if(this.$refs.main.querySelector(".ivu-select-item")){
        this.$refs.main.querySelector(".ivu-select-item").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-select-item").style.color = 'inherit';
      }
      if(this.$refs.main.querySelector(".ivu-cascader-menu-item")){
        this.$refs.main.querySelector(".ivu-cascader-menu-item").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-cascader-menu-item").style.color = 'inherit';
      }

      if(this.$refs.main.querySelector(".ivu-input")){
        this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
      }
    });
    // 默认非空时 自动校验
    // if (this.value != null) { this.validate();}
    this.initData();
    if(this.args.events && this.args.events.length > 0) {
      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })
    }

  },
  watch: {
    'args.height'(val) {
      this.setHeight();
      this.setInheritStyle();
    },
  },
  computed: {
    readOnly(){
      if(!this.args.readonly && this.displayType!='list' && this.displayType!='visit'){
        return false;
      } else {
        return true;
      }
    },
     // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_fcolor() {
      return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
    },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    // 需要设置目标属性时使用,不用可删去
    arg_name() {
      return this.args.name;
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    },
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
      }else{
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    mainWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
      }else{
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    labelXAlign() {
      let x = parseInt(this.args.label_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    labelYAlign() {
      let x = this.args.label_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },
    mainXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    mainYAlign() {
      let x = this.args.main_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },


  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    onDynamic(value){
      this.setValue(value);
    },
    setInheritStyle() {
      try {
        this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
          ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.height = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.lineHeight = this.arg_height;
          item.style.height = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
              item.style.backgroundColor = 'inherit';
            })
          : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = this.args.txt_bgColor == '' ? 'transparent' : this.args.txt_bgColor;
          }): '';

      } catch (e) {

      }
    },
    // 设置异常状态显示
    setError(error, mes) {

      this.isWrong = error;
      this.border = error ? '1px solid red' : null;
      if(mes) {
        this.errorMessage = mes;
      } else {
        this.errorMessage = '';
      }
      return this;

    },

    // 设置校验逻辑,返回true/false
    validate() {
      let expResult = true;
      if(this.args.required) {
        if(this.firstVisi && !this.value) {
          this.isWrong = false;
          this.isRequired = true;
          expResult = false;
        }else if(!this.firstVisi && this.selectedGroups.length == 0){
          this.isWrong = false;
          this.isRequired = true;
          expResult = false;
        }
        // if(this.args.appointGroup && this.selectedGroups.length == 0) {
        //   this.isRequired = true;
        //   expResult = false;
        // } else if(!this.args.appointGroup && this.args.appointUser && (this.value == null || this.value == '')){
        //   this.isRequired = true;
        //   expResult = false;
      } else {
        this.isRequired = false;
      }
      this.setError(expResult ? null : true);

      this.isWrong = !expResult;

      return expResult;
    },

    // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
    getValue() {
      // if(this.args.appointGroup) {
        var _value;
        if(this.selectedGroups[this.selectedGroups.length - 1] && this.selectedGroups.length > 0) {
          _value = this.selectedGroups[this.selectedGroups.length - 1];
        } else {
          if(this.firstVisi) _value = this.value;
          else _value = '';
        }
        return _value;
    },

    async setDisplayName(value){
      let that = this;
      if(this.args.appointUser){
        await getUser(value).then(res=>{
              var user = res.data.data;
              if(user){
                that.displayname = user["displayName"];
                return;
              }
        });
      }else{
        await getGroup(value).then(res=>{
              var group = res.data.data;
              if(group){
                that.displayname = group["displayName"];
                return;
              }
        });

      }


    },
    /*
            设置插件对应的值,
            items目前为对应值
            items将为目标对象列表
            特殊情况下需要进行格式转化再赋值
        */
    async setValue(items) {
      // console.log(items)
      // if (this.$refs.main) {
      //   this.$refs.main.querySelector(".ivu-input").placeholder="";
      //   this.$refs.main.querySelector(".ivu-cascader-label").innerHTML = "";
      //   this.selectedGroups = "";
      // }
      var value = null;
      if (items == null) {
        // 初始化操作
        value = "defaultValue" in this.args ? this.args.defaultValue : null;
      } else if (typeof items == "object") {
        if (items && items.length > 0) value = items[0][this.args.name];
      } else value = items;
      this.value = value;
      let that = this;

      if(this.value){
        await this.setDisplayName(that.value);

      }else{
        //  var dom = that.$refs.main.querySelector(".ivu-cascader-label");
        // this.$refs.main.querySelector(".ivu-input").placeholder="请选择";
        // dom.innerHTML = "";
        // this.selectedGroups = "";

      }
      var orgtimer = setInterval(() => {
        if (!that.$refs.main) {return;}
        var dom = that.$refs.main.querySelector(".ivu-cascader-label");
          if (dom) {
          that.$refs.main.querySelector(".ivu-input").placeholder="";
          if(this.value && this.displayname){
            dom.innerHTML = that.displayname;

          }else{
              this.$refs.main.querySelector(".ivu-input").placeholder="请选择";
              dom.innerHTML = "";
              this.selectedGroups = [];
            }
            clearInterval(orgtimer);
            orgtimer = null;
          }
          orgtimer += 20;
          if (orgtimer > 60 * 1000) {
            clearInterval(orgtimer);
            orgtimer = null;
          }
      }, 20);

      return this;
    },

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
      if (this.timer == null) {
        this.timer = setInterval(() => {
          if (!that.$refs.main) {
            clearInterval(that.timer);
            that.timer = null;
            return;
          }
          // 改成你需要的样式
          var dom = that.$refs.main.querySelector(".i-input .ivu-input");
          var domS = that.$refs.main.querySelector(".ivu-select-selection");
          if (dom) {
            dom.style.height = that.arg_height;
            clearInterval(that.timer);
            that.timer = null;
          } else {
            that.times += 30;
            if (that.times > 60 * 1000) {
              clearInterval(that.timer);
              that.timer = null;
            }
          }
          if (domS) {
            domS.style.height = that.arg_height;
            clearInterval(that.timer);
            that.timer = null;
          }
        }, 30);
      }
    },

    /*
            type取值范围为 create, visit, edit
            需要根据三个状态修改具体前端和逻辑
            一般情况下:
                create创建态: 无数据,可编辑
                visit浏览态: 有数据,不可编辑
                edit编辑态: 有数据,可编辑
         */
    setDisplayType(type) {
      this.displayType = type;
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
      }
      else if (type == "edit") {
        this.t_edit = true;
      }
      else if (type == "visit" ||type == "list") {
        this.t_visit = true;
      }
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';
      return this;
    },

    getArgs() {
      return this.args;
    },

    getAllow() {
      return null;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },

    cascaderFormat(labels, selectedData) {
      const index = labels.length - 1;
      return labels[index];
    },

    initData() {
      this.loadOrgData();

    },
    getOrgPath(){
      return this.selectedGroups;
    },
    setInitOrgPath(path){
      this.args.selectGroup = path;
    },
    setInitOrgName(underGroupName){
      this.args.underGroupName = underGroupName;
    },

     loadOrgData(){
        if(this.args.appointUser){
          let that = this;
          let param = {'rootGroupName':this.args.underGroupName};
          getAllUserGroupTree(param).then(res =>{
              this.allGroupsUsersList = res.data.data;
              this.handleGroupUserList(this.allGroupsUsersList.childrenGroups );
              this.orgUserList = this.allGroupsUsersList.childrenGroups;

              this.allGroupsUsersList.users = this.allGroupsUsersList.users.map(user=>{
                return {'label':user.displayName,'value':user.oid};
              });
              if(this.allGroupsUsersList.oid == "00000000000000000000000000000000"
                  &&this.allGroupsUsersList.users.length>0){
                this.orgUserList.push({'children':[...this.allGroupsUsersList.users], 'label':"无组织用户",'value':"00000000000000000000000000000000"});

              }else{
                this.orgUserList.push(...this.allGroupsUsersList.users);
              }
          });
        } else if(this.args.appointGroup){
          getAllUserTree().then(res => {
            this.orgUserList = res.data.data;
              this.handleGroupList(this.orgUserList);
              if(this.args.underGroupName){
                console.log(this.orgUserList)
                this.orgUserList = this.getUnderGroup(this.orgUserList).children;
                console.log(this.orgUserList)
              }
            });
        }
    },
    getUnderGroup(groups){
      for(var group of groups){
       if(group.name == this.args.underGroupName) return group;
        if('children' in group && group.children.length>0){
          var t = this.getUnderGroup(group.children);
          if( t!= null) return t;
        }
      }
     return null
    },
     handleGroupList(groups){
      // this.allGroupsList = JSON.parse(JSON.stringify(allGroupsClasses).replace(/name/g, "label"));
      // this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/oid/g, "value"));
      // this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/childrenGroups/g,"children"));
      groups.forEach(group=>{
          group.label = group.displayName;
          group.value = group.oid;
          if('childrenGroups' in group){
            this.handleGroupList(group.childrenGroups);
            group.children = group.childrenGroups;
          }else{
            group.children = [];
          }
          // delete group.name;
          delete group.oid;
          delete group.childrenGroups;
      });
    },
    handleGroupUserList(groups){
      // if(groups instanceof Array){
        groups.forEach( group =>{
          group.label = group.displayName;
          group.value = group.oid;
          // delete group.name;
          delete group.oid;
          if('childrenGroups' in group && group.childrenGroups.length>0){
            this.handleGroupUserList(group.childrenGroups);
            group.children = group.childrenGroups;
            delete group.childrenGroups;
          }else {
            group.children = [];
            if(group.users.length==0) group.disabled = true;
          }
          group.users.forEach(user=>{
            user.label = user.displayName; user.value = user.oid;
            delete user.displayName; delete user.oid;
          });

          group.children = group.children.concat(group.users);
          delete group.users;
        });
      // }
    },
    visibleChange(statu){
      if(this.args.appointGroup){
        this.isRequired = false;

        if(this.errorMessage == '') {
          this.setError(false);
        }

        if(statu && this.firstVisi && this.value){
          var dom = this.$refs.main.querySelector(".ivu-cascader-label");
          dom.innerHTML = "";
        }
        this.firstVisi = false;
      }

    },

    handleClear(){
      if (this.args.required) {
        this.isRequired = true;
      }
    },

    handleChange(value,selectedData){
      var index = value.length-1;
      this.selectedGroups = [];
      for(var i=0;i<selectedData.length;i++){
        this.selectedGroups.push(selectedData[i].value);
      }

      this.value = value[index];
      if(this.vChange) {
          let obj = this.getObj(this.itemValue.data);
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store,null,obj);
      }
      var dom = this.$refs.main.querySelector(".ivu-cascader-label");
      if(this.value!=null){
         dom.innerHTML = selectedData[index].label;
        this.isRequired = false;
        this.setError(false);
      }else{
        dom.innerHTML = "";
        this.selectedGroups = [];
        if (this.args.required) {
          this.isRequired = true;
          this.setError(true);
        }
      }
    },

    async triggerEvent(type){
      let obj;
      switch (type) {
        case 'valueChanged':
          if(this.vChange) {
            obj = this.getObj(this.itemValue.data);
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store, null, obj);
          }
          break;
        default:
          if(this.vChange) {
            obj = this.getObj(this.itemValue.data);
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store, null, obj);
          }
          break;
      }
    },
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
.ori-color {
  color: initial;
}
.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
</style>
