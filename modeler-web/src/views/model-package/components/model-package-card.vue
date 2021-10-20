<template>
  <div style="margin:5px;vertical-align:top;display:inline-block;">
    <Card :id="getCardId()" style="vertical-align:top; width:100%;height:100%; margin-left: 2%;margin-top:5px;display:inline-block;">
      <div  style="vertical-align: top;width:18%; margin-right:1%; display:inline-block;">
         <Icon :type="headerObjJson.ModelPackageIcon" size="36"/>
         <div>
           <span :style="{'background-color':release_span_color}">
              <label  :style="{'font-size': '12px' , 'color':'#FFFFFF'}">{{headerObjJson.released ? "已释放":"未释放"}}</label>
           </span>
          </div>
      </div>
      <div  style="width:75%; margin-right:1%; display:inline-block;">
        <div style="width:100%;" >
        <Tooltip :content="headerObjJson.ModelPackageName" max-width="400" placement="bottom">
            <div ><strong><p style="margin-left:5px;width:200px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size:16px;">{{ headerObjJson.ModelPackageName}}</p></strong></div>
        </Tooltip>
        </div>

        <Tooltip :content="headerObjJson.ModelPackageDescription" max-width="400" placement="bottom">
          <div style="margin-left:5px;width:220px;;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size:12px;">{{((headerObjJson.ModelPackageDescription === null) || (headerObjJson.ModelPackageDescription === ""))  ? "暂无简介" : headerObjJson.ModelPackageDescription }}</div>
        </Tooltip>

       <div style="margin-left:5px;margin-top:5px;overflow:hidden;font-size:14px;">创建时间：{{toFormatTime("" + headerObjJson.Start)}}</div>
       <div style="margin-left:5px;margin-top:5px;overflow:hidden;font-size:14px;">上传时间：{{toFormatTime("" + headerObjJson.xTime)}}</div>
       <div style="margin-left:5px;margin-top:5px;overflow:hidden;font-size:14px;">释放时间：{{toFormatTime("" + headerObjJson.xxTime)}}</div>
       <div style="margin-left:5px;margin-top:5px;overflow:hidden;font-size:14px;">版本信息：{{headerObjJson.Version}}</div>
       <div style="margin-top:5px; margin-right:10px; overflow:hidden;">
         <Dropdown @on-click="onClickModelPackageMoreDropdownItemButton" style="float:right;">
             <Button  id="cardMore" size="small">
                 更多
                 <Icon type="ios-arrow-down"></Icon>
             </Button>
             <DropdownMenu slot="list">
                 <DropdownItem id="downlowadModelPackage" name="downloadModelPackage">下载</DropdownItem>
                 <DropdownItem id="releaseModelPackage" name="releaseModelPackage" :disabled="headerObjJson.released || headerObjJson.xTime===null || headerObjJson.xTime.length <= 0">释放</DropdownItem>
                 <!--DropdownItem name="rollbackModelPackage" disabled>回滚</DropdownItem-->                 <!--DropdownItem name="rollbackModelPackage" disabled>回滚</DropdownItem-->
               <DropdownItem id="deleteModelPackage" name="deleteModelPackage">删除</DropdownItem>
             </DropdownMenu>
         </Dropdown>
         <Button id="ModelPackageCardDetials" style="float:right; margin-right:4px;" size="small" @click = "onClickToLookAtModelPackageDetailInfoButton">详细信息</Button>
         <Button  v-if="headerObjJson.released && headerObjJson.packageMetaVersion && (headerObjJson.releaseStatus == 'FullSuccess')" style="float:right; margin-right:4px;color:#19be6b;" size="small" @click = "confirmDownloadReleaseLog"><Icon type="md-checkmark-circle" />日志</Button>
         <Button  v-else-if="headerObjJson.released && headerObjJson.packageMetaVersion && (headerObjJson.releaseStatus == 'PartSuccess')" style="float:right; margin-right:4px;color:#ff9900;" size="small" @click = "confirmDownloadReleaseLog"><Icon type="ios-alert" />日志</Button>
         <Button  v-else-if="headerObjJson.released && headerObjJson.packageMetaVersion " style="float:right; margin-right:4px;" size="small" @click = "confirmDownloadReleaseLog">日志</Button>

       </div>
      </div>
    </Card>

    <Modal id="ModelPackageDetialsWindow" v-model="modelPackageDetailInfoForCustomerBoolean" width="1200" title="详细信息" :mask-closable="!modelPackageDetailInfoForCustomerBoolean" :closable="!modelPackageDetailInfoForCustomerBoolean">
      <div style="vertical-align:top; width:100%;margin-top:5px;display:inline-block;">
        <div  style="vertical-align: top;width:9%; margin-right:10px; display:inline-block;">
           <Icon style="margin-left:25px;"  type="ios-archive" size="48"/>
           <div style="margin-left:25px;">
              <span :style="{'background-color':release_span_color}">
                <label  :style="{'font-size': '16px' , 'color':'#FFFFFF'}">{{headerObjJson.released ? "已释放":"未释放"}}</label>
              </span>
           </div>
        </div>
        <div  style="width:88%; margin-right:1%; display:inline-block;">
          <div >
            <Tooltip :content="headerObjJson.ModelPackageName" max-width="1000" placement="bottom">
              <div> <strong > <p style="width:1000px;margin-top:5px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size:16px;">{{headerObjJson.ModelPackageName }}</p></strong></div>
            </Tooltip>
          </div>

          <Tooltip :content=" headerObjJson.ModelPackageDescription " max-width="1000" placement="bottom">
          <div style="width:1000px;margin-top:20px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size:12px;">{{((headerObjJson.ModelPackageDescription === null) || (headerObjJson.ModelPackageDescription === "")) ? "暂无简介" : headerObjJson.ModelPackageDescription }}</div>
        </Tooltip>
        <Row style="margin-top:15px;">
          <Col span="6" style="margin-top:5px;overflow:hidden;font-size:14px;display:inline-block;">创建时间：{{toFormatTime("" + headerObjJson.Start)}}</Col>
          <Col span="6" style="margin-top:5px;overflow:hidden;font-size:14px;display:inline-block;">上传时间：{{toFormatTime("" + headerObjJson.xTime)}}</Col>
          <Col span="6" style="margin-top:5px;overflow:hidden;font-size:14px;display:inline-block;">释放时间：{{toFormatTime("" + headerObjJson.xxTime)}}</Col>
          <Col span="6" style="margin-top:5px;overflow:hidden;font-size:14px;display:inline-block;">版本信息：{{headerObjJson.Version}}</Col>
         </Row>
         <div style="margin-top:5px;">
           <Button id="showModalPackageScript" style="float:right;" size="small" @click="showScriptModalBoolean = true">查看脚本</Button>
         </div>
        </div>
      </div>
      <div>
        <Row style="margin-left:8%;height: 400px; overflow-x:hidden;">
          <Tree id="modelPackageDetailTree" :data="modelPackageDetailData"></Tree>
        </Row>
      </div>
      <div slot="footer">
        <Button id="closeModelPackageDetials" @click="modelPackageDetailInfoForCustomerBoolean = false">关闭</Button>
      </div>
    </Modal>

    <Modal v-model="showScriptModalBoolean" :mask-closable="!showScriptModalBoolean" title="脚本" width="1200" >
          <Input id="editModelPackageScript" v-model="modelPackageInitScript" disabled  type="textarea" :rows="26" placeholder="请输入..." />
    </Modal>

    <Modal v-model="releaseModelPackageSpinBoolean" width="1200" title="释放模型包" :mask-closable="!releaseModelPackageSpinBoolean" :closable="!releaseModelPackageSpinBoolean">
      <div style="height: 50px;">

      </div>
      <div slot="footer">
      </div>
      <Spin style="font-size:24px" fix v-if="releaseModelPackageSpinBoolean">
            <Icon type="ios-loading" size='large' class="demo-spin-icon-load"></Icon>
            <br>
            <p>{{releaseingText}}</p>
      </Spin>
    </Modal>

    <Modal
      v-model="toOverrideDup"
      width="1200" title="部分功能出现冲突未能正确释放，请手工确认是否覆盖当前环境模型。选中内容点击确定后会执行覆盖更新！"
      :mask-closable="!toOverrideDup"
      :closable="!toOverrideDup"
      @on-ok="doOverride"
      @on-cancel="cancelOverride"
    >
      <div style="height: 10px;">

      </div>
<!--      <div slot="footer">-->
<!--      </div>-->
      <Table
        border
        max-height="360"
        ref="selection"
        :columns="columns4"
        :data="dupInfoData"
      ></Table>
      <div style="margin-top:5px;">
        <Button  @click="handleSelectAll(true)">全选</Button>
        <Button style="margin-left:5px;" @click="handleSelectAll(false)">取消全选</Button>
      </div>
    </Modal>
</div>
</template>

<script>
  import {conflictDetectionAndRelease, getInitScriptAndModelPackageTree, downloadModelPackage, downloadReleaseLog} from "@/api/modelpackage.js"
  import "@/styles/component/iconfont.css";
  import moduleIconData from "./moduleIcon.js";
  import fontIconData from "./iFontIcon.js";
  import global_ from "@/views/global.vue"
  var CardId=-1;

    export default {
        name: "ModelPackageCard",
        props:[
          "isThisModelPackageMine",
          "headerObjJson",
        ],
        data () {
          return {
            releaseingText:"正在释放模型包，请耐心等待...",
            modelPackageDetailInfoForCustomerBoolean:false,
            modelPackageDetailData:[],
            modelPackageInitScript:"",
            showScriptModalBoolean:false,
            iconList:[],
            iList:[],
            releaseModelPackageSpinBoolean:false,
            releaseModelPackageCommandListenerUID:"",

            toOverrideDup:false,
            columns4: [
              {
                type: 'selection',
                width: 60,
                align: 'center'
              },

              {
                title: '重复内容',
                key: 'selfKey'
              },
              {
                title: '所属类别',
                key: 'selfType'
              },
              // {
              //   title: '冲突对象的key值',
              //   key: 'dupObjKey'
              // },
              // {
              //   title: '所属类别',
              //   key: 'dupObjType'
              // }
            ],
            dupInfoData: [
            ]
          }
        },
        created(){
          this.iconList = moduleIconData;
          this.iList = fontIconData;
          this.dupInfoData = []
        },
        mounted(){
        },
        beforeDestroy(){
        },
        methods: {

          getCardId(){
            CardId+=1;
            return "modelPackageCard"+CardId;
          },

          onClickToLookAtModelPackageDetailInfoButton(){
              this.modelPackageDetailInfoForCustomerBoolean = true;
              if(this.modelPackageInitScript === "" ||  this.modelPackageDetailData === []){
                let formData = new FormData();
                formData.append("UUID", this.headerObjJson.UUID);
                getInitScriptAndModelPackageTree(formData).then(res=>{
                    let ret = JSON.parse(res.data.data)
                    this.modelPackageDetailData = JSON.parse(ret.ModelPackageTree)
                    this.modelPackageInitScript = ret.InitScript
                }).catch(err => {
                  console.error(err);
                })
              }
          },

          onClickModelPackageMoreDropdownItemButton(optName){
            if( optName === "downloadModelPackage"){
              downloadModelPackage(this.headerObjJson.UUID, this.headerObjJson.ModelPackageName)
            }else if(optName === "releaseModelPackage"){
              if(this.headerObjJson.released === true){
                this.$Message.error("该模型包已被释放过")
                return;
              }
              if(this.headerObjJson.xTime.length <= 0){
                this.$Message.error("模型包不允许在本地释放")
                return;
              }
              this.$Modal.confirm({
                title: "释放模型包",
                    content: '<p>确定要释放模型包？</p>',
                    onOk: () => {
                      // let formData = new FormData();
                      // formData.append("UUID", this.headerObjJson.UUID)
                      // formData.append("tomcatUrl", global_.tomcatUrl)
                      // formData.append("baseUrl", global_.baseUrl)
                      // formData.append("baseObjOther", global_.baseObjOther)
                      let releaseParam = {}
                      releaseParam.uuid = this.headerObjJson.UUID;
                      releaseParam.tomcatUrl = global_.tomcatUrl
                      releaseParam.baseUrl = global_.baseUrl
                      releaseParam.baseObjOther = global_.baseObjOther
                      releaseParam.overrideInfo = []
                      this.releaseingText = "正在释放模型包，请耐心等待..."
                      this.releaseModelPackageSpinBoolean=true;

                      conflictDetectionAndRelease(releaseParam).then(res=>{
                        this.dupInfoData = res.data.data
                        if(this.dupInfoData && this.dupInfoData.length > 0) {
                          this.toOverrideDup = true
                        } else {
                          this.$Message.success("释放成功")
                          this.$emit("globalRefreshCardList")
                        }
                      }).catch((err)=> {
                        console.error(err);
                      }).finally(() => {
                        this.releaseModelPackageSpinBoolean=false;
                      })
                    },
                    onCancel: () => {
                    }
              })

            }else if(optName === "rollbackModelPackage"){
              this.toOverrideDup = true
            }else if(optName === "deleteModelPackage"){
               this.$Modal.confirm({
                    title: "删除模型包",
                    content: '<p>确定要删除模型包？</p>',
                    onOk: () => {
                        this.$emit('destroyThisModelPackageCard',this.headerObjJson.UUID);
                    },
                    onCancel: () => {
                    }
                });
            }

          },
          toFormatTime(val){
            if("" + val === ""){
              return ""
            }
            let time = new Date(val)
            let str = time.getFullYear() + "/" + ((time.getMonth()+1) < 10 ? "0"+(time.getMonth()+1) : (time.getMonth()+1)) + "/" + (time.getDate() < 10 ? "0"+time.getDate() : time.getDate()) +" " + (time.getHours() < 10 ? "0" + time.getHours() : time.getHours()) + ":" + (time.getMinutes() < 10 ? "0"+time.getMinutes() : time.getMinutes()) + ":" + (time.getSeconds() < 10 ? "0"+time.getSeconds() : time.getSeconds());
            return str.search("NaN") != -1 ? "" : str;
          },
          confirmDownloadReleaseLog(){
            this.$Modal.confirm({
              title: "下载日志",
              content: '<p>是否下载释放日志？</p>',
              onOk: () => {
                downloadReleaseLog(this.headerObjJson.UUID, this.headerObjJson.ModelPackageName)
              },
              onCancel: () => {
              }
            })
          },
          handleSelectAll (status) {
            this.$refs.selection.selectAll(status);
          },
          doOverride(){
            let overrideInfo = this.$refs.selection.getSelection()
            if(! (overrideInfo && overrideInfo.length > 0)){
              this.$emit("globalRefreshCardList")
              return ;
            }
            let releaseParam = {}
            releaseParam.uuid = this.headerObjJson.UUID;
            releaseParam.tomcatUrl = global_.tomcatUrl
            releaseParam.baseUrl = global_.baseUrl
            releaseParam.baseObjOther = global_.baseObjOther
            releaseParam.overrideInfo = overrideInfo
            this.releaseingText = "正在释放模型包，请耐心等待..."
            this.releaseModelPackageSpinBoolean=true;

            conflictDetectionAndRelease(releaseParam).then(res=>{
              // console.log(res)
              this.$Message.success("释放成功")
              //如果想要无限循环，只需要把这一段代码解开就好哩！
              // this.dupInfoData = res.data.data
              // if(this.dupInfoData && this.dupInfoData.length > 0) {
              //   this.toOverrideDup = true
              // } else {
              //   this.$emit("globalRefreshCardList")
              // }
              this.$emit("globalRefreshCardList")
            }).catch((err)=> {
              console.error(err);
            }).finally(() => {
              this.releaseModelPackageSpinBoolean=false;
            })
          },
          cancelOverride(){
            this.$emit("globalRefreshCardList")
          },
        },
        watch:{
        },
        computed:{
          release_span_color(){
            return this.headerObjJson.released ? '#CCCCCC' : '#1AB395';
          }
        }
    }
</script>

<style scoped>
.app-head {
        height: 60px;
        line-height: 60px;
        background: #fff;
        padding: 0 20px 0 30px;
        color: #000;
    }

.demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
}

</style>
