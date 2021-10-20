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
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
         <!--
            插件前端实现区域
         -->
        <span :style="{'position': 'relative','top':'-2px', 'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign}">
            <span :style="{'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <div style="border-collapse:collapse; width:100%;">
                    <div style="display: inline-block;width: calc(100% - 75px)">
                        <Select v-model="value" class="i-input" :transfer="true" :filterable="true" :style="{ 'width': '100%', 'display': 'inline-block', 'background-color': args.txt_bgColor, 'color': args.txt_fontColor, 'font-size': args_fsize, 'text-align': mainXAlign, 'vertical-align': mainYAlign}" clearable>
                            <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </div>
                    <div style="display: inline-block;width: 70px;text-align: right;">
                        <div>
                            <Button icon="md-add"  size="small"  type="primary"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                            <Button icon="md-create" size="small"  type="primary"
                                    :disabled="value == ''"
                                    style="display: inline-block;"></Button>
                        </div>
                    </div>
                </div>
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
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
              :itemValue="itemValue"
              :attributes="filter_attributes"
              :router="router"
              :route="route"
              :root="root"
              :dataTypes="dataTypes"
              :query_oprs="query_oprs"
              :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
                     -->
                    <p class="margin1">目标类</p>
                    <Select class="margin1 form-select" filterable clearable v-model="args.targetClass">
                        <OptionGroup label="实体类">
                        <Option v-for="item in entitiesList" :value="item.className" :key="item.className" :label="item.displayName">
                            <span>{{ item.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ item.className }}</span>
                        </Option>
                        </OptionGroup>
                        <OptionGroup label="关联类">
                        <Option v-for="item in relationsList" :value="item.className" :key="item.className" :label="item.displayName">
                            <span>{{ item.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ item.className }}</span>
                        </Option>
                        </OptionGroup>
                        <!-- <OptionGroup label="资源类">
                        <Option v-for="item in resourcesList" :value="item.value" :key="item.value" :label="item.label">
                            <span>{{ item.label }}</span>
                            <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                        </Option>
                        </OptionGroup> -->
                    </Select>
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
                <i class="iconfont">&#xe6c7;</i>
            </div>
            <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
            <!-- <div class="form-addin-name">
                表单点选器
            </div> -->
            <!-- 设置插件的中文名,名字长度大于3时使用 -->

                <Tooltip class="form-addin-name" content="表单点选器" style="width: 100%;" :transfer="true">表单模型</Tooltip>

        </span>
    </section>
</template>

<script>
import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import {mapGetters} from "vuex";
import { getAllEntities, getAllRelations, getViews } from "@/api/others";
// 设置插件英文名, 该name需要与插件文件名一致
const name = "FormSelect";

export default {
    name: name,
    /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要设置目标属性时需要attributes
     需要设置事件时需要query_oprs, route, router, root, Message
     需要用到store时需要store
     */
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
    data() {
        return {

	        times: 0,
            name: name,

            t_preview: true,
            t_edit: false,

            // 属性配置项,按需设置

      actEdit: false,
      args: {
                height: 30,
                heightType: 'px',
                lfsize: 14,                       // 标签文字大小
                lfsizeType: 'px',                 // 标签文字大小单位
                width: 100,
                widthType: '%',
                dynamic: false,

                targetClass: "",            // 目标类

                name: "",                   // 目标属性
                label: "",                  // 标签名称
                id: "",                     // 控件代号,一般为必须
                label_align: 4,             // 标签区域对齐方式,0-8,默认为4居中对齐
                label_fontColor: "initial", // 标签字体颜色
                label_color: "initial",     // 标签背景颜色
                main_align: 4,              // 主区域对齐方式,默认为4居中对齐
                main_fontColor: "initial",  // 主区域字体颜色
                main_color: "initial",      // 主区域背景颜色
                fsize: 14,                  // 内容文字大小
                fsizeType: 'px',            // 内容文字大小单位
                txt_fontColor: "initial",   // 内容字体颜色
                label_width: 2,
                main_width: 3,              // 标签与主区域的占比为 label_width : main_width
                required: false,            // 是否必填
                hided: false,               // 是否隐藏
                readonly: false,            // 是否只读

                // 以下为不在属性编辑框中设置,但默认要有的配置项
                title: "表单模型",          // 插件中文名,需要填入默认值
                //basic_height: 30,           // 基础高度,会从全局继承
                col: true,                  // 是否不占满全部
                cols: 3,                    // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
                targetDataType: null,       // 目标数据类型
                events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
                eventRange: ['值变化'],      // 支持的事件列表,元素为事件中文名
            },

            // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
            dataTypes: ['String', 'Clob'],

            // 需要设置目标属性时使用
            attrMap: {},

            open: ["1","2"],

            // 需要动态设置高度时使用
            timer: null,

            value: '',
            selectList: [],
            entitiesList: [],
            relationsList: [],
        }
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
          this.$store = this.store;
            let that = this;
            if (this.itemValue) {
                // 需要设置目标属性时使用,不用可删去
                if (this.attributes) {
                    if (this.relation) {
                        this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
                        this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
                        this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
                    } else {
                        this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
                    }
                }
                this.args.targetClass = this.args.targetClass ? this.args.targetClass : this.itemValue.data.targetClass;

                this.entitiesList = [];
                this.relationsList = [];

                let allEn = this.Entities();
                let allRe = this.Relations();

                if(allEn && allEn.length > 0) {

                  allEn.forEach((val) => {
                    let eachItem = {
                      className: val.className,
                      displayName: val.displayName
                    };
                    this.entitiesList.push(eachItem);
                  });

                } else {
                  this.getErrorIDBEn();
                }

                if(allRe && allRe.length > 0) {

                  allRe.forEach((val) => {
                    let eachItem = {
                      className: val.className,
                      displayName: val.displayName
                    };
                    this.relationsList.push(eachItem);
                  });

                } else {
                  this.getErrorIDBRe();
                }

            }
        }
    },
    mounted() {
        this.$nextTick(() => {
          if (this.t_preview) {
            // 需要动态设置高度时使用,不用可删去
            this.setHeight();
            this.$refs.main.querySelector(".ivu-select .ivu-select-input").style.backgroundColor = 'inherit';
            this.$refs.main.querySelector(".ivu-select .ivu-select-input").style.color = 'inherit';
            this.$refs.main.querySelector(".ivu-select .ivu-select-input").style.fontSize = 'inherit';
            this.$refs.main.querySelector(".ivu-select .ivu-select-input").style.textAlign = 'inherit';
            this.setInheritStyle();
          }
        })
    },
    watch: {
        // 需要设置目标属性时使用,不用可删去
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
        arg_class(val) {
            if (val) {
                getViews(val, {needV3Content: false}).then(res => {
                    this.selectList = [];
                    let forms = res.data.data;
                    forms.forEach(x => {
                        this.selectList.push({
                            label: val + "  --  " + x.viewName,
                            value: x.viewName,
                        })
                    })
                });
            }
        },
      arg_height(val) {
        this.setHeight();
        this.setInheritStyle();
      },
    },
    computed: {
        ...mapGetters("DWF_form", ["Entities", "Relations"]),
        arg_class() { return this.args.targetClass; },
        // 需要设置目标属性时使用,不用可删去
        arg_name() {
            return this.args.name;
        },
        // 需要设置目标属性时使用,不用可删去
        filter_attributes() {
            return this.attributes ? ( this.relation ?
                [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
        },
        args_fsize() {
          return this.args.fsize + this.args.fsizeType + '!important';
        },
        // 标签文本内容字体大小
        args_lfsize() {
            return this.args.lfsize + this.args.lfsizeType + ' !important';
        },
        args_fcolor() {
          return this.args.txt_fontColor;
        },
        arg_height() {
            return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
            //return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },
    methods: {
      setInheritStyle() {
        try {
          this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
            ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = this.args.txt_bgColor;
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
              item.style.lineHeight = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close') && this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.top = this.args.height < 2 && this.args.heightType == 'px' ? "4px" : (this.args.height - 30) / 2 + (30 - this.args.fsize) / 4 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = '#c5c8ce';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
              item.style.backgroundColor = this.args.txt_bgColor;
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
        } catch (e) {

        }
      },
      // IDB连接打开失败 api拉取数据
      getErrorIDBEn() {

        this.entitiesList = [];
        let promiseE = new Promise((resolve, reject) => {
          getAllEntities({needOperationCount: false})
          .then(response => {
            let res = response.data;
            resolve(res);

            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  className: val.className,
                  displayName: val.displayName
                };
                this.entitiesList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });
        })

      },

      getErrorIDBRe() {

        this.relationsList = [];
        // 关联类
        let promiseRe = new Promise((resolve, reject) => {
          getAllRelations()
          .then(response => {
            let res = response.data;
            resolve(res);

            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 关联类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  className: val.className,
                  displayName: val.displayName
                };
                this.relationsList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });

        })

      },

        // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
        setHeight() {
            return;
            // if (!this.$refs.main) return;
            // let that = this;
            // this.timer = setInterval(() => {
            //     if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            //     // 改成你需要的样式
            //     var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            //     if (dom) {
            //         dom.style.height = that.arg_height + "px";
            //         clearInterval(that.timer);
            //         that.timer = null;
            //     }
            //     that.times += 30;
            //     if (that.times > 60 * 1000) {
            //         clearInterval(that.timer);
            //         that.timer = null;
            //     }
            // }, 30);
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
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>
<style>
.form-select .ivu-select-dropdown {
  width: 100% !important;
}
</style>
