package edu.thss.platform.service.wfprocess.runtime.server;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.persistence.EntityManager;
import javax.script.*;
import edu.thss.platform.domain.itemclass.org.Group;
import edu.thss.platform.domain.itemclass.org.User;
import edu.thss.platform.service.modeler.OperationService;
import edu.thss.platform.service.omf.script.OmfScriptFacade;
import edu.thss.platform.service.org.OrgService;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.thss.platform.exception.OmfException;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.service.config.ConfigService;
import edu.thss.platform.service.org.bo.Environment;
import edu.thss.platform.service.modeler.ScriptCodeService;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.EndPointInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.StartPointInstance;
import edu.thss.platform.utils.CommandExecutor;
import edu.thss.platform.utils.RestTemplateUtil;
import edu.thss.platform.utils.UUIDGenerator;
import org.graalvm.polyglot.proxy.ProxyObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.runtime.engine.PEngine;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;

@Service
public class WfScriptExecuterService {

    static Logger logger = LoggerFactory.getLogger(WfScriptExecuterService.class);

    @Autowired
    OperationService operationService;

    public static Map<String, Object> injectObjs = new HashMap<>();
    public static Map<String, Object> injectExtObjs = new HashMap<>();

    public static final String OBJECT = "_obj";
    public static final String OBJECTS = "_objs";
    public static final String ENV = "_env";
    public static final String CLASSNAME = "_className";
    public static final String EM = "_em";
    public static final String EXCEPTION = "_ex";
    public static final String SH = "_sh";
    public static final String USER = "_user";
    public static final String GEN_UUID = "_generateUUID";
    public static final String LOGGER = "_logger";
    public static final String OMF = "_omf";
    public static final String OBJECT_MAPPER = "_objectMapper";
    public static final String REST_TEMPLATE = "_restTemplate";

    public static final String PARTEXT = "_partExt";

    public static final String WfEngine = "_wfEngine";
    public static final String WfProInstance = "_wfProcess";
    public static final String WfProTaskInstance = "_wfTask";

    private static class generateUUID implements Supplier<String> {
		@Override
		public String get() {
			return UUIDGenerator.getUUID();
		}
	}

    @Autowired
    ScriptCodeService scriptCodeService;

	@Autowired
	ConfigService configService;

    @Autowired
    OrgService orgService;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    OmfScriptFacade omfScriptFacade;

    public static void injectObject(String key, Object obj) {
        if (injectObjs.containsKey(key)) {
            logger.warn("后端脚本注入的变量重复, 已忽略此变量：" + key);
            return;
        }
        injectObjs.put(key, obj);
    }
    public static void injectPartExtObject(String key, Object obj) { // for partExt
        if (injectExtObjs.containsKey(key)) {
            logger.warn("后端脚本注入的变量重复, 已忽略此变量：" + key);
            return;
        }
        injectExtObjs.put(key, obj);
    }
//    /*
//	     前置脚本的事务使用Required即可。
//	 */
//    @Transactional(propagation = Propagation.REQUIRED)
//    public boolean executePreScript(String className, DefaultAction action, Environment env, EntityManager em, Object obj) {
//        return defaultExecuteScript(className, action, env, em, Collections.singletonList(obj), null);
//    }
//    /*
//	     后置脚本的事务需要是Nested。后置脚本出错，脚本本身的事务需要回滚，但不影响外部事务。反过来，外部事务回滚了，脚本的操作也要跟着回滚
//	     但可惜，Postgre不支持Savepoint，也就是说Postgre不支持Nested Propagation。
//	     所以只能采取折中：
//	     	使用REQUIRED： 会产生脚本失败了但外部成功了，于是脚本未回滚的情况
//	     	使用REQUIRES_NEW: 会产生外部回滚了但脚本未回滚的情况
//	     注：为避免该问题，上一层中，objs批量操作逻辑改成了全部操作成功后，再依次对每个obj执行后置脚本
//	 */
//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    public boolean executePostScript(String className, DefaultAction action, Environment env, EntityManager em, Object obj, Object oldObj) {
//        return defaultExecuteScript(className, action, env, em, Collections.singletonList(obj), Collections.singletonList(oldObj));
//    }
//
//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    public boolean executePostScript(String className, DefaultAction action, Environment env, EntityManager em, Object obj) {
//        return defaultExecuteScript(className, action, env, em, Collections.singletonList(obj), null);
//    }
//
//    private boolean defaultExecuteScript(String className, DefaultAction action, Environment env, EntityManager em, List objs, List oldObjs) {
//        String script = null;
//
//        try { script = scriptCodeService.getScriptByCA(className, action == null ? null : action.name()); }
//        catch (Exception ex) {
//            ex.printStackTrace(); // 有些库中尚无脚本的表，所以要兼容
//        }
//        if (script != null) {
//            try { executeScript(className, script, env, em, objs, oldObjs); }
//            catch (ScriptException e) {
//                String errMsg = String.format("类%s上绑定的【%s】事件脚本执行出错，请检查脚本是否正确（%s）", className, action.getDisplayName(), e.getMessage());
//                if (action == DefaultAction.AfterUpdate) errMsg = "更新成功，但" + errMsg;
//                if (action == DefaultAction.AfterDelete) errMsg = "删除成功，但" + errMsg;
//                if (action == DefaultAction.AfterCreate) errMsg = "新增成功，但" + errMsg;
//                throw new PlatformException(errMsg);
//            }
//            return true;
//        } else return false;
//    }
    @Transactional
    public Object executeScript(String className, String scriptContent,
                                Environment env, EntityManager em, List objs,
                                PEngine pEngine, WfProcessInstance wfProcessInstance, AbstractTask taskInstance) throws ScriptException{

        System.out.println("----executeScript---");
        if (scriptContent == null) return null;

        System.setProperty("polyglot.js.nashorn-compat", "true");

        /** This is a workaround for a bug of graal.js when running in springboot ********/
        /** see: https://github.com/oracle/graal/issues/1348                  ************/
        try {
            URL res = com.oracle.js.parser.ScriptEnvironment.class.getClassLoader().getResource("/META-INF/truffle/language");
            // initialize the file system for the language file
            FileSystems.newFileSystem(res.toURI(), new HashMap<>());
        } catch (Throwable ignored) {
            // in case of starting without fat jar
        }
        /********************************************************************************/

        ScriptEngineManager factory = new ScriptEngineManager();

        ScriptEngine engine = factory.getEngineByName("graal.js");
        Bindings bindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);
        bindings.put("polyglot.js.allowAllAccess", true);

        String oid = objs.size() > 0 ? (String)((Map) (objs.get(0))).get("oid") : "-";
        OmfException omfException = new OmfException(className, oid);

        engine.put(CLASSNAME, className);
        Map<String, Object> envMap = new HashMap<>();
        Map<String, Object> userMap = new HashMap<>();
        if (env!=null) {
            envMap = new HashMap<>(env.toMap());
            envMap.put("appConfig", ProxyObject.fromMap((Map)configService.getAppConfig()));
            engine.put(ENV, ProxyObject.fromMap(envMap));

            userMap.put("token", env.get("token"));
            User user = orgService.getUserByOid(env.getUserOid());
            if (user == null) user = orgService.getUserByName(env.getUserName());
            if (user != null) {
                userMap.put("oid", user.getOid());
                userMap.put("userId", user.getOid());
                userMap.put("userName", user.getName());
                userMap.put("displayName", user.getDisplayName());
                List<Map> jsonGroups = new ArrayList<>();
                List<Group> groups = orgService.getUserGroups(user.getOid());
                for (Group group : groups) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    Map jsonGroup = objectMapper.convertValue(group, Map.class);
                    jsonGroups.add(jsonGroup);
                }
                userMap.put("userGroups", jsonGroups);
            }

            engine.put(USER, ProxyObject.fromMap(userMap));
        } else {
            engine.put(ENV, envMap);
            engine.put(USER, userMap);
        }

        engine.put(GEN_UUID, new generateUUID());

        engine.put(EM, em);
        engine.put(EXCEPTION, omfException);
        engine.put(SH, new CommandExecutor());

        if (objs != null) {
            engine.put(OBJECT, objs.size() > 0 ? ProxyObject.fromMap((Map) objs.get(0)) : null);
            engine.put(OBJECTS, objs.stream().map(obj -> ProxyObject.fromMap((Map) obj)).collect(Collectors.toList()));
        }

        engine.put(LOGGER, logger);
        engine.put(OMF, omfScriptFacade);
        engine.put(OBJECT_MAPPER, objectMapper);
        engine.put(REST_TEMPLATE, RestTemplateUtil.getInstance(StandardCharsets.UTF_8.name()));

        Map<String, Object> partExt = new HashMap<>();
        for (Map.Entry<String, Object> entry : injectExtObjs.entrySet()) {
            partExt.put(entry.getKey(), entry.getValue());
        }
        engine.put(PARTEXT, partExt);

        // workflow process
        engine.put(WfEngine, pEngine);
        engine.put(WfProInstance, wfProcessInstance);
        if (taskInstance instanceof ManualTaskInstance) {
            engine.put(WfProTaskInstance, (ManualTaskInstance) taskInstance);
        } else if (taskInstance instanceof StartPointInstance) {
            engine.put(WfProTaskInstance, (StartPointInstance) taskInstance);
        } else if (taskInstance instanceof EndPointInstance) {
            engine.put(WfProTaskInstance, (EndPointInstance) taskInstance);
        }

        Set<String> set = new HashSet<>(engine.getBindings(ScriptContext.ENGINE_SCOPE).keySet());
        for (Map.Entry<String, Object> entry : injectObjs.entrySet()) {
            if (set.contains(entry.getKey())) {
                logger.warn("后端脚本注入的变量重复, 已忽略此变量：" + entry.getKey());
                continue;
            }
            engine.put(entry.getKey(), entry.getValue());
            set.add(entry.getKey());
        }

        // 将_xxx内容复制一份，以使用this.xxx形式访问（使得所有可用的访问方式包括xxx、this.xxx、_xxx、this._xxx）
        for (String key : set) {
            if (!key.startsWith("_")) continue;
            engine.put(key.substring(1), engine.get(key));
        }

        try {
            return engine.eval(scriptContent);
        } catch (ScriptException e) {
            logger.error("执行Server Script脚本发生错误: ", e);
            throw e;
        } finally {
            if (omfException.hasError())
                throw new PlatformException("OmfException: " + omfException.getFieldErrors().toString());
        }
    }

}
