<template>
  <div class="about">
    <Button icon="md-arrow-round-back" class="turnIndex" @click="toIndex">返回首页</Button>
    <iframe :src="guide_path" frameborder="0" style="width: 100%; height: 100vh;"></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // guide_path: `${window.location.host}/modeler-web/helps/dwf_script_guide.html`
      guide_path: `http://192.168.1.81:8180/modeler-web/helps/DWF%20Kernel%203.0%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91%E5%BF%AB%E9%80%9F%E6%8C%87%E5%AF%BC%E8%AF%B4%E6%98%8E%E4%B9%A6.html`
    }
  },
  methods: {
    toIndex() {
      this.$router.push({ name: "home" });
    }
  }
}
</script>

<style scoped>
  .turnIndex {
    position: absolute;
    top: 20px;
    left: 20px;
  }
</style>

