<template>
<component v-bind:is="WfAdmin" :store="store" :route="route" :root="root"></component>
  <!-- <wf-edit :store="store" :route="route" :root="root"></wf-edit> -->
</template>

<script>
import Vue from "vue";

export default {
    props: ["store", "route","root"],
    data() {
      return{
        WfAdmin: null,
      };

    },
    created() {
      
    },
    mounted(){
    
      try {
          this.WfAdmin = require('../../assemble_components/operation/workflow/wf_editor/WfAdminEdit.vue').default;
        } catch (error) {
          console.error("未装配流程代码", error);
        }
    },
    methods:{},

}
</script>
