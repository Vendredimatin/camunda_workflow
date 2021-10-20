-- 属性授权规则，不限制sql语句长度
alter table if exists plt_mdl_attraccessrule alter column plt_content type text;

-- tmpComponent分支
-- 组件类
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '1A3DE99A49B54C8FA30CE965144D131B') THEN
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_classname = 'Component') THEN
                delete from plt_mdl_metaclass where plt_classname = 'Component';
            END IF;
            insert into plt_mdl_metaclass (plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_packagepath, plt_zonename, plt_modifytime) values
            (true, 1, '1A3DE99A49B54C8FA30CE965144D131B', 'ItemClass', 'Component', 'PersistentClass', '组件', 'IdItem', '', 'COMP', statement_timestamp());
        END IF;
    END
$$;
create table IF NOT EXISTS plt_comp_component(
                                                 plt_oid varchar(32) primary key,
                                                 plt_lastmodifytime timestamp(6) default statement_timestamp(),
                                                 plt_lastmodifier varchar(32) default '9C92E891E9AE534DB685737DE467A9D0',
                                                 plt_creator varchar(32) default '9C92E891E9AE534DB685737DE467A9D0',
                                                 plt_createtime timestamp(6),
                                                 plt_componentoid varchar(32),
                                                 plt_componentdisplayname varchar,
                                                 plt_componentgroupoid varchar(32),
                                                 plt_componenticon varchar,
                                                 plt_componentnote varchar
);

-- 组件分组类
create table IF NOT EXISTS plt_comp_componentgroup(
                                                      plt_oid varchar(32) primary key,
                                                      plt_lastmodifytime timestamp(6) default statement_timestamp(),
                                                      plt_lastmodifier varchar(32) default '9C92E891E9AE534DB685737DE467A9D0',
                                                      plt_creator varchar(32) default '9C92E891E9AE534DB685737DE467A9D0',
                                                      plt_createtime timestamp(6),
                                                      plt_name varchar,
                                                      plt_displayname varchar,
                                                      plt_state varchar
);

-- compGroup删除后，级联删除comp2compgroup中的对象，并更新CustomView中Owner为当前组的对象
CREATE OR REPLACE FUNCTION public.trigger_fct_plt_componentgroupdel_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if OLD.plt_oid is not null then
        delete from plt_comp_component where plt_componentgroupoid = OLD.plt_oid;
        update plt_mdl_customview set plt_owner = '' where plt_classname = 'Component' and plt_owner = OLD.plt_oid;
    end if;
    RETURN OLD;
end
$$;
ALTER FUNCTION public.trigger_fct_plt_componentgroupdel_tri() OWNER TO postgres;
DROP TRIGGER IF EXISTS plt_componentgroupdel_tri on plt_comp_componentgroup;
CREATE TRIGGER plt_componentgroupdel_tri BEFORE DELETE ON public.plt_comp_componentgroup FOR EACH ROW EXECUTE PROCEDURE public.trigger_fct_plt_componentgroupdel_tri();

-- modeler应用增加组件分组管理页面
DO
$$
BEGIN
    IF EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20')
           AND EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '769C3B5674E7264F8FEE71E7C801599B')
           AND NOT EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'E9663F672F778F488D58CA308B80583C') THEN
        insert into plt_fpt_queryoprconfig (plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_order, plt_authority, plt_modifytime) values
        ('E9663F672F778F488D58CA308B80583C', 'implement', 'tab', 'addin:ComponentGroupManagement', '组件分组管理', 'ios-keypad-outline', 'FormEngine', 2, 'ComponentGroupManagement', statement_timestamp());
    END IF;
END
$$;

-- 更改modeler应用主菜单顺序，更改数据模型下子菜单顺序
DO
$$
    BEGIN
        IF EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20') THEN
            -- 数据模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37') THEN
                update plt_mdl_metaclass set plt_state = 0 where plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37';
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'DFA6A251BDB217498525A9B092AAE5A3') THEN
                    update plt_fpt_queryoprconfig set plt_order = 0 where plt_oid = 'DFA6A251BDB217498525A9B092AAE5A3';
                END IF;
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '517E356BF7117542B6A6109949058E96') THEN
                    update plt_fpt_queryoprconfig set plt_order = 1 where plt_oid = '517E356BF7117542B6A6109949058E96';
                END IF;
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8') THEN
                    update plt_fpt_queryoprconfig set plt_order = 2 where plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8';
                END IF;
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5105F81587F2394E8EEC0A2734A055A7') THEN
                    update plt_fpt_queryoprconfig set plt_order = 3 where plt_oid = '5105F81587F2394E8EEC0A2734A055A7';
                END IF;
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '2D7645E72E897D4EB4709D7D29EA6166') THEN
                    update plt_fpt_queryoprconfig set plt_order = 4 where plt_oid = '2D7645E72E897D4EB4709D7D29EA6166';
                END IF;
            END IF;
            -- 表单模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '769C3B5674E7264F8FEE71E7C801599B') THEN
                update plt_mdl_metaclass set plt_state = 1 where plt_oid = '769C3B5674E7264F8FEE71E7C801599B';
            END IF;
            -- 功能模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '2F8703DBDD81A34E80181E97536564E2') THEN
                update plt_mdl_metaclass set plt_state = 2 where plt_oid = '2F8703DBDD81A34E80181E97536564E2';
            END IF;
            -- 组织模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '72237969537771468142E39CCBA4B0AE') THEN
                update plt_mdl_metaclass set plt_state = 3 where plt_oid = '72237969537771468142E39CCBA4B0AE';
            END IF;
        END IF;
    END
$$;

-- 清除上个授权版本遗留问题
DELETE FROM plt_rul_accessrule where plt_authority='ObjAccessRule' and plt_classname='AuthModel' and plt_conditionid='AlwaysTrue';
DELETE FROM plt_rul_accessrule where plt_authority='AttrAccessRule' and plt_classname='AuthModel' and plt_conditionid='AlwaysTrue';
DELETE FROM plt_rul_accessrule where plt_authority='AuthBlock' and plt_classname='AuthModel' and plt_conditionid='AlwaysTrue';

select sys_dbversions_update('2020-10-19 14:45:00'::timestamp, '20201016-51f2fde7b'::varchar, 'update-3.7_to_3.8.sql'::varchar, '3.7'::varchar, '3.8'::varchar, '20201106-6350c13c5'::varchar, ''::varchar);
