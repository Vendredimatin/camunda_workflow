<template>
  <div class="widget-action-view">
    <Button shape="circle" class="widget-action-delete" @click.stop="deleteAddin" icon="ios-trash" :class="{'vue-drag-item': classProp === 'vue-drag-item'}"
            title="删除"></Button>
    <Button shape="circle" class="widget-action-clone" @click.stop="copyAddin" icon="ios-copy" :class="{'vue-drag-item': classProp === 'vue-drag-item'}"
            title="复制"></Button>
  </div>
</template>

<script>
  export default {
    name: "addin_widget",
    props: [
      'classProp'
    ],
    data() {
      return {}
    },
    created() {

    },
    mounted() {
    },
    methods: {
      copyAddin() {
        this.$emit('copyAddin');
      },
      deleteAddin() {
        this.$emit('deleteAddin');
      },
      commentAddin() {

      }
    }
  }
</script>

<style scoped>
  .selected .widget-action-view {
    display: block;
  }

  .selected.addin-dragItem .widget-action-view {
    top: 20px;
    left: 1%;
  }

  .active.addin-dragItem .widget-action-view {
    top: 20px;
    left: -1%;
  }

  .widget-action-view {
    position: absolute;
    left: 0px;
    bottom: 0px;
    height: 0px;
    width: 100%;
    line-height: 28px;
    z-index: 8;
  }

  .widget-action-view .widget-action-delete {
    position: absolute;
    right: 3px;
    bottom: -18px;
    z-index: 1009;
    width: 35px;
    text-align: left;
    padding: 0px 10px;
    height: 35px;
    background: #FFEFF0;
    border: 1px solid #FBC6C6;
    color: #ED4014;
  }

  .widget-action-view .widget-action-clone {
    position: absolute;
    right: 40px;
    bottom: -18px;
    z-index: 1009;
    width: 35px;
    text-align: left;
    padding: 0px 10px;
    height: 35px;
    background: #EDF6FF;
    border: 1px solid #9BCEFF;
    color: #2D8CF0;
  }

  .widget-action-view .widget-action-clone:hover {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
  }

  .widget-action-view .widget-action-delete:hover {
    background: #f56c6c;
    border-color: #f56c6c;
    color: #fff;
  }

  .addin[addinname='Operation'] .widget-action-view .widget-action-delete {
    right: 0%;
  }

  .addin[addinname='Operation'] .widget-action-view .widget-action-clone {
    right: 36px;
  }
</style>
