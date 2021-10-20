<template>
    <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth, 'height': arg_height}" ref="main">
        <div class="self-tree" :style="{'width': '100%', 'height': '100%', 'background': '#fff', 'padding': '10px', 'overflow': 'auto'}">
            <Tree v-for="item in args.treeList" :data="item" :render="renderWithButton"></Tree>
        </div>
    </section>
</template>

<script>

const name = "TreeSelect";
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
                label: "",
                name: "",
                width: 100,
                widthType: '%',
                height: 300,
                heightType: "px",
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                hided: false,

                treeList: []
            },

            treeRowWrap: {
                display: 'inline-block',
                width: 'calc(100% - 20px)',
                padding: '4px 0',
                borderBottom: '1px solid #ddd',
                lineHeight: '32px'
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
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
            // return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
        },
    },
    methods: {
        onDynamic(value) {
            this.setValue(value);
        },
        // 自定义树结构
        renderWithButton(h, {root, node, data}) {
            return <div class="self-treeWrap" style={[this.treeRowWrap]}>
                <icon type={data.iconName} style="margin-right:8px;"/>
                <span class="self-treeNode">{data.label}</span>
            </div>;
        },
        setError(error) {
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
        },
        // validate() {
        //     if (!this.value) {
        //         this.setError();
        //         return false;
        //     }
        //     return true;
        // },
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
            }
            else if (type == "edit") {
                this.t_edit = true;
            }
            else if (type == "visit") {
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

.ivu-tree-children li span+div {
    display: inline-block;
}
</style>