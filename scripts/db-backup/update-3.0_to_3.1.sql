-- 0410更新
ALTER TABLE if exists plt_mdl_attraccessrule
  ALTER COLUMN plt_lastmodifytime TYPE timestamp without time zone,
  ALTER COLUMN plt_lastmodifytime SET DEFAULT statement_timestamp();

ALTER TABLE if exists plt_mdl_file
  ALTER COLUMN plt_lastmodifytime TYPE timestamp without time zone,
  ALTER COLUMN plt_lastmodifytime SET DEFAULT statement_timestamp();

ALTER TABLE if exists plt_mdl_library
  ALTER COLUMN plt_lastmodifytime TYPE timestamp without time zone,
  ALTER COLUMN plt_lastmodifytime SET DEFAULT statement_timestamp();

alter table if exists plt_mdl_metaclass alter column plt_primarykey type varchar(32);
alter table if exists plt_fpt_queryoprconfig alter column plt_conditionexpre type text;

-- 0423更新
ALTER TABLE if exists plt_mdl_metaattribute ALTER COLUMN plt_defaultvalue TYPE text;
ALTER TABLE if exists plt_mdl_r_class2attribute ALTER COLUMN plt_defaultvalue TYPE text;
ALTER TABLE if exists plt_mdl_r_class2attribute ALTER COLUMN plt_displayname TYPE varchar;
ALTER TABLE if exists plt_mdl_metaclass ALTER COLUMN plt_primarykey TYPE varchar;

update plt_mdl_metaattribute set plt_valuelength=15 where plt_valuetype='Double';
update plt_mdl_metaattribute set plt_valuelength=9 where plt_valuetype='Integer';
update plt_mdl_metaattribute set plt_valuelength=32 where plt_valuetype='UUID';
update plt_mdl_metaattribute set plt_valuelength=0 where plt_valuetype='Json' or plt_valuetype='Boolean';
update plt_mdl_metaattribute set plt_valuelength=6 where plt_valuetype='TimeStamp' or plt_valuetype='Date' or plt_valuetype='Time';
update plt_mdl_metaattribute set plt_valuelength=18 where plt_valuetype='Long';
update plt_mdl_metaattribute set plt_valuelength=1024 where plt_valuetype='Timeseries' or plt_valuetype='LocalFile';


-- 0513更新 数据字典
CREATE TABLE IF NOT EXISTS plt_mdl_datadict (
plt_oid character varying(32) PRIMARY KEY NOT NULL,
plt_type character varying(50),
plt_desc character varying(200),
plt_label character varying(50),
plt_key character varying(50),
plt_order integer);


-- 0518更新
-- 用户组显示名初始化
DO $$
    BEGIN
        BEGIN
            alter table if exists plt_org_group add column plt_displayname varchar(100);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_displayname already exists in plt_org_group';
        END;
        BEGIN
            alter table if exists plt_org_group add column plt_order integer;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_order already exists in plt_org_group';
        END;
    END;
$$;
UPDATE plt_org_group SET plt_displayname = plt_name;

-- 数据库版本管理
CREATE TABLE IF NOT EXISTS plt_sys_dbversions (
plt_oid character varying(32) PRIMARY KEY NOT NULL,
-- 更新记录的创建时间，是升级脚本执行完毕后执行的，表示升级脚本在设计的时候创建的时间
plt_createtime timestamp without time zone DEFAULT statement_timestamp(),
-- 更新记录的更新时间，是在现场执行升级脚本的时候当时的时间
plt_updatetime timestamp without time zone DEFAULT statement_timestamp(),
-- 执行这个数据库升级最初，当前数据库脚本的不定，对应DWF前端版本tag，例如：升级的数据库脚本2.8到3.0是从2020年4月20日开始的，那么此时在此属性上记录20200420的记录，表示从此以后必须执行该脚本
plt_dwfstarttag character varying(100),
-- 数据库版本，2.1,2.2...当前最大的是3.1，表示曾经执行的哪个数据库升级脚本
plt_dbscriptver character varying(100),
-- 数据库的最近版本，2.1,2.2...，当前最大的是3.1，每次更新脚本的时候更新此版本号，每一个官方的升级脚本最后都会执行此逻辑，更新整个表里的全部记录。
plt_dblatestver character varying(100),
-- 当前系统DWF的前端版本，每次执行update.sh脚本的时候更新到最新，更新整个表里的全部记录
plt_dwflatesttag character varying(100),
-- 脚本内容，以后方便查看，可以不要
plt_script text);

-- sys_dbversions_update函数
CREATE OR REPLACE FUNCTION sys_dbversions_update(
    createTime timestamp,
    dwfStartTag varchar,
    dbScriptName varchar,
    dbPreviousVer varchar,
    dbLatestVer varchar,
    dwfLatestTag varchar,
    script varchar)
  RETURNS void AS
$BODY$
	DECLARE oid VARCHAR;
BEGIN

	IF (select count(*) from plt_sys_dbversions) = 0 THEN
		INSERT INTO plt_sys_dbversions (plt_oid, plt_createtime, plt_dwfstarttag, plt_dbscriptver, plt_dblatestver, plt_dwflatesttag, plt_script) VALUES (upper(replace(cast(uuid_generate_v4() as VARCHAR), '-', '')), $1, $2, $3, $5, $6, $7);
	ELSE
		INSERT INTO plt_sys_dbversions (plt_oid, plt_createtime, plt_dwfstarttag, plt_dbscriptver, plt_script) VALUES (upper(replace(cast(uuid_generate_v4() as VARCHAR), '-', '')), $1, $2, $3, $7);
		IF (select count(*) from plt_sys_dbversions where (plt_dblatestver = $4 or plt_dblatestver = $5)) > 0 THEN
			UPDATE plt_sys_dbversions set plt_dblatestver=$5, plt_dwflatesttag=$6;
		END IF;
	END IF;

END;
$BODY$
LANGUAGE plpgsql VOLATILE;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20200517-0068a8441'::varchar, 'update-3.0_to_3.1.sql'::varchar, '3.0'::varchar, '3.1'::varchar, '20200517-0068a8441'::varchar, ''::varchar);
