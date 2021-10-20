<template>
    <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
        <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label>
        <Input class="i-input" :readonly="true"
        :style="{'height': args.basic_height * args.height + 'px', 'width': mainWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"/>
        <span v-show="t_edit" ref="edit">
            <EditBox :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args" :attributes="filter_attributes">
                <div slot="attribute">
                </div>
                <div slot="layout">
                    <p class="margin1">占位文本</p>
                    <Input class="margin1" v-model="args.placeholder" style="display: inline-block; width: 100%" />
                </div>
                <div slot="operation">
                </div>
            </EditBox>
            <!-- <h1>样例插件</h1>
            <hr />
            <Row type="flex" align="middle" class="margin1">
                <Col span="6" style="padding: auto">表单项名</Col>
                <Col span="18" style="vertical-align: middle">
                    <Input v-model="args.name" class="margin1" placeholder="自定义输入表单项名" />
                </Col>
            </Row>
            <Collapse :value="open">
                <Panel name="1" class="margin1">
                属性
                <div slot="content" style="padding: 10px">
                    <p class="margin1">绑定属性</p>
                    <Select class="margin1" v-model="args.name">
                        <Option v-for="item in filter_attributes" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                    </Select>
                </div>
                </Panel>
                <Panel name="2" class="margin1">
                样式
                <div slot="content" style="padding: 10px">
                    <p class="margin1">高度</p>
                    <InputNumber class="margin1" :min="1" v-model="args.height" style="display: inline-block; width: 100%" />
                    <p class="margin1" >标签区域对齐方式</p>
                    <Select class="margin1" v-model="args.label_align" filterable>
                        <Option v-for="item in alignList" :key="item.value" :value="item.value">{{ item.name }}</Option>
                    </Select>
                    <p class="margin1">主区域对齐方式</p>
                    <Select class="margin1" v-model="args.main_align" filterable>
                        <Option v-for="item in alignList" :key="item.value" :value="item.value">{{ item.name }}</Option>
                    </Select>
                    <p class="margin1">标签-主区域比例</p>
                    <div class="margin1">
                        <InputNumber :min="1" v-model="args.label_width" /> : <InputNumber :min="1" v-model="args.main_width" />
                    </div>
                </div>
                </Panel> -->
            </Collapse>
        </span>
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe624;</i>
            </div>
            <div class="form-addin-name">
                样例
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"

export default {
    name: name,
    props: ["widgetAnnotation", "editExtendInfo" , "attributes"],
    data() {
        return {
	times: 0,
            name: name,

            t_preview: true,
            t_edit: false,

            args: {
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,
                basic_height: 30,
                label: "",
                name: "",
                height: 1,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                placeholder: "",
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
        EditBox
    },
    created() {
        let that = this;
        if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
    },
    mounted() {
        this.setHeight();
    },
    watch: {
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.label = this.attrMap[val].displayName;
                this.args.targetDataType = this.attrMap[val].valueType;
            }
        }
    },
    computed: {
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height * this.args.basic_height;
        },
        colWidth() {
            return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
        },
        labelWidth() {
            return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        },
        mainWidth() {
            return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
        filter_attributes() {
            return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
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
