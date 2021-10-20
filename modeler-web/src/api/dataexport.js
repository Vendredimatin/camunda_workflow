import global_ from "@/views/global.vue"
import store from "@/store";

export const dataExportFunc = (classname, attributes, joinToOneSheet) => {
    fetch(global_.baseUrl+"/"+"exportData/exportData"+"?"+"classname="+classname+"&attributes="+attributes.join(",")+"&joinToOneSheet="+joinToOneSheet, {
        method: 'GET',
        headers: new Headers({
            Authorization: store.state.user.token,
        }),
        })
        .then(res => {
            //console.log(res)
            return res.blob()
        })
        .then(data => {
            const blobUrl = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.download = classname + '.xlsx';
            a.href = blobUrl;
            a.click();
        });
}