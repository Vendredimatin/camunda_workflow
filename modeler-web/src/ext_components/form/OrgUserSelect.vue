<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
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
        <label class="msize" :style="{'color': args.label_fontColor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>
    <!--
            插件前端实现区域
    -->
    <span
      :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
    >
      <span
        :style="{'background-color': args.main_color, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
      <!-- :data="getAllOrgUsers" -->
        <Cascader
          class="i-input"
          :disabled="args.readonly"
          :render-format="cascaderFormat"
          :data ="orgUserList"
          :change-on-select="args.appointGroup"
          filterable
          transfer
          clearable
          v-model="selectedGroups"
          @on-change="handleChange"
          :style="{'height': arg_height, 'font-size':args_fsize,'color':args.txt_fontColor,'text-align': mainXAlign}"
        ></Cascader>

        <!-- <Select class="i-input" v-model="value" prefix="ios-home" v-if="args.appointUser && !args.appointGroup"  @disabled="args.readonly" transfer :disabled="args.readonly"  clearable
          :style="{'position': 'relative','top':'-2px', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'font-size': args_fsize,'color':args.txt_fontColor}"
        >
          <Option
            style="text-align:left;"
            v-for="user in allUserList"
            :value="user.oid"
            :key="user.oid"
            :label="user.displayName"
          >
            <span class="self-color">{{ user.displayName }}</span>
            <span class="self-color" style="float:right;color:#ccc">{{ user.name }}</span>
          </Option>
        </Select> -->
      </span>
    </span>
    <!--
            属性编辑框区域
            需要该插件获取attributes, router, route, root, query_oprs, itemValue的prop
            对于不需要设置目标属性的插件,可以将attributes去掉
            对于不需要设置事件的插件,可以将router, route, root, query_oprs去掉
    -->
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
        v-model="args"
               :itemValue="itemValue"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :query_oprs="query_oprs"
       :data-types="dataTypes"
        :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
          <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
          -->
          <div class="margin1">
            指定为
            <!-- &#160;用户组<Checkbox v-model="args.appointGroup"></Checkbox>
            &#160;用户<Checkbox v-model="args.appointUser" ></Checkbox> -->
             <Radio v-model="args.appointGroup">用户组</Radio>
             <Radio v-model="args.appointUser">用户</Radio>
          </div>
          <div>
            <p class="margin1">所属用户组</p>
            <Cascader
              :data="allGroupsList"
              :render-format="cascaderFormat"
              change-on-select
              filterable
              v-model="args.selectdUnderGroup"
              @on-change="handleSelectGroup"
            ></Cascader>
          </div>

        </div>

        <div slot="layout">
          <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
          -->
        </div>
        <div slot="operation">
          <!--
                        事件选项放置区域
          -->
        </div>
      </EditBox>
    </span>
  </section>
  <!--
        插件的拖拽图标样式
        :addinName="name"不可去除
  -->
  <section v-else :addinName="name">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <i class="iconfont">&#xe6a1;</i>
      </div>
      <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
      <!-- <div class="form-addin-name">组织用户点选器</div> -->
      <!-- 设置插件的中文名,名字长度大于3时使用 -->

      <Tooltip class="form-addin-name" content="组织用户点选器" style="width: 100%;" :transfer="true">组织用户</Tooltip>
    </span>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import EditBox from "./_EditBox.vue";
import { getAllUsers, getAllUserTree, getUserFromGroup,getAllUserGroupTree} from "@/api/others";

// 设置插件英文名, 该name需要与插件文件名一致
const name = "OrgUserSelect";

export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要设置目标属性时需要attributes, relation
     需要设置事件时需要query_oprs, route, router, root, Message
     需要用到store时需要store
     */
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
    "itemValue",
    "attributes",
    "query_oprs",
    "route",
    "router",
    "root",
    "store",
    "Message",
    "relation"
  ],
  data() {
    return {
      times: 0,
      name: name,

      t_preview: true,
      t_edit: false,

      // 属性配置项,按需设置

      actEdit: false,
      args: {
        dynamic: false,     // 动态响应
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        // rule: "", // 验证规则
        // ruleMessage :"", // 验证提示信息
        height: 30, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        label_color: "initial", // 标签背景颜色
        txt_fontColor: 'initial',// 内容文字颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        fsize: 14,// 内容文字大小
        fsizeType: 'px',// 内容文字大小单位


        main_align: 4, // 主区域对齐方式,默认为4居中对齐
        // main_fontType: "", // 主区域字体
        // main_fontSize: 14, // 主区域字号
        main_fontColor: "initial", // 主区域字体颜色
        main_color: "initial", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        label_width: 2,
        main_width: 3, // 标签与主区域的占比为 label_width : main_width
        required: false, // 是否必填
        readonly: false, // 是否只读
        hided: false, // 是否隐藏

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "组织用户点选器", // 插件中文名,需要填入默认值
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [],
        eventRange: ["值变化"],

        browseAttributes: [], //浏览字段
        appointGroup: true, //指定为用户组
        appointUser: false, //指定为用户
        selectdUnderGroup:[], //选择的所属用户组
        underGroupName: null, // 限制用户所在的用户组
        userAttributes: [], //选择用户展示的属性

      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["UUID", "String"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,

      value: "",
      allGroupsList: [],
      allGroupsUsersList: [],
      orgUserList:[], // 显示及联选择的数据
      selectedGroups:[],

    };
  },
  components: {
    EditBox
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      let that = this;
      // 需要设置目标属性时使用,不用可删去
      if (this.attributes) {
        if (this.relation) {
          this.attributes[1].forEach(
            x => (that.attrMap["relation_" + x.attributeName] = x)
          );
          this.attributes[2].forEach(
            x => (that.attrMap["left_" + x.attributeName] = x)
          );
          this.attributes[3].forEach(
            x => (that.attrMap["right_" + x.attributeName] = x)
          );
        } else {
          this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
        }
      }
    }
  },
  mounted() {
    if (this.t_preview) {
      // 需要动态设置高度时使用,不用可删去
      this.$nextTick(() => {
        this.setInheritStyle();
      })
      this.initData();
    }

    // if(this.$refs.main.querySelector(".ivu-input")){
    //   this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
    // }
  },
  watch: {
    // 需要设置目标属性时使用,不用可删去
    arg_name(val) {
      if (val in this.attrMap) {
        this.args.targetDataType = this.attrMap[val].valueType;
        if (this.relation) {
          if (val.startsWith("left_"))
            this.args.label =
              (this.relation.leftRole != ""
                ? this.relation.leftRole
                : this.relation.leftClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("right_"))
            this.args.label =
              (this.relation.rightRole != ""
                ? this.relation.rightRole
                : this.relation.rightClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("relation_"))
            this.args.label = this.attrMap[val].displayName;
        } else this.args.label = this.attrMap[val].displayName;
        let name = val;
        if (this.relation) {
          if (name.startsWith("left_")) name = name.substring(5);
          else if (name.startsWith("right_")) name = name.substring(6);
          else if (name.startsWith("relation_")) name = name.substring(9);
        }
        let attr = this.store.state.DWF_form.Attributes[name];
        if (attr && attr.defaultValue) this.value = attr.defaultValue;
      } else this.args.targetDataType = null;
    },
    mainXAlign(val){
      if(this.$refs.main.querySelector(".ivu-input")){
        this.$refs.main.querySelector(".ivu-input").style.textAlign = val;
      }
    },
    'args.txt_bgColor'(val){
      // if(this.args.appointGroup){
          //  this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          // ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
          //   item.style.backgroundColor = val == '' ? 'transparent' : val;
          // }): '';
      // }else{
      //      this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
      //     ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
      //       item.style.backgroundColor = val == '' ? 'transparent' : val;
      //     }): '';
      // }
         this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = val == '' ? 'transparent' : val;
          }): '';
    },
    'args.height'(val) {
      this.setInheritStyle();
    },
    'args.heightType'(val) {
      this.setInheritStyle();
    },
    'args.appointGroup'(val) {
      if(val) this.args.appointUser = false;
      if(this.allGroupsList.length==0) this.loadOrgData();
      else this.refreshData();
    },
    'args.appointUser'(val) {
      if(val) this.args.appointGroup = false;
      if(this.allGroupsUsersList.length==0) this.loadOrgData();
     else this.refreshData();
      if(val) {
        let self = this;
        setTimeout(function() {
          self.setInheritStyle();
        }, 500);
      }
    }

  },
  computed: {
    // disableEdit(){
    //     return
    // },
    // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    // 需要设置目标属性时使用,不用可删去
    arg_name() {
      return this.args.name;
    },
    // 需要设置目标属性时使用,不用可删去
    filter_attributes() {
      return this.attributes
        ? this.relation
          ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
          : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
        : [];
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
        return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
    mainNXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    mainNYAlign() {
      let x = parseInt(this.args.main_align % 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },

    // getAllOrgUsers() {
    //   if (this.args.appointUser) {
    //     return this.groupsUsersList;
    //   }else{
    //     return this.groupsList;
    //   }
    // },
  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
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
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
          item.style.textAlign = 'inherit';
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
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
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').forEach(item => {
            item.style.textAlign = 'inherit';
          }): '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.textAlign = 'inherit';
          }): '';
        this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input') && this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input').length != 0
          ? this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input').forEach(item => {
            item.style.textAlign = 'inherit';
          }): '';
        // if(this.args.appointGroup && this.args.txt_bgColor!="#fff"){
        //   this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
        //   ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
        //     item.style.backgroundColor = this.args.txt_bgColor;
        //   }): '';
        // }else{
        //   this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
        //   ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
        //     item.style.backgroundColor = this.args.txt_bgColor;
        //     item.style.overflow = 'hidden';
        //     item.style.fontSize = 'inherit';
        //   }): '';
        //   this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
        //   ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
        //     item.style.fontSize = 'inherit';
        //     item.style.lineHeight = this.arg_height;
        //     item.style.height = this.arg_height;
        //   })
        //   : '';
        // }
      } catch (e) {

      }
    },
    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
    },

    setDisplayType(type) {
      this.t_preview = type == 0;
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
      if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
      return this;
    },

    getArgs() {
      return this.args;
    },

    getAllow() {
      return null;
    },

    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    refreshData(){
      this.selectedGroups = [];
      this.loadOrgData();
    },
    initData() {
          this.loadOrgData();
    },

    handleGroupList(groups){
      // this.allGroupsList = JSON.parse(JSON.stringify(allGroupsClasses).replace(/name/g, "label"));
      // this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/oid/g, "value"));
      // this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/childrenGroups/g,"children"));
      groups.forEach(group=>{
          // group.label = group.name;
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
          // group.label = group.name;
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



    loadOrgData(){
        if(this.args.appointUser){
          let that = this;
          let param = {rootGroupName:this.args.underGroupName};
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
          if(this.allGroupsList.length==0){
            getAllUserTree().then(res => {
                this.allGroupsList = res.data.data;
                this.handleGroupList( this.allGroupsList);
            });
          }

        } else if(this.args.appointGroup){
          getAllUserTree().then(res => {
             this.allGroupsList = res.data.data;
              this.handleGroupList(this.allGroupsList);
              if(!this.args.underGroupName){
                this.orgUserList = this.allGroupsList;
              }else{
                console.log(this.orgUserList)
                this.orgUserList = this.getUnderGroup(this.allGroupsList).children;
                console.log(this.orgUserList)
              }
              // this.refreshData();
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



    handleSelectGroup(value,selectedData) {
      this.args.selectdUnderGroup = [];
      if(selectedData.length>0){
        for(var i=0;i<selectedData.length;i++){
          this.args.selectdUnderGroup.push(selectedData[i].value);
        }
        this.args.underGroupName =  selectedData[selectedData.length-1].name;
      }else{
        this.args.underGroupName = null;
      }

      console.log("this.args.underGroupName",this.args.underGroupName);
      // this.refreshData();

      if(this.args.appointUser){
        let that = this;
        let param = {rootGroupName:this.args.underGroupName};
        getAllUserGroupTree(param).then(res =>{
          this.allGroupsUsersList = res.data.data;
          this.handleGroupUserList(this.allGroupsUsersList.childrenGroups );
          this.orgUserList = res.data.data.childrenGroups;
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
          this.allGroupsList1 = res.data.data;
          this.handleGroupList(this.allGroupsList1);
          if(!this.args.underGroupName){
            this.orgUserList = this.allGroupsList1;
          }else{
            this.orgUserList = this.getUnderGroup(this.allGroupsList1).children;
          }
          // this.refreshData();
        });
      }
    },

    cascaderFormat(labels, selectedData) {
      const index = labels.length - 1;
      return labels[index];
    },

    handleChange(value,selectedData){
      var index = value.length-1;
      this.value = value[index];
      for(var i=0;i<selectedData.length;i++){
        this.selectedGroups.push(selectedData[i].value);
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
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
