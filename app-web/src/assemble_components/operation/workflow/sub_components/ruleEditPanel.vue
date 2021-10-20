<template>

    <Modal v-model="show" :mask-closable="false" title="表达式编辑器" width="1000" @on-cancel='onclose'>
        <Row class="ruleEditPanel">
                <Col span="11" ><Card dis-hover style="height:250px">
                    <ul id="change" style="height:210px;overflow-y:scroll">
                      <li v-for="v in processVariable" :class="{active:ruleVariable.name==v.name}"  @click="clickRuleVariable(v)" @dblclick="addVar(v.id)">{{v.name}}</li>
                    </ul>
                </Card></Col>
                <Col span="11" offset="2"><Card dis-hover style="height:250px">
                    <div v-if="ruleVariable!=null">
                        <div>变量英文名：{{ruleVariable.name}}</div>
                        <div>变量中文名：{{ruleVariable.description}}</div>
                        <div>变量类型：{{ruleVariable.datatype}}</div>
                        <div>变量id：{{ruleVariable.id}}</div>
                    </div>
                </Card></Col>
        </Row>
        <Row style="text-align: center; margin-top: 20px;">
                <ButtonGroup size="large">
                    <Button :disabled="ruleVariable.name==''" icon="ios-add-circle-outline" @click="addVar(ruleVariable.id)"></Button>
                    <Button title="加" @click=" clickOperation('+')">+</Button>
                    <Button title="减" @click=" clickOperation('-')">-</Button>
                    <Button title="乘" @click=" clickOperation('*')">*</Button>
                    <Button title="除" @click=" clickOperation('/')">/</Button>
                    <Button  @click=" clickOperation('(')">(</Button>
                    <Button  @click=" clickOperation(')')">)</Button>
                    <Button  @click=" clickOperation('[')">[</Button>
                    <Button  @click=" clickOperation(']')">]</Button>
                    <Button title="等于" @click=" clickOperation('==')">==</Button>
                    <Button title="小于或等于" @click=" clickOperation('<=')"><=</Button>
                    <Button title="大于或等于" @click=" clickOperation('>=')">>=</Button>
                    <Button title="不等于" @click=" clickOperation('!=')">!=</Button>
                    <Button title="求与" @click=" clickOperation('&&')">&&</Button>
                    <Button title="求或" @click=" clickOperation('||')">||</Button>
                    <Button type="error" icon="ios-trash-outline" @click="resetOpertion()"></Button>
                </ButtonGroup>
        </Row>
        <Row>
            <Col span='6'>
                <div>常数类型</div>
                <Select v-model="constSelected" >
                  <Option v-for="item in constantSelect" :value="item.value" :key="item.value">{{item.lable}}</Option>
                </Select>
            </Col>
            <Col span='15' style='padding-left:5px'>
            <div>数值</div>
                <Input v-show="constSelected!='Boolean'" v-model="constInput"></Input>
                <RadioGroup v-show="constSelected=='Boolean'" v-model="constInput">
                    <Radio label="true"></Radio>
                    <Radio label="false"></Radio>
                </RadioGroup>
               
            </Col>
            <Col span='1' style='padding-left:5px'>
            <div>添加</div>
              <Button :disabled="constInput==null" icon="ios-add-circle-outline" type="primary" @click="addConstant()"></Button>
            </Col>
            
        </Row>
        <Row style="margin-top:20px;">
            <Input v-model="navigationRuleString" readonly="readonly" type="textarea" :rows="5" placeholder="" />
        </Row>
        <div slot="footer">
            <Button type="text" size="large" @click="onclose">取消</Button>
            <Button type="primary" size="large" @click="saveNavigationRule">确认</Button>
        </div>
    </Modal>
</template>
<script>
export default {
    props:['show','propertyObj','navigationRuleModal','processVariable','wfprocess'],
    data(){
        return {
            ruleVariable:{'name':''},
            expressionEntity:null,
            navigationRuleString:"",
            constantSelect: [
                {
                    value:'Integer',
                    lable:'整数',
                },{
                    value:'Double',
                    lable:'浮点数',
                },{
                    value:'Boolean',
                    lable:'布尔值',
                },{
                    value:'String',
                    lable:'字符串',
                },
                // {
                //     value:'DateTime',
                //     lable:'日期时间',
                // },{
                //     value:'Date',
                //     lable:'日期',
                // },{
                //     value:'Time',
                //     lable:'时间',
                // }
            ],
            constSelected: 0,
            constInput:'',
            
        }
       
    },
    watch:{
        'show'(newV,oldV) {

            if ('navigationRule' in this.propertyObj && this.propertyObj.navigationRule != null) {
                this.expressionEntity = this.propertyObj.navigationRule;
                
            }else{
                this.expressionEntity = new Expression();
            }
            this.updateExpression();
            
        },
        'propertyObj'(propertyObj){
            if ('navigationRule' in this.propertyObj && this.propertyObj.navigationRule != null) {
                this.expressionEntity = this.propertyObj.navigationRule;
                this.updateExpression();
            }else{
                this.expressionEntity = new Expression();
            }
        },
    },
    mounted(){
        
    },
    methods:{
        updateExpression(){
            this.navigationRuleString = this.expressionEntity.toString();
        },
        onclose(){
            this.$emit('on-close');
            this.ruleVariable= {'name':''};
        },
        addConstant(){
            if(this.constInput==''||this.constInput==null){
                
            }else{
                var constant;
                if(this.constSelected=='Integer'){
                    constant = new IntegerConstant();
                }else if(this.constSelected=='Boolean'){
                    constant = new BooleanConstant();
                }else if(this.constSelected=="Double"){
                    constant = new DoubleConstant();
                }else{
                    constant = new StringConstant();
                }
                constant.value = this.constInput;
                this.expressionEntity.insert(constant);
                this.updateExpression();
                this.constInput = '';
            }
        },
        addVar(value){
            // console.log("addVarvalue:",value);
            this.expressionEntity.insert(this.wfprocess.seekChildByID(value));
                        //this.varlistSelect.value
            this.updateExpression();
        },
        resetOpertion(){
            if (this.expressionEntity != null) {
            this.expressionEntity.removeAll();
            this.navigationRuleString = '';
		}
        },
        clickOperation(value){
            var op = new Operator();
			op.symbol = value;
            this.expressionEntity.insert(op);
            this.updateExpression();
        },
        clickRuleVariable(v){
            this.ruleVariable = v;
        },
       
        saveNavigationRule(){
            this.$emit('save');
        },
    },
    
}
</script>