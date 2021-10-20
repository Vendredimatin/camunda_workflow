<template>
  <div style="display: inline-block; width: 100%">
    <Select class="margin1" v-model="attrChainSelect" filterable clearable @on-change="handleSelectAttrChain" >
      <OptionGroup label="系统属性" v-if="attributes_sys">
        <Option v-for="(attr, index) in attributes_sys" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
      <OptionGroup label="类属性" v-if="attributes_def">
        <Option v-for="(attr, index) in attributes_def" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
      <OptionGroup label="关联类系统属性" v-if="attributes_relationSys">
        <Option v-for="(attr, index) in attributes_relationSys" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
      <OptionGroup label="关联类属性" v-if="attributes_relationDef">
        <Option v-for="(attr, index) in attributes_relationDef" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
      <OptionGroup label="左类属性" v-if="attributes_leftDef">
        <Option v-for="(attr, index) in attributes_leftDef" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
      <OptionGroup label="右类属性" v-if="attributes_rightDef">
        <Option v-for="(attr, index) in attributes_rightDef" :value="attr.attributeName"
                :key="index || ''" :label="attr.displayName"></Option>
      </OptionGroup>
    </Select>
  </div>
</template>
<script>

  export default {
    props: [
      'dataTypes',
      'attrChain',
      'attributes',
      'isRelation',
      'refClassAttributes_sys',
      'refClassAttributes_def',
      'refClassAttributes_relationSys',
      'refClassAttributes_relationDef',
      'refClassAttributes_leftDef',
      'refClassAttributes_rightDef'
    ],
    data() {
      return {
        attrChainSelect: '',
      }
    },
    created() {
      this.$store = this.store;
      this.attrChainSelect = this.attrChain;
    },
    mounted() {
      console.log(this.refClassAttributes_sys)
    },
    computed: {
      attributes_sys(){
        return this.refClassAttributes_sys ? this.refClassAttributes_sys.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },

      attributes_def(){
        return this.refClassAttributes_def ? this.refClassAttributes_def.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },

      attributes_relationSys(){
        return this.refClassAttributes_relationSys ? this.refClassAttributes_relationSys.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },

      attributes_relationDef(){
        return this.refClassAttributes_relationDef ? this.refClassAttributes_relationDef.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },

      attributes_leftDef(){
        return this.refClassAttributes_leftDef ? this.refClassAttributes_leftDef.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },

      attributes_rightDef(){
        return this.refClassAttributes_rightDef ? this.refClassAttributes_rightDef.filter(attr => this.dataTypes.indexOf(attr.valueType) > -1) : null;
      },
    },
    watch: {

    },
    methods: {
      handleSelectAttrChain(){
        this.$emit('handleSelectAttrChain', this.attrChainSelect)
      },

    }
  }
</script>
