<template>
  <Row type="flex" justify="start">
    <Col v-for="(view,index) in viewData" span="2" >
      <!--emit事件-->
      <form-icon-wrapper :targetId="view.oid" :hasClickMenu="index%2===1" :title="view.viewName"
                         :img-url="[form1,form2]" @h-model="hModel"></form-icon-wrapper>
    </Col>
  </Row>
</template>

<script>

  import formIconWrapper from './inner-icon-wrapper'
  import form1 from "../../../assets/images/form-management/表单-1.png"
  import form2 from "../../../assets/images/form-management/表单-2.png"

  export default {
    name: "formTableExpand",
    data() {
      return {form1, form2}
    },
    props: {viewData: Array},
    components: {formIconWrapper},
    methods:{
      hModel(url){
        console.log('handel 2');
        this.$emit("handel-model",url);
      }
    }
  }
</script>

<style scoped>

</style>
