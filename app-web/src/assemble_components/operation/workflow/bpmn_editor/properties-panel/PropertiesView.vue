<template>
  <div class="custom-properties-panel">
    <!-- <div class="empty" v-if="obj != undefined">请选择一个元素</div> -->
    <!-- <div class="empty" v-else-if="selectedElements.length > 1">
      只能选择一个元素
    </div> -->
    <p>{{ propertyObj.id }}</p>

    <div v-if="propertyObj == undefined">
      <!-- <div v-if="!editable" class="margin1">
          版本名：{{ propertyObj.version }}
        </div>
        <div v-if="!editable">当前状态：{{ propertyObj.statusTypy }}</div>
        <div class="margin1">绑定实体类：{{ propertyObj.bindEnClassName }}</div>
        <div class="margin1">创建人：{{ propertyObj.author }}</div>
        <div v-if="!editable">流程状态：:{{propertyObj.status}}<div>
        <div v-if="!editable">
          <div class="margin1">
            开始时间：{{
              new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")
            }}
          </div>
          <div class="margin1">
            最后更新：{{
              new Date(propertyObj.lastupdate).format("yyyy-MM-dd hh:mm:ss")
            }}
          </div>
        </div>
        <div v-else class="margin1">
          最后更新：{{
            new Date(propertyObj.lastupdate).format("yyyy-MM-dd hh:mm:ss")
          }}
        </div> -->
    </div>
    <div v-else>
      <!-- <div v-if="isProcess">
        
      </div> -->
      <div v-show="propertyObj.type == 'bpmn:StartEvent'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <div>
          <p class="margin1">名称</p>
          <Input placeholder="名称" />
        </div>
      </div>

      <div v-show="propertyObj.type == 'bpmn:SequenceFlow'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <div>
          <p class="margin1">名称</p>
          <Input v-model="propertyObj.name" placeholder="名称" @on-change="changeElementName" />
        </div>
        <div>
          <p class="margin1">表达式</p>
          <Input v-model="propertyObj.expression" placeholder="Expression" @on-change="changeExpression" />
        </div>
      </div>

      <div v-show="propertyObj.type == 'bpmn:BoundaryEvent'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <div>
          <p class="margin1">定时器定义</p>
          <Input placeholder="Expression" @on-change="changeTimerDefinition" />
        </div>
      </div>

      <div v-show="propertyObj.type == 'bpmn:UserTask'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <!-- <div>当前状态：{{propertyObj.statusType}}</div>
              <div v-show="propertyObj.status == 3">
                  <div>开始时间：{{new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
              </div> -->
        <div>
          <p class="margin1">名称</p>
          <Input
            v-model="propertyObj.name"
            @on-change="changeElementName"
            placeholder="名称"
          />
        </div>
        <div>
          <p class="margin1">目标类:</p>
          <Select
            v-model="propertyObj.selectedClass"
            @on-change="changeSelectedClass"
            clearable
            filterable
          >
            <Option
              v-for="entity in entities"
              :value="entity.className"
              :key="entity.className"
              >{{ entity.className }}
            </Option>
          </Select>
        </div>

        <div>
          <p class="margin1">分配人</p>
          <Input :value="propertyObj.assignee" />
        </div>

        <div>
          <p class="margin1">候选人</p>
          <Input v-model="propertyObj.candidateUsers" @on-change="changeProperty($event,candidateUsersType)"/>
        </div>
        <div>
          <p class="margin1">候选组</p>
          <Input v-model="propertyObj.candidateGroups" @on-change="changeProperty($event,candidateGroupsType)"/>
        </div>

        <div class="margin1">
          绑定表单：
          <!--           <Input v-model="propertyObj.selectedView" @on-change="changeSelectedView"  placeholder="表单"/>
 -->
          <Select
            v-model="propertyObj.selectedView"
            @on-change="changeSelectedView"

            clearable
            filterable
          >
            <Option
              v-for="view in selectViews"
              :value="view.viewName"
              :key="view.viewName"
              >{{ view.viewName }}
            </Option>
          </Select>
        </div>
        <div class="margin1">
          前处理操作：
          <Select clearable filterable>
            <Option></Option>
          </Select>
        </div>
        <div class="margin1">
          后处理操作：
          <Select clearable filterable>
            <Option></Option>
          </Select>
        </div>

        <Button
          class="self-btn"
          @click="showProcessEditPanel"
          v-if="haveAdvancedProperties"
          >编辑高级属性</Button
        >
      </div>

      <div v-show="propertyObj.type == 'bpmn:ScriptTask'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <!-- <div>当前状态：{{propertyObj.statusType}}</div>
              <div v-show="propertyObj.status == 3">
                  <div>开始时间：{{new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
              </div> -->
        <div>
          <p class="margin1">名称</p>
          <Input
            v-model="propertyObj.name"
            @on-change="changeElementName"
            placeholder="名称"
          />
        </div>
        <div>
          <p class="margin1">Script format</p>
          <Select
            v-model="propertyObj.scriptFormat"
            @on-change="changeProperty($event, scriptFormatType)"
            clearable
            filterable
          >
            <Option
              v-for="item in scriptFormats"
              :value="item.language"
              :key="item.language"
              >{{ item.language }}
            </Option>
          </Select>
        </div>


        <div>
          <p class="margin1">Script</p>
          <Input v-model="propertyObj.script" type="textarea"  @on-change="changeScript"/>
        </div>

        <div>
          <p class="margin1">Result Variable</p>
          <Input
            v-model="propertyObj.resultVariable" 
            @on-change="changeProperty($event, resultVariableType)"
            placeholder="结果变量"
          />
        </div>
      </div>

      <div v-show="propertyObj.type == 'bpmn:ExclusiveGateway'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <div>
          <p class="margin1">名称</p>
          <Input placeholder="名称" />
        </div>
        <div>
          <p class="margin1">监听</p>
          <Input placeholder="条件" />
        </div>
      </div>

      <div v-show="propertyObj.type == 'bpmn:EndEvent'">
        <div>
          <label>id</label>
          <span>{{ propertyObj.id }}</span>
        </div>
        <div>
          <p class="margin1">名称</p>
          <Input placeholder="名称" />
        </div>
      </div>
    </div>

    <Modal
      v-model="processEditPanel"
      :mask-closable="false"
      title="高级属性"
      width="1200"
      height="500"
    >
      <Tabs v-show="propertyObj.type == 'bpmn:UserTask'" value="name1">
        <!-- <TabPane label="对象属性" name="name1">
                    <Table :columns="taskVariableCol" :data="taskVariable" :height="scrollHeight*0.5"></Table>
                </TabPane> -->
        <TabPane
          v-show="propertyObj.type == 'bpmn:UserTask'"
          label="办理人"
          name="name2"
        >
          <div style="margin: 8px 0">
            <org-user-selector
              :havelauncher="true"
              ref="participantSelector"
              style="display: inline-block; margin-right: 10px"
            />
            <Button @click="addParticipant">添加</Button>
          </div>
          <Table
            :columns="participantCol"
            :data="propertyObj.participants"
            :height="scrollHeight * 0.5"
          ></Table>
        </TabPane>
      </Tabs>
    </Modal>
  </div>
</template>

<script>
import OrgUserSelector from "../../sub_components/orgUserSelector";
import { START_EVENT } from "bpmn-js/lib/features/replace/ReplaceOptions.js";
import { getAllEntities, getViews } from "@/api/others.js";
export default {
  name: "PropertiesView",
  props: {
    modeler: {
      type: Object,
      default: () => ({}),
    },
    propertyObj: {
      type: Object,
    },
    choose: null,
  },
  components: { OrgUserSelector },
  data() {
    return {
      element: null,
      entities: null,
      forms: null,
      selectViews: null,
      candidateUsersType: "candidateUsers",
      candidateGroupsType: "candidateGroups",
      scriptFormatType :"scriptFormat",
      resultVariableType :"camunda:resultVariable",
      haveAdvancedProperties: true,
      scrollHeight: 1000,
      processEditPanel: false,
      eventTypes: [
        { label: "默认", value: "" },
        {
          label: "MessageEventDefinition",
          value: "bpmn:MessageEventDefinition",
        },
        { label: "TimerEventDefinition", value: "bpmn:TimerEventDefinition" },
        {
          label: "ConditionalEventDefinition",
          value: "bpmn:ConditionalEventDefinition",
        },
      ],
      eventType: "",
      taskTypes: [
        { label: "Task", value: "bpmn:Task" },
        { label: "ServiceTask", value: "bpmn:ServiceTask" },
        { label: "SendTask", value: "bpmn:SendTask" },
        { label: "UserTask", value: "bpmn:UserTask" },
      ],
      taskType: "",
      serviceTaskImpl:{
        name:''
      },
      serviceTaskImplList:[
        {name : 'Expression'}, {name : 'External'}, {name : 'connector'}
      ],
      scriptFormats:[
        {language:'groovy'}, {language: 'javascript'}
      ],
      participantCol: [
        {
          title: "类型",
          key: "participantType",
          render: (h, params) => {
            var parType;
            if (params.row.participantType == "user") parType = "用户";
            else if (params.row.participantType == "group") parType = "用户组";
            else if (params.row.participantType == "launcher")
              parType = "发起人";
            return h("span", parType);
          },
        },
        {
          title: "显示名",
          key: "displayName",
        },
        {
          title: "英文名",
          key: "name",
        },
        {
          title: "id",
          key: "oid",
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                    disabled: !this.editable,
                  },
                  on: {
                    click: () => {
                      this.removeParticipant(params.index);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      const { modeler } = this;
      console.log("modeler", modeler);
      console.log(START_EVENT);
      this.modeling = this.modeler.get("modeling");
      this.moddle = this.modeler.get("moddle");
      this.getEntities();
    },

    /**
     * 改变控件触发的事件
     * @param { Object } input的Event
     * @param { String } 要修改的属性的名称
     */
    changeField(event, type) {
      console.log(event);
      console.log(type);
      const value = event.target.value;
      this.element[type] = value;
      let properties = {};
      properties[type] = value;
      if (type === "color") {
        this.onChangeColor(value);
      }
      this.updateProperties(properties);
    },

    changeAssignee() {
      const assignee = this.propertyObj.participants[0].name;
      console.log("assignee", assignee);

      const { modeler, element } = this;
      console.log(this.propertyObj);
      const elementRegistry = this.modeler.get("elementRegistry");
      const activity = elementRegistry.get(this.propertyObj.id);

      this.modeling.updateProperties(activity, {
        "camunda:assignee": assignee,
      });
    },

    updateName(name) {
      const { modeler, element } = this;
      const modeling = modeler.get("modeling");
      modeling.updateLabel(element, name);
    },
    onChangeColor(color) {
      console.log(color);
      const { modeler, element } = this;
      const modeling = this.modeler.get("modeling");
      modeling.setColor(element, {
        fill: null,
        stroke: color,
      });
    },
    changeEventType(event) {
      console.log(event);
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      this.eventType = value;
      bpmnReplace.replaceElement(element, {
        type: element.businessObject.$type,
        eventDefinitionType: value,
      });
    },
    changeTaskType(event) {
      console.log(event);
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      bpmnReplace.replaceElement(element, {
        type: value,
      });
    },

    /**
     * 更新元素属性
     * @param { Object } 要更新的属性, 例如 { name: '' }
     */
    updateProperties(properties) {
      const elementRegistry = this.modeler.get("elementRegistry");
      const element = elementRegistry.get(this.propertyObj.id);
      this.modeling.updateProperties(element, properties);
    },

    getEntities() {
      let that = this;
      getAllEntities().then((res) => {
        if (res.data.success) {
          this.entities = res.data.data;
        }
      });
    },

    changeSelectedClass(value) {
      console.log("测试加载页面时，是否触发过这个方法");
      if (value == undefined) return;
      let selectedClass = value;
      console.log("selectedClass", selectedClass);
      console.log("propertyObj", this.propertyObj);
      this.updateCamundaProperty(this.propertyObj.id, "enClass", selectedClass);
      this.propertyObj.selectedClass = selectedClass;
      console.log("propertyObj", this.propertyObj);

      let that = this;
      getViews(selectedClass).then((res) => {
        console.log(res.data.success);
        if (res.data.success) {
          that.selectViews = res.data.data;
        }
      });
    },

    changeElementName(event) {
      let elementName = event.target.value;

      console.log("elementName", elementName);

      const elementRegistry = this.modeler.get("elementRegistry");
      const activity = elementRegistry.get(this.propertyObj.id);

      this.modeling.updateProperties(activity, {
        name: elementName,
      });

      console.log("propertyObj", this.propertyObj);
    },

    changeExpression(event) {
      let expression = event.target.value;
      console.log("expression", expression);
      
      const elementRegistry = this.modeler.get("elementRegistry");
      const SequenceFlow = elementRegistry.get(this.propertyObj.id);
      var conditionExpression = this.moddle.create("bpmn:FormalExpression", {
        body: expression, 
      });

      this.modeling.updateProperties(SequenceFlow, {
        conditionExpression: conditionExpression,
      });
    },

    changeScript(event){
      let scriptStr = event.target.value;
      console.log("script", scriptStr);

      const elementRegistry = this.modeler.get("elementRegistry");
      const scriptTask = elementRegistry.get(this.propertyObj.id);
      console.log("scriptTask", scriptTask);

      this.modeling.updateProperties(scriptTask, {
        script: scriptStr,
      });

    },    

    changeProperty(event, type){
      console.log(event, type);
      const value = event;

      let properties = {};
      properties[type] = value;

      this.updateProperties(properties);
    },

    changeTimerDefinition(event){
      let timeDuration = event.target.value;
      console.log("timeDuration", timeDuration);

      const elementRegistry = this.modeler.get("elementRegistry");
      const boundaryEvent = elementRegistry.get(this.propertyObj.id);
      console.log("boudaryEvent", boundaryEvent);
      console.log(boundaryEvent.businessObject.eventDefinitions[0]);
      const timerEventDefinition = boundaryEvent.businessObject.eventDefinitions[0];
      console.log(timerEventDefinition); 
      var formalExpression  = this.moddle.create("bpmn:FormalExpression", {
        body: timeDuration,
      });

      formalExpression.$parent = timerEventDefinition

      timerEventDefinition.set("timeDuration", formalExpression);

    },

    changeSelectedView(value) {
      console.log("selectedView", value);
      if (value == undefined) return;
      let selectedView = value;
      console.log("selectedView", selectedView);

      this.updateCamundaProperty(this.propertyObj.id, "viewName", selectedView);
      console.log("propertyObj", this.propertyObj);
    },

    updateCamundaProperty(elementId, key, value) {
      const elementRegistry = this.modeler.get("elementRegistry");
      const element = elementRegistry.get(elementId);
      console.log("updateCamundaProperty", element);

      var extensionElements = element.businessObject.extensionElements;
      if (extensionElements != undefined) {
        var camundaProperties = extensionElements.values[0];
        var isExist = false;
        console.log(camundaProperties);
        // 暂时用一个非常丑陋的方式避免undefined
        if (camundaProperties.$children == undefined) {
          for (var i = 0; i < camundaProperties.values.length; i++) {
            var camundaProperty = camundaProperties.values[i];
            if (camundaProperty.name == key) {
              camundaProperties.values[i].value = value;
              isExist = true;
              break;
            }
          }

          if (!isExist) {
            const newProperty = this.moddle.createAny("camunda:property");
            newProperty.name = key;
            newProperty.value = value;
            camundaProperties.values.push(newProperty);
          }
        } else {
          for (var i = 0; i < camundaProperties.$children.length; i++) {
            var camundaProperty = camundaProperties.$children[i];
            if (camundaProperty.name == key) {
              camundaProperties.$children[i].value = value;
              isExist = true;
              break;
            }
          }

          if (!isExist) {
            const newProperty = this.moddle.createAny("camunda:property");
            newProperty.name = key;
            newProperty.value = value;
            camundaProperties.$children.push(newProperty);
          }
        }

        extensionElements = this.moddle.create("bpmn:ExtensionElements", {
          values: [camundaProperties],
        });

      } else {
        const newProperties = this.moddle.createAny("camunda:properties");
        const newProperty = this.moddle.createAny("camunda:property");
        newProperty.name = key;
        newProperty.value = value;
        newProperties.$children = [];
        newProperties.$children.push(newProperty);
        console.log(newProperties);

        extensionElements = this.moddle.create("bpmn:ExtensionElements", {
          values: [newProperties],
        });
      }

      this.modeling.updateProperties(element, {
        extensionElements: extensionElements,
      });

      /* const newProperty =  this.moddle.createAny('camunda:property');
      newProperty.name = key;
      newProperty.value = value;

      const newProperties = this.moddle.createAny('camunda:properties');

      newProperties.$children = [];
      newProperties.$children.push(newProperty);
      console.log(newProperties)

      const newExtensionElements =  this.moddle.create('bpmn:ExtensionElements',{values:[newProperties]});

      const elementRegistry = this.modeler.get("elementRegistry");
      const activity = elementRegistry.get(elementId);

      this.modeling.updateProperties(activity,{
        extensionElements: newExtensionElements
      })
 */
    },

    showProcessEditPanel() {
      /* if(this.propertyObj instanceof AbstractTask){
                this.getTaskVariable();
            } */

      this.processEditPanel = true;
    },

    addParticipant() {
      var par;
      //任务添加办理人
      var selectedItem = this.$refs.participantSelector.getSelectedItem();
      // console.log(" addParticipant selectedItem",selectedItem);
      if (selectedItem == null) {
        this.$Message.info("未选择用户/用户组");
        return;
      }

      if (selectedItem.type == "launcher") {
        for (let i = 0; i < this.propertyObj.participants.length; i++) {
          if (this.propertyObj.participants[i].participantType == "launcher") {
            this.$Message.info("请勿重复添加发起人");
            this.$refs.participantSelector.recovery();
            return;
          }
        }
        par = { participantType: "launcher", name: "", oid: "" };
      } else if (selectedItem.value == "000") {
        this.$Message.info("无法添加‘无组织用户’组");
        this.$refs.proprietorSelector.recovery();
        return;
      } else {
        for (let i = 0; i < this.propertyObj.participants.length; i++) {
          if (this.propertyObj.participants[i].oid == selectedItem.value) {
            this.$Message.info("请勿重复添加该用户/用户组");
            this.$refs.participantSelector.recovery();
            return;
          }
        }
        par = {
          participantType: selectedItem.type,
          name: selectedItem.name,
          displayName: selectedItem.label,
          oid: selectedItem.value,
        };
      }
      console.log("par", par);

      this.propertyObj.participants.push(par);
      this.propertyObj.assignee = par.name;
      this.changeAssignee();

      this.$refs.participantSelector.recovery();
    },
  },
};
</script>

<style scoped>
.custom-properties-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  background-color: #fff9f9;
  border-color: rgba(0, 0, 0, 0.09);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 20px;
}
.empty {
  height: 200px;
  line-height: 200px;
  font-weight: 700;
}
.element-item {
  padding: 10px;
  margin-top: 5px;
  border: 1px solid;
  border-color: darkorange;
  border-radius: 8px;
}
.element-item:first-child {
  margin-top: 0;
}
.custom-properties-panel input,
.custom-properties-panel textarea {
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  background-color: #fff;
  background-image: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
  outline: none;
}
.custom-properties-panel input:focus,
.custom-properties-panel button:focus,
.custom-properties-panel textarea:focus,
.custom-properties-panel [contenteditable]:focus {
  border-color: rgb(239, 112, 96);
  box-shadow: 0 0 1px 2px rgb(239, 112, 96, 0.2);
}
.custom-properties-panel label {
  font-weight: bold;
}

.custom-properties-panel label:after {
  content: ": ";
}

.custom-properties-panel button + button {
  margin-left: 10px;
}
</style>
