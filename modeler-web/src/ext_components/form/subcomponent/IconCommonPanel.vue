<template>
    <div>
        <Modal
            v-model="iconModal"
            width="800"
            :mask-closable="false"
            title="设置标签"
            >
            <Row class="lableTxt">
                <Col span="2">
                    <span>图标集合</span>
                </Col>
                <Col span="20" offset="1" style="padding-right:3%">
                    <Input v-model="selfIconLabel" type="textarea" :autosize="true" />
                </Col>
            </Row>
            <p class="attrTitle">通用图标:</p>
            <div class="attrBox">
                <Button v-for="item in iconList" :key="item.value" class="check-item" :icon="item.value" @click="addIconName(item.label)">{{ item.label }}</Button>
            </div>
            <p class="attrTitle">功能图标:</p>
            <div class="attrBox">
                <Button v-for="x in iList" :key="x.value" class="check-item" @click="addIconName(x.value)">
                    <i class="iconfont" :class="x.value" style="margin-right: 4px;"></i>
                    {{ x.label }}
                </Button>
            </div>
            <div slot="footer">
                <Button type="text" @click="iconModal = false">取消</Button>
                <Button type="primary" @click="confirmIcon">确认</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
import fontIconData from "@/views/functional-model/components/iFontIcon.js";

    export default {
        data() {
            return {
                iconModal: false,
                selfIconLabel: '',
                iconList: [],
                iList: []
            }
        },
        created() {

            this.iconList = moduleIconData;
            this.iList = fontIconData;

        },
        methods: {
            editModal(arr, label) {

                this.selfIconLabel = label;
                this.iconModal = true;

            },

            /** 
             * @description 点击每个图标 辅助添加label名称
            */
            addIconName(label) {
                this.selfIconLabel = `${this.selfIconLabel}:${label},`;
            },
            
            /** 
             * @description 确认选择图表合集 回传数据
            */
            confirmIcon() {
                this.iconModal = false;

                if(this.selfIconLabel.length > 0 && this.selfIconLabel.slice(-1) == ',') {
                    this.selfIconLabel = this.selfIconLabel.substr(0, this.selfIconLabel.length - 1);
                }

                this.$emit("transferIcon", this.selfIconLabel);
            }
        }
    }
</script>
<style scoped>
.lableTxt {
    padding-bottom: 14px;
    margin-bottom: 5px;
}
.attrTitle {
    color: #000;
}
.attrBox {
    height: 190px;
    overflow-y: auto;
    margin-bottom: 10px;
}

.check-item {
    width: 31%; 
    margin: 3px;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow: ellipsis;
}
</style>