<template>
    <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'position': 'relative','top':'-2px', 'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <Cascader class="i-input" :data="args.treeList" :transfer="true" :style="{ 'width': '100%', 'color': args.txt_fontColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"></Cascader>
            </span>
        </span>

        <!-- 树型数据编辑弹窗 -->
        <TreeEditModal ref="tree_modal" @transferTree="getTreeList"></TreeEditModal>

        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name"
                :widgetAnnotation="widgetAnnotation"
                ref="editbox"
                v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <p class="margin1">构成</p>
                    <Button class="margin1" type="primary" @click="editTreeData">编辑</Button>
                    <!-- <p class="margin1">回填数据</p>
                    <RadioGroup v-model="args.rerurnData">
                        <Radio label="label"></Radio>
                        <Radio label="id"></Radio>
                    </RadioGroup>
                    <p class="margin1">回填格式</p>
                    <RadioGroup v-model="args.rerurnPath">
                        <Radio label="节点路径"></Radio>
                        <Radio label="所选节点"></Radio>
                    </RadioGroup> -->
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe675;</i>
            </div>
            <div class="form-addin-name">
                点选树
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"
import TreeEditModal from './subcomponent/TreeCommonModal'
const name = "CascaderTree";

export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "edit", "store", "relation", "root"],
    data() {
        return {
	        times: 0,
            name: name,

            args_name: "",

            t_preview: true,
            t_edit: false,


      actEdit: false,
      args: {
                label_fontColor: 'initial',       // 标签文字颜色
                txt_fontColor: 'initial',         // 内容文字颜色
                lfsize: 14,                       // 标签文字大小
                lfsizeType: 'px',                 // 标签文字大小单位
                fsize: 14,                        // 内容文字大小
                fsizeType: 'px',                  // 内容文字大小单位
                label_color: 'initial',
                main_fontColor: 'initial',
                main_color: 'initial',
                name: '',
                label: "",
                title: '点选树',
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,
                cascaderValue: [],
                readonly: false,
                width: 100,
                widthType: '%',
                height: 30,
                heightType: "px",           // 整体高度单位
                hided: false,
                required: false,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                placeholder: "",

                treeList: [],

                events: [],
                eventRange: ["值变化"],
            },

            // 支持的数据类型
            dataTypes: ['String', 'UUID', 'Clob'],

            // 对齐方式,布局插件使用
            alignList: [
                {value: 1, name: "靠左对齐"},
                {value: 4, name: "居中对齐"},
                {value: 7, name: "靠右对齐"},
                {value: 0, name: "左上对齐"},
                {value: 2, name: "左下对齐"},
                {value: 3, name: "顶部对齐"},
                {value: 5, name: "底部对齐"},
                {value: 6, name: "右上对齐"},
                {value: 8, name: "右下对齐"}
            ],

            attrMap: {},

            open: ["1","2"],

            timer: null
        }
    },
    components: {
        EditBox,
        TreeEditModal
    },
    created() {
        if (this.t_preview) {
            let that = this;
            if (this.attributes) {
                if (this.relation) {
                    this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
                    this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
                    this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
                } else {
                    this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
                }
            }
        }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.t_preview) {
          // 字体 ／ 颜色 默认继承
          this.$refs.main.querySelector(".ivu-cascader-rel").style.fontSize = 'inherit';
          this.$refs.main.querySelector(".ivu-input-wrapper").style.fontSize = 'inherit';
          this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
          // this.$refs.main.querySelector(".ivu-cascader-menu-item").style.fontSize = 'inherit';
          this.$refs.main.querySelector(".ivu-cascader-rel").style.color = 'inherit';
          this.$refs.main.querySelector(".ivu-input-wrapper").style.color = 'inherit';
          this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
          this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
          // this.$refs.main.querySelector(".ivu-cascader-menu-item").style.color = 'inherit';
          this.setHeight();
        }
      })

    },
    watch: {
        arg_name(val) {
          if (val in this.attrMap) {
              this.args.targetDataType = this.attrMap[val].valueType;
              if (this.relation) {
                  if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
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
    },
    computed: {
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
        labelWidth() {
            return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        },
        mainWidth() {
            return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
        // 文本内容字体大小
        args_fsize() {
            return this.args.fsize + this.args.fsizeType + ' !important';
        },
        // 标签文本内容字体大小
        args_lfsize() {
            return this.args.lfsize + this.args.lfsizeType + ' !important';
        },
        mainYAlign() {
            let x = this.args.main_align % 3;
            if (x == 0) return "top";
            else if (x == 1) return "middle";
            else return "bottom";
        },
        filter_attributes() {
            return this.attributes ? ( this.relation ?
                [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
        },
    },

    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },

    methods: {

            // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
            setHeight() {
                return;
				// if (!this.$refs.main) return;
				// let that = this;
				// this.timer = setInterval(() => {
				// 	if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
				// 	// 改成你需要的样式
				// 	var dom = that.$refs.main.querySelector(".i-input .ivu-input");
				// 	if (dom) {
				// 		dom.style.height = that.arg_height + "px";
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// 	that.times += 30;
				// 	if (that.times > 60 * 1000) {
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// }, 30);
			},
        setDisplayType(type) {
            if (type == 0) this.t_preview = true;
            else this.t_preview = false;
            return this;
        },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
          if ("label" in args){
            let label = args.label;
            setTimeout(() => {
              this.args.label = label;
            }, 0);
          }
            if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";

            return this;
        },
        getFormName() {
            return this.args.name;
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

        getName() {
            return name;
        },

        getDataType(args) {
            return this.args.dataTypes;
        },

        // 编辑显示弹窗
        editTreeData() {

            let casTree = [];

            if(this.args.treeList.length > 0) {
                this.args.treeList.forEach(val => {
                    let temArr = [];
                    temArr.push(val);
                    casTree.push(temArr);
                })
            }
            this.$refs.tree_modal.editModal(false, casTree);

        },

        // 从子组件获取树数据
        getTreeList(data) {

            this.args.treeList = [];
            data.forEach(val => {
                this.args.treeList.push(val[0]);
            })

        }
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
</style>
