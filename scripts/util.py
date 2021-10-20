# coding=utf-8

import logging
import os
import unicodedata
import shutil
import json
import yaml
import time
import datetime
import subprocess
import traceback
from config import Properties, ConfigJs, Version
from config import dev, version, script_path, PART_WEB, MODULE_WEB, LOCAL_MODULE_WEB, SUB_MODULE_WEB, DWF_WEB, DWF_WEB_SOURCE_PATH, DWF_WEB_CONFIG_FILE, PART_SVC, MODULE_SVC, DWF_SVC, MODULE_WEB_TO_DWF_WEB, MODULE_SVC_TO_DWF_SVC
from config import FORMS_ADDIN_TYPE, deploy_path, PART_BACK_PATH, PART_WEB_PATH, PART_TMP_PATH, COMPILE_LOG_PATH, PART_N_PATH, LOG_LIST, COMPILE_LOG_LIST, SDK_LOG_LIST, PARTS_PATH, BACKUP_PATH, JAR_PACKAGE, JAR_PATH, WAR_DIR, WAR_PATH, SDK_PATH, LATEST_SDK_PATH, ORIGIN_BACKUP_PATH
from config import PG_INFO, DWF_SVC_TO_JAR_PACKAGE, DWF_SVC_RESOURCE_PATH

class Logger(object):
  def __init__(self, loggerName, commonLogPath=None):
    self.logger = logging.getLogger(loggerName)
    self.logger.setLevel(logging.INFO)
    if commonLogPath is not None: # 默认在此路径新增2个handler：codeAssembly和error-codeAssembly
      handler_info = logging.FileHandler("%s/codeAssembly.log" % commonLogPath)
      handler_info.setLevel(logging.INFO)
      handler_info.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
      self.logger.addHandler(handler_info)
      handler_info = logging.FileHandler("%s/error-codeAssembly.log" % commonLogPath)
      handler_info.setLevel(logging.ERROR)
      handler_info.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
      self.logger.addHandler(handler_info)

  def getLogger(self):
    return self.logger

  def setLevel(self, level):
    self.logger.setLevel(level)

  def addHandler(self, logFile, errorLevel=False): # 将指定文件加到新的handler
    handler_info = logging.FileHandler(logFile)
    if errorLevel:
      handler_info.setLevel(logging.ERROR)
    else:
      handler_info.setLevel(logging.INFO)
    handler_info.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    self.logger.addHandler(handler_info)
    return self.logger

class LogCleaner():
  def __init__(self):
    pass

  def getDateXDaysAgo(self, day):
    today = datetime.datetime.now()
    offset = datetime.timedelta(days=-day)
    resultDate = (today + offset).strftime('%Y-%m-%d')
    return resultDate

  def clean(self, path, day):
    specifiedDate = self.getDateXDaysAgo(day)
    ySpecified = int(specifiedDate[0:4])
    mSpecified = int(specifiedDate[5:7])
    dSpecified = int(specifiedDate[8:])

    # 遍历目录下的所有日志文件
    for fileName in os.listdir(path):
      if len(fileName) < len("-yyyy-mm-dd.log"):
        continue
      filePath = "%s/%s" % (path, fileName)
      if not os.path.exists(filePath):
        continue

      try:
        y = int(fileName[len(fileName)-len("yyyy-mm-dd.log"):len(fileName)-len("-mm-dd.log")])
        m = int(fileName[len(fileName)-len("mm-dd.log"):len(fileName)-len("-dd.log")])
        d = int(fileName[len(fileName)-len("dd.log"):len(fileName)-len(".log")])

        if y < ySpecified:
          os.remove(filePath)
        elif y == ySpecified and m < mSpecified:
          os.remove(filePath)
        elif y == ySpecified and m == mSpecified and d < dSpecified:
          os.remove(filePath)
      except:
        pass

class CmdParser(object):
  def __init__(self):
    pass

  def parseStr(self, line):
    res = []
    line = line.split(' ')
    for i in line:
      if i != '':
        res.append(i)
    return res

  def parse(self, cmd):
    result = []
    p = os.popen(cmd)
    res = p.read().split('\n')
    p.close()
    for i in res:
      if i != "":
        result.append(self.parseStr(i))
    return result

class Assemble(object):
  def __init__(self):
    pass

  ########################################### 工具
  # 检查是否为本地调试环境
  def devCheck(self):
    if dev:
      raise Exception("当前处于开发环境，不支持此命令")

  # 移动指定文件
  def moveDir(self, src, dst):
    if not os.path.isdir(dst):
      return
    for root, dirs, files in os.walk(src):
      try:
        os.makedirs("%s%s" % (dst, root[len(src):]))
      except:
        pass
      for eachfile in files:
        # if os.path.splitext(eachfile)[1] != '': # 绕过所有.开头的文件
        if not eachfile.startswith('.'):
          shutil.copy("%s/%s" % (root, eachfile), "%s%s" % (dst, root[len(src):]))

  # 检查是否为数字
  def is_number(self, s):
    try:
      float(s)
      return True
    except ValueError:
      pass
    try:
      unicodedata.numeric(s)
      return True
    except (TypeError, ValueError):
      pass
    return False

  # 对比两个dict的差别
  def getDictDiff(self, src, dst):
    diff = {}
    for k, v in src.items():
      if k not in dst:
        diff[k] = v
    return diff

  # 安装自定义jar包
  def customJarInstall(self, log, filePath, groupId, artifactId, ver, packaging="jar"):
    p = subprocess.Popen("mvn install:install-file -Dfile=%s -DgroupId=%s -DartifactId=%s -Dversion=%s -Dpackaging=%s" % (filePath, groupId, artifactId, ver, packaging), shell=True, cwd=filePath.rsplit('/', 1)[0], stdout=subprocess.PIPE)
    for line in p.stdout:
      line = line.decode()
      if not subprocess.Popen.poll(p) is None:
        if len(line.strip()) == 0:
          break
      elif len(line.strip()) == 0:
        continue
      each = str(line.strip())
      if log is None:
        print(each)
      else:
        if "[ERROR]" in each:
          log.error(each)
        elif "[WARNING]" in each:
          log.warn(each)
        else:
          log.info(each)
    p.stdout.close()

  # 安装lib中的jar到本地mvn仓库
  def dwfJarInstall(self, log, libPath, ver="1.0"):
    if log is None:
      print("installing jar in %s" % libPath)
    else:
      log.info("installing jar in %s" % libPath)
    for mode in DWF_SVC:
      self.customJarInstall(log, "%s/%s-core-%s.jar" % (libPath, mode, ver), "edu.thss.platform", "%s-core" % mode, ver, "jar")

  # 校验mvn-install.sh脚本中只含'mvn install:install-file '和'#'注释
  def mvnShellCheck(self, libPath):
    with open("%s/mvn-install.sh" % libPath, 'Ur', encoding='UTF-8') as f:
      for line in f.readlines():
        line = line.strip().replace('\n', '')
        if len(line) == 0:
          continue
        if not line.startswith("#") and not line.startswith("mvn install:install-file "):
          return False
        if " -DartifactId=dwf-common-core " in line or " -DartifactId=dwf-app-core " in line or " -DartifactId=dwf-modeler-core " in line:
          if " -DgroupId=edu.thss.platform " in line or " -Dversion=1.0 " in line:
            return False
    return True

  # 执行mvn-install.sh脚本
  def mvnShellExec(self, log, libPath):
    with open("%s/mvn-install.sh" % libPath, 'Ur', encoding='UTF-8') as f:
      for shLine in f.readlines():
        shLine = shLine.strip().replace('\n', '')
        if len(shLine) == 0 or shLine.startswith("#"):
          continue
        log.info(shLine)
        p = subprocess.Popen(shLine, shell=True, cwd=libPath, stdout=subprocess.PIPE)
        for line in p.stdout:
          line = line.decode()
          if not subprocess.Popen.poll(p) is None:
            if len(line.strip()) == 0:
              break
          elif len(line.strip()) == 0:
            continue
          each = str(line.strip())
          if log is None:
            print(each)
          else:
            if "[ERROR]" in each:
              log.error(each)
            elif "[WARNING]" in each:
              log.warn(each)
            else:
              log.info(each)
        p.stdout.close()

  # 执行db-backup目录中autoUpgrade.sh脚本
  def dbShellExec(self, log, shPath="%s/DWF3.0/scripts/db-backup" % SDK_PATH, pgInfo=PG_INFO):
    CmdParser().parse("chmod 777 %s/autoUpgrade.sh" % shPath)
    cmd = "./autoUpgrade.sh %s %s %s %s %s %s %s %s" % (shPath, self.getCurVersion(), pgInfo["home"], pgInfo["ip"], pgInfo["port"], pgInfo["password"], pgInfo["user"], pgInfo["database"])
    log.info("updating pg")
    p = subprocess.Popen(cmd, shell=True, cwd=shPath, stdout=subprocess.PIPE)
    for line in p.stdout:
      line = line.decode()
      if not subprocess.Popen.poll(p) is None:
        if len(line.strip()) == 0:
          break
      elif len(line.strip()) == 0:
        continue
      each = str(line.strip())
      log.info(each)
    p.stdout.close()

  # 获取version
  def getCurVersion(self, path=script_path):
    return Version("%s/version" % path).getVersion()

  ########################################### 清理日志和文件
  # 清除旧日志
  def clearLogs(self, logList=LOG_LIST + COMPILE_LOG_LIST + SDK_LOG_LIST):
    for eachLog in logList:
      if os.path.isfile("%s/%s" % (COMPILE_LOG_PATH, eachLog)):
        os.remove("%s/%s" % (COMPILE_LOG_PATH, eachLog))
    # LogCleaner().clean(COMPILE_LOG_PATH, 20) # 指定20天

  # 清除全部日志
  def clearAllLogs(self, logPath=COMPILE_LOG_PATH):
    if os.path.isdir(logPath):
      shutil.rmtree(logPath)
    os.makedirs(logPath)

  # 移除tmp文件夹
  def clearTmpFolder(self):
    if os.path.isdir(PART_TMP_PATH):
      try:
        shutil.rmtree(PART_TMP_PATH)
        os.makedirs(PART_TMP_PATH)
      except:
        return False
      return True
    else:
      return False

  # 移除前端文件
  def clearFrontend(self, rootpath, module=None, sub_module=None):
    success = False
    modes = DWF_WEB
    sub_modules = SUB_MODULE_WEB
    if module is not None:
      if module in LOCAL_MODULE_WEB:
        modes = [MODULE_WEB_TO_DWF_WEB[module]]
        if sub_module is not None:
          if sub_module in SUB_MODULE_WEB:
            sub_modules = [sub_module]
          elif "%ss" % sub_module in SUB_MODULE_WEB:
            sub_modules = ["%ss" % sub_module]
          else:
            print("ERROR: 输入错误，前端子模块为form和operation")
            return False
      else:
        print("ERROR: 输入错误，前端模块为app和modeler")
        return False
    for mode in modes:
      for sub_module in sub_modules:
        pathDst = ("%s/%s/%s/%s" % (rootpath, mode, DWF_WEB_SOURCE_PATH, sub_module[:-1]))
        try:
          shutil.rmtree(pathDst)
        except:
          pass
        try:
          os.mkdir(pathDst)
        except:
          pass
        success = True
    return success

  # 移除所有lock
  def resetLocks(self, log):
    try:
      log.info("reset locks")
      shutil.rmtree("%s/lock" % script_path)
    except:
      pass
    os.mkdir("%s/lock" % script_path)

  # 将上次装配成功的sdk从_latestSdk移动到sdk，并清除_latestSdk
  def latestSdkToSdk(self, log=None, sdkName="DWF3.0"):
    if log is not None:
      log.info("moving _latestSdk to sdk")
    if os.path.isdir("%s/zipfile" % SDK_PATH):
      shutil.rmtree("%s/zipfile" % SDK_PATH)
    shutil.copytree("%s/zipfile" % LATEST_SDK_PATH, "%s/zipfile" % SDK_PATH)
    if log is not None:
      log.info("copy %s/zipfile to %s/zipfile" % (LATEST_SDK_PATH, SDK_PATH))
    if os.path.isdir("%s/%s" % (SDK_PATH, sdkName)):
      shutil.rmtree("%s/%s" % (SDK_PATH, sdkName))
    shutil.copytree("%s/sdk/%s" % (LATEST_SDK_PATH, sdkName), "%s/%s" % (SDK_PATH, sdkName))
    if log is not None:
      log.info("copy %s/sdk/%s to %s/%s" % (LATEST_SDK_PATH, sdkName, SDK_PATH, sdkName))
    self.removeLatestSdk(log)

  # 清除_latestSdk
  def removeLatestSdk(self, log=None):
    if log is not None:
      log.info("removing _latestSdk")
    if os.path.isdir(LATEST_SDK_PATH):
      shutil.rmtree(LATEST_SDK_PATH)

  # 重置dwf-part-all, 清除dwf-part-all-backup
  def resetDwfPartAll(self):
    if os.path.isdir(PART_TMP_PATH):
      shutil.rmtree(PART_TMP_PATH)
    if os.path.isdir("%s-backup" % PART_TMP_PATH):
      shutil.rmtree("%s-backup" % PART_TMP_PATH)
    os.mkdir(PART_TMP_PATH)

  ########################################### 前后端依赖合并
  # 合并package.json
  # typ = merge, cover 注意cover时assemble-to的forms和dep中有part
  def mergeWebPackage(self, srcFile, dstFile, dev=False):
    # dstFile = "%s/%s/package.json" % (PART_WEB_PATH, mode)
    # srcFile = "%s/%s/%s/%s/assemble-to.yaml" % (PART_N_PATH, part, PART_WEB, module)
    if not dev: # cover
      shutil.copy("%s/package-backup.json" % dstFile.rsplit('/', 1)[0], dstFile)
      package_json = json.loads(open(dstFile, encoding="utf-8").read())
      with open(srcFile, "r", encoding="utf-8") as f:
        yaml_to = yaml.safe_load(f)
      if "config" in yaml_to and "info" in yaml_to["config"] and PART_WEB in yaml_to["config"]["info"] and "dependencies" in yaml_to["config"]["info"][PART_WEB]:
        for part in yaml_to["config"]["info"][PART_WEB]["dependencies"]:
          for each in yaml_to["config"]["info"][PART_WEB]["dependencies"][part]:
            package_json["dependencies"][each] = yaml_to["config"]["info"][PART_WEB]["dependencies"][part][each]
      with open(dstFile, "w") as f:
        json.dump(package_json, f)
    else: # merge
      package_json = json.loads(open(dstFile, encoding="utf-8").read())
      with open(srcFile, "r", encoding="utf-8") as f:
        yaml_to = yaml.safe_load(f)
      if "config" in yaml_to and "info" in yaml_to["config"] and PART_WEB in yaml_to["config"]["info"] and "dependencies" in yaml_to["config"]["info"][PART_WEB]:
        for each in yaml_to["config"]["info"][PART_WEB]["dependencies"]:
          package_json["dependencies"][each] = yaml_to["config"]["info"][PART_WEB]["dependencies"][each]
      with open(dstFile, "w") as f:
        json.dump(package_json, f)

  # 合并assemble_config.js
  def mergeWebConfig(self, pathSrc, dst_config_file, addin_modules, pureScanConfig=False):
    sub_module = pathSrc.split('/')[-1]
    partName = pathSrc.split('/')[-4]

    if not os.path.isfile(dst_config_file):
      with open(dst_config_file, "w", encoding="utf-8") as f: # 写入assemble_config
        f.write("export const entries = []")
    if addin_modules is None or len(addin_modules) == 0:
      return

    with open(dst_config_file, "r", encoding="utf-8") as f:
      ori_assemble_config = f.read().replace("\n", "").strip('export const entries = ')
    json_assemble_config = json.loads(ori_assemble_config) # json.loads(ori_assemble_config, object_pairs_hook=DeduplicationFunc)
    dedup_config_path = []
    assemble_config = []

    for each in addin_modules: # {"filepath/filename.vue" : "form/multi"}
      print("addin_modules：%s" % addin_modules)
      if os.path.isfile("%s/%s" % (pathSrc, each)) and each[-4:] == ".vue":
        if isinstance(addin_modules[each], str): # 老版本assemble-to，fileName : type
          print("老版本assemble-to：%s" % each)
          if sub_module == "forms" and addin_modules[each] not in FORMS_ADDIN_TYPE:
            print("WARN：不支持类型为%s的表单控件(%s/%s)，不写入config.js，请检查assemble-to.yaml是否配置正确" % (addin_modules[each], pathSrc, each))
            continue
          config_name = each.split('/')[-1].split('.')[0]
          config_note = config_name if sub_module == "forms" else addin_modules[each]
          config_path = "%s/%s/%s" % (sub_module[:-1], partName, each)
          config_module = addin_modules[each] if sub_module == "forms" else "operation"
          config_icon = "&#xe69e"
        elif isinstance(addin_modules[each], dict): # 新版本assemble-to，fileName : {icon, cname, type}
          print("新版本assemble-to：%s" % each)
          if sub_module == "forms":
            if "type" not in addin_modules[each]:
              print("WARN：表单控件(%s/%s)没有配置类型，不写入config.js" % (pathSrc, each))
              continue
            elif addin_modules[each]["type"] not in FORMS_ADDIN_TYPE:
              print("WARN：不支持类型为%s的表单控件(%s/%s)，不写入config.js，请检查assemble-to.yaml是否配置正确" % (addin_modules[each]["type"], pathSrc, each))
              continue
          config_name = each.split('/')[-1].split('.')[0]
          config_note = addin_modules[each]["cname"] if "cname" in addin_modules[each] else config_name
          config_path = "%s/%s/%s" % (sub_module[:-1], partName, each)
          config_module = addin_modules[each]["type"] if sub_module == "forms" else "operation"
          config_icon = addin_modules[each]["icon"] if "icon" in addin_modules[each] else "&#xe69e"
        else:
          print("WARN：控件配置不符合规范（%s）" % addin_modules[each])
          continue

        print("控件配置：%s（config_name：%s，config_note：%s，config_path：%s，config_module：%s，config_icon：%s，）" % (addin_modules[each], config_name, config_note, config_path, config_module, config_icon))

        dedup_config_path.append("%s/%s/%s" % (sub_module[:-1], partName, each))
        assemble_config.append({
          "name": config_name, # addin01
          "note": config_note,  # 建模端form插件addin01
          "path": config_path,  # form/part01/addin01.vue
          "module": config_module,
          "icon": config_icon
        })
      else:
        print("WARN：%s/%s不存在或不是vue文件，不写入config.js，请检查assemble-to.yaml是否配置正确" % (pathSrc, each))

    for each_config in json_assemble_config: # 根据path去重，并移除控件不存在的配置项
      if not pureScanConfig and each_config["path"] not in dedup_config_path and os.path.isfile("%s/%s" % (dst_config_file.rsplit('/', 2)[0], each_config["path"])):
        dedup_config_path.append(each_config["path"])
        assemble_config.append(each_config)
      elif pureScanConfig and each_config["path"] not in dedup_config_path:
        dedup_config_path.append(each_config["path"])
        assemble_config.append(each_config)

    with open(dst_config_file, "w", encoding="utf-8") as f: # 写入assemble_config
      f.write("export const entries = %s" % json.dumps(assemble_config).encode('utf-8').decode('unicode_escape'))

  # 初始化assemble-to.yaml
  def initWebAssembleTo(self, assemble_to_path):
    with open(assemble_to_path, "w", encoding="utf-8") as f:
      yaml_to = {}
      yaml_to["config"] = {}
      yaml_to["config"]["ignore"] = {}
      yaml_to["config"]["info"] = {}
      yaml_to["config"]["info"][PART_WEB] = {}
      yaml_to["config"]["info"][PART_WEB]["forms"] = {}
      yaml_to["config"]["info"][PART_WEB]["operations"] = {}
      yaml_to["config"]["info"][PART_WEB]["dependencies"] = {}
      # if module_info is not None:
      #     yaml_to["config"]["info"][PART_WEB]["name"] = module_info["name"]
      #     yaml_to["config"]["info"][PART_WEB]["cname"] = module_info["cname"]
      #     yaml_to["config"]["info"][PART_WEB]["forms"] = module_info["forms"]
      #     yaml_to["config"]["info"][PART_WEB]["dependencies"] = module_info["dependencies"]
      # else:
      #     yaml_to["config"]["info"][PART_WEB]["name"] = {}
      #     yaml_to["config"]["info"][PART_WEB]["cname"] = {}
      #     yaml_to["config"]["info"][PART_WEB]["forms"] = {}
      #     yaml_to["config"]["info"][PART_WEB]["dependencies"] = {}
      yaml.dump(yaml_to, f)

  # 初始化pom.xml, 只有plugin start和plugin end
  def initSvcPom(self, pom_path):
    with open(pom_path, "w", encoding="utf-8") as f:
      lines = []
      lines.append("<!--plugin start-->\n")
      lines.append("<!--plugin end-->\n")
      f.writelines(lines)

  # 初始化resources
  def initSvcResources(self, rootpath, module=None):
    modes = DWF_SVC
    if module is not None:
      if module in MODULE_SVC:
        modes = [MODULE_SVC_TO_DWF_SVC[module]]
      else:
        print("ERROR: 输入错误，后端模块为app、modeler和common")
        return False
    for mode in modes:
      resource_folder = "%s/%s/%s" % (rootpath, mode, DWF_SVC_RESOURCE_PATH)
      if os.path.isdir(resource_folder):
        shutil.rmtree(resource_folder)
      print("copytree - %s-backup >> %s"% (resource_folder, resource_folder))
      shutil.copytree("%s-backup" % resource_folder, resource_folder)

  # 初始化assemble_config.js, 只有export const entries = []
  def initWebConfig(self, rootpath, module=None, sub_module=None):
    success = False
    modes = DWF_WEB
    sub_modules = SUB_MODULE_WEB
    if module is not None:
      if module in MODULE_WEB:
        modes = [MODULE_WEB_TO_DWF_WEB[module]]
        if sub_module is not None:
          if sub_module in SUB_MODULE_WEB:
            sub_modules = [sub_module]
          elif "%ss" % sub_module in SUB_MODULE_WEB:
            sub_modules = ["%ss" % sub_module]
          else:
            print("ERROR: 输入错误，前端子模块为form和operation")
            return False
      else:
        print("ERROR: 输入错误，前端模块为app和modeler")
        return False
    for mode in modes:
      for sub_module in sub_modules:
        if not os.path.isdir("%s/%s/%s/%s" % (rootpath, mode, DWF_WEB_SOURCE_PATH, sub_module[:-1])):
          os.makedirs("%s/%s/%s/%s" % (rootpath, mode, DWF_WEB_SOURCE_PATH, sub_module[:-1]))
        with open("%s/%s/%s/%s/%s" % (rootpath, mode, DWF_WEB_SOURCE_PATH, sub_module[:-1], DWF_WEB_CONFIG_FILE), "w", encoding="utf-8") as f:
          f.write("export const entries = []")
          success = True
    return success

  # 初始化package.json, 使用package-backup.json覆盖package.json
  def initWebPackage(self, rootpath, module=None):
    modes = DWF_WEB
    if module is not None:
      if module in MODULE_WEB:
        modes = [MODULE_WEB_TO_DWF_WEB[module]]
      else:
        print("ERROR: 输入错误，前端模块为app和modeler")
        return False
    for mode in modes:
      package_json = "%s/%s/package.json" % (rootpath, mode)
      shutil.copy("%s/package-backup.json" % package_json.rsplit('/', 1)[0], package_json)

  # 初始化public
  def initWebPublic(self, rootpath, module=None):
    modes = DWF_WEB
    if module is not None:
      if module in MODULE_WEB:
        modes = [MODULE_WEB_TO_DWF_WEB[module]]
      else:
        print("ERROR: 输入错误，前端模块为app和modeler")
        return False
    for mode in modes:
      public_folder = "%s/%s/public/static" % (rootpath, mode)
      if os.path.isdir(public_folder):
        shutil.rmtree(public_folder)

  # typ = merge, cover
  def mergeSvcPom(self, srcFile, dstFile, typ="merge"):
    src_plugin_start_idx = src_plugin_end_idx = -1
    src_dep_lines = []

    with open(srcFile, "r", encoding="utf-8") as f:
      lines = f.readlines()
      for idx, line in enumerate(lines):
        if "<!--plugin start-->" in line:
          src_plugin_start_idx = idx
          continue
        if "<!--plugin end-->" in line:
          src_plugin_end_idx = idx
          continue
        if src_plugin_start_idx >= 0: # <!--plugin start-->
          if src_plugin_end_idx < 0:
            src_dep_lines.append(line)
          if src_plugin_end_idx > src_plugin_start_idx: # <!--plugin end-->
            break

    if src_plugin_start_idx < 0 or src_plugin_end_idx < 0:
      print("ERROR: %s文件读取失败" % srcFile)
      return False

    dst_plugin_start_idx = dst_plugin_end_idx = -1
    dst_pre_dep_lines = []
    dst_pom_lines = []

    with open(dstFile, "r", encoding="utf-8") as f:
      dst_pom_lines = f.readlines()
      for idx, line in enumerate(dst_pom_lines):
        if "<!--plugin start-->" in line:
          dst_plugin_start_idx = idx
          continue
        if "<!--plugin end-->" in line:
          dst_plugin_end_idx = idx
          continue
        if dst_plugin_start_idx >= 0:
          if dst_plugin_end_idx < 0:
            dst_pre_dep_lines.append(line)
          if dst_plugin_end_idx > dst_plugin_start_idx:
            break

    if dst_plugin_start_idx < 0 or dst_plugin_end_idx < 0:
      print("ERROR: %s文件读取失败" % dstFile)
      return False

    if typ != "cover": # 去重，合并
      src_dep_lines = self.deduplicateDependencies(src_dep_lines, dst_pre_dep_lines)
      if len(src_dep_lines) == 0:
        for dst_pre_dep_line in dst_pre_dep_lines:
          if "<dependency>" in dst_pre_dep_line:
            return False

    # 清除原文件内容
    output_pom = []
    inPlugin = False
    coverPlugin = False
    for line in dst_pom_lines:
      if "<!--plugin end-->" in line:
        inPlugin = False
      if "<!--plugin start-->" in line:
        inPlugin = True
        output_pom.append(line)
      if inPlugin:
        if not coverPlugin:
          for src_dep_line in src_dep_lines:
            output_pom.append(src_dep_line)
          coverPlugin = True
        else:
          continue
      else:
        output_pom.append(line)

    bkup_dstFile = "%s/pom_bkup.xml" % dstFile.rsplit('/', 1)[0]
    try:
      shutil.copy(dstFile, bkup_dstFile) # 备份原始pom
      with open(dstFile, "w", encoding="utf-8") as f:
        f.writelines(output_pom)
    except:
      shutil.copy(bkup_dstFile, dstFile)
      os.remove(bkup_dstFile)
      traceback.print_exc()
      print("ERROR: pom文件写入失败")
      return False

    os.remove(bkup_dstFile)
    return True

  def deduplicateDependencies(self, src_dep_lines, dst_pre_dep_lines):
    deduplicated_lines = []
    src_dep_namelist = self.getDependencies(src_dep_lines)
    dst_dep_namelist = self.getDependencies(dst_pre_dep_lines)
    duplicate_deps = src_dep_namelist.keys() & dst_dep_namelist.keys()
    for each in duplicate_deps:
      del dst_dep_namelist[each]
    for each in dst_dep_namelist:
      for eachline in dst_dep_namelist[each]:
        deduplicated_lines.append(eachline)
    for each in src_dep_namelist:
      for eachline in src_dep_namelist[each]:
        deduplicated_lines.append(eachline)
    return deduplicated_lines

  def getDependencies(self, dep_lines): # {"artifactId": [lines]}
    result = {}
    dep_block = []
    artifactId = ""

    for idx, line in enumerate(dep_lines):
      if "<dependency>" in line:
        dep_block = []
        artifactId = ""
      if "<artifactId>" in line:
        start = line.find("<artifactId>")
        end = line.find("</artifactId>")
        artifactId = line[start + len("<artifactId>"):end]
      dep_block.append(line)
      if "</dependency>" in line and artifactId != "":
        result[artifactId] = dep_block
    return result

  ########################################### 处理assemble-all状态信息
  # 扫描每个assemble-part到assemble-all
  # initType = total(完全刷新), part(指定刷新某part), uploadSdk(更新sdkLastModifyTime), update(更新指定part并扫描新增), None(扫描新增)
  def initAssembleAll(self, initType=None, partList=[]):
    if not os.path.isfile("%s/assemble-all.yaml" % PART_N_PATH):
      f = open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8")
      f.close()
    with open("%s/assemble-all.yaml" % PART_N_PATH, "r", encoding="utf-8") as f:
      yaml_all = yaml.safe_load(f)
    if yaml_all is None: # 初始化
      yaml_all = {}
      yaml_all["version"] = "v1"
    curTime = time.time() * 1000

    if not initType == "uploadSdk":
      yaml_all["lastModifyTime"] = curTime
    if not "status" in yaml_all or initType == "total":
      yaml_all["status"] = 0
    if not "lastAssembleTime" in yaml_all or initType == "total":
      yaml_all["lastAssembleTime"] = 0
    if not "lastCompileTime" in yaml_all or initType == "total":
      yaml_all["lastCompileTime"] = 0
    if not "Parts" in yaml_all or yaml_all["Parts"] is None or initType == "total":
      yaml_all["Parts"] = {}
    if not "sdkStatus" in yaml_all:
      yaml_all["sdkStatus"] = 1
    if not "sdkLastAssembleTime" in yaml_all:
      yaml_all["sdkLastAssembleTime"] = 0
    if not "sdkLastModifyTime" in yaml_all:
      yaml_all["sdkLastModifyTime"] = 0

    if initType == "uploadSdk": # 上传sdk包
      yaml_all["sdkStatus"] = 0
      yaml_all["sdkLastModifyTime"] = curTime

    for part in os.listdir(PART_N_PATH): # each part
      if not os.path.isfile("%s/%s/assemble-part.yaml" % (PART_N_PATH, part)):
        continue

      try:
        with open("%s/%s/assemble-part.yaml" % (PART_N_PATH, part), "r", encoding="utf-8") as f:
          yaml_part = yaml.safe_load(f)
        if not "CodePart" in yaml_part:
          print("%s/%s/assemble-part.yaml文件格式错误，跳过" % (PART_N_PATH, part))
          continue
      except:
        traceback.print_exc()
        continue

      writeYamlPart = False
      if not part in yaml_all["Parts"] or initType == part or (initType == "update" and part in partList): # 初始化
        yaml_all["Parts"][part] = {}
        yaml_all["Parts"][part]["status"] = 0
        yaml_all["Parts"][part]["assembled"] = False
        yaml_all["Parts"][part]["compiled"] = False
        yaml_all["Parts"][part]["enabled"] = True
        yaml_all["Parts"][part]["lastAssembleTime"] = 0
        yaml_all["Parts"][part]["lastCompileTime"] = 0
        yaml_all["Parts"][part]["lastModifyTime"] = curTime

      if not "cname" in yaml_part["CodePart"]["part"]:
        yaml_part["CodePart"]["part"]["cname"] = part
        writeYamlPart = True
      if not "note" in yaml_part["CodePart"]["part"]:
        yaml_part["CodePart"]["part"]["note"] = part
        writeYamlPart = True
      yaml_all["Parts"][part]["note"] = yaml_part["CodePart"]["part"]["note"]
      yaml_all["Parts"][part]["cname"] = yaml_part["CodePart"]["part"]["cname"]

      for web_or_svc in [PART_WEB, PART_SVC]: # 初始化partN/刷新原有partN状态
        modules = LOCAL_MODULE_WEB
        if web_or_svc == PART_SVC:
          modules = MODULE_SVC
        if not web_or_svc in yaml_all["Parts"][part]: # 重置指定partN，或上传后新增/覆盖了partN
          if web_or_svc in yaml_part["CodePart"] and os.path.isdir("%s/%s/%s" % (PART_N_PATH, part, web_or_svc)):
            yaml_all["Parts"][part][web_or_svc] = {}
            for module in modules:
              if module in yaml_part["CodePart"][web_or_svc] and os.path.isdir("%s/%s/%s/%s" % (PART_N_PATH, part, web_or_svc, module)):
                yaml_all["Parts"][part][web_or_svc][module] = {}
                yaml_all["Parts"][part][web_or_svc][module]["assembled"] = False
                yaml_all["Parts"][part][web_or_svc][module]["compiled"] = False
                yaml_all["Parts"][part][web_or_svc][module]["enabled"] = True
                yaml_all["Parts"][part][web_or_svc][module]["name"] = yaml_part["CodePart"][web_or_svc][module]["name"]
                yaml_all["Parts"][part][web_or_svc][module]["cname"] = yaml_part["CodePart"][web_or_svc][module]["cname"]
        elif initType == "total":
          if not web_or_svc in yaml_part["CodePart"] or not os.path.isdir("%s/%s/%s" % (PART_N_PATH, part, web_or_svc)):
            continue
          for module in modules:
            if module in yaml_part["CodePart"][web_or_svc] and os.path.isdir("%s/%s/%s/%s" % (PART_N_PATH, part, web_or_svc, module)):
              yaml_all["Parts"][part][web_or_svc][module]["enabled"] = True
              yaml_all["Parts"][part]["enabled"] = True
              yaml_all["Parts"][part]["status"] = 0
              yaml_all["Parts"][part][web_or_svc][module]["assembled"] = False
              yaml_all["Parts"][part][web_or_svc][module]["compiled"] = False
              yaml_all["Parts"][part]["lastModifyTime"] = curTime
              yaml_all["Parts"][part]["assembled"] = False
              yaml_all["Parts"][part]["compiled"] = False

      if writeYamlPart:
        with open("%s/%s/assemble-part.yaml" % (PART_N_PATH, part), "w", encoding="utf-8") as f:
          yaml.dump(yaml_part, f)

      if not initType == "uploadSdk":
        yaml_all = self.syncSdkStatus(yaml_all, "afterUpload") # status不是9就改为0

    with open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8") as f:
      yaml.dump(yaml_all, f)

  def removeAssembleAll(self, partN):
    with open("%s/assemble-all.yaml" % PART_N_PATH, "r", encoding="utf-8") as f:
      yaml_all = yaml.safe_load(f)

    newParts = {}
    for part in yaml_all["Parts"]:
      if part != partN and os.path.isfile("%s/%s/assemble-part.yaml" % (PART_N_PATH, part)):
        newParts[part] = yaml_all["Parts"][part]

    yaml_all["Parts"] = newParts
    yaml_all = self.syncSdkStatus(yaml_all)

    with open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8") as f:
      yaml.dump(yaml_all, f)

  # typ = moved, compiled, assembled, all
  def getPartStatus(self, pluginStatus, typ="all"):
    result = {}

    if typ == "moved" or typ == "all": # 全部移动成功，part状态=1移动成功等待编译/-1移动失败
      moved = pluginStatus["moved"] # {"part01":{"part-app":{"common": True}},{"part-web":{"modeler":True}}}
      for part in moved:
        allSuccess = True
        for web_or_svc in moved[part]:
          for module in moved[part][web_or_svc]:
            allSuccess = allSuccess and moved[part][web_or_svc][module]
        result[part] = allSuccess

    if typ == "compiled" or typ == "all": # 全部编译通过，part状态=2编译成功等待重启(lastAssembleTime)/-2编译失败，module状态(assembled)
      moved = pluginStatus["moved"]
      compiled = pluginStatus["compiled"] # "compiled": {"dwf-app": True, "app-web": True}
      for part in moved:
        allSuccess = True
        for web_or_svc in moved[part]:
          for module in moved[part][web_or_svc]:
            if web_or_svc == PART_WEB:
              if module == "common":
                allSuccess = allSuccess and compiled["app-web"] and compiled["modeler-web"]
              else:
                allSuccess = allSuccess and compiled[MODULE_WEB_TO_DWF_WEB[module]]
            elif web_or_svc == PART_SVC:
              allSuccess = allSuccess and compiled[MODULE_SVC_TO_DWF_SVC[module]]
        result[part] = allSuccess

    if typ == "assembled" or typ == "all": # 全部重启成功，part状态=3成功/-3重启失败(lastAssembleTime)
      moved = pluginStatus["moved"]
      assembled = pluginStatus["assembled"] # "assembled": {"dwf-app": True, "app-web": True}
      for part in moved:
        allSuccess = True
        for web_or_svc in moved[part]:
          for module in moved[part][web_or_svc]:
            if web_or_svc == PART_WEB:
              if module == "common":
                allSuccess = allSuccess and assembled["app-web"] and assembled["modeler-web"]
              else:
                allSuccess = allSuccess and assembled[MODULE_WEB_TO_DWF_WEB[module]]
            elif web_or_svc == PART_SVC:
              if module == "common":
                allSuccess = allSuccess and assembled["dwf-app"] and assembled["dwf-modeler"]
              else:
                allSuccess = allSuccess and assembled[MODULE_SVC_TO_DWF_SVC[module]]
        result[part] = allSuccess

    return result

  # typ = moved, compiled, assembled, all, uninstalling, uninstalled
  def checkAllSuccess(self, pluginStatus):
    with open("%s/assemble-all.yaml" % PART_N_PATH, "r", encoding="utf-8") as f:
      yaml_all = yaml.safe_load(f)

    for part in pluginStatus["moved"]:
      if yaml_all["Parts"][part]["status"] == 9:
        print("%s正在装配中" % part)
        return False
      if yaml_all["Parts"][part]["status"] < 0:
        print("%s未装配成功" % part)
        return False
    return True

  # typ = moved, compiled, assembled, all, uninstalling, uninstalled, sdkAssembled
  def updateAssembleStatus(self, pluginStatus, typ="all", success=True):
    try:
      with open("%s/assemble-all.yaml" % PART_N_PATH, "r", encoding="utf-8") as f:
        yaml_all = yaml.safe_load(f)
    except:
      print("%s/assemble-all.yaml文件不存在" % PART_N_PATH)
      return False

    curTime = time.time() * 1000

    if typ == "moved" or typ == "all": # 全部移动成功，part状态=1移动成功等待编译/-1移动失败
      if success:
        moved = pluginStatus["moved"] # {"part01":{"part-app":{"common": True}},{"part-web":{"modeler":True}}}
        for part in moved:
          allSuccess = True
          for web_or_svc in moved[part]:
            for module in moved[part][web_or_svc]:
              allSuccess = allSuccess and moved[part][web_or_svc][module]
          if allSuccess:
            yaml_all["Parts"][part]["status"] = 1 # 成功，等待编译
          if not allSuccess:
            yaml_all["Parts"][part]["status"] = -1 # 移动失败
      else:
        for part in pluginStatus["selected"]:
          yaml_all["Parts"][part]["status"] = -1 # 移动失败
      yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "compiled" or typ == "all": # 全部编译通过，part状态=2编译成功等待重启(lastAssembleTime)/-2编译失败，module状态(assembled)
      if success:
        moved = pluginStatus["moved"]
        compiled = pluginStatus["compiled"] # "compiled": {"dwf-app": True, "app-web": True}
        for part in moved:
          allSuccess = True
          for web_or_svc in moved[part]:
            for module in moved[part][web_or_svc]:
              if web_or_svc == PART_WEB:
                if module == "common":
                  yaml_all["Parts"][part][web_or_svc][module]["compiled"] = compiled["app-web"] and compiled["modeler-web"]
                  allSuccess = allSuccess and compiled["app-web"] and compiled["modeler-web"]
                else:
                  yaml_all["Parts"][part][web_or_svc][module]["compiled"] = compiled[MODULE_WEB_TO_DWF_WEB[module]]
                  allSuccess = allSuccess and compiled[MODULE_WEB_TO_DWF_WEB[module]]
              elif web_or_svc == PART_SVC:
                yaml_all["Parts"][part][web_or_svc][module]["compiled"] = compiled[MODULE_SVC_TO_DWF_SVC[module]]
                allSuccess = allSuccess and compiled[MODULE_SVC_TO_DWF_SVC[module]]
          if allSuccess:
            yaml_all["Parts"][part]["status"] = 2 # 成功，等待重启
            yaml_all["Parts"][part]["lastCompileTime"] = curTime
            yaml_all["Parts"][part]["compiled"] = True
          else:
            yaml_all["Parts"][part]["status"] = -2 # 编译失败
            yaml_all["Parts"][part]["compiled"] = False
            yaml_all = self.syncModuleFalseStatus(yaml_all, "compiled")
      else:
        for part in pluginStatus["selected"]:
          yaml_all["Parts"][part]["status"] = -2 # 编译失败
          yaml_all["Parts"][part]["compiled"] = False
        yaml_all = self.syncModuleFalseStatus(yaml_all, "compiled")
      yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "assembled" or typ == "all": # 全部重启成功，part状态=3成功/-3重启失败(lastAssembleTime)
      if success:
        moved = pluginStatus["moved"]
        assembled = pluginStatus["assembled"] # "assembled": {"dwf-app": True, "app-web": True}
        for part in moved:
          allSuccess = True
          for web_or_svc in moved[part]:
            for module in moved[part][web_or_svc]:
              if web_or_svc == PART_WEB:
                if module == "common":
                  yaml_all["Parts"][part][web_or_svc][module]["assembled"] = assembled["app-web"] and assembled["modeler-web"]
                  allSuccess = allSuccess and assembled["app-web"] and assembled["modeler-web"]
                else:
                  yaml_all["Parts"][part][web_or_svc][module]["assembled"] = assembled[MODULE_WEB_TO_DWF_WEB[module]]
                  allSuccess = allSuccess and assembled[MODULE_WEB_TO_DWF_WEB[module]]
              elif web_or_svc == PART_SVC:
                if module == "common":
                  yaml_all["Parts"][part][web_or_svc][module]["assembled"] = assembled["dwf-app"] and assembled["dwf-modeler"]
                  allSuccess = allSuccess and assembled["dwf-app"] and assembled["dwf-modeler"]
                else:
                  yaml_all["Parts"][part][web_or_svc][module]["assembled"] = assembled[MODULE_SVC_TO_DWF_SVC[module]]
                  allSuccess = allSuccess and assembled[MODULE_SVC_TO_DWF_SVC[module]]
          if allSuccess:
            yaml_all["Parts"][part]["status"] = 3 # 成功
            yaml_all["Parts"][part]["lastAssembleTime"] = curTime
            yaml_all["Parts"][part]["assembled"] = True
            if not yaml_all["Parts"][part]["compiled"]:
              yaml_all["Parts"][part]["compiled"] = True
              yaml_all["Parts"][part]["lastCompileTime"] = curTime
          else:
            yaml_all["Parts"][part]["status"] = -3 # 重启失败
            yaml_all["Parts"][part]["assembled"] = False
            yaml_all = self.syncModuleFalseStatus(yaml_all, "assembled")
      else:
        for part in pluginStatus["selected"]:
          yaml_all["Parts"][part]["status"] = -3 # 重启失败
          yaml_all["Parts"][part]["assembled"] = False
        yaml_all = self.syncModuleFalseStatus(yaml_all, "assembled")
      yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "uninstalling":
      for part in yaml_all["Parts"]:
        yaml_all["Parts"][part]["assembled"] = False
        yaml_all["Parts"][part]["compiled"] = False
        if yaml_all["Parts"][part]["status"] != 9:
          yaml_all["Parts"][part]["status"] = 0
      yaml_all = self.syncModuleFalseStatus(yaml_all, "assembled")
      yaml_all = self.syncModuleFalseStatus(yaml_all, "compiled")

    if typ == "uninstalled":
      if success:
        yaml_all["status"] = 0
        for part in yaml_all["Parts"]:
          yaml_all["Parts"][part]["assembled"] = False
          yaml_all["Parts"][part]["compiled"] = False
          yaml_all["Parts"][part]["status"] = 0
        yaml_all = self.syncModuleFalseStatus(yaml_all, "assembled")
        yaml_all = self.syncModuleFalseStatus(yaml_all, "compiled")
      else:
        yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "sdkAssembled": # sdk升级
      if success:
        yaml_all["sdkStatus"] = 1
        yaml_all["sdkLastAssembleTime"] = curTime
      else:
        yaml_all["sdkStatus"] = -1

    with open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8") as f:
      yaml.dump(yaml_all, f)
    return True

  # typ = preMove, preCompile, preAssemble, preUninstall, preSdkAssemble, all
  def checkAssembleStatus(self, pluginStatus=None, typ="all"):
    yaml_all = yaml.safe_load(open("%s/assemble-all.yaml" % PART_N_PATH, encoding="utf-8").read())

    if yaml_all["status"] == 9:
      print("正在装配中，停止本次装配")
      return False
    if yaml_all["Parts"] is not None:
      for part in yaml_all["Parts"]:
        if yaml_all["Parts"][part]["status"] == 9:
          print("%s正在装配中，停止本次装配" % part)
          return False
    if yaml_all["sdkStatus"] == 9:
      print("sdk正在升级中，停止本次装配")
      return False

    if typ == "all":
      return True

    if typ == "preMove":
      selected = pluginStatus["selected"] # {"part01":{"part-app":{"common": True}},{"part-web":{"modeler":True}}}
      for part in yaml_all["Parts"]:
        for web_or_svc in yaml_all["Parts"][part]: # 重置为False
          if not web_or_svc in [PART_WEB, PART_SVC]:
            continue
          for module in yaml_all["Parts"][part][web_or_svc]:
            yaml_all["Parts"][part][web_or_svc][module]["enabled"] = False
        if part in selected: # 更新选中装配的模块
          for web_or_svc in selected[part]: # assemble-part有某模块，但assemble-all的模块被人为删掉了，以assemble-all为准
            if not web_or_svc in [PART_WEB, PART_SVC] or web_or_svc not in yaml_all["Parts"][part]:
              continue
            for module in selected[part][web_or_svc]:
              if module not in yaml_all["Parts"][part][web_or_svc]:
                continue
              yaml_all["Parts"][part][web_or_svc][module]["enabled"] = selected[part][web_or_svc][module]
              yaml_all["Parts"][part]["status"] = 9
      yaml_all = self.enableParts(yaml_all)
      yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "preCompile" or typ == "preAssemble":
      moved = pluginStatus["moved"]
      for part in moved:
        if "Parts" in yaml_all and part in yaml_all["Parts"]:
          yaml_all["Parts"][part]["status"] = 9
        else:
          print("%s/assemble-all.yaml文件错误或没记录%s" % (PART_N_PATH, part))
      yaml_all = self.syncSdkStatus(yaml_all)

    if typ == "preUninstall":
      yaml_all["status"] = 9 # 卸载中
      for part in yaml_all["Parts"]:
        for web_or_svc in yaml_all["Parts"][part]:
          if not web_or_svc in [PART_WEB, PART_SVC]:
            continue
          for module in yaml_all["Parts"][part][web_or_svc]:
            yaml_all["Parts"][part][web_or_svc][module]["enabled"] = False
            yaml_all["Parts"][part]["enabled"] = False
            yaml_all["Parts"][part]["status"] = 0

    if typ == "preSdkAssemble":
      yaml_all["sdkStatus"] = 9

    with open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8") as f:
      yaml.dump(yaml_all, f)
    return True

  # typ = enabled, compiled, assembled
  # 根据状态获取插件名
  def getPartsByType(self, typ):
    yaml_all = yaml.safe_load(open("%s/assemble-all.yaml" % PART_N_PATH, encoding="utf-8").read())

    res = []
    if "Parts" not in yaml_all:
      return res

    for part in yaml_all["Parts"]:
      for web_or_svc in yaml_all["Parts"][part]:
        if not web_or_svc in [PART_WEB, PART_SVC]:
          continue
        for module in yaml_all["Parts"][part][web_or_svc]:
          # 如果以后又细化到每个module的话，这里方便修改
          if part in res or not os.path.isdir("%s/%s/%s/%s" % (PARTS_PATH, part, web_or_svc, module)):
            continue
          if typ == 'enabled' and yaml_all["Parts"][part][web_or_svc][module]["enabled"]:
            res.append(part)
          elif typ == 'compiled' and yaml_all["Parts"][part][web_or_svc][module]["compiled"]:
            res.append(part)
          elif typ == 'assembled' and yaml_all["Parts"][part][web_or_svc][module]["assembled"]:
            res.append(part)

    return res

  # modules的enabled状态向part同步
  def enableParts(self, yaml_all):
    if "Parts" not in yaml_all:
      return yaml_all
    for part in yaml_all["Parts"]:
      yaml_all["Parts"][part]["enabled"] = False
      for web_or_svc in yaml_all["Parts"][part]:
        if not web_or_svc in [PART_WEB, PART_SVC]:
          continue
        for module in yaml_all["Parts"][part][web_or_svc]:
          if yaml_all["Parts"][part][web_or_svc][module]["enabled"]:
            yaml_all["Parts"][part]["enabled"] = True
            break
    return yaml_all

  # parts状态向sdk同步
  def syncSdkStatus(self, yaml_all, typ=None):
    status = 0
    lastModifyTime = 0
    lastAssembleTime = 0
    lastCompileTime = 0
    if yaml_all["Parts"] is None:
      yaml_all["Parts"] = {}
    if yaml_all["status"] is None:
      yaml_all["status"] = status

    for part in yaml_all["Parts"]:
      if yaml_all["Parts"][part]["lastModifyTime"] > lastModifyTime:
        lastModifyTime = yaml_all["Parts"][part]["lastModifyTime"]
      if yaml_all["Parts"][part]["lastAssembleTime"] > lastAssembleTime:
        lastAssembleTime = yaml_all["Parts"][part]["lastAssembleTime"]
      if yaml_all["Parts"][part]["lastCompileTime"] > lastCompileTime:
        lastCompileTime = yaml_all["Parts"][part]["lastCompileTime"]

      if yaml_all["Parts"][part]["enabled"]:
        if yaml_all["Parts"][part]["status"] < 0 or yaml_all["Parts"][part]["status"] == 9:
          status = yaml_all["Parts"][part]["status"]
        elif yaml_all["Parts"][part]["status"] > status:
          status = yaml_all["Parts"][part]["status"]

    if typ == "afterUpload" and status != 9: # 插件包上传时没有part在装配
      if yaml_all["status"] == 9: # 卸载中
        status = 9
      else:
        status = 0
    yaml_all["status"] = status
    yaml_all["lastModifyTime"] = lastModifyTime
    yaml_all["lastAssembleTime"] = lastAssembleTime
    yaml_all["lastCompileTime"] = lastCompileTime

    return yaml_all

  # part失败时向module同步状态
  def syncModuleFalseStatus(self, yaml_all, typ):
    if "Parts" not in yaml_all or typ not in ["assembled", "compiled"]:
      return yaml_all
    for part in yaml_all["Parts"]:
      if not yaml_all["Parts"][part][typ]:
        for web_or_svc in yaml_all["Parts"][part]:
          if not web_or_svc in [PART_WEB, PART_SVC]:
            continue
          for module in yaml_all["Parts"][part][web_or_svc]:
            yaml_all["Parts"][part][web_or_svc][module][typ] = yaml_all["Parts"][part][typ]
    return yaml_all

  # 给指定part写入cname和note
  # 被调用：updateAssemblePart
  def updateAssemblePart(self, part, packageName, cname, note):
    assemble_part_path = "%s/%s/assemble-part.yaml" % (PART_N_PATH, part)
    if not os.path.isfile(assemble_part_path):
      return False
    with open(assemble_part_path, "r", encoding="utf-8") as f:
      yaml_part = yaml.safe_load(f)
    if not "CodePart" in yaml_part or not "part" in yaml_part["CodePart"]:
      return False
    yaml_part["CodePart"]["part"]["cname"] = cname
    yaml_part["CodePart"]["part"]["note"] = note
    if len(packageName) > 0:
      yaml_part["CodePart"]["part"]["package"] = packageName
    with open(assemble_part_path, "w", encoding="utf-8") as f:
      yaml.dump(yaml_part, f)

    assemble_all_path = "%s/assemble-all.yaml" % PART_N_PATH
    if os.path.isfile(assemble_all_path):
      with open(assemble_all_path, "r", encoding="utf-8") as f:
        yaml_all = yaml.safe_load(f)
      if "Parts" in yaml_all and part in yaml_all["Parts"]:
        yaml_all["Parts"][part]["cname"] = cname
        yaml_all["Parts"][part]["note"] = note
        if len(packageName) > 0:
          yaml_all["Parts"][part]["package"] = packageName
        with open(assemble_all_path, "w", encoding="utf-8") as f:
          yaml.dump(yaml_all, f)
    # TODO: 清除没有被记录的且时间小于当前包的插件包

  # sdk升级成功后，将version更新到assemble-all
  def updateVersion(self, yaml_all=None):
    version = self.getCurVersion()
    if yaml_all is None:
      with open("%s/assemble-all.yaml" % PART_N_PATH, "r", encoding="utf-8") as f:
        yaml_all = yaml.safe_load(f)
      yaml_all["version"] = version
      with open("%s/assemble-all.yaml" % PART_N_PATH, "w", encoding="utf-8") as f:
        yaml.dump(yaml_all, f)
      return yaml_all
    else:
      yaml_all["version"] = version
      return yaml_all


  ########################################### 备份与恢复
  # 备份jar和war到backup
  def backupJarWar(self, log, backupPath=BACKUP_PATH):
    log.info("backing up jar and war to %s" % backupPath)
    for jar in JAR_PACKAGE:
      srcFile = "%s/%s" % (JAR_PATH, jar)
      dstFile = "%s/%s" % (backupPath, jar)
      if os.path.isfile(dstFile):
        os.remove(dstFile)
      shutil.copy(srcFile, dstFile)
      log.info("copy %s to %s" % (srcFile, dstFile))
    for war in WAR_DIR:
      srcDir = "%s/%s" % (WAR_PATH, war)
      dstDir = "%s/%s" % (backupPath, war)
      if os.path.isdir(dstDir):
        shutil.rmtree(dstDir)
      shutil.copytree(srcDir, dstDir)
      log.info("copy %s to %s" % (srcDir, dstDir))

  # 恢复jar和war
  def resumeJarWar(self, log, backupPath=BACKUP_PATH):
    log.info("resuming jar and war from %s" % backupPath)
    for jar in JAR_PACKAGE:
      dstFile = "%s/%s" % (JAR_PATH, jar)
      srcFile = "%s/%s" % (backupPath, jar)
      if os.path.isfile(dstFile):
        os.remove(dstFile)
      shutil.copy(srcFile, dstFile)
      log.info("copy %s to %s" % (srcFile, dstFile))
    for war in WAR_DIR:
      dstDir = "%s/%s" % (WAR_PATH, war)
      srcDir = "%s/%s" % (backupPath, war)
      if os.path.isdir(dstDir):
        shutil.rmtree(dstDir)
      shutil.copytree(srcDir, dstDir)
      log.info("copy %s to %s" % (srcDir, dstDir))

  # 备份application.properties和config.js
  def backupPropConfig(self, log, backupPath=BACKUP_PATH):
    log.info("backing up application.properties and config.js to %s" % backupPath)
    propSrc = "%s/application.properties" % deploy_path
    if os.path.isfile(propSrc):
      shutil.copyfile(propSrc, "%s/application.properties" % backupPath)
    appConfigSrc = "%s/app-web/config.js" % WAR_PATH
    if os.path.isfile(appConfigSrc):
      shutil.copyfile(appConfigSrc, "%s/config.js.app" % backupPath)
    modelerConfigSrc = "%s/modeler-web/config.js" % WAR_PATH
    if os.path.isfile(modelerConfigSrc):
      shutil.copyfile(modelerConfigSrc, "%s/config.js.modeler" % backupPath)

  # 恢复application.properties和config.js
  def resumePropConfig(self, log, backupPath=BACKUP_PATH):
    log.info("resuming application.properties and config.js from %s" % backupPath)
    propDst = "%s/application.properties" % deploy_path
    if os.path.isfile("%s/application.properties" % backupPath):
      shutil.copyfile("%s/application.properties" % backupPath, propDst)
    appConfigDst = "%s/app-web/config.js" % WAR_PATH
    if os.path.isfile("%s/config.js.app" % backupPath):
      shutil.copyfile("%s/config.js.app" % backupPath, appConfigDst)
    modelerConfigDst = "%s/modeler-web/config.js" % WAR_PATH
    if os.path.isfile("%s/config.js.modeler" % backupPath):
      shutil.copyfile("%s/config.js.modeler" % backupPath, modelerConfigDst)

  # 更新application.properties和config.js
  def updatePropConfig(self, log, sdkPath):
    log.info("updating application.properties and config.js")
    propSrc = "%s/scripts/application.properties" % sdkPath
    propDst = "%s/application.properties" % deploy_path
    try:
      src = Properties(propSrc).getProperties()
      dst = Properties(propDst).getProperties()
      diff = self.getDictDiff(src, dst)
      with open(propDst, "a", encoding="UTF-8") as f:
        if len(diff) > 0:
          log.info("write following prop to %s" % propDst)
          for k, v in diff.items():
            f.writelines("%s=%s\n" % (k, v))
            log.info("%s=%s" % (k, v))
        else:
          log.info("nothing changed in %s" % propDst)
    except Exception as e:
      print("exception in updatePropConfig (application.properties): %s" % e)
      # log.error("exception in updatePropConfig (application.properties): %s" % e)

    appConfigSrc = "%s/app-web/public/config.js" % sdkPath
    appConfigDst = "%s/app-web/config.js" % WAR_PATH
    try:
      configJsDst = ConfigJs(appConfigDst)
      src = ConfigJs(appConfigSrc).getConfig()
      dst = configJsDst.getConfig()
      diff = self.getDictDiff(src, dst)
      if len(diff) > 0:
        log.info("write following config to %s" % appConfigDst)
        configJsDst.writeConfig(diff, log)
      else:
        log.info("nothing changed in %s" % appConfigDst)
    except Exception as e:
      print("exception in updatePropConfig (app-web/config.js): %s" % e)
      # log.error("exception in updatePropConfig (app-web/config.js): %s" % e)

    modelerConfigSrc = "%s/modeler-web/public/config.js" % sdkPath
    modelerConfigDst = "%s/modeler-web/config.js" % WAR_PATH
    try:
      configJsDst = ConfigJs(modelerConfigDst)
      src = ConfigJs(modelerConfigSrc).getConfig()
      dst = configJsDst.getConfig()
      diff = self.getDictDiff(src, dst)
      if len(diff) > 0:
        log.info("write following config to %s" % modelerConfigDst)
        configJsDst.writeConfig(diff, log)
      else:
        log.info("nothing changed in %s" % modelerConfigDst)
    except Exception as e:
      print("exception in updatePropConfig (modeler-web/config.js): %s" % e)
      # log.error("exception in updatePropConfig (modeler-web/config.js): %s" % e)

  # 装配成功后，对tmp目录(dwf-part-all)进行备份，以便sdk升级时调用
  def backupAssembledParts(self):
    if os.path.isdir("%s-backup" % PART_TMP_PATH):
      shutil.rmtree("%s-backup" % PART_TMP_PATH)
    try:
      shutil.copytree(PART_TMP_PATH, "%s-backup" % PART_TMP_PATH)
    except:
      traceback.print_exc()

  # 卸载成功后/无插件的纯sdk升级成功后，把dwf-app.jar和dwf-modeler.jar备份到origin目录
  def backupJarToOrigin(self, log=None):
    if log is not None:
      log.info("backing up jar to origin: %s" % ORIGIN_BACKUP_PATH)
    for jar in JAR_PACKAGE:
      if "monitor" in jar:
        continue
      srcPath = "%s/%s" % (deploy_path, jar)
      dstPath = "%s/%s" % (ORIGIN_BACKUP_PATH, jar)
      if os.path.isfile(dstPath):
        os.remove(dstPath)
      if os.path.isfile(srcPath):
        shutil.copyfile(srcPath, dstPath)
        if log is not None:
          log.info("copy %s to %s" % (srcPath, dstPath))

  # lib, app-web, modeler-web, assemble_components >> origin
  # dwf-app, dwf-common, dwf-modeler >> origin
  # version >> assemble/addins
  # 删除origin的dwf-app.jar, dwf-modeler.jar, 下次uninstall的时候才会编译生成
  # sdk升级成功后，把sdk文件覆盖到backup和origin
  def backupAfterSdkAssembled(self, log=None, sdkName="DWF3.0"):
    if log is not None:
      log.info("backing up sdk to origin: %s" % ORIGIN_BACKUP_PATH)
    currSdk = "%s/%s" % (SDK_PATH, sdkName)
    if not os.path.isdir(currSdk):
      return

    if os.path.isdir(ORIGIN_BACKUP_PATH):
      shutil.rmtree(ORIGIN_BACKUP_PATH)

    originPathList = ["dwf-common/lib", "modeler-web/src/assemble_components"]
    for each in originPathList:
      if os.path.isdir("%s/%s" % (ORIGIN_BACKUP_PATH, each.split('/')[-1])):
        shutil.rmtree("%s/%s" % (ORIGIN_BACKUP_PATH, each.split('/')[-1]))
      if os.path.isdir("%s/%s" % (currSdk, each)):
        src = "%s/%s" % (currSdk, each)
        dst = "%s/%s" % (ORIGIN_BACKUP_PATH, each.split('/')[-1])
        shutil.copytree(src, dst)
        if log is not None:
          log.info("copy %s to %s" % (src, dst))

    backupPathList = DWF_SVC
    for each in backupPathList:
      if os.path.isdir("%s/%s" % (ORIGIN_BACKUP_PATH, each)):
        shutil.rmtree("%s/%s" % (ORIGIN_BACKUP_PATH, each))
      if os.path.isdir("%s/%s" % (currSdk, each)):
        shutil.copytree("%s/%s" % (currSdk, each), "%s/%s" % (ORIGIN_BACKUP_PATH, each))
        if log is not None:
          log.info("copy %s/%s to %s/%s" % (currSdk, each, ORIGIN_BACKUP_PATH, each))

    # 后端jar包
    if not os.path.isdir("%s-backup/%s" % (PART_TMP_PATH, PART_SVC)):
      self.backupJarToOrigin(log)

    # 前端war包
    for each in DWF_WEB:
      if os.path.isdir("%s/%s" % (ORIGIN_BACKUP_PATH, each)):
        shutil.rmtree("%s/%s" % (ORIGIN_BACKUP_PATH, each))
      if not os.path.isdir("%s-backup/%s" % (PART_TMP_PATH, PART_WEB)) and os.path.isdir("%s/%s" % (currSdk, each)):
        src = "%s/%s" % (WAR_PATH, each)
        dst = "%s/%s" % (ORIGIN_BACKUP_PATH, each)
        shutil.copytree(src, dst)
        if log is not None:
          log.info("copy %s to %s" % (src, dst))

    if os.path.isfile("%s/scripts/version" % currSdk):
      shutil.copy("%s/scripts/version" % currSdk, script_path)
      if log is not None:
        log.info("copy %s/scripts/version to %s" % (currSdk, script_path))
