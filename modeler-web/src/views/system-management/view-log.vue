<template>
    <div>
        <Row style="padding: 10px;">
            <span>按日期下载: </span>
            <DatePicker type="date" format="yyyy-MM-dd" :options="logOption" placeholder="请选择日期" style="width: 216px;margin-right: 10px;" @on-change="changeDate"></DatePicker>
            <Button type="primary" @click.native="downLoadLog">下载</Button>
            <!-- <span>按月份下载: </span>
            <DatePicker type="date" format="yyyy-MM" placeholder="请选择月份" style="width: 200px;margin-right: 10px;" @on-change="changeDate"></DatePicker>
            <Button type="primary" @click.native="downLoadLog">下载</Button> -->
        </Row>
        <Row>
            <iframe v-if="freshFlag" :src="logUrl" frameborder="0" width="100%" class="log-iframe"></iframe>
        </Row>
    </div>
</template>
<script>
    import { getScriptLogByDate, getScriptLogByMonth } from "@/api/others";
    export default {
        data() {
            return {
                freshFlag: true,
                logDate: null,
                logUrl: '',
                logOption: {
                    disabledDate (date) {
                        return date && date.valueOf() >= new Date();
                    }
                }
            }
        },
        created() {
            this.logUrl = `${Config.protocol}//${Config.host}/log/script-log.html`;
        },
        methods: {
             globalRefresh() {

                this.freshFlag = false;
                this.$nextTick(() => {
                    this.freshFlag = true;
                })

            },
            downLoadLog() {

                if(!this.logDate || this.logDate == '') {
                    this.$Message.warning('请先选择日期')
                } else {
                    getScriptLogByDate(this.logDate).then(response => {

                        let res = response.data;
                        if(typeof res == 'object') {

                            if(!res.success) {
                                this.$Message.warning(res.message);
                            }

                        } else {

                            var elementA = document.createElement('a');
                            elementA.setAttribute('href', `${Config.baseUrlOther}/log/script-log?date=${this.logDate}`);
                            elementA.setAttribute('download', + this.logDate + ".log");
                            elementA.style.display = 'none';
                            document.body.appendChild(elementA);
                            elementA.click();
                            document.body.removeChild(elementA);

                        }

                    }).catch(e => {
                        console.log(e);
                    });
                }
            },
            changeDate(date, type) {
                this.logDate = date;
            }
        },
    }
</script>
<style scoped>
.log-iframe {
    height: 500px;
    overflow-x: hidden;
    overflow-y: auto;
}
@media screen and (max-width: 1400px) {
    .log-iframe {
        height: 450px;
    }
}
</style>
