-- 增加默认组件分组Uncategorized
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM PLT_COMP_ComponentGroup WHERE plt_oid = '7968920CE1734273A6C65A91667AB15E') THEN
            insert into PLT_COMP_ComponentGroup (plt_oid, plt_name, plt_displayname, plt_createtime, plt_lastmodifytime, plt_lastmodifier, plt_creator)
            values ('7968920CE1734273A6C65A91667AB15E', 'Uncategorized', '默认分组', statement_timestamp(), statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
    END
$$;

-- compGroup删除后，级联更新comp2compgroup中的对象
CREATE OR REPLACE FUNCTION public.trigger_fct_plt_componentgroupdel_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if OLD.plt_oid is not null then
        update plt_comp_component set plt_componentgroupoid = '7968920CE1734273A6C65A91667AB15E' where plt_componentgroupoid = OLD.plt_oid;
    end if;
    RETURN OLD;
end
$$;
ALTER FUNCTION public.trigger_fct_plt_componentgroupdel_tri() OWNER TO postgres;
DROP TRIGGER IF EXISTS plt_componentgroupdel_tri on plt_comp_componentgroup;
CREATE TRIGGER plt_componentgroupdel_tri BEFORE DELETE ON public.plt_comp_componentgroup FOR EACH ROW EXECUTE PROCEDURE public.trigger_fct_plt_componentgroupdel_tri();

-- 兼容老版本无默认分组的数据
DO
$$
    DECLARE
        idx integer := 0;
        totalcount integer;
        componentid varchar;
        viewname varchar;
    BEGIN

        totalcount := (select count(1) from PLT_MDL_CustomView where plt_classname = 'Component' and plt_oid not in (select plt_componentoid from plt_comp_component));

        LOOP
            IF totalcount = 0 THEN
                EXIT;
            END IF;

            componentid := (select plt_oid from PLT_MDL_CustomView where plt_classname = 'Component' and plt_oid not in (select plt_componentoid from plt_comp_component) limit 1 offset idx);
            viewname := (select plt_viewname from PLT_MDL_CustomView where plt_classname = 'Component' and plt_oid not in (select plt_componentoid from plt_comp_component) limit 1 offset idx);

            IF NOT EXISTS (SELECT * FROM plt_comp_component WHERE plt_componentoid = componentid) THEN
                insert into plt_comp_component (plt_oid, plt_componentoid, plt_componentdisplayname, plt_componentgroupoid, plt_createtime, plt_lastmodifytime, plt_lastmodifier, plt_creator)
                values (upper(replace(cast(uuid_generate_v4() as VARCHAR), '-', '')), componentid, viewname, '7968920CE1734273A6C65A91667AB15E', statement_timestamp(), statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0');
            END IF;

            idx := idx + 1;
            IF idx = totalcount THEN
                EXIT;
            END IF;
        END LOOP;

    END
$$;

-- userReg插件：user中删除，在userinfo中也删除
CREATE OR REPLACE FUNCTION public.trigger_plt_org_userdel_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if EXISTS (select * from information_schema.tables where table_name = 'plt_rul_accessrule' and table_schema = 'public') and OLD.plt_name is not null then
        delete from plt_rul_accessrule where plt_participant =  OLD.plt_name;
    end if;
    if EXISTS (select * from information_schema.tables where table_name = 'plt_sys_userinfo' and table_schema = 'public') and OLD.plt_oid is not null then
        if EXISTS (select * from plt_sys_userinfo where plt_id = OLD.plt_oid) then
            delete from plt_sys_userinfo where plt_id =  OLD.plt_oid;
        end if;
    end if;
    RETURN OLD;
end
$$;
ALTER FUNCTION public.trigger_plt_org_userdel_tri() OWNER TO postgres;

-- 操作显示名长度改为32
ALTER TABLE if exists plt_fpt_queryoprconfig ALTER COLUMN plt_displayname TYPE varchar(32);

select sys_dbversions_update('2020-11-24 10:20:00'::timestamp, '20201123-6ef18e6dc'::varchar, 'update-3.9_to_4.0.sql'::varchar, '3.9'::varchar, '4.0'::varchar, '20201211-907b212f2'::varchar, ''::varchar);
