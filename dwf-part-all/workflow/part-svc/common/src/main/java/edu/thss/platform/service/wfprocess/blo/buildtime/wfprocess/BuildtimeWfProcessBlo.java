package edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess;

import edu.thss.platform.domain.itemclass.org.Group;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.service.org.OrgService;
import edu.thss.platform.service.wfprocess.BO.WfProcessTemplate;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.BuildtimeIDGenerator;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.NewBuildtimeEntityIdAssignerBlo;
import edu.thss.platform.service.wfprocess.core.buildtime.util.json.WfProcess2JSON;
import edu.thss.platform.service.wfprocess.core.buildtime.util.json.WfProcessJSONParser;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.data.*;
import edu.thss.platform.service.wfprocess.core.data.expression.ExpressionParser;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.repository.BusinessLogicObject;
import edu.thss.platform.service.wfprocess.eso.buildtime.wfprocess.BuildtimeWfProcessEso;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import edu.thss.platform.utils.BeanHelper;
import edu.thss.platform.service.modeler.MetaModelService;
import edu.thss.platform.service.modeler.bo.MetaClassBO;
import edu.thss.platform.service.modeler.bo.MetaAttributeBO;
import org.json.JSONArray;
import org.json.JSONObject;

import edu.thss.platform.domain.modeler.consts.AdminConst;


import edu.thss.platform.service.org.bo.Environment;

/**
 * @author Caodahai
 * @version 1.0
 */
public class BuildtimeWfProcessBlo extends BusinessLogicObject {

	private BuildtimeWfProcessEso processEso;

	private NewBuildtimeEntityIdAssignerBlo newBuildtimeEntityIdAssignerBlo;

	private MetaModelService metaModelService;

	private OrgService orgService;

	public BuildtimeWfProcessBlo() {
		this.processEso = new BuildtimeWfProcessEso();
		this.newBuildtimeEntityIdAssignerBlo = new NewBuildtimeEntityIdAssignerBlo();
		this.metaModelService = (MetaModelService) BeanHelper.getBean("metaModelService");
		this.orgService = (OrgService) BeanHelper.getBean("orgService");
	}

	/**
	 * Returns all workflow processes in current repository. Dahai updated on
	 * 20170808
	 *
	 * @param parent
	 * @param owner
	 * @return
	 * @throws Exception
	 */
//	public WfProcess[] getProcesses(TreeNode parent, WorkflowEntity owner) throws Exception {
//		List<WfProcess> procRos = processEso.queryAll(parent.getId(), owner.getId());
//		return procRos.toArray(new WfProcess[procRos.size()]);
//	}

	/**
	 * Return a process through specified <code>id</code>.
	 *
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public String getProcessContent(String id) throws Exception {
		return processEso.queryProcessContentByPK(id);
  }
  public String getProcessContent(String id, Environment env) throws Exception {
    // return processEso.queryProcessContentByPK(id);
    WfProcess wf = this.getProcessById(id);
    if(wf == null) throw new PlatformException("该模版不存在");
    if(this.isProprietorOfWfProcess(env.getUserOid(), wf)){
      return processEso.queryProcessContentByPK(id);
    }else{
      throw new PlatformException("用户未拥有模版查看权限");
    }
	}

	public WfProcess getProcessById(String id) throws Exception {
		return processEso.queryByPK(id);
	}

	/**
	 * Arithmetic: delete all the old tasks and old transitions of business process.
	 * Save business tasks and transitions of business process. Update time stamp of
	 * business process.
	 *
	 * @param process BusinessProcess
	 * @throws Exception
	 */

  public String saveWfProcess(WfProcess process, Environment env) throws Exception {
    if(this.isProprietorOfWfProcess(env.getUserOid(), process)){
      processEso.update(process);
      return "1";
    }else{
      throw new PlatformException("用户未拥有模版修改权限");
    }
	}
	public String saveWfProcess(WfProcess process) throws Exception {
		processEso.update(process);
		return "1";
	}

	public void toWfProcessTemlayeBo(WfProcess source, WfProcessTemplate target) {
		target.initByWfProcess(source);
	}

	/**
	 * 获取用户未发布的流程模版
	 * @param ownerId
	 * @return
	 * @throws Exception
	 */
	public List<WfProcessTemplate> getProcessTemplates(String ownerId) throws Exception {
    WfProcess[] procRos;
    if(ownerId.equals(AdminConst.OID)){
      procRos = this.getAllProcesses();
    }else{
      procRos = this.getAllProcessesOfProprietor(ownerId);
    }
		
		List<WfProcessTemplate> processTemplateBOS = new ArrayList<WfProcessTemplate>();
		for(WfProcess pro: procRos) {
			WfProcessTemplate wfProcessTemplate = new WfProcessTemplate();
			this.toWfProcessTemlayeBo(pro, wfProcessTemplate);
			processTemplateBOS.add(wfProcessTemplate);
		}
		return processTemplateBOS;

  }
  
	public WfProcess[] getAllProcesses() throws Exception {
    List<WfProcess> procRos = processEso.queryAll();
    return procRos.toArray(new WfProcess[procRos.size()]);
  }
  /**
   * 通过模版拥有者来获取用户未发布的流程模版
   */
	public WfProcess[] getAllProcessesOfProprietor(String uid) throws Exception {
		List<WfProcess> procRos = processEso.queryAll();
		List<WfProcess> list = new ArrayList<>();

		List<Group> res = orgService.getRecursiveParents(uid);
		List<String> groups = new ArrayList<>();
		for (int i = 0;i < res.size();i++) {
			groups.add(res.get(i).getOid());
		}
		for(WfProcess pro: procRos) {
			if(pro.getAuthorId().equals(uid)) {
				list.add(pro);
			}else{
				JSONArray pars = new JSONArray(pro.getProprietors().toString());
				if( pars.length()==0) {
					// 不设置模版的"拥有者"则所有用户都可以看到该模版
					list.add(pro);
				}else {
					for (int i = 0; i < pars.length(); i++) {
						JSONObject par = pars.getJSONObject(i);
						if (par.has("oid") && (
								uid.equals(par.getString("oid")) || groups.contains(par.getString("oid")))) {
							list.add(pro);
							break;
						}
					}
				}
			}
		}
		return list.toArray(new WfProcess[list.size()]);
	}

  public boolean isAdmin(String id){
    return id.equals(AdminConst.OID);
  }

	// 具有查看权限(Proprietor 是流程模版拥有者
	public boolean isProprietorOfWfProcess(String userId, WfProcess wfProcess) throws  Exception{
    if(this.isAdmin(userId) || wfProcess.getProprietors() == null || wfProcess.getProprietors().isEmpty()){
      return true;
    }
    JSONArray pars = new JSONArray(wfProcess.getProprietors().toString());
		if(pars.length()==0 ||  SaaSServer.getInstance().hasPermission(userId, pars)) {
			return true;
		}
		return false;
	}

	public List<WfProcessTemplate> getAllProcessTemplates() throws Exception {
		List<WfProcess> procRos = processEso.queryAll();
		List<WfProcessTemplate> processTemplateBOS = new ArrayList<WfProcessTemplate>();
		for(WfProcess pro: procRos) {
			WfProcessTemplate wfProcessTemplate = new WfProcessTemplate();
			this.toWfProcessTemlayeBo(pro, wfProcessTemplate);
			processTemplateBOS.add(wfProcessTemplate);
		}
		return processTemplateBOS;
	}


	/**
	 * Create new workflow process definition.
	 *
	 * @param process BusinessProcess
	 * @throws SQLException
	 */
	public int createNewWfProcess(WfProcess process) {
		try{
			processEso.insert(process);
			return 1;
		}catch(Exception e) {
			e.printStackTrace();
			return 0;
		}

	}

	public WfProcess createProcessTemplates(WfProcessTemplate newTemplate) throws Exception{
		BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
		String id = buildtimeIDGenerator.getNewBuildTimeID();
		String code = buildtimeIDGenerator.getNewBuildTimeCode();
		WfProcess newProcess = new WfProcess();
		newProcess.setId(id);
		newProcess.setCode(code);
		newProcess.setName(newTemplate.getName());
		newProcess.setLastupdate(System.currentTimeMillis());
		newProcess.setAuthorId(newTemplate.getAuthorId());
		newProcess.setAuthor(newTemplate.getAuthor());
		newProcess.setBindEnClassName(newTemplate.getBindEnClassName());
		String parentid = "000000R";
		newProcess.setParent(parentid);
		newProcess.setWorkflowType(2);
		// 自动添加对象属性
		List<DataVariable> vars = this.getDataVariableList(id,newProcess.getBindEnClassName());
		
		for(int i=0; vars!= null && i<vars.size(); i++) {
 			newProcess.addChild(vars.get(i));
		}
		String strWfProcess  = WfProcess2JSON.toPJSON(newProcess);
		newProcess.setProcessContent(strWfProcess);
		if(strWfProcess!=null && strWfProcess!="") {
			if(this.createNewWfProcess(newProcess)==1) {
				return newProcess;
			}else{
				return null;
			}

		}else{
			return null;}

	}

	/**
	 * Save a business process that is drafted.
	 *
	 * @param process draft version business process object.
	 * @throws Exception
	 */

	public void updateProcessName(WfProcess process) throws Exception {
		processEso.updateName(process.getId(), process.getName(), process.getProcessContent(), process.getLastupdate());
	}

	public void moveWfProcess(String pid, String parent, String content) throws Exception {
		processEso.updateParent(pid, parent, content, new Date());

	}

	/**
	 * Delete a wfprocess.
	 *
	 * @param processId
	 * @throws Exception
	 */
  public void deleteWfProcess(String processId) throws Exception {
		processEso.delete(processId);
	}
	public void deleteWfProcess(String processId, Environment env) throws Exception {
    WfProcess wf = this.getProcessById(processId);
    if(wf == null) throw new PlatformException("该模版不存在");
    if(this.isProprietorOfWfProcess(env.getUserOid(), wf)){
      // processEso.delete(processId);
    }else{
      throw new PlatformException("用户未拥有模版删除权限");
    }
  }
  public void deleteRlProcess(String processId) throws Exception {
    processEso.deleteRl(processId);
	}
	public void deleteRlProcess(String processId, Environment env) throws Exception {
    WfProcess wf = processEso.queryByPK(processId);
    if(wf == null) throw new PlatformException("该模版不存在");
    if(this.isProprietorOfWfProcess(env.getUserOid(), wf)){
      processEso.deleteRl(processId);
    }else{
      throw new PlatformException("用户未拥有模版删除权限");
    }
    
	}
	public void deleteWfProcesses(String[] processIds) throws Exception {
		if (processIds != null && processIds.length > 0) {
			for (String id : processIds) {
				processEso.delete(id);
			}
		}
	}

/**
 * 绑定该实体类的模版中有正在运行中的流程实例
 * @param className
 * @throws Exception
 */
	public void checkInstanceByClassName(String className) throws Exception {
		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
		List<String> processes = releasedWfProcessBlo.getAllIdByEnClass(className);
		List<String> releasedWfIds = releasedWfProcessBlo.queryAllReleasedWfProcessId();
		for (String id : processes) {
			if (!releasedWfIds.contains(id)) continue; // throw new PlatformException("id为" + id + "的模版不存在");
			if (SaaSServer.getInstance().hasRunningWfProInstance(id))
				throw new PlatformException("模版" + id + "有正在运行中的流程实例");
		}
	}

  /**
   * 删除绑定该实体类的所有已发布模版
   * @param className
   * @throws Exception
   */
	public void deleteProcessByEnClass(String className) throws Exception {
		// 删除所有未发布的模版
    List<String> processes = this.getAllIdByEnClass(className);
		for (String id : processes) { // 删除单个
			this.deleteWfProcess(id);
		}
    // 删除所有已发布的模版
		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
		processes = releasedWfProcessBlo.getAllIdByEnClass(className);
		for (String id : processes) {
			if (SaaSServer.getInstance().hasRunningWfProInstance(id))
			// 删除该流程模版下的所有流程实例
			SaaSServer.getInstance().removeAllInstances(id);
			// 删除该流程模版
			releasedWfProcessBlo.deleteWfProcess(id);
		}
	}

	public List<String> queryAllUnReleasedWfProcessId() {
		return processEso.queryAllUnReleasedWfProcessId();
	}
  /**
   * 所有绑定该实体类的未发布流程模版id
   * @param ename
   * @return
   * @throws Exception
   */
	public List<String> getAllIdByEnClass(String ename) throws Exception {
		List<String> procRos = processEso.queryAllIdByEnClass(ename);
		return procRos;
	}

	public List<String> getTemplateIdsByClassName(String ename) throws Exception {
		List<String> procRos = processEso.queryAllIdByEnClass(ename);
		return procRos;
	}

	public void copyNewWfProcess(WfProcess process) throws Exception {
		processEso.insert(process);
	}

	public WfProcess copyWfProcess(String pid) throws Exception {
		WfProcess p = processEso.queryByPK(pid);
		WfProcess proc = WfProcessJSONParser.parseWfProcess(p.getProcessContent());
		proc.setName(p.getName() + "_副本");
		ExpressionParser.parseExpressions(proc);
		// assign new ID and change process ID.
		newBuildtimeEntityIdAssignerBlo.assignNewEntityId(proc);
		// AssignOwnerIDUtil.changeCurrOwner(proc, proc.getId());
		String processContent = WfProcess2JSON.toPJSON(proc);
		proc.setProcessContent(processContent);
		processEso.insert(proc);
		return proc;
	}

	public List<DataVariable> getDataVariableList(String pid, String bindEnClassName) {
		List<DataVariable> dataVariables;
		try {
			MetaClassBO metaClassBO = metaModelService.getClassByName(bindEnClassName);
			if (metaClassBO != null) {
				List<MetaAttributeBO> result = metaClassBO.getAttributes();
				dataVariables = new ArrayList<>();
				for (MetaAttributeBO item : result) {
					String type = item.getValueType();
					Constant varObj;
					switch (type) {
						case "UUID":
						case "String":
						case "Date":
						case "TimeStamp":
						case "Long":
						case "Time":
							type = "String";
							varObj = new StringConstant();
							break;
						case "Boolean":
							varObj = new BooleanConstant();
							break;
						case "Integer":
							varObj = new IntegerConstant();
							break;
						case "Double":
							varObj = new DoubleConstant();
							break;
						default:
							continue;
					}
//					varObj.setValue(item.getDefaultValue());
					DataVariable dv = new DataVariable();
					dv.setOrderNumber(dataVariables.size() + 1);
					dv.setName(item.getAttributeName());
					dv.setId(item.getId());
					dv.setOwner("00000000000001R");
					dv.setCurrOwner(pid);
					dv.setDescription(item.getDisplayName());
					dv.setDatatype(type);
					dv.setValue(varObj);
					dataVariables.add(dv);
				}
				return dataVariables;
			}
		} catch (Exception e) { e.printStackTrace(); }
		return null;
	}

}
