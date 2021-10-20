<template>
    <section v-show="!args.hided" :addinName="name" ref="main" :style="{'width': colWidth}">
      <template v-if="args.structural_layout === 'horizontal'">
        <span style="display: flex" :style="{'width': colWidth, 'align-items': labelNYAlign}">
          <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
          'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
              <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
          </span>
          <span :style="{'width': mainWidth, 'display': 'inline-block', 'color': args.main_fontColor,}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
                <Table class="multiTable" border height="200" :columns="table_columns" :data="table_data"></Table>
                <Upload ref="upload" :action="uploadURL()" :on-success="onUploadSuccess"
                        :headers="tokenHeader"
                        :max-size="maxSize"
                        :on-exceeded-size="onExceededSize"
                        :style="{'text-align': 'right'}">
                  <Button v-if="!t_visit && !noEdit && !args.readonly" ghost icon="ios-cloud-upload-outline" type="success">添加新文件</Button>
                </Upload>
            </span>
          </span>
        </span>
      </template>
      <template v-else>
        <span :style="{'display': args.structural_layout === 'horizontal' ? 'flex' : 'block', 'width': colWidth, 'align-items': labelNYAlign}">
          <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
          'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
              <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
          </span>
          <span :style="{'width': '100%', 'display': 'inline-block', 'color': args.main_fontColor,}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
                <Table class="multiTable" border height="200" :columns="table_columns" :data="table_data"></Table>
                <Upload ref="upload" :action="uploadURL()" :on-success="onUploadSuccess"
                        :headers="tokenHeader"
                        :max-size="maxSize"
                        :on-exceeded-size="onExceededSize"
                        :style="{'text-align': 'right'}">
                  <Button v-if="!t_visit && !noEdit && !args.readonly" ghost icon="ios-cloud-upload-outline" type="success">添加新文件</Button>
                </Upload>
            </span>
          </span>
        </span>
      </template>
        <!-- 必填验证 -->
        <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
          <span v-show="isRequired" class="wrongTips">该项不能为空</span>
          <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
        </span>
        <!-- 图片预览 -->
        <Modal title="图片预览" v-model="viewModal">
            <img :src="`${baseUrl}/files-download/${viewImg.file_id}?downloadName=${viewImg.name}`" style="width: 100%">
            <div slot="footer">
                <Button type="text" @click="viewModal = false">关闭</Button>
            </div>
        </Modal>
    </section>

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import "@/styles/component/iconfont.css";
import global from "@/views/global.vue";
import {deleteFile} from "@/api/others.js";
const name = "MultiFilesList";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
  name: name,
  // 属性值传入:
  //  itemValue: 表单对应的Json结构
  //  attributes: 实体类属性
  //  relations:  关联类,带有属性列表
  //  relation_classes:   被关联的实体类,带有属性列表
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
    ],
  data() {
    return {
      timer: null,
      times: 0,
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,
      noEdit: false,
      isRequired: false,

      // 支持的数据类型
      // dataTypes: ["String", "Integer", "Long", "Date", "TimeStamp"],
      dataTypes: ["String"],
      baseUrl: '',
      value: null,
      viewModal: false,
      viewImg: {
        file_id: '',
        name: ''
      },
      isWrong: false,
      errorMessage: '',
      // 编辑框
      args: {
        label_fontColor: 'initial',       // 标签文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单`
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        id: null,
        confirm: true,
        disabled: false,
        readonly: false,
        required: false,
        multiple: false,
        hided: false,

        label_width: 2,
        main_width: 3,
        label_align: 4,

        label: "",
        name: "",
        targetDataType: "_Date",
        // height: 30,
        // heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
      },

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

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},

      formatList: [
        {
          value: "yyyy-MM-dd",
          name: "年月日"
        },
        {
          value: "yyyy-MM-dd HH:mm:ss",
          name: "年月日时分秒"
        },
        {
          value: "yyyy",
          name: "年"
        },
        {
          value: "yyyy-MM",
          name: "年月"
        },
        {
          value: "HH:mm:ss",
          name: "时分秒",
        },
        {
          value: "HH:mm",
          name: "时分",
        }
      ],

      table_columns: [
        {
          title: '文件名',
          key: 'name',
          // width: 600,
          ellipsis: true,
          tooltip: true,
          // render: (h, params) => {
          //   return h('div', [
          //     h('Icon', {
          //       props: {
          //         type: 'person'
          //       }
          //     }),
          //     h('strong', params.row.name)
          //   ]);
          // }
        },
        {
          title: '大小',
          key: 'size',
          // width: 200
        },
        {
          title: '操作',
          key: 'action',
          // width: 250,
          align: 'center',
          render: (h, params) => {

            let view_button = h('Button', {
              props: {
                type: 'success',
                size: 'small',
                disabled: this.noEdit
              },
              on: {
                click: () => {
                  this.viewImg = params.row;
                  this.viewModal = true;
                }
              }
            }, '预览');

            let download_ele =  h('a', {
              attrs: {
                href: this.noEdit ? 'javascript:;' : global.baseUrl + '/files-download/' + params.row.file_id + '?downloadName=' + params.row.name,
                download: params.row.name
              },
              style: {
                marginRight: '5px',
                pointerEvents: this.noEdit ? 'none' : 'auto'
              }
            }, '下载');

            let delete_button = h('Button', {
              props: {
                type: 'error',
                size: 'small',
                disabled: this.noEdit
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  // deleteFile(params.row.file_id).then();
                  // 从文件列表中删除
                  let newData = [];
                  for(let i=0; i<this.table_data.length; i++){
                    if(this.table_data[i].file_id != params.row.file_id){
                      newData.push(this.table_data[i]);
                    }
                  }
                  this.table_data = newData;
                  if (this.args.required && (this.table_data == null || this.table_data == [] || this.table_data.length == 0)) {
                    this.isRequired = true;
                    this.setError(true);
                  }
                  // TODO: 此处需要调用store更新一下这个字段的值
                }
              }
            }, '删除');

            let action_list = [download_ele];
            let curName = params.row.name;
            if(!this.t_visit) {

              action_list.push(delete_button);

            }
            // 图片类型文件添加查看按钮
            if(curName.indexOf('jpg') != -1 || curName.indexOf('jpeg') != -1 || curName.indexOf('png') != -1 || curName.indexOf('gif') != -1) {
              action_list.push(view_button);
            }
            return h('div', action_list);
          }
        }
      ],
      // name
      // size
      // file_id
      table_data: [],
      tokenHeader:{
        "Authorization": this.store.state.user.token
      },
      maxSize: 50 * 1024  // 50 MB
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

    this.baseUrl = global.baseUrl;
    this.$store = this.store;
    console.log("meow", this.$store.state.DWF_global.appConfig);
    if (this.$store.state.DWF_global.appConfig && this.$store.state.DWF_global.appConfig.maxFileSizeKb) {
      let tmp = parseInt(this.$store.state.DWF_global.appConfig.maxFileSizeKb);
      if (!isNaN(tmp)) this.maxSize = tmp;
    }

    let that = this;
    if (this.attributes) {
        if (this.itemValue.data.isRelation) {
            this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
            this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
            this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
        } else {
            this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
        }
    }
  },
  async mounted() {

    // 编辑权限控制
    let attrMap = this.store.state.DWF_form.AttributesClassMap[this.itemValue.data.targetClass];
    let argsName = this.args.name;

    // 关联类  &&  实体类处理
    if(this.itemValue.data.isRelation) {

      let reInfo = this.Relations(this.itemValue.data.targetClass);

      if(argsName.slice(0,9) == 'relation_') {

        argsName = argsName.slice(9);

      } else if(argsName.slice(0,6) == 'right_') {

        await this.queryEntity(reInfo.rightClass);
        attrMap = this.store.state.DWF_form.AttributesClassMap[reInfo.rightClass];
        argsName = argsName.slice(6);

      } else if(argsName.slice(0,5) == 'left_') {

        await this.queryEntity(reInfo.leftClass);
        attrMap = this.store.state.DWF_form.AttributesClassMap[reInfo.leftClass];
        argsName = argsName.slice(5);

      } else {
        console.log(argsName)
      }

    }

    let attrAccess = attrMap.find(val => {
      return val.attributeName == argsName
    })
    if(attrAccess != undefined && attrAccess.restrictedAccess.indexOf('EditObjects') != -1) {
      this.noEdit = true;
    } else {
      this.noEdit = false;
    }

    // 默认非空时 自动校验
    if(this.value != null) {
      this.validate();
    }

  },
  watch: {
    table_data(val) {
      if(val.length > 0) {
        this.isRequired = false;

        // var dom = this.$refs.main.querySelector(".multiTable");
        // if (dom) {
        //   dom.style.border = 'none';
        // }

      }
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
      "Relations",
      "EntityAttrList",
      "Entities",
      "RightEntities",
      "LeftEntities"
    ]),
    // arg_height() {
    //   return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    // },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
    relWidth() {
      return this.pWidth * 0.6 + 'px';
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
    labelNYAlign(){
      let x = parseInt(this.args.label_align % 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
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
  },
  methods: {
    ...mapActions("DWF_form", [
      "queryEntity"
    ]),
    // 动态监听数据变化
    // onDynamic(value) {
    //   this.setValue(value);
    // },
    getValue() {
      return JSON.stringify(this.table_data);
    },
    setValue(value) {
      if(value != null) {
        try {

          this.table_data = JSON.parse(value);

        } catch(e) {
          this.table_data = [];
        }
      } else {
        this.table_data = [];
      }
      return this;
    },
    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    getAllow() {
      return null;
    },
    getName() {
      return name;
    },
    getArgs() {
      return this.args;
    },
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';
      return this;
    },
    getFormName() {
      return this.args.name;
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
    setError(error, message = '') {
      this.isWrong = error;
      var dom = this.$refs.main.querySelector(".multiTable");
      if (dom) {
        dom.style.borderColor = error ? "red" : null;
        dom.style.borderBottom = error ? "1px solid red" : null;
        dom.style.borderRight = error ? "1px solid red" : null;
      }
      this.errorMessage = error ? message : '';
      return this;
    },

    /**
     * @isRequired : modeler端配置的必填项
     */
    validate() {
      let expResult = true;
      if (this.args.required && (this.table_data == null || this.table_data == [] || this.table_data.length == 0)) {
        this.isRequired = true;
        expResult = false;

      } else {
        console.log(expResult, this.args.rule, this.value);
      }

      this.setError(expResult ? null : true);

      return expResult;
    },

    setIcon(id) {
      this.icon_url = id;
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },

    onUploadSuccess(response, file) {
      let newfile = {
        name: file.name,
        size: file.size / 1000 + "KB",
        file_id: response.data.oid
      };
      // 更新文件列表
      this.table_data.push(newfile);
      this.$refs['upload'].clearFiles();
      this.validate();
    },

    uploadURL() {
      return `${global.baseUrl}/files-upload?libraryId=multi_files&cname=${Math.random()}`
    },
    onExceededSize() {
      this.$Message.error(`文件大小不能超过 ${this.maxSize / 1024} MB`);
    }

  }
};
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
}

.ivu-input {
  height: 30px !important;
}

.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
.ori-color {
  color: initial;
}
</style>
