<template>
  <!-- 附件 -->
  <section :addinName="name" ref="main"  :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <div class="plugin-boarder" v-show="!args.hided">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{width : '100%', 'background-color': args.label_color, 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>

        <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}" class="ori-attach self-attach">
            <div v-if="file_exists"
                 :style="{'position': 'relative', 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
              <div :style="{'display': 'block', 'position': 'relative'}"
                   @mouseover="overImg = true" @mouseleave="overImg = false"
              >

                <!--<img v-if="args.type == 'image'"-->
                <!--:class="{'width-100': arg_height === 'initial'}"-->
                <!--:src="fileUrl" @mouseover="overImg = true" @mouseleave="overImg = false"-->
                <!--:style="{'height': arg_height, 'width': this.args.type == 'image' && this.args.picture.resize == 'scale' ? 'auto' : colWidth}" />-->

                <div v-if="args.type == 'image'"
                     :style="{'height':arg_height, 'width': colWidth}"
                >
                  <div
                          :style="{'width':'100%', 'min-height': '30px', 'height':'100%',
                    'background-image': 'url('+ fileUrl + ')',
                    'background-repeat': 'no-repeat',
                    'background-size': imageBackgroundSize,
                    'background-position': mainXAlign
                    }"
                  ></div>
                </div>

                <a v-if="args.type == 'file'" :href="fileUrl"
                   :style="{'line-height': arg_height, 'display': 'block', 'word-break': 'break-all'}"
                > {{ value }} </a>
                <video v-if="args.type == 'video'" controls="controls" :src="fileUrl"
                       :style="{'height': arg_height}">
                </video>
                <!-- <video v-if="args.type == 'video'" muted controls="controls" autoplay loop :src="fileUrl"
                       :style="{'height': arg_height}">
                </video> -->
                <!-- <video v-if="args.type == 'video'" muted controls autoplay src="https://vd4.bdstatic.com/mda-jmck6x841rj595wk/sc/mda-jmck6x841rj595wk.mp4?playlist=%5B%22hd%22%2C%22sc%22%5D&amp;auth_key=1603180344-0-0-d732316c2b854ba03317a6edb6ea6298&amp;bcevod_channel=searchbox_feed&amp;pd=1&amp;pt=3&amp;abtest=8790_3" :style="{'height': arg_height}">
                </video> -->
                <audio v-if="args.type == 'audio' && reloaddom" controls="controls" :src="fileUrl"
                       :style="{'height': arg_height, 'width': '100%'}">
                </audio>
                <Icon   v-if="showDelButton"
                        @mouseover.native="overDelButton = true" @mouseleave.native="overDelButton = false"
                        @click.native="confirmDel"
                        type="md-close-circle" color="red"
                        :style="{'font-size' : '30px !important' , 'z-index' : '100', 'position': 'absolute',
                        'left': '0', 'top': '0', 'display' : 'block'}"></Icon>
              </div>
            </div>
            <div v-else-if="!t_visit && !args.readonly"
                 :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
              <!-- create状态下，String类型显示文本框 -->
              <Input v-if="args.targetDataType == 'String' || args.targetDataType == 'Clob'" :style="{'line-height':arg_height, 'display': 'inline'}" v-model="value"/>
              <!-- <Input v-else-if="t_create && args.targetDataType == 'Clob'" :style="{'line-height':arg_height, 'display': 'inline'}" v-model="value"/> -->
              <!-- 如果允许上传显示上传控件 -->
              <Upload v-else :before-upload="beforeUpload" :on-success="onUploadSuccess"
                      :on-error="onUploadError"
                      :accept="upload_dialog_accept_type"
                      :format="selfFileFormat"
                      :on-format-error="handleFormatError"
                      :show-upload-list="false"
                      :headers="uploadHeaders"
                      :style="{'line-height':arg_height, 'display': 'inline'}" :action="uploadUrl">
                  <Button icon="ios-cloud-upload-outline" >上传</Button>
              </Upload>
            </div>
            <div v-else-if="args.readonly"
                 :style="{'line-height':arg_height, 'height': arg_height, 'width': mainWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
                <Button icon="ios-cloud-upload-outline" style="cursor: not-allowed">上传</Button>
            </div>
            <span v-else
                  :style="{'line-height': arg_height, 'width': mainWidth, 'text-align': mainXAlign, 'display': 'inline-block', 'vertical-align': mainYAlign}">暂无</span>

          </span>
      </span>
      </div>
    </template>
    <template v-else>
      <div class="plugin-boarder" v-show="!args.hided">
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{width : '100%', 'background-color': args.label_color, 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>

        <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}" class="ori-attach self-attach">
            <div v-if="file_exists"
                 :style="{'position': 'relative', 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
              <div :style="{'display': 'block', 'position': 'relative'}"
                   @mouseover="overImg = true" @mouseleave="overImg = false"
              >

                <!--<img v-if="args.type == 'image'"-->
                <!--:class="{'width-100': arg_height === 'initial'}"-->
                <!--:src="fileUrl" @mouseover="overImg = true" @mouseleave="overImg = false"-->
                <!--:style="{'height': arg_height, 'width': this.args.type == 'image' && this.args.picture.resize == 'scale' ? 'auto' : colWidth}" />-->

                <div v-if="args.type == 'image'"
                     :style="{'height':arg_height, 'width': colWidth}"
                >
                  <div
                          :style="{'width':'100%', 'min-height': '30px', 'height':'100%',
                    'background-image': 'url('+ fileUrl + ')',
                    'background-repeat': 'no-repeat',
                    'background-size': imageBackgroundSize,
                    'background-position': mainXAlign
                    }"
                  ></div>
                </div>

                <a v-if="args.type == 'file'" :href="fileUrl"
                   :style="{'line-height': arg_height, 'display': 'block'}"
                > {{ value }} </a>
                <video v-if="args.type == 'video'" controls="controls" :src="fileUrl"
                       :style="{'height': arg_height}">
                </video>
                <audio v-if="args.type == 'audio' && reloaddom" controls="controls" :src="fileUrl"
                       :style="{'height': arg_height, 'width': '100%'}">
                </audio>
                <Icon   v-if="showDelButton"
                        @mouseover.native="overDelButton = true" @mouseleave.native="overDelButton = false"
                        @click.native="confirmDel"
                        type="md-close-circle" color="red"
                        :style="{'font-size' : '30px !important' , 'z-index' : '100', 'position': 'absolute',
                        'left': '0', 'top': '0', 'display' : 'block'}"></Icon>
              </div>
            </div>
            <div v-else-if="!t_visit && !args.readonly"
                 :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
              <Input v-if="args.targetDataType == 'String' || args.targetDataType == 'Clob'" :style="{'line-height':arg_height, 'display': 'inline'}"  v-model="value"/>
              <!-- 如果允许上传显示上传控件 -->
              <Upload v-else :before-upload="beforeUpload" :on-success="onUploadSuccess"
                      :accept="upload_dialog_accept_type"
                      :format="selfFileFormat"
                      :on-format-error="handleFormatError"
                      :show-upload-list="false"
                      :headers="uploadHeaders"
                      :style="{'line-height':arg_height, 'display': 'inline'}" :action="uploadUrl">
                  <Button icon="ios-cloud-upload-outline" >上传</Button>
              </Upload>
            </div>
            <div v-else-if="args.readonly"
                 :style="{'line-height':arg_height, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
                <Button icon="ios-cloud-upload-outline" style="cursor: not-allowed">上传</Button>
            </div>
            <span v-else
                  :style="{'line-height': arg_height, 'width': mainWidth, 'text-align': mainXAlign, 'display': 'inline-block', 'vertical-align': mainYAlign}">暂无</span>

          </span>
      </span>
      </div>
    </template>
    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
              <span v-show="isRequired" class="wrongTips">该项不能为空</span>
              <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
          </span>
  </section>
</template>

<script>
  import { mapGetters } from 'vuex';
  import "@/styles/component/iconfont.css";
  import {delObjAttr} from "@/api/others.js";
  import AuthRules from "@/api/auth-model/AuthRules";
  import global from "@/views/global.vue";
  import { uuid } from '@/util/assist'

  const name = "Attachments";
  export default {
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
    },
    name: name,
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
        timer: null,
        times: 0,
        // 插件名
        name: name,
        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        isWrong: false,
        isRequired: false,
        displayType: '',
        transUrl: null,

        args: {
          title: '附件',
          id: null,
          size: "default",
          readonly: false,
          disabled: false,
          hided: false,
          value: "",
          style: "",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          label_fontColor: "initial", // 标签字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          width: 100,
          widthType: '%',
          // 属性插件所需属性
          label: "",
          name: "",
          targetDataType: null,
          height: 120,                 // 整体高度
          heightType: "px",
          allowType: '',
          sourceHost: '',

          // 自定义
          type: "file",
          EditObjects: false,
          CommonOpAuth: false,
        },

        // 支持的数据类型
        dataTypes: ['LocalFile'],

        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        // 属性map
        attrMap: {},
        file_exists: false,
        uploadUrl: null,
        randomValue: 0,
        thisObj: null,
        overImg: false,
        overDelButton: false,
        uploadHeaders: {
          Authorization: sessionStorage.getItem('token')
        },
        fileUrl: "",
        value: null,

        stash_id: null,

        delModel: false,
        attributeName: '',
        className: '',
        oid: '',
        prefix: '',
        hasEditAuth: true,
        hasDeleteAuth: true,
        errorMessage: '',
        reloaddom: true,

        vChange: null,
        init: true,
      };
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
    // 生命周期函数，在dom元素生成之后调用
    async mounted() {
      this.$store = this.store;
      try {
        let res = await AuthRules.getAllRulesById(this.store.state.user.userId);
        let auths = res.data.data.filter(item => item.className === this.itemValue.data.targetClass && item.attrName === '') || [];
        if(auths.length !== 0){
          for(let auth of auths){
            this.hasEditAuth = ['EditObjects'].indexOf(auth.authority) === -1 || (['EditObjects'].indexOf(auth.authority) !== -1 && auth.conditionId === "AlwaysTrue");
            this.hasDeleteAuth = ['DeleteObj'].indexOf(auth.authority) === -1 || (['DeleteObj'].indexOf(auth.authority) !== -1 && auth.conditionId === "AlwaysTrue");
          }
        }
      }catch (e) {
        console.log('权限问题')
      }
      // 事件处理
        if(this.args.events && this.args.events.length > 0) {

          this.vChange = this.args.events.find((val) => {
            return val.name == '值变化'
          })

        }

      this.setHeight();
        this.initUrl();
        this.init = false;
    },

    watch: {},
    computed: {
      ...mapGetters("DWF_form", [
        "Relations",
      ]),
      selfFileFormat() {
        if(this.args.type == 'video'){
          if(this.args.allowType == '' || !this.args.allowType){
            this.args.allowType = ['mp4','webm','ogg','ogv','mkv'];
            return ['mp4','webm','ogg','ogv','mkv'];
          }else{
            return this.args.allowType.split(',');
          }
        }else if(this.args.type == 'image'){
          if(this.args.allowType == '' || !this.args.allowType){
            this.args.allowType = ['jpg','jpeg','gif','png','bmp'];
            return ['jpg','jpeg','gif','png','bmp'];
          }else{
            return this.args.allowType.split(',');
          }
        }else if(this.args.type == 'audio'){
          if(this.args.allowType == '' || !this.args.allowType){
            this.args.allowType = ['mp3','wav','ogg'];
            return ['mp3','wav','ogg'];
          }else{
            return this.args.allowType.split(',');
          }
        }else{
          return this.args.allowType == '' || !this.args.allowType ? [] : this.args.allowType.split(',');
        }
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_height() {
        if (this.args.type == 'audio') {
          return this.args.height == 0 ? '30px' : this.args.height + this.args.heightType;
        } else {
          return this.args.height == 0 ? 'initial' : this.args.height + this.args.heightType;
        }
      },
      args_label_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
      // end

      showDelButton() {
        // 添加条件：edit args.targetDataType == 'String'不允许删除
        let targetDataType = this.args.targetDataType
        return (targetDataType !== 'String') && (targetDataType !== 'Clob') && !this.t_visit && !this.args.readonly && (this.overImg || this.overDelButton);
      },
      upload_dialog_accept_type() {
        switch (this.args.type) {
          case "file" :
            return "*/*";
          case "image" :
            return ".jpg,.jpeg,.gif,.png,.bmp";
          case "video" :
            return ".mp4,.webm,.ogg,.ogv,.mkv";
          case "audio" :
            return ".mp3,.wav,.ogg";
        }
      },
      imageBackgroundSize() {
        if (this.args.type === 'image' && this.args.picture && this.args.picture.resize == 'fill') return "100% 100%";
        if (this.args.type === 'image' && this.args.picture && this.args.picture.resize == 'scale') return "contain";
      }
    },
    methods: {
      initUrl(){
        this.thisObj = this.itemValue.data.origin;
        console.log(this.thisObj)
        if(this.itemValue.data.isRelation){
          this.attributeName = this.args.name.replace(/relation_/, "").replace(/left_/, "").replace(/right_/, "");
        }else{
          this.attributeName = this.args.name;
        }
        if(this.args.CommonOpAuth){

        }else{


          if(this.itemValue.data.isRelation){
            if(/left_/.test(this.args.name)){
              this.prefix = 'left_';
              this.className = this.Relations(this.itemValue.data.targetClass).leftClass || this.getObj(this.itemValue.data)['relation_leftClass'];
            }else if (/right_/.test(this.args.name)){
              this.prefix = 'right_';
              this.className = this.Relations(this.itemValue.data.targetClass).rightClass || this.getObj(this.itemValue.data)['relation_rightClass'];
            }else{
              this.prefix = 'relation_';
              this.className = this.itemValue.data.targetClass;
            }
          }else{
            this.className = this.itemValue.data.targetClass;
          }
          this.oid = this.thisObj && this.thisObj.oid ? this.thisObj.oid : this.thisObj && this.thisObj[`${this.prefix}oid`] ? this.thisObj[`${this.prefix}oid`] : '';
          if (this.args.targetDataType == 'String') {

            this.fileUrl = this.value;
            if(this.fileUrl && this.fileUrl.indexOf('http') == -1) {
              this.fileUrl = `${this.args.sourceHost}${this.fileUrl}`;
            }

          } else {

            this.fileUrl = `${global.baseObjOther}/omf/classes/${this.className}/objects/${this.oid}/attributes/${this.attributeName}/bytes?attachment=true&r=${Math.random()}`;

            if(this.args.type != 'image') {
              this.transUrl = '当前附件格式非图片'
            }
            let targetUrl = this.fileUrl;
            var image = new Image();
            image.src = targetUrl + '?v=' + Math.random();
            image.crossOrigin = "*";
            let self = this;
            var callback = function ()
            {
              let transUrl;
              var canvas = document.createElement("canvas");
              canvas.width = image.width;
              canvas.height = image.height;
              var ctx = canvas.getContext("2d");
              ctx.drawImage(image, 0, 0, image.width, image.height);
              self.transUrl = canvas.toDataURL("image/png");
              return self.transUrl;
            }
            image.onload = callback;
            image.onload();

          }
        }
        setTimeout(() => {
          this.args.type === 'audio' ? this.displayType = 'block' : this.displayType = 'inline';
        }, 0);
      },
      reloadDom(){
        this.reloaddom = false;
        setTimeout(() => {
          this.$nextTick(() => {
            this.reloaddom = true;
          })
        },300)
      },
      setHeight() {
        return;
      },
      getValue() {
        if(this.t_create){
          if(this.args.targetDataType == 'String' || this.args.targetDataType == 'Clob'){
            return this.value;
          }else{
            return this.stash_id;
          }

        }else{
          return this.value;
        }
      },
      setValue(value) {
        //后台没有做附件权限判断
        if(this.args.CommonOpAuth){
          this.fileUrl = '';
          this.file_exists = false;
          this.value = '';
        }else{
          this.value = value;
          this.file_exists = value && value != "";
          // this.file_exists = (value && value != "" && (this.t_visit || this.args.targetDataType !== 'String' && this.args.targetDataType !== 'Clob'));
        }
        !value ? this.stash_id = null : '';
        if(!this.init){
          //脚本或者其他非表单初始化情况setValue重新获取url
          this.$nextTick(() => {
            this.initUrl();
          })
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
        delete this.args['txt_bgColor'];
        delete this.args['txt_fontColor'];
        delete this.args['fsize'];
        delete this.args['dynamic'];
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
        else if (type == "visit" || type == 'list') {
          this.t_visit = true;
        }
        return this;
      },
      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      handleFormatError (file) {
        this.$Message.error(`上传文件格式只能为${JSON.stringify(this.args.allowType).replace(/\[|\]|\"/g, '')}`);
      },

      /**
       * @description 将图片文件转为Base64
      */
      getBase64() {

        let resultUrl = this.transUrl;

        return resultUrl;

      },

      getDataType(args) {
        return this.dataTypes;
      },
      beforeUpload(file) {
        if(this.args.readonly || !this.hasEditAuth){
          return false;
        }
        // if(/^gif$/.test(file.name.substring(file.name.lastIndexOf('.') + 1))){
        //   this.$Message.error("附件不支持gif格式");
        //   return false;
        // }
        // 需在此处修改好上传的路径
        if(this.itemValue.data.isRelation){
          if(this.t_create){
            this.oid = "stash" + uuid();
            this.stash_id = this.oid;
          }else {
            // oid = this.getObj(this.itemValue.data)[`${this.prefix}oid`] ? this.getObj(this.itemValue.data)[`${this.prefix}oid`] : '';
          }
        }else{
          if(this.t_create){
            this.oid = "stash" + uuid();
            this.stash_id = this.oid;
          }else {
            // oid = this.getObj(this.itemValue.data).oid
          }
        }
        this.uploadUrl = `${global.baseObjOther}/omf/classes/${this.className}/objects/${this.oid}/attributes/${this.attributeName}/bytes-update`;
        let promise = new Promise((resolve) => {
          this.$nextTick(function () {
            resolve(true);
          });
        });
        return promise;
      },
      onUploadSuccess(response, file) {
        if(!response.success){
          this.$Message.error(response.message || '上传失败');
          return ;
        }
        this.overDelButton = false;
        this.overImg = false;
        this.file_exists = true;
        this.value = file.name;
        this.isRequired = false;
        if(this.t_create){
          this.fileUrl = `${global.baseObjOther}/omf/classes/${this.className}/objects/${this.stash_id}/attributes/${this.attributeName}/bytes?attachment=true&r=${Math.random()}`;
        }else{
          // let oid = this.thisObj && this.thisObj.oid ? this.thisObj.oid : this.thisObj && this.thisObj[`${this.prefix}oid`] ? this.thisObj[`${this.prefix}oid`] : '';
          this.fileUrl = `${global.baseObjOther}/omf/classes/${this.className}/objects/${this.oid}/attributes/${this.attributeName}/bytes?attachment=true&r=${Math.random()}`;
        }

        if(this.vChange) {
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store, null, this.itemValue.data.origin);
        }
      },

      onUploadError(response, file){
      },

      refreshImg() {
        this.randomValue = Math.random();
      },
      confirmDel(){
        if(this.args.readonly || !this.hasDeleteAuth){
          return false;
        }
        this.$Modal.confirm({
          title: "删除确认",
          content: "<p>是否确认删除</p>",
          okText: "确认",
          cancelText: "取消",
          onOk: () => {
            this.delFile();
          },
          onCancel: () => {

          }
        });
      },
      delFile() {
        if(this.t_create){
          this.value = null;
          this.stash_id = null;
          this.file_exists = false;
          this.$Message.info("删除成功");
        }else {
          console.log(this.className, this.oid, this.attributeName)
          delObjAttr(this.className, this.oid, this.attributeName)
          .then(res => {
            this.value = null;
            this.stash_id = null;
            this.file_exists = false;
            this.$Message.info(
              "删除成功"
            );
          })
          .catch(error => {
            this.$Message.error(
              "删除图片失败：" + error.response.data.message
            );
          });
        }
        if (this.args.required) {
          this.isRequired = true;
        }
      },

      setError(error, message = '') {
        this.isWrong = !!error;
        // this.border = error ? '1px solid red' : null;
        this.errorMessage = error ? message : '';
        return this;
      },

      validate() {
        let expResult = true;

        if (this.args.required && (!this.value || this.value == '')) {

          this.isWrong = false;
          this.isRequired = true;
          expResult = false;

        }

        this.setError(expResult ? null : true);

        this.isWrong = !expResult;
        return expResult;
      },

      // 外部脚本更新图片类型附件file值
      freshData(url) {
        this.fileUrl = url ? url : `${global.baseObjOther}/omf/classes/${this.className}/objects/${this.oid}/attributes/${this.attributeName}/bytes?attachment=true&r=${Math.random()}`;
      }

    }
  };
</script>

<style scoped>
  section {
    display: inline-block;
    width: 100%;
    vertical-align: top;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }

  p {
    margin: 10px 0;
  }
  .ori-color {
    color: initial;
  }

  .ori-attach {
    background-color: '#fff';
  }
  .width-100{
    width: 100%;
  }
  .img_div {
    position: relative;
  }
</style>
