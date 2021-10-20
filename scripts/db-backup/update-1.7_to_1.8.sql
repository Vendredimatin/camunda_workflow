alter table if exists plt_fpt_queryoprconfig alter column plt_params type text;

-- 20200518 update for test
CREATE TABLE IF NOT EXISTS plt_sys_dbversions (
plt_oid character varying(32) PRIMARY KEY NOT NULL,
plt_createtime timestamp without time zone DEFAULT statement_timestamp(),
plt_updatetime timestamp without time zone DEFAULT statement_timestamp(),
plt_dwfstarttag character varying(100),
plt_dbscriptver character varying(100),
plt_dblatestver character varying(100),
plt_dwflatesttag character varying(100),
plt_script text);

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
-- ALTER FUNCTION public.sys_dbversions_update(timestamp, varchar, varchar, varchar, varchar, varchar) OWNER TO postgres;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20181221-xxxxxxxxx'::varchar, 'update-1.7_to_1.8.sql'::varchar, '1.7'::varchar, '1.8'::varchar, '20181221-xxxxxxxxx'::varchar, 'alter table if exists plt_fpt_queryoprconfig alter column plt_params type text;'::varchar);
