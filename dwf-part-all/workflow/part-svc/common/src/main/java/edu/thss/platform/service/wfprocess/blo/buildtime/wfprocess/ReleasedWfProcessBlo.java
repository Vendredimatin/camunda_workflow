package edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess;

import edu.thss.platform.domain.itemclass.org.Group;
import edu.thss.platform.domain.itemclass.org.User;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.service.org.OrgService;
import edu.thss.platform.service.wfprocess.BO.ReleasedWfProcessTemplate;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.BuildtimeIDGenerator;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.NewBuildtimeEntityIdAssignerBlo;
import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.util.json.WfProcess2JSON;
import edu.thss.platform.service.wfprocess.core.buildtime.util.json.WfProcessJSONParser;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessListPage;
import edu.thss.platform.service.wfprocess.core.data.expression.ExpressionParser;
import edu.thss.platform.service.wfprocess.core.repository.BusinessLogicObject;
import edu.thss.platform.service.wfprocess.core.util.SystemConfig;
import edu.thss.platform.service.wfprocess.core.util.file.FileUtil;
import edu.thss.platform.service.wfprocess.eso.buildtime.wfprocess.BuildtimeWfProcessEso;
import edu.thss.platform.service.wfprocess.eso.buildtime.wfprocess.ReleasedWfProcessEso;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import edu.thss.platform.utils.BeanHelper;
import org.json.JSONArray;
import org.json.JSONObject;

import edu.thss.platform.domain.modeler.consts.AdminConst;

import edu.thss.platform.service.org.bo.Environment;

/**
 * 
 * @author Cao Dahai updated 2017-02-02
 * @version 1.0
 */
public class ReleasedWfProcessBlo extends BusinessLogicObject {

	private ReleasedWfProcessEso processEso;

	private BuildtimeIDGenerator buildtimeIDGenerator;

	private NewBuildtimeEntityIdAssignerBlo newBuildtimeEntityIdAssignerBlo;

	private BuildtimeWfProcessEso procEso;

	private OrgService orgService;

	public ReleasedWfProcessBlo() {
		this.processEso = new ReleasedWfProcessEso();
		this.buildtimeIDGenerator = new BuildtimeIDGenerator();
		this.newBuildtimeEntityIdAssignerBlo = new NewBuildtimeEntityIdAssignerBlo();
		this.procEso = new BuildtimeWfProcessEso();
		this.orgService = (OrgService) BeanHelper.getBean("orgService");
	}


//	public ReleasedWfProcess[] getProcesses(TreeNode parent, WorkflowEntity owner) throws Exception {
//		List<ReleasedWfProcess> procRos = processEso.queryAll(parent.getId(), owner.getId());
//		return procRos.toArray(new ReleasedWfProcess[procRos.size()]);
//	}

	public boolean hasUserByOid(String userId){
		User userById = orgService.getUserByOid(userId);
		if (userById == null) return false;
		else return true;
	}

	/**
	 * 获取用户已发布的流程模版
	 * @param userId
	 * @return
	 * @throws Exception
	 */
    public List<ReleasedWfProcessTemplate> getReleasedProcessTemplates(String userId) throws Exception {
      ReleasedWfProcess[] procRos;
      if(userId.equals(AdminConst.OID)){
        procRos = this.getAllProcesses();
      }else{
        procRos = this.getAllProcessesOfProprietor(userId);
      }
        List<ReleasedWfProcessTemplate> templates = new ArrayList<>();
        for(ReleasedWfProcess pro : procRos){
            ReleasedWfProcessTemplate t = new ReleasedWfProcessTemplate();
            t.initByWfProcess(pro);
            templates.add(t);
        }
        return templates;

    }

    public boolean isAdmin(String id){
      return id.equals(AdminConst.OID);
    }

	// 具有查看权限(Proprietor 是流程模版拥有者
	public boolean isProprietorOfWfProcess(String userId, WfProcess releasedWfProcess) throws  Exception{
    if(this.isAdmin(userId) || releasedWfProcess.getProprietors() == null || releasedWfProcess.getProprietors().isEmpty()){
      return true;
    }
    JSONArray pars = new JSONArray(releasedWfProcess.getProprietors().toString());
		if(pars.length()==0 || SaaSServer.getInstance().hasPermission(userId, pars)){
			return true;
		}
		return false;
  }
  

	public ReleasedWfProcess[] getAllProcesses() throws Exception {
		List<ReleasedWfProcess> procRos = processEso.queryAll();
		return procRos.toArray(new ReleasedWfProcess[procRos.size()]);
  }

	public ReleasedWfProcess[] getAllProcessesOfProprietor(String uid) throws Exception {
		List<ReleasedWfProcess> procRos = processEso.queryAll();
		List<ReleasedWfProcess> list = new ArrayList<>();

		List<Group> res = orgService.getRecursiveParents(uid);
		List<String> groups = new ArrayList<>();
		for (int i = 0;i < res.size();i++) {
			groups.add(res.get(i).getOid());
		}

		for(ReleasedWfProcess pro: procRos){
			if(pro.getAuthorId().equals(uid)){
				list.add(pro);
			}else{
				JSONArray pars = new JSONArray(pro.getProprietors().toString());
				if( pars.length()==0){
					// 不设置模版的"拥有者"则所有用户都可以看到该模版
					list.add(pro);
				}else {
					for (int i = 0; i < pars.length(); i++) {
						JSONObject par = pars.getJSONObject(i);
						if (par.has("oid") &&(par.getString("oid").equals(uid) 
								|| groups.contains(par.getString("oid")))) {
							list.add(pro);
							break;
						}
					}
				}
			}
		}
		return list.toArray(new ReleasedWfProcess[list.size()]);
	}

	public List<String> queryAllReleasedWfProcessId(){
		return processEso.queryAllReleasedWfProcessId();
	}
    public List<ReleasedWfProcessTemplate> getAllReleasedProcessTemplates() throws Exception {
        List<ReleasedWfProcess> procRos = processEso.queryAll();
        List<ReleasedWfProcessTemplate> templates = new ArrayList<>();
        for(ReleasedWfProcess pro : procRos){
            ReleasedWfProcessTemplate t = new ReleasedWfProcessTemplate();
            t.initByWfProcess(pro);
            templates.add(t);
        }
        return templates;

    }

	public List<String> getAllIdByEnClass(String ename) throws Exception {
		List<String> procRos = processEso.queryAllIdByEnClass(ename);
		return procRos;
	}
//	public ReleasedWfProcess[] getRlProListByEnClass(String ename) throws Exception {
//		List<ReleasedWfProcess> procRos = processEso.queryAllByEnClass(ename);
//		return procRos.toArray(new ReleasedWfProcess[procRos.size()]);
//	}
	public List<ReleasedWfProcess> getRlProListByEnClass(String ename) throws Exception {
		List<ReleasedWfProcess> procRos = processEso.queryAllByEnClass(ename);
		return procRos;
	}
	public List<ReleasedWfProcess> getRlProListToLuanch(String ename,String uid) throws Exception {
		List<ReleasedWfProcess> procRos = processEso.queryAllByEnClass(ename);
		// 判断权限
		List<ReleasedWfProcess> list = new ArrayList<>();
		for(ReleasedWfProcess rlpro :procRos){
			// 判断是否为创建人
			if(rlpro.getAuthorId().equals(uid)){
				list.add(rlpro);
			}else{ //判断是否具有拥有者权限
				JSONArray pars = new JSONArray(rlpro.getProprietors().toString());
				if (pars.length() > 0) {
					List<Group> res = orgService.getUserGroups(uid);
					List<String> groups = new ArrayList<>();
					for (int i = 0; i < res.size(); i++) {
						groups.add(res.get(i).getOid());
					}
					for(int i =0;i<pars.length();i++){
						JSONObject par = pars.getJSONObject(i);
						if(par.has("oid") && (par.get("oid").equals(uid)||groups.contains(par.get("oid")))){
							list.add(rlpro);
							break;
						}
					}
				}else{
					// 无拥有者，即无权限限制
					list.add(rlpro);
				}
			}

		}
		return list;
	}

	/**
	 * Return a process in JSON format through specified <code>id</code>.
	 * 获取一个已发布的流程模版
	 * @param pid
	 * @return
	 * @throws Exception
	 */
	public ReleasedWfProcess getRlTemplate(String pid) throws Exception {
		return processEso.queryReleasedProcess(pid);
	}

	/**
	 * Return a process through specified <code>id</code>.
	 * 获取一个未发布的流程模版
	 * @param id
	 * @return
	 * @throws Exception
	 */
	
	public ReleasedWfProcess prepReleasedWfProcess(String id) throws Exception {
		return processEso.queryByPKForRelease(id);
	}

	/**
	 * Arithmetic: delete all the old tasks and old transitions of business
	 * process. Save business tasks and transitions of business process. Update
	 * time stamp of business process.
	 * 
	 * @param proc
	 *            released business process
	 * @throws Exception
	 */
	
	public void saveWfProcess(ReleasedWfProcess proc) throws Exception {
		processEso.delete(proc.getId());
		processEso.insert(proc);
	}

	/**
	 * Delete a released wfprocess.
	 * 
	 * @param processId
	 * @throws Exception
	 */
	
	public void deleteWfProcess(String processId) throws Exception {
		processEso.delete(processId);
  }
  
  /**
   * 删除一个已发布的流程模版
   * @param processId
   * @param env
   * @throws Exception
   */
  public void deleteRlTemplate(String processId, Environment env) throws Exception {
    WfProcess wf =  this.getRlTemplate(processId);
    if(wf == null )  throw new PlatformException("该模版不存在");
    if(this.isProprietorOfWfProcess(env.getUserOid(), wf)){
      if (!SaaSServer.getInstance().hasRunningWfProInstance(processId)) {
        processEso.delete(processId);
      } else{
        throw new PlatformException("删除失败，该模版有正在运行中的流程实例");
      }
    }else{
      throw new PlatformException("用户未拥有模版删除权限");
    }
  }
  
	public String releaseWfProcessTemplate(ReleasedWfProcessTemplate template) throws  Exception{
		String pid = template.getTemplateId();
		ReleasedWfProcess newprocess = this.prepReleasedWfProcess(pid);
		if(newprocess == null){
			throw new Exception("流程模版id不存在");
		}
		int res = processEso.checkVersion(newprocess.getName(), template.getVersion());
//		if (res == 1) throw new Exception("重复版本");
		if (res == 1) return null;
		newprocess.setVersion(template.getVersion());
		newprocess.setReleaserId(template.getReleaserId());
		newprocess.setReleaser(template.getReleaser());
		newprocess.setReleaseStatement(template.getReleaseStatement());
		newprocess.setReleaseDate(System.currentTimeMillis());
		newprocess.setDeprecated(1);// 1 是指还没有申请上线（上架）
        newprocess.setDescription(template.getDescription());

		String oldparent = newprocess.getParent();
		String parent = "000000R";
		String orgid = "";
		newprocess.setParent(parent);
		newprocess.setOwner(orgid);
		// change ID and change Organization ID.
		String id = buildtimeIDGenerator.getNewBuildTimeID();
		newprocess.setId(id);
		String content = newprocess.getProcessContent();
		String newcontent = content.replaceAll(pid, id);
		newcontent = newcontent.replaceAll(oldparent, parent);
		newprocess.setProcessContent(newcontent);
		newprocess.setOwner(orgid);

		processEso.delete(newprocess.getId());
		processEso.insert(newprocess);

//		String storagetype = SystemConfig.getProp("filestorage.type");
//		String syspath = "";
//		if (storagetype.trim().equals("win")) {
//			syspath = SystemConfig.getProp("windows.filestorage.lib");
//		} else if (storagetype.trim().equals("linux")) {
//			syspath = SystemConfig.getProp("linux.filestorage.lib");
//		}
//		if (!syspath.equals("")) {
//			String src = syspath + "/" + orgid + "/pm/" + pid + "/";
//			String dist = syspath + "/" + orgid + "/rlp/" + newprocess.getId() + "/";
//			FileUtil.copyFolder(new File(src), new File(dist));
//		}

		return newprocess.getId();
	}
	/**
	 * Arithmetic: delete all the old tasks and old transitions of business
	 * process. Save business tasks and transitions of business process. Update
	 * time stamp of business process.
	 *
	 *            released business process
	 * @throws Exception
	 */
	
	public String sendWfProcessForApproval(String pid, String version, String releaser, String releaserid, String versionnote,
			 String parent, String orgid) throws Exception {
		ReleasedWfProcess newprocess = this.prepReleasedWfProcess(pid);
		int res = processEso.checkVersion(newprocess.getName(), version);
		if (res == 1) throw new Exception("重复版本");
		newprocess.setVersion(version);
		newprocess.setReleaserId(releaserid);
		newprocess.setReleaser(releaser);
		newprocess.setReleaseStatement(versionnote);
		newprocess.setReleaseDate(System.currentTimeMillis());
		newprocess.setDeprecated(1);// 1 是指还没有申请上线（上架）
		String oldparent = newprocess.getParent();
		newprocess.setParent(parent);
		newprocess.setOwner(orgid);
		// newprocess.setProprietors(newprocess.getProprietors());

		// change ID and change Organization ID.
		String id = buildtimeIDGenerator.getNewBuildTimeID();
		newprocess.setId(id);
		String content = newprocess.getProcessContent();
		String newcontent = content.replaceAll(pid, id);
		newcontent = newcontent.replaceAll(oldparent, parent);
		newprocess.setProcessContent(newcontent);
		newprocess.setOwner(orgid);

		// AissgnNewEntityIDUtil.assignNewBuildtimeEntityId(newprocess);
		// AssignOwnerIDUtil.changeCurrOwner(newprocess,
		// newprocess.getId());
		// change ID and change Organization ID.

		
		processEso.delete(newprocess.getId());
		processEso.insert(newprocess);

		// copy wf process dir to released wf process
		String storagetype = SystemConfig.getProp("filestorage.type");
		String syspath = "";
		if (storagetype.trim().equals("win")) {
			syspath = SystemConfig.getProp("windows.filestorage.lib");
		} else if (storagetype.trim().equals("linux")) {
			syspath = SystemConfig.getProp("linux.filestorage.lib");
		}
		if (!syspath.equals("")) {
			String src = syspath + "/" + orgid + "/pm/" + pid + "/";
			String dist = syspath + "/" + orgid + "/rlp/" + newprocess.getId() + "/";
			FileUtil.copyFolder(new File(src), new File(dist));
		}
		return newprocess.getId();
	}

	
	public void updateReleasedWfProcess(ReleasedWfProcess proc) throws Exception {
		
		processEso.update(proc);
	}

	/**
	 * @author Dahai Cao last updated at 16:32 on 2018-10-15
	 * @param id
	 * @param status
	 *            0: 已经申请上线（上架），1：还没有申请上线（上架）。
	 * @throws Exception
	 */
	
	public void releasedWfProcess(String id, int status) throws Exception {
		
		ReleasedWfProcess proc = processEso.queryReleasedProcess(id);
		proc.setProcessContent(null);
		processEso.update(id, status);

	}

	/**
	 * @author Dahai Cao last updated at 16:32 on 2018-10-15
	 * @param id
	 * @param status
	 *            2: 已经上线（上架）; 0: 申请上线（上架）;
	 * @param date
	 * @throws Exception
	 */
	public void modifyWfProcessStatus(String id, int status, long date) throws Exception {
		processEso.updateDeprecated(id, status, date);

	}

	
	public void deleteReleasedWfProcesses(String[] processIds) throws Exception {
		if (processIds != null && processIds.length > 0) {
			for (String id : processIds) {
				processEso.delete(id);
			}
		}
	}

	public void moveReleasedWfProcess(String pid, String parentID, String content) throws Exception {
		processEso.updateParent(pid, parentID, content, new Date());
	}

	public WfProcess copyReleasedWfProcess(String pid) throws Exception {
		ReleasedWfProcess p = processEso.queryReleasedProcess(pid);
		WfProcess proc = WfProcessJSONParser.parseWfProcess(p.getProcessContent());
		proc.setName(p.getName() + "_副本");
		ExpressionParser.parseExpressions(proc);
		// assign new ID and change process ID.
		newBuildtimeEntityIdAssignerBlo.assignNewEntityId(proc);
		// AssignOwnerIDUtil.changeCurrOwner(proc, proc.getId());
		String processContent = WfProcess2JSON.toPJSON(proc);
		proc.setProcessContent(processContent);
		procEso.insert(proc);
		return proc;
	}

	/**
	 * Buying one wfprocess has two patterns: modify and not modify. The former
	 * means that buyer wants to modify the wfprocess then release it again.
	 * While the latter means that buyer does not want to modify it. We will
	 * update the access level of the wfprocess as organization internal level.
	 * 
	 * @author Dahai Cao created on 2018-06-18 22:56
	 * 
	 * @param id
	 * @param parent
	 * @param owner
	 * @param modify
	 * @return
	 * @throws Exception
	 */
	public WfProcess buyWfProcess(String id, String parent, String owner, String modify) throws Exception {
		ReleasedWfProcess p = processEso.queryReleasedProcess(id);
		String oldowner = p.getOwner();
		String oldparent = p.getParent();
		String content = p.getProcessContent();
		String newcontent = content.replaceAll(oldowner, owner);
		newcontent = newcontent.replaceAll(oldparent, parent);
		p.setParent(parent);
		p.setOwner(owner);
		if (modify.equals("1")) {
			WfProcess proc = WfProcessJSONParser.parseWfProcess(newcontent);
			proc.setName(p.getName() + "_副本");
			ExpressionParser.parseExpressions(proc);
			newBuildtimeEntityIdAssignerBlo.assignNewEntityId(proc);
			String processContent = WfProcess2JSON.toPJSON(proc);
			proc.setProcessContent(processContent);
			procEso.insert(proc);
			return proc;
		} else if (modify.equals("0")) {
			ReleasedWfProcess proc = WfProcessJSONParser.parseReleasedWfProcess(newcontent);
			proc.setName(p.getName());
			proc.setVersion(p.getVersion());
			proc.setReleaser(p.getReleaser());
			proc.setReleaserId(p.getReleaserId());
			proc.setReleaseDate(p.getReleaseDate());
			proc.setReleaseStatement(p.getReleaseStatement());
			proc.setLikeCounting(p.getLikeCounting());
			proc.setTotalDownloading(p.getTotalDownloading());
			proc.setTotalUseCounting(p.getTotalUseCounting());
			proc.setSuccessCounting(p.getSuccessCounting());
			proc.setTerminationCounting(p.getTerminationCounting());
			proc.setSuspensionCounting(p.getSuspensionCounting());
			ExpressionParser.parseExpressions(proc);
			newBuildtimeEntityIdAssignerBlo.assignNewEntityId(proc);
			String processContent = WfProcess2JSON.toRPJSON(proc);
			proc.setProcessContent(processContent);
			processEso.insert(proc);
			return proc;
		}
		return null;
	}

	/**
	 * 
	 * @param condition
	 * @param pageno
	 * @param pagesize
	 * @return
	 * @throws Exception
	 */
	public WfProcessListPage searchWfProcess(int deprecated, String condition, int pageno, int pagesize)
			throws Exception {
		WfProcessListPage page = new WfProcessListPage(pageno, pagesize);
		int total = processEso.queryWfProcessCounting(deprecated);
		if (total == 0) {
			page.setPageSize(pagesize);
			page.setPageNo(1);
			page.setAllEntitiesCount(0);
			page.setAllPagesCount(0);
			page.setPageIndex(0);
		} else {
			page.setPageSize(pagesize);
			if (condition == null || condition.equals("")) {
				page.setPageNo(pageno);
				page.setAllEntitiesCount(pagesize);
				int n = total / pagesize;
				int m = total % pagesize;
				if (m > 0) {
					n = n + 1;
				}
				page.setAllEntitiesCount(n);
				int pageindex = (pageno - 1) * pagesize;
				page.setPageIndex(pageindex);
				List<ReleasedWfProcess> pro = processEso.queryWfProcessPro(deprecated, pageindex, pagesize);
				page.setPageEntities(pro.toArray(new ReleasedWfProcess[pro.size()]));
			} else {
				total = processEso.queryWfProcessProCounting(condition);
				page.setPageNo(pageno);
				page.setAllEntitiesCount(total);
				int n = total / pagesize;
				int m = total % pagesize;
				if (m > 0) {
					n = n + 1;
				}
				page.setAllPagesCount(n);
				int pageindex = (pageno - 1) * pagesize;
				List<ReleasedWfProcess> pro = processEso.queryWfProcessPro(condition, pageindex, pagesize);
				page.setPageEntities(pro.toArray(new ReleasedWfProcess[pro.size()]));
			}
		}
		return page;
	}

}
