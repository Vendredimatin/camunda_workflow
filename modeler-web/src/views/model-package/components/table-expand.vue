<template>
    <div>
        <tree-table
            ref="table"
            class="assembel-table"
            index-text="#"
            :data="row"
            :columns="columns"
            :selectable="false"
            :tree-type="true"
            :expand-type="false"
            :is-fold="true"
            expand-key="name">
            <template slot="loadBtn" slot-scope="scope">
                <Button id="test1" type="text" icon="md-download"></Button>
                <Button id="test2" type="text" icon="ios-power"></Button>
            </template>
        </tree-table>
    </div>
</template>
<script>
    export default {
        props: {
            row: Object
        },
        data() {
            return {
                columns: [
                    {
                        title: '英文名',
                        key: 'name'
                    },
                    {
                        title: '插件名',
                        key: 'cname'
                    },
                    {
                        title: '状态',
                        key: 'status'
                    },
                    {
                        title: '创作者',
                        key: 'author'
                    },
                    {
                        title: '备注',
                        key: 'note'
                    },
                    {
                        title: '操作',
                        key: 'loadBtn',
                        minWidth: '200px',
                        type: 'template',
                        template: 'loadBtn',
                    }
                ]
            }
        }
    };
</script>
<style scoped>
    .assembel-table>>>th,
    .assembel-table>>>td {
        text-align: center;
    }
</style>