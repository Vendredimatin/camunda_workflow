<template>
    <section :addinName="name" :style="{'width': colWidth}" ref="main">
        <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label>
        <Input class="i-input" v-model="value" :readonly="readonly"
        :style="{'height': args.basic_height * args.height + 'px', 'width': mainWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"/>
    </section>
</template>

<script>

const name = "FormDemo";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
    name: name,
    props: [],
    data() {
        return {
	timer: null,
	times: 0,
            name: name,

            t_create: false,
            t_edit: false,
            t_visit: true,

            error: null,

            readonly: true,

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

            value: "",
        }
    },
    created() {
    },
    mounted() {
        this.setHeight();
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
    },
    methods: {
        setError(error) {
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
        },
        validate() {
            if (!this.value) {
                this.setError();
                return false;
            }
            return true;
        },
        getValue() {
            return this.value;
        },  
        setValue(items) {
            var value = null;
            if (typeof items == "object") {
                if (items && items.length > 0) value = items[0][this.args.name];
            } else value = items;
            this.value = value;
            return this;
        },
        setHeight() {
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
            this.t_create = false;
            this.t_edit = false;
            this.t_visit = false;
            if (type == "create") {
                this.t_create = true;
                this.value = "";
                this.readonly = false;
            }
            else if (type == "edit") {
                this.t_edit = true;
                this.readonly = false;
            }
            else if (type == "visit") {
                this.t_visit = true;
                this.readonly = true;
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
            return this;
        },
        getArgs() {
            return this.args;
        },
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