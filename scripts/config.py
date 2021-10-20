# coding=utf-8

import os
import sys

class Properties(object):
    def __init__(self, fileDir):
        self.fileDir = fileDir
        self.properties = {}

    def getDict(self, key, resultDict, value):
        resultDict[key] = value
        return

    def getProperties(self):
        try:
            prop_file = open(self.fileDir, 'Ur', encoding='UTF-8')
            for line in prop_file.readlines():
                line = line.strip().replace('\n', '')
                if line.find("#") != -1:
                    line = line[0:line.find('#')]
                if line.find('=') > 0:
                    strs = line.split('=')
                    strs[1] = line[len(strs[0])+1:]
                    self.getDict(strs[0].strip(), self.properties, strs[1].strip())
        except Exception as e:
            raise e
        prop_file.close()
        return self.properties

    def getAssembleConfig(self):
        self.getProperties()
        resultDict = {}
        resultDict['tomcatPath'] = self.properties['tomcatPath']
        resultDict['tomcatPort'] = self.properties['tomcatPort']
        resultDict['deployPath'] = self.properties['deployPath']
        resultDict['app.server.port'] = self.properties['app.server.port']
        resultDict['modeler.server.port'] = self.properties['modeler.server.port']
        resultDict['monitor.server.port'] = self.properties['monitor.server.port']
        return resultDict

class Version(object):
    def __init__(self, fileDir):
        self.fileDir = fileDir

    def getVersion(self):
        try:
            with open(self.fileDir, 'Ur', encoding='UTF-8') as f:
                for line in f.readlines():
                    return line
        except Exception as e:
            raise e
        return None

class ConfigJs(object):
    def __init__(self, fileDir):
        self.fileDir = fileDir
        self.config = {}

    def getConfig(self):
        try:
            conf_file = open(self.fileDir, 'Ur', encoding='UTF-8')
            inConfig = False
            for line in conf_file.readlines():
                line = line.strip().replace('\n', '').replace(' ', '')
                if "Config=" in line:
                    inConfig = True
                    continue
                if line.endswith('}'):
                    inConfig = False
                if inConfig and ':' in line and not line.startswith('//'):
                    self.config[line.split(':')[0]] = line[len(line.split(':')[0])+1 : len(line)-1 if line.endswith(',') else len(line)]
        except Exception as e:
            raise e
        conf_file.close()
        return self.config

    def writeConfig(self, conf, log=None):
        try:
            configLines = []
            conf_file = open(self.fileDir, 'Ur', encoding='UTF-8')
            for line in conf_file.readlines():
                configLines.append(line)
                line = line.strip().replace('\n', '').replace(' ', '')
                if "Config=" in line:
                    for k, v in conf.items():
                        configLines.append("%s: %s,\n" % (k, v))
                        self.config[k] = v
                        if log is not None:
                            log.info("%s: %s" % (k, v))
            if len(configLines) > 0:
                with open (self.fileDir, 'w', encoding='UTF-8') as f:
                    f.writelines(configLines)
        except Exception as e:
            raise e
        conf_file.close()


dev = False
if getattr(sys, 'frozen', False): __file__ = os.path.dirname(sys.executable)
scriptsDir = os.path.abspath(os.path.dirname(__file__))
dwfDir = os.path.dirname(scriptsDir)
appConfig = "%s/app-web/public/config.js" % dwfDir
modelerConfig = "%s/modeler-web/public/config.js" % dwfDir

try:
    dictProperties = Properties("/opt/dwf3.0-deploy/application.properties").getProperties()
except:
    print("当前处于本地开发环境，仅支持代码打包和本地前端装配、卸载，请确认assemble-to.yaml填写正确")
    dictProperties = Properties(scriptsDir + "/application.properties").getProperties()
    dev = True

try:
    version = Version(scriptsDir + "/version").getVersion()
except:
    print("获取版本失败，请检查scripts中是否存在version文件")
    version = None

tomcat_path = dictProperties['tomcatPath']
tomcat_port = int(dictProperties['tomcatPort'])
dwf_app_port = int(dictProperties['app.server.port'])
dwf_modeler_port = int(dictProperties['modeler.server.port'])
deploy_path = dictProperties['deployPath']
maven_path = '~/.m2/repository/edu/thss/platform'

PG_INFO = {}
PG_INFO["home"] = dictProperties['pgPath']
PG_INFO["ip"] = dictProperties['datasource.ip']
PG_INFO["port"] = dictProperties['datasource.port']
PG_INFO["password"] = dictProperties['spring.datasource.password']
PG_INFO["user"] = dictProperties['spring.datasource.username']
PG_INFO["database"] = dictProperties['datasource.database']

rule_tomcat_port = '<Connector port="(\d*)" protocol="HTTP'

PART_WEB = "part-web"
MODULE_WEB = ["app", "modeler"]
LOCAL_MODULE_WEB = ["app", "common", "modeler"]  # 本地generate、scanTO、zipFile中使用
SUB_MODULE_WEB = ["forms", "operations"]
DWF_WEB = ["modeler-web", "app-web"]
DWF_WEB_SOURCE_PATH = "src/assemble_components"
DWF_WEB_CONFIG_FILE = "assemble_config.js"
FORMS_ADDIN_TYPE = ["form/single", "form/multi", "form/timeseries", "form/model", "form/visual", "form/layout"]

PART_SVC = "part-svc"
MODULE_SVC = ["app", "common", "modeler"]
SUB_MODULE_SVC = ["controller", "entity", "service"]
DWF_SVC = ["dwf-common", "dwf-modeler", "dwf-app"]
DWF_SVC_CORE = ["dwf-modeler-core", "dwf-common-core", "dwf-app-core"]
DWF_SVC_JAVASOURCE_PATH = "src/main/java"
DWF_SVC_PACKAGE_PATH = "edu/thss/platform"
DWF_SVC_RESOURCE_PATH = "src/main/resources"
DWF_LIB_PATH = "dwf-common/lib"

DWF_WEB_TO_MODULE_WEB = {"modeler-web": "modeler", "app-web": "app"}
MODULE_WEB_TO_DWF_WEB = {"modeler": "modeler-web", "app": "app-web"}
DWF_SVC_TO_MODULE_SVC = {"dwf-modeler": "modeler", "dwf-app": "app", "dwf-common": "common"}
MODULE_SVC_TO_DWF_SVC = {"modeler": "dwf-modeler", "app": "dwf-app", "common": "dwf-common"}
DWF_MODE_TO_PORT = {"modeler-web": tomcat_port, "app-web": tomcat_port, "dwf-app": dwf_app_port, "dwf-modeler": dwf_modeler_port}

JAR_PATH = deploy_path
JAR_PACKAGE = ["dwf-app-1.0-SNAPSHOT.jar", "dwf-modeler-1.0-SNAPSHOT.jar", "dwf-monitor-1.0-SNAPSHOT.jar"]
WAR_PATH = "%s/webapps" % tomcat_path
WAR_DIR = DWF_WEB
SCRIPTS_FILE = ["assemble.py", "server.py", "handle.py"]
DWF_SVC_TO_JAR_PACKAGE = {"dwf-app": "dwf-app-1.0-SNAPSHOT.jar", "dwf-modeler": "dwf-modeler-1.0-SNAPSHOT.jar", "dwf-monitor": "dwf-monitor-1.0-SNAPSHOT.jar"}

LOG_LIST = ["codeAssembly.log", "pluginMove.log", "pluginCompile.log", "pluginAssemble.log", "pluginUninstall.log", "error-codeAssembly.log", "assemble.log", "server.log"]
SDK_LOG_LIST = ["codeAssembly.log", "sdkAssemble.log"]
LOG_PREFIX = ["npminstall", "npmbuild", "mvninstall", "mvnpackage", "npm", "mvn"]
LOG_SUFFIX = [".log", ".err", ".out", "-ext.err", "-ext.out"]
COMPILE_LOG_LIST = []
for each in DWF_SVC + DWF_WEB:
    for prefix in LOG_PREFIX:
        for suffix in LOG_SUFFIX:
            COMPILE_LOG_LIST.append("%s-%s%s" % (prefix, each, suffix))

# 本地generate、zipFile、scanToConfig中使用
BACK_TO_PREV = ".."
DWF_PATH = dwfDir
LOCAL_PART_N_PATH = dwfDir + "/dwf-part-all"

dwfsdk_path = "%s/dwf_sdk" % deploy_path
script_path = "%s/assemble/addins" % dwfsdk_path
SDK_PATH = "%s/sdk" % dwfsdk_path
LATEST_SDK_PATH = "%s/_latestSdk" % SDK_PATH
PARTS_PATH = "%s/parts" % dwfsdk_path
ASSEMBLE_PATH = "%s/assemble" % dwfsdk_path
BACKUP_PATH = "%s/backup" % dwfsdk_path
ORIGIN_BACKUP_PATH = "%s/origin" % BACKUP_PATH
PART_BACK_PATH = "%s/backend" % ASSEMBLE_PATH
PART_WEB_PATH = "%s/web" % ASSEMBLE_PATH
PART_TMP_PATH = "%s/dwf-part-all" % ASSEMBLE_PATH
COMPILE_LOG_PATH = "%s/log" % ASSEMBLE_PATH
PART_N_PATH = PARTS_PATH
