<template>
  <div>
    <Modal
            v-model="attributeChainModal"
            width="900"
            :mask-closable="false"
            title="属性联动赋值配置框"
            class-name="attributeChainModal"
    >
      <Table border ref="attrTable" height="450" :columns="columnsAttr" :data="formAddinData" ></Table>
      <div slot="footer">
        <Button type="text" @click="attributeChainModal = false">取消</Button>
        <Button type="primary" @click="confirmAttributeChain">确认</Button>
      </div>
    </Modal>
    <Spin fix v-if="spinShow"></Spin>
  </div>
</template>
<script>
  import {mapGetters} from "vuex";
  import global_ from "@/views/global.vue";
  import AttributeSelect from "./AttributeSelect";
  const baseUrl = global_.baseUrl;

  export default {
    props: [
      'refClass',
      'root',
      'targetClass',
      'itemValue',
      'args',
      'store',
      'isRelation',
      'refClassAttributes_sys',
      'refClassAttributes_def',
      'refClassAttributes_relationSys',
      'refClassAttributes_relationDef',
      'refClassAttributes_leftDef',
      'refClassAttributes_rightDef',
      'attrChain'
    ],
    components: {
      AttributeSelect
    },
    data() {
      return {
        attributeChainModal: false,
        formAttributes: [], //表单对应类属性列表(实时值)
        addinHash: {},
        spinShow: false,
        columnsAttr: [],
        formAddinData: [],
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
        disableAddinList: ['附件', '超链接', '按钮', '网页'],
        enableAddinList: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicDigitalLabel', 'RichTextEditor', 'DynamicParameterFrame', 'MultiFilesList', 'OrgUserSelect', 'EntitiesAttrSelect', 'FormSelect', 'TimeSeriesSelect'],
      }
    },
    created() {
      this.$store = this.store;
    },
    mounted() {
      this.initColumnDefs();
      // this.filterQueryRefClass = this.refClass;
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
      // ...mapActions("DWF_form", [
      //   "getAttributeClassMap",
      //   "queryRelation",
      //   "queryEntity"]),
      /**
       *
       */
      initColumnDefs(){
        this.columnsAttr = [
          {
            title: '控件ID',
            key: 'addinId',
            width: 130,
            tooltip: true,
            align: 'center'
          },
          {
            title: '目标属性',
            key: 'attrName',
            width: 200,
            tooltip: true,
            align: 'center'
          },
          {
            title: '标签名称',
            key: 'attrLabel',
            width: 130,
            tooltip: true,
            align: 'center'
          },
          {
            title: '控件类型',
            key: 'attrTitle',
            width: 200,
            tooltip: true,
            align: 'center'
          },
          {
            title: '绑定属性',
            key: 'attrChain',
            width: 200,
            tooltip: true,
            render: (h, params) => {
              console.log(params)
              return h(AttributeSelect, {
                props: {
                  dataTypes: params.row.dataTypes,
                  attrChain: params.row.attrChain,
                  attributes: this.attributes,
                  isRelation: this.isRelation,
                  refClassAttributes_sys: this.refClassAttributes_sys,
                  refClassAttributes_def: this.refClassAttributes_def,
                  refClassAttributes_relationSys: this.refClassAttributes_relationSys,
                  refClassAttributes_relationDef: this.refClassAttributes_relationDef,
                  refClassAttributes_leftDef: this.refClassAttributes_leftDef,
                  refClassAttributes_rightDef: this.refClassAttributes_rightDef
                },
                on: {
                  'handleSelectAttrChain': (attrChain) => {
                    if(attrChain){
                      this.attrChainCatch[params.row.addinId] = attrChain;
                    }else{
                      delete this.attrChainCatch[params.row.addinId];
                    }
                  }
                }
              })
            }
          },
        ]
      },

      /**
       * @description初始化
       */
      initModal() {
        this.attributeChainModal = true;
        this.addinHash = {};
        this.attrChainCatch = _.cloneDeep(this.attrChain);
        if(this.itemValue) this.generatorAddinHash(this.itemValue.data);
        this.generatorAddinList();
        this.initColumnDefs();
      },

      /**
       * @description控件id映射表
       */
      generatorAddinHash(item) {
        if (!item){
          this.addinHash = {};
          return this.addinHash;
        }
        if ("self" in item && item.self.properties.id !== this.args.id && this.enableAddinList.indexOf(item.obj.name) !== -1) {
          this.addinHash[item.self.properties.id] = item.obj;
        }
        for (var i = 0;i < item.elements.length;i++) {
          this.generatorAddinHash(item.elements[i]);
        }
        return this.addinHash;
      },


      /**
       * @description控件table
       */
      generatorAddinList(){
        this.formAddinData = [];
        let formAddinData = [];
        for(let key in this.addinHash){
          let addin = {
            addinId: this.addinHash[key].args.id,
            attrName: this.addinHash[key].args.name,
            attrLabel: this.addinHash[key].args.label,
            attrTitle: this.addinHash[key].name,
            dataTypes: this.addinHash[key].dataTypes,
            attrChain: this.attrChainCatch[key] || null,
          }
          formAddinData.push(addin);
        }
        try {
          formAddinData.sort((a, b) => {
            var x = a.addinId.toLowerCase();
            var y = b.addinId.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
          })
          this.formAddinData = formAddinData;
        }catch (e) {
          console.log(`id排序${e}`)
        }
      },

      /**
       * @description确认生成
       */
      confirmAttributeChain() {
        this.attributeChainModal = false;
        for(let key in this.attrChainCatch){
          if(!this.addinHash[key]){
            delete this.attrChainCatch[key];
          }
        }
        this.$emit('confirmAttributeChain', this.attrChainCatch);
      },
    }
  }
</script>
<style>
  .attributeChainModal .ivu-table-wrapper{
    overflow: visible!important;
  }
</style>
