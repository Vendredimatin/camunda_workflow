alter table if exists plt_fpt_queryoprconfig alter column plt_viewtype type text;
alter table if exists plt_mdl_metadatasource alter column plt_serverport type integer using plt_serverport::integer;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20190327-xxxxxxxxx'::varchar, 'update-2.0_to_2.1.sql'::varchar, '2.0'::varchar, '2.1'::varchar, '20190327-xxxxxxxxx'::varchar, 'alter table if exists plt_fpt_queryoprconfig alter column plt_viewtype type text; alter table if exists plt_mdl_metadatasource alter column plt_serverport type integer using plt_serverport::integer;'::varchar);
