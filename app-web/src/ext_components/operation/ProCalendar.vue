<template>
    <div v-bg-color="'#fff'">

        <Row class="ivu-p-16">
            <Col span="2">
                <span style="display: inline-block;height: 25px;line-height: 25px;">选择员工</span>
            </Col>
            <Col span="10">
                <RadioGroup v-model="chooseStaff" @on-change="switchStaff">
                    <Radio v-for="item in allStaff" :key="item" :label="item"></Radio>
                </RadioGroup>
            </Col>
        </Row>
        
        <Calendar v-model="value" hide-type>

            <template slot-scope="{ date, data }" slot="month">
                <div v-for="b in targetStaffTask">

                    <Badge :color="b.badgeColor || 'default'" :text="b.taskTitle || '---'" v-if="data.day === b.transDate && b.taskType == 'static'" />
                    <Badge dot v-if="data.day === b.transDate && b.taskType == 'link'">
                        <a :href="b.taskCondition || '#'" target="_blank" v-font="12">{{ b.taskTitle || '外部链接' }}</a>
                    </Badge>
                    <Badge :color="b.badgeColor || 'default'" :text="b.taskTitle || '---'" v-if="data.day === b.transDate && b.taskType == 'tab'" @click.native="toTab(b)" />
                    <Badge :color="b.badgeColor || 'default'" :text="b.taskTitle || '---'" v-if="data.day === b.transDate && b.taskType == 'modal'" @click.native="openModal(b)" />

                </div>
            </template>

        </Calendar>

        <!-- 查看任务备注弹窗 -->
        <Modal v-model="taskModal" draggable scrollable title="备注">
            <div>{{ targetNote }}</div>
        </Modal>
        <!-- 查看任务备注弹窗Ending -->
        

    </div>
</template>
<script>
    import { getEobj } from '@/api/others';
    export default {
        props: ['itemValue','root', 'store', 'Message'],
        data () {
            return {
                value: '2020-07-20',

                allTask: [],            // 所有对象任务
                allStaff: [],           // distinct员工列表
                chooseStaff: '',        // 当前选择查看员工
                // targetStaffTask: [],    // 当前选择员工taskList

                taskModal: false,       // 任务弹窗
                targetNote: ''          // 当前任务备注
            }
        },
        created() {
            
            this.allStaff = [];
            this.allTask = [];

            // 获取某实体类的全部对象
            getEobj('StaffSchedule', {}).then(response => {

                let res = response.data;
                if(res.success) {

                    this.allTask = res.data.map(r => {

                        r['transDate'] = this.getdate(r.taskDate);
                        r['badgeColor'] = this.randomColor();
                        return r;

                    });

                    res.data.forEach(item => {
                        if(this.allStaff.indexOf(item.staffName) == -1) {
                            this.allStaff.push(item.staffName)
                        }
                    })

                    // 默认选中第一位员工 并展示其全部任务
                    this.chooseStaff = this.allStaff[0];
                    // this.targetStaffTask = res.data.filter(t => {
                    //     return t.staffName == this.chooseStaff;
                    // })

                }

            }).catch(e => {
                console.log(e);
            });

        },

        computed: {

           targetStaffTask() {

               let curTask = this.allTask.filter(t => t.staffName == this.chooseStaff);
               return curTask;

           }

        },

        methods: {

            /** 
             * @description timestep 转为时间
             * @param ts 被转换的时间戳
            */
            getdate(ts) {
                if(ts == '') return '--';
                var now = new Date(ts),
                    y = now.getFullYear(),
                    m = now.getMonth() + 1,
                    d = now.getDate();
                return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
            },
            
            /** 
             * @description 生成每个任务随机标识颜色
            */
            randomColor() {
                return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
            },
            
            /** 
             * @description 任务打开新 tab
             * @param task 当前被点击的任务
            */
            toTab(task) {

                if(!task) return;

                let taskObj = {
                    targetClass: task.taskClass || '',
                    authority: task.taskAuthority || '',
                    conditionExpre: task.taskCondition || '',
                    displayName: task.taskDisplayName || '',
                    viewName: task.taskVIewName || '',
                    action: task.taskAction || '',
                    params: ""
                };
                this.root.openTab(taskObj);

            },

            /** 
             * @description 任务打开弹窗 默认显示当前任务的Note
             * @param task 当前被点击的任务
            */
            openModal(task) {

                this.targetNote = task.taskNote || '没得备注撒';
                this.taskModal = true;

            },

            // 切换用户
            switchStaff(v) {

                console.log(v);


            }
        }
    }
</script>