<template>
    <section>  
    </section>
</template>
<script>

const name = "WebSocketDemo";

export default {
    name: name,
    props: ['itemValue', 'store'],
    data() {
        return {
            name: name,
            args: {
                type: "default",
                shape: false,
                text: "新增"
            },
            addins: [],
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
    mounted(){
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