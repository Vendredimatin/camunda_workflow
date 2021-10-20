# coding: utf-8

import os
import re
import shutil
import time
import subprocess
from util import CmdParser, Logger, Assemble
from config import tomcat_path, tomcat_port, deploy_path, rule_tomcat_port, script_path, PART_BACK_PATH, PART_WEB_PATH, COMPILE_LOG_PATH, DWF_SVC, DWF_MODE_TO_PORT

timeout = 90
timesleep = 2
cmd = CmdParser()
tool = Assemble()

# 检查tomcat是否在指定端口运行
def checkTomcat(log, tomcatPath=tomcat_path, port=tomcat_port): # 3成功，0tomcat没启动 # 注意：这里并未验证当前port是tomcat，只验证了port端口是否运行（和tomcat进程是否运行）
	# if int(os.popen('stty size', 'r').read().split()[1]) > 111: # 终端宽度够，获取pid
	try: # 不知道为什么jar调用当前文件时无法执行stty size，在服务器直接执行当前文件却可以通过
		if cmd.parse("stty size")[0][1] > 111:
			# log.info("checking tomcat processId")
			pid4tomcat = set()
			for i in cmd.parse("ps -ef | grep tomcat | grep -v 'grep' | awk '{print $2,$8,$9}'"):
				cur_pid = int(i[0])
				if i[1].find("java") > -1 and i[2].find("tomcat") > -1 and i[2].find(tomcatPath.rsplit('-', 1)[0]) > -1: # and i[-1] == "start":
					pid4tomcat.add(cur_pid)
			if not len(pid4tomcat) > 0: # tomcat没启动
				log.warn("tomcat not running")
				return 0
	except:
		pass
	# 检查port是否运行
	# log.info("checking tomcat port")
	portRunning = False
	for i in cmd.parse("ss -tnlp | awk '{print $4}'"):
		if not i[0].find(":") > -1:
			continue
		cur_port = int(i[0].rsplit(':', 1)[1])
		if port == cur_port:
			portRunning = True
			break
	if not portRunning: # port端口没有运行
		log.warn("tomcat:%s not running" % port)
		return 0, set()
	log.info("tomcat checked!")
	return 3 # 成功

# 检查jar是否在指定端口运行
def checkJar(log, jar, port): # 3成功，2有jar但端口不对，1端口被占用且不是jar，0jar没启动
	# termWidth = int(os.popen('stty size', 'r').read().split()[1])
	# checkPath = checkMode = checkJarName = False
	# if termWidth > 148:
	# 	checkPath = True
	# if termWidth > 156:
	# 	checkMode = True
	# if termWidth > 173:
	# 	checkJarName = True

	pid4port = set() # 查port对应的进程号
	# log.info("checking %s port" % jar)
	for i in cmd.parse("ss -tnlp | awk '{print $4,$6}'"):
		if len(i) < 2 or len(i[0].split(':')) < 2:
			continue
		cur_port = int(i[0].rsplit(':', 1)[1])
		if port == cur_port and i[1].split(",")[0].find("java") > -1 and i[1].split(",")[1].find("pid") > -1:
			cur_pid = int(i[1].split(",")[1].split("=")[1])
			pid4port.add(cur_pid)
	# if not len(pid4port) > 0: # port端口没有进程 或 端口有进程但不是java
	# 	log.info("checkJar - port:%s not running or wrong port" % port)
	# 	return 2, set()

	pid4jar = set() # 查进程是否为jar
	# log.info("checking %s processId" % jar)
	for i in cmd.parse("jps"):
		cur_pid = int(i[0])
		if i[1] == jar:
			pid4jar.add(cur_pid)
	# for pid in pid4port: # 注意这里popen.read会受终端窗口宽度影响，如果过小，目前则不检查是否为当前jar的进程
	# 	for i in cmd.parse("ps aux | grep %s | grep -v 'grep' | awk '{print $2,$11,$14}'" % pid): # cmd.parse("ps -ef | grep %s | grep -v 'grep' | awk '{print $2,$8,$11}'" % pid)
	# 		if len(i) < 2:
	# 			continue
	# 		cur_pid = int(i[0])
	# 		if i[1] == "java":
	# 			if checkPath and i[2].find(deploy_path) == -1:
	# 				continue
	# 			if checkMode and i[2].find(jar.split("-1.0-SNAPSHOT")[0]) == -1:
	# 				continue
	# 			if checkJarName and i[2].find(jar) == -1:
	# 				continue
	# 			pid4jar.add(cur_pid)
	# if not len(pid4jar) > 0: # jar没启动
	# 	log.info("checkJar - jar:%s not running" % jar)
	# 	return 0, set()
	# log.info("checkJar - success! jar:%s running on port:%s" % (jar, port))
	# return 3, pid4jar # 成功

	if len(pid4jar) > 0:
		if len(pid4jar & pid4port) > 0: # 成功
			log.info("%s checked!" % jar)
			return 3, pid4jar & pid4port
		else: # 有jar但端口不对
			log.warn("%s wrong port:%s" % (jar, port))
			return 2, set()
	elif len(pid4port) > 0: # 端口被占用且不是jar
		log.warn("%s port:%s is occupied" % (jar, port))
		return 1, set()
	log.warn("%s not running" % jar)
	return 0, set() # jar没启动

# 后端删除target并编译，1成功，2被锁，0失败
def mvnInstall(log, path, command):
	mode = path.split('/')[-1]
	# 记录日志时将所有的-ext合并为无ext
	parentMode = mode
	if "-ext" in mode:
		parentMode = mode[:-4]
	loggerMvn = Logger("server.py mvn %s" % mode).addHandler("%s/mvn-%s.log" % (COMPILE_LOG_PATH, parentMode))
	log.info("mvnInstall start")
	loggerMvn.info("mvnInstall start")
	lock = "%s/lock/%s_%s.lock" % (script_path, mode[4:], command)
	if os.path.isfile(lock):
		log.error("mvnInstall locked")
		loggerMvn.error("mvnInstall locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	try:
		# 移除target文件夹
		if os.path.isdir("%s/target" % path):
			shutil.rmtree("%s/target" % path)
		# 开始编译
		log.info("%s mvn clean %s" % (mode, command))
		loggerMvn.info("%s mvn clean %s" % (mode, command))
		# p = subprocess.Popen("mvn clean %s" % command, shell=True, cwd=path, stdout=open("%s/mvn%s-%s.out" % (COMPILE_LOG_PATH, command, mode), "w"), stderr=open("%s/mvn%s-%s.err" % (COMPILE_LOG_PATH, command, mode), "w"))
		p = subprocess.Popen("mvn clean %s" % command, shell=True, cwd=path, stdout=subprocess.PIPE)
		for line in p.stdout:
			line = line.decode()
			if not subprocess.Popen.poll(p) is None: # p不在运行
				if len(line.strip()) == 0:
					break
			elif len(line.strip()) == 0:  # 不输出空白行 b''
				continue
			# 处理mvn输出
			each = str(line.strip())
			if "[ERROR]" in each:
				log.error(each)
				loggerMvn.error(each)
			elif "[WARNING]" in each:
				log.warn(each)
				loggerMvn.warn(each)
			else:
				log.info(each)
				loggerMvn.info(each)
		# if p.wait() == 1:
		# 	log.error("mvn clean %s failed" % command)
		# 	loggerMvn.error("mvn clean %s failed" % command)
		p.stdout.close()

		# 判断是否编译成功 p.wait() == 1则失败，0则成功
		if not os.path.isfile("%s/target/%s-1.0-SNAPSHOT.jar" % (path, path.split('/')[-1])):
			log.error("mvnInstall failed, %s/target/%s-1.0-SNAPSHOT.jar does not exist" % (path, path.split('/')[-1]))
			loggerMvn.error("mvnInstall failed, %s/target/%s-1.0-SNAPSHOT.jar does not exist" % (path, path.split('/')[-1]))
			os.remove(lock)
			return 0
	except Exception as e:
		os.remove(lock)
		log.error("mvnInstall failed with exception: %s" % e)
		loggerMvn.error("mvnInstall failed with exception: %s" % e)
		return 0
	os.remove(lock)
	log.info("mvnInstall done")
	loggerMvn.info("mvnInstall done")
	return 1

# 前端删除dist并编译，1成功，2被锁，0失败
def npmBuild(log, path):
	mode = path.split('/')[-1]
	loggerNpm = Logger("server.py npm %s" % mode).addHandler("%s/npm-%s.log" % (COMPILE_LOG_PATH, mode))
	log.info("npmBuild start")
	loggerNpm.info("npmBuild start")
	lock = "%s/lock/%s_build.lock" % (script_path, mode[:-4])
	if os.path.isfile(lock):
		log.error("npmBuild locked")
		loggerNpm.error("npmBuild locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	try:
		# 移除dist文件夹
		if os.path.isdir("%s/dist" % path):
			shutil.rmtree("%s/dist" % path)
		# 开始编译
		log.info("%s npm install" % mode)
		loggerNpm.info("%s npm install" % mode)
		# p = subprocess.Popen(["npm", "install"], cwd=path, stdout=open("%s/npminstall-%s.log" % (COMPILE_LOG_PATH, mode), "w"), stderr=open("%s/npminstall-%s.err" % (COMPILE_LOG_PATH, mode), "w"))
		p = subprocess.Popen(["npm", "install"], cwd=path, stdout=open("%s/npminstall-%s.out" % (COMPILE_LOG_PATH, mode), "w"), stderr=subprocess.PIPE)
		for line in p.stderr:
			line = line.decode()
			if not subprocess.Popen.poll(p) is None: # p不在运行
				if len(line.strip()) == 0:
					break
			elif len(line.strip()) == 0: # 不输出空白行 b''
				continue
			# 处理npm输出
			each = str(line.strip())
			if "npm ERR!" in each:
				log.error(each)
				loggerNpm.error(each)
			elif "npm WARN" in each:
				log.warn(each)
				loggerNpm.warn(each)
			else:
				log.info(each)
				loggerNpm.info(each)
		p.stderr.close()
		p.wait()

		log.info("%s npm run build" % mode)
		loggerNpm.info("%s npm run build" % mode)
		# p = subprocess.Popen(["npm", "run", "build"], cwd=path, stdout=open("%s/npmbuild-%s.log" % (COMPILE_LOG_PATH, mode), "w"), stderr=open("%s/npmbuild-%s.err" % (COMPILE_LOG_PATH, mode), "w"))
		p = subprocess.Popen(["npm", "run", "build"], cwd=path, stdout=open("%s/npmbuild-%s.out" % (COMPILE_LOG_PATH, mode), "w"), stderr=subprocess.PIPE)
		for line in p.stderr:
			line = line.decode()
			if not subprocess.Popen.poll(p) is None: # p不在运行
				if len(line.strip()) == 0:
					break
			elif len(line.strip()) == 0: # 不输出空白行 b''
				continue
			# 处理npm输出
			each = str(line.strip())
			if "npm ERR!" in each:
				log.error(each)
				loggerNpm.error(each)
			elif "npm WARN" in each or "Browserslist:" in each:
				log.warn(each)
				loggerNpm.warn(each)
			else:
				log.info(each)
				loggerNpm.info(each)
		p.stderr.close()
		p.wait()

		# 判断是否编译成功
		if not os.path.isdir("%s/dist" % path):
			log.error("npmBuild failed, %s/dist does not exist" % path)
			loggerNpm.error("npmBuild failed, %s/dist does not exist" % path)
			os.remove(lock)
			return 0
	except Exception as e:
		os.remove(lock)
		log.error("npmBuild failed with exception: %s" % e)
		loggerNpm.error("npmBuild failed with exception: %s" % e)
		return 0
	os.remove(lock)
	log.info("npmBuild done")
	loggerNpm.info("npmBuild done")
	return 1


# 移除webapps
def stopFrontend(log, mode, port, tomcatPath=tomcat_path): # 1成功，2被锁，0失败
	log.info("stopFrontend start")
	lock = "%s/lock/%sf_stop.lock" % (script_path, mode[:1])
	if os.path.isfile(lock):
		log.error("stopFrontend locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	if checkTomcat(log, tomcatPath, port) == 3: # 3成功，0tomcat没启动
		try:
			if os.path.isdir("%s/webapps/%s" % (tomcatPath, mode)):
				shutil.rmtree("%s/webapps/%s" % (tomcatPath, mode))
			if os.path.isdir("%s/webapps/%s" % (tomcatPath, mode)): # 文件夹删除失败
				os.remove(lock)
				log.error("stopFrontend failed to remove dir %s/webapps/%s" % (tomcatPath, mode))
				return 0
			log.info("stopFrontend done")
			return 1
		except Exception as e:
			os.remove(lock)
			log.error("stopFrontend failed with exception: %s" % e)
			return 0
	os.remove(lock)
	log.error("stopFrontend failed, tomcat:%s not running" % port)
	return 0

# 移动dist文件夹到webapps，检查tomcat是否在运行
def startFrontend(log, path, port, tomcatPath=tomcat_path): # 1成功，2被锁，0失败
	log.info("startFrontend start")
	mode = path.split('/')[-1]
	lock = "%s/lock/%sf_start.lock" % (script_path, mode[:1])
	if os.path.isfile(lock):
		log.error("startFrontend locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	flag = checkTomcat(log, tomcatPath, port) # 3成功，0tomcat没启动
	if flag == 0: # 重启tomcat
		try:
			log.info("tomcat:%s not running, restarting tomcat" % port)
			with open("%s/conf/server.xml" % tomcatPath, "r") as f:
				data = f.read()
			# data = open("%s/conf/server.xml" % tomcatPath, "r").read()
			data = re.sub(rule_tomcat_port, '<Connector port="%s" protocol="HTTP' % port, data)
			with open("%s/conf/server.xml" % tomcatPath, "w") as f:
				f.write(data)
			# open("%s/conf/server.xml" % tomcatPath, "w").write(data)
			cmd.parse("/bin/sh %s/bin/startup.sh" % tomcatPath)
		except Exception as e:
			os.remove(lock)
			log.error("startFrontend failed with exception: %s" % e)
			return 0
	try:
		if not os.path.isdir("%s/dist" % path):
			os.remove(lock)
			log.error("startFrontend failed, %s/dist not dir" % path)
			return 0
		# 复制WEB-INF到当前dist
		if not os.path.isdir("%s/dist/WEB-INF" % path):
			cmd.parse("mkdir %s/dist/WEB-INF" % path)
		cmd.parse("cp -rf %s/WEB-INF %s/dist" % (PART_WEB_PATH, path))
		# 复制WEB-INF到当前dist
		cmd.parse("cp -f %s/webapps/%s/config.js %s/dist/config.js" % (tomcatPath, mode, path))
		# 移除webapps
		if os.path.isdir("%s/webapps/%s" % (tomcatPath, mode)):
			# 备份config.js到外层文件夹
			# if os.path.isfile("%s/webapps/%s/config.js" % (tomcatPath, mode)):
			# 	parse("cp -f %s/webapps/%s/config.js %s/webapps/config.js.%s" % (tomcatPath, mode, tomcatPath, mode))
			shutil.rmtree("%s/webapps/%s" % (tomcatPath, mode))
		os.mkdir("%s/webapps/%s" % (tomcatPath, mode))
		# 把dist文件夹拷到webapps里面
		cmd.parse("cp -rf %s/dist/* %s/webapps/%s" % (path, tomcatPath, mode))
		# 恢复之前备份的config.js
		# if os.path.isfile("%s/webapps/config.js.%s" % (tomcatPath, mode)) and os.path.isdir("%s/webapps/%s" % (tomcatPath, mode)):
		# 	cmd.parse("cp -f %s/webapps/config.js.%s %s/webapps/%s/config.js" % (tomcatPath, mode, tomcatPath, mode))
		# 	os.remove("%s/webapps/config.js.%s" % (tomcatPath, mode))
		if not os.path.isdir("%s/webapps/%s" % (tomcatPath, mode)):
			os.remove(lock)
			log.error("startFrontend failed, %s/webapps/%s not dir" % (tomcatPath, mode))
			return 0
	except Exception as e:
		os.remove(lock)
		log.error("startFrontend failed with exception: %s" % e)
		return 0
	timestart = time.time()
	timewait = 0
	flag = 0
	while timewait < timeout:
		flag = checkTomcat(log, tomcatPath, port)
		if flag == 3:
			break
		time.sleep(timesleep)
		timewait = time.time() - timestart
	os.remove(lock)
	if flag != 3:
		log.error("startFrontend failed after folders moved, tomcat:%s not running" % port)
		return 0
	log.info("startFrontend done")
	return 1

# kill进程并检查是否仍在运行
def stopBackend(log, mode, port, jar, logPath): # 1成功，2被锁，0失败
	log.info("stopBackend start")
	lock = "%s/lock/%se_stop.lock" % (script_path, mode[:1])
	if os.path.isfile(lock):
		log.error("stopBackend locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	flag, pid = checkJar(log, jar, port) # 3成功，2有jar但端口不对，1端口被占用且不是jar，0jar没启动
	if flag == 3:
		try:
			log.info("killing %s" % jar)
			for _id in pid:
				cmd.parse("kill -9 %d" % _id)
			time.sleep(timesleep)
			flag, _ = checkJar(log, jar, port)
			if flag == 3:
				os.remove(lock)
				log.error("stopBackend failed to kill %s process" % jar)
				return 0
			if os.path.isfile(logPath):
				os.remove(logPath)
		except Exception as e:
			os.remove(lock)
			log.error("stopBackend failed with exception: %s" % e)
			return 0
	os.remove(lock)
	log.info("stopBackend done")
	return 1

# kill进程
def stopBackendPure(log, jar):
	log.info("killing %s" % jar)
	pids = []
	for i in cmd.parse("jps"):
		cur_pid = int(i[0])
		if i[1] == jar:
			pids.append(cur_pid)
	for _id in pids:
		cmd.parse("kill -9 %d" % _id)

# 启动jar并检查是否启动成功
def startBackend(log, mode, port, jar, jarLogPath): # 1成功，2被锁，0失败
	log.info("startBackend start")
	lock = "%s/lock/%se_start.lock" % (script_path, mode[4:5])
	jarPath = "%s/%s" % (deploy_path, jar)
	if os.path.isfile(lock):
		log.error("startBackend locked")
		return 2
	if not os.path.isdir("%s/lock" % script_path):
		os.makedirs("%s/lock" % script_path)
	open(lock, "w").close()
	flag, _ = checkJar(log, jar, port) # 3成功，2有jar但端口不对，1端口被占用且不是jar，0jar没启动
	if flag == 1:
		os.remove(lock)
		log.error("startBackend failed due to %s:%s is occupied" % (jar, port))
		return 0
	elif flag != 3: # 重启jar
		if not os.path.isfile(jarPath):
			os.remove(lock)
			log.error("startBackend failed, %s does not exist" % jarPath)
			return 0
		try:
			log.info("restarting %s" % jar)
			p = subprocess.Popen("java -Dlogging.file=%s -jar %s --server.port=%s --spring.config.location=%s/application.properties &" % (jarLogPath, jarPath, port, deploy_path), shell=True, cwd=deploy_path, stdout=open("%s/%s.log" % (COMPILE_LOG_PATH, mode), "a"), stderr=subprocess.STDOUT)
			p.wait()
		except Exception as e:
			os.remove(lock)
			log.error("startBackend failed with exception: %s" % e)
			return 0
	timestart = time.time()
	timewait = 0
	flag = 0
	while timewait < timeout:
		flag, _ = checkJar(log, jar, port) # 3成功，2有jar但端口不对，1端口被占用且不是jar，0jar没启动
		if flag == 3:
			break
		time.sleep(timesleep)
		timewait = time.time() - timestart
	os.remove(lock)
	if flag != 3:
		log.error("startBackend failed, cannot restart %s" % jar)
		return 0
	log.info("startBackend done")
	return 1

# kill进程、拷贝jar、启动jar
def restartBackend(log, mode, port):
	jarLogPath = "%s/%s.log" % (deploy_path, mode)
	timestart = time.time()
	if stopBackend(log, mode, port, "%s-1.0-SNAPSHOT.jar" % mode, jarLogPath) != 1: # kill
		log.error("fail to stop %s" % mode)
		return False
	log.info("stop %s in %d ms" % (mode, (1000 * (time.time() - timestart))))

	timestart = time.time()
	log.info("copy %s/%s/target/*.jar to %s" % (PART_BACK_PATH, mode, deploy_path))
	cmd.parse("cp %s/%s/target/*.jar %s" % (PART_BACK_PATH, mode, deploy_path)) # copy
	if startBackend(log, mode, port, "%s-1.0-SNAPSHOT.jar" % mode, jarLogPath) != 1: # start
		log.error("fail to start %s" % mode)
		return False
	log.info("start %s in %d ms" % (mode, (1000 * (time.time() - timestart))))
	return True

# 拷贝dist并检查tomcat是否在运行
def restartFrontend(log, mode, port=tomcat_port, tomcatPath=tomcat_path):
	path = "%s/%s" % (PART_WEB_PATH, mode)

	# timestart = time.time()
	# if stopFrontend(log, mode, port, tomcatPath) != 1: # 成功返回1，被锁返回2，失败返回0
	# 	return False
	# log.info("stop app-web in %d ms" % (1000 * (time.time()-timestart)), res)

	timestart = time.time()
	if startFrontend(log, path, port, tomcatPath) != 1: # 成功返回1，失败返回0
		log.error("fail to start %s" % mode)
		return False
	log.info("start %s in %d ms" % (mode, (1000 * (time.time() - timestart))))
	return True

# kill后端、恢复jar和war、重启后端并检查是否成功启动
def restartAll(log):
	try:
		for mode in DWF_SVC:
			if mode == "dwf-common":
				continue
			stopBackendPure(log, "%s-1.0-SNAPSHOT.jar" % mode)
		tool.resumeJarWar(log)
		allSuccess = True
		for mode in DWF_SVC:
			if mode == "dwf-common":
				continue
			jarLogPath = "%s/%s.log" % (deploy_path, mode)
			jar = "%s-1.0-SNAPSHOT.jar" % mode
			jarPath = "%s/%s" % (deploy_path, jar)
			port = DWF_MODE_TO_PORT[mode]
			log.info("restarting %s" % jar)
			# 如果stdout或stderr参数是pipe，且程序输出超过操作系统的pipe size时，使用Popen.wait()方式等待程序结束获取返回值，会导致死锁，程序卡在wait()调用上；linux 默认的pipe size是64KB
			# 不是上面这个问题，问题在于启动jar包后一直监听着jar日志输出，没有关闭，导致stdout死循环
			# 目前这里直接重定向到文件中，应该是非阻塞的
			p = subprocess.Popen("java -Dlogging.file=%s -jar %s --server.port=%s --spring.config.location=%s/application.properties &" % (jarLogPath, jarPath, port, deploy_path), shell=True, cwd=deploy_path, stdout=open("%s/%s.log" % (COMPILE_LOG_PATH, mode), "a"), stderr=subprocess.STDOUT)
			p.wait()

			timestart = time.time()
			timewait = 0
			flag = 0
			while timewait < timeout:
				flag, _ = checkJar(log, jar, port) # 3成功，2有jar但端口不对，1端口被占用且不是jar，0jar没启动
				if flag == 3:
					break
				time.sleep(timesleep)
				timewait = time.time() - timestart
			if flag != 3:
				log.error("restartAll failed, cannot restart %s" % jar)
				allSuccess = False
		return allSuccess
	except Exception as e:
		log.error("restartAll failed with exception: %s" % e) # sys.exc_info()
		return False







############################################# old version #############################################
#
# def jps_checkTomcat(tomcatPath=tomcat_path, port=tomcat_port): # 3成功，0tomcat没启动
# 	pid1 = set()
# 	for i in cmd.parse("ps -ef | grep tomcat"):
# 		if i[7] == "grep":
# 			continue # i[8] == '-Djava.util.logging.config.file=/opt/apache-tomcat'
# 		if i[7].find("java") > -1 and i[8].find(tomcatPath.rsplit('-', 1)[0]) > -1:# and i[-1] == "start":
# 			pid1.add(int(i[1]))
# 	if len(pid1) > 0:
# 		print("checkTomcat - success")
# 		return 3 # 成功
# 	print("checkTomcat - tomcat not running")
# 	return 0 # tomcat没启动
#
# def jps_checkJar(jar, port): # 3成功，2jar端口不对，1端口被占用，0jar没运行
# 	pid1 = set()
# 	for i in cmd.parse("jps"): # 查进程
# 		if i[1] == jar:
# 			pid1.add(int(i[0]))
# 	pid2 = set()
# 	for i in cmd.parse("lsof -i:%s" % port): # 查端口
# 		if i[1] == "PID":
# 			continue
# 		pid2.add(int(i[1]))
# 	if len(pid1) > 0:
# 		if len(pid1 & pid2) > 0:
# 			print("checkJar - success")
# 			return 3, pid1 & pid2 # 成功
# 		else:
# 			print("checkJar - wrong port")
# 			return 2, set() # 有jar但端口不对
# 	elif len(pid2) > 0:
# 		print("checkJar - port is occupied")
# 		return 1, set() # 端口被占用且不是jar
# 	print("checkJar - jar not running")
# 	return 0, set() # jar没启动
#
# def old_checkTomcat(tomcatPath=tomcat_path, port=tomcat_port): # 3成功，2tomcat端口不对，1端口被占用，0tomcat没启动
# 	pid1 = set()
# 	for i in cmd.parse("ps -ef | grep tomcat"):
# 		if i[7] == "grep":
# 			continue # i[8] == '-Djava.util.logging.config.file=/opt/apache-tomcat'
# 		if i[7].find("java") > -1 and i[8].find(tomcatPath.rsplit('-', 1)[0]) > -1:# and i[-1] == "start":
# 			pid1.add(int(i[1]))
# 	pid2 = set()
# 	for i in cmd.parse("lsof -i:%s" % port):
# 		if i[1] == "PID":
# 			continue
# 		pid2.add(int(i[1]))
# 	if len(pid1) > 0:
# 		if len(pid1 & pid2) > 0:
# 			print("checkTomcat - success")
# 			return 3 # 成功
# 		else:
# 			print("checkTomcat - wrong port")
# 			return 2 # 有tomcat但端口不对
# 	elif len(pid2) > 0:
# 		print("checkTomcat - port is occupied")
# 		return 1 # 端口被占用且不是tomcat
# 	print("checkTomcat - tomcat not running")
# 	return 0 # tomcat没启动
#
# def old_checkJar(path, port): # 3成功，2jar端口不对，1端口被占用，0jar没运行
# 	pid1 = set()
# 	for i in cmd.parse("ps -ef | grep %s" % path):
# 		if i[7] == "grep":
# 			continue
# 		if i[7].find("java") > -1:
# 			flag = False
# 			for j in i[8:]:
# 				if j.find(path) > -1:
# 					flag = True
# 					break
# 			if flag:
# 				pid1.add(int(i[1]))
# 	pid2 = set()
# 	for i in cmd.parse("lsof -i:%s" % port):
# 		if i[1] == "PID":
# 			continue
# 		pid2.add(int(i[1]))
# 	if len(pid1) > 0:
# 		if len(pid1 & pid2) > 0:
# 			print("checkJar - success")
# 			return 3, pid1 & pid2 # 成功
# 		else:
# 			print("checkJar - wrong port")
# 			return 2, set() # 有jar但端口不对
# 	elif len(pid2) > 0:
# 		print("checkJar - port is occupied")
# 		return 1, set() # 端口被占用且不是jar
# 	print("checkJar - jar not running")
# 	return 0, set() # jar没启动
#
# def checkPython(pythonPath="%s/assemble.py" % script_path): # True运行中，False没有运行
# 	# "ps -ef | grep /opt/dwf3.0-deploy/dwf_sdk/assemble/addins/assemble.py"
# 	pid = set()
# 	for i in cmd.parse("ps -ef | grep %s" % pythonPath):
# 		if i[7] == "grep":
# 			continue
# 		if i[7].find("python3") > -1 and i[8].find(pythonPath) > -1:# and i[-1] == "start":
# 			pid.add(int(i[1]))
# 	if len(pid) > 0:
# 		print("checkPython - running")
# 		return True # assemble.py在运行
# 	print("checkPython - not running")
# 	return False # assemble.py没有在运行
#
# def getPythonPid(pythonPath="%s/assemble.py" % script_path):
# 	pid = set()
# 	for i in cmd.parse("ps -ef | grep %s" % pythonPath):
# 		if i[7] == "grep":
# 			continue
# 		if i[7].find("python3") > -1 and i[8].find(pythonPath) > -1:# and i[-1] == "start":
# 			pid.add(int(i[1]))
# 	return pid
#
# def restartModelFront(tomcatPath, port, path):
# 	if not tomcatPath:
# 		tomcatPath = tomcat_path
# 	if not path:
# 		path = "%s/web/modeler-web" % deploy_path
# 	timestart = time.time()
# 	res = stopModelFront(tomcatPath, port) # 成功返回1，被锁返回2，失败返回0
# 	print("stop modeler-web in %d ms" % (1000 * (time.time()-timestart)), res)
# 	if res == 1:
# 		timestart = time.time() # /opt/TOMCAT, tomcat_port, /opt/DEPLOY/web/modeler-web
# 		res = startModelFront(tomcatPath, port, path) # 成功返回1，失败返回0，在modeler-web中npm run build，把dist文件夹拷到webapps里面
# 		print("start modeler-web in %d ms" % (1000 * (time.time()-timestart)), res)
# 	return res
#
# def restartAppFront(tomcatPath, port, path):
# 	if not tomcatPath:
# 		tomcatPath = tomcat_path
# 	if not path:
# 		path = "%s/web/app-web" % deploy_path
# 	timestart = time.time()
# 	res = stopAppFront(tomcatPath, port) # 成功返回1，被锁返回2，失败返回0
# 	print("stop app-web in %d ms" % (1000 * (time.time()-timestart)), res)
# 	if res == 1:
# 		timestart = time.time()
# 		res = startAppFront(tomcatPath, port, path) # 成功返回1，失败返回0
# 		print("start app-web in %d ms" % (1000 * (time.time()-timestart)), res)
# 	return res
#
# def startModelFront(tomcatPath, port, path):
# 	if not tomcatPath:
# 		tomcatPath = tomcat_path
# 	lock = "%s/lock/mf_start.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag = checkTomcat(tomcatPath, port) # 3是成功，2是有tomcat但端口不对，1是端口被占用且不是tomcat，0是tomcat没启动
# 	if flag == 1 or flag == 2:
# 		os.remove(lock)
# 		return 0
# 	elif flag == 0:
# 		try:
# 			data = open("%s/conf/server.xml" % tomcatPath, "r").read()
# 			data = re.sub(rule_tomcat_port, '<Connector port="%s" protocol="HTTP/1.1' % port, data)
# 			open("%s/conf/server.xml" % tomcatPath,"w").write(data)
# 			res = cmd.parse("/bin/sh %s/bin/startup.sh" % tomcatPath)
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	try:
# 		if not os.path.isdir("%s/webapps/modeler-web" % tomcatPath): # 在modeler-web中npm run build
# 			if not os.path.isdir(path):
# 				os.remove(lock)
# 				return 0
# 			p = subprocess.Popen(["npm","run","build"], cwd=path, stdout=open("%s/modeler-web.log" % deploy_path, "w"), stderr=open("%s/1.err" % path, "w"))
# 			p.wait()
# 			res = cmd.parse("mkdir %s/dist/WEB-INF" % path)
# 			res = cmd.parse("cp -rf %s/web/WEB-INF %s/dist" % (deploy_path, path))
# 			# if os.path.isdir("%s/webapps/modeler-web" % tomcatPath):
# 			# shutil.rmtree("%s/webapps/modeler-web" % tomcatPath)
# 			os.mkdir("%s/webapps/modeler-web" % tomcatPath)
# 			res = cmd.parse("cp -rf %s/dist/* %s/webapps/modeler-web" % (path, tomcatPath)) # 把dist文件夹拷到webapps里面
# 			if not os.path.isdir("%s/webapps/modeler-web" % tomcatPath):
# 				os.remove(lock)
# 				return 0
# 		else:
# 			return 0
# 	except:
# 		traceback.print_exc()
# 		os.remove(lock)
# 		return 0
# 	timestart = time.time()
# 	timewait = 0
# 	flag = 0
# 	while timewait < timeout:
# 		flag = checkTomcat(tomcatPath, port)
# 		if flag == 3:
# 			break
# 		time.sleep(timesleep)
# 		timewait = time.time() - timestart
# 	os.remove(lock)
# 	if flag != 3:
# 		return 0
# 	return 1
#
# def startAppFront(tomcatPath, port, path):
# 	lock = "%s/lock/af_start.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag = checkTomcat(tomcatPath, port) # 3是成功，2是有tomcat但端口不对，1是端口被占用且不是tomcat，0是tomcat没启动
# 	if flag == 1 or flag == 2:
# 		os.remove(lock)
# 		return 0
# 	elif flag == 0:
# 		try:
# 			data = open("%s/conf/server.xml" % tomcatPath, "r").read()
# 			data = re.sub(rule_tomcat_port, '<Connector port="%s" protocol="HTTP/1.1' % port, data)
# 			open("%s/conf/server.xml" % tomcatPath,"w").write(data)
# 			res = cmd.parse("/bin/sh %s/bin/startup.sh" % tomcatPath)
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	try:
# 		if not os.path.isdir("%s/webapps/app-web" % tomcatPath):
# 			if not os.path.isdir(path):
# 				os.remove(lock)
# 				return 0
# 			p = subprocess.Popen(["npm","run","build"], cwd=path, stdout=open("%s/app-web.log" % deploy_path, "w"), stderr=open("%s/1.err" % path, "w"))
# 			p.wait()
# 			res = cmd.parse("mkdir %s/dist/WEB-INF" % path)
# 			res = cmd.parse("cp -rf %s/web/WEB-INF %s/dist" % (deploy_path, path))
# 			# if os.path.isdir("%s/webapps/app-web" % tomcatPath):
# 			# 	shutil.rmtree("%s/webapps/app-web" % tomcatPath)
# 			os.mkdir("%s/webapps/app-web" % tomcatPath)
# 			res = cmd.parse("cp -rf %s/dist/* %s/webapps/app-web" % (path, tomcatPath))
# 			if not os.path.isdir("%s/webapps/app-web" % tomcatPath):
# 				os.remove(lock)
# 				return 0
# 		else:
# 			return 0
# 	except:
# 		traceback.print_exc()
# 		os.remove(lock)
# 		return 0
# 	timestart = time.time()
# 	timewait = 0
# 	flag = 0
# 	while timewait < timeout:
# 		flag = checkTomcat(tomcatPath, port)
# 		if flag == 3:
# 			break
# 		time.sleep(timesleep)
# 		timewait = time.time() - timestart
# 	os.remove(lock)
# 	if flag != 3:
# 		return 0
# 	return 1
#
# def restartModelEnd(port, logPath):
# 	logPath = "%s/dwf-modeler.log" % deploy_path
# 	timestart= time.time()
# 	res = stopModelEnd(port, "dwf-modeler-1.0-SNAPSHOT.jar", logPath)
# 	print("stop dwf-modeler in %d ms" % (1000 * (time.time() - timestart)), res)
# 	if not res == 1:
# 		return res
# 	timestart = time.time()
# 	res = mvnInstall("%s/backend/dwf-modeler" % deploy_path, "package")
# 	print("build dwf-modeler in %d ms" % (1000 * (time.time() - timestart)), res)
# 	if not res == 1:
# 		return res
# 	timestart = time.time()
# 	res = cmd.parse("cp -f %s/backend/dwf-modeler/target/*.jar %s" % (deploy_path, deploy_path))
# 	res = startModelEnd(port, "%s/dwf-modeler-1.0-SNAPSHOT.jar" % deploy_path, logPath)
# 	print("start dwf-modeler in %d ms" % (1000 * (time.time() - timestart)), res)
# 	return res
#
# def restartAppEnd(port, logPath):
# 	logPath = "%s/dwf-app.log" % deploy_path
# 	timestart = time.time()
# 	res = stopAppEnd(port, "dwf-app-1.0-SNAPSHOT.jar", logPath)
# 	print("stop dwf-app in %d ms" % (1000 * (time.time() - timestart)), res)
# 	if not res == 1:
# 		return res
# 	timestart = time.time()
# 	res = mvnInstall("%s/backend/dwf-app" % deploy_path, "package")
# 	print("build dwf-app in %d ms" % (1000 * (time.time() - timestart)), res)
# 	if not res == 1:
# 		return res
# 	timestart = time.time()
# 	res = cmd.parse("cp %s/backend/dwf-app/target/*.jar %s" % (deploy_path, deploy_path))
# 	res = startAppEnd(port, "%s/dwf-app-1.0-SNAPSHOT.jar" % deploy_path, logPath)
# 	print("start dwf-app in %d ms" % (1000 * (time.time() - timestart)), res)
# 	return res
#
# def startModelEnd(port, path, logPath):
# 	lock = "%s/lock/me_start.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag, _ = checkJar(path, port)
# 	if flag == 1:
# 		os.remove(lock)
# 		return 0
# 	elif flag != 3:
# 		if not os.path.isfile(path):
# 			os.remove(lock)
# 			traceback.print_exc()
# 			return 0
# 		try:
# 			p = subprocess.Popen("java -jar %s --server.port=%s -Dlogging.file=%s --spring.config.location=%s/application.properties &" % (path, port, logPath, deploy_path), shell=True, cwd=deploy_path, stdout=open("%s/1.out" % script_path, "w"), stderr=open("%s/1.err" % script_path, "w"))
# 			p.wait()
# 		except:
# 			os.remove(lock)
# 			traceback.print_exc()
# 			return 0
# 	timestart = time.time()
# 	timewait = 0
# 	flag = 0
# 	while timewait < timeout:
# 		flag, _ = checkJar(path, port)
# 		if flag == 3:
# 			break
# 		time.sleep(timesleep)
# 		timewait = time.time() - timestart
# 	os.remove(lock)
# 	if flag != 3:
# 		traceback.print_exc()
# 		return 0
# 	return 1
#
# def startAppEnd(port, path, logPath):
# 	lock = "%s/lock/ae_start.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag, _ = checkJar(path, port)
# 	if flag == 1:
# 		os.remove(lock)
# 		return 0
# 	elif flag != 3:
# 		if not os.path.isfile(path):
# 			os.remove(lock)
# 			return 0
# 		try:
# 			p = subprocess.Popen("java -jar %s --server.port=%s -Dlogging.file=%s --spring.config.location=%s/application.properties &" % (path, port, logPath, deploy_path), shell=True, cwd=deploy_path, stdout=open("%s/1.out" % script_path, "w"), stderr=open("%s/1.err" % script_path, "w"))
# 			p.wait()
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	timestart = time.time()
# 	timewait = 0
# 	flag = 0
# 	while timewait < timeout:
# 		flag, _ = checkJar(path, port)
# 		if flag == 3:
# 			break
# 		time.sleep(timesleep)
# 		timewait = time.time() - timestart
# 	os.remove(lock)
# 	if flag != 3:
# 		return 0
# 	return 1
#
# def stopModelFront(tomcatPath, port):
# 	if not tomcatPath:
# 		tomcatPath = tomcat_path
# 	lock = "%s/lock/mf_stop.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	if checkTomcat(tomcatPath, port) == 3: # 3成功，2端口不对，1端口被占用，0tomcat没启动
# 		try:
# 			if os.path.isdir("%s/webapps/modeler-web" % tomcatPath):
# 				shutil.rmtree("%s/webapps/modeler-web" % tomcatPath)
# 			if os.path.isdir("%s/webapps/modeler-web" % tomcatPath): # 文件夹删除失败
# 				os.remove(lock)
# 				return 0
# 			return 1
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	os.remove(lock)
# 	return 0
#
# def stopAppFront(tomcatPath, port):
# 	if not tomcatPath:
# 		tomcatPath = tomcat_path
# 	lock = "%s/lock/af_stop.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	if checkTomcat(tomcatPath, port) == 3:
# 		try:
# 			if os.path.isdir("%s/webapps/app-web" % tomcatPath):
# 				shutil.rmtree("%s/webapps/app-web" % tomcatPath)
# 			if os.path.isdir("%s/webapps/app-web" % tomcatPath):
# 				os.remove(lock)
# 				return 0
# 			return 1
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	os.remove(lock)
# 	return 0
#
# def stopModelEnd(port, jarPath, logPath):
# 	lock = "%s/lock/me_stop.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag, pid = checkJar(jarPath, port)
# 	if flag == 3:
# 		try:
# 			for _id in pid:
# 				res = cmd.parse("kill -9 %d" % _id)
# 			time.sleep(timesleep)
# 			flag, _ = checkJar(jarPath, port)
# 			if flag == 3:
# 				os.remove(lock)
# 				return 0
# 			if os.path.isfile(logPath):
# 				os.remove(logPath)
# 		except:
# 			os.remove(lock)
# 			traceback.print_exc()
# 			return 0
# 	os.remove(lock)
# 	return 1
#
# def stopAppEnd(port, jarPath, logPath):
# 	lock = "%s/lock/ae_stop.lock" % script_path
# 	if os.path.isfile(lock):
# 		return 2
# 	open(lock, "w").close()
# 	flag, pid = checkJar(jarPath, port)
# 	if flag == 3:
# 		try:
# 			for _id in pid:
# 				res = cmd.parse("kill -9 %d" % _id)
# 			flag, _ = checkJar(jarPath, port)
# 			if flag == 3:
# 				os.remove(lock)
# 				return 0
# 			os.remove(logPath)
# 		except:
# 			traceback.print_exc()
# 			os.remove(lock)
# 			return 0
# 	os.remove(lock)
# 	return 1
#
# if __name__ == "__main__":
# 	_port = 5
# 	try: # start modelfront tomcat-path port dwf-modeler-path
# 		if sys.argv[1] == "start":
# 			if sys.argv[2] == "modelfront":
# 				res = startModelFront(sys.argv[3], sys.argv[4], sys.argv[5])
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "appfront":
# 				res = startAppFront(sys.argv[3], sys.argv[4], sys.argv[5])
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "modelend":
# 				res = startModelEnd(sys.argv[3], sys.argv[4], sys.argv[5])
# 				# r2 = startModelEnd(9090, "/home/chendaxixi/work/addins/dwf-modeler-ext/dwf-modeler-ext-1.0-SNAPSHOT.jar", "dwf-modeler-ext.log")
# 				r2 = startModelEnd(int(sys.argv[3])+_port, sys.argv[4].replace("dwf-modeler", "dwf-modeler-ext"), sys.argv[5].replace("dwf-modeler", "dwf-modeler-ext"))
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "append":
# 				res = startAppEnd(sys.argv[3], sys.argv[4], sys.argv[5])
# 				# r2 = startAppEnd(9091, "/home/chendaxixi/work/addins/dwf-app-ext/dwf-app-ext-1.0-SNAPSHOT.jar", "dwf-app-ext.log")
# 				r2 = startAppEnd(int(sys.argv[3])+_port, sys.argv[4].replace("dwf-app", "dwf-app-ext"), sys.argv[5].replace("dwf-app", "dwf-app-ext"))
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 		elif sys.argv[1] == "stop":
# 			if sys.argv[2] == "modelfront":
# 				res = stopModelFront(sys.argv[3], sys.argv[4])
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "appfront":
# 				res = stopAppFront(sys.argv[3], sys.argv[4])
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "modelend":
# 				res = stopModelEnd(sys.argv[3], sys.argv[4], sys.argv[5])
# 				# r2 = stopModelEnd(9090, "/home/chendaxixi/work/addins/dwf-modeler-ext/dwf-modeler-ext-1.0-SNAPSHOT.jar", "dwf-modeler-ext.log")
# 				r2 = stopModelEnd(int(sys.argv[3])+_port, sys.argv[4].replace("dwf-modeler", "dwf-modeler-ext"), sys.argv[5].replace("dwf-modeler", "dwf-modeler-ext"))
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 			elif sys.argv[2] == "append":
# 				res = stopAppEnd(sys.argv[3], sys.argv[4], sys.argv[5])
# 				#r2 = stopAppEnd(9091, "/home/chendaxixi/work/addins/dwf-app-ext/dwf-app-ext-1.0-SNAPSHOT.jar", "dwf-app-ext.log")
# 				r2 = stopAppEnd(int(sys.argv[3])+_port, sys.argv[4].replace("dwf-app", "dwf-app-ext"), sys.argv[5].replace("dwf-app", "dwf-app-ext"))
# 				if res == 2:
# 					print("locking")
# 				elif res == 1:
# 					print("succ")
# 				else:
# 					print("fail")
# 		elif sys.argv[1] == "status":
# 			if (sys.argv[2] == "modelfront" and os.path.isfile("%s/lock/mf_start.lock" % script_path)) or (sys.argv[2] == "modelend" and os.path.isfile("%s/lock/me_start.lock" % script_path)) or (sys.argv[2] == "appfront" and os.path.isfile("%s/lock/af_start.lock" % script_path)) or (sys.argv[2] == "append" and os.path.isfile("%s/lock/ae_start.lock" % script_path)):
# 				print("starting")
# 			elif (sys.argv[2] == "modelfront" and os.path.isfile("%s/lock/mf_stop.lock" % script_path)) or (sys.argv[2] == "modelend" and os.path.isfile("%s/lock/me_stop.lock" % script_path)) or (sys.argv[2] == "appfront" and os.path.isfile("%s/lock/af_stop.lock" % script_path)) or (sys.argv[2] == "append" and os.path.isfile("%s/lock/ae_stop.lock" % script_path)):
# 				print("stopping")
# 			elif sys.argv[2][-5:] == "front":
# 				flag = checkTomcat(sys.argv[3], sys.argv[4])
# 				if flag != 3:
# 					print("stopped")
# 				elif sys.argv[2] == "modelfront":
# 					if os.path.isdir("%s/webapps/modeler-web" % sys.argv[3]):
# 						print("running")
# 					else:
# 						print("stopped")
# 				elif sys.argv[2] == "appfront":
# 					if os.path.isdir("%s/webapps/app-web" % sys.argv[3]):
# 						print('running')
# 					else:
# 						print("stopped")
# 			elif sys.argv[2][-3:] == "end":
# 				flag, _ = checkJar(sys.argv[4], sys.argv[3])
# 				if flag == 3:
# 					print("running")
# 				else:
# 					print("stopped")
# 	except:
# 		traceback.print_exc()
