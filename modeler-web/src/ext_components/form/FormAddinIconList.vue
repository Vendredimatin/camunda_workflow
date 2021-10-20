<template>
  <section :addinName="name" style="text-align: center">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <i class="iconfont" v-if="/^&#{1}/g.test(icon)" v-html="icon"></i>
        <Icon v-else :type="icon" />
      </div>
      <div v-if="note.length <= 4" class="form-addin-name">
          {{ note }}
      </div>
      <Tooltip class="form-addin-name" v-else-if="note === 'Html扩展'" :content="'Html扩展'" style="width: 100%;" :transfer="true">Html</Tooltip>
      <Tooltip class="form-addin-name" v-else-if="note === 'Echarts扩展'" :content="'Echarts扩展'" style="width: 100%;" :transfer="true">Echarts</Tooltip>
      <Tooltip class="form-addin-name" v-else :content="note" style="width: 100%;" :transfer="true">{{ note.substr(0, 3) }}...</Tooltip>
    </span>
  </section>
</template>

<script>
export default {
  name: "FormAddinIconList",
  data(){
    return{

    }
  },
  props: [
    'note',
    'icon',
    'name'
  ],
  components: {
  },
  created() {
  }
}
</script>

<style scoped>
  .iconfont{
    font-size: 12px !important;
  }
</style>
