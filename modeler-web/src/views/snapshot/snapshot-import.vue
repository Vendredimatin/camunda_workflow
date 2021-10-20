<template>
  <div>
    <Row>
      <Col span="24" class="demo-spin-col">
        <Card>
          <p slot="title">
            <Icon type="ios-keypad"></Icon>
            快照导入
          </p>
          <Row>
            <p>将快照释放到当前系统中：</p>
            <br>

            <Collapse simple>
              <Panel name="1">
                自定义导入项
                <p slot="content">
                  <CheckboxGroup v-model="import_item">
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

            <Upload :on-success="onUploadSuccess"
                    :before-upload="beforeUpload"
                    :show-upload-list="false"
                    type="drag"
                    :action="uploadUrl">
              <div style="padding: 100px 0">
                <Icon type="ios-cloud-upload" size="100" style="color: #3399ff"></Icon>
                <p>导入快照</p>
              </div>
            </Upload>
            <br>
            <p style="color:orangered">*这个操作会将当前系统的状态修改为所导入的快照的状态,请谨慎操作</p>
          </Row>
          <Spin fix v-if="spinShow">
            <Icon type="ios-loading" size='large' class="demo-spin-icon-load"></Icon>
            <br>
            <p>正在释放快照，可能需要1-2分钟的时间，请耐心等待...</p>
          </Spin>
        </Card>

      </Col>
    </Row>
  </div>
</template>

<script>
  import global from "@/views/global.vue";

    export default {
        name: "snapshot-import",

      data() {
        return {
          spinShow : false,

          import_item: ['data_model', 'view_func_authitem_app']
        }
      },

      computed:{
        uploadUrl(){
          let href = `${global.baseUrl}/snapshot/import?`;
          for(let i=0; i < this.import_item.length; i++){
            if(i > 0) href = href + "&";
            href = href + "importItem=" + this.import_item[i];
          }
          return href;
        }
      },

      methods: {

        beforeUpload(){
          this.spinShow = true;
        },

        onUploadSuccess(){
          this.spinShow = false;
          this.$Message.info("快照释放成功！");
        }
      },

      watch:{
        import_item(value){
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

  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
</style>
