<template>
  <Button type="primary" style="margin: 5px" @click="$emit('click')">
    <slot></slot>
  </Button>
</template>

<script>
export default {
  name: "EditObj",
  props: ["click"]
};
</script>

<style scoped>
</style>
