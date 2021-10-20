# coding=utf-8

import os
import shutil
import sys
import traceback
import zipfile
import time
import re
import json
import yaml
from util import CmdParser, Logger, Assemble
from config import dev, version, Version, PART_WEB, MODULE_WEB, LOCAL_MODULE_WEB, SUB_MODULE_WEB, DWF_WEB, DWF_WEB_SOURCE_PATH, DWF_WEB_CONFIG_FILE, PART_SVC, MODULE_SVC, SUB_MODULE_SVC, DWF_SVC, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH, DWF_SVC_RESOURCE_PATH, DWF_WEB_TO_MODULE_WEB, MODULE_WEB_TO_DWF_WEB, DWF_SVC_TO_MODULE_SVC, MODULE_SVC_TO_DWF_SVC, DWF_MODE_TO_PORT
from config import DWF_LIB_PATH, DWF_SVC_TO_JAR_PACKAGE, DWF_PATH, LOCAL_PART_N_PATH, deploy_path, SDK_PATH, BACKUP_PATH, ORIGIN_BACKUP_PATH, PART_BACK_PATH, PART_WEB_PATH, PART_TMP_PATH, COMPILE_LOG_PATH, PART_N_PATH, LATEST_SDK_PATH, LOG_LIST, COMPILE_LOG_LIST, SDK_LOG_LIST
from server import mvnInstall, npmBuild, restartBackend, restartFrontend, restartAll

cmd = CmdParser()
tool = Assemble()

########################################### 日志
if not dev:
    logger = Logger("assemble.py", COMPILE_LOG_PATH).addHandler("%s/assemble.log" % COMPILE_LOG_PATH)

# 通常用于clearLogs之后重新生成logger
def createAssembleLog():
    global logger
    logger = Logger("assemble.py", COMPILE_LOG_PATH).addHandler("%s/assemble.log" % COMPILE_LOG_PATH)


########################################### 扫描assemble-to/assemble-part，移动文件
# 扫描part01下的assemble-to.yaml并生成assemble-part.yaml
# target为part01文件夹名, mode取值为modeler-web/app-web/dwf-modeler/dwf-app/dwf-common/all
# 被调用：generateWithModel、devAssemble
def scanTO(target, mode): # target = ../dwf-part-all/part01
    if not os.path.isdir("%s/%s" % (target, PART_WEB)) and not os.path.isdir("%s/%s" % (target, PART_SVC)): # dir/part-web和dir/part-svc存在
        return

    res = []
    pack = target.split('/')[-1] # part01
    dir = target # DEPLOY_PATH/dwf-part-all/part01
    webs = {}
    for module in LOCAL_MODULE_WEB: # app, common, modeler - forms, operations
        webs[module] = {}
    svcs = {}
    for module in MODULE_SVC: # app, common, modeler - controller, entity, service
        svcs[module] = {}

    # part01中存在part-web
    if os.path.isdir("%s/%s" % (dir, PART_WEB)):
        if mode in DWF_WEB:
            modules = [mode[:-4]]
        elif mode == "all" or mode == "web":
            modules = LOCAL_MODULE_WEB
        else:
            modules = []
        for module in modules: # modeler, app, common
            assemble_to_path = "%s/%s/%s/assemble-to.yaml" % (dir, PART_WEB, module)
            if not os.path.isfile(assemble_to_path): # 不存在assemble-to文件则跳过
                continue
            else:
                with open(assemble_to_path, encoding="utf-8") as f:
                    yaml_file = yaml.safe_load(f)
                yaml_file_config = yaml_file["config"]
                yaml_file_module = yaml_file_config["info"][PART_WEB]
                # yaml_file_ignore = yaml_file_config["ignore"]
                # yaml_file_module["ignore"] = yaml_file_ignore
                # forms_list = yaml_file_module["forms"]
                # deps_list = yaml_file_module["dependencies"]
                # operations_list = yaml_file_module["operations"]

                yaml_file_module["name"] = module # 路径名覆盖assemble-to的name
                has_folder_or_file = False
                for sub_module in SUB_MODULE_WEB: # forms, operations 判断SUB_MODULE_WEB里是否为空
                    if os.path.isdir("%s/%s/%s/%s" % (dir, PART_WEB, module, sub_module)) and os.listdir("%s/%s/%s/%s" % (dir, PART_WEB, module, sub_module)):
                        has_folder_or_file = True
                        break
                # 判断public里是否为空
                if os.path.isdir("%s/%s/%s/public" % (dir, PART_WEB, module)) and os.listdir("%s/%s/%s/public" % (dir, PART_WEB, module)):
                    has_folder_or_file = True
                if has_folder_or_file:
                    webs[module] = yaml_file_module
                    res.append("%s/%s/%s" % (pack, PART_WEB, yaml_file_module["name"])) # part01/part-web/app

    # part01中存在part-svc
    if os.path.isdir("%s/%s" % (dir, PART_SVC)):
        if mode in DWF_SVC:
            modules = [mode[4:]]
        elif mode == "all" or mode == "svc":
            modules = MODULE_SVC
        else:
            modules = []
        for module in modules: # app, common, modeler
            assemble_to_path = "%s/%s/%s/assemble-to.yaml" % (dir, PART_SVC, module)
            if not os.path.isfile(assemble_to_path): # 不存在assemble-to文件则跳过
                continue
            else:
                with open(assemble_to_path, encoding="utf-8") as f:
                    yaml_file = yaml.safe_load(f)
                yaml_file_config = yaml_file["config"]
                yaml_file_module = yaml_file_config["info"][PART_SVC]
                # yaml_file_ignore = yaml_file_config["ignore"]
                # yaml_file_module["ignore"] = yaml_file_ignore
                yaml_file_module["name"] = module # 路径名覆盖assemble-to的name
                has_folder_or_file = False
                for sub_module in SUB_MODULE_SVC: # controller, entity, service 判断SUB_MODULE_SVC里是否为空
                    if os.path.isdir("%s/%s/%s/%s/%s/%s" % (dir, PART_SVC, module, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH, sub_module)) and os.listdir("%s/%s/%s/%s/%s/%s" % (dir, PART_SVC, module, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH, sub_module)):
                        has_folder_or_file = True
                        break
                # 判断resources里是否为空
                if os.path.isdir("%s/%s/%s/%s" % (dir, PART_SVC, module, DWF_SVC_RESOURCE_PATH)) and os.listdir("%s/%s/%s/%s" % (dir, PART_SVC, module, DWF_SVC_RESOURCE_PATH)):
                    has_folder_or_file = True
                if has_folder_or_file:
                    svcs[module] = yaml_file_module
                    res.append("%s/%s/%s" % (pack, PART_SVC, yaml_file_module["name"])) # part01/part-svc/app

    assemble_part_path = "%s/assemble-part.yaml" % dir
    output = {}
    try:
        if os.path.isfile(assemble_part_path):
            with open(assemble_part_path, encoding="utf-8") as f:
                output = yaml.safe_load(f)
    except:
        traceback.print_exc()

    output["CodePart"] = {PART_WEB: webs, PART_SVC: svcs, "part": {
        # "cname": target.split('/')[-1],
        "name": target.split('/')[-1]
    }}
    with open(assemble_part_path, "w", encoding="utf-8") as f:
        yaml.dump(output, f)
    return res

# 扫描part01下的assemble-part.yaml, 拷贝到目标位置
# target为part01文件夹名, mode取值为common-web(额外处理)/modeler-web/app-web/dwf-modeler/dwf-app/dwf-common/all
# 被调用：moveOnly、devAssemble
def scanPART(target, mode, dev=False, toTmp=False):
    if not os.path.isdir("%s/%s" % (target, PART_WEB)) and not os.path.isdir("%s/%s" % (target, PART_SVC)): # part01下没有part-svc和part-web
        return

    res = []
    try:
        if not dev: # 服务器中，获取assemble-all.yaml装配状态
            assemble_all_path = "%s/assemble-all.yaml" % PART_N_PATH
            if not os.path.isfile(assemble_all_path):
                return
            with open(assemble_all_path, encoding="utf-8") as f:
                yaml_all = yaml.safe_load(f)

        assemble_part_path = "%s/assemble-part.yaml" % target
        if not os.path.isfile(assemble_part_path):
            return
        with open(assemble_part_path, encoding="utf-8") as f:
            yaml_file = yaml.safe_load(f)
            partName = target.split('/')[-1]
            # partName = yaml_file["CodePart"]["part"]["name"]

            # 前端 common
            if mode == "common-web" or mode == "all" or mode == "web":
                module_info = yaml_file["CodePart"][PART_WEB]["common"]
                if len(module_info) > 0:
                    enabled = True # dev=本地调试环境
                    if not dev: # 检查装配状态，跳过未启用的模块
                        enabled = yaml_all["Parts"][partName][PART_WEB]["common"]["enabled"]
                    if enabled and mvModule(target, "common-web", module_info, dev, toTmp):
                        res.append("%s/%s/%s" % (partName, PART_WEB, module_info["name"]))
            # 前端
            if mode in DWF_WEB or mode == "all" or mode == "web":
                mode_web = [mode]
                if mode_web == "all" or mode == "web":
                    mode_web = DWF_WEB
                for each in mode_web: # app, modeler - forms, operations
                    module = DWF_WEB_TO_MODULE_WEB[each]
                    module_info = yaml_file["CodePart"][PART_WEB][module]
                    if len(module_info) > 0:
                        enabled = True
                        if not dev:
                            enabled = yaml_all["Parts"][partName][PART_WEB][module]["enabled"]
                        if enabled and mvModule(target, each, module_info, dev, toTmp):
                            res.append("%s/%s/%s" % (partName, PART_WEB, module_info["name"]))
            # 后端
            if mode in DWF_SVC or mode == "all" or mode == "svc":
                mode_svc = [mode]
                if mode_svc == "all" or mode == "svc":
                    mode_svc = DWF_SVC
                for each in mode_svc: # app, common, modeler
                    module = DWF_SVC_TO_MODULE_SVC[each]
                    module_info = yaml_file["CodePart"][PART_SVC][module]
                    if len(module_info) > 0:
                        enabled = True
                        if not dev:
                            enabled = yaml_all["Parts"][partName][PART_SVC][module]["enabled"]
                        if enabled and mvModule(target, each, module_info, dev, toTmp):
                            res.append("%s/%s/%s" % (partName, PART_SVC, module_info["name"]))
    except:
        traceback.print_exc()
    return res

# 本地生成assemble_config.js
# 被调用：devAssemble、scanConfig
def scanToConfig(rootpath, part=None, module=None, pureScanConfig=False): # ../dwf-part-all/part01/part-web/app
    dev = True
    success = False
    for each_part in os.listdir(rootpath): # each part
        if part is not None and each_part != part:
            continue
        if not os.path.isdir("%s/%s/%s" % (rootpath, each_part, PART_WEB)):
            continue

        for src_module in LOCAL_MODULE_WEB: # app, common, modeler
            if module is not None and src_module != module:
                continue
            assemble_to_path = "%s/%s/%s/%s/assemble-to.yaml" % (rootpath, each_part, PART_WEB, src_module)
            if not os.path.isfile(assemble_to_path):
                continue
            for dst_module in MODULE_WEB: # app, modeler
                if src_module != "common" and dst_module != src_module:
                    continue
                curMode = MODULE_WEB_TO_DWF_WEB[dst_module]
                for sub_module in SUB_MODULE_WEB: # forms, operations
                    if not os.path.isdir("%s/%s/%s/%s/%s" % (rootpath, each_part, PART_WEB, src_module, sub_module)):
                        continue
                    addin_modules = {}
                    with open(assemble_to_path, "rb") as f:
                        yaml_file = yaml.safe_load(f)
                    if sub_module in yaml_file["config"]["info"][PART_WEB]:
                        addin_modules = yaml_file["config"]["info"][PART_WEB][sub_module]
                    pathSrc = "%s/%s/%s/%s/%s" % (rootpath, each_part, PART_WEB, src_module, sub_module)
                    dst_config_file = "%s/%s/%s/%s/%s" % (DWF_PATH, curMode, DWF_WEB_SOURCE_PATH, sub_module[:-1], DWF_WEB_CONFIG_FILE)
                    tool.mergeWebConfig(pathSrc, dst_config_file, addin_modules, pureScanConfig)
                    success = True
                tool.mergeWebPackage(assemble_to_path, "%s/%s/package.json" % (DWF_PATH, curMode), dev)

    if not success:
        if part is not None:
            if module is not None:
                print("ERROR：assemble_config.js或package.json更新失败，可能是part：%s或module：%s输入错误" % (part, module))
            else:
                print("ERROR：assemble_config.js或package.json更新失败，可能是part：%s输入错误" % part)
        else:
            print("ERROR：assemble_config.js或package.json更新失败，请检查assemble-to.yaml是否配置正确")
    else:
        print("assemble_config.js和package.json更新成功")

# 本地装配前端public目录
# 被调用：devPublicAssemble
def devPublicAssemble(target):
    if not os.path.isdir("%s/%s" % (target, PART_WEB)): # part01下没有part-web
        return
    for mode in ["common-web"] + DWF_WEB:
        relModule = "common"
        if mode in DWF_WEB:
            relModule = DWF_WEB_TO_MODULE_WEB[mode]
        for module in MODULE_WEB: # app, modeler
            if mode in DWF_WEB and module != relModule:
                continue
            curMode = MODULE_WEB_TO_DWF_WEB[module]

            resPathSrc = "%s/%s/%s/public/static" % (target, PART_WEB, relModule)
            resPathDst = "%s/%s/public/static" % (DWF_PATH, curMode)
            if not os.path.isdir(resPathSrc):
                continue
            try:
                os.makedirs(resPathDst)
            except:
                pass
            print("moveDir - %s >> %s" % (resPathSrc, resPathDst))
            tool.moveDir(resPathSrc, resPathDst)

# 拷贝插件文件，前端写入assemble_config.js
# mode取值为common-web/modeler-web/app-web/dwf-modeler/dwf-app/dwf-common
# 被调用：scanPART、mvAll
def mvModule(target, mode, module_info=None, dev=False, toTmp=False):
    part_web_path = PART_WEB_PATH
    part_back_path = PART_BACK_PATH
    if dev:
        part_web_path = DWF_PATH
        part_back_path = DWF_PATH

    # 前端
    if mode in DWF_WEB or mode == "common-web":
        curPart = target.split('/')[-1]
        relModule = "common"
        if mode in DWF_WEB:
            relModule = DWF_WEB_TO_MODULE_WEB[mode]
        for module in MODULE_WEB: # app, modeler
            if mode in DWF_WEB and module != relModule:
                continue
            curMode = MODULE_WEB_TO_DWF_WEB[module]
            success = {"False":[], "True":[]}
            for sub_module in SUB_MODULE_WEB: # operations, forms

                pathSrc = "%s/%s/%s/%s" % (target, PART_WEB, relModule, sub_module)
                pathTmp = "%s/%s/%s/%s" % (PART_TMP_PATH, PART_WEB, module, sub_module[:-1])
                pathDst = "%s/%s/%s/%s/%s" % (part_web_path, curMode, DWF_WEB_SOURCE_PATH, sub_module[:-1], curPart)

                if not dev and toTmp: # pathSrc > pathTmp 移到app, modeler, 不再保留common
                    print("web pathSrc to pathTmp")
                    if not os.path.isdir(pathSrc):
                        success["False"].append(sub_module)
                        continue
                    try:
                        os.makedirs("%s/%s" % (pathTmp, curPart))
                    except:
                        pass
                    print("moveDir - %s >> %s/%s" % (pathSrc, pathTmp, curPart))
                    tool.moveDir(pathSrc, "%s/%s" % (pathTmp, curPart))
                    assemble_to_path = "%s/assemble-to.yaml" % pathTmp.rsplit('/', 1)[0] # 合并assemble-to
                    if not os.path.isfile(assemble_to_path): # tmp中不存在assemble-to则初始化
                        tool.initWebAssembleTo(assemble_to_path)
                    with open(assemble_to_path, "r", encoding="utf-8") as f:
                        yaml_to = yaml.safe_load(f)
                    yaml_to["config"]["info"][PART_WEB]["name"] = module
                    if sub_module in module_info: # assemble_config.json
                        for each_item in module_info[sub_module]: # 按每个part统计
                            if not curPart in yaml_to["config"]["info"][PART_WEB][sub_module]:
                                yaml_to["config"]["info"][PART_WEB][sub_module][curPart] = {}
                            yaml_to["config"]["info"][PART_WEB][sub_module][curPart][each_item] = module_info[sub_module][each_item]
                    if "dependencies" in module_info: # package.json
                        for eachdep in module_info["dependencies"]:
                            if not curPart in yaml_to["config"]["info"][PART_WEB]["dependencies"]:
                                yaml_to["config"]["info"][PART_WEB]["dependencies"][curPart] = {}
                            yaml_to["config"]["info"][PART_WEB]["dependencies"][curPart][eachdep] = module_info["dependencies"][eachdep]
                    with open(assemble_to_path, "w", encoding="utf-8") as f:
                        yaml.dump(yaml_to, f)

                    addin_modules = module_info[sub_module] if sub_module in module_info else {}
                    print("mergeWebConfig - %s >> %s/%s" % (pathSrc, pathTmp, DWF_WEB_CONFIG_FILE))
                    tool.mergeWebConfig(pathSrc, "%s/%s" % (pathTmp, DWF_WEB_CONFIG_FILE), addin_modules)

                elif dev and not toTmp: # pathSrc > pathDst
                    print("web pathSrc to pathDst")
                    if not os.path.isdir(pathSrc):
                        success["False"].append(sub_module)
                        continue
                    try:
                        os.makedirs(pathDst)
                    except:
                        pass
                    print("moveDir - %s >> %s" % (pathSrc, pathDst))
                    tool.moveDir(pathSrc, pathDst)

                elif not dev and not toTmp: # pathTmp > pathDst
                    print("web pathTmp to pathDst")
                    pathSrc = pathTmp
                    pathDst = pathDst.rsplit('/', 1)[0]
                    if not os.path.isdir(pathSrc):
                        success["False"].append(sub_module)
                        continue
                    try:
                        shutil.rmtree(pathDst)
                    except:
                        pass
                    try:
                        print("copytree - %s >> %s" % (pathSrc, pathDst))
                        shutil.copytree(pathSrc, pathDst)
                    except:
                        traceback.print_exc()
                    print("mergeWebPackage - %s/assemble-to.yaml >> %s/%s/package.json" % (pathSrc.rsplit('/', 1)[0], part_web_path, curMode))
                    tool.mergeWebPackage("%s/assemble-to.yaml" % pathSrc.rsplit('/', 1)[0], "%s/%s/package.json" % (part_web_path, curMode), dev)

                success["True"].append(sub_module)

            # .../public
            resPathSrc = "%s/%s/%s/public/static" % (target, PART_WEB, relModule)
            resPathTmp = "%s/%s/%s/public/static" % (PART_TMP_PATH, PART_WEB, module)
            resPathDst = "%s/%s/public/static" % (part_web_path, curMode)

            if success["False"].count == SUB_MODULE_WEB.count:
                if not os.path.isdir(resPathSrc):
                    print("ERROR：mvModule中止，%s前端代码路径错误" % module)
                    return False
                print("WARN：未检测到任何%s前端代码" % module)

            if not dev and toTmp: # pathSrc > pathTmp 移到app, modeler, 不再保留common
                if not os.path.isdir(resPathSrc):
                    continue
                try:
                    os.makedirs(resPathTmp)
                except:
                    pass
                print("moveDir - %s >> %s" % (resPathSrc, resPathTmp))
                tool.moveDir(resPathSrc, resPathTmp)
            # 本地装配public目录的移动单独提出来做
            # elif dev and not toTmp: # pathSrc > pathDst
            #     if not os.path.isdir(resPathSrc):
            #         continue
            #     try:
            #         os.makedirs(resPathDst)
            #     except:
            #         pass
            #     print("moveDir - %s >> %s" % (resPathSrc, resPathDst))
            #     tool.moveDir(resPathSrc, resPathDst)
            elif not dev and not toTmp: # pathTmp > pathDst
                resPathSrc = resPathTmp
                resPathDst = resPathDst
                try:
                    print("initWebPublic - %s %s" % (part_web_path, module))
                    tool.initWebPublic(part_web_path, module)
                    os.makedirs(resPathDst)
                except:
                    pass
                if not os.path.isdir(resPathSrc):
                    continue
                print("moveDir - %s >> %s" % (resPathSrc, resPathDst))
                tool.moveDir(resPathSrc, resPathDst)

    # 后端
    elif mode in DWF_SVC:
        module = DWF_SVC_TO_MODULE_SVC[mode]

        pathSrc = "%s/%s/%s/%s/%s" % (target, PART_SVC, module, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH) # deploy/dwf_sdk/parts/part01
        pathTmp = "%s/%s/%s/%s/%s" % (PART_TMP_PATH, PART_SVC, module, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH) # deploy/dwf_sdk/assemble/dwf-part-all
        pathDst = "%s/%s/%s/%s" % (part_back_path, mode, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH) # deploy/dwf_sdk/assemble/backend
        # .../src/main/java/edu/thss/platform
        pomPathSrc = "%s/pom.xml" % pathSrc[:len(pathSrc)-len("%s/%s" % (DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH))-1]
        pomPathTmp = "%s/pom.xml" % pathTmp[:len(pathTmp)-len("%s/%s" % (DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH))-1]
        pomPathDst = "%s/pom.xml" % pathDst[:len(pathDst)-len("%s/%s" % (DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH))-1]
        # .../src/main/resources
        resPathSrc = "%s/%s/%s/%s" % (target, PART_SVC, module, DWF_SVC_RESOURCE_PATH)
        resPathTmp = "%s/%s/%s/%s" % (PART_TMP_PATH, PART_SVC, module, DWF_SVC_RESOURCE_PATH)
        resPathDst = "%s/%s/%s" % (part_back_path, mode, DWF_SVC_RESOURCE_PATH)

        if not dev and toTmp: # pathSrc > pathTmp
            print("svc pathSrc to pathTmp")
            if not os.path.isdir(pathSrc):
                if not os.path.isdir(resPathSrc):
                    print("ERROR：mvModule中止，后端代码路径%s和资源文件路径%s错误" % (pathSrc, resPathSrc))
                    return False
                print("WARN：目录%s下未检测到任何后端代码" % pathSrc)
            if os.path.isdir(pathSrc):
                try:
                    os.makedirs(pathTmp)
                except:
                    pass
                tool.moveDir(pathSrc, pathTmp)
                if not os.path.isfile(pomPathTmp):
                    print("initSvcPom - %s" % pomPathTmp)
                    tool.initSvcPom(pomPathTmp)
                if not tool.mergeSvcPom(pomPathSrc, pomPathTmp):
                    print("ERROR：mvModule中止，%s依赖合并错误" % pomPathTmp)
                    return False
            if os.path.isdir(resPathSrc):
                try:
                    os.makedirs(resPathTmp)
                except:
                    pass
                print("moveDir - %s >> %s" % (resPathSrc, resPathTmp))
                tool.moveDir(resPathSrc, resPathTmp)

        elif dev or not toTmp: # pathTmp > pathDst
            print("svc pathTmp to pathDst")
            if not dev:
                pathSrc = pathTmp
                pomPathSrc = pomPathTmp
                resPathSrc = resPathTmp
            if not os.path.isdir(pathSrc):
                if not os.path.isdir(resPathSrc):
                    print("ERROR：mvModule中止，后端代码路径%s和资源文件路径%s错误" % (pathSrc, resPathSrc))
                    return False
                print("WARN：目录%s下未检测到任何后端代码" % pathSrc)
            if os.path.isdir(pathSrc):
                try:
                    shutil.rmtree(pathDst)
                except:
                    pass
                try:
                    print("copytree - %s >> %s" % (pathSrc, pathDst))
                    shutil.copytree(pathSrc, pathDst)
                except:
                    traceback.print_exc()
                if not tool.mergeSvcPom(pomPathSrc, pomPathDst, "cover"):
                    print("ERROR：mvModule中止，%s依赖合并错误" % pomPathDst)
                    return False
            try:
                print("initSvcResources - %s %s" % (part_back_path, module))
                tool.initSvcResources(part_back_path, module)
                os.makedirs(resPathDst)
            except:
                pass
            if os.path.isdir(resPathSrc):
                print("moveDir - %s >> %s" % (resPathSrc, resPathDst))
                tool.moveDir(resPathSrc, resPathDst)

    return True

# tmp to dst dwf-part-all/part-svc, part-web/assemble_config.json, package.json, part01/part-web
# 被调用：moveOnly、sdkAssemble
def mvAll(tmp_path):
    # 前端
    for module in MODULE_WEB:
        if not os.path.isdir("%s/%s/%s" % (tmp_path, PART_WEB, module)):
            continue
        assemble_to_path = "%s/%s/%s/assemble-to.yaml" % (tmp_path, PART_WEB, module)
        if not os.path.isfile(assemble_to_path):
            continue
        with open(assemble_to_path, "r", encoding="utf-8") as f:
            yaml_to = yaml.safe_load(f)
        if not mvModule(tmp_path, MODULE_WEB_TO_DWF_WEB[module], yaml_to["config"]["info"][PART_WEB]):
            print("ERROR: fail to move web-files from tmpdir to target dirs")
            return False
    # 后端
    if os.path.isdir("%s/%s" % (tmp_path, PART_SVC)):
        for module in MODULE_SVC:
            if os.path.isdir("%s/%s/%s" % (tmp_path, PART_SVC, module)) and not mvModule(tmp_path, MODULE_SVC_TO_DWF_SVC[module]):
                print("ERROR: fail to move svc-files from tmpdir to target dirs")
                return False
    return True

# 从sdk目录移动前后端文件
# 被调用：sdkAssemble
def mvSdk(sdkpath=SDK_PATH, sdkName="DWF3.0"):  # backend web - addins 注意：这里会替换assemble.py它自己
    if not os.path.isdir("%s/%s" % (sdkpath, sdkName)):
        return False

    # 前端 sdk/DWF3.0/xxx-web -> assemble/web/xxx-web
    # 未升级WEB-INF
    for web in DWF_WEB:
        path = "%s/%s" % (PART_WEB_PATH, web)
        shutil.rmtree(path)
        shutil.copytree("%s/%s/%s" % (sdkpath, sdkName, web), path)

    # 后端dwf-xxx-core.jar sdk/DWF3.0/dwf-common/lib -> backend/dwf-common/lib
    cmd.parse("cp -rf %s/%s/%s/*.jar %s/%s" % (sdkpath, sdkName, DWF_LIB_PATH, PART_BACK_PATH, DWF_LIB_PATH))
    # 只有sdk升级成功才覆盖backup/origin/lib
    # cmd.parse("cp -rf %s/%s/%s/*.jar %s/lib" % (sdkpath, sdkName, DWF_LIB_PATH, ORIGIN_BACKUP_PATH))

    # 后端 sdk/DWF3.0/dwf-xxx -> assemble/backend/dwf-xxx
    for svc in DWF_SVC:
        path = "%s/%s" % (PART_BACK_PATH, svc)
        if os.path.exists(path):
            shutil.rmtree(path)
        shutil.copytree("%s/%s/%s" % (sdkpath, sdkName, svc), path)

    # 后端application.properties
    # TODO: 需参考upgrade.sh进行兼容修改，不要覆盖application.properties
    # try:
    #     shutil.copy("%s/%s/scripts/application.properties" % (sdkpath, sdkName), "%s/application.properties" % deploy_path)
    # except:
    #     pass
    return True


########################################### 其它子功能
# 滤出选中且存在的模块
# 被调用：moveOnly
def getSelectedParts(partList):
    selected_parts = []
    for part in os.listdir(PART_N_PATH): # 每个part读取全部结构
        if not part in partList:
            continue
        assemble_part_path = "%s/%s/assemble-part.yaml" % (PART_N_PATH, part)
        if not os.path.isfile(assemble_part_path):
            continue
        with open(assemble_part_path, encoding="utf-8") as f:
            yaml_part = yaml.safe_load(f)
        for web_or_svc in yaml_part["CodePart"]: # 选中装配的模块
            if not web_or_svc in [PART_WEB, PART_SVC]:
                continue
            for module in yaml_part["CodePart"][web_or_svc]:
                if os.path.exists("%s/%s/%s/%s" % (PART_N_PATH, part, web_or_svc, module)):
                    selected_parts.append("%s/%s/%s" % (part, web_or_svc, module))

    return selected_parts

# 完全卸载时，从origin目录复制前后端文件到assemble，并更新assemble-all状态
# 装配中执行，不更新状态9；非装配中执行，更新状态9
# 被调用：moveOnly
def uninstallAll(inAssemble=True):
    # 前端 backup/origin/assemble_components -> assemble/web/xxx-web/.../assemble_components
    for web in DWF_WEB:
        path = "%s/%s/%s" % (PART_WEB_PATH, web, DWF_WEB_SOURCE_PATH)
        if os.path.exists(path):
            shutil.rmtree(path)
        shutil.copytree("%s/assemble_components" % ORIGIN_BACKUP_PATH, path)
        package_json = "%s/%s/package.json" % (PART_WEB_PATH, web)
        shutil.copy("%s/package-backup.json" % package_json.rsplit('/', 1)[0], package_json)

    # 后端 backup/origin/dwf-xxx -> assemble/backend/dwf-xxx
    for svc in DWF_SVC:
        path = "%s/%s" % (PART_BACK_PATH, svc)
        if os.path.exists(path):
            shutil.rmtree(path)
        shutil.copytree("%s/%s" % (ORIGIN_BACKUP_PATH, svc), path)

    if inAssemble: # 不更新status9
        tool.updateAssembleStatus(None, "uninstalling")
    else: # sdk-status变为0
        tool.updateAssembleStatus(None, "uninstalled")

# 将未编译的模块从backup/origin移动到dist/target目录，失败返回False
# 被调用：compileOnly、uninstallOnly
def mvBackupToCompilePath(log, mode):
    try:
        if mode in DWF_WEB:
            srcDir = "%s/%s" % (ORIGIN_BACKUP_PATH, mode)
            if not os.path.isdir(srcDir):
                log.warn("no such dir %s" % srcDir)
                return False
            dstDir = "%s/%s/dist" % (PART_WEB_PATH, mode)
            if os.path.isdir(dstDir):
                shutil.rmtree(dstDir)
            log.info("copy %s to %s" % (srcDir, dstDir))
            cmd.parse("cp -rf %s %s" % (srcDir, dstDir))
            return True
        if mode in DWF_SVC:
            if mode not in DWF_SVC_TO_JAR_PACKAGE:
                log.warn("cannot find jar for %s" % mode)
                return False
            srcFile = "%s/%s" % (ORIGIN_BACKUP_PATH, DWF_SVC_TO_JAR_PACKAGE[mode])
            if not os.path.isfile(srcFile):
                log.warn("no such file %s" % srcFile)
                return False
            dstDir = "%s/%s/target" % (PART_BACK_PATH, mode)
            dstFile = "%s/%s" % (dstDir, DWF_SVC_TO_JAR_PACKAGE[mode])
            if not os.path.isdir(dstDir):
                os.mkdir(dstDir)
            if os.path.isfile(dstFile):
                os.remove(dstFile)
            log.info("copy %s to %s" % (srcFile, dstFile))
            shutil.copy(srcFile, dstFile)
            return True
    except Exception as e:
        # log.error("exception in mvBackupToCompilePath: %s" % e)
        print("exception in mvBackupToCompilePath: %s" % e)
        return False

# 单独安装某一模块
# 被调用：uninstallOnly
def assembleEachMode(loggerUninstall, eachmode):
    loggerUninstall.info("assemble %s begin" % eachmode)
    timestart = time.time()
    if (eachmode in DWF_WEB and restartFrontend(loggerUninstall, eachmode, DWF_MODE_TO_PORT[eachmode])) or (eachmode in DWF_SVC and restartBackend(loggerUninstall, eachmode, DWF_MODE_TO_PORT[eachmode])):
        loggerUninstall.info("assemble %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
        return True
    else:
        loggerUninstall.error("ERROR: fail to assemble %s" % eachmode)
        return False

# 编译与重启合在一起
# 被调用：uninstallOnly、sdkAssemble
def compileAndAssemble(log, pluginStatus, typ=None):
    compiled = {}
    assembled = {}
    for each in DWF_WEB + DWF_SVC:
        compiled[each] = False
        assembled[each] = False
    assembleFailed = False

    for eachmode in DWF_WEB:
        if typ == "uninstallOnly" and mvBackupToCompilePath(log, eachmode):
            assembleResult = assembleEachMode(log, eachmode)
            assembled[eachmode] = assembleResult
            if not assembleResult:
                assembleFailed = True
        else:
            if typ == "uninstallOnly":
                log.warn("error in %s resuming, back to compile" % eachmode)
            log.info("compile %s begin" % eachmode)
            timestart = time.time()
            if npmBuild(log, "%s/%s" % (PART_WEB_PATH, eachmode)) == 1:
                compiled[eachmode] = True
                log.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                assembleResult = assembleEachMode(log, eachmode)
                assembled[eachmode] = assembleResult
                if not assembleResult:
                    assembleFailed = True
            else:
                compiled[eachmode] = False
                log.error("ERROR: fail to compile %s" % eachmode)
                assembleFailed = True
    for eachmode in DWF_SVC:  # common优先
        # 如果dwf-app和dwf-modeler的jar都移动成功，则不需要编译common
        if typ == "uninstallOnly" and eachmode == "dwf-common" and mvBackupToCompilePath(log, "dwf-app") and mvBackupToCompilePath(log, "dwf-modeler"):
            assembleResultA = assembleEachMode(log, "dwf-app")
            assembled["dwf-app"] = assembleResultA
            assembleResultM = assembleEachMode(log, "dwf-modeler")
            assembled["dwf-modeler"] = assembleResultM
            if not assembleResultA or not assembleResultM:
                assembleFailed = True
            break
        elif typ == "uninstallOnly" and mvBackupToCompilePath(log, eachmode):
            assembleResult = assembleEachMode(log, eachmode)
            assembled[eachmode] = assembleResult
            if not assembleResult:
                assembleFailed = True
        else:
            if typ == "uninstallOnly":
                log.warn("error in %s resuming, back to compile" % eachmode)
            log.info("compile %s begin" % eachmode)
            timestart = time.time()
            if mvnInstall(log, "%s/%s" % (PART_BACK_PATH, eachmode), "install" if eachmode == "dwf-common" else "package") == 1:
                compiled[eachmode] = True
                log.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                if eachmode != "dwf-common":
                    assembleResult = assembleEachMode(log, eachmode)
                    assembled[eachmode] = assembleResult
                    if not assembleResult:
                        assembleFailed = True
            else:
                compiled[eachmode] = False
                log.error("ERROR: fail to compile %s" % eachmode)
                assembleFailed = True
    assembled["dwf-common"] = assembled["dwf-app"] and assembled["dwf-modeler"]
    pluginStatus["compiled"] = compiled
    pluginStatus["assembled"] = assembled
    pluginStatus["assembleFailed"] = assembleFailed
    return pluginStatus

# typ = web, svc, model, svc-lib
# 被调用：zipParts、zipPart
def zipDir(target, dir, repStr, typ="common", ignores=None):
    for root, dirs, files in os.walk(dir): # 遍历每个文件夹中每个文件
        if ignores:
            flag = False
            for ignore in ignores:
                if root.find(ignore) > -1:
                    flag = True
                    break
            if flag:
                continue
        for eachfile in files:
            if eachfile.startswith('.'):
                continue
            if typ == "common" or typ == "web" or typ == "model" or typ == "svc-lib" or typ == "svc-res":
                target.write("%s/%s" % (root, eachfile), ("%s/%s" % (root, eachfile)).replace(dir, repStr))
            elif typ == "svc" and (eachfile == 'assemble-to.yaml' or eachfile == 'pom.xml' or eachfile.endswith('.java')):
                target.write("%s/%s" % (root, eachfile), ("%s/%s" % (root, eachfile)).replace(dir, repStr))


# 被调用：generateWithModel、zipParts
def zipPart(part, fileName, newPartName=None, dev=False): # xxx_part.zip
    if dev:
        part_path = LOCAL_PART_N_PATH
    else:
        part_path = PART_N_PATH
    if newPartName == None:
        newPartName = part["name"]
    try:
        with zipfile.ZipFile(fileName, "w", zipfile.ZIP_DEFLATED) as target:
            assemble_part_path = "%s/%s/assemble-part.yaml" % (part_path, part["name"])
            if not os.path.isfile(assemble_part_path):
                return False
            target.write(assemble_part_path, "%s/assemble-part.yaml" % newPartName) # part01/assemble-part.yaml
            if PART_WEB in part:
                print("打包part-web...")
                for module in LOCAL_MODULE_WEB: # app, common, modeler
                    if module in part[PART_WEB]:
                        print("打包part-web-%s..." % module)
                        zipDir(target, "%s/%s/%s/%s" % (part_path, part["name"], PART_WEB, module), "%s/%s/%s" % (newPartName, PART_WEB, module), "web")
            if PART_SVC in part:
                print("打包part-svc...")
                for module in MODULE_SVC: # app, common, modeler
                    if module in part[PART_SVC]:
                        path = "%s/%s/%s/%s/%s/%s" % (part_path, part["name"], PART_SVC, module, DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH)
                        if os.path.isdir(path):
                            print("打包part-svc-%s..." % module)
                            zipDir(target, "%s/%s/%s/%s" % (part_path, part["name"], PART_SVC, module), "%s/%s/%s" % (newPartName, PART_SVC, module), "svc", ["%s/%s/target" % (PART_SVC, module), "%s/%s/.settings" % (PART_SVC, module)])
                        resourcesPath = "%s/%s/%s/%s/%s" % (part_path, part["name"], PART_SVC, module, DWF_SVC_RESOURCE_PATH)
                        if os.path.isdir(resourcesPath):
                            print("打包part-svc-%s-resources..." % module)
                            zipDir(target, resourcesPath, "%s/%s/%s/%s" % (newPartName, PART_SVC, module, DWF_SVC_RESOURCE_PATH), "svc-res")
                svc_lib_path = "%s/%s/%s/lib" % (part_path, part["name"], PART_SVC)
                if os.path.isdir(svc_lib_path) and os.path.isfile("%s/mvn-install.sh" % svc_lib_path):
                    print("打包part-svc-lib...")
                    if tool.mvnShellCheck(svc_lib_path):
                        zipDir(target, svc_lib_path, "%s/%s/lib" % (newPartName, PART_SVC), "svc-lib")
                    else:
                        print("ERROR: %s/mvn-install.sh中存在非法字段" % svc_lib_path)
                        return False
            part_model_path = "%s/%s/part-model" % (part_path, part["name"])
            if os.path.isdir(part_model_path):
                print("打包part-model...")
                zipDir(target, part_model_path, "%s/part-model" % newPartName, "model")
    except:
        return False
    return True


########################################### 入口直接调用
# 本地生成插件包 - 每part（含part-model）一包
# 被调用：generate
def generateWithModel(fromPart=None, newPartName=None):
    zipPath = "%s/zipfiles" % LOCAL_PART_N_PATH
    if not os.path.exists(zipPath):
        os.mkdir(zipPath)

    dirs = os.listdir(LOCAL_PART_N_PATH)
    if fromPart is not None:
        if fromPart not in dirs:
            print("%s/%s不存在" % (LOCAL_PART_N_PATH, fromPart))
            return False
        if newPartName == None:
            if tool.is_number(fromPart):
                print("warn: 不支持纯数字命名的插件包，插件打包中止")
                # print("warn: 不支持纯数字命名的插件包，%s被自动转换为%sPureNumberNotSupport" % (fromPart, fromPart))
                # newPartName = "%sPureNumberNotSupport" % fromPart
                return False
            else:
                newPartName = fromPart
        elif newPartName == "zipfiles":
            print("warn: 不支持以zipfiles命名插件包，插件打包中止")
            return False

    skipped = 0
    for part_root in dirs: # each part
        if fromPart is not None and part_root != fromPart:
            skipped += 1
            continue
        scan_result = scanTO("%s/%s" % (LOCAL_PART_N_PATH, part_root), "all") # 扫描assemble-to，写入assemble-part
        assemble_part_path = "%s/%s/assemble-part.yaml" % (LOCAL_PART_N_PATH, part_root)
        if not os.path.isfile(assemble_part_path):
            skipped += 1
            continue

        yaml_file = yaml.safe_load(open(assemble_part_path, encoding="utf-8").read())
        if newPartName == None:
            modelName = part_root
        else:
            modelName = newPartName
            yaml_file["CodePart"]["part"]["name"] = newPartName
            with open(assemble_part_path, "w", encoding="utf-8") as f:
                yaml.dump(yaml_file, f)

        part = {}
        part["name"] = part_root
        for web_or_svc in [PART_WEB, PART_SVC]: # 屏蔽part，只要part-web和part-svc
            if web_or_svc in yaml_file["CodePart"]:
                module_list = []
                for module in yaml_file["CodePart"][web_or_svc]: # app, common, modeler / app, modeler
                    if "%s/%s/%s" % (part_root, web_or_svc, module) in scan_result and os.path.isdir("%s/%s/%s/%s" % (LOCAL_PART_N_PATH, part_root, web_or_svc, module)):
                        module_list.append(module) # scan到的目录不为空的module才添加
                part[web_or_svc] = list(module_list) # part[web_or_svc] = list(yaml_file["CodePart"][web_or_svc].keys())

        if not zipPart(part, "%s/%s_part.zip" % (zipPath, modelName), newPartName, True):
            print("ERROR: 打包失败")
            if os.path.isfile("%s/%s_part.zip" % (zipPath, modelName)):
                os.remove("%s/%s_part.zip" % (zipPath, modelName))
            return
        ymlresult = {
            "Header": {
                "CodePackageName": modelName
            },
            "Extention": {},
            "InitialScript": {},
            "CodePart": {modelName: modelName}
        }
        with open("%s/%s.yml" % (zipPath, modelName), "w", encoding="utf-8") as f:
            yaml.dump(ymlresult, f)
        with zipfile.ZipFile("%s/%s.zip" % (zipPath, modelName), "w", zipfile.ZIP_DEFLATED) as f:
            f.write("%s/%s_part.zip" % (zipPath, modelName), modelName + "_part.zip")
            f.write("%s/%s.yml" % (zipPath, modelName), modelName + ".yml")
        os.remove("%s/%s_part.zip" % (zipPath, modelName))
        os.remove("%s/%s.yml" % (zipPath, modelName))
        print("generate part package %s in %s" % (modelName, "%s/%s.zip" % (zipPath, modelName)))

    if skipped == len(dirs):
        print("ERROR: no part named '%s', check if assemble-to.yaml exists" % fromPart)

# 根据插件包列表信息生成插件zip
# partList: 插件包数组信息
# fileName: 生成的zip文件名
# zipInLocal: true=本地开发者环境，false=服务器环境
# 被调用：zip
def zipParts(partList, fileName, dev=False): # xxx_part.zip
    for part in partList: # each part
        zipPart(part, fileName, part["name"], dev)

# 装配，安装被移动模块的lib
# 被调用：relAssemble、sprAssemble、moveOnly
def moveOnly(partList, yaml_path="%s/assemble-log.yaml" % PART_N_PATH):
    loggerMove = Logger("assemble.py move", COMPILE_LOG_PATH).addHandler("%s/pluginCompile.log" % COMPILE_LOG_PATH) # move日志合并到compile日志中
    loggerMove.info("moveOnly start")
    if len(partList) == 0:
        loggerMove.error("ERROR: empty part list")
        return False

    else: # 装配
        loggerMove.info("start move")
        loggerMove.info("config: %s" % " ".join(str(i) for i in partList))
        loggerMove.info("start preMove")
        # 获取当前part的所有模块
        selected_parts = getSelectedParts(partList)
        pluginStatus = {}
        selected = {}
        for each_selected in selected_parts:
            part_name, web_or_svc, module = each_selected.split('/')
            if part_name not in selected:
                selected[part_name] = {}
            if web_or_svc not in selected[part_name]:
                selected[part_name][web_or_svc] = {}
            selected[part_name][web_or_svc][module] = True
        pluginStatus["selected"] = selected
        if not tool.checkAssembleStatus(pluginStatus, "preMove"):
            loggerMove.error("ERROR: some parts/modules are moving")
            return False
        loggerMove.info("preMove end")

        try:
            loggerMove.info("uninstalling others")
            uninstallAll() # backup/origin的文件覆盖到assemble
            loggerMove.info("cleaning tmp folder")
            tool.clearTmpFolder()

            # 拷贝parts中需要装配的文件
            loggerMove.info("start scanPART")
            moved_parts = []
            timestart = time.time()
            # src to tmp
            for each_path in selected_parts:
                part_name, web_or_svc, module = each_path.split('/')
                if os.path.exists("%s/%s/%s/%s" % (PART_N_PATH, part_name, web_or_svc, module)):
                    dwf_module = module
                    if web_or_svc == PART_WEB:
                        if module == "common":
                            dwf_module = "common-web"
                        else:
                            dwf_module = MODULE_WEB_TO_DWF_WEB[module]
                    elif web_or_svc == PART_SVC:
                        dwf_module = MODULE_SVC_TO_DWF_SVC[module]
                    loggerMove.info("moving %s/%s/%s >>> %s" % (part_name, web_or_svc, module, dwf_module))
                    for each in scanPART("%s/%s" % (PART_N_PATH, part_name), dwf_module, False, True):
                        moved_parts.append(each)
                        loggerMove.info("successfully moved %s" % each)
            # tmp to dst
            if not mvAll(PART_TMP_PATH):
                loggerMove.error("ERROR: fail to move all files to target dirs")
                tool.updateAssembleStatus(pluginStatus, "moved", False)
                return False
            loggerMove.info("scanPART end in %d ms. Files have been moved to target dirs" % (1000 * (time.time() - timestart)))

            loggerMove.info("checking moved directory exists")
            moved = {}
            for each in moved_parts:
                part, web_or_svc, module = each.split('/')
                if not part in moved:
                    moved[part] = {}
                if not web_or_svc in moved[part]:
                    moved[part][web_or_svc] = {}
                if web_or_svc in PART_WEB:
                    relModule = [module]
                    if module == "common":
                        relModule = MODULE_WEB
                    for eachmodule in relModule:
                        success = False
                        for sub_module in SUB_MODULE_WEB:
                            if os.path.exists("%s/%s/%s/%s/%s" % (PART_WEB_PATH, MODULE_WEB_TO_DWF_WEB[eachmodule], DWF_WEB_SOURCE_PATH, sub_module[:-1], part)):
                                success = True
                                break
                        moved[part][web_or_svc][module] = success
                elif web_or_svc in PART_SVC:
                    success = False
                    for sub_module in SUB_MODULE_SVC: # controller, entity, service
                        if os.path.exists("%s/%s/%s/%s/%s" % (PART_BACK_PATH, MODULE_SVC_TO_DWF_SVC[module], DWF_SVC_JAVASOURCE_PATH, DWF_SVC_PACKAGE_PATH, sub_module)):
                            success = True
                            break
                    # resources
                    if not success and os.path.exists("%s/%s/%s" % (PART_BACK_PATH, MODULE_SVC_TO_DWF_SVC[module], DWF_SVC_RESOURCE_PATH)):
                        success = True
                    moved[part][web_or_svc][module] = success
            for part in moved:
                if not PART_SVC in moved[part]:
                    continue
                if not os.path.isfile("%s/%s/%s/lib/mvn-install.sh" % (PART_N_PATH, part, PART_SVC)):
                    continue
                loggerMove.info("installing jars in %s/part-svc/lib" % part)
                tool.mvnShellExec(loggerMove, "%s/%s/%s/lib" % (PART_N_PATH, part, PART_SVC))

            loggerMove.info("updating move status in assemble-all.yaml")
            pluginStatus["moved"] = moved
            tool.updateAssembleStatus(pluginStatus, "moved")
            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump(pluginStatus, f)
            if tool.checkAllSuccess(pluginStatus):
                loggerMove.info("move done")
                return True
            else:
                loggerMove.error("move failed")
                return False

        except:
            loggerMove.error("ERROR: exceptions in MoveOnly ", sys.exc_info())
            loggerMove.info("move failed")
            tool.updateAssembleStatus(pluginStatus, "moved", False)
            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump(pluginStatus, f)
            return False

# 编译
# 被调用：relAssemble、sprAssemble、compileOnly
def compileOnly(yaml_path="%s/assemble-log.yaml" % PART_N_PATH):
    loggerCompile = Logger("assemble.py compile", COMPILE_LOG_PATH).addHandler("%s/pluginCompile.log" % COMPILE_LOG_PATH)
    loggerCompile.info("compileOnly start")
    pluginStatus = yaml.safe_load(open(yaml_path, encoding="utf-8").read())
    moved = pluginStatus["moved"]

    if not tool.checkAssembleStatus(pluginStatus, "preCompile"):
        loggerCompile.error("ERROR: some parts/modules are compling")
        return False

    # 如果前端有移动，后端没移动，则只编译前端
    needToCompile = {}
    for each in DWF_WEB + DWF_SVC:
        needToCompile[each] = False
    someOneNeedToCompile = False
    for part in moved:
        for web_or_svc in moved[part]:
            if "common" in moved[part][web_or_svc]:
                for each in DWF_WEB if web_or_svc == PART_WEB else DWF_SVC:
                    needToCompile[each] = True
                someOneNeedToCompile = True
                continue
            else:
                for module in moved[part][web_or_svc]:
                    if web_or_svc == PART_WEB:
                        needToCompile[module + "-web"] = True
                    else: # 后端只要有需要更新的内容，
                        needToCompile["dwf-" + module] = True
                        needToCompile["dwf-common"] = True
                    someOneNeedToCompile = True
    if not someOneNeedToCompile:
        loggerCompile.error("ERROR: no one needs to compile")
        loggerCompile.info("compile failed")
        tool.updateAssembleStatus(pluginStatus, "compiled", False)
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(pluginStatus, f)
        return False

    compiled = {}
    for each in DWF_WEB + DWF_SVC:
        compiled[each] = False

    try:
        loggerCompile.info("start compile")
        for eachmode in DWF_WEB:
            if not needToCompile[eachmode]: # 不需要编译，把backup/origin直接放到dist假装编译好了
                loggerCompile.info("%s need not to compile" % eachmode)
                if not mvBackupToCompilePath(loggerCompile, eachmode):
                    loggerCompile.warn("error in %s resuming, back to compile" % eachmode)
                    needToCompile[eachmode] = True
            if needToCompile[eachmode]:
                loggerCompile.info("compile %s begin" % eachmode)
                timestart = time.time()
                if npmBuild(loggerCompile, "%s/%s" % (PART_WEB_PATH, eachmode)) == 1:
                    compiled[eachmode] = True
                    loggerCompile.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                else:
                    compiled[eachmode] = False
                    loggerCompile.error("ERROR: fail to compile %s" % eachmode)
        for eachmode in DWF_SVC: # common优先
            if not needToCompile[eachmode]: # 不需要编译，把backup/origin直接放到target假装编译好了
                loggerCompile.info("%s need not to compile" % eachmode)
                if eachmode == "dwf-common": # common不需要编译即app/modeler都不需要编译，common也不需要拷贝jar包，直接跳过
                    continue
                if not mvBackupToCompilePath(loggerCompile, eachmode):
                    loggerCompile.warn("error in %s resuming, back to compile" % eachmode)
                    needToCompile[eachmode] = True
            if needToCompile[eachmode]:
                loggerCompile.info("compile %s begin" % eachmode)
                timestart = time.time()
                # 打包jar并存放到target目录、安装到本地maven仓库
                if mvnInstall(loggerCompile, "%s/%s" % (PART_BACK_PATH, eachmode), "install" if eachmode == "dwf-common" else "package") == 1:
                    compiled[eachmode] = True
                    loggerCompile.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                else:
                    compiled[eachmode] = False
                    loggerCompile.error("ERROR: fail to compile %s" % eachmode)
                # if mvnInstall(loggerCompile, "%s/%s-ext" % (PART_BACK_PATH, eachmode), "install") == 1:
                #     loggerCompile.info("compile %s-ext end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                #     loggerCompile.info("compile %s begin" % eachmode)
                #     timestart = time.time()
                #     if eachmode == "dwf-common": # 只需install即可
                #         if mvnInstall(loggerCompile, "%s/%s" % (PART_BACK_PATH, eachmode), "install") == 1:
                #             compiled[eachmode] = True
                #             loggerCompile.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                #         else:
                #             compiled[eachmode] = False
                #             loggerCompile.error("ERROR: fail to compile %s" % eachmode)
                #     else: # 打包jar并存放到target目录
                #         if mvnInstall(loggerCompile, "%s/%s" % (PART_BACK_PATH, eachmode), "package") == 1:
                #             compiled[eachmode] = True
                #             loggerCompile.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                #         else:
                #             compiled[eachmode] = False
                #             loggerCompile.error("ERROR: fail to compile %s" % eachmode)
                # else:
                #     compiled[eachmode] = False
                #     loggerCompile.error("ERROR: fail to compile %s-ext" % eachmode)
        loggerCompile.info("updating compile status in assemble-all.yaml")
        pluginStatus["compiled"] = compiled
        tool.updateAssembleStatus(pluginStatus, "compiled")
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(pluginStatus, f)
        if tool.checkAllSuccess(pluginStatus):
            loggerCompile.info("compile done")
            return True
        else:
            loggerCompile.error("compile failed")
            return False

    except:
        loggerCompile.error("ERROR: exceptions in compileOnly ", sys.exc_info())
        loggerCompile.info("compile failed")
        tool.updateAssembleStatus(pluginStatus, "compiled", False)
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(pluginStatus, f)
        return False

# 安装重启
# 被调用：relAssemble、assembleOnly
def assembleOnly(yaml_path="%s/assemble-log.yaml" % PART_N_PATH):
    loggerAssemble = Logger("assemble.py assemble", COMPILE_LOG_PATH).addHandler("%s/pluginAssemble.log" % COMPILE_LOG_PATH)
    loggerAssemble.info("assembleOnly start")
    pluginStatus = yaml.safe_load(open(yaml_path, encoding="utf-8").read())
    compiled = pluginStatus["compiled"]

    if not tool.checkAssembleStatus(pluginStatus, "preAssemble"):
        loggerAssemble.error("ERROR: some parts/modules are assembling")
        return False

    assembled = {}
    for each in DWF_WEB + DWF_SVC:
        assembled[each] = False

    try:
        tool.backupJarWar(loggerAssemble)
        assembleFailed = False
        loggerAssemble.info("start assemble")
        for eachmode in DWF_WEB:
            if eachmode in compiled and compiled[eachmode]:
                loggerAssemble.info("assemble %s begin" % eachmode)
                timestart = time.time()
                if restartFrontend(loggerAssemble, eachmode, DWF_MODE_TO_PORT[eachmode]):
                    assembled[eachmode] = True
                    loggerAssemble.info("assemble %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                else:
                    assembled[eachmode] = False
                    loggerAssemble.error("ERROR: fail to assemble %s" % eachmode)
                    assembleFailed = True
        for eachmode in DWF_SVC: # common优先
            if eachmode in compiled and compiled[eachmode]:
                if eachmode == "dwf-common":
                    continue
                loggerAssemble.info("assemble %s begin" % eachmode)
                timestart = time.time()
                if restartBackend(loggerAssemble, eachmode, DWF_MODE_TO_PORT[eachmode]):
                    assembled[eachmode] = True
                    loggerAssemble.info("assemble %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
                else:
                    assembled[eachmode] = False
                    loggerAssemble.error("ERROR: fail to assemble %s" % eachmode)
                    assembleFailed = True
        # assembled["dwf-common"] = assembled["dwf-app"] and assembled["dwf-modeler"]
        loggerAssemble.info("updating assemble status in assemble-all.yaml")
        pluginStatus["assembled"] = assembled
        if assembleFailed: # 有失败则全部回退
            loggerAssemble.error("assemble failed, resuming all")
            tool.updateAssembleStatus(pluginStatus, "assembled", False)
            if restartAll(loggerAssemble):
                loggerAssemble.info("resume done")
            else:
                loggerAssemble.error("resume failed")
            backup_path = "%s/assemble-log-backup.yaml" % yaml_path.rsplit('/', 1)[0]
            with open(backup_path, "w", encoding="utf-8") as f:
                yaml.dump(pluginStatus, f)
            os.remove(yaml_path)
            return False
        else:
            tool.updateAssembleStatus(pluginStatus, "assembled")
            loggerAssemble.info("assemble done")
            os.remove(yaml_path)
            return True

    except:
        loggerAssemble.error("ERROR: exceptions in assembleOnly ", sys.exc_info())
        loggerAssemble.error("assemble failed, resuming all")
        tool.updateAssembleStatus(pluginStatus, "assembled", False)
        if restartAll(loggerAssemble):
            loggerAssemble.info("resume done")
        else:
            loggerAssemble.error("resume failed")
        backup_path = "%s/assemble-log-backup.yaml" % yaml_path.rsplit('/', 1)[0]
        with open(backup_path, "w", encoding="utf-8") as f:
            yaml.dump(pluginStatus, f)
        os.remove(yaml_path)
        return False

# 卸载
# 被调用：uninstallOnly
def uninstallOnly():
    loggerUninstall = Logger("assemble.py uninstall", COMPILE_LOG_PATH).addHandler("%s/pluginUninstall.log" % COMPILE_LOG_PATH)
    loggerUninstall.info("uninstallOnly start")
    if not tool.checkAssembleStatus(None, "preUninstall"):
        loggerUninstall.error("ERROR: some parts/modules are compling")
        return False

    pluginStatus = {}
    # compiled = {}
    # assembled = {}
    # for each in DWF_WEB + DWF_SVC:
    #     compiled[each] = False
    #     assembled[each] = False

    try:
        tool.backupJarWar(loggerUninstall)
        uninstallAll()
        # assembleFailed = False
        loggerUninstall.info("start uninstall")
        pluginStatus = compileAndAssemble(loggerUninstall, {}, "uninstallOnly")
        assembleFailed = pluginStatus["assembleFailed"]

        # for eachmode in DWF_WEB:
        #     if mvBackupToCompilePath(loggerUninstall, eachmode):
        #         assembleResult = assembleEachMode(loggerUninstall, eachmode)
        #         assembled[eachmode] = assembleResult
        #         if not assembleResult:
        #             assembleFailed = True
        #     else:
        #         loggerUninstall.warn("error in %s resuming, back to compile" % eachmode)
        #         loggerUninstall.info("compile %s begin" % eachmode)
        #         timestart = time.time()
        #         if npmBuild(loggerUninstall, "%s/%s" % (PART_WEB_PATH, eachmode)) == 1:
        #             compiled[eachmode] = True
        #             loggerUninstall.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
        #             assembleResult = assembleEachMode(loggerUninstall, eachmode)
        #             assembled[eachmode] = assembleResult
        #             if not assembleResult:
        #                 assembleFailed = True
        #         else:
        #             compiled[eachmode] = False
        #             loggerUninstall.error("ERROR: fail to compile %s" % eachmode)
        #             assembleFailed = True
        # for eachmode in DWF_SVC: # common优先
        #     # 如果dwf-app和dwf-modeler的jar都移动成功，则不需要编译common
        #     if eachmode == "dwf-common" and mvBackupToCompilePath(loggerUninstall, "dwf-app") and mvBackupToCompilePath(loggerUninstall, "dwf-modeler"):
        #         assembleResultA = assembleEachMode(loggerUninstall, "dwf-app")
        #         assembled["dwf-app"] = assembleResultA
        #         assembleResultM = assembleEachMode(loggerUninstall, "dwf-modeler")
        #         assembled["dwf-modeler"] = assembleResultM
        #         if not assembleResultA or not assembleResultM:
        #             assembleFailed = True
        #         break
        #     elif mvBackupToCompilePath(loggerUninstall, eachmode):
        #         assembleResult = assembleEachMode(loggerUninstall, eachmode)
        #         assembled[eachmode] = assembleResult
        #         if not assembleResult:
        #             assembleFailed = True
        #     else:
        #         loggerUninstall.warn("error in %s resuming, back to compile" % eachmode)
        #         loggerUninstall.info("compile %s begin" % eachmode)
        #         timestart = time.time()
        #         if mvnInstall(loggerUninstall, "%s/%s" % (PART_BACK_PATH, eachmode), "install" if eachmode == "dwf-common" else "package") == 1:
        #             compiled[eachmode] = True
        #             loggerUninstall.info("compile %s end in %d ms" % (eachmode, 1000 * (time.time() - timestart)))
        #             if eachmode != "dwf-common":
        #                 assembleResult = assembleEachMode(loggerUninstall, eachmode)
        #                 assembled[eachmode] = assembleResult
        #                 if not assembleResult:
        #                     assembleFailed = True
        #         else:
        #             compiled[eachmode] = False
        #             loggerUninstall.error("ERROR: fail to compile %s" % eachmode)
        #             assembleFailed = True
        # assembled["dwf-common"] = assembled["dwf-app"] and assembled["dwf-modeler"]
        # pluginStatus["compiled"] = compiled
        # pluginStatus["assembled"] = assembled

        loggerUninstall.info("updating status in assemble-all.yaml")
        if assembleFailed: # 有失败则全部回退
            loggerUninstall.info("uninstall failed, resuming all")
            tool.updateAssembleStatus(pluginStatus, "uninstalled", False)
            if restartAll(loggerUninstall):
                loggerUninstall.info("resume done")
            else:
                loggerUninstall.info("resume failed")
            loggerUninstall.info("uninstall end")
            return False
        else:
            tool.updateAssembleStatus(pluginStatus, "uninstalled")
            loggerUninstall.info("uninstall done")
            return True

    except:
        loggerUninstall.error("ERROR: exceptions in uninstallOnly ", sys.exc_info())
        loggerUninstall.info("uninstall failed, resuming all")
        tool.updateAssembleStatus(pluginStatus, "uninstalled", False)
        if restartAll(loggerUninstall):
            loggerUninstall.info("resume done")
        else:
            loggerUninstall.info("resume failed")
        loggerUninstall.info("uninstall end")
        return False

# sdk升级
# 被调用：sdkAssemble
def sdkAssemble(loggerSdk, sdkName="DWF3.0"):
    loggerSdk.info("sdkAssemble start")
    if not os.path.isdir(LATEST_SDK_PATH): # 没有_latestSdk目录时不允许sdk升级
        loggerSdk.error("ERROR: no sdk package uploaded")
        return False
    if not tool.checkAssembleStatus(None, "preSdkAssemble"):
        loggerSdk.error("ERROR: some parts/modules are assembling")
        return False

    propBackup = False
    try:
        tool.backupJarWar(loggerSdk)
        loggerSdk.info("current version %s, sdk version %s" % (version, tool.getCurVersion("%s/sdk/%s/scripts" % (LATEST_SDK_PATH, sdkName))))
        tool.dwfJarInstall(loggerSdk, "%s/sdk/%s/dwf-common/lib" % (LATEST_SDK_PATH, sdkName))

        # 从sdk移动文件到assemble
        loggerSdk.info("mvSdk:%s start" % sdkName)
        if not mvSdk("%s/sdk" % LATEST_SDK_PATH, sdkName):
            loggerSdk.error("ERROR: %s/sdk/%s not a directory" % (LATEST_SDK_PATH, sdkName))
            tool.updateAssembleStatus(None, "sdkAssembled", False)
            tool.dwfJarInstall(loggerSdk, "%s/lib" % ORIGIN_BACKUP_PATH)
            return False
        # 从dwf-part-all-backup移动文件到assemble
        if os.path.isdir("%s-backup" % PART_TMP_PATH):
            loggerSdk.info("movePrevParts start: %s-backup >> assemble" % PART_TMP_PATH)
            timestart = time.time()
            if not mvAll("%s-backup" % PART_TMP_PATH):
                loggerSdk.error("ERROR: fail to move all files to target dirs")
                tool.updateAssembleStatus(None, "sdkAssembled", False)
                tool.dwfJarInstall(loggerSdk, "%s/lib" % ORIGIN_BACKUP_PATH)
                return False
            loggerSdk.info("movePrevParts end in %d ms. Files have been moved to target dirs" % (1000 * (time.time() - timestart)))
        # 备份application.properties和config.js
        tool.backupPropConfig(loggerSdk)
        propBackup = True
        tool.updatePropConfig(loggerSdk, "%s/sdk/%s" % (LATEST_SDK_PATH, sdkName))
        # 编译重启
        pluginStatus = compileAndAssemble(loggerSdk, {}, "sdkAssemble")

        if pluginStatus["assembleFailed"]:  # 有失败则全部回退
            loggerSdk.info("sdkAssemble failed, resuming all")
            tool.updateAssembleStatus(None, "sdkAssembled", False)
            tool.dwfJarInstall(loggerSdk, "%s/lib" % ORIGIN_BACKUP_PATH)
            if propBackup:
                tool.resumePropConfig(loggerSdk)
            if restartAll(loggerSdk):
                loggerSdk.info("resume done")
            else:
                loggerSdk.info("resume failed")
            loggerSdk.info("sdkAssemble end")
            return False
        else:
            tool.updateAssembleStatus(None, "sdkAssembled")
            loggerSdk.info("sdkAssemble done")
            return True

    except:
        loggerSdk.error("ERROR: exceptions in sdkAssemble ", sys.exc_info())
        loggerSdk.info("sdkAssemble failed, resuming all")
        tool.updateAssembleStatus(None, "sdkAssembled", False)
        tool.dwfJarInstall(loggerSdk, "%s/lib" % ORIGIN_BACKUP_PATH)
        if propBackup:
            tool.resumePropConfig(loggerSdk)
        if restartAll(loggerSdk):
            loggerSdk.info("resume done")
        else:
            loggerSdk.info("resume failed")
        loggerSdk.info("sdkAssemble end")
        return False




if __name__ == '__main__':
    command = None
    if len(sys.argv) > 1:
        command = sys.argv[1]

    if command == "zip":
        tool.devCheck()
        fname = PART_N_PATH + "/zip.json"
        if len(sys.argv) > 2:
            fname = sys.argv[2]
        partList = json.loads(open(fname, encoding="utf-8").read())
        if "parts" in partList:
            partList = partList["parts"]
        fname = PART_N_PATH + "/part.zip"
        if len(sys.argv) > 3:
            fname = sys.argv[3]
        zipParts(partList, fname, False)
        print("zip end")

    elif command == "relAssemble":
        tool.devCheck()
        tool.clearLogs()
        print("relAssemble start")
        partList = []
        yaml_path = "%s/assemble-log.yaml" % PART_N_PATH
        if len(sys.argv) == 3:
            partList = sys.argv[2].split('/')
        if moveOnly(partList, yaml_path) and compileOnly(yaml_path) and assembleOnly(yaml_path):
            print("relAssemble success")
            tool.backupAssembledParts()
        else:
            print("relAssemble failed")

    elif command == "sprAssemble": # 后接assembleOnly
        tool.devCheck()
        tool.clearLogs()
        print("sprAssemble start")
        partList = []
        yaml_path = "%s/assemble-log.yaml" % PART_N_PATH
        if len(sys.argv) == 3:
            partList = sys.argv[2].split('/')
        if moveOnly(partList, yaml_path) and compileOnly(yaml_path):
            print("sprAssemble success")
        else:
            print("sprAssemble failed")

    elif command == "sdkAssemble":
        tool.devCheck()
        tool.clearLogs()
        print("sdkAssemble start")
        loggerSdk = Logger("assemble.py sdkAssemble", COMPILE_LOG_PATH).addHandler("%s/sdkAssemble.log" % COMPILE_LOG_PATH)
        sdkName = "DWF3.0"
        if sdkAssemble(loggerSdk, sdkName):
            tool.latestSdkToSdk(loggerSdk, sdkName)
            tool.backupAfterSdkAssembled(loggerSdk, sdkName)
            tool.updateVersion()
            tool.dbShellExec(loggerSdk, "%s/%s/scripts/db-backup" % (SDK_PATH, sdkName))
            loggerSdk.info("sdkAssemble done, current version: %s" % tool.getCurVersion())
            print("sdkAssemble success")
        else:
            tool.removeLatestSdk(loggerSdk)
            loggerSdk.info("sdkAssemble failed, current version: %s" % tool.getCurVersion())
            print("sdkAssemble failed")

    elif command == "moveOnly":
        tool.devCheck()
        tool.clearLogs()
        print("moveOnly start")
        partList = []
        yaml_path = "%s/assemble-log.yaml" % PART_N_PATH
        if len(sys.argv) == 3:
            partList = sys.argv[2].split('/')
        if len(sys.argv) > 3:
            partList = sys.argv[2].split('/')
            yaml_path = sys.argv[3]
        moveOnly(partList, yaml_path)
        print("moveOnly end")

    elif command == "compileOnly":
        tool.devCheck()
        tool.clearLogs(["pluginCompile.log"] + COMPILE_LOG_LIST + SDK_LOG_LIST)
        print("compileOnly start")
        yaml_path = "%s/assemble-log.yaml" % PART_N_PATH
        if len(sys.argv) > 2:
            yaml_path = sys.argv[2]
        compileOnly(yaml_path)
        print("compileOnly end")

    elif command == "assembleOnly":
        tool.devCheck()
        tool.clearLogs(["pluginAssemble.log"] + SDK_LOG_LIST)
        print("assembleOnly start")
        yaml_path = "%s/assemble-log.yaml" % PART_N_PATH
        if len(sys.argv) > 2:
            yaml_path = sys.argv[2]
        if assembleOnly(yaml_path):
            tool.backupAssembledParts()
            print("assembleOnly success")
        else:
            print("assembleOnly failed")

    elif command == "uninstallOnly":
        tool.devCheck()
        tool.clearLogs()
        print("uninstallOnly start")
        if uninstallOnly():
            tool.backupJarToOrigin()
            tool.resetDwfPartAll()
            print("uninstallOnly success")
        else:
            print("uninstallOnly failed")

    elif command == "updateAssemblePart":
        tool.devCheck()
        print("updateAssemblePart start")
        if len(sys.argv) == 6: # partN packageName cname note
            tool.updateAssemblePart(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        else:
            print("updateAssemblePart WRONG COMMAND")
        print("updateAssemblePart end")

    elif command == "initAssembleAll":
        tool.devCheck()
        print("initAssembleAll start")
        if len(sys.argv) == 3: # initType = total, part, sdk, update, None
            tool.initAssembleAll(sys.argv[2])
        elif len(sys.argv) > 3:
            if sys.argv[3] == "":
                tool.initAssembleAll(sys.argv[2])
            else:
                tool.initAssembleAll(sys.argv[2], sys.argv[3].split('/'))
        else:
            tool.initAssembleAll()
        print("initAssembleAll end")

    elif command == "removeAssembleAll":
        tool.devCheck()
        print("removeAssembleAll start")
        if len(sys.argv) > 2: # partN
            tool.removeAssembleAll(sys.argv[2])
        else:
            print("removeAssembleAll EMPTY")
        print("removeAssembleAll end")

    elif command == "resetLocks":
        tool.devCheck()
        print("resetLocks start")
        tool.resetLocks(logger)
        print("resetLocks end")

    elif command == "restartBackend":  # module
        tool.devCheck()
        if len(sys.argv) > 2:
            modes = [MODULE_SVC_TO_DWF_SVC[sys.argv[2]]]
        else:
            modes = DWF_SVC
        print("restartBackend start")
        for mode in modes:
            restartBackend(logger, mode, DWF_MODE_TO_PORT[mode])
        print("restartBackend end")

    elif command == "restartFrontend":  # module
        tool.devCheck()
        if len(sys.argv) > 2:
            modes = [MODULE_WEB_TO_DWF_WEB[sys.argv[2]]]
        else:
            modes = DWF_WEB
        print("restartFrontend start")
        for mode in modes:
            restartFrontend(logger, mode, DWF_MODE_TO_PORT[mode])
        print("restartFrontend end")

    # dev
    # sdk中查看版本
    elif command == "version":
        if version is not None:
            print("当前sdk版本为" + version)

    # 本地生成代码包
    elif command == "generate":
        if len(sys.argv) == 2:
            generateWithModel()
        elif len(sys.argv) == 3:
            generateWithModel(sys.argv[2])
        elif len(sys.argv) > 4 and sys.argv[3].lower() == "as": # [^A-Za-z0-9]+, [^\u4e00-\u9fa5^a-z^A-Z^0-9]+
            newPartName = re.sub(r'[^A-Za-z0-9]+', '', sys.argv[4])
            if len(newPartName) > 0 and not tool.is_number(newPartName):
                generateWithModel(sys.argv[2], newPartName)
            else:
                print("generateWithModel输入错误：包名称仅支持英文和数字(不支持纯数字包名)")
        else:
            print("generateWithModel输入错误：generate part01 as xxx")
        print("generateWithModel done")

    # 本地前端code/config/package装配
    elif command == "devAssemble":
        for dir in os.listdir(LOCAL_PART_N_PATH):
            scanTO("%s/%s" % (LOCAL_PART_N_PATH, dir), "all")
        for dir in os.listdir(LOCAL_PART_N_PATH):
            scanPART("%s/%s" % (LOCAL_PART_N_PATH, dir), "web", True) # 只移前端代码，写配置文件
        scanToConfig(LOCAL_PART_N_PATH)
        print("devAssemble done")

    # 本地前端code/config/package卸载
    elif command == "devClear":
        tool.clearFrontend(DWF_PATH)
        tool.initWebConfig(DWF_PATH)
        tool.initWebPackage(DWF_PATH)
        print("devClear done")

    # 本地前端public装配
    elif command == "devPublicAssemble":
        for dir in os.listdir(LOCAL_PART_N_PATH):
            devPublicAssemble("%s/%s" % (LOCAL_PART_N_PATH, dir))
        print("devPublicAssemble done")

    # 本地前端public卸载
    elif command == "devPublicClear":
        tool.initWebPublic(DWF_PATH)
        print("devPublicClear done")

    # 本地前端装配
    elif command == "assemble":
        for dir in os.listdir(LOCAL_PART_N_PATH):
            scanTO("%s/%s" % (LOCAL_PART_N_PATH, dir), "all")
        for dir in os.listdir(LOCAL_PART_N_PATH):
            scanPART("%s/%s" % (LOCAL_PART_N_PATH, dir), "web", True) # 只移前端代码，写配置文件
            devPublicAssemble("%s/%s" % (LOCAL_PART_N_PATH, dir))
        scanToConfig(LOCAL_PART_N_PATH)
        print("devTotalAssemble done")

    # 本地前端卸载
    elif command == "clear":
        tool.clearFrontend(DWF_PATH)
        tool.initWebConfig(DWF_PATH)
        tool.initWebPackage(DWF_PATH)
        tool.initWebPublic(DWF_PATH)
        print("devTotalClear done")

    # 只写assemble_config.js和package.json，不管前端文件
    elif command == "scanConfig": # part module
        if len(sys.argv) == 3:
            scanToConfig(LOCAL_PART_N_PATH, sys.argv[2], None, True)
        elif len(sys.argv) > 3:
            scanToConfig(LOCAL_PART_N_PATH, sys.argv[2], sys.argv[3], True)
        else:
            scanToConfig(LOCAL_PART_N_PATH, None, None, True)
        print("scanConfig done")

    # 只清理assemble_config.js，不管package.json和前端文件
    elif command == "clearConfig": # module submodule dev
        if len(sys.argv) == 3:
            tool.initWebConfig(DWF_PATH, sys.argv[2])
        elif len(sys.argv) > 3:
            tool.initWebConfig(DWF_PATH, sys.argv[2], sys.argv[3])
        else:
            tool.initWebConfig(DWF_PATH)
        print("clearConfig done")

    # 只清理package.json，不管assemble_config.js和前端文件
    elif command == "clearPackage": # module
        if len(sys.argv) > 2:
            tool.initWebPackage(DWF_PATH, sys.argv[2])
        else:
            tool.initWebPackage(DWF_PATH)
        print("clearPackage done")

    # 清理assemble_config.js和package.json，不管前端文件
    elif command == "resetFrontConfig": # module submodule deploy
        if len(sys.argv) == 3:
            tool.initWebConfig(PART_WEB_PATH, sys.argv[2])
            tool.initWebPackage(PART_WEB_PATH, sys.argv[2])
        elif len(sys.argv) > 3:
            tool.initWebConfig(PART_WEB_PATH, sys.argv[2], sys.argv[3])
            tool.initWebPackage(PART_WEB_PATH, sys.argv[2])
        else:
            tool.initWebConfig(PART_WEB_PATH)
            tool.initWebPackage(PART_WEB_PATH)
        print("resetFrontConfig done")

    else:
        print("\n[ERROR] WRONG COMMAND!")
        print("[INFO] EXAMPLE COMMANDS:")
        print("    --- version")
        print("    --- generate [partName] as [customName]")
        print("    --- scanConfig [partName] [moduleName]")
        print("    --- clearConfig [moduleName] [subModuleName]")
        print("    --- clearPackage [moduleName]")
        print("    --- devAssemble")
        print("    --- devClear")
        print("    --- devPublicAssemble")
        print("    --- devPublicClear")
        print("    --- assemble")
        print("    --- clear\n")
