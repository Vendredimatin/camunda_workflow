alter table if exists plt_mdl_attraccessrule alter column plt_name type character varying(32);
alter table if exists plt_mdl_attraccessrule alter column plt_note type character varying(1000);

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20200330-xxxxxxxxx'::varchar, 'update-2.9_to_3.0.sql'::varchar, '2.9'::varchar, '3.0'::varchar, '20200330-xxxxxxxxx'::varchar, 'alter table plt_mdl_attraccessrule alter column plt_name type character varying(32); alter table plt_mdl_attraccessrule alter column plt_note type character varying(1000);'::varchar);
