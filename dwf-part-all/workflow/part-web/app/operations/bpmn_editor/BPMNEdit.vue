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
          style="display: none;"
      />
      <Button class="button" @click="()=>{this.$refs.openFileInputer.click()}">打开文件</Button>
      
			<Button class="button" @click="createNew">新建</Button>
      <Button class="button" @click="handleUndo">后退</Button>
      <Button class="button" @click="handleRedo">前进</Button>
      
		</div>
		<div id="js-canvas" :style="{'height':getHeight,'overflow':'scroll'}"></div>
		<div id="js-properties-panel"></div>

		<!-- <a-modal></a-modal> -->
	</div>
</template>
<script>
import BpmnModdler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import customTranslate from './customTranslate';

export default {
	name: 'bpmn',
	data() {
		return {
			bpmnModeler: null,
			canvas: null,
      bpmnText: '',
      diagramXml: '',
      scrollHeight: 0,
      file: null,
		}
  },
  computed:{
    getHeight(){
      return this.scrollHeight-150+'px';
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
    this.init();
	},
	methods: {
    init(){
           this.diagramXml = '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
      '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
          '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        '</bpmndi:BPMNShape>' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';
		this.$nextTick().then(() => {

			this.canvas = document.getElementById('js-canvas')
      // 汉化
      var customTranslateModule = {
        translate: [ 'value', customTranslate]
      };

			this.bpmnModeler = new BpmnModdler({
				container: this.canvas,
				keyboard: {
					bindTo: window
				},
				propertiesPanel: {
					parent: '#js-properties-panel'
				},
				additionalModules: [
          customTranslateModule,
					// 左边工具栏以及节点
          propertiesProviderModule,
          // 右边的工具栏
          propertiesPanelModule
				]
			})
			this.create()
		});
    },
    // 后退
    handleUndo() {
      this.bpmnModeler.get('commandStack').undo();
    },
    // 前进
    handleRedo() {
      this.bpmnModeler.get('commandStack').redo();
    },
    download(type, data, name) {
        let dataTrack = '';
        const a = document.createElement('a');

        switch (type) {
            case 'xml':
                dataTrack = 'bpmn';
                break;
            case 'svg':
                dataTrack = 'svg';
                break;
            default:
                break;
        }

        name = name || `diagram.${dataTrack}`;

        a.setAttribute(
            'href',
            `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
        );
        a.setAttribute('target', '_blank');
        a.setAttribute('dataTrack', `diagram:download-${dataTrack}`);
        a.setAttribute('download', name);

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
		saveXML() {
			this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
				if (xml) {
					this.download('xml', xml);
				}
			})
    },
    saveSVG(){ 
      this.bpmnModeler.saveSVG({ format: true }, (err, svg) => {
				if (svg) {
					this.download('svg', svg);
				}
			});
    },
    handleOpenFile (e){
      const that = this;
      this.file = e.target.files[0];
      if(this.file){
        const reader = new FileReader();
        let data = '';
        reader.readAsText(this.file);
        reader.onload = function(event) {
          data = event.target.result;
          that.renderDiagram(data);
        };
      }
    },
    renderDiagram(data){
      this.bpmnModeler.importXML(data, err => {
            if (err) {
                console.error({
                    message: '提示',
                    description: '导入失败',
                });
            }
      });
    },
		create() {
      this.bpmnText = this.diagramXml
      // 将字符串转换成图显示出来
			this.bpmnModeler.importXML(this.diagramXml, err => {
				if (err) {
					console.error(err);
				}
				this.bpmnModeler.get('canvas').zoom('fit-viewport')
				var eventBus = this.bpmnModeler.get('eventBus');

				var events = [
					'element.click',
					'element.dblclick'
				]
				events.forEach(event => {
					eventBus.on(event, (e) => {
					})
				})
			})

		},
		async createNew() {
      try {
        const result = await this.bpmnModeler.createDiagram();
        const { warnings } = result;
        console.log(warnings);
        this.bpmnModeler.get('canvas').zoom('fit-viewport')
				var eventBus = this.bpmnModeler.get('eventBus');

				var events = [
					'element.click',
					'element.dblclick'
				]
				events.forEach(event => {
					eventBus.on(event, (e) => {
						// console.log(event, 'on', e.element.id)
					})
				})
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
		}
	}
}
</script>
<style src='bpmn-js/dist/assets/diagram-js.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'></style>
<style src='bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'></style>
<style src='bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'></style>
<style scoped>
  #js-properties-panel{
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
  .djs-palette-entries{
    width: 64px !important;
  }
  .button-group {
    margin-top: 10px ;
    margin-left: 20px ;
  }
  .button-group .button{
    margin-right: 5px;
  }


</style>
