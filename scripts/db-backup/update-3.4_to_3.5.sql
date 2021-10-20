-- briefAuth分支：新增对于模块和操作增删改的授权项
DO
$$
BEGIN
  IF NOT EXISTS (SELECT * FROM plt_mdl_authorityitem WHERE plt_note = '应用授权项') THEN
    insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values
    ('4669AD86C56D4815A62558FEB969E82A', 'SaveModules', '新增模块', '应用授权项'),
    ('85B30F6D6E8F4D21B79E16BA9505FDAC', 'EditModules', '编辑模块', '应用授权项'),
    ('1B18CDD02BBF48E99D4BFFE97E10EEC1', 'DeleteModules', '删除模块', '应用授权项'),
    ('17883E513D7442CCAE212C8F192FFA05', 'SaveOperations', '新增操作', '应用授权项'),
    ('9FE20820C447417185F755E64C8383FA', 'EditOperations', '编辑操作', '应用授权项'),
    ('C4644487A79A416BBDC1C2EFCE8557C2', 'DeleteOperations', '删除操作', '应用授权项');
  END IF;
END
$$;

-- 清理3.2-3.3挑战版中parentOid为系统属性的残留内容，不影响正式版用户
delete from plt_mdl_r_class2attribute where plt_attributename = 'parentOid' and plt_classname = 'IdItem';

select sys_dbversions_update('2020-07-31 09:45:00'::timestamp, '20200730-4a130b319'::varchar, 'update-3.4_to_3.5.sql'::varchar, '3.4'::varchar, '3.5'::varchar, '20200820-20402bd91'::varchar, ''::varchar);
