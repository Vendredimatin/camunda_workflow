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
      v-for="addin in addin"
      v-if="addin.self.dropTarget === row.id"
      v-bind="addinProps"
      :key="addin.self.uuid"
      :addin="addin"
    >

    </FormAddinList>
  </div>
</template>

<script>
export default {
  name: "RowPaneComponent",
  components: {
  },
  data(){
    return{
    }
  },
  props: [
    'row',
    'addin',
    'addinProps',
  ],
  created() {

  },
  computed: {

  },
  methods: {
  }
}
</script>

<style scoped>

</style>
