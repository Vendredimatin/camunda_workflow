export const editInlineColumns = [
  {
    title: "序号",
    type: "index",
    width: 80,
    align: "center"
  },
  {
    title: "英文名",
    align: "center",
    key: "eName",
    editable: true
  },
  {
    title: "显示名",
    align: "center",
    key: "cName",
    editable: true
  },
  {
    title: "密码",
    align: "center",
    key: "password",
    editable: true
  },
  {
    title: "电子邮件",
    align: "center",
    key: "email",
    editable: true
  },
  {
    title: "备注",
    align: "center",
    key: "note",
    editable: true
  },
  // {
  //     title: '所属用户组',
  //     align: 'center',
  //     key: 'attachGroup',
  //     editable: true
  // },
  {
    title: "操作",
    align: "center",
    width: 200,
    key: "handle",
    handle: ["edit", "delete"]
  }
];

const tableData = {
  editInlineColumns: editInlineColumns
};

export default tableData;
