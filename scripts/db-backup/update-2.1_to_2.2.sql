create table IF NOT EXISTS plt_mdl_modelpackage (plt_oid character varying, plt_header text, plt_extention text, plt_initscript text);

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20190713-xxxxxxxxx'::varchar, 'update-2.1_to_2.2.sql'::varchar, '2.1'::varchar, '2.2'::varchar, '20190713-xxxxxxxxx'::varchar, 'create table IF NOT EXISTS plt_mdl_modelpackage (plt_oid character varying, plt_header text, plt_extention text, plt_initscript text)'::varchar);
