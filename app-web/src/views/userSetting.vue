<template>
    <div>

        <!-- 个人设置 -->
        <Card>
            <p slot="title">
                <Icon type="ios-person"></Icon>
                用户信息
            </p>
            <div style="width: 400px;">
                <div style="margin-bottom: 20px;">
                    <span>当前登陆用户: <span>{{ userName }}</span></span>
                    <Button type="warning" style="margin-left: 30px;float: right;" @click="fixPw = true">修改密码</Button>
                </div>
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
                    <FormItem label="修改用户密码: " prop="password">
                        <Input v-model="formValidate.password" placeholder="请输入修改后的密码"></Input>
                    </FormItem>
                <FormItem>
                    <Button type="primary" @click="handleSubmit('formValidate')">保存</Button>
                    <Button @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
                </FormItem>
            </Form>
            </div>
        </Card>

        <!-- 系统设置 -->
        <Card>
            <p slot="title">
                <Icon type="ios-person"></Icon>
                服务信息
            </p>
            <div style="width: 400px;height: 40px;">
                <Icon v-show="successState" type="md-checkmark" style="color: #32b332;margin-left: 10px;"></Icon>
                <Icon v-show="errorState" type="md-close" style="color: red;margin-left: 10px;"></Icon>
                <p style="float: left;">当前连接的模型服务地址: <span>{{ userName }}</span></p>
                <Button type="primary" style="float: right;" @click="testEvent">测试</Button>
            </div>
            <div style="width: 400px;height: 40px;">
                <p style="float: left;">当前连接的应用服务地址: <span>{{ userName }}</span></p>
                <Icon v-show="successState" type="md-checkmark" style="color: #32b332;margin-left: 10px;"></Icon>
                <Icon v-show="errorState" type="md-close" style="color: red;margin-left: 10px;"></Icon>
            </div>
        </Card>

    </div>
</template>

<script>
    export default {
        name: '',
        data() {
            const validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('密码不能为空'));
                } else {
                    const reg = /^(?![^a-zA-Z]+$)(?!\D+$).{4,16}$/;
                    let flag = reg.test(value);  
                    if(flag == false){  
                    callback(new Error('新密码必须由 4-16位字母、数字组成'));     
                    } else {
                    callback();
                    }  
                }
            };
            return {
                userName: this.$route.query.uname,
                fixPw: false,
                successState: false,
                errorState: false,
                formValidate: {
                    password: '',
                },
                ruleValidate: {
                    password: [
                        { required: true, message: '修改后的密码不能为空哦～', trigger: 'blur' },
                        { validator: validatePass, trigger: 'blur' }
                    ]
                }
            }
        },
        
        methods: {

            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('Success!');
                    } else {
                        this.$Message.error('Fail!');
                    }
                })
            },

            handleReset (name) {
                this.$refs[name].resetFields();
            },

            testEvent() {
                this.successState = true;
            }

        }
    }
</script>

<style lang="" scoped>
    
</style>