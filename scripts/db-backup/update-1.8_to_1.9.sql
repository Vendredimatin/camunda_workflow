drop view if exists plt_rsc_qryviewname;
alter table if exists public.plt_mdl_customview alter column plt_viewname type varchar(1024);
alter table if exists plt_mdl_customview alter column plt_classname type varchar(1024);

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20181224-xxxxxxxxx'::varchar, 'update-1.8_to_1.9.sql'::varchar, '1.8'::varchar, '1.9'::varchar, '20181224-xxxxxxxxx'::varchar, 'drop view if exists plt_rsc_qryviewname; alter table if exists public.plt_mdl_customview alter column plt_viewname type varchar(1024); alter table if exists plt_mdl_customview alter column plt_classname type varchar(1024);'::varchar);
