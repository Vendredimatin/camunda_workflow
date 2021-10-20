-- 将所有对模块的授权上升到对应的应用
drop table if exists "public".tmp9bdd712db0e04912a12d7edd707491c6;
select allrule.plt_participant, allmodule.plt_classname, allapp.plt_appname, allapp.plt_title into "public".tmp9bdd712db0e04912a12d7edd707491c6 from
  (select plt_authority, plt_participant from plt_rul_accessrule where plt_conditionid = 'AlwaysTrue' and plt_authority = plt_classname and plt_authority not like 'APP_%') allrule
left join plt_mdl_metaclass allmodule on
  (allmodule.plt_classcategory = 'ModuleClass' and allmodule.plt_parentclass = 'Module' and allmodule.plt_appid <> '' and allmodule.plt_classname = allrule.plt_authority)
left join plt_mdl_appinfo allapp ON
  allapp.plt_id = allmodule.plt_appid
where allapp.plt_appname is not null and allapp.plt_appname <> '' and allrule.plt_participant is not null and allrule.plt_participant <> '' order by allrule.plt_participant;

DO
$$
DECLARE
	idx integer := 0;
	totalcount integer;
	participant varchar;
	classname varchar;
	appname varchar;
	apptitle varchar;
    authorityid varchar;
	displayname varchar;
	note varchar;
BEGIN

	totalcount := (select count(1) from "public".tmp9bdd712db0e04912a12d7edd707491c6);

	LOOP
	    IF totalcount = 0 THEN
          EXIT;
        END IF;

		participant := (select plt_participant from "public".tmp9bdd712db0e04912a12d7edd707491c6 limit 1 offset idx);
		classname := (select plt_classname from "public".tmp9bdd712db0e04912a12d7edd707491c6 limit 1 offset idx);
		appname := (select plt_appname from "public".tmp9bdd712db0e04912a12d7edd707491c6 limit 1 offset idx);
		apptitle := (select plt_title from "public".tmp9bdd712db0e04912a12d7edd707491c6 limit 1 offset idx);

        authorityid := 'APP_' || appname;
        displayname := apptitle || '授权项';
        note := '应用-' || apptitle;

        -- 为app建立授权项
        IF NOT EXISTS (SELECT * FROM plt_mdl_authorityitem WHERE plt_authorityid = authorityid) THEN
          insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values (replace(cast(uuid_generate_v4() as VARCHAR), '-', ''), authorityid, displayname, note);
        END IF;

        -- 为participant和app建立授权
        IF NOT EXISTS (SELECT * FROM plt_rul_accessrule WHERE plt_authority = authorityid and plt_participant = participant) THEN
          insert into plt_rul_accessrule (plt_oid, plt_note, plt_authority, plt_classname, plt_conditionid, plt_isinheritant, plt_level, plt_participant, plt_modifytime) values (replace(cast(uuid_generate_v4() as varchar), '-', ''), 'created by sql 0709', authorityid, authorityid, 'AlwaysTrue', true, 0, participant, statement_timestamp());
        END IF;

        idx := idx + 1;
        IF idx = totalcount THEN
          EXIT;
        END IF;
	END LOOP;

END
$$;

drop table if exists "public".tmp9bdd712db0e04912a12d7edd707491c6;


-- 为所有没有授权项的应用建立授权项
DO
$$
DECLARE
	idx integer := 0;
	totalcount integer;
	appname varchar;
	apptitle varchar;
    authorityid varchar;
	displayname varchar;
	note varchar;
BEGIN

	totalcount := (select count(1) from plt_mdl_appinfo);

	LOOP
	    IF totalcount = 0 THEN
          EXIT;
        END IF;

		appname := (select plt_appname from plt_mdl_appinfo limit 1 offset idx);
		apptitle := (select plt_title from plt_mdl_appinfo limit 1 offset idx);

        authorityid := 'APP_' || appname;
        displayname := apptitle || '授权项';
        note := '应用-' || apptitle;

        IF NOT EXISTS (SELECT * FROM plt_mdl_authorityitem WHERE plt_authorityid = authorityid) THEN
          insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values (replace(cast(uuid_generate_v4() as VARCHAR), '-', ''), authorityid, displayname, note);
        END IF;

          idx := idx + 1;
        IF idx = totalcount THEN
          EXIT;
        END IF;
	END LOOP;

END
$$;

-- 更新用户和用户组属性显示名
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '显示名' WHERE plt_classname = 'User' and plt_attributename = 'displayName';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '密码' WHERE plt_classname = 'User' and plt_attributename = 'password';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '备注' WHERE plt_classname = 'User' and plt_attributename = 'comment';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = 'E-mail' WHERE plt_classname = 'User' and plt_attributename = 'email';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '用户名' WHERE plt_classname = 'User' and plt_attributename = 'name';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '是否冻结' WHERE plt_classname = 'User' and plt_attributename = 'isFrozen';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '过期时间' WHERE plt_classname = 'User' and plt_attributename = 'expiredTime';

UPDATE plt_mdl_r_class2attribute SET plt_displayname = '用户组显示名' WHERE plt_classname = 'Group' and plt_attributename = 'displayName';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '备注' WHERE plt_classname = 'Group' and plt_attributename = 'comment';
UPDATE plt_mdl_r_class2attribute SET plt_displayname = '用户组名' WHERE plt_classname = 'Group' and plt_attributename = 'name';

select sys_dbversions_update('2020-07-09 16:37:00'::timestamp, '20200710-b893de8d5'::varchar, 'update-3.3_to_3.4.sql'::varchar, '3.3'::varchar, '3.4'::varchar, '20200730-4a130b319'::varchar, ''::varchar);
