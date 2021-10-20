alter table if exists plt_rul_accessrule alter column plt_attrname type varchar(100);

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20190910-xxxxxxxxx'::varchar, 'update-2.3_to_2.4.sql'::varchar, '2.3'::varchar, '2.4'::varchar, '20190910-xxxxxxxxx'::varchar, 'alter table if exists plt_rul_accessrule alter column plt_attrname type varchar(100);'::varchar);
