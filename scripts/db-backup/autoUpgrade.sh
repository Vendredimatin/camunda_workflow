#!/bin/bash
DB_SCRIPT_HOME="$1"
VERSION="$2"
PG_HOME="$3"
PG_ADDR="$4"
PG_PORT="$5"
PG_PASSWORD="$6"
PG_USER="$7"
PG_DATABASE="$8"

# pg升级
export PGPASSWORD=$PG_PASSWORD
cd ${PG_HOME}
# 初始化，表plt_sys_dbversions不存在或为空时，默认执行update-3.0_to_3.1.sql
tableExists=`./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'plt_sys_dbversions'"`
tableExist=`echo $tableExists | awk -F' ' '{print $3}'`
if [ "$tableExist" == 0 ]; then
  ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -a -f $DB_SCRIPT_HOME/update-3.0_to_3.1.sql
  ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "update plt_sys_dbversions set plt_dwflatesttag='$VERSION' where plt_dwflatesttag is not null and plt_dwflatesttag<>'';"
else
  recordExists=`./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "select count(*) from plt_sys_dbversions"`
  recordExist=`echo $recordExists | awk -F' ' '{print $3}'`
  if [ "$recordExist" == 0 ]; then
    ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -a -f $DB_SCRIPT_HOME/update-3.0_to_3.1.sql
    ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "update plt_sys_dbversions set plt_dwflatesttag='$VERSION' where plt_dwflatesttag is not null and plt_dwflatesttag<>'';"
  fi
fi
# 常规升级内容
dbCurrVers=`./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "select min(plt_dblatestver) from plt_sys_dbversions where plt_dblatestver is not null and plt_dblatestver<>''"`
dbCurrVer=`echo $dbCurrVers | awk -F' ' '{print $3}'`
echo "数据库升级前，dwf数据库版本为${dbCurrVer}"
pgUpdated=1
dwfUpdated=0
while [ $pgUpdated -eq 1 ]
do
  for i in $(ls $DB_SCRIPT_HOME)
  do
    if [[ $i == update-${dbCurrVer}_to_* ]]; then
      ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -v ON_ERROR_STOP=ON -a -f $DB_SCRIPT_HOME/$i
      dbLatestVers=`./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "select min(plt_dblatestver) from plt_sys_dbversions where plt_dblatestver is not null and plt_dblatestver<>''"`
      dbLatestVer=`echo $dbLatestVers | awk -F' ' '{print $3}'`
      if [[ $dbCurrVer == $dbLatestVer ]]; then # 失败
        echo "ERROR：数据库升级时 $DB_SCRIPT_HOME/$i 文件执行失败，请手动升级"
        pgUpdated=0
      else # 成功
        echo "数据库升级中，执行sql文件 $DB_SCRIPT_HOME/$i 完毕..."
        ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "update plt_sys_dbversions set plt_dwflatesttag='$VERSION' where plt_dwflatesttag is not null and plt_dwflatesttag<>'';"
        dbCurrVer=`echo $dbLatestVers | awk -F' ' '{print $3}'`
        pgUpdated=1
        dwfUpdated=1
        fi
    else # 没有对应的sql文件/已更新到最新版
      pgUpdated=0
    fi
  done
done
echo "数据库升级完毕，当前dwf数据库版本为${dbCurrVer}"
if [ $dwfUpdated -eq 0 ]; then
  ./psql -h $PG_ADDR -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "update plt_sys_dbversions set plt_dwflatesttag='$VERSION' where plt_dwflatesttag is not null and plt_dwflatesttag<>'';"
fi


