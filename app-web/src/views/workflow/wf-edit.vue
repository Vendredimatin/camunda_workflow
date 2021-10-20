<template>
<component v-bind:is="WfEdit" :store="store" :route="route" :root="root"></component>
  <!-- <wf-edit :store="store" :route="route" :root="root"></wf-edit> -->
</template>

<script>
import Vue from "vue";

const name = "wf-edit";

export default {
    props: ["store", "route","root"],
    data() {
      return{
        WfEdit: null,
      };
    },
    mounted(){
    
      try {
            this.WfEdit = require('../../assemble_components/operation/workflow/bpmn_editor/BPMNEdit.vue').default;
            // this.WfEdit = require('../../assemble_components/operation/workflow/wf_editor/WfEdit.vue').default;
            // Vue.component('wf-edit', this.WfEdit);
        } catch (error) {
          console.error("未装配流程代码", error);
        }
    },
    methods:{},

}
</script>
