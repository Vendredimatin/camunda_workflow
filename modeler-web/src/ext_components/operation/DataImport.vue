<template>
    <section>
    </section>
</template>
<script>

const name = "DataImport";

export default {
    name: name,
    data() {
        return {
            name: name,
            t_edit: false,
            args: {
                type: "default",
                shape: false,
                text: "新增"
            }
        }
    },
    methods: {
        canShow() { return false },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },     
    },
}
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
p {
  margin: 10px 0;
}
</style>