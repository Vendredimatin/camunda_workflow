<template>
    <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
     -->
    <section>
        <div v-show="createType == 'edit'">
        <div style="border-collapse:collapse; width:100%;">
                <div style="display: inline-block;width: calc(100% - 75px)">
                    <Select v-model="value" :transfer="true" :filterable="true" :style="{ 'width': '100%', 'display': 'inline-block'}" clearable>
                      <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <div style="display: inline-block; width: 70px">
                <div>
                    <Button icon="md-add"  size="small"  type="primary" @click="preCreate"
                            style=" margin-left: 3px ;margin-right: 3px;"></Button>
                    <Button icon="md-create" size="small"  type="primary"
                            :disabled="!value"
                            @click="goToCreate('edit')"
                            style="display: inline-block;"></Button>
                </div>
                </div>
        </div>
        </div>
        <div v-show="createType == 'create' || createType == 'check'">
        <div style="border-collapse:collapse; width:100%;">
                <div style="display: inline-block;width: calc(100% - 75px)">
                    <Input v-model="formName" style="width: 100%">
                    </Input>
                </div>
                <div style="display: inline-block; width: 70px">
                <div>
                    <Button v-show="createType == 'create'" icon="md-checkmark"  size="small"  type="success" @click="goToCreate('create')"
                            style="margin-left: 3px ;margin-right: 3px;"></Button>
                    <Button v-show="createType == 'check'" icon="md-refresh"  size="small"  type="primary" @click="backCreate"
                            style="margin-left: 3px ;margin-right: 3px;"></Button>
                    <Button icon="md-close" size="small"  type="warning"
                            @click="backCreate"
                            style="display: inline-block;"></Button>
                </div>
                </div>
        </div>
        </div>
    </section>
</template>

<script>
import { getViews } from "@/api/others";

export default {
    name: name,
    props: ["targetClass", "root", "Message", "defaultFormName", "classType", "currentViewName", "targetFormType"],
    data() {
        return {
            value: '',
            selectList: [],
            formName: '',
            createType: 'edit',
        }
    },
    // 插件挂载顺序为: created -> setDisplayType -> setArgs -> setValue -> mounted
    created() {
        this.$store = this.store;
        if (!this.$Message) this.$Message = this.Message;
        let that = this;
        if (this.targetClass == "") return;
        this.updateViews().then(() => {
            if(that.defaultFormName && that.defaultFormName != '') {
                that.value = that.defaultFormName;
            }
        });
    },
    mounted() {
    },
    watch: {
        targetClass(val) {
            if (val) {
                this.updateViews();
            }
        },
        value(val) {
            this.$emit("on-change", val);
        }
    },
    methods: {
        updateViews() {
            if (this.targetClass == "") return;
            let that = this;
            return getViews(this.targetClass, {needV3Content: false}).then(res => {
              that.selectList = [];
              let forms = res.data.data;
              if(this.currentViewName){
                forms.forEach(x => {
                  if(x.viewName !== this.currentViewName){
                    if (this.targetFormType) {
                      if (x.formType == this.targetFormType){
                        that.selectList.push({
                          label: x.viewName,
                          value: x.viewName
                        })
                      }
                    }
                    else {
                      that.selectList.push({
                        label: x.viewName,
                        value: x.viewName
                      })
                    }
                  }
                })
              }else{
                  forms.forEach(x => {
                    if (this.targetFormType) {
                      if (x.formType == this.targetFormType){
                        that.selectList.push({
                          label: x.viewName,
                          value: x.viewName
                        })
                      }
                    }
                    else {
                      that.selectList.push({
                        label: x.viewName,
                        value: x.viewName
                      })
                    }
                  })
              }
              return res;
            });
        },

        preCreate() {
            this.formName = '';
            this.createType = 'create';
        },

        backCreate() {
            if (this.createType == 'check') this.updateViews().then(() => { this.value = this.formName; });
            this.createType = 'edit';
        },

        goToCreate(flag) {
            // if (!this.root || this.root._formcreate) {
            //   // this.$Message.error("请回建模端编辑表单");
            //   return;
            // }
            if (flag == 'create') {
                var pattern = /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/;
                if (!pattern.test(this.formName)) {
                    this.$Message.error("表单名只能包含英文字母,数字和下划线,开头必须是英文字母,长度不能超过32个字符");
                    return;
                }
                if (this.targetClass == "") {
                    this.$Message.error("请先选择目标类");
                    return;
                }
            }
            let formName = flag == 'create' ? this.formName : this.value;

            let a = document.createElement('a');
            let targetClass = this.targetClass;
            let viewName = formName;
            let cType = '';
            if(this.classType == 'e') {
                cType = 'entity';
            } else if(this.classType == 'r') {
                cType = 'relation';
            } else {
                console.log(cType);
            }
            let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${targetClass}/${viewName}?token=${sessionStorage.getItem('tokenM')}&formType=${this.targetFormType || 'PC'}&&classType=${cType}`;
            a.href = url;
            a.target="_blank";
            a.click();
            // this.root.goToNewFormCreate(flag == 'create', this.targetClass, formName);
            if (flag == 'create') this.createType = 'check';
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
