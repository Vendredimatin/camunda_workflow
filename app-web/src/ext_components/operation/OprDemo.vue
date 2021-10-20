<template>
    <section>
    <Modal
      v-model="previewModal"
      title="预览表单"
      width="1000px">
      <iframe src="http://www.baidu.com" style="width: 100%;height:600px"></iframe>
    </Modal>
    <section v-if="t_edit">
        <Button style="margin-right: 10px" :type="args.type" :icon="args.icon" :disabled="args.disabled" :style="{'color': args.disabled ? '#bbbec4' : args.main_fontColor, 'width': arg_width, 'height': arg_height}" :shape="args.shape ? 'circle' : null" @click="cancel">取消</Button>
        <Button :type="args.type" :icon="args.icon" :disabled="args.disabled" :style="{'color': args.disabled ? '#bbbec4' : args.main_fontColor, 'width': arg_width, 'height': arg_height}" :shape="args.shape ? 'circle' : null" @click="save">保存</Button>
    </section>
    <section v-else>
        <Button :type="args.type" :icon="args.icon" :disabled="args.disabled" :style="{'color': args.disabled ? '#bbbec4' : args.main_fontColor, 'width': arg_width, 'height': arg_height}" :shape="args.shape ? 'circle' : null" @click="edit">编辑</Button> 
    </section>
    </section>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
const name = "OprDemo";
export default {
    name: name,
    props: ['itemValue', 'store'],
    data() {
        return {
            previewModal: false,
            name: name,

            t_edit: false,

            args: {
                opr_path: "",
                name: "",
                style: "",
                targetDataType: null,
                type: "default",
                shape: false,
                hided: false,
                icon: "",
                text: "操作",
                width:  "auto",
                widthType: "px",
                heightType: "px",
                height: 34,
                color: "#000",
                disabled: false,
                auth : false,    // 是否开启授权
                title: "操作",
                id : "",
                chooseTable: []             // 按钮需要控制的表格

            },

            addins: [],
        }
    },
    computed: {
      arg_width() {
        return this.args.width == "auto" ? 'auto' : this.args.width + this.args.widthType ;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      }
    },
    created() {
        this.$store = this.store;
        this.addins = this.GetAllAddin();
    },
    methods: {
        ...mapActions("DWF_form", ["saveEObj"]),
        canShow() { return true },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },
        edit() {
            this.addins.forEach(x => {
                if (x.t_create != null) x.setDisplayType("edit");
            });
            this.t_edit = true;
        },
        cancel() {
            this.t_edit = false;
            this.addins.forEach(x => {
                if (x.getFormName) {
                    var name = x.getFormName();
                    if (name && name in this.itemValue.origin && x.setValue) {
                        x.setValue(this.itemValue.origin[name]);
                    }
                }
            });
        },
        save() {
            this.previewModal = true;
            this.t_edit = false;
            // var obj = this.getObj(this.itemValue.data);
            // this.onHandle([obj], { className: this.itemValue.data.targetClass });
            // this.t_edit = false;
        },
        async onHandle(params) {
            var newObj = {
                className: params.className,
                obj: params.obj
            };
            try {
                await this.saveEObj(newObj);
            } catch (e) {
                console.log(e);
            }
        }
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