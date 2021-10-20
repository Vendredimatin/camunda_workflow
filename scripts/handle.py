# coding: utf-8 -*-

__author__ = "chendaxixi"

import json
import sys
import subprocess
import os
import time
import traceback
import shutil
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom
import re
import uuid

deploy_path = "/opt/dwf3.0-deploy"
apache_path = "/opt/apache-tomcat"
dwfsdk_path = "%s/dwf_sdk" % deploy_path
monitor_path = "%s/assemble/web/monitor-web" % dwfsdk_path
home = "%s/assemble/addins" % dwfsdk_path
node_dir_path = "%s/single" % home
demo_path = "/home/chendaxixi/work/dwf_addins/iview-admin-dev/iview-admin-dev"


# 解析命令行字符串
def parseStr(line):
	res = []
	line = line.split(' ')
	for i in line:
		if i != '':
			res.append(i)
	return res

# 执行shell命令，返回命令行结果
def parse(cmd):
	result = []
	p = os.popen(cmd)
	res = p.read().split('\n')
	p.close()
	for i in res:
		if i != "":
			result.append(parseStr(i))
	return result

# 解压缩插件包
def checkZip(fileName):
    if not os.path.isdir(fileName.replace(".zip","")):
        p = subprocess.call("unzip -d %s %s" % (fileName.replace(".zip",""), fileName), shell=True, stdout=open("%s/1.out" % fileName[:fileName.rindex("/")],"w"))

# 从配置文件获取入口信息
def getEntries(fileName):
    checkZip(fileName)
    result = {"name": "", "note": "", "entries": []}
    entry_rule = "entries\s*=\s*(\[[^\]]*\])"
    name_rule = "name\s*=([^\n]*)\n"
    note_rule = "description\s*=([^\n]*)[\n$]"
    try:
        data = open(fileName.replace(".zip","") + "/config.js","r").read().strip()
        # 解析入口数据
        p = re.search(entry_rule, data)
        if p:
            result["entries"] = json.loads(p.groups()[0])
        # 解析插件名称
        p = re.search(name_rule, data)
        if p:
            name = p.groups()[0].strip()
            if name[0] == name[-1]:
                if name[0] == "'" or name[0] == '"':
                    name = name[1:-1]
            result["name"] = name
        # 解析插件描述
        p = re.search(note_rule, data)
        if p:
            note = p.groups()[0].strip()
            if note[0] == note[-1]:
                if note[0] == "'" or note[0] == '"':
                    note = note[1:-1]
            result["note"] = note
    except:
        pass
    return result

# 解析xml文件
def parseRoot(root):
    if len(root) == 0:
        return [(root.text,)]
    _dict = []
    for i in range(len(root)):
        _dict.append((root[i].tag, parseRoot(root[i])))
    return _dict

# 解析xml文件
def parse_xml(path):
    tree = ET.parse(path)
    root = tree.getroot()
    res = parseRoot(root)
    return res

# 解析xml文件
def dict_xml(root, node):
    if len(root) == 1 and len(root[0]) == 1:
        node.text = root[0][0]
        return
    for i in range(len(root)):
        item = ET.SubElement(node, root[i][0])
        dict_xml(root[i][1], item)

# 解析xml文件
def out_xml(root, path):
    node = ET.Element("project")
    dict_xml(root, node)
    rough_string = ET.tostring(node, "utf-8")
    r_content = minidom.parseString(rough_string)
    with open(path, "w") as f:
        r_content.writexml(f, addindent=" ", newl="\n", encoding="utf-8")

# 判重数组添加
def insert(_list, item):
    for k in _list:
        if str(k) == str(item):
            return
    _list.append(item)

# pom文件合并
def mergePom(root_list):
    dependencies = {}
    build = [[], []]
    repositories = []
    pluginRepositories = []
    data = {
        "dependencies": dependencies,
        "build": build,
        "repositories": repositories,
        "pluginRepositories": pluginRepositories
    }
    for root in root_list:
        for i in range(len(root)):
            uid = root[i][0].replace("{http://maven.apache.org/POM/4.0.0}","")
            if uid in data:
                if uid == "build":
                    for j in range(len(root[i][1])):
                        uid2 = root[i][1][j][0].replace("{http://maven.apache.org/POM/4.0.0}","")
                        if uid2 == "plugins":
                            for k in root[i][1][j][1]:
                                insert(data[uid][0], k)
                        elif uid2 == "resources":
                            for k in root[i][1][j][1]:
                                insert(data[uid][1], k)
                elif uid == "dependencies":
                    for j in range(len(root[i][1])):
                        gid = ""
                        aid = ""
                        ver = None
                        for item in root[i][1][j][1]:
                            uid3 = item[0].replace("{http://maven.apache.org/POM/4.0.0}","")
                            if uid3 == "groupId":
                                gid = item[1][0][0]
                            elif uid3 == "artifactId":
                                aid = item[1][0][0]
                            elif uid3 == "version":
                                ver = item[1][0][0]
                        if not aid in dependencies:
                            dependencies[aid] = {"gid": gid, "aid": aid, "ver": ver}
                        elif dependencies[aid]["ver"] is None:
                            dependencies[aid]["ver"] = ver
                        elif ver:
                            v1 = ver.split("-")[0].split(".")
                            v2 = dependencies[aid]["ver"].split("-")[0].split(".")
                            flag = True
                            if len(v1) != len(v2):
                                flag = False
                            else:
                                for k in range(len(v1)):
                                    if int(v1[k]) < int(v2[k]):
                                        flag = False
                                        break
                            if flag:
                                dependencies[aid]["ver"] = ver
                else:
                    for k in root[i][1]:
                        insert(data[uid], k)  
    return data

# 文件夹合并
def mergeDir(src, dst):
    if os.path.isfile(src) or os.path.isfile(dst):
        return
    d1 = os.listdir(src)
    d2 = os.listdir(dst)
    d1.sort()
    d2.sort()
    for path in d1:
        if path in d2:
            mergeDir(src + "/" + path, dst + "/" + path)
        else:
            p = parse("cp -rf %s/%s %s" % (src, path, dst))

# pom列表合并
def mergeList(merge_list, root, fileName):
    _list = []
    for path in merge_list:
        _root = parse_xml(path)
        _list.append(_root)
    data = mergePom(_list)
    _list = []
    for aid in data["dependencies"]:
        if data["dependencies"][aid]["ver"]:
            _list.append(("dependency", [
                    ("groupId", [(data["dependencies"][aid]["gid"],)]),
                    ("artifactId", [(aid,)]),
                    ("version", [(data["dependencies"][aid]["ver"],)])
                ]))
        else:
            _list.append(("dependency", [
                    ("groupId", [(data["dependencies"][aid]["gid"],)]),
                    ("artifactId", [(aid,)])
                ]))
    root.append(("dependencies", _list))
    _list1 = []
    _list2 = []
    for j in data["build"][0]:
        _list1.append(j)
    for j in data["build"][1]:
        _list2.append(j)
    root.append(("build", [
            ("plugins", _list1),
            ("resources", _list2)
        ]))
    for key in data:
        if key == "dependencies" or key == "build":
            continue
        _list = []
        for i in data[key]:
            _list.append(i)
        root.append((key, _list))
    out_xml(root, fileName)
    _data = open(fileName, "r").read()
    _data = _data.replace("ns0:","").replace('<project xmlns:ns0="http://maven.apache.org/POM/4.0.0">', '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">')
    open(fileName, 'w').write(_data)
    return data["dependencies"]

# 发布插件
def publish(fileName):
    data = json.loads(open(fileName,"r").read())
    modeler_pom = []
    modeler_libs = []
    app_pom = []
    app_libs = []
    # 清空原有的modeler,app
    if os.path.isdir("%s/dwf-modeler-ext" % home):
        shutil.rmtree("%s/dwf-modeler-ext" % home)
    p = parse("cp -rf %s/dwf-modeler-ext.bak %s/dwf-modeler-ext" % (home, home))
    if os.path.isdir("%s/dwf-app-ext" % home):
        shutil.rmtree("%s/dwf-app-ext" % home)
    p = parse("cp -rf %s/dwf-app-ext.bak %s/dwf-app-ext" % (home, home))
    for item in data:
        # 如果判断插件是否启用
        flag = True
        for i in item["entries"]:
            if i["status"] == "true":
                flag = False
                break
        if flag:
            continue
        # 合并modeler包
        try:
            uid = item["id"]
            _path = "%s/%s/backend/modeler" % (home, uid)
            mergeDir("%s/src" % _path, "%s/dwf-modeler-ext/src" % home)
            modeler_pom.append("%s/pom.xml" % _path)
            for path in os.listdir("%s/lib" % _path):
                modeler_libs.append("%s/lib/%s" % (_path,path))
        except:
            pass
        # 合并app包
        try:
            _path = "%s/%s/backend/app" % (home, uid)
            mergeDir("%s/src" % _path, "%s/dwf-app-ext/src" % home)
            app_pom.append("%s/pom.xml" % _path)
            for path in os.listdir("%s/lib" % _path):
                app_libs.append("%s/lib/%s" % (_path,path)) 
        except:
            pass
    # 合并modeler的pom.xml
    try:
        root = [
            ("modelVersion", [("4.0.0",)]),
            ("groupId", [("edu.thss.platform",)]),
            ("artifactId", [("dwf-modeler-ext",)]),
            ("version", [("1.0-SNAPSHOT",)]),
            ("parent", [
                ("groupId", [("org.springframework.boot",)]),
                ("artifactId", [("spring-boot-starter-parent",)]),
                ("version", [("2.0.0.RELEASE",)])
                ]),
        ]
        dep = mergeList(modeler_pom, root, "%s/dwf-modeler-ext/pom.xml" % home)
        for lib in modeler_libs:
            name = lib.split('/')[-1].replace('.jar','')
            if not name in dep:
                continue
            if dep[name]["ver"]:
                line = "mvn install:install-file -Dfile=%s -DgroupId=%s -DartifactId=%s -Dversion=%s -Dpackaging=jar" % (lib, dep[name]["gid"], dep[name]["aid"], dep[name]["ver"])
            else:
                line =  "mvn install:install-file -Dfile=%s -DgroupId=%s -DartifactId=%s -Dpackaging=jar" % (lib, dep[name]["gid"], dep[name]["aid"])
            p = parse(line)
        p = subprocess.Popen(["mvn","clean","package"], cwd="%s/dwf-modeler-ext" % home, stdout=open("%s/1.out" % home, "w"), stderr=open("%s/1.err" % home,"w"))
        p.wait()
        p = parse("mv %s/dwf-modeler-ext/target/dwf*.jar %s" % (home, deploy_path))
    except:
        pass
    # 合并app的pom.xml
    try:
        root = [
            ("modelVersion", [("4.0.0",)]),
            ("groupId", [("edu.thss.platform",)]),
            ("artifactId", [("dwf-app-ext",)]),
            ("version", [("1.0-SNAPSHOT",)]),
            ("parent", [
                ("groupId", [("org.springframework.boot",)]),
                ("artifactId", [("spring-boot-starter-parent",)]),
                ("version", [("2.0.0.RELEASE",)])
                ]),
        ]
        dep = mergeList(app_pom, root, "%s/dwf-app-ext/pom.xml" % home)
        for lib in app_libs:
            name = lib.split('/')[-1].replace('.jar','')
            if not name in dep:
                continue
            if dep[name]["ver"]:
                line = "mvn install:install-file -Dfile=%s -DgroupId=%s -DartifactId=%s -Dversion=%s -Dpackaging=jar" % (lib, dep[name]["gid"], dep[name]["aid"], dep[name]["ver"])
            else:
                line =  "mvn install:install-file -Dfile=%s -DgroupId=%s -DartifactId=%s -Dpackaging=jar" % (lib, dep[name]["gid"], dep[name]["aid"])
            p = parse(line)
        p = subprocess.Popen(["mvn","clean","package"], cwd="%s/dwf-app-ext" % home, stdout=open("%s/1.out" % home,"w"), stderr=open("%s/1.err" % home,"w"))
        p.wait()
        p = parse("mv %s/dwf-app-ext/target/dwf*.jar %s" % (home, deploy_path))
    except:
        pass
    # 拷贝启用的前端入口
    entries = []
    for item in data:
        for entry in item["entries"]:
            if entry["status"] == "true":
                entries.append(entry)
    c_monitor_path = "%s/src/views/ext_components" % monitor_path
    if os.path.isdir(c_monitor_path):
        shutil.rmtree(c_monitor_path)
    os.mkdir(c_monitor_path)
    for item in entries:
        shutil.copyfile("%s/%s/front/%s" % (home, item["addin"], item["path"]), "%s/%s.vue" % (c_monitor_path, item["name"]))
    # p = subprocess.Popen(["npm","run","build"], cwd=demo_path, stdout=open("%s/1.out" % home,"w"), stderr=open("%s/1.err" % home,"w"))
    # p.wait()
    return "success"

# 根据单Vue文件生成zip包
def generateByVue(filename):
    idx = filename.rfind("/")
    name = filename[idx+1:].replace(".vue","")
    path = filename[:idx] + "/" + name
    if os.path.isdir(path):
        shutil.rmtree(path)
    os.mkdir(path)
    os.mkdir("%s/front" % path)
    os.mkdir("%s/front/app" % path)
    p = parse("mv %s %s/front/app" % (filename, path))
    with open("%s/config.js" % path, "w") as f:
        f.write('entries = [{"name": "%s", "note": "", "path": "app/%s.vue", "module": "component"}]\nname="%s"\ndescription=""\n' % 
        (name, name, name))
    p = subprocess.Popen("zip -q -r %s.zip ." % (name), cwd="%s" % (path), shell=True, stdout=open("%s/1.out" % home,"w"), stderr=open("%s/1.err" % home,"w"))
    p.wait()
    return "%s/%s.zip" % (path, name)

def npmBuild(path):
    shutil.move(path, node_dir_path + "/src/components/HelloWorld.vue")
    os.chdir(node_dir_path)
    parse("npm run wc")
    # id = str(uuid.uuid1())
    id = path[path.rfind('/')+1:].replace(".vue", "")
    shutil.move(node_dir_path + "/dist/hello-world.min.js", apache_path + "/webapps/code/" + id + ".js")
    open(apache_path + "/webapps/code/" + id + ".html", "w").write('<meta charset=utf-8>\n<link rel="stylesheet" href="https://file.iviewui.com/run-dist/main.fb1686a7790e3da35eed.css">\n<script src="https://unpkg.com/vue"></script>\n<script src="./%s.js"></script>\n<hello-world></hello-world>' % id)
    return "http://localhost:8280/code/%s.html" % id

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # lock = "%s/handle.lock" % home
        # if os.path.isfile(lock):
        #    print("locking")
        # else:
        # open(lock,"w").close()
        if sys.argv[1] == "entries":
            result = getEntries(sys.argv[2])
            rs = json.dumps(result)
            print(rs)
        elif sys.argv[1] == "publish":
            result = publish(sys.argv[2])
            print(result)
        elif sys.argv[1] == "generate":
            result = generateByVue(sys.argv[2])
            print(result)
        elif sys.argv[1] == "node":
            result = npmBuild(sys.argv[2])
            print(result)
        # os.remove(lock)