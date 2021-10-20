<template>
    <div class="create self-form-layout" style="height: 100%;">
        <!-- <h2 class="title">{{title}}</h2> -->
        <FormEngine ref="form" :to_path='rpath' :to_query="rquery" :store="store" :root="root" :echarts="echarts"></FormEngine>
    </div>
</template>

<script>
    import FormEngine from '../form-engine/forms-engine.vue'
    export default {
        name: 'single',
        components:{ FormEngine },
        props: ['route', 'store', 'root', 'query', 'echarts'],
        data() {
            return {
                title:'',
                rpath:'',
                rquery:{query: ""},
                urlName:''
            }
        },
        created () {
            console.log("!!", this.route);
            if (this.route.meta.targetClass && this.route.meta.viewName) {
                this.rpath = `/forms/${this.route.meta.targetClass}/${this.route.meta.viewName}`;
                this.rquery = this.route.meta.condition == "" ? this.route.query : {query: this.route.meta.condition};
            }
            if (this.query) this.rquery = this.query;
            if(!'query' in this.rquery || this.rquery.query == '' || !this.rquery.query) {
                let hasSearch = sessionStorage.getItem('searchQuery') || '';
                this.rquery.query = hasSearch;
            }
            if (!this.rquery.params) this.rquery.params = {};
            if (this.route.meta.params && this.route.meta.params.length > 0) {
                this.rquery.params.initScript = this.route.meta.params.split("APP_afterScript:")[0].replace("APP_beforeScript:", "");
                this.rquery.params.initScriptNeed = true;
            }
          this.rquery.params.needDefOpr = this.route.meta.needDefOpr;
          this.rquery.params.needDefOprAction = this.route.meta.needDefOprAction;
            this.rquery.displayType = "visit";
            console.log("created:", this.rquery);
        },
        mounted() {
            console.log("mounted");
        },
        methods: {
            activate() {
                this.$refs.form.activate();
            },
            collMenu() {
                this.$refs.form.collMenu();
            }
        }
    }
</script>

<style lang="less" scoped>
.create{
    background-color: #fff;
    // .title{
    //     margin: 10px 0px 20px 30px;
    // }
}
</style>
