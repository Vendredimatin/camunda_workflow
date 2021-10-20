package edu.thss.platform.service.wfprocess.runtime.engine.util;

//import com.cloud.core.session.redis.JedisUtil;
import edu.thss.platform.service.wfprocess.blo.runtime.wfprocessinstance.ProcessInstanceBlo;
import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.data.*;
import edu.thss.platform.service.wfprocess.core.data.variable.ArrayDataVariable;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstance2JSON;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance.ProcessInstanceEso;

import java.util.ArrayList;
import java.util.List;

/**
 * This is process instance save helper for all instance information into cache.
 *
 * @author Dahai Cao created at 9:47am on 2019-03-28
 */
public class ProcessInstanceSaver {

    private final static ProcessInstanceSaver insance = new ProcessInstanceSaver();

    private ProcessInstanceSaver() {
    }

    public static ProcessInstanceSaver getInstance() {
        return insance;
    }

    //每执行一步，都会存储一次（当然是覆盖一次了）到redis中
    public void saveCache(WfProcessInstance wfProcessInstance) throws Exception {
        if (wfProcessInstance != null) {
            String processInstance = WfProcessInstance2JSON.toJSON(wfProcessInstance);
            ProcessInstanceEso.getInstance().saveInst(wfProcessInstance.getId(), processInstance);
            //JedisUtil.getInstance().set("TPROCESS_" + wfProcessInstance.getId(), processInstance);
        }
    }

    public void saveDataVariable(Object v, TreeNode n) {
        if (n instanceof ArrayDataVariable) {
            ArrayDataVariable dv = (ArrayDataVariable) n;
            if (v instanceof String[]) {
                String[] arry = (String[]) v;
                if (dv.getDatatype().equals(DataType.INTEGER)) {
                    if (arry != null && arry.length > 0) {
                        List<IntegerConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            IntegerConstant constant = new IntegerConstant();
                            constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new IntegerConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.DOUBLE)) {
                    if (arry != null && arry.length > 0) {
                        List<DoubleConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            DoubleConstant constant = new DoubleConstant();
                            constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new DoubleConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.BOOLEAN)) {
                    if (arry != null && arry.length > 0) {
                        List<BooleanConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            BooleanConstant constant = new BooleanConstant();
                            constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new BooleanConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.STRING)) {
                    if (arry != null && arry.length > 0) {
                        List<StringConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            StringConstant constant = new StringConstant();
                            constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new StringConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.CURRENCY)) {
                    if (arry != null && arry.length > 0) {
                        List<DoubleConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            DoubleConstant constant = new DoubleConstant();
                            constant.setDatatype(DataType.CURRENCY);
                            constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new DoubleConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.FILE)) {
                    if (arry != null && arry.length > 0) {
                        List<FileConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            FileConstant constant = new FileConstant();
                            constant.setDatatype(DataType.FILE);
                            //constant.setValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new FileConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.DATE)) {
                    if (arry != null && arry.length > 0) {
                        List<DateTimeConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            DateTimeConstant constant = new DateTimeConstant();
                            constant.setDatatype(DataType.DATE);
                            constant.setStringValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new DateTimeConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.TIME)) {
                    if (arry != null && arry.length > 0) {
                        List<DateTimeConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            DateTimeConstant constant = new DateTimeConstant();
                            constant.setDatatype(DataType.TIME);
                            constant.setStringValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new DateTimeConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.DATETIME)) {
                    if (arry != null && arry.length > 0) {
                        List<DateTimeConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            DateTimeConstant constant = new DateTimeConstant();
                            constant.setDatatype(DataType.DATETIME);
                            constant.setStringValue(arry[i]);
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new DateTimeConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.TIMEDURATION)) {
                    if (arry != null && arry.length > 0) {
                        List<TimDurationConstant> conts = new ArrayList<>();
                        for (int i = 0; i < arry.length; i++) {
                            TimDurationConstant constant = new TimDurationConstant();
                            constant.setDatatype(DataType.TIMEDURATION);
                            constant.setStringValue(v.toString());
                            conts.add(constant);
                        }
                        dv.setValues(conts.toArray(new TimDurationConstant[arry.length]));
                    }
                } else if (dv.getDatatype().equals(DataType.JSON)) {
                } else if (dv.getDatatype().equals(DataType.HANDWRITING)) {
                }
            }
        } else if (n instanceof DataVariable) {
            DataVariable dv = (DataVariable) n;
            if (dv.getDatatype().equals(DataType.INTEGER)
                    || dv.getDatatype().equals(DataType.DOUBLE)
                    || dv.getDatatype().equals(DataType.BOOLEAN)
                    || dv.getDatatype().equals(DataType.STRING)
                    || dv.getDatatype().equals(DataType.CURRENCY)) {
                if (v instanceof String) {
                    ((Constant) dv.getValue()).setValue(v.toString());
                }else if(v!=null){
                    ((Constant) dv.getValue()).setValue(v.toString());
                }
            } else if (dv.getDatatype().equals(DataType.FILE)) {
            } else if (dv.getDatatype().equals(DataType.DATE)) {
                ((DateTimeConstant) dv.getValue()).setStringValue(v.toString());
            } else if (dv.getDatatype().equals(DataType.TIME)) {
                ((DateTimeConstant) dv.getValue()).setStringValue(v.toString());
            } else if (dv.getDatatype().equals(DataType.DATETIME)) {
                ((DateTimeConstant) dv.getValue()).setStringValue(v.toString());
            } else if (dv.getDatatype().equals(DataType.TIMEDURATION)) {
                ((TimDurationConstant) dv.getValue()).setStringValue(v.toString());
            } else if (dv.getDatatype().equals(DataType.JSON)) {
            } else if (dv.getDatatype().equals(DataType.HANDWRITING)) {
            }
            // 在这里添加一个保存事件日志。
        }
    }

}
