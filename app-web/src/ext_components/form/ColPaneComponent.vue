<template>
  <div
    style="
      width: 100%;
      flex-wrap: inherit;
      align-items: inherit;
      justify-content: inherit;
      display: inherit;
    "
  >
    <FormAddinList
      v-for="addinChildren in addin"
      v-if="addinChildren.self.dropTarget === col.id"
      v-bind="addinProps"
      :key="addinChildren.self.uuid"
      :addin="addinChildren"
    >

    </FormAddinList>
  </div>
</template>

<script>
export default {
  name: "ColPaneComponent",
  data(){
    return{

    }
  },
  props: [
    'col',
    'addin',
    'query',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'route',
    'root',
    'Message',
    'echarts',
    'formEngine',
    'dwf_ctx',
  ],
  created() {

  },
  computed: {
    //初始化控件props
    addinProps() {
      return {
        store: this.store,
        itemValue: this.itemValue,
        query: this.query,
        attributes: this.attributes,
        relation: this.relation,
        route: this.route,
        root: this.root,
        Message: this.Message,
        echarts: this.echarts,
        formEngine: this.formEngine,
        dwf_ctx: this.dwf_ctx
      }
    },
  },
  watch: {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>
