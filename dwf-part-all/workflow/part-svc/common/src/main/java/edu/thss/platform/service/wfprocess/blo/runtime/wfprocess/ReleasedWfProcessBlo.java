package edu.thss.platform.service.wfprocess.blo.runtime.wfprocess;

import edu.thss.platform.service.wfprocess.blo.runtime.id.NewRuntimeEntityIdAssignerBlo;
import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.util.json.WfProcessJSONParser;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.Assignment;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.EndPoint;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.StartPoint;
import edu.thss.platform.service.wfprocess.core.data.DataType;
import edu.thss.platform.service.wfprocess.core.data.FileConstant;
import edu.thss.platform.service.wfprocess.core.data.expression.Expression;
import edu.thss.platform.service.wfprocess.core.data.expression.ExpressionParser;
import edu.thss.platform.service.wfprocess.core.data.variable.ArrayDataVariable;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.repository.BusinessLogicObject;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstanceJSONParser;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.SubprocessPointInstance;
import edu.thss.platform.service.wfprocess.core.util.SystemConfig;
import edu.thss.platform.service.wfprocess.eso.runtime.wfprocess.ReleasedWfProcessEso;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * @author Cao Dahai updated 2017-02-02
 * @version 1.0
 */
@Transactional
public class ReleasedWfProcessBlo extends BusinessLogicObject {

	private final static ReleasedWfProcessBlo instance = new ReleasedWfProcessBlo();

	private ReleasedWfProcessBlo() {
	}

	public static ReleasedWfProcessBlo getInstance() {
		return instance;
	}

	/**
	 * Return a process in JSON format through specified <code>id</code>.
	 * 
	 * @param pid
	 * @return
	 * @throws Exception
	 */
	// public ReleasedWfProcess getReleasedProcess(String pid) throws Exception
	// {
	// ReleasedWfProcessEso processEso = new ReleasedWfProcessEso();
	// return processEso.queryReleasedProcess(pid);
	// }

	/**
	 * Gets a released business process through specified <code>id</code> for
	 * runtime.
	 * 
	 * @param pid
	 *            released process ID
	 * 
	 * @return WfProcessInstance object
	 * @throws Exception
	 * @date Dahai Cao created on 2017-02-15 for BPM server design
	 */
	public WfProcessInstance getReleasedProcessForRuntime(String pid) throws Exception {
		// 发起流程时新增一个实体类对象 绑定oid
		ReleasedWfProcessEso processESO = new ReleasedWfProcessEso();
		//long s = System.currentTimeMillis();
		ReleasedWfProcess rlprocess = processESO.queryReleasedProcess(pid);
		//System.out.println("Get released process instance>>>>>>>>>>>>>>>:" + (System.currentTimeMillis() - s) + "ms");
		if (rlprocess != null) {
			String process = rlprocess.getProcessContent();

			//long s1 = System.currentTimeMillis();
			WfProcessInstance processInstance = WfProcessInstanceJSONParser.parseWfProcessInstance(process);

			processInstance.setBindEnClassName(rlprocess.getBindEnClassName());
			processInstance.setDescription(rlprocess.getDescription());
			processInstance.setKeywords(rlprocess.getKeywords());
			processInstance.setAuthorId(rlprocess.getAuthorId());
			processInstance.setAuthor(rlprocess.getAuthor());
			processInstance.setVersion(rlprocess.getVersion());
			processInstance.setReleaserId(rlprocess.getReleaserId());
			processInstance.setReleaser(rlprocess.getReleaser());
			processInstance.setReleaseDate(rlprocess.getReleaseDate());
			processInstance.setReleaseStatement(rlprocess.getReleaseStatement());
			processInstance.setWfProcessId(rlprocess.getId());
			processInstance.setDeprecated(rlprocess.getDeprecated());
			processInstance.setLikeCounting(rlprocess.getLikeCounting());
			processInstance.setTotalUseCounting(rlprocess.getTotalUseCounting());
			processInstance.setTotalDownloading(rlprocess.getTotalDownloading());
			processInstance.setSuccessCounting(rlprocess.getSuccessCounting());
			processInstance.setTerminationCounting(rlprocess.getTerminationCounting());
			processInstance.setSuspensionCounting(rlprocess.getSuspensionCounting());
			//long s2 = System.currentTimeMillis();
			ExpressionParser.parseExpressions(processInstance);
			//System.out.println("Parse expressions of released process instance>>>>>>>>>>>>>>>:" + (System.currentTimeMillis() - s2) + "ms");
			// assign new ID and change process ID.
			//long s3 = System.currentTimeMillis();
			NewRuntimeEntityIdAssignerBlo.assignNewEntityId(processInstance);
			//System.out.println("Assign IDs of released process instance>>>>>>>>>>>>>>>:" + (System.currentTimeMillis() - s3) + "ms");
			// AssignOwnerIDUtil.changeCurrOwner(procinstance,
			// procinstance.getId());
			// 首先需要把所有的数据变量中的文件变量中的file附件常量都拷贝到新的流程中。
			//long s4 = System.currentTimeMillis();
//			copyFileVariables(rlprocess, processInstance);
			//System.out.println("Copy variables of process instance>>>>>>>>>>>>>>>:" + (System.currentTimeMillis() - s4) + "ms");
			return processInstance;
		}
		return null;
	}

	/**
	 * Gets a released business process through specified <code>id</code> for
	 * runtime.
	 * 
	 * @param pid
	 *            released process ID
	 * 
	 * @return WfProcessInstance object
	 * @throws Exception
	 * @date Dahai Cao created on 2017-02-15 for BPM server design
	 */
	public WfProcessInstance getReleasedSubProcessForRuntime(String pid, SubprocessPointInstance subprocessPoint) throws Exception {
		ReleasedWfProcessEso processESO = new ReleasedWfProcessEso();
		ReleasedWfProcess rlprocess = processESO.queryReleasedProcess(pid);
		if (rlprocess != null) {
			String process = rlprocess.getProcessContent();
			WfProcessInstance procinstance = WfProcessInstanceJSONParser.parseWfProcessInstance(process);
			procinstance.setDescription(rlprocess.getDescription());
			procinstance.setKeywords(rlprocess.getKeywords());
			procinstance.setAuthorId(rlprocess.getAuthorId());
			procinstance.setAuthor(rlprocess.getAuthor());
			procinstance.setVersion(rlprocess.getVersion());
			procinstance.setReleaserId(rlprocess.getReleaserId());
			procinstance.setReleaser(rlprocess.getReleaser());
			procinstance.setReleaseDate(rlprocess.getReleaseDate());
			procinstance.setWfProcessId(rlprocess.getId());
			procinstance.setDeprecated(rlprocess.getDeprecated());
			procinstance.setLikeCounting(rlprocess.getLikeCounting());
			procinstance.setTotalUseCounting(rlprocess.getTotalUseCounting());
			procinstance.setTotalDownloading(rlprocess.getTotalDownloading());
			procinstance.setSuccessCounting(rlprocess.getSuccessCounting());
			procinstance.setTerminationCounting(rlprocess.getTerminationCounting());
			procinstance.setSuspensionCounting(rlprocess.getSuspensionCounting());
			ExpressionParser.parseExpressions(procinstance);
			for (Assignment child : subprocessPoint.getSubprocessInputs()) {
				String temp = ((Assignment) child).getVariableString();
				temp = temp.substring(0, temp.indexOf("@"));
				DataVariable var = (DataVariable) procinstance.seekChildByID(temp);
				((Assignment) child).setVariable(var);
			}
			for (Assignment child : subprocessPoint.getSubprocessOutputs()) {
				if (((Assignment) child).getValue() != null) {
					((Expression) ((Assignment) child).getValue()).parseExpressionString(procinstance);
				}
			}
			// assign new ID and change process ID.
			NewRuntimeEntityIdAssignerBlo.assignNewEntityId(procinstance);
			// AssignOwnerIDUtil.changeCurrOwner(procinstance,
			// procinstance.getId());

			// 可访问变量中的设置
			// 首先需要把所有的数据变量中的文件变量中的file附件常量都拷贝到新的流程中。
//			copyFileVariables(rlprocess, procinstance);
			return procinstance;
		}
		return null;
	}


	public StartPoint getStartPoint(WfProcess proc) {
		try{
			if(proc!=null) {
				TreeNode[] nodes = proc.getChildren();
				for (int i = 0; i < nodes.length; i++) {
					if (nodes[i] instanceof StartPoint) {
						StartPoint startPoint = (StartPoint) nodes[i];
						if (startPoint != null) {
							return startPoint;
						}
					}
				}
			}
			return null;
		}catch (Exception e){
			e.printStackTrace();
			return null;
		}

	}

	public EndPoint getEndPoint(WfProcess proc) {
		try{
			if(proc!=null) {
				TreeNode[] nodes = proc.getChildren();
				for (int i = nodes.length-1; i >=0; i--) {
					if (nodes[i] instanceof EndPoint) {
						EndPoint endPoint = (EndPoint) nodes[i];
						if (endPoint != null) {
							return endPoint;
						}
					}
				}
			}
			return null;
		}catch (Exception e){
			e.printStackTrace();
			return null;
		}
	}

	public String getLaunchForm(String pid){
		String launchFormName = "";
		try {
			ReleasedWfProcessEso processESO = new ReleasedWfProcessEso();
			String processContent = processESO.queryReleasedProcess(pid).getProcessContent();
			if(processContent==null) return null;
			WfProcess proc =  WfProcessJSONParser.parseWfProcess(processContent);
			if(proc!=null){

				TreeNode[] nodes = proc.getChildren();
				for (int i = 0; i < nodes.length; i++) {
					if (nodes[i] instanceof StartPoint) {
						if(((StartPoint)nodes[i]).getLaunchFormName() != null){
							launchFormName = ((StartPoint)nodes[i]).getLaunchFormName();
							break;
						}
					}
				}
				System.out.println("launchFormName:"+launchFormName);
			}
			return "{\"bindEnClass\":\""+proc.getBindEnClassName()+"\",\"formName\": \"" + launchFormName + "\"}";
		}catch (Exception e) {
			e.printStackTrace();
			return  null;
		}

	}


	private void copyFileVariables(ReleasedWfProcess rlprocess, WfProcessInstance inst) throws Exception {
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		for (TreeNode child : inst.getChildren()) {
			if (child instanceof ArrayDataVariable && ((ArrayDataVariable) child).getDatatype().equals(DataType.FILE)) {
				if (((ArrayDataVariable) child).getValues() != null
						&& ((ArrayDataVariable) child).getValues() instanceof FileConstant[]) {
					FileConstant[] fc = (FileConstant[]) ((ArrayDataVariable) child).getValues();
					if (fc.length > 0) {
						for (int i = 0; i < fc.length; i++) {
							if (fc[i] != null && fc[i].getId() != null && !fc[i].getId().trim().equals("")
									&& !fc[i].getId().trim().toLowerCase().equals("null")) {
								initializeFileObject(httpClient, inst, fc[i], child.getId());
							}
						}
					}
				}
			} else if (child instanceof DataVariable && ((DataVariable) child).getDatatype().equals(DataType.FILE)) {
				if (((DataVariable) child).getValue() instanceof FileConstant) {
					FileConstant fc = (FileConstant) ((DataVariable) child).getValue();
					if (fc != null && fc.getId() != null && !fc.getId().trim().equals("")
							&& !fc.getId().trim().toLowerCase().equals("null")) {
						initializeFileObject(httpClient, inst, fc, child.getId());
					}
				}
			}
		}
		httpClient.close();
		// finished copy, change them currOwner.
		for (TreeNode node : inst.getChildren()) {
			if (node instanceof DataVariable && ((DataVariable) node).getDatatype().equals(DataType.FILE)) {
				if (node instanceof ArrayDataVariable) {
					if (((ArrayDataVariable) node).getValues() != null) {
						for (int j = 0; j < ((FileConstant[]) ((ArrayDataVariable) node).getValues()).length; j++) {
							((FileConstant[]) ((ArrayDataVariable) node).getValues())[j].setCurrOwner(inst.getId());
						}
					}
				} else if (node instanceof DataVariable) {
					if (((DataVariable) node).getValue() != null) {
						((FileConstant) ((DataVariable) node).getValue()).setCurrOwner(inst.getId());
					}
				}
			}
		}
	}

	/**
	 * this method is used to copy files from build time environment to runtime
	 * environment. The codes that are commented off is the download codes and
	 * upload codes. They are original codes. The new codes are on the top of
	 * the original codes.
	 * 
	 * @param inst
	 *            WfProcessInstance
	 * @param fc
	 *            FileConstant
	 * @param vid
	 *            String
	 * @return
	 * @throws Exception
	 */
	private String initializeFileObject(CloseableHttpClient httpClient, WfProcessInstance inst, FileConstant fc,
                                        String vid) throws Exception {

		String apiserver = SystemConfig.getProp("api.server.domainname");
		// source folder and file
		String src = "/" + fc.getOwner() + "/rlp/" + fc.getCurrOwner() + "/";
		// destination folder
		String des = "/" + inst.getOwner() + "/rt/" + inst.getId() + "/";
		HttpPost httpPost = new HttpPost(apiserver + "/service19/api11");

		List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
		urlParameters.add(new BasicNameValuePair("srcfolder", src));
		urlParameters.add(new BasicNameValuePair("desfolder", des));
		urlParameters.add(new BasicNameValuePair("filename", fc.getId() + "_" + fc.getName()));

		HttpEntity postParams = new UrlEncodedFormEntity(urlParameters, "UTF-8");
		httpPost.setEntity(postParams);

		CloseableHttpResponse response = httpClient.execute(httpPost);
		HttpEntity entity = response.getEntity();
		String responseJson = EntityUtils.toString(entity, "UTF-8").trim();

		if (!httpPost.isAborted())
			httpPost.abort();
		return responseJson;
	}
}