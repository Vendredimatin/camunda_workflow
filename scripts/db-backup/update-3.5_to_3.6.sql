-- 清除上个授权版本遗留问题
DELETE FROM plt_rul_accessrule where plt_authority='OnlineManagement' and plt_classname='OrganizationalModel' and plt_conditionid='AlwaysTrue';
DELETE FROM plt_rul_accessrule where plt_authority='ModelPackageManage' and plt_classname='ModelPackage' and plt_conditionid='AlwaysTrue';
DELETE FROM plt_rul_accessrule where plt_authority='CodeAssembly' and plt_classname='ModelPackage' and plt_conditionid='AlwaysTrue';
DELETE FROM plt_rul_accessrule where plt_authority='ModelPackage' and plt_classname='ModelPackage' and plt_conditionid='AlwaysTrue';

-- 用户表中plt_isfrozen为空的地方改为false，邮箱字段改为全部小写
update plt_org_user set plt_isfrozen = false where plt_isfrozen is null;
update plt_org_user set plt_email = LOWER(plt_email);

-- 删除用户时，集联删除授权项
CREATE OR REPLACE FUNCTION public.trigger_plt_org_userdel_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if EXISTS (select * from information_schema.tables where table_name = 'plt_rul_accessrule' and table_schema = 'public') and OLD.plt_name is not null then
        delete from plt_rul_accessrule where plt_participant =  OLD.plt_name;
    end if;
    RETURN OLD;
end
$$;
ALTER FUNCTION public.trigger_plt_org_userdel_tri() OWNER TO postgres;
DROP TRIGGER IF EXISTS plt_org_userdel_tri on plt_org_user;
CREATE TRIGGER plt_org_userdel_tri AFTER DELETE ON public.plt_org_user FOR EACH ROW EXECUTE PROCEDURE public.trigger_plt_org_userdel_tri();

-- 删除用户组时，集联删除授权项
CREATE OR REPLACE FUNCTION public.trigger_plt_org_groupdel_tri() RETURNS trigger
    LANGUAGE plpgsql
AS $$
declare
    -- local variables here
BEGIN
    if EXISTS (select * from information_schema.tables where table_name = 'plt_rul_accessrule' and table_schema = 'public') and OLD.plt_name is not null then
        delete from plt_rul_accessrule where plt_participant =  OLD.plt_name;
    end if;
    RETURN OLD;
end
$$;
ALTER FUNCTION public.trigger_plt_org_groupdel_tri() OWNER TO postgres;
DROP TRIGGER IF EXISTS plt_org_groupdel_tri on plt_org_group;
CREATE TRIGGER plt_org_groupdel_tri AFTER DELETE ON public.plt_org_group FOR EACH ROW EXECUTE PROCEDURE public.trigger_plt_org_groupdel_tri();


select sys_dbversions_update('2020-08-21 14:45:00'::timestamp, '20200820-20402bd91'::varchar, 'update-3.5_to_3.6.sql'::varchar, '3.5'::varchar, '3.6'::varchar, '20200904-8d2d610a0'::varchar, ''::varchar);
