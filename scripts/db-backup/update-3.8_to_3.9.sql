-- modeler应用的所有模块改为isSystem=false，zoneName=CUS
DO
$$
BEGIN
    IF EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20') THEN
        -- 数据模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37';
        END IF;
        -- 表单模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '769C3B5674E7264F8FEE71E7C801599B') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '769C3B5674E7264F8FEE71E7C801599B';
        END IF;
        -- 功能模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '2F8703DBDD81A34E80181E97536564E2') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '2F8703DBDD81A34E80181E97536564E2';
        END IF;
        -- 组织模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '72237969537771468142E39CCBA4B0AE') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '72237969537771468142E39CCBA4B0AE';
        END IF;
        -- 授权模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '688390550FC66641BE854876C33B2B96') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '688390550FC66641BE854876C33B2B96';
        END IF;
        -- 流程模型
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '5C89F5702EBAAB43BAC0E4A711436410') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '5C89F5702EBAAB43BAC0E4A711436410';
        END IF;
        -- 模型管理
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '2D97F8E2BDE68340A58CFB0D828D34C9') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '2D97F8E2BDE68340A58CFB0D828D34C9';
        END IF;
        -- 系统管理
        IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '005C0473F81EFC41814A62BD3B002045') THEN
            update plt_mdl_metaclass set plt_issystem = false, plt_zonename = 'CUS' where plt_oid = '005C0473F81EFC41814A62BD3B002045';
        END IF;
    END IF;
END
$$;

-- defaultMdl分支：为所有没有默认模块的应用增加默认模块
DO
$$
    DECLARE
        idx integer := 0;
        totalcount integer;
        appname varchar;
        appid varchar;
        classname varchar;
    BEGIN

        totalcount := (select count(1) from plt_mdl_appinfo);

        LOOP
            IF totalcount = 0 THEN
                EXIT;
            END IF;

            appname := (select plt_appname from plt_mdl_appinfo limit 1 offset idx);
            appid := (select plt_id from plt_mdl_appinfo limit 1 offset idx);
            classname := 'APP' || substr(appid, 1, 32-6) || 'dft';

            IF NOT EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_classcategory = 'ModuleClass' and plt_classname = classname) THEN
                delete from plt_mdl_metaclass where plt_classname = classname;
                insert into plt_mdl_metaclass (plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_packagepath, plt_zonename, plt_modifytime, plt_appid)
                values (false, 0, replace(cast(uuid_generate_v4() as VARCHAR), '-', ''), 'ModuleClass', classname, 'DynamicClass', '默认模块', 'Module', 'ios-add', 'CUS', statement_timestamp(), appid);
            END IF;

            IF NOT EXISTS (SELECT * FROM plt_mdl_authorityitem WHERE plt_authorityid = classname) THEN
                insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note)
                values (replace(cast(uuid_generate_v4() as VARCHAR), '-', ''), classname, '默认模块', '模块-默认模块');
            END IF;

            idx := idx + 1;
            IF idx = totalcount THEN
                EXIT;
            END IF;
        END LOOP;

    END
$$;


select sys_dbversions_update('2020-11-13 10:51:00'::timestamp, '20201106-6350c13c5'::varchar, 'update-3.8_to_3.9.sql'::varchar, '3.8'::varchar, '3.9'::varchar, '20201117-0385c11bd'::varchar, ''::varchar);
