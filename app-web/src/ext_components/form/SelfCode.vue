<template>
    <!--
        应用前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
     -->
    <section v-show="!args.hided" :addinName="name" :style="{'width': arg_width}" ref="main">
        <!--
            插件前端实现区域
         -->
        <span :style="{'height': args.basic_height * args.height + 'px', 'width': '100%', 'display': 'inline-block',
            'color': args.main_fontColor}">
            <span class="self-group" :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
            <div ref="resultDiv" class="result-wrap" :style="{'height': arg_height}">
                <iframe ref="iframe" width="100%" height="100%" :src="args_url" style="border: none;"></iframe>
            </div>
            </span>
        </span>
    </section>
</template>

<script>

import { addListener } from '@/util/webSocket';
import { uuid } from '@/util/assist';

// 设置插件英文名, 该name需要与插件文件名一致
const name = "SelfCode";

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

            // 属性配置项,按需设置
            args: {
                hided: false
            },

            // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
            dataTypes: ['String', 'UUID', 'Clob'],

            // 需要设置目标属性时使用
            attrMap: {},

            open: ["1","2"],

            // 需要动态设置高度时使用
            timer: null,
            times: 0,

            // 一般插件的实际值用this.value存储
            value: "",
        }
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
        let that = this;
        window.getAddinById = function(id) { return that.GetAddinById(that.itemValue.data, id); }
        window.store = this.store;
        window.addListener = addListener;
        window.dwf_ctx = this.dwf_ctx;
        // 需要动态设置高度时使用,不用可删去
        this.setHeight();
    },
    computed: {
        // 需要设置目标属性时使用,不用可删去
        arg_width() {
            return this.args.width + this.args.widthType;
        },
        arg_height() {
            return 'heightType' in this.args ? this.args.height + this.args.heightType : this.args._height + "px";
        },
        arg_min() {
            return "40px";
        },
        arg_editing() {
            return this.args.editing;
        },
      args_url(){
          if(this.args.url.indexOf('://') != -1){
            return `${this.args.url}?v=${uuid()}`;
          }else{
            return `${Config.tomcatUrl}${this.args.url}?v=${uuid()}`;
          }
      }
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },
    methods: {

        // 设置异常状态显示
        setError(error) {
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
            return this;
        },

        // 设置校验逻辑,返回true/false
        validate() {
            let expResult = true;

            if (this.args.required && this.value == null) expResult = false;
            else if (this.value != null && this.args.rule) expResult = new RegExp(this.args.rule).test(this.value);

            this.setError(expResult ? null : true);

            return expResult;
        },

        // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
        getValue() {
            return this.value;
        },

        /*
            设置插件对应的值,
            items目前为对应值
            items将为目标对象列表
            特殊情况下需要进行格式转化再赋值
        */
        setValue(items) {
            var value = null;
            if (items == null) {
                // 初始化操作
                value = "defaultValue" in this.args ? this.args.defaultValue : null;
            } else if (typeof items == "object") {
                if (items && items.length > 0) value = items[0][this.args.name];
            } else value = items;
            this.value = value;
            return this;
        },

        // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
        setHeight() {
            if (!this.$refs.main) return;
            let that = this;
            if (this.timer == null) {
                this.timer = setInterval(() => {
                    if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
                    // 改成你需要的样式
                    var dom = that.$refs.main.querySelector(".i-input .ivu-input");
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

        getAllow() {
            return null;
        },

        getEditBox() {
            this.t_edit = true;
            return this.$refs.edit;
        },

        run() {
            this.freshData();
        },

      freshData(){
        if (this.$refs.iframe && this.$refs.iframe.contentWindow && this.$refs.iframe.contentWindow.location) {
          try {
            this.$refs.iframe.contentWindow.location.reload();
          } catch (e) {
          }
        }
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
