<template>
  <div style="width: 100%;min-height: 40px;padding:10px" :dropTarget="label.dropName+''" class="clearfix">
    <FormAddinList
      v-for="addinChildren in addin"
      v-bind="addinProps"
      :key="addinChildren.self.uuid"
      :addin="addinChildren"
    >

    </FormAddinList>
  </div>
</template>

<script>
import {uuid} from "@/util/assist";
export default {
  name: "TabPaneComponent",
  data(){
    return{

    }
  },
  props: [
    'label',
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
