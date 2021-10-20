<template>
  <div>
    <Row>
      <Col span="24">
        <Card>
          <p slot="title">
            <Icon type="ios-keypad"></Icon>
            快照导出
          </p>

          <Row>
            <p>将当前系统导出为快照：</p>
            <br>
            <Collapse simple>
              <Panel name="1">
                自定义导出项
                <p slot="content">
                  <CheckboxGroup v-model="export_item">
                    <table width="800">
                      <tr>
                        <td style="width: 70%">
                          <Checkbox label="data_model">
                            <span>数据模型</span>
                          </Checkbox>
                          <Checkbox label="view_func_authitem_app">
                            <span>表单模型 & 功能模型 & 授权项与授权项组 & 应用信息</span>
                          </Checkbox>
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td style="width: 70%"></td>
                        <td>
                          <Checkbox label="rule_condition">
                            <span>授权规则与条件</span>
                          </Checkbox>
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 70%">
                          <Checkbox label="org_model">
                            <span>组织模型</span>
                          </Checkbox>
                        </td>
                        <td></td>
                      </tr>
                    </table>
                  </CheckboxGroup>
                </p>
              </Panel>
            </Collapse>
            <br>
            <Button type="primary" style="float:left; margin: 5px;" @click="downloadSnapShot">导出快照</Button>
          </Row>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import { Message } from 'view-design';
  import global from "@/views/global.vue";
    export default {
        name: "snapshot-export",
        data () {
          return {
            export_item: ['data_model', "view_func_authitem_app"]
          }
        },

        methods: {
          downloadSnapShot(){
            this.$Message.info("正在导出中，请稍等......");
            let a = document.createElement('a');
            let href = `${global.baseUrl}/snapshot/export?`;
            for(let i=0; i < this.export_item.length; i++){
              if(i > 0) href = href + "&";
              href = href + "exportItem=" + this.export_item[i];
            }
            a.href = href;
            a.click();
          }
        },

        watch:{
          export_item(value){
            if(value.includes("rule_condition") && !value.includes("org_model")){
              value.push("org_model");
            }
            if(value.includes("rule_condition") && !value.includes("view_func_authitem_app")){
              value.push("view_func_authitem_app");
            }
            if(value.includes("view_func_authitem_app") && !value.includes("data_model")){
              value.push("data_model");
            }
          }
        }
    }


</script>

<style scoped>

</style>
