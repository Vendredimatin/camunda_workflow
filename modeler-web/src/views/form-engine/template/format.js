// 将绑定的类名替换,做标记
function format(json, obj) {
//做替换对象
let replaceObj = {}
// let obj = {
//     targetClass: 'SRING98',//类名
//     bindTargetClass: 'SRING98&e'
// }
replaceObj[obj.targetClass] = '${targetClass}'
replaceObj[obj.bindTargetClass] = '${bindTargetClass}'
// 针对控件做替换
// 查询框
replaceObj['addin_SearchBox'] = {
    selectAttr: '${selectAttr}',
    dataAttr: '${dataAttr}'
}
// 卡片
replaceObj['addin_FormEngine'] = {
    viewName: '${viewName}', 
    select_type: '${select_type}', 
    selected_attributes: '${selected_attributes}'
}
// 表格
replaceObj['addin_Grid'] = {
    // columnDefs: '${columnDefs}', 
    select_type: '${select_type}', 
    selected_attributes: '${selected_attributes}'
}
// 目录树
replaceObj['addin_SelfJoinsTree'] = {
    treeList: '${treeList}',
    relationAttr: '${parentOid}',
    opr_path: '${opr_path}'
}
console.log(replaceObj)


    let content = ''
    let sign = ''
    function deepFunc(data) {
            for(let key in data){
                
                    if(
                        typeof data[key] === 'string'
                        && key !== 'elementType'
                    ){
                        if(data[key] === sign){
                            // 表格保存原有操作列的特殊处理
                            // if(key == 'columnDefs'){
                            //     debugger
                            //     data[key] =[content]
                            // }else{
                                data[key] = content
                            // }
                        }

                    }else{
                        if (data[key] && data[key] !== null){
                            if(data[key].constructor === Object){
                                // 控件properties属性处理
                                if(
                                    data[key]['elementType'] == sign 
                                    && Object.prototype.toString.call(content) == '[object Object]'
                                ){
                                    if(sign == 'addin_Grid'){
                                        if(data[key]['properties']['columnDefs'].indexOf('${columnDefs}') == -1){
                                            data[key]['properties']['columnDefs'].push('${columnDefs}')
                                        }
                                    }
                                    for(let contentKey in content){
                                        // 点击事件
                                        if(contentKey == 'opr_path'){
                                            data[key]['properties']['events'] = [
                                                {
                                                    "opr_path": content[contentKey],
                                                    "opr_type": "query",
                                                    "name": "单击节点"
                                                }
                                            ]
                                        }else{
                                            data[key]['properties'][contentKey] = content[contentKey]
                                        }
                                    }
                                }
                                deepFunc(data[key])
                            }
                            if(data[key].constructor === Array){
                                data[key].forEach(item => {
                                    deepFunc(item)
                                })
                            }
                        }
                    }
            }
    }
    for(sign in replaceObj){
        content = replaceObj[sign]
        deepFunc(json)
    }
    console.log(json)
}
// // 全局替换
// format(replaceObj, json)
// console.log(json)

export default format