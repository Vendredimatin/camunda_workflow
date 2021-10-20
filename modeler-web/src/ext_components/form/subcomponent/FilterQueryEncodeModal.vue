<template>
  <div>
    <Modal
            v-model="filterQueryModal"
            width="900"
            :mask-closable="false"
            title="编码前缀生成器"
            id="filterQueryModal"
    >
      <div>
        <!-- <Row type="flex" justify="start" align="middle">
          <Col span="8">
            <span class="margin1" style="width: 40%">选择查询类： </span>
            <Select id="selectQueryClass"  class="margin1" v-model="filterQueryRefClass" :disabled="options.refClassDisabled" filterable clearable  style="width: 60%" @on-change="filterQueryRefClassChange">
              <OptionGroup label="实体类">
                <Option
                        v-for="item in allEntityClasses"
                        :key="item.id || ''"
                        :value="item.className"
                        :label="item.displayName"
                >
                  <span>{{ item.displayName }}</span>
                  <span style="float:right;color:#ccc">{{ item.className }}</span>
                </Option>
              </OptionGroup>
              <OptionGroup label="关联类">
                <Option
                        v-for="item in allRelationClasses"
                        :key="item.id"
                        :value="item.className"
                        :label="item.displayName"
                >
                  <span>{{ item.displayName }}</span>
                  <span style="float:right;color:#ccc">{{ item.className }}</span>
                </Option>
              </OptionGroup>
            </Select>
          </Col>
          <Col span="8">
            <span class="margin1">查询类型： </span>
            <RadioGroup v-model="filterQueryType" @on-change="filterQueryTypeChange">
              <Radio label="common">快速查询</Radio>
              <Radio v-show="options.allowNative" label="native">原生查询</Radio>
            </RadioGroup>
          </Col>
        </Row> -->
        <Row type="flex" justify="start" align="middle">
          <Input id="filterConditions" class="margin1" v-show="filterQueryType === 'common'" ref="finallyFilterQueryCommon" v-model="finallyFilterQueryCommon" type="textarea" :rows="6" placeholder="过滤条件" ></Input>
          <Input id="filterConditions" class="margin1" v-show="filterQueryType === 'native'" ref="finallyFilterQueryNative" v-model="finallyFilterQueryNative" type="textarea" :rows="6" placeholder="过滤条件" ></Input>
        </Row>
        <Row type="flex" justify="center" align="middle" style="max-height: 400px;overflow-y: scroll;">
          <Col span="24">
            <Tabs :value="filterQueryGroup" name="filterQueryGroup">
              <TabPane v-if="hideTab" label="$obj" name="$obj" tab="filterQueryGroup">
                <div v-if="objClassSwitch">
                  <Collapse v-model="defaultObjOpen">
                    <Panel name="1">
                      系统属性
                      <div slot="content">
                        <Row type="flex" align="middle" justify="start">
                        <Col span="8" v-for="(objAttribute, index) in objAttributes.sys" :key="index" :style="attributeBoxStyle">
                          <div class="filterQuery-box">
                            <span :title="objAttribute.displayName" class="filterQuery-display">{{objAttribute.displayName}}</span>
                            <span :title="objAttribute.attributeName" class="filterQuery-attribute">{{objAttribute.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', objAttribute.attributeName)">添加</Button>
                          </div>
                        </Col>
                      </Row>
                      </div>
                    </Panel>
                    <Panel name="2">
                      类属性
                      <div slot="content">
                        <Row type="flex" align="middle" justify="start">
                        <Col span="8"  v-for="(objAttribute, index) in objAttributes.def" :key="index" :style="attributeBoxStyle">
                          <div class="filterQuery-box">
                            <span :title="objAttribute.displayName" class="filterQuery-display">{{objAttribute.displayName}}</span>
                            <span :title="objAttribute.attributeName" class="filterQuery-attribute">{{objAttribute.attributeName}}</span>
                            <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', objAttribute.attributeName)">添加</Button>
                          </div>
                        </Col>
                      </Row>
                      </div>
                    </Panel>
                  </Collapse>
                </div>
                <Collapse v-model="defaultOpen" v-else>
                  <Panel name="1">
                    关联类
                    <div slot="content">
                      <Collapse v-model="defaultRelationObjOpen">
                        <Panel name="1-1">
                          系统属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(relation, index) in objAttributes.relationSys" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="relation.displayName" class="filterQuery-display">{{relation.displayName}}</span>
                                <span :title="relation.attributeName" class="filterQuery-attribute">{{relation.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', relation.attributeName, 'relation_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                        <Panel name="1-2">
                          类属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(relation, index) in objAttributes.relationDef" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="relation.displayName" class="filterQuery-display">{{relation.displayName}}</span>
                                <span :title="relation.attributeName" class="filterQuery-attribute">{{relation.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', relation.attributeName, 'relation_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                      </Collapse>
                    </div>
                  </Panel>
                  <Panel name="2">
                    左类
                    <div slot="content">
                      <Collapse v-model="defaultLeftObjOpen">
                        <Panel name="2-1">
                          系统属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(left, index) in objAttributes.leftSys" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="left.displayName" class="filterQuery-display">{{left.displayName}}</span>
                                <span :title="left.attributeName" class="filterQuery-attribute">{{left.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', left.attributeName, 'left_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                        <Panel name="2-2">
                          类属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(left, index) in objAttributes.leftDef" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="left.displayName" class="filterQuery-display">{{left.displayName}}</span>
                                <span :title="left.attributeName" class="filterQuery-attribute">{{left.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', left.attributeName, 'left_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                      </Collapse>
                    </div>
                  </Panel>
                  <Panel name="3">
                    右类
                    <div slot="content">
                      <Collapse v-model="defaultRightObjOpen">
                        <Panel name="3-1">
                          系统属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(right, index) in objAttributes.rightSys" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="right.displayName" class="filterQuery-display">{{right.displayName}}</span>
                                <span :title="right.attributeName" class="filterQuery-attribute">{{right.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', right.attributeName, 'right_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                        <Panel name="3-2">
                          类属性
                          <div slot="content">
                            <Row type="flex" align="middle" justify="start" >
                            <Col span="8"  v-for="(right, index) in objAttributes.rightDef" :key="index" :style="attributeBoxStyle">
                              <div class="filterQuery-box">
                                <span :title="right.displayName" class="filterQuery-display">{{right.displayName}}</span>
                                <span :title="right.attributeName" class="filterQuery-attribute">{{right.attributeName}}</span>
                                <Button class="filterQuery-add" size="small" @click="addAttribute('$obj', right.attributeName, 'right_')">添加</Button>
                              </div>
                            </Col>
                          </Row>
                          </div>
                        </Panel>
                      </Collapse>
                    </div>
                  </Panel>
                </Collapse>
              </TabPane>
              <TabPane v-if="hideTab" label="$user" name="$user" tab="filterQueryGroup">
                <Col span="8"  v-for="(userAttribute, index) in userAttributes" :key="index" :style="attributeBoxStyle">
                  <div class="filterQuery-box">
                    <span :title="userAttribute.displayName" class="filterQuery-display">{{userAttribute.displayName}}</span>
                    <span :title="userAttribute.attributeName" class="filterQuery-attribute">{{userAttribute.attributeName}}</span>
                    <Button class="filterQuery-add" size="small" @click="addAttribute('$user', userAttribute.attributeName)">添加</Button>
                  </div>
                </Col>
              </TabPane>
              <TabPane v-if="hideTab" label="$env" name="$env" tab="filterQueryGroup">
                <Col span="8"  v-for="(envAttribute, index) in envAttributes" :key="index" :style="attributeBoxStyle">
                  <div class="filterQuery-box">
                    <span :title="envAttribute.displayName" class="filterQuery-display">{{envAttribute.displayName}}</span>
                    <span :title="envAttribute.attributeName" class="filterQuery-attribute">{{envAttribute.attributeName}}</span>
                    <Button class="filterQuery-add" size="small" @click="addAttribute('$env', envAttribute.attributeName)">添加</Button>
                  </div>
                </Col>
              </TabPane>
              <TabPane v-if="hideTab && !fromManagement" label="$form" name="$form" tab="filterQueryGroup">
                <Col span="8"  v-for="(formAttribute, index) in formAttributes" :key="index" :style="{'height': '60px', 'margin': '5px 0'}">
                  <div class="filterQuery-box-60 clearfix">
                    <span :title="formAttribute.label" class="filterQuery-label">{{formAttribute.label}}</span>
                    <span :title="formAttribute.attributeName" class="filterQuery-attribute">{{formAttribute.attributeName}}</span>
                    <span :title="formAttribute.displayName" class="filterQuery-display">{{formAttribute.displayName}}</span>
                    <Button class="filterQuery-add" size="small" @click="addAttribute('$form', formAttribute.displayName)">添加</Button>
                  </div>
                </Col>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button id="cancelFilterQueryButton" type="text" @click="filterQueryModal = false">取消</Button>
        <Button id="confirmFilterQueryButton" type="primary" @click="confirmFilterQuery" >确认</Button>
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
    props: ['refClass', "root", "targetClass", "itemValue", "args", "store", "fromManagement"],
    data() {
      return {
        filterQueryModal: false,
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
        filterQueryGroup: '$obj',
        filterQueryRefClass: '',
        classType: '',
        hideTab: true,
        //引用类属性列表
        refClassAttributes: {
          sys: [],
          def: [],
          relationSys: [],
          relationDef: [],
          leftSys: [],
          leftDef: [],
          rightSys: [],
          rightDef: [],
        },
        //表单对应类属性列表
        objAttributes: {
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
        userAttributes: [
          {displayName: '用户Id', attributeName: 'userId'},
          {displayName: '用户名', attributeName: 'userName'},
          {displayName: '用户token', attributeName: 'token'},
          {displayName: '用户oid', attributeName: 'oid'},
          {displayName: '用户displayName', attributeName: 'displayName'},
          {displayName: '用户所属组oid', attributeName: 'userGroups[0].oid'},
          {displayName: '用户所属组name', attributeName: 'userGroups[0].name'},
          {displayName: '用户所属组comment', attributeName: 'userGroups[0].comment'},
        ],
        envAttributes: [
          {displayName: '服务器URL', attributeName: 'serverURL'},
          {displayName: '服务器地址', attributeName: 'serverIp'},
          {displayName: '服务器端口', attributeName: 'serverPort'},
          {displayName: '服务器元数据服务端口', attributeName: 'metaServicePort'},
          {displayName: '服务器对象数据服务端口', attributeName: 'objServicePort'},
        ],
        attributeBoxStyle: {
          'height': '40px',
          'margin': '5px 0'
        },
        finallyFilterQuery: '',
        finallyFilterQueryNative: '',
        finallyFilterQueryCommon: '',
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
          allowNative: true,
          refClassDisabled: true,
          hideRelationClass: ['left', 'right', 'relation']
        },
        initFlag: false,
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
      queryPrefix(){
        return this.filterQueryType === 'native' ? 'nativequery:' : 'and ';
      }
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
      async initModal(filterQuery, refClass, options, tabFlag, classType) {
        //  前缀默认为类名前两位
        let defaultValue = this.itemValue.data.targetClass.slice(0,2).toUpperCase()
        if(this.initFlag) return;
        this.initFlag = true;
        await this.initClassList(refClass, classType);
        options ? Object.assign(this.options, options) : '';
        this.hideTab = tabFlag ? false : true;
        this.classType = classType || '';
        this.filterQueryType = filterQuery && filterQuery.trim().startsWith('nativequery:') ? 'native' : 'common';
        this.filterQueryRefClass = refClass || '';
        if(!this.filterQueryRefClass){
          this.filterQueryGroup = '$obj'
        }
        this.filterQueryRefClassChange(this.filterQueryRefClass);
        if(this.filterQueryType === 'common'){
          this.finallyFilterQueryCommon = filterQuery || defaultValue;
          this.finallyFilterQueryNative = '';
        }else{
          this.finallyFilterQueryNative = filterQuery || defaultValue;
          this.finallyFilterQueryCommon = '';
        }
        if(this.finallyFilterQueryNative){
          this.finallyFilterQueryNative = this.finallyFilterQueryNative.replace('nativequery:', '');
        }
        this.addinHash = {};
        if(this.itemValue) this.generatorAddinHash(this.itemValue.data);
        this.initObjList();
        this.initFlag = false;
        this.$nextTick(() => {
          this.filterQueryModal = true;
          setTimeout(() => {
            if(this.filterQueryType === 'common'){
              this.$refs['finallyFilterQueryCommon'].$el.querySelector('textarea').focus();
            }else{
              this.$refs['finallyFilterQueryNative'].$el.querySelector('textarea').focus();
            }
          }, 0)
        })
      },
      /**
       * @description初始化$obj
       */
      async initObjList() {
        // try {
          let objClassDetail = this.Relations(this.targetClass) === null ? this.Entities(this.targetClass) : this.Relations(this.targetClass);
          if(objClassDetail == null || (!objClassDetail && !this.options.useStore)){
            let classCategory = await axios.get(`${baseUrl}/meta/modules/${this.targetClass}`);
            classCategory = classCategory.data.data.classCategory;
            if(classCategory === 'RelationClass'){
              await this.queryRelation(this.targetClass);
              objClassDetail = this.Relations(this.targetClass);
            }else{
              await this.queryEntity(this.targetClass);
              objClassDetail = this.Entities(this.targetClass);
            }
          }
          this.objClassType = objClassDetail.classCategory;
          if (this.objClassType === 'RelationClass') {
            let relation = this.AttributesByClass(this.targetClass).length === 0
              ? await this.getAttributeClassMap(this.targetClass)
              : this.AttributesByClass(this.targetClass);
            this.objAttributes.relationSys = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
            this.objAttributes.relationDef = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);

            let left = this.AttributesByClass(objClassDetail.leftClass).length === 0
              ? await this.getAttributeClassMap(objClassDetail.leftClass)
              : this.AttributesByClass(objClassDetail.leftClass);
            this.objAttributes.leftSys = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.objAttributes.leftDef = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

            let right = this.AttributesByClass(objClassDetail.rightClass).length === 0
              ? await this.getAttributeClassMap(objClassDetail.rightClass)
              : this.AttributesByClass(objClassDetail.rightClass);
            this.objAttributes.rightSys = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.objAttributes.rightDef = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            this.objClassSwitch = false;
          }else{
            let entity = this.AttributesByClass(this.targetClass).length === 0
              ? await this.getAttributeClassMap(this.targetClass)
              : this.AttributesByClass(this.targetClass);
            this.objAttributes.sys = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.objAttributes.def = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            this.objClassSwitch = true;
          }
          this.formAttributes = [];
          for(let addinId in this.addinHash){
            let addin = this.addinHash[addinId];
            // if(addin.arg_name){
              this.formAttributes.push({displayName: addinId, attributeName: addin.arg_name, label: addin.args.label});
            // }
          }
        // } catch (e) {
        //   this.$Message.error(e);
        // }
      },
      /**
       * @description搜索方式切换
       */
      filterQueryTypeChange(type){

        console.log(this.filterQueryRefClass, this.classType, this.refClassObj, this.refClassAttributes);
        // this.$emit('filterQueryTypeChange', type, this.finallyFilterQuery);
        if(type === 'native' && this.finallyFilterQueryNative == '' && this.classType != '') {
          let isJoined = this.classType === 're';
          getNativeQuery(this.filterQueryRefClass, isJoined).then(res => {
            if (res.success) {
              // res.data.trim().startsWith('nativequery:'))
              this.finallyFilterQueryNative = res.data.replace('nativequery:', '');
            } else {
              this.finallyFilterQueryNative = '';
            }
          })
        }
      },
      /**
       * @description设置搜索框值
       */
      setFilterQuery(value){
        this.finallyFilterQuery = value;
      },
      /**
       * @description查询类切换
       */
      async filterQueryRefClassChange(value){
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
              this.refClassAttributes.relationSys = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
              this.refClassAttributes.relationDef = relation.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);

              let left = this.AttributesByClass(refClassDetail.leftClass).length === 0
                ? await this.getAttributeClassMap(refClassDetail.leftClass)
                : this.AttributesByClass(refClassDetail.leftClass);
              this.refClassAttributes.leftSys = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.refClassAttributes.leftDef = left.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

              await this.queryEntity(refClassDetail.leftClass);
              this.refLeftClassObj = this.Entities(refClassDetail.leftClass);

              let right = this.AttributesByClass(refClassDetail.rightClass).length === 0
                ? await this.getAttributeClassMap(refClassDetail.rightClass)
                : this.AttributesByClass(refClassDetail.rightClass);
              this.refClassAttributes.rightSys = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.refClassAttributes.rightDef = right.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                this.refClassSwitch = false;

              await this.queryEntity(refClassDetail.rightClass);
              this.refRightClassObj = this.Entities(refClassDetail.rightClass);
            }else if(this.refClassType === 'ItemClass'){
              this.externalItemClass = false;
              let entity = this.AttributesByClass(value).length === 0
                ? await this.getAttributeClassMap(value)
                : this.AttributesByClass(value);
              this.refClassAttributes.sys = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.refClassAttributes.def = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                this.refClassSwitch = true;
            }else{
              this.externalItemClass = true;
              let entity = this.AttributesByClass(value).length === 0
                ? await this.getAttributeClassMap(value)
                : this.AttributesByClass(value);
              this.refClassAttributes.sys = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.refClassAttributes.def = entity.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
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
      confirmFilterQuery() {
        this.filterQueryModal = false;
        if(this.filterQueryType === 'common'){
          this.finallyFilterQuery = this.finallyFilterQueryCommon;
        }else{
          this.finallyFilterQuery = !this.finallyFilterQueryNative || this.finallyFilterQueryNative.trim().startsWith('nativequery:') ? this.finallyFilterQueryNative : `nativequery:${this.finallyFilterQueryNative}`;
        }
        this.$emit('generatorEncodePrefix', this.finallyFilterQuery);
      },
      /**
       * @description增加条件
       */
      addAttribute(type, attributeName, prefix = ''){
        if(this.filterQueryType === 'common'){ // 快速查询
          switch (type) {
            case '$obj':
              this.finallyFilterQueryCommon = `${this.finallyFilterQueryCommon}${type}.${prefix}${attributeName}`;
              break;
            case '$form':
              this.finallyFilterQueryCommon = `${this.finallyFilterQueryCommon}${type}["${attributeName}"]`;
              break;
            default:
              this.finallyFilterQueryCommon = `${this.finallyFilterQueryCommon}${type}.${attributeName}`;
              break;
          }
        }else{
          switch (type) { // 原生查询
            case '$obj':
              this.finallyFilterQueryNative = `${this.finallyFilterQueryNative}${type}.${prefix}${attributeName}`;
              break;
            case '$form':
              this.finallyFilterQueryNative = `${this.finallyFilterQueryNative}${type}["${attributeName}"]`;
              break;
            default:
              this.finallyFilterQueryNative = `${this.finallyFilterQueryNative}${type}.${attributeName}`;
              break;
          }
        }
      },

      async initClassList(refClass, classType){

        this.allEntityClasses = [];
        this.allRelationClasses = [];
        if(classType === 're' || classType === 're-me'){
          await this.queryRelation(refClass);
        }else{
          debugger
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
