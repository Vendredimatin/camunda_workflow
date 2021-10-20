<template>
  <span
    :class="definition.type === 'index' ? 'simple-table-index-column-config-icon' : 'simple-table-column-config-icon'"
    @mouseover="iconShow = true"
    @mouseout="iconShow = false"
    @click="handleHeaderConfig"
  >
    <Icon v-show="iconShow" type="md-menu"/>
  </span>
</template>


<script>
const name = "SimpleTableColumnHeader";
export default {
  name: name,
  props: [
    'definition',
    'type',
  ],
  data() {
    return {
      iconShow: false,
    };
  },

  mounted() {

  },

  created() {

  },

  methods: {
    /**
     * @author LiuBo
     * @method
     * @name handleTableColumnHeaderConfig
     * @private 点击表格列配置
     * @description
     */
    handleHeaderConfig(){
      if(this.type === 'column'){
        this.$emit('handleTableColumnHeaderConfig', this.definition)
      }else{
        this.$emit('handleTableOprColumnHeaderConfig', this.definition)
      }
    },
  },
  computed: {

  },
}
</script>

<style scoped>
.simple-table-index-column-config-icon{
  width: 15px;
  height: 20px;
  float: right;
  text-align: right;
  cursor: pointer;
}

.simple-table-column-config-icon{
  width: 30px;
  height: 20px;
  float: right;
  text-align: right;
  cursor: pointer;
}
</style>
