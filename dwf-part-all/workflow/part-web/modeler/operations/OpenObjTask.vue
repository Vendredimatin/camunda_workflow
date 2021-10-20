<template>
    <section v-if="t_edit">
        <Button style="margin-right: 10px" :type="args.type" :shape="args.shape ? 'circle' : null" @click="t_edit = false">取消</Button>
        <Button :type="args.type" :shape="args.shape ? 'circle' : null" @click="t_edit = false">保存</Button>
    </section>
    <section v-else>
        <Button :type="args.type" :shape="args.shape ? 'circle' : null" @click="t_edit = true">编辑</Button> 
    </section>
</template>

<script>
const name = "OpenObjTask";
export default {
    name: name,
    data() {
        return {
            name: name,

            t_edit: false,

            args: {
                type: "default",
                shape: false,
                text: "打开流程"
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
    }
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