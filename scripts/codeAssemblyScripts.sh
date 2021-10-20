# 代码装配
# 后端安装脚本
cd ../dwf-common/lib
mvn install:install-file -Dfile=ojdbc8-12.2.0.1.jar -DgroupId=com.oracle -DartifactId=ojdbc8 -Dversion=12.2.0.1 -Dpackaging=jar
mvn install:install-file -Dfile=sqljdbc4-4.0.jar -DgroupId=com.microsoft.sqlserver -DartifactId=sqljdbc4 -Dversion=4.0 -Dpackaging=jar
mvn install:install-file -Dfile=dwf-common-core-1.0.jar -DgroupId=edu.thss.platform -DartifactId=dwf-common-core -Dversion=1.0 -Dpackaging=jar
mvn install:install-file -Dfile=dwf-app-core-1.0.jar -DgroupId=edu.thss.platform -DartifactId=dwf-app-core -Dversion=1.0 -Dpackaging=jar
mvn install:install-file -Dfile=dwf-modeler-core-1.0.jar -DgroupId=edu.thss.platform -DartifactId=dwf-modeler-core -Dversion=1.0 -Dpackaging=jar
cd ../..
mvn install