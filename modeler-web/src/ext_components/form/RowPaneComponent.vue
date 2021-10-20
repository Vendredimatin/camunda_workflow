<template>
  <draggable
    class='dragArea addin-layout'
    draggable=".vue-draggable-addin"
    group='addin'
    :list="formAddinList"
    ghost-class="vue-draggable-ghost"
    @change='jsonDataChange'
  >
    <FormAddinList
      v-for="addin in addinElements"
      v-if="addin.self.dropTarget === row.id"
      :basicArgs="basicArgs"
      v-bind="addinProps"
      :key="addin.self.uuid"
      :addin="addin"
      :ref="`FormAddinList${addin.self.uuid}`"
      @activeAddin="activeAddin"
      @copyAddin="copyAddin"
      @removeAddin="removeAddin"
      @deleteAddin="deleteAddin"
      @commentAddin="commentAddin"
    >

    </FormAddinList>
  </draggable>
</template>

<script>
import {uuid} from "@/util/assist";
import draggable from "vuedraggable";
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

export default {
  name: "RowPaneComponent",
  data(){
    return{
      // formAddinList: [],
    }
  },
  props: [
    'row',
    'rows',
    'basicArgs',
    'addinProps',
    'addin',
    'originAddin'
  ],
  components: {
    draggable
  },
  inject: [
    'GenerateID',
  ],
  created() {
    // this.refreshFormAddinList();
  },
  computed: {
    addinElements(){
      return this.addin;
    },

    formAddinList(){
      return this.addin.length !== 0 ? this.addin.map(addin => {
        return {
          name: addin.self.elementType.replace('addin_', ''),
          uuid: addin.self.uuid,
          addin: addin,
        }
      }) : [];
    }
  },
  methods: {
    // refreshFormAddinList(){
    //   this.formAddinList = this.addin.length !== 0 ? this.addin.map(addin => {
    //     return {
    //       name: addin.self.elementType.replace('addin_', ''),
    //       uuid: addin.self.uuid,
    //       addin: addin,
    //     }
    //   }) : [];
    // },
    jsonDataChange(evt) {
      for (let type in evt) {
        switch (type) {
          case 'added':
            //判断是否已经是此多列控件内的控件
            this.existIndex = this.originAddin.elements.findIndex(ele => ele.self.uuid === evt.added.element.uuid);
            //如果从别的列拖入，阻止执行别的列的removed事件
            if(this.existIndex !== -1 && this.existIndex !== undefined){
              this.$emit('layoutSelfDrag');
            }
            if (evt.added.element.addin) {
              //非收藏控件拖入
              evt.added.element.addin.self.dropTarget = this.row.id;
              this.addin.splice(evt.added.newIndex, 0, evt.added.element.addin);
              this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
            } else if (evt.added.element.nameProps){
              //超级控件
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.nameProps}`,
                  properties: {
                    ...evt.added.element.argsProps,
                    id: this.GenerateID(evt.added.element.nameProps),
                    collectId: evt.added.element.oidProps,
                  },
                  dropTarget: this.row.id,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.splice(evt.added.newIndex, 0, addin);
              this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
            } else if(evt.added.element.groupOid){
              //小组件控件
              try {
                let addin = {
                  self: {
                    elementType: `addin_FormEngine`,
                    properties: {
                      bindTargetClass: "Component&e",
                      viewName: evt.added.element.viewName,
                      groupDisplayName: evt.added.element.groupDisplayName,
                      groupOid: evt.added.element.groupOid,
                      componentOid: evt.added.element.oid,
                      componentDisplayName: evt.added.element.displayName,
                    },
                    dropTarget: this.row.id,
                    uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                  },
                  elements: [],
                }
                this.addin.splice(evt.added.newIndex, 0, addin);
                this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
              }catch (e){
                console.error(`小组件控件${e}`)
              }
            } else if (evt.added.element.ISASSEMBLE) {
              //sdk控件
              let addin = {
                self: {
                  elementType: `addin_AssembleAddin`,
                  properties: {
                    _ASSEMBLECONFIG: evt.added.element
                  },
                  dropTarget: this.row.id,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              this.addin.splice(evt.added.newIndex, 0, addin);
              this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
            } else {
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.name}`,
                  properties: {},
                  dropTarget: this.row.id,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.splice(evt.added.newIndex, 0, addin);
              this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
            }
            this.$emit('snapShotHistory');
            break;
          case 'moved':
            //移动
            this.addin.move(evt.moved.oldIndex, evt.moved.newIndex);
            this.originAddin.elements = this.originAddin.elements.filter(element => element.self.dropTarget !== this.row.id).concat(this.addin);
            this.$emit('snapShotHistory');
            break;
          case 'removed':
            //判断是否已经是此多列控件内的控件
            // this.existIndex = this.originAddin.elements.findIndex(ele => ele.self.uuid === evt.removed.element.uuid);
            // //判断从一列移到另一列的情况，removeelement在本页面逻辑内完成，不再交于建模工具
            // if(this.existIndex !== -1 && this.existIndex !== undefined){
            //   this.existIndex = -1;
            //   break;
            // }
            this.$emit('removeAddin', evt.removed.element.uuid)
            break;
          default:
            break;
        }
      }
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID) {
      // if(!parentUUID){
      //   //点击复制按钮联动更新draggable的list
      //   let element = {
      //     name: addin.self.elementType.replace('addin_', ''),
      //     uuid: addin.self.uuid,
      //     addin: addin,
      //   }
      //   this.formAddinList.push(element);
      // }
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID, deleteButton){
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
  }
}
</script>

<style scoped>

</style>
