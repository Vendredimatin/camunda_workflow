<template>
  <div class="custom-tooltip">
    <p v-html="html"></p>
  </div>
</template>

<script>
  import Vue from 'vue';

  export default Vue.extend({
    data: function () {
      return {
        color: null,
        athlete: null,
        country: null,
        total: null,
        html: null,
      };
    },
    beforeMount() {
      var data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex);
      console.log(this.params)
      data.html = this.params.html || '';
      this.setState(data);
    },
    mounted() {

    },
    methods: {
      setState(obj) {
        Object.assign(this, obj);
      },
    },
    watch: {
      html(val){
        console.log(val)
      },
      params(val){
        console.log(val)
      }
    }
  });
</script>
