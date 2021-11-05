<template>
  <div id="" style="">
    <div class="button-group">
      <Button class="button" @click="saveXML">保存到本地</Button>
      <Button class="button" @click="saveSVG">保存SVG</Button>
      <input
        ref="openFileInputer"
        className="openFile"
        type="file"
        @change="handleOpenFile"
        accept=".bpmn,"
        style="display: none"
      />
      <Button
        class="button"
        @click="
          () => {
            this.$refs.openFileInputer.click();
          }
        "
        >打开文件</Button
      >

      <Button class="button" @click="createNew">新建</Button>
      <Button class="button" @click="handleUndo">后退</Button>
      <Button class="button" @click="handleRedo">前进</Button>
      <Button class="button" @click="publish">发布</Button>
      <Button class="button" @click="saveTemplate">保存</Button>
      <Button class="button" @click="setExecutable">设置可执行性</Button>

    </div>
    <div
      id="js-canvas"
      :style="{ height: getHeight, overflow: 'scroll' }"
    ></div>
    <div id="js-properties-panel"></div>
    <properties-view
      v-if="bpmnModeler"
      :modeler="bpmnModeler"
      :propertyObj="propertyObj"
      :choose="choose"
    ></properties-view>

    <Modal v-model="releaseModal" title="发布流程" :mask-closable="false">
      <p v-if="propertyWfprocess != null">
        发布流程：{{ propertyWfprocess.name }}
      </p>
      <br />
      <Form ref="releaseForm" :model="releaseData" :rules="releaseRule">
        <FormItem prop="version">
          发布版本：
          <Input
            type="text"
            v-model="releaseData.version"
            placeholder="请输入版本号"
            style="width: 70%"
          ></Input>
        </FormItem>
        <FormItem prop="versionnote">
          发布声明：
          <Input
            type="textarea"
            v-model="releaseData.versionnote"
            placeholder="请输入发布说明"
            style="width: 70%"
          ></Input>
          <!-- <Input type="textarea" v-model="releaseData.versionnote"  :autosize="true" placeholder="请输入发布说明" style="width:70%"></Input> -->
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="releaseModal = false"
          >取消</Button
        >
        <Button type="primary" size="large" @click="onConfirmRelease"
          >确认</Button
        >
      </div>
    </Modal>
    <!-- <a-modal></a-modal> -->
  </div>
</template>
<script>
import BpmnModdler from "bpmn-js/lib/Modeler";
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import customTranslate from "./customTranslate";
import PropertiesView from "./properties-panel/PropertiesView";
import PropertyObject from "../model/PropertyObject";
import WfProcessTemplate from "../model/WfProcessTemplate";
import { releaseTemplate, saveTemplate, getTemplateById } from "../api/WfProcessApi";
import { forEach } from '../../../../libs/utils';

export default {
  name: "bpmn",
  props: ["store", "route", "root"],
  components: {
    PropertiesView,
  },
  data() {
    return {
      bpmnModeler: null,
      canvas: null,
      propertyObjs: new Map(),
      propertyObj: null,
      selectedElements: null,
      element: null,
      choose: null,
      releaseModal: false,
      bpmnText: "",
      diagramXml: "",
      scrollHeight: 0,
      file: null,
      propertyWfprocess: null,

      releaseData: {
        version: "", //发布版本
        versionnote: "", //发布声明
      },
      releaseRule: {
        version: [
          { required: true, message: "版本不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
            message: "版本名只能包含汉字、字母、数字、_、-、/或.",
            trigger: "blur",
          },
          {
            max: 32,
            message: "版本名不能超过32个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created(){
    var that = this;

    console.log("store:", this.store);
    let templateId = this.route.meta.id;
    
    getTemplateById(templateId).then((res) => {
            if (res.success) {
              this.propertyWfprocess = res.data;
              console.log("template", this.propertyWfprocess);
              console.log("xml", this.propertyWfprocess.bpmnXml);
              that.$Message.success("获取成功");

              this.init();
            } else {
              that.$Message.error("获取失败");
            }
    });
  },
  computed: {
    getHeight() {
      return this.scrollHeight - 150 + "px";
    },
  },
  mounted() {
    this.scrollHeight = document.documentElement.scrollHeight;
    var that = this;
    window.onresize = () => {
      return (() => {
        that.scrollHeight = document.documentElement.scrollHeight;
      })();
    };
    
  },
  methods: {
    init() {
      if(this.propertyWfprocess.bpmnXml == undefined)
        this.diagramXml = this.getDefaultXml();
      else 
        this.diagramXml = this.propertyWfprocess.bpmnXml;

      this.propertyObjs = new Map();
      

      this.$nextTick().then(() => {
        this.canvas = document.getElementById("js-canvas");
        // 汉化
        var customTranslateModule = {
          translate: ["value", customTranslate],
        };

        var camundaExtensionModule = require('camunda-bpmn-moddle/lib');
        var camundaModdle = require('camunda-bpmn-moddle/resources/camunda');

        this.bpmnModeler = new BpmnModdler({
          container: this.canvas,
          keyboard: {
            bindTo: window,
          },
          propertiesPanel: {
            parent: "#js-properties-panel",
          },
          additionalModules: [
            camundaExtensionModule,
            customTranslateModule,
            // 左边工具栏以及节点
            propertiesProviderModule,
            // 右边的工具栏
            // propertiesPanelModule
          ],
          moddleExtensions: {
            camunda: camundaModdle
          // authority: authorityModdleDescriptor
          }
        });
        this.create();

        this.bpmnModeler.on("selection.changed", (e) => {
          this.selectedElements = e.newSelection;
          this.element = e.newSelection[0];
          console.log("this.elemeent", this.element);
          // this.setDefaultProperties();

          this.updatePropertyObj();
        });

        this.bpmnModeler.on("element.changed", (e) => {
          const { element } = e;
          const { element: currentElement } = this;
          if (!currentElement) {
            return;
          }
          // update panel, if currently selected element changed
          if (element.id === currentElement.id) {
            this.element = element;
          }
        });
      });
    },
    getDefaultXml(){
      let  diagramXml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
        'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
        'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
        'targetNamespace="http://bpmn.io/schema/bpmn" ' +
        'id="Definitions_1">' +
        '<bpmn:process id="Process_1" isExecutable="false">' +
        '<bpmn:startEvent id="StartEvent_1"/>' +
        "</bpmn:process>" +
        '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
        '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
        '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        "</bpmndi:BPMNShape>" +
        "</bpmndi:BPMNPlane>" +
        "</bpmndi:BPMNDiagram>" +
        "</bpmn:definitions>";

        return diagramXml;
    },
    // 后退
    handleUndo() {
      this.bpmnModeler.get("commandStack").undo();
    },
    // 前进
    handleRedo() {
      this.bpmnModeler.get("commandStack").redo();
    },
    publish() {
      this.releaseModal = true;
    },
    download(type, data, name) {
      let dataTrack = "";
      const a = document.createElement("a");

      switch (type) {
        case "xml":
          dataTrack = "bpmn";
          break;
        case "svg":
          dataTrack = "svg";
          break;
        default:
          break;
      }

      name = name || `diagram.${dataTrack}`;

      a.setAttribute(
        "href",
        `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
      );
      a.setAttribute("target", "_blank");
      a.setAttribute("dataTrack", `diagram:download-${dataTrack}`);
      a.setAttribute("download", name);

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    saveXML() {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (xml) {
          this.download("xml", xml);
        }
      });
    },
    saveSVG() {
      this.bpmnModeler.saveSVG({ format: true }, (err, svg) => {
        if (svg) {
          this.download("svg", svg);
        }
      });
    },
    handleOpenFile(e) {
      const that = this;
      this.file = e.target.files[0];
      if (this.file) {
        const reader = new FileReader();
        let data = "";
        reader.readAsText(this.file);
        reader.onload = function (event) {
          data = event.target.result;
          that.renderDiagram(data);
        };
      }
    },
    renderDiagram(data) {
      this.bpmnModeler.importXML(data, (err) => {
        if (err) {
          console.error({
            message: "提示",
            description: "导入失败",
          });
        }
      });
    },
    create() {
      this.bpmnText = this.diagramXml;
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(this.diagramXml, (err) => {
        if (err) {
          console.error(err);
        }
        this.bpmnModeler.get("canvas").zoom("fit-viewport");
        var eventBus = this.bpmnModeler.get("eventBus");

        var events = ["element.click", "element.dblclick"];
        events.forEach((event) => {
          eventBus.on(event, (e) => {});
        });

        this.success()
      });

      
    },

    loadElements(){
      const elementRegistry = this.bpmnModeler.get("elementRegistry");
      const elements = elementRegistry.getAll();  
      this.propertyObjs = new Map();
      for(var i = 0; i < elements.length; i++){
        var element = elements[i];
        var businessObject = element.businessObject;
        let newPropertyObj = new PropertyObject();
        
        newPropertyObj.id = element.id;
        newPropertyObj.type = element.type;
        newPropertyObj.name = businessObject.name;
        if(element.type == "bpmn:UserTask"){
          newPropertyObj.participants = [];
          newPropertyObj.assignee = businessObject.assignee;
          if(businessObject.extensionElements != undefined){
            console.log("businessObject", businessObject);
            var camundaProperties = businessObject.extensionElements.values[0].values;
            for(var j = 0; j < camundaProperties.length; j++){
              var camundaProperty = camundaProperties[j];
              if(camundaProperty.name == "enClass")
                newPropertyObj.selectedClass = camundaProperty.value;
              else if(camundaProperty.name == "viewName"){
                newPropertyObj.selectedView = camundaProperty.value;
              }
            }
          }
        }
        this.propertyObjs.set(element.id, newPropertyObj);
      }

      console.log(this.propertyObjs);
    },


    success() {
      // 给图绑定事件，当图有发生改变就会触发这个事件
      const that = this
      this.bpmnModeler.on('commandStack.changed', function() {
        that.saveDiagram(function(err, xml) {
          that.loadElements();
          console.log(xml);
        })
      })

      //根据xml加载propertyObjs
      console.log("elementregistry", this.bpmnModeler.get("elementRegistry"));
      console.log("elementregistry elements", this.bpmnModeler.get("elementRegistry")._elements);
      this.loadElements()
    },

    saveDiagram(done) {
      // 把传入的done再传给bpmn原型的saveXML函数调用
      this.bpmnModeler.saveXML({ format: true }, function(err, xml) {
        done(err, xml)
      })
    },

    async createNew() {
      try {
        const result = await this.bpmnModeler.createDiagram();
        const { warnings } = result;
        console.log(warnings);
        this.bpmnModeler.get("canvas").zoom("fit-viewport");
        var eventBus = this.bpmnModeler.get("eventBus");

        var events = ["element.click", "element.dblclick"];
        events.forEach((event) => {
          eventBus.on(event, (e) => {
            // console.log(event, 'on', e.element.id)
          });
        });
      } catch (err) {
        console.log(err.message, err.warnings);
      }

      // this.bpmnModeler.createDiagram(err => {
      // 	if (err) {
      // 		throw (err)
      // 	}
      // 	this.bpmnModeler.get('canvas').zoom('fit-viewport')
      // 	var eventBus = this.bpmnModeler.get('eventBus');

      // 	var events = [
      // 		'element.click',
      // 		'element.dblclick'
      // 	]
      // 	events.forEach(event => {
      // 		eventBus.on(event, (e) => {
      // 			// console.log(event, 'on', e.element.id)
      // 		})
      // 	})
      // })
    },

    updatePropertyObj() {
      if (this.element) {
        if (!this.propertyObjs.has(this.element.id)) {
          let newPropertyObj = new PropertyObject();
          newPropertyObj.id = this.element.id;
          newPropertyObj.type = this.element.type;
          newPropertyObj.selectedClass = "";
          newPropertyObj.selectedView = "";
          newPropertyObj.name = "";
          newPropertyObj.participants = [];

          this.propertyObjs.set(this.element.id, newPropertyObj);
        }

        this.propertyObj = this.propertyObjs.get(this.element.id);
        this.choose = true;
        console.log(this.propertyObj)
      } 
    },
    onConfirmRelease() {
      this.$refs["releaseForm"].validate((valid) => {
        console.log(valid);

        if (valid) {
          this.releaseProcess();
        } else {
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    releaseProcess() {
      var that = this;

      let releasedTemplate = new WfProcessTemplate()
      releasedTemplate.code = this.propertyWfprocess.code;
      releasedTemplate.name = this.propertyWfprocess.name;
      releasedTemplate.authorId = this.propertyWfprocess.authorId;
      releasedTemplate.author = this.propertyWfprocess.author;
    
      releasedTemplate.version = that.releaseData.version;
      releasedTemplate.description = that.releaseData.versionnote;
      releasedTemplate.releaser = that.store.state.user.username;
      releasedTemplate.releaserId = that.store.state.user.userId;
      releasedTemplate.releaseDate = new Date().getTime();

      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (xml) {
          this.propertyWfprocess.bpmnXml = xml;
          releaseTemplate(this.propertyWfprocess).then((res) => {
            console.log("res", res);
            if (res.success) {
              that.$Message.success("发布成功");
              that.releaseModal = false;
            } else {
              that.$Message.error("发布失败，该版本已存在");
            }
          });
        }
      });
    },


    saveTemplate() {
      let that = this;

      this.propertyWfprocess.releaser = that.store.state.user.username;
      this.propertyWfprocess.releaserId = that.store.state.user.userId;

      console.log("save", this.propertyWfprocess);

      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (xml) {
          this.propertyWfprocess.bpmnXml = xml;
          saveTemplate(this.propertyWfprocess).then((res) => {
            if (res.success) {
              //map[that.propertyWfprocess.id].stack.save();
              that.$Message.success("保存成功");
            } else {
              that.$Message.error("保存失败");
            }
          });
        }
      });
    },

    setExecutable() {
              this.modeling = this.bpmnModeler.get('modeling')

      const elementRegistry = this.bpmnModeler.get("elementRegistry"); 
      const process = elementRegistry.get("Process_1");
      this.modeling.updateProperties(process,{
            isExecutable : true
      })
    }
  },
};
</script>
<style src='bpmn-js/dist/assets/diagram-js.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'></style>
<style src='bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'></style>
<style scoped>
#js-properties-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
}
/* #js-canvas {
    height: 700px;
  } */
#js-canvas .djs-palette.two-column.open {
  width: 64px !important;
}
.djs-palette-entries {
  width: 64px !important;
}
.button-group {
  margin-top: 10px;
  margin-left: 20px;
}
.button-group .button {
  margin-right: 5px;
}
</style>
