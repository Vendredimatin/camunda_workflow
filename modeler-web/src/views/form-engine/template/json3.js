// import format from "./format"
// 多对象列表模板

let json = {
    "data": {
        "elements": [
            {
                "self": {
                    "elementType": "addin_col",
                    "properties": {
                        "id": "col1",
                        "height": 30,
                        "width": 100,
                        "widthType": "%",
                        "heightType": "px",
                        "hided": false,
                        "align": "Vertical",
                        "g_align": 0,
                        "imgOrigin": "imgSelf",
                        "back_color": "#fff",
                        "back_picture": "",
                        "bgStyle": "cover",
                        "bgSize": "cover",
                        "bgRepeat": "no-repeat",
                        "bgPercent": 100,
                        "border": true,
                        "marginTop": 0,
                        "marginTopType": "px",
                        "marginBottom": 0,
                        "marginBottomType": "px",
                        "marginLeft": 0,
                        "marginLeftType": "px",
                        "marginRight": 0,
                        "marginRightType": "px",
                        "paddingTop": 0,
                        "paddingTopType": "px",
                        "paddingBottom": 0,
                        "paddingBottomType": "px",
                        "paddingLeft": 0,
                        "paddingLeftType": "px",
                        "paddingRight": 0,
                        "paddingRightType": "px",
                        "tbColor": "#bbb",
                        "tbWidth": 0,
                        "tbStyle": "dashed",
                        "bbColor": "#bbb",
                        "bbWidth": 0,
                        "bbStyle": "dashed",
                        "lbColor": "#bbb",
                        "lbWidth": 0,
                        "lbStyle": "dashed",
                        "rbColor": "#bbb",
                        "rbWidth": 0,
                        "rbStyle": "dashed",
                        "ltRadius": 0,
                        "ltRadiusType": "px",
                        "rtRadius": 0,
                        "rtRadiusType": "px",
                        "lbRadius": 0,
                        "lbRadiusType": "px",
                        "rbRadius": 0,
                        "rbRadiusType": "px",
                        "shadowType": "外阴影",
                        "xShadow": 0,
                        "yShadow": 0,
                        "blurShadow": 0,
                        "spreadShadow": 0,
                        "shadowColor": "",
                        "layout": true,
                        "title": "单列",
                        "span": 8,
                        "offset": 0,
                        "push": 0,
                        "pull": 0,
                        "type": "flex",
                        "justify": "start",
                        "label_width": 1,
                        "main_width": 4,
                        "label_align": 7,
                        "main_align": 1,
                        "picActIndex": -1,
                        "alignItems": "flex-start",
                        "justifyContent": "flex-start",
                        "uuid": "52CB62290C0049AD9188D72C0C9BD5CB",
                        "labelWidthUnit": "px",
                        "label_widthByPx": 200
                    },
                    "dropTarget": 0,
                    "uuid": "52CB62290C0049AD9188D72C0C9BD5CB",
                    "DWFADDINARGSVERSION": 1
                },
                "elements": [
                    {
                        "self": {
                            "elementType": "addin_Operation",
                            "properties": {
                                "extend": false,
                                "opr_path": "",
                                "opr_name": "tip",
                                "type": "primary",
                                "shape": false,
                                "width": "auto",
                                "widthType": "px",
                                "heightType": "px",
                                "height": 34,
                                "icon": "",
                                "text": "新增",
                                "opr_type": null,
                                "auth": false,
                                "auth_item": null,
                                "disabled": false,
                                "id": "Operation1",
                                "main_fontColor": "#fff",
                                "hided": false,
                                "title": "按钮",
                                "col": true,
                                "cols": 3,
                                "targetDataType": null,
                                "chooseTable": [],
                                "events": [
                                    {
                                        "opr_path": "createForm",
                                        "opr_type": "sys",
                                        "name": "单击",
                                        "opr_sys_path": ""
                                    }
                                ],
                                "eventRange": [
                                    "单击"
                                ],
                                "uuid": "280DD57A1CDD4211977C30C18A776C4B"
                            },
                            "dropTarget": 0,
                            "uuid": "280DD57A1CDD4211977C30C18A776C4B",
                            "DWFADDINARGSVERSION": 1
                        },
                        "elements": []
                    },
                    {
                        "self": {
                            "elementType": "addin_Operation",
                            "properties": {
                                "extend": false,
                                "opr_path": "",
                                "opr_name": "tip",
                                "type": "primary",
                                "shape": false,
                                "width": "auto",
                                "widthType": "px",
                                "heightType": "px",
                                "height": 34,
                                "icon": "",
                                "text": "编辑",
                                "opr_type": null,
                                "auth": false,
                                "auth_item": null,
                                "disabled": false,
                                "id": "Operation2",
                                "main_fontColor": "#fff",
                                "hided": false,
                                "title": "按钮",
                                "col": true,
                                "cols": 3,
                                "targetDataType": null,
                                "chooseTable": [],
                                "events": [
                                    {
                                        "opr_path": "editForm",
                                        "opr_type": "sys",
                                        "name": "单击",
                                        "opr_sys_path": ""
                                    }
                                ],
                                "eventRange": [
                                    "单击"
                                ],
                                "uuid": "256FE320F2D54F00A81CDA35277D7818"
                            },
                            "dropTarget": 0,
                            "uuid": "256FE320F2D54F00A81CDA35277D7818",
                            "DWFADDINARGSVERSION": 1
                        },
                        "elements": []
                    },
                    {
                        "self": {
                            "elementType": "addin_Operation",
                            "properties": {
                                "extend": false,
                                "opr_path": "delete",
                                "opr_name": "tip",
                                "type": "primary",
                                "shape": false,
                                "width": "auto",
                                "widthType": "px",
                                "heightType": "px",
                                "height": 34,
                                "icon": "",
                                "text": "删除",
                                "opr_type": "sys",
                                "auth": false,
                                "auth_item": "delete",
                                "disabled": false,
                                "id": "Operation3",
                                "main_fontColor": "#fff",
                                "hided": false,
                                "title": "按钮",
                                "col": true,
                                "cols": 3,
                                "targetDataType": null,
                                "chooseTable": ["Grid1"],
                                "events": [
                                    {
                                        "opr_path": "delete",
                                        "opr_type": "sys",
                                        "name": "单击",
                                        "opr_sys_path": ""
                                    }
                                ],
                                "eventRange": [
                                    "单击"
                                ],
                                "uuid": "E93CB7566CE94885A15274FF3EF9F495"
                            },
                            "dropTarget": 0,
                            "uuid": "E93CB7566CE94885A15274FF3EF9F495",
                            "DWFADDINARGSVERSION": 1
                        },
                        "elements": []
                    }
                ]
            },
            {
                "self": {
                    "elementType": "addin_col",
                    "properties": {
                        "id": "col2",
                        "height": 30,
                        "width": 100,
                        "widthType": "%",
                        "heightType": "px",
                        "hided": false,
                        "align": "Vertical",
                        "g_align": 0,
                        "imgOrigin": "imgSelf",
                        "back_color": "#fff",
                        "back_picture": "",
                        "bgStyle": "cover",
                        "bgSize": "cover",
                        "bgRepeat": "no-repeat",
                        "bgPercent": 100,
                        "border": true,
                        "marginTop": 0,
                        "marginTopType": "px",
                        "marginBottom": 0,
                        "marginBottomType": "px",
                        "marginLeft": 0,
                        "marginLeftType": "px",
                        "marginRight": 0,
                        "marginRightType": "px",
                        "paddingTop": 0,
                        "paddingTopType": "px",
                        "paddingBottom": 0,
                        "paddingBottomType": "px",
                        "paddingLeft": 0,
                        "paddingLeftType": "px",
                        "paddingRight": 0,
                        "paddingRightType": "px",
                        "tbColor": "#bbb",
                        "tbWidth": 0,
                        "tbStyle": "dashed",
                        "bbColor": "#bbb",
                        "bbWidth": 0,
                        "bbStyle": "dashed",
                        "lbColor": "#bbb",
                        "lbWidth": 0,
                        "lbStyle": "dashed",
                        "rbColor": "#bbb",
                        "rbWidth": 0,
                        "rbStyle": "dashed",
                        "ltRadius": 0,
                        "ltRadiusType": "px",
                        "rtRadius": 0,
                        "rtRadiusType": "px",
                        "lbRadius": 0,
                        "lbRadiusType": "px",
                        "rbRadius": 0,
                        "rbRadiusType": "px",
                        "shadowType": "外阴影",
                        "xShadow": 0,
                        "yShadow": 0,
                        "blurShadow": 0,
                        "spreadShadow": 0,
                        "shadowColor": "",
                        "layout": true,
                        "title": "单列",
                        "span": 8,
                        "offset": 0,
                        "push": 0,
                        "pull": 0,
                        "type": "flex",
                        "justify": "start",
                        "label_width": 1,
                        "main_width": 4,
                        "label_align": 7,
                        "main_align": 1,
                        "picActIndex": -1,
                        "alignItems": "flex-start",
                        "justifyContent": "flex-start",
                        "uuid": "3B8F03DEC48547E8821691D2C7045045",
                        "labelWidthUnit": "px",
                        "label_widthByPx": 200
                    },
                    "dropTarget": 0,
                    "uuid": "3B8F03DEC48547E8821691D2C7045045",
                    "DWFADDINARGSVERSION": 1
                },
                "elements": [
                    {
                        "self": {
                            "elementType": "addin_SearchBox",
                            "properties": {
                                "width": 100,
                                "widthType": "%",
                                "title": "查询框",
                                "id": "SearchBox1",
                                "labelDisabled": false,
                                "style": "",
                                "targetDataType": null,
                                "buttonTxt": "查询",
                                "buttonReset": "重置",
                                "unitInputWidth": 33,
                                "readonly": false,
                                "hided": false,
                                "events": [
                                    {
                                        "opr_path": "",
                                        "opr_type": "",
                                        "name": "值变化"
                                    }
                                ],
                                "eventRange": [
                                    "值变化"
                                ],
                                "selectAttr": '${selectAttr}',
                                "chooseTable": [
                                    "Grid1"
                                ],
                                "oldChooseTable": [],
                                "dataAttr": '${dataAttr}',
                                "uuid": "B6822D4E884445A4919B427EF6FD20E8"
                            },
                            "dropTarget": 0,
                            "uuid": "B6822D4E884445A4919B427EF6FD20E8",
                            "DWFADDINARGSVERSION": 1
                        },
                        "elements": []
                    }
                ]
            },
            {
                "self": {
                    "elementType": "addin_Grid",
                    "properties": {
                        "dynamic": false,
                        "title": "表格",
                        "id": "Grid1",
                        "agGridTheme": "ag-theme-balham",
                        "columnDefs": [],
                        "enableSorting": true,
                        "enableFilter": true,
                        "rowSelection": false,
                        "colResiable": true,
                        "rowDragManaged": true,
                        "notEditable": false,
                        "statusBar": false,
                        "rangeSection": false,
                        "statusBarConfig": {},
                        "compactMode": false,
                        "autoSize": false,
                        "pageable": true,
                        "enableCellChangeFlash": true,
                        "enableExport": true,
                        "width": 100,
                        "widthType": "%",
                        "heightType": "px",
                        "height": 500,
                        "rowHeight": 40,
                        "select_type": "${select_type}",
                        "selected_attributes": "${selected_attributes}",
                        "selected_attributes_sort": [],
                        "bindTargetClass": "echoRelation&r",
                        "targetClass": "echoRelation",
                        "oprTargetClass": "echoRelation",
                        "filterQuery": "",
                        "dbclk_type": "",
                        "dbclk_path": "",
                        "dbclk_del_alert": true,
                        "dbclk_text": "",
                        "sgclk_text": "",
                        "sgclk_type": "",
                        "sgclk_path": "",
                        "sgclk_del_alert": true,
                        "event_oprs": {
                            "double_click": {
                                "opr_path": null,
                                "opr_type": ""
                            },
                            "single_click": {
                                "opr_path": null,
                                "opr_type": ""
                            }
                        },
                        "pagination": true,
                        "pageSize": 25,
                        "oprCol": false,
                        "SNCol": false,
                        "globalAlignCode": 1,
                        "oidNameMap": null,
                        "refClass": "echoRelation",
                        "classCategory": "RelationClass",
                        "events": [
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "初始化"
                            },
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "前处理"
                            },
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "翻页"
                            },
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "鼠标悬浮Tooltip"
                            },
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "单击"
                            },
                            {
                                "opr_path": "",
                                "opr_type": "",
                                "name": "双击"
                            }
                        ],
                        "eventRange": [
                            "初始化",
                            "前处理",
                            "翻页",
                            "鼠标悬浮Tooltip",
                            "单击",
                            "双击"
                        ],
                        "cacheGrid": false,
                        "hided": false,
                        "uuid": "1744F13129CD4AB7B17719E0D1450D1B"
                    },
                    "dropTarget": 0,
                    "uuid": "1744F13129CD4AB7B17719E0D1450D1B",
                    "DWFADDINARGSVERSION": 1
                },
                "elements": []
            }
        ],
        "targetClass": "echoRelation",
        "isRelation": false,
        "basicArgs": {},
        "deviceType": "actPc"
    }
}

// format(
//     json,
//     {
//         targetClass: 'echoRelation',//类名
//         bindTargetClass: 'echoRelation&r'
//     }
// )
export default json