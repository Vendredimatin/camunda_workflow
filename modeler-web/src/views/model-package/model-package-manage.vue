<template>
  <div>
    <Row class="app-head" justify="space-between">
            <!-- <Col span="3">
                <Icon type="md-apps" style="margin-right: 5px;"></Icon>
                <span>模型包管理</span>
            </Col> -->
            <Col span="18">
                <Button style="margin-right: 10px;" id="createModelPackage" type="primary" @click="onClickToCreateNewModelPackageButton">新建模型包</Button>
                <Button id="uploadModelPackage" type="primary" @click="uploadModelPackage">上传模型包</Button>
                <input type="file" accept=".yml,.zip" id="modelpackagefile" @change="getUpLoadModelPackageFile" style="display:none"/>
            </Col>
            <Col style="float:right;">
              <Input id="searchModelPackage" search placeholder="搜索..." style="width:200px;" @on-change="handleSearch" v-model="searchInput" />
            </Col>
    </Row>

    <div :style="{'height':getHeight, 'overflow-y':'scroll', 'align-items':'center'}">
        <ModelPackageCard  v-for = "item in pagedData" :key="item.UUID" style="desplay:inline-block;min-width:340px;width: 24%" @destroyThisModelPackageCard="destroyOneModelPackageCard" @globalRefreshCardList="globalRefresh" :isThisModelPackageMine="false" :headerObjJson="item" ></ModelPackageCard>
    </div>

    <div style="margin: 10px;">
      <div style="float: right; margin: 5px">
        <Page size="small" show-elevator show-sizer show-total
              :page-size-opts="pageSizeOpts"
              :pageSize="pageSize"
              :total="searchData.length"
              :current="currentPage"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
        />
      </div>
      <!-- <div style="float: right;line-height: 34px;"> 总共{{totalNumber}}条 </div> -->
    </div>

    <br>
    <!--Row style="height:200px;">
    </Row-->
    <Modal width="1200" v-model="createModelPackageBoolean" title="新建模型包" :mask-closable="!createModelPackageBoolean" :closable="!createModelPackageBoolean">
      <div>
        <Row style="margin-left:10px;">
          <Col span="24" style="height: 500px; overflow-x:hidden;">
            <Tree ref="theWholeSystemTree" empty-text="正在加载数据..." :data="theWholeSystemData" @on-check-change="onTreeCheckChange"  show-checkbox ></Tree>
          </Col>
        </Row>
        <Row style="margin-top:20px;margin-left:10px;">
              <Checkbox v-model="selectAllNodesBoolean" label="全选"  style="margin-top: 10px;; display:inline;" @on-change="onClickSelectAllCheckBox">全选</Checkbox>
              <Button size="small" @click="onClickToFindDependenciesButton" style="float:right; display:inline;">自动依赖分析</Button>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="onClickToCancelCreateModelPackage">取消</Button>
        <Button @click="onClickChosedModelPackageContentToAddNameAnfSoOnInfoButton" :disabled = "allowToNextStep">确定</Button>
      </div>
      <Spin fix v-if="findDependenciesSpinShow">
            <Icon type="ios-loading" size='large' class="demo-spin-icon-load"></Icon>
            <br>
            <p>正在进行依赖分析，请耐心等待...</p>
      </Spin>
    </Modal>

    <Modal width="1200" v-model="addNameAndSoOnInfoToNewModelPackageBoolean" title="新建模型包" :mask-closable="!addNameAndSoOnInfoToNewModelPackageBoolean" :closable="!addNameAndSoOnInfoToNewModelPackageBoolean">
      <div style="margin-left:30px;">
        <Row >
          <Col span="12"><label style="margin-right:5px;display:inline-block">模型包名称</label><Input v-model="createModelPackageName" :maxlength="32" show-word-limit placeholder="请输入..." style="display:inline-block;width:82%;"  /></Col>
          <Col span="12"><label style="margin-right:5px;display:inline-block">模型包图标</label>
                <Select v-model="createModelPackageIcon" style="display:inline-block;width:82%;" filterable clearable>
                              <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                                  <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                                  <span style="float:right;color:#ccc">{{ item.label }}</span>
                              </Option>
                </Select>
          </Col>
        </Row>
        <br>
        <Row>
            <Col span="24"><label style="margin-right:5px;">模型包描述</label><Input v-model="createModelPackageDescription" :maxlength="180" show-word-limit  placeholder="请输入..."  style="display:inline-block;width:91%;"/></Col>
        </Row>
        <br>
        <Row>
          <Button style="float:right;margin-right:28px;" @click="editScriptModalBoolean = true">脚本</Button>
          <Button style="float:right;margin-right:10px;" @click="onClickToRefuseToSaveModelPackageButton">编辑种子模型</Button>
        </Row>
      </div>
        <Row style="margin-left:10px; height: 400px; overflow-x:hidden;">
          <Tree ref="theCreateModelPackageTree" :data="theCreateModelPackageData" ></Tree>
        </Row>
      <div slot="footer">
          <Button @click="onClickToRefuseToSaveModelPackageButton">取消</Button>
        <Button  @click="onClickToSaveModelPackageButton" :disabled="createModelPackageName===null || createModelPackageName.trim().length <= 0">保存</Button>
      </div>
      <Spin fix v-if="saveModelPackageSpinShow">
            <Icon type="ios-loading" size='large' class="demo-spin-icon-load"></Icon>
            <br>
            <p>正在创建模型包，请耐心等待...</p>
      </Spin>
    </Modal>

    <Modal v-model="editScriptModalBoolean"  :mask-closable="!editScriptModalBoolean" title="脚本" width="1200" >
          <Input v-model="createModelPackageScript" type="textarea" :rows="25" placeholder="请输入..." />
    </Modal>

    <Modal v-model="uploadModelPackageSpinBoolean" width="1200" title="上传模型包" :mask-closable="!uploadModelPackageSpinBoolean" :closable="!uploadModelPackageSpinBoolean" >
      <div style="height: 50px;">
      </div>
      <div slot="footer">
      </div>
      <Spin fix v-if="uploadModelPackageSpinBoolean">
            <Icon type="ios-loading" size='large' class="demo-spin-icon-load"></Icon>
            <br>
            <p>正在上传模型包，请耐心等待...</p>
      </Spin>
    </Modal>
  </div>
</template>

<script>
  import {createNewModelPackage, deleteModelPackage, findDependency, getAllModelPackage, getTheWholeSystemData, uploadModelPackage} from "@/api/modelpackage.js"
  import ModelPackageCard from "./components/model-package-card.vue"
  import "@/styles/component/iconfont.css";
  import moduleIconData from "./components/moduleIcon.js";
  import fontIconData from "./components/iFontIcon.js";
  import global_ from "@/views/global.vue";

    export default {
        name: "model-package-manage",
        components:{
          ModelPackageCard,
        },
        data () {
          return {
            createModelPackageBoolean:false,
            findDependenciesSpinShow:false,
            selectAllNodesBoolean:false,
            allowToNextStep:true,
            addNameAndSoOnInfoToNewModelPackageBoolean:false,
            editScriptModalBoolean:false,
            createModelPackageName:"",
            createModelPackageIcon:"ios-archive",
            createModelPackageDescription:"",
            createModelPackageScript:"",
            saveModelPackageSpinShow:false,
            uploadModelPackageSpinBoolean:false,
            theWholeSystemData:[],
            theCreateModelPackageData:[],
            currentList:[],
            modelPackageCardDataList:[],
            iconList: [],
            iList: [],

            totalNumber: 0,
            pageSizeOpts:[10, 15, 25, 50, 100, 200, 500],
            currentPage: 1,
            pageSize: 15,
            searchInput:"",

            scrollHeight: 0,
          }
        },
        mounted(){
          this.scrollHeight = document.documentElement.scrollHeight;
          var that = this;
          window.onresize = () => {
            return (() => {
              that.scrollHeight = document.documentElement.scrollHeight;
            })()
          }
          this.iconList = moduleIconData;
          this.iList = fontIconData;
        },
        methods: {
          initData() {
            getAllModelPackage().then(res=>{
              this.modelPackageCardDataList = JSON.parse(res.data.data);
              this.modelPackageCardDataList.sort(this.sortCard)
              // if(this.searchInput!=""){
              //   let searchKeyword = this.searchInput.toLowerCase().trimStart().trimEnd();
              //   this.currentList =  this.modelPackageCardDataList.filter(d => {
              //     return (d.ModelPackageName && d.ModelPackageName.toLowerCase().indexOf(searchKeyword) > -1)
              //       || (d.ModelPackageDescription && d.ModelPackageDescription.toLowerCase().indexOf(searchKeyword) > -1) ;
              //   });
              // }else{
              //   this.currentList = this.modelPackageCardDataList.concat();
              // }
              this.totalNumber = this.modelPackageCardDataList.length
              this.currentList = this.modelPackageCardDataList
              // this.currentList = this.pagedCardList(this.currentList)
            }).catch(err => {
              console.error(err)
            })
          },
          pagedCardList(unpagedProcessList){
            var paged = unpagedProcessList.slice((this.currentPage-1)*this.pageSize,(this.currentPage-1)*this.pageSize+this.pageSize);
            return paged;
          },
          globalRefresh() {
            this.currentPage = 1;
            this.initData();
          },
          onClickToCreateNewModelPackageButton(){
            this.selectAllNodesBoolean = false;
            getTheWholeSystemData().then(res=>{
              this.theWholeSystemData = [];
              this.theWholeSystemData = res.data.data
            })
            this.createModelPackageBoolean = true;
          },
          convertTreeCheck: function (tree, checkVal) {
            const result = [];
            tree.forEach((item) => {
              // 读取 map 的键值映射
              let expand = item.expand;
              let checked = checkVal;
              let title = item.title;
              let key = item.key;
              let type = item.type;
              let keyInType = item.keyInType
              let originTitle = item.originTitle
              let key2countName = item.key2countName
              let children = item.children;
              // 如果有子节点，递归
              if (children) {
                children = this.convertTreeCheck(children, checkVal);
              }
              result.push({ expand, checked, title, key, type, keyInType,originTitle, key2countName, children });
            })
            return result;
          },
          convertTree: function (tree) {
            const result = [];
            tree.forEach((item) => {
              // 读取 map 的键值映射
              let expand = false;
              let checked = item.checked;
              let title = item.title;
              let key = item.key;
              let type = item.type;
              let keyInType = item.keyInType
              let originTitle = item.originTitle
              let key2countName = item.key2countName
              let children = item.children;
              // 如果有子节点，递归
              if (children) {
                children = this.convertTree(children);
              }
              if(item.checked === true || children.length > 0){
                result.push({ expand, checked, title, key, type, keyInType, originTitle, key2countName, children });
              }
            })
            return result;
          },
          onClickSelectAllCheckBox(val){
            this.theWholeSystemData = this.convertTreeCheck(this.theWholeSystemData, val)
          },
          onTreeCheckChange(){
            let treeNodes = this.$refs.theWholeSystemTree.getCheckedAndIndeterminateNodes()
            this.allowToNextStep =  (treeNodes.length <= 0)
            let nameCounts = {}
            for(let i = 0; i < treeNodes.length; i++){
              if(nameCounts.hasOwnProperty(treeNodes[i].type)){
                nameCounts[treeNodes[i].type] ++
              } else {
                nameCounts[treeNodes[i].type] = 1
              }
            }

            for(let i = 0 ; i < this.theWholeSystemData.length; i++){
              if(! this.theWholeSystemData[i].hasOwnProperty("originTitle")){
                this.theWholeSystemData[i]["originTitle"] = this.theWholeSystemData[i].title
              }
              if(this.theWholeSystemData[i].hasOwnProperty("key2countName")){

                let title = this.theWholeSystemData[i].originTitle
                let countList = []
                for (let key in this.theWholeSystemData[i]["key2countName"]){
                    if (nameCounts.hasOwnProperty(key)){
                      countList.push(this.theWholeSystemData[i]["key2countName"][key] + "：" + nameCounts[key])
                    } else {
                      countList.push(this.theWholeSystemData[i]["key2countName"][key] + "：" + 0)
                    }
                }

                if (countList.length > 0){
                  title = title + "   (" + countList.join(" / ") + ")";
                }
                this.theWholeSystemData[i].title = title;
              }
            }
            let checkedNum = 0;
            for(let i = 0 ; i < this.theWholeSystemData.length; i++){
              if(this.theWholeSystemData[i].checked === true){
                checkedNum ++;
              }
            }
            if(checkedNum === 0){
              this.selectAllNodesBoolean = false
            }else if(checkedNum === this.theWholeSystemData.length){
              this.selectAllNodesBoolean = true
            }else{
              this.selectAllNodesBoolean = false
            }
          },
          onClickToFindDependenciesButton(){
            this.findDependenciesSpinShow = true;
            findDependency(this.theWholeSystemData).then(res=>{
              this.theWholeSystemData = res.data.data;
              this.$Message.success("自动依赖分析完成")
            }).catch(err => {
              console.error(err)
            }).finally(() => {
              this.findDependenciesSpinShow = false
            })
          },
          onClickChosedModelPackageContentToAddNameAnfSoOnInfoButton(){
            this.createModelPackageBoolean = false;
            this.theCreateModelPackageData = this.convertTree(this.theWholeSystemData)
            this.addNameAndSoOnInfoToNewModelPackageBoolean = true;
          },
          onClickToCancelCreateModelPackage(){
            this.createModelPackageBoolean = false;
            this.createModelPackageName = "";
            this.createModelPackageDescription = ""
            this.createModelPackageScript = ""
            this.createModelPackageIcon = "ios-archive"
            this.theCreateModelPackageData = []
            this.theWholeSystemData = []
          },
          onClickToRefuseToSaveModelPackageButton(){
            this.createModelPackageBoolean = true;
            this.addNameAndSoOnInfoToNewModelPackageBoolean = false;
          },
          onClickToSaveModelPackageButton(){
            let allModelPackageNames = []
            for(let i = 0; i < this.modelPackageCardDataList.length; i++){
              if(this.modelPackageCardDataList[i].ModelPackageName){
                  allModelPackageNames.push(this.modelPackageCardDataList[i].ModelPackageName.trim())
              }
            }
            if(allModelPackageNames.indexOf(this.createModelPackageName.trim()) > -1){
              this.$Message.error("模型包重名，请改名")
              return;
            }

            this.saveModelPackageSpinShow = true;
            let params = {}
            params.header = {}
            params.header.modelPackageName = this.createModelPackageName
            params.header.modelPackageIcon = this.createModelPackageIcon
            params.header.modelPackageDescription =this.createModelPackageDescription
            params.header.version =global_.versionTime
            params.script = this.createModelPackageScript;
            params.wholeNodes = this.theWholeSystemData

            createNewModelPackage(params).then(res=>{
              this.$Message.success("新建模型包成功")
            }) .catch(err => {
              this.$Message.error(err)
            }).finally(() => {
              this.createModelPackageName = "";
              this.createModelPackageDescription = "";
              this.createModelPackageScript = "";
              this.createModelPackageIcon="ios-archive";
              this.theWholeSystemData=[];
              this.theCreateModelPackageData=[];
              this.saveModelPackageSpinShow = false;
              this.addNameAndSoOnInfoToNewModelPackageBoolean = false;
              this.globalRefresh()
            })
          },
          uploadModelPackage(){
            document.querySelector('#modelpackagefile').click();
          },
          async getUpLoadModelPackageFile(e){
            if(e.target.value != "" && e.target.files[0]){
                let formData = new FormData();
                formData.append("modelPackageYamlFile", e.target.files[0]);
                this.uploadModelPackageSpinBoolean = true;
                uploadModelPackage(formData).then(res=>{
                  this.$Message.success("上传模型包成功")
                  this.globalRefresh()
                }).catch(err => {
                  console.error(err);
                }).finally(() => {
                  this.uploadModelPackageSpinBoolean = false;
                })
            }
            e.target.value = "";//这是解决选择同一个文件不触发的问题
          },

          destroyOneModelPackageCard(val){
            let formData = new FormData();
            formData.append("UUID",val);
            deleteModelPackage(formData).then(res=>{
              this.$Message.success("删除模型包成功")
              this.globalRefresh()
            }).catch(err => {
              console.error(err)
              this.globalRefresh()
            })
          },

          sortCard(header1, header2) {
            if((header1.xTime==null || header1.xTime.length<=0 )&& (header2.xTime==null||header2.xTime.length<=0)) {
              if (new Date(header1.Start) - new Date(header2.Start) === 0) {
                return 0;
              }
              return new Date(header1.Start) < new Date(header2.Start) === true ? 1 : -1
            } else if (header1.xTime==null|| header1.xTime.length<=0 ){
              if (new Date(header1.Start) - new Date(header2.xTime) === 0) {
                return 0;
              }
              return new Date(header1.Start) < new Date(header2.xTime) === true ? 1 : -1
            } else if(header2.xTime==null || header2.xTime.length<=0 ){
              if (new Date(header1.xTime) - new Date(header2.Start) === 0) {
                return 0;
              }
              return new Date(header1.xTime) < new Date(header2.Start) === true ? 1 : -1
            } else{
              if (new Date(header1.xTime) - new Date(header2.xTime) === 0) {
                return 0;
              }
              return new Date(header1.xTime) < new Date(header2.xTime) === true ? 1 : -1
            }
          },
          changePage(pageId){
            this.currentPage = pageId;
            // this.globalRefresh();
          },
          changePageSize(pageSize){
            this.pageSize = pageSize;
            // this.currentPage = 1;
            // this.handleSearch();
          },
          handleSearch(){
            this.currentPage = 1;
            // this.globalRefresh();
          },
        },

        watch:{
          theWholeSystemData(){
            let a = 10
            let b = 12;
            setTimeout(this.onTreeCheckChange, 100);

          },
          createModelPackageName(){
          },
          createModelPackageDescription(){
          },
        },
      computed:{
        getHeight(){
          return this.scrollHeight-230+'px';
        },
        searchData() {
            let sk = '';
            if(this.searchInput) {
                sk = this.searchInput.toLowerCase().trimStart().trimEnd();
            }
            let newData = this.currentList;
            if (sk) {
              newData =  newData.filter(d => {
                  return (d.ModelPackageName && d.ModelPackageName.toLowerCase().indexOf(sk) > -1)
                    || (d.ModelPackageDescription && d.ModelPackageDescription.toLowerCase().indexOf(sk) > -1) ;
              });
            }
            return newData;

        },
        pagedData() {
            let k = this.searchData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
            return k;
        }
      },
        created() {
          this.initData();
        },
    }

</script>

<style scoped>
/*.model-box {*/
/*    height: 445px;*/
/*    overflow-y: auto;*/
/*}*/
/*@media screen and (min-width: 1800px) {*/
/*  .model-box {*/
/*    height: 730px;*/
/*  }*/
/*}*/
/*@media screen and (min-width: 1600px) and (max-width: 1799px) {*/
/*  .model-box {*/
/*    height: 650px;*/
/*  }*/
/*}*/
/*@media screen and (min-width: 1401px) and (max-width: 1699px) {*/
/*  .model-box {*/
/*    height: 550px;*/
/*  }*/
/*}*/
/*@media screen and (max-width: 1400px) {*/
/*  .model-box {*/
/*    height: 420px;*/
/*  }*/
/*}*/
.app-head {
        height: 60px;
        line-height: 60px;
        background: #fff;
        padding: 0 20px 0 calc(0.5% + 5px);
        color: #000;
    }
/*.demo-spin-icon-load{*/
/*    animation: ani-demo-spin 1s linear infinite;*/
/*}*/

</style>
