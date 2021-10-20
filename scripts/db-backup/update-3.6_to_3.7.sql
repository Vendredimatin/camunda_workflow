-- 用户名修改时，修改accessrule的参与者名称
CREATE OR REPLACE FUNCTION public.trigger_fct_plt_unamechg_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if EXISTS (select * from information_schema.tables where table_name = 'plt_rul_accessrule' and table_schema = 'public') and OLD.plt_name <> NEW.plt_name then
        update plt_rul_accessrule set plt_participant = NEW.plt_name where plt_participant = OLD.plt_name;
    end if;
    RETURN NEW;
end
$$;
ALTER FUNCTION public.trigger_fct_plt_unamechg_tri() OWNER TO postgres;
DROP TRIGGER IF EXISTS plt_unamechg_tri on plt_org_user;
CREATE TRIGGER plt_unamechg_tri AFTER UPDATE ON public.plt_org_user FOR EACH ROW EXECUTE PROCEDURE public.trigger_fct_plt_unamechg_tri();

-- 前端控件中文名改名
DO
$$
    BEGIN
        update plt_fpt_queryoprconfig set plt_displayname = '基于功能授权' where plt_conditionexpre = 'addin:AuthBrief';
        update plt_fpt_queryoprconfig set plt_displayname = '基于组织授权' where plt_conditionexpre = 'addin:AuthBriefEnhance';
        update plt_fpt_queryoprconfig set plt_displayname = '数据访问控制' where plt_conditionexpre = 'addin:AuthBlock';
    END
$$;

-- 数据源和数据集改名为MetaXXX
update plt_mdl_metaclass set plt_classname = 'MetaDataSet', plt_primarykey = 'plt_oid' where plt_oid = 'ff80818169c26ebd0169c2a752020109';
update plt_mdl_metaclass set plt_classname = 'MetaDataSource', plt_primarykey = 'plt_oid' where plt_oid = 'ff80818169c26ebd0169c2a65b800108';

select sys_dbversions_update('2020-08-21 14:45:00'::timestamp, '20200904-8d2d610a0'::varchar, 'update-3.6_to_3.7.sql'::varchar, '3.6'::varchar, '3.7'::varchar, '20200925-e492e3f71'::varchar, ''::varchar);
