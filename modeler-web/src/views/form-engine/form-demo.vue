<template>
  <div class="demo">
    <Layout>
      <Header>
        <Row>
          <Col span="14">
            <ul class="headTool-l">
              <li>
                <Button type="default" icon="md-refresh" class="noBorder">刷新</Button>
              </li>
              <li>
                <Icon type="ios-folder-open"></Icon>
                <span> 类名: </span>
                <span>{{ targetClassName }}</span>
              </li>
              <li>
                <Icon type="ios-folder-open"></Icon>
                <span> 视图名: </span>
                <span>{{ targetViewName }}</span>
              </li>
              <li>
                <Button type="default" icon="ios-paper" class="noBorder">创建视图</Button>
              </li>
              <li>
                <Button type="default" icon="md-printe" class="noBorder">复制视图</Button>
              </li>
              <li>
                <Button type="default" icon="ios-trash" class="noBorder">删除视图</Button>
              </li>
              <li>
                <Button type="default" icon="md-settings" class="noBorder">视图配置</Button>
              </li>
            </ul>
          </Col>
          <Col span="4" offset="6">
            <Button type="primary" class="mr15">关闭</Button>
            <Button type="primary" class="mr15">保存</Button>
            <Button type="primary">预览</Button>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider hide-trigger>
          <Card>
            <Input v-model="searchName" placeholder="请输入搜素的名称..."></Input>
            <Tree :data="treeData" @on-select-change="onTypeSelect">
            </Tree>
          </Card>
          <Card>
            <p slot="title">
              <Icon type="ios-film-outline"></Icon>
              控件
            </p>
            <div ref="icons">
            </div>
          </Card>
          <Card>
            <p slot="title">
              <Icon type="ios-film-outline"></Icon>
              分割符
            </p>
            <div ref="icons">
            </div>
          </Card>
          <Card>
            <p slot="title">
              <Icon type="md-checkbox-outline"></Icon>
              分组框
            </p>
            <div ref="icons">
            </div>
          </Card>
        </Sider>
        <Content>
          <Card>
            <p slot="title">预览样式</p>
            <Section @dragenter="onDragEnter($event)" @dragover="onDragOver($event)" @drop="onDrop($event)"
                     ref="preview"
                     style="height: 400px">
            </Section>

          </Card>
          <Card>
            <p slot="title">运行样式</p>

            <Section style="height: 400px" ref="show">
            </Section>

          </Card>
        </Content>
        <Sider hide-trigger>
          <Card>
            <p slot="title">属性编辑框</p>
            <Section ref="edit">
            </Section>
          </Card>
        </Sider>
      </layout>
    </Layout>
  </div>
</template>

<script>
  import {getAddin, getAddinDom, getAddinFunc} from '@/util/addin.js'

  export default {
    name: 'app',
    components: {},
    data() {
      return {
        entrys: {'e_input_0': null, 'e_input_1': null, 'e_input_2': null, 'addin_panel': null, 'addin_groupbox': null, 'addin_splitline': null,'addin_tab':null},
        dom: null,
        treeData: [
          {
            title: "类属性",
            expand: true,
            children: [
              {
                title: "String",
              },
              {
                title: "Integer",
              },
              {
                title: "Boolean"
              },
              {
                title: "Long"
              },
              {
                title: "UUID"
              },
              {
                title: "Date"
              },
              {
                title: "Double"
              },
              {
                title: "Clob"
              },
              {
                title: "Timestamp"
              }
            ]
          }
        ],
        type: '',
        entry_type: {},
        targetClassName: 'entryClass',
        targetViewName: 'myFirstView',
        searchName: ''
      }
    },
    mounted() {
      this.entry_type[''] = []
      for (var i in this.entrys) {
        var a = getAddinFunc(i);
        this.entrys[i] = a;
        this.entry_type[''].push(i);
      }
      for (var i in this.entrys) {
        // 获取类型和对应的插件
        var a = this.entrys[i];
        var b = new a();
        var type = b.getDataType();
        for (var j = 0; j < type.length; j++) {
          if (!(type[j] in this.entry_type)) {

            this.entry_type[type[j]] = [];
          }
          this.entry_type[type[j]].push(i);
        }
        b.setType(2);
        var el = b.$mount().$el;
        el.style = "margin: 10px";
        this.$refs.icons.appendChild(el);
      }
    },
    methods: {

      onTypeSelect(val) {
        this.type = val[0].title;
      },

      onDragOver(event) {
        event.preventDefault();
      },

      onDragEnter(event) {
        event.preventDefault();
      },

      onDrop(event) {
        event.preventDefault();

        var name = event.dataTransfer.getData("Text");
        if (!name) return;
        var a = this.entrys[name];
        // 设置预览样式和点击事件
        var b = new a().$mount().setType(0).setClick((e) => {
          console.log(e.target);
          var nodes = this.$refs.edit.childNodes;
          for (var i = nodes.length - 1; i >= 0; i--) {
            this.$refs.edit.removeChild(nodes[i]);
          }
          // 获取编辑框
          this.$refs.edit.appendChild(b.getEditBox());
          e.stopPropagation();
        }, true);

        //event.currentTarget.appendChild(b.$el);
        let tar = event.target;
        let show = this.$refs.show;
        let prev = this.$refs.preview;

        let len = tar.childNodes.length
        tar.appendChild(new a().$mount().setType(1).$el);

        var _self = this;

        new Promise((resolve, reject) => {
          _self.$nextTick(() => {
            show.innerHTML = prev.innerHTML;
          });
          resolve();
        }).then(() => {
          _self.$nextTick(() => {
            tar.removeChild(tar.childNodes[len]);
          });
        }).then(() => {
          _self.$nextTick(() => {
            tar.appendChild(b.$el)
          });
        })


        /* this.$nextTick(() => {


         });*/

        /* this.$nextTick(() => {

           tar.removeChild(tar.childNodes[len]);

         });

         this.$nextTick(() => {
           tar.appendChild(b.$el)

         });*/


        // 设置运行样式
        //this.$refs.show.appendChild();

        //this.$refs.show.children[ind].appendChild(new a().$mount().setType(1).$el);

      }
    },

    watch: {
      type(val) {
        var nodes = this.$refs.icons.childNodes;
        console.log(this.entry_type[val], nodes);
        for (var i = nodes.length - 1; i >= 0; i--) {
          this.$refs.icons.removeChild(nodes[i]);
        }
        // 生成当前类型可用的控件对应的图标，其中val为当前选中类型
        for (var i = 0; i < this.entry_type[val].length; i++) {
          var a = this.entrys[this.entry_type[val][i]];
          var b = new a();
          b.setType(2);
          // 设置插件的图标
          b.setIcon("https://i.loli.net/2017/08/21/599a521472424.jpg");
          var el = b.$mount().$el;
          el.style = "margin: 10px";
          this.$refs.icons.appendChild(el);
        }
      }
    }
  }
</script>

<style scoped>
  .demo {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
  }

  .ivu-layout-header {
    height: 50px;
    background: #fff;
    padding: 0 30px;
    line-height: 50px;
  }

  .noBorder {
    border: none;
  }

  .ivu-layout-sider {
    background: #fff !important;
  }

  .headTool-l li {
    height: 50px;
    list-style: none;
    float: left;
    margin-right: 15px;
  }

  .mr15 {
    margin-right: 15px;
  }
</style>
