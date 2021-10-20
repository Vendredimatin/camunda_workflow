<template>
  <div>
    <Modal
            v-model="attrFormat"
            width="900"
            :mask-closable="false"
            title="属性内容格式化"
            id="attrFormat"
    >
      <div>
        <Row >
            属性列表：
            <Button icon="ios-refresh" shape="circle" size="small" @click="clearList"></Button>
            <p style="color: #9ea7b4;">添加属性后用尖括号引入，例如<1><2></p> {{formatMessage}}
        </Row>
        <Row  >
            <Tag  v-for="(item, index) in finallAttrList" :key="index" closable
            size="large"
            @on-close="delAttribute(index)">序号{{item.id}}: {{item.attr}}</Tag>
        </Row>
        <Row type="flex" justify="start" align="middle">
          <Input class="margin1" v-show="filterQueryType === 'common'" ref="finallFormat" v-model="finallFormat" type="textarea" :rows="6" placeholder="格式化显示" maxlength="100" show-word-limit></Input>
        </Row>
        <Row type="flex" justify="center" align="middle" v-show="showAttrPanel">
            <Collapse v-model="defaultRefOpen" v-if="refClassSwitch" style="width:100%;">
                    <Panel name="1">
                      系统属性
                      <div slot="content">
                        <Row type="flex" align="middle" justify="start">
                          <Col span="8"  v-for="(refClassAttribute, index) in showClassAttributes.sys" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                              <span :title="refClassAttribute.displayName" class="filterQuery-display">{{refClassAttribute.displayName}}</span>
                              <span :title="refClassAttribute.attributeName" class="filterQuery-attribute">{{refClassAttribute.attributeName}}</span>
                              <Button class="filterQuery-add" size="small" @click="addAttribute(refClassAttribute.attributeName)">添加</Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Panel>
                    <Panel name="2">
                      类属性
                      <div slot="content">
                        <Row type="flex" align="middle" justify="start">
                          <Col span="8"  v-for="(refClassAttribute, index) in showClassAttributes.def" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                              <span :title="refClassAttribute.displayName" class="filterQuery-display">{{refClassAttribute.displayName}}</span>
                              <span :title="refClassAttribute.attributeName" class="filterQuery-attribute">{{refClassAttribute.attributeName}}</span>
                              <Button class="filterQuery-add" size="small" @click="addAttribute(refClassAttribute.attributeName)">添加</Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Panel>
            </Collapse>
            <Collapse v-model="defaultOpen" v-else style="width:100%;">
                <Panel name="1" v-if="options.hideRelationClass.indexOf('relation') !== -1">
                关联类
                <div slot="content">
                    <Collapse v-model="defaultRelationRefOpen">
                    <Panel name="1-1">
                        系统属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(relation, index) in showClassAttributes.relationSys" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="relation.displayName" class="filterQuery-display">{{relation.displayName}}</span>
                            <span :title="relation.attributeName" class="filterQuery-attribute">{{relation.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(relation.attributeName, 'relation_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    <Panel name="1-2">
                        类属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(relation, index) in showClassAttributes.relationDef" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="relation.displayName" class="filterQuery-display">{{relation.displayName}}</span>
                            <span :title="relation.attributeName" class="filterQuery-attribute">{{relation.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(relation.attributeName, 'relation_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    </Collapse>
                </div>
                </Panel>
                <Panel name="2" v-if="options.hideRelationClass.indexOf('left') !== -1">
                左类
                <div slot="content">
                    <Collapse v-model="defaultLeftRefOpen">
                    <Panel name="2-1">
                        系统属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(left, index) in showClassAttributes.leftSys" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="left.displayName" class="filterQuery-display">{{left.displayName}}</span>
                            <span :title="left.attributeName" class="filterQuery-attribute">{{left.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(left.attributeName, 'left_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    <Panel name="2-2">
                        类属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(left, index) in showClassAttributes.leftDef" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="left.displayName" class="filterQuery-display">{{left.displayName}}</span>
                            <span :title="left.attributeName" class="filterQuery-attribute">{{left.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(left.attributeName, 'left_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    </Collapse>
                </div>
                </Panel>
                <Panel name="3" v-if="options.hideRelationClass.indexOf('right') !== -1">
                右类
                <div slot="content">
                    <Collapse v-model="defaultRightRefOpen">
                    <Panel name="3-1">
                        系统属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(right, index) in showClassAttributes.rightSys" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="right.displayName" class="filterQuery-display">{{right.displayName}}</span>
                            <span :title="right.attributeName" class="filterQuery-attribute">{{right.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(right.attributeName, 'right_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    <Panel name="3-2">
                        类属性
                        <div slot="content">
                        <Row type="flex" align="middle" justify="start" >
                        <Col span="8"  v-for="(right, index) in showClassAttributes.rightDef" :key="index" :style="attributeBoxStyle">
                            <div class="filterQuery-box">
                            <span :title="right.displayName" class="filterQuery-display">{{right.displayName}}</span>
                            <span :title="right.attributeName" class="filterQuery-attribute">{{right.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute(right.attributeName, 'right_')">添加</Button>
                            </div>
                        </Col>
                        </Row>
                        </div>
                    </Panel>
                    </Collapse>
                </div>
                </Panel>
            </Collapse>
        </Row>
      </div>
      <div slot="footer">
        <Button type="text" @click="cancelFormat">取消</Button>
        <Button type="primary" @click="confirmFinalFormat" id="confirmattrFormatButton">确认</Button>
      </div>
    </Modal>
    <Spin fix v-if="spinShow"></Spin>
  </div>
</template>
<script>
  import { getAllEntities, getAllRelations, getNativeQuery } from "@/api/others";
  import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';
  import {mapGetters, mapActions} from "vuex";
  import axios from "@/libs/axios";
  import global_ from "@/views/global.vue";
  const baseUrl = global_.baseUrl;

  export default {
    props: ['refClass', "root", "targetClass", "itemValue", "args", "store", "formatMessage","bindAttrList"],
    data() {
      return {
        attrFormat: false,
        refClassType: '',
        objClassType: '',
        refClassObj: {},
        refLeftClassObj: {},
        refRightClassObj: {},
        refClassSwitch: true, //用来显示引用类关联/非关联列表
        objClassSwitch: true, //用来显示表单类关联/非关联列表
        // 所有的实体类数组，用于选择refClass
        allEntityClasses: [],
        allRelationClasses: [],
        filterQueryType: 'common',
        filterQueryGroup: 'obj',
        filterQueryRefClass: '',
        classType: '',
        showClassAttributes: {
          sys: [],
          def: [],
          relationSys: [],
          relationDef: [],
          leftSys: [],
          leftDef: [],
          rightSys: [],
          rightDef: [],
        },
        formAttributes: [], //表单对应类属性列表(实时值)
        attributeBoxStyle: {
          'height': '40px',
          'margin': '5px 0'
        },
        finallFormat: '',
        finallAttrList:[],
        initAttrList: [],
        initFormat: '',
        addinHash: {},
        spinShow: false,
        defaultOpen: '1',
        defaultRefOpen: '2',
        defaultLeftRefOpen: '2-2',
        defaultRightRefOpen: '3-2',
        defaultRelationRefOpen: '1-2',
        defaultObjOpen: '2',
        defaultLeftObjOpen: '2-2',
        defaultRightObjOpen: '3-2',
        defaultRelationObjOpen: '1-2',
        options: {
          useStore: true,
          hideRelationClass: ['left', 'right', 'relation']
        },
        initFlag: false,
        showAttrPanel: true,
      }
    },
    created() {
      this.$store = this.store;
      // this.initClassList();
    },
    mounted() {
      this.filterQueryRefClass = this.refClass;
      // this.allEntityClasses = this.Entities().filter(x => typeof x.className == "string");
      // this.allRelationClasses = this.Relations();
    },
    computed: {
      ...mapGetters("DWF_form", [
        "Entities",
        "Relations",
        "AttributesByClass",]
      ),
    },
    watch: {
    },
    methods: {
      ...mapActions("DWF_form", [
        "getAttributeClassMap",
        "queryRelation",
        "queryEntity"]),
      /**
       * @description初始化过滤条件生成
       * @params tabFlag 是否隐藏tab
       * @param classType 当前选择类场景 en:实体类&引用实体类 / re:关联类 / ex_re:引用关联类 / ex_en:外部实体类
       */
      async initModal(formatMessage,bindAttrList ,refClass, options, classType) {
        console.log('init', refClass, formatMessage,bindAttrList)
        this.finallFormat = formatMessage;
        this.initFormat = formatMessage;
        this.finallAttrList = bindAttrList
        this.initAttrList = _.cloneDeep(bindAttrList);
        if(this.initFlag) return;
        this.initFlag = true;
        if (!refClass || refClass=='') {
          this.showAttrPanel = false;
        }
        else {
          this.showAttrPanel = true
          await this.initClassList(refClass, classType);
          options ? Object.assign(this.options, options) : '';
          this.classType = classType || '';
          this.filterQueryRefClass = refClass || '';
  
          this.filterRefClassChange(this.filterQueryRefClass);

        }

        this.addinHash = {};
        if(this.itemValue) this.generatorAddinHash(this.itemValue.data);
        this.initFlag = false;
        this.$nextTick(() => {
          this.attrFormat = true;
        })
      },
      /**
       * @description查询类切换
       */
      async filterRefClassChange(value){
        if(value){
          // try {
            let refClassDetail = this.Relations(value) === null ? this.Entities(value) : this.Relations(value);
            if(refClassDetail == null || (!refClassDetail && !this.options.useStore)){
              let classCategory = await axios.get(`${baseUrl}/meta/modules/${value}`);
              classCategory = classCategory.data.data.classCategory;
              if(classCategory === 'RelationClass'){
                await this.queryRelation(value);
                refClassDetail = this.Relations(value);
              }else{
                await this.queryEntity(value);
                refClassDetail = this.Entities(value);
              }
            }
            console.log(refClassDetail)
            this.refClassObj = refClassDetail;
            this.refClassType = refClassDetail.classCategory;
            if (this.refClassType === 'RelationClass') {
              this.externalItemClass = false;
              let relation = this.AttributesByClass(value).length === 0
                ? await this.getAttributeClassMap(value)
                : this.AttributesByClass(value);
              this.showClassAttributes.relationSys = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
              this.showClassAttributes.relationDef = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);

              let left = this.AttributesByClass(refClassDetail.leftClass).length === 0
                ? await this.getAttributeClassMap(refClassDetail.leftClass)
                : this.AttributesByClass(refClassDetail.leftClass);
              this.showClassAttributes.leftSys = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.showClassAttributes.leftDef = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

              await this.queryEntity(refClassDetail.leftClass);
              this.refLeftClassObj = this.Entities(refClassDetail.leftClass);

              let right = this.AttributesByClass(refClassDetail.rightClass).length === 0
                ? await this.getAttributeClassMap(refClassDetail.rightClass)
                : this.AttributesByClass(refClassDetail.rightClass);
              this.showClassAttributes.rightSys = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.showClassAttributes.rightDef = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                this.refClassSwitch = false;

              await this.queryEntity(refClassDetail.rightClass);
              this.refRightClassObj = this.Entities(refClassDetail.rightClass);
            }else if(this.refClassType === 'ItemClass'){
              this.externalItemClass = false;
              let entity = this.AttributesByClass(value).length === 0
                ? await this.getAttributeClassMap(value)
                : this.AttributesByClass(value);
              this.showClassAttributes.sys = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.showClassAttributes.def = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                this.refClassSwitch = true;
            }else{
              this.externalItemClass = true;
              let entity = this.AttributesByClass(value).length === 0
                ? await this.getAttributeClassMap(value)
                : this.AttributesByClass(value);
              this.showClassAttributes.sys = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.showClassAttributes.def = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
              this.refClassSwitch = true;
            }
          // } catch (e) {
          //   this.$Message.error(e);
          // }
        }
      },
      /**
       * @description控件id映射表
       */
      generatorAddinHash(item) {
        if (!item){
          this.addinHash = {};
          return this.addinHash;
        }
        if ("self" in item && item.self.properties.id !== this.args.id) {
          this.addinHash[item.self.properties.id] = item.obj;
        }
        for (var i = 0;i < item.elements.length;i++) {
          this.generatorAddinHash(item.elements[i]);
        }
        return this.addinHash;
      },
      /**
       * @description确认生成
       */
      confirmFinalFormat() {
        this.attrFormat = false;
        
        this.$emit('generatorFinallAttrFormat', this.finallFormat, this.finallAttrList);

      },
      cancelFormat() {
        this.$emit('generatorFinallAttrFormat', this.initFormat, this.initAttrList);
        this.attrFormat = false;


      },
      /**
       * @description增加条件
       */
      addAttribute(attributeName, prefix = ''){
        if (this.finallAttrList.length >= 5) {
          this.$Message.warning("最多添加5个属性哦");
          return
        }
        let attrindex = this.finallAttrList.length == 0? 0: this.finallAttrList[this.finallAttrList.length-1].id;
        this.finallAttrList.push({
          id: attrindex + 1,
          attr: prefix + attributeName,
        });
        this.finallFormat = `${this.finallFormat} <${attrindex + 1}>`

      },
      delAttribute(index){
        let attrindex = this.finallAttrList[index] ? this.finallAttrList[index].id : 0;
        this.finallFormat=this.finallFormat.replace(new RegExp(`<${attrindex}>`,'g'),'');
        this.finallAttrList.splice(index, 1);

      },

      async initClassList(refClass, classType){

        this.allEntityClasses = [];
        this.allRelationClasses = [];
        if(classType === 're' || classType === 're-me'){
          await this.queryRelation(refClass);
        }else{
          await this.queryEntity(refClass);
        }

        let allEn = this.Entities();
        let allRe = this.Relations();
        if(allEn && allEn.length > 0) {

          allEn.forEach((val) => {
            let eachItem = {
              className: val.className,
              displayName: val.displayName,
              id: val.id
            };
            this.allEntityClasses.push(eachItem);
          });
        } else {

          let entityClasses = await getAllEntities({needOperationCount: false});
          try{
            entityClasses = entityClasses.data;
            if (!entityClasses.success) {
              let title = "提示";
              let content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              this.allEntityClasses = entityClasses.data;
            }
          }catch(e){
            console.log(e);
          };

        }

        if(allRe && allRe.length > 0) {

          allRe.forEach((val) => {
            let eachItem = {
              className: val.className,
              displayName: val.displayName,
              id: val.id
            };
            this.allRelationClasses.push(eachItem);
          });

        } else {

          let relationClasses = await getAllRelations();
          try{
            relationClasses = relationClasses.data;
            if (!relationClasses.success) {
              let title = "提示";
              let content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              this.allRelationClasses = relationClasses.data;
            }
          }catch(e){
            console.log(e);
          };

        }

      },
      clearList() {
        this.finallFormat = '';
        this.finallAttrList = []
      }
    }
  }
</script>
<style>
  .filterQuery-box{
    width: 97%;
    line-height: 40px;
    border: 1px solid #eee;
    padding: 0 5%;
  }
  .filterQuery-box-60{
    width: 97%;
    line-height: 30px;
    border: 1px solid #eee;
    padding: 0 5%;
  }
  .filterQuery-label{
    width: 50%;
    float: left;
    overflow: hidden;
    height: 30px;
    white-space: nowrap;
    display: block;
    word-break: break-all;
    text-overflow: ellipsis;
  }
  .filterQuery-box-60 .filterQuery-display{
    width: 70%;
  }
  .filterQuery-box-60 .filterQuery-attribute{
    width: 50%;
  }
  .filterQuery-box-60 .filterQuery-add{
    float: right;
    margin-right: 2%;
  }
  .filterQuery-display{
    width: 30%;
    float: left;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    word-break: break-all;
    text-overflow: ellipsis;
  }
  .filterQuery-attribute{
    width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    word-break: break-all;
    float: left;
  }
</style>
