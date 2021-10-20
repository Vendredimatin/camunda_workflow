-- 数据表清理
DROP TABLE if exists plt_cus_r_linuxtesttosource,
plt_cus_iditem,
plt_omf_printtemplate,
plt_modeler_operationconfig,
plt_cus_linuxtest,
plt_rep_trueorfalse,
plt_fwk_user,
plt_rsc_unit,
plt_rep_valuetype,
plt_rsc_formstate,
plt_cus_owneditem;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20200204-xxxxxxxxx'::varchar, 'update-2.7_to_2.8.sql'::varchar, '2.7'::varchar, '2.8'::varchar, '20200204-xxxxxxxxx'::varchar, 'DROP TABLE if exists plt_cus_r_linuxtesttosource,plt_cus_iditem,plt_omf_printtemplate,plt_modeler_operationconfig,plt_cus_linuxtest,plt_rep_trueorfalse,plt_fwk_user,plt_rsc_unit,plt_rep_valuetype,plt_rsc_formstate,plt_cus_owneditem;'::varchar);
