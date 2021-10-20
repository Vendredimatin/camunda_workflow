<template>
  <div class="widget-comment-view">
    <!--    <Icon type="md-move" />-->
    <Button class="widget-action-comment" :class="{active: active, 'vue-drag-item': classProp === 'vue-drag-item'}"  @click="commentAddin"  icon="ios-add" title="批注"></Button>
  </div>
</template>

<script>
  export default {
    name: "addin_comment_widget",
    props: [
      'active',
      'classProp'
    ],
    data() {
      return {
      }
    },
    created() {
    },
    mounted() {

    },
    methods: {
      commentAddin(){
        this.$emit('commentAddin');
      }
    }
  }
</script>

<style>
  .widget-action-comment .ivu-icon{
    margin: -6px 0 0 8px;
  }
</style>
<style scoped>
  .selected .widget-comment-view {
    display: block;
  }

  .selected.addin-dragItem .widget-comment-view {
    bottom: 20px;
  }

  .widget-comment-view {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 0px;
    width: 100%;
    line-height: 28px;
    z-index: 9;
  }
  .widget-comment-view .widget-action-comment{
    position: absolute;
    right: 0px;
    top: 0px;
    width: 0;
    border-radius: 0px;
    padding: 0px;
    margin: 0px;
    height: 0;
    color: #fff;
    background: transparent;
    border-style: solid;
    border-width: 0 20px 20px 0;
    border-color: transparent #FCB5B5 transparent transparent;
  }
  .widget-comment-view .widget-action-comment.active{
    border-color: transparent #ED4014 transparent transparent;
    color: transparent;
  }
  .widget-comment-view .widget-action-comment:focus{
    box-shadow: none;
  }
</style>
