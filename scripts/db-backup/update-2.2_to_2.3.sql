CREATE TABLE IF NOT EXISTS PLT_IDCACHE (PrimaryKey integer NOT NULL PRIMARY KEY,BuildtimeCode varchar(16),RuntimeCode varchar(32),SerialCode varchar(10),VersionNumber integer,UniCounting integer);
CREATE TABLE IF NOT EXISTS PLT_BT_WFPROCESS (Pk_WfProcess varchar(32) NOT NULL PRIMARY KEY,ProcessCode varchar(32),ProcessName varchar(512),ProcessType smallint,WorkflowType smallint,Description text,Keywords varchar(1024),Author varchar(512),AuthorId varchar(32),Lastupdate timestamp,Status smallint,Fk_Parent varchar(32),Fk_Owner varchar(32),BindEnClassName varchar(30),Proprietors text,ProcessContent text);
CREATE TABLE IF NOT EXISTS PLT_RL_WFPROCESS (Pk_WfProcess varchar(32) NOT NULL PRIMARY KEY,ProcessCode varchar(32),ProcessName varchar(512),ProcessType smallint,WorkflowType smallint,Description text,Keywords varchar(1024),Author varchar(512),AuthorId varchar(32),Lastupdate timestamp,Status smallint,Version varchar(512),Releaser varchar(512),ReleaserId varchar(32),ReleaseStatement text,ReleaseDate timestamp,Fk_Parent varchar(32),Fk_Owner varchar(32),BindEnClassName varchar(30),Proprietors text,ProcessContent text);
CREATE TABLE IF NOT EXISTS PLT_WFPROCESSINST (oid varchar(32) NOT NULL PRIMARY KEY,instContent text);
CREATE TABLE IF NOT EXISTS PLT_WFPROCESSHIST (oid varchar(32) NOT NULL PRIMARY KEY,instContent text);
DELETE FROM PLT_IDCACHE;
insert into plt_idcache (primarykey, buildtimecode, runtimecode, serialcode, unicounting, versionnumber) values (0,'00000000000004PQ','00000000000000000000000000000B4F','0000000185',25,0);

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20190930-xxxxxxxxx'::varchar, 'update-2.2_to_2.3.sql'::varchar, '2.2'::varchar, '2.3'::varchar, '20190930-xxxxxxxxx'::varchar, 'CREATE TABLE IF NOT EXISTS PLT_IDCACHE (PrimaryKey integer NOT NULL PRIMARY KEY,BuildtimeCode varchar(16),RuntimeCode varchar(32),SerialCode varchar(10),VersionNumber integer,UniCounting integer); CREATE TABLE IF NOT EXISTS PLT_BT_WFPROCESS (Pk_WfProcess varchar(32) NOT NULL PRIMARY KEY,ProcessCode varchar(32),ProcessName varchar(512),ProcessType smallint,WorkflowType smallint,Description text,Keywords varchar(1024),Author varchar(512),AuthorId varchar(32),Lastupdate timestamp,Status smallint,Fk_Parent varchar(32),Fk_Owner varchar(32),BindEnClassName varchar(30),Proprietors text,ProcessContent text); CREATE TABLE IF NOT EXISTS PLT_RL_WFPROCESS (Pk_WfProcess varchar(32) NOT NULL PRIMARY KEY,ProcessCode varchar(32),ProcessName varchar(512),ProcessType smallint,WorkflowType smallint,Description text,Keywords varchar(1024),Author varchar(512),AuthorId varchar(32),Lastupdate timestamp,Status smallint,Version varchar(512),Releaser varchar(512),ReleaserId varchar(32),ReleaseStatement text,ReleaseDate timestamp,Fk_Parent varchar(32),Fk_Owner varchar(32),BindEnClassName varchar(30),Proprietors text,ProcessContent text); CREATE TABLE IF NOT EXISTS PLT_WFPROCESSINST (oid varchar(32) NOT NULL PRIMARY KEY,instContent text); CREATE TABLE IF NOT EXISTS PLT_WFPROCESSHIST (oid varchar(32) NOT NULL PRIMARY KEY,instContent text); DELETE FROM PLT_IDCACHE; insert into plt_idcache (primarykey,buildtimecode, runtimecode, serialcode, unicounting, versionnumber) values (0,''00000000000004PQ'',''00000000000000000000000000000B4F'',''0000000185'',25,0);'::varchar);
