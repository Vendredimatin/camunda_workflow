<template>
  <Col style="padding: 2px" :class="{'border':chosen}">
    <div class="icon-wrapper" @mouseenter="showOverLayer" @mouseleave="hideOverLayer" @click="changeChosenView">

      <!--右上角按钮 start-->
      <!-- <div class="icon-button" @click="clickMenuControl" v-if="hasClickMenu">
        <Icon type="ios-more" size="24"></Icon>
      </div> -->
      <!--右上角按钮 end-->

      <!--右上角弹出菜单 start-->
      <!-- <transition name="click-menu" v-if="hasClickMenu">
        <div class="icon-click-menu" v-show="clickMenuShow" :style="{'right': (index+1) % 12 == 0 ? '72px' : '-72px'}">
          <a @click="clipboardOpen(className,title)">分享</a><br>

          <a @click="confirmDeleteView(className,title,targetId)">删除</a>

          <br>
        </div>
      </transition> -->
      <!--右上角弹出菜单 end-->


      <!--hover时显示 start-->
      <transition name="icon-over-layer" v-if="hasHover">
        <div class="icon-over-layer" v-show="overLayerShow">
          <div style="position: absolute;bottom: 16px;width: 100%;text-align: center">
            <Button
              size="small"
              style="margin-right: 10px;"
              @click="confirmDeleteView(className,title,targetId)">删除
            </Button>
            <Button
              size="small"
              style="margin-right: 10px;"
              @click="clipboardOpen(className, title, formType, classType)">分享
            </Button>
            <Button
              size="small"
              type="primary"
              @click="goToFormCreate('update',className,targetId,title, displayName, note, formType, classType)">编辑
            </Button>
          </div>
        </div>
      </transition>
      <!--hover时显示 end-->


      <!--图标和标题 start-->
      <!-- <div style="text-align: center;margin-top: 20px;height: 100px">
        <div style="width: 40px;height: 50px;display: inline-block;text-align: center"><img :src="imgUrl"
                                                                                            :draggable="false"
                                                                                            style="width: 40px">
        </div>
        <div style="height: 40px;display: flex;justify-content: center;align-items:center">
          <transition name="icon-over-layer">

            <div v-show="!overLayerShow" v-if="hasHover"
                 style="font-size: 12px;width: 100%;word-wrap:break-word;padding: 0 10px">
              {{title}}
            </div>
            <div v-else style="font-size: 12px;word-wrap:break-word;width: 100%;padding: 0 10px">{{title}}</div>
          </transition>
        </div>
      </div> -->
      <Row>
        <Col span="6" style="text-align: center;height: 84px;line-height: 84px;">
            <i v-show="formType == 'PC'" class="iconfont" style="font-size: 36px;">&#xe6cd;</i>
            <i v-show="formType == 'Mobile'" class="iconfont" style="font-size: 50px;">&#xe6cb;</i>
        </Col>
        <!-- <Col span="6" style="text-align: center;">
            <img v-if="formType == 'PC'" :src="imgUrl" :draggable="false" style="width: 40px;margin-top:30%;">
            <img v-else :src="imgUrl" :draggable="false" style="width: 40px;margin-top:10%;">
        </Col> -->
        <Col span="18">
          <p class="nowrap-text">
            <span class="innerLabel">英文名:</span>
            <span class="innerText">{{ title }}</span>
          </p>
          <p class="nowrap-text">
            <span class="innerLabel">中文名:</span>
            <span class="innerText">{{ displayName }}</span>
          </p>
          <!-- <p class="nowrap-text">
            <span class="innerLabel">创建人:</span>
            <span class="innerText">{{ creator }}</span>
          </p>
          <p class="nowrap-text">
            <span class="innerLabel">创建时间:</span>
            <span class="innerText">{{ createTime }}</span>
          </p>
          <p class="nowrap-text">
            <span class="innerLabel">更新人:</span>
            <span class="innerText">{{ lastModifier }}</span>
          </p> -->
          <p class="nowrap-text">
            <span class="innerLabel">更新时间:</span>
            <span class="innerText">{{ lastModifyTime }}</span>
          </p>
          <p class="nowrap-text">
            <span class="innerLabel">备注:</span>
            <span class="innerText">{{ note }}</span>
          </p>
        </Col>
      </Row>
      <!--图标和标题 end-->
    </div>
  </Col>
</template>
<script>
  import "@/styles/component/iconfont.css";
  import {deleteView} from "@/api/others.js"

  export default {
    name: "iconInnerWrapper",
    data() {
      return {
        overLayerShow: false,
        clickMenuShow: false
      }
    },

    props: {
      targetId: String, //对象id
      className: String,
      formType: String,
      displayName:String,
      createTime: String,
      lastModifyTime: String,
      note: String,
      classType: String,
      hasClickMenu: {type: Boolean, default: true},  //是否有对应的表单
      hasHover: {type: Boolean, default: true},  //是否有对应的表单
      title: String,
      span: Number,
      jsonCode:String,
      chosen: {type: Boolean, default: false},
      index: Number,
    },
    mounted() {
      console.log(this.formType)
    },
    methods: {

      tobeContinue() {
        confirm("等待其他页面完成后调用")
      },

      goToFormCreate(operation, className, formOid, formName, displayName, note, formType, classType) {
        console.log(className, formOid, formName, displayName, note, formType, classType)
        // this.$emit("goToFormCreate", operation == "create", className, formName, displayName, note);
        let a = document.createElement('a');
        let targetClass = className;
        let viewName = formName;
        let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}&formType=${formType}&classType=${classType}`;
        a.href = url;
        a.target="_blank";
        a.click();
      },

      confirmDeleteView(className, viewName, viewId) {
        this.$emit('deleteView', {className, viewName, viewId});
      },
      // 端口设置
      portFormat() {
        let APPPort = '8080'
        let ModelerPort = '8081'
        let portM = Config.ModelerPort ? Config.ModelerPort : ModelerPort;
        let portA= Config.APPPort ? Config.APPPort : APPPort;
        let host = Config.host.replace(portM, portA)
        return host
      },
      clipboardOpen(className,formName, formType, classType) {
        let proto = window.location.protocol;
        let host = this.portFormat();
        let url = '';
        if(formType == 'PC') {
          url = `${proto}//${host}/${Config.baseAppRouteName}/forms/${className}/${formName}?displayType=create&token=${this.$store.state.user.token}&formType=${formType}&classType=${classType}`;
        } else {
          url = `${proto}//${host}/${Config.baseMobileRouteName}/forms/${className}/${formName}?displayType=create&token=${this.$store.state.user.token}&formType=${formType}&classType=${classType}`;
        }
        this.$emit('clipboardModal', url);
      },

      handlePreviewModal(className,formName) {
        let proto = window.location.protocol;
        let host = this.portFormat();
        let params = {initScript: " ", _obj: {}};
        params = JSON.stringify(params);
        let url = `${proto}//${host}/${Config.baseAppRouteName}/forms/${className}/${formName}?displayType=create&token=${this.$store.state.user.token}&paramsStr=${params}`;
        this.$emit('handlePreviewModal', url);
        return false;
      },
      changeChosenView() {
        this.$emit('changeChosenView', this.targetId, this.title, this.displayName, this.note, this.formType);
      },
      showOverLayer() {

        this.overLayerShow = true;
      },
      hideOverLayer() {

        this.overLayerShow = false;
        /*鼠标离开时应该关闭侧面菜单*/
        this.clickMenuShow = false;

      }, clickMenuControl() {
        this.clickMenuShow = !this.clickMenuShow;

      }
    }
  }
</script>

<style scoped>
  .icon-wrapper {
    height: 100%;
    position: relative;
    padding: 8px;
  }

  .border {
    border: 2px solid #2d8cf0;
    border-radius: 4px;
  }

  .icon-over-layer {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);

  }

  .icon-button {
    position: absolute;
    top: 0;
    right: 10px;
    z-index: 3;
    width: 15px;
    height: 20px;
    cursor: pointer;

  }

  .icon-click-menu {
    z-index: 4;
    position: absolute;
    right: -72px;
    top: 0;
    width: 72px;
    height: 90px;
    padding: 12px;

    font-size: 14px;
    background: #FFF;
    line-height: 20px;

    border-bottom: 1px solid #DDD;
    border-right: 1px solid #DDD;
    border-top: 1px solid #DDD;
    /*
        box-shadow: darkgrey 1px 0 1px 1px;
        border-radius: 2px;
    */

  }

  .icon-click-menu > a {
    text-decoration: none;
    color: #333;
    font-weight: 400;
  }

  .icon-button:after {
    content: '';
    clear: both;
  }

  .icon-over-layer-enter-active, .icon-over-layer-leave-active {
    transition: all .5s ease;
  }

  .icon-over-layer-enter, .icon-over-layer-leave-to {
    /*
        transform: translateY(-134px);
    */
    opacity: 0;
  }

  .click-menu-enter-active, .click-menu-leave-active {
    transition: all .4s ease-out;
  }

  .click-menu-leave {
    z-index: -1;
  }

  .click-menu-enter, .click-menu-leave-to {
    transform: translateX(-60px);
    opacity: 0;
  }

  .innerLabel {
    color: #666;
    font-size: 12px;
    margin-right: 5px;
  }

  .innerText {
    font-size: 12px;
    color: #333;
  }

  .nowrap-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 0 !important;
  }

</style>
