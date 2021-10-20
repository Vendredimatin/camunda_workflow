<template>
  <section class="bindOperationBar">
    <div style="border-collapse:collapse; width:100%;">
      <!-- <Row>
        <Col span="18">
          <Select v-model="opr_path" filterable clearable @on-change="onChange" @on-open-change="handleSearchOpen" @on-clear="onClear"  ref="select" class="limitSel">
            <Option value="">无</Option>
            <OptionGroup label="基本操作">
              <Option v-for="item in sys_oprs" :key="item.id" :value="item.path">{{ item.displayName }}</Option>
            </OptionGroup>
            <OptionGroup label="全局操作">
              <Option v-for="item in query_oprs" :key="item.oid" :value="item.oid" :label="item.displayName">{{ item.displayName }}</Option>
            </OptionGroup>
            <OptionGroup label="类操作">
              <Option v-for="item in class_oprs" :key="item.oid" :value="item.oid" :label="item.displayName">{{ item.displayName }}</Option>
            </OptionGroup>
          </Select>
        </Col>
        <Col span="6" style="padding-top: 4px;">
          <div>
            <Button icon="md-add"  size="small"  type="primary" @click="onClickCreateQueryOprButton"
                    style="margin-left: 5px"></Button>
            <Button icon="md-create" size="small"  type="primary" :disabled="opr_type != 'query' " @click="onClickEditQueryOprButton"
                    style="margin-left: 5px"></Button>
          </div>
        </Col>
      </Row> -->
      <div style="display: inline-block;width: calc(100% - 56px)">
          <Select v-model="opr_path" filterable clearable @on-change="onChangeSelf" @on-open-change="handleSearchOpen" @on-clear="onClear"  ref="select" class="limitSel">
            <Option value="">无</Option>
            <OptionGroup label="基本操作">
              <Option v-for="item in sys_oprs" :key="item.id" :value="item.path">{{ item.displayName }}</Option>
            </OptionGroup>
            <OptionGroup label="全局操作">
              <Option v-for="item in query_oprs" :key="item.oid" :value="item.oid" :label="item.displayName">{{ item.displayName }}</Option>
              <!--<span>{{ item.displayName }}</span>-->
              <!--<span style="float:right;color:#ccc">{{ item.authority}}</span>-->
            </OptionGroup>
            <OptionGroup label="类操作">
              <Option v-for="item in class_oprs" :key="item.oid" :value="item.oid" :label="item.displayName">{{ item.displayName }}</Option>
              <!--<span>{{ item.displayName }}</span>-->
              <!--<span style="float:right;color:#ccc">{{ item.authority}}</span>-->
<!--              <Option  :key="opr_path" :value="opr_path" :label="">{{  }}</Option>-->
            </OptionGroup>
          </Select>
        </div>
        <div style="display:inline-block;width: 56px">
          <div>
            <Button icon="md-add"  size="small"  type="primary" @click="onClickCreateQueryOprButton"
                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
            <Button icon="md-create" size="small"  type="primary" v-if="opr_type != 'sys'" :disabled="opr_type != 'query' " @click="onClickEditQueryOprButton"
                    style="display: inline-block;"></Button>
            <Button icon="md-create" size="small"  type="primary" v-if="opr_type == 'sys'" :disabled="!sysOprEdit" @click="onClickEditSysOprButton"
                    style="display: inline-block;"></Button>
          </div>
        </div>
      <!--      系统操作增加是否提示信息的功能      -->
      <div  v-if="opr_type === 'sys' && sysOprEdit" style="margin-top: 3px;">
        <div style="float: right; margin-right: 7px">
          <span>提示信息</span><i-switch style="position: relative;top: -2px;left: 4px;" size="small" v-model="opr_showMessage" @on-change="oprShowMessageChange"/>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  /**
   * 使用方法：
   <BindOperationBar :index="event_name"
           :opr_path="args.oprs[event_name].opr_path"
           :opr_type="args.oprs[event_name].opr_type"
           :form_targetclass="itemValue.data.targetClass"
           v-on:on-change="handleChangeEventOfOperationBar"
           style="width:100%"></BindOperationBar>
   *
   *
   * handleChangeEventOfOperationBar事件返回的参数:
   *
   * 如果是快速查询操作：
         {
             index: 传入的自定标识，免去使用闭包的麻烦
             query_opr: 当前快速查询操作的对象
             conf:{     // conf中的内容应当存到json中
                  opr_path: val,       // 操作标识
                  opr_type: "query",   // 操作类型
             }
          }
     如果是系统操作：
          {
                index: 传入的自定标识，免去使用闭包的麻烦
                opr_displayName: 操作显示名，
                conf:{
                  opr_path: val,    // 操作标识
                  opr_type: "sys"   // 操作类型
                }
           }
   * 不过一般来讲不需要区分到底是快速查询操作还是系统操作。
   *
   * 最简单的handleChangeEventOfOperationBar函数示例：
   * handleChangeEventOfOperationBar(event){
   *      this.args.oprs[event.index].opr_path = event.conf.opr_path;
          this.args.oprs[event.index].opr_type = "event.conf.opr_type";
     }
   *
   *
   *
   * 调用操作的方法：
   *  this.invokeOperation(this.args.opr_type, this.args.opr_path);
   */

    import {getEntryOperations} from '@/api/others.js';

    export default {
      name: "BindOperationBar",
      props: {
        index: [String, Number],
        opr_path: String,
        opr_type: String,
        opr_name: String,
        opr_sys_path: String,
        opr_showMessage: {
          type: Boolean,
          default: true,
        },
        form_targetclass: String,
        form_json: Object,
        bindGlobalOpr: Object,
        bindLocalOpr: Object,
        route: Object,
        router: Object,
        root: Object,
        customAction: String,
        customRadio: String,
      },
      data: function(){
        return {
          query_oprs: [],
          class_oprs: [],
          sys_oprs: [
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
            },
            {
              id: 4,
              path: "deleteLeftObj",
              displayName: "删除左对象"
            },
            {
              id: 5,
              path: "deleteRightObj",
              displayName: "删除右对象"
            },
            {
              id: 6,
              path: "createForm",
              displayName: "新增表单"
            },
            {
              id: 7,
              path: "editForm",
              displayName: "编辑表单"
            }
          ]
        }
      },

      created(){
        try {
          if(this.customAction || this.customRadio){
            this.loadQueryOprList();
          }else if(this.bindGlobalOpr && this.bindGlobalOpr){
            //切换到不同类重新刷新localstorage
            if(this.class_oprs.length === 0 || this.class_oprs && this.class_oprs[0] && this.class_oprs[0].moduleName.split('-')[0] !== this.form_targetclass){
              this.loadQueryOprList();
            }
          }else{
            this.loadQueryOprList();
          }
        }catch (e) {
          console.log(`BindOperationBar-create${e}`);
          this.loadQueryOprList();
        }
      },

      mounted(){
      },

      computed: {
        sysOprEdit(){
          return ['save', 'edit', 'delete'].includes(this.opr_path);
        }
      },
      methods: {
        onClickCreateQueryOprButton() {
          this.root.opr_dialog.createBindQuick(this.form_targetclass + "-*", this);
        },

        onClickEditQueryOprButton() {
          this.root.opr_dialog.editBindQuick(this.opr_path, this);
        },

        /**
        *@description编辑系统操作相绑定的用于后处理脚本的操作
        *@params
        *@date 2021/1/5
        *@return
        */
        onClickEditSysOprButton(){
          this.root.opr_dialog.editBindSys(this.opr_sys_path, this.form_targetclass + "-*", this);
        },

        async loadQueryOprList(gOprRes, lOprRes) {

          if(!gOprRes) {
            gOprRes = this.bindGlobalOpr;
          }
          if(!lOprRes) {
            lOprRes = this.bindLocalOpr;
          }
          console.log(gOprRes, lOprRes);
          let that = this;

          let globalOprRes = null;
          if(gOprRes && gOprRes.data.success) {
            globalOprRes = gOprRes;
          } else {
            globalOprRes = await getEntryOperations('Root');
          }

          that.query_oprs = globalOprRes.data.data.queryOprConfigs;
          if(that.form_targetclass){

            let localOprRes = null;
            if(lOprRes && lOprRes.data.success) {
              localOprRes = lOprRes;
            } else {
              localOprRes = await getEntryOperations(that.form_targetclass);
            }
            that.class_oprs = localOprRes.data.data.queryOprConfigs;
          }

          if(this.customAction){
            that.sys_oprs = that.sys_oprs.filter(opr => opr.action === this.customAction);
            that.query_oprs = that.query_oprs.filter(opr => opr.action === this.customAction);
            that.class_oprs = that.class_oprs.filter(opr => opr.action === this.customAction);
          }

          if(this.customRadio){
            let start = '';
            if(this.customRadio === '后端脚本'){
              start = 'serverScript:';
              that.sys_oprs = that.sys_oprs.filter(opr => opr.conditionExpre.startsWith(start));
              that.query_oprs = that.query_oprs.filter(opr => opr.conditionExpre.startsWith(start));
              that.class_oprs = that.class_oprs.filter(opr => opr.conditionExpre.startsWith(start));
            }
          }

        },

        freshOpr(gRes, lRes) {

          this.loadQueryOprList(gRes, lRes);

        },
        reset(){
          this.$refs.select.reset()
        },
        handleSearchOpen(val){
          // val && this.loadQueryOprList();
          if(!val) {
            setTimeout(() => {
              this.$refs.select.$el.querySelector('.ivu-select-input').blur();
            }, 0)
          }
        },
        onClear(){
          this.$refs.select.reset();
          this.$nextTick(() => {
            this.$emit("on-change", {
              index: this.index,
              opr_displayName: "无",
              conf:{
                opr_path: "",
                opr_type: "none"
              }
            }, true);
          })
        },
        async onChange(val, opr){
          console.log(val, opr, this.opr_type)
          let that = this;
          if(typeof val == "undefined" && this.$refs.select.values.length == 0){
            this.$refs.select.reset();
          }
          if(val == "" && !opr){
            // 如果无
            this.$emit("on-change", {
              index: that.index,
              opr_displayName: "无",
              conf:{
                opr_path: "",
                opr_type: "none"
              }
            });
          }else {

            // 处理基本操作
            for (let i = 0; i < this.sys_oprs.length; i++) {
              if (this.sys_oprs[i].path && this.sys_oprs[i].path == val) {
                this.$emit("on-change", {
                  index: that.index,
                  opr_displayName: this.sys_oprs[i].displayName,
                  conf: {
                    opr_path: val,
                    opr_type: "sys"
                  }
                });
                return;
              }
            }

            if(val == undefined && opr != undefined) val = opr.oid
            // 快速查询操作
            for (let n = 0; n < this.query_oprs.length; n++) {
              if (this.query_oprs[n].oid == val) {
                this.$emit("on-change", {
                  index: that.index,
                  query_opr: this.query_oprs[n],
                  conf: {
                    opr_path: val,
                    opr_type: "query",
                    opr_name: this.opr_name
                  }
                });
                return;
              }
            }
            // 类操作
            if(val) {
              let hasOpr = this.class_oprs.findIndex(o => {
                return o.oid == val
              })
              if(hasOpr == -1) {

                let freshClassOpr = await getEntryOperations(this.form_targetclass);
                this.class_oprs = freshClassOpr.data.data.queryOprConfigs;

              }

              for (let m = 0; m < this.class_oprs.length; m++) {
                if (this.class_oprs[m].oid == val) {
                  this.$emit("on-change", {
                    index: that.index,
                    query_opr: this.class_oprs[m],
                    conf: {
                      opr_path: val,
                      opr_type: "query",
                      opr_name: this.opr_name
                    }
                  });
                  return;
                }
              }

            }
            // for (let m = 0; m < this.class_oprs.length; m++) {
            //   if (this.class_oprs[m].oid == val) {
            //     this.$emit("on-change", {
            //       index: that.index,
            //       query_opr: this.class_oprs[m],
            //       conf: {
            //         opr_path: val,
            //         opr_type: "query",
            //         opr_name: this.opr_name
            //       }
            //     });
            //     return;
            //   }
            // }

          }
        },

        /**
        *@description绑定创建的后处理脚本操作
        *@params
        *@date 2021/1/5
        *@return
        */
        onSysBindOprChange(val, opr) {
          if(val){
            //create
            this.$emit("on-change", {
              index: this.index,
              opr_displayName: this.sys_oprs.find(opr => opr.path === this.opr_path).displayName,
              conf: {
                opr_path: this.opr_path,
                opr_type: this.opr_type,
                opr_sys_path: val,
                opr_showMessage: this.opr_showMessage,
              }
            });
          }else{
            //edit
            this.$emit("on-change", {
              index: this.index,
              opr_displayName: this.sys_oprs.find(opr => opr.path === this.opr_path).displayName,
              conf: {
                opr_path: this.opr_path,
                opr_type: this.opr_type,
                opr_sys_path: opr.oid,
                opr_showMessage: this.opr_showMessage,
              }
            });
          }
        },

        /**
        *@description默认操作是否显示提示切换
        *@params
        *@date 2021/1/6
        *@return
        */
        oprShowMessageChange() {
          this.$emit("on-change", {
            index: this.index,
            opr_displayName: this.sys_oprs.find(opr => opr.path === this.opr_path).displayName,
            conf: {
              opr_path: this.opr_path,
              opr_type: this.opr_type,
              opr_sys_path: this.opr_sys_path,
              opr_showMessage: this.opr_showMessage,
            }
          });
        },
        /*
        *@description用于事件选择自身的选择事件，与上面区分
        *@params
        *@date 2021/1/15
        *@return
        */
        async onChangeSelf(val, opr){
          let that = this;
          if(typeof val == "undefined" && this.$refs.select.values.length == 0){
            this.$refs.select.reset();
          }
          if(val == "" && !opr){
            // 如果无
            this.$emit("on-change", {
              index: that.index,
              opr_displayName: "无",
              conf:{
                opr_path: "",
                opr_type: "none"
              }
            }, 'self');
          }else {

            // 处理基本操作
            for (let i = 0; i < this.sys_oprs.length; i++) {
              if (this.sys_oprs[i].path && this.sys_oprs[i].path == val) {
                this.$emit("on-change", {
                  index: that.index,
                  opr_displayName: this.sys_oprs[i].displayName,
                  conf: {
                    opr_path: val,
                    opr_type: "sys"
                  }
                }, 'self');
                return;
              }
            }

            if(val == undefined && opr != undefined) val = opr.oid
            // 快速查询操作
            for (let n = 0; n < this.query_oprs.length; n++) {
              if (this.query_oprs[n].oid == val) {
                this.$emit("on-change", {
                  index: that.index,
                  query_opr: this.query_oprs[n],
                  conf: {
                    opr_path: val,
                    opr_type: "query",
                    opr_name: this.opr_name
                  }
                }, 'self');
                return;
              }
            }
            // 类操作
            if(val) {
              let hasOpr = this.class_oprs.findIndex(o => {
                return o.oid == val
              })
              if(hasOpr == -1) {

                let freshClassOpr = await getEntryOperations(this.form_targetclass);
                this.class_oprs = freshClassOpr.data.data.queryOprConfigs;

              }

              for (let m = 0; m < this.class_oprs.length; m++) {
                if (this.class_oprs[m].oid == val) {
                  this.$emit("on-change", {
                    index: that.index,
                    query_opr: this.class_oprs[m],
                    conf: {
                      opr_path: val,
                      opr_type: "query",
                      opr_name: this.opr_name
                    }
                  }, 'self');
                  return;
                }
              }

            }
          }
        }
      }
    }
</script>
<style>
.limitSel .ivu-select-dropdown{
  width: 100%!important;
  left: 0px!important;
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
  .limitSel span{
        max-width: 155px !important;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
</style>