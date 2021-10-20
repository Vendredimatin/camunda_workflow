<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <Row style="margin-bottom: 10px;">
                        <Input v-model="searchKey" icon="md-search" placeholder="输入关键字查询" style="width: 200px;float: right;"/>
                    </Row>
                    <div class="margin-top-10">
                        <Table ref="viewTable" :loading="loading" :height="tableHeight" :columns="columnsList" :data="searchData" border disabled-hover id="onlineTable"></Table>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import {tableMixin} from "@/component/tableMixin"
import { getAllSockets, sendMsgToSock } from '@/api/others';
export default {
  name: "user-management",
  props: ["router"],
  mixins: [tableMixin],
  beforeDestroy() {
  },
  destroyed() {
  },
  data() {
    return {
        searchKey: '',
        columnsWidth: 107,
        columnsList: [
            {
                title: "序号",
                type: "index",
                width: 80,
                align: "center"
            },
            {
                title: "用户名",
                align: "center",
                key: "username",
            },
            {
                title: "用户显示名",
                align: "center",
                key: "displayName"
            },
            {
                title: "会话id",
                align: "center",
                key: "sockId",
            },
            {
                title: "IP",
                align: "center",
                key: "ip"
            },
            {
                title: "端口",
                align: "center",
                key: "port"
            },
            {
                title: "上线时间",
                align: "center",
                key: "logTime"
            },
            // {
            //     title: "所在端",
            //     align: "center",
            //     key: "entryPoint"
            // },
            {
                title: "操作",
                align: "center",
                width: 200,
                key: "handle",
                render: (h, params) => {
                    return h('div', [
                        h('Button', {
                            props: {
                                type: 'primary',
                                size: 'small',
                            },
                            on: {
                                click: () => {
                                    this.quit(params);
                                }
                            }
                        }, '下线')
                    ])
                }
            }
        ],
        tableData: [],
        loading: false,
    };
  },
    computed: {
        searchData() {
            let sk = '';
            if(this.searchKey) {
                sk = this.searchKey.toLowerCase().trimStart().trimEnd();
            }
            let data = this.tableData;
            let newData = [];
            if (sk) {
                data.forEach(function (obj) {
                    // 关键字搜索
                    if (
                        String(obj['username']).toLowerCase().indexOf(sk) > -1 ||
                        String(obj['sockId']).toLowerCase().indexOf(sk) > -1 ||
                        String(obj['displayName']).toLowerCase().indexOf(sk) > -1 ||
                        String(obj['ip']).toLowerCase().indexOf(sk) > -1 ||
                        String(obj['port']).toLowerCase().indexOf(sk) > -1 ||
                        String(obj['logTime']).toLowerCase().indexOf(sk) > -1 
                     ) {
                        newData.push(obj);
                    }
                });
                data = newData;
            }
            console.log(data)
            return data;

        }
    },
  methods: {
      globalRefresh() {
        this.initData();
      },
      activate() {
        this.resetColumnsWidth();
      },
      resetColumnsWidth() {

        let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
        let finalWidth = parseInt(sideWidth) + 410;
        this.columnsWidth = (document.body.clientWidth - finalWidth) / 7;
        console.log('resetColumnsWidth', this.columnsWidth)

        this.columnsList = [
            {
                title: "序号",
                type: "index",
                width: 80,
                align: "center"
            },
            {
                title: "用户名",
                align: "center",
                minWidth: this.columnsWidth,
                key: "username",
            },
            {
                title: "用户显示名",
                align: "center",
                minWidth: this.columnsWidth,
                key: "displayName"
            },
            {
                title: "会话id",
                align: "center",
                minWidth: this.columnsWidth,
                key: "sockId",
            },
            {
                title: "IP",
                align: "center",
                minWidth: this.columnsWidth,
                key: "ip"
            },
            {
                title: "端口",
                align: "center",
                minWidth: this.columnsWidth,
                key: "port"
            },
            {
                title: "上线时间",
                align: "center",
                minWidth: this.columnsWidth,
                key: "logTime"
            },
            // {
            //     title: "所在端",
            //     align: "center",
            //     minWidth: this.columnsWidth,
            //     key: "entryPoint"
            // },
            {
                title: "操作",
                align: "center",
                width: 200,
                key: "handle",
                render: (h, params) => {
                    return h('div', [
                        h('Button', {
                            props: {
                                type: 'primary',
                                size: 'small',
                            },
                            on: {
                                click: () => {
                                    this.quit(params);
                                }
                            }
                        }, '下线')
                    ])
                }
            }
        ]

      },
      async quit(params) {
          console.log("quit:", params);
          await sendMsgToSock(params.row.sockId, '{"command": "quit", "data": {}}');
          this.loading = true;
          setTimeout(() => {
            this.initData();
          }, 1200)
          
      },
      async initData() {
          this.loading = true;
          let data = await getAllSockets();
          data = data.data.data;
          console.log("data:",data);
          this.tableData = [];
          let users = {};
          for (var id in data) {
              if (!(data[id].username in users)) {
                  users[data[id].username] = [];
              }
              users[data[id].username].push(id);
          }
          for (var u in users) {
              users[u].forEach(id => {
                  this.tableData.push({
                      username: u,
                      sockId: id,
                      displayName: data[id].displayName,
                      ip: data[id].ip,
                      port: data[id].port,
                      logTime: new Date(parseInt(data[id].logTime)).format("YYYY.MM.dd hh:mm:ss"),
                      entryPoint: data[id].entryPoint
                  })
              })
          }
          this.loading = false;
      },
  },

  created() {
      this.resetColumnsWidth();
      this.initData();
  },

  watch: {
  }
};
</script>

<style>
</style>
