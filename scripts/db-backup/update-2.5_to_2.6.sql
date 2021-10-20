-- 用户不允许重名
create unique index if not exists plt_org_user_plt_name_uindex on plt_org_user (plt_name);

-- 快速查询操作不允许重名
create unique index if not exists plt_fpt_queryoprconfig_plt_authority_uindex on plt_fpt_queryoprconfig (plt_authority);

-- 数据源不允许重名
create unique index if not exists plt_mdl_metadatasource_plt_datasourcename_uindex on plt_mdl_metadatasource (plt_datasourcename);

-- 授权组不允许重名
create unique index if not exists plt_mdl_authitemgro_plt_groupid_uindex on plt_mdl_authitemgro (plt_groupid);

-- 授权项不允许重名
create unique index if not exists plt_mdl_authorityitem_plt_authorityid_uindex on plt_mdl_authorityitem (plt_authorityid);

-- 删除从代码中错误生成的数据源表plt_modifytime列
alter table if exists plt_mdl_metadatasource drop column if exists plt_modifytime;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20191108-xxxxxxxxx'::varchar, 'update-2.5_to_2.6.sql'::varchar, '2.5'::varchar, '2.6'::varchar, '20191108-xxxxxxxxx'::varchar, ''::varchar);
