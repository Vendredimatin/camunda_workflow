alter table if exists PLT_MDL_MetaClass alter column PLT_zoneName type varchar;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20190123-xxxxxxxxx'::varchar, 'update-1.9_to_2.0.sql'::varchar, '1.9'::varchar, '2.0'::varchar, '20190123-xxxxxxxxx'::varchar, 'alter table if exists PLT_MDL_MetaClass alter column PLT_zoneName type varchar;'::varchar);
