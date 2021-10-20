<template>
    <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
        <span v-if="args.required || args.label" :style="{ 'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
                <Cascader class="i-input self-color" :data="args.treeList" :transfer="true" :disabled="args.readonly || t_visit" v-model="casData" @on-clear="handleClear" clearable @on-change="changeTips" :style="{ 'width': '100%', 'color': args_fcolor, 'font-size': args_fsize, 'display': 'inline-block',
                 'text-align': mainXAlign, 'vertical-align': mainYAlign}"></Cascader>
            </span>
        </span>
        </div>
        <span v-show="isRequired || isWrong" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
            <span v-show="isRequired" class="wrongTips">该项不能为空</span>
            <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
        </span>
    </section>
</template>

<script>

const name = "CascaderTree";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
    name: name,
    props: ['itemValue', 'store'],
    data() {
        return {
            timer: null,
            times: 0,
            name: name,

            t_create: false,
            t_edit: false,
            t_visit: false,

            error: null,

            readonly: true,
            isWrong: false,
            isRequired: false,
            errorMessage: '',
            displayType:'',

            args: {
                label_fontColor: 'initial',       // 标签文字颜色
                txt_fontColor: 'initial',         // 内容文字颜色
                lfsize: 14,                       // 标签文字大小
                lfsizeType: 'px',                 // 标签文字大小单位
                fsize: 14,                        // 内容文字大小
                fsizeType: 'px',                  // 内容文字大小单位
                hided: false,
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,
                width: 100,
                widthType: '%',
                height: 30,
                heightType: "px",           // 整体高度单位
                label: "",
                name: "",
                height: 1,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,

                treeList: []
            },

            casData: [],

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

            vChange: null
        }
    },
    created() {
    },
    mounted() {
        // 字体 ／ 颜色 默认继承
      this.$nextTick(() => {
        this.$refs.main.querySelector(".ivu-cascader-rel").style.color = 'inherit';
        this.$refs.main.querySelector(".ivu-input-wrapper").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';

        this.$refs.main.querySelector(".ivu-cascader-rel").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-input-wrapper").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';

        this.setHeight();
      })

      this.vChange = this.args.events.find((val) => {
            return val.name == '值变化'
        })
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
        // 文本内容字体大小
        args_fsize() {
            return this.args.fsize + this.args.fsizeType + ' !important';
        },
        args_fcolor() {
            return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
        },
        // 标签文本内容字体大小
        args_lfsize() {
            return this.args.lfsize + this.args.lfsizeType + ' !important';
        },
        args_lfcolor() {
            return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
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
        setError(error, mes) {

            this.isWrong = error;
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
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

            if (this.args.required && (this.casData == [] || this.casData == "")) {
                this.isRequired = true;
                expResult = false;
            } else {
               this.isRequired = false;
            }

            this.setError(expResult ? false : true);

            return expResult;
        },
        changeTips(value) {

            // IViewd 的坑 v-model绑定的值不是最新的 需要手动再复制一次
            this.casData = value;
            // 脚本触发的错误状态 改变不取消
            if(this.errorMessage == '') {
                this.validate();
            }
            if(this.vChange) {
                this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
        },
        getValue() {
            let temValue = '';
            if(this.casData.length > 0) {
                if(this.casData.length == 1) {

                    temValue = this.casData[0];

                } else {

                    let _str = '';
                        this.casData.forEach(val => {
                        _str = _str + val + ','
                    })

                    if(_str.length > 0) {
                        _str = _str.substring(0, _str.length - 1);
                    }

                    temValue = _str;

                }
            }
            console.log(temValue);
            return temValue;
        },

        setValue(value) {
            console.log('setValue', value)
            if (value == null) this.value = "defaultValue" in this.args ? this.args.defaultValue : null;
            else if(value.length && value.length > 0) {

                this.casData = value.split(',');

            } else {

                this.casData = [];
            }

            console.log(this.args.treeList, this.casData);

            if(this.displayType != 'create') {

                if(this.casData.length > 0) {

                    if(this.args.treeList.length == 0) {
                        this.casData = []
                    } else {

                        // 拉平treeList
                        let self = this;
                        function flat(arr){
                            return [].concat(...arr.map(item => [].concat(item, ...flat(item.children))));
                        }
                        let flatList = flat(self.args.treeList);

                        // 判断当前value是否为有效值
                        let totalEffect = true;
                        this.casData.forEach(e => {

                            let effectIndex = flatList.findIndex(val => {
                                return val.value == e
                            })
                            if(effectIndex == -1) {
                                totalEffect = false;
                            }

                        })
                        if(!totalEffect) {
                            this.casData = []
                        }

                    }

                }

            } else {
                if (value == null) this.casData = []
            }

            return this;
        },
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
            console.log('setArgs', this.args.treeList, this.value, this.casData)
            return this;
        },
        getArgs() {
            return this.args;
        },

        getAll() {
            return this.args.treeList;
        },

      handleClear(){
        if (this.args.required) {
          this.isRequired = true;
        }
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
