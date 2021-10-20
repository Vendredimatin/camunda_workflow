-- Group新增属性displayName
DO
$$
BEGIN
	IF NOT EXISTS (SELECT * FROM plt_mdl_r_class2attribute WHERE plt_oid='08A872D573181547A5DD940F78726762') THEN
	    insert into plt_mdl_r_class2attribute (plt_oid, plt_editable, plt_visible, plt_isunique, plt_attributename, plt_classname, plt_viewcontrol, plt_modifytime) values ('08A872D573181547A5DD940F78726762', true, true, false, 'displayName', 'Group', 'TextField', '2020-06-04 21:44:46.751336');
    END IF;
END
$$;

-- DataSource和DataSet改为外部实体类，并设置自定义主键
update plt_mdl_metaclass set plt_primarykey = 'plt_oid', plt_classcategory = 'ExternalItemClass', plt_parentclass = 'IdItem', plt_packagepath = '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasourcename":"数据源名称","plt_datasourcetype":"数据源类型","plt_datafileformat":"数据源文件类型","plt_serverip":"服务器IP","plt_serverport":"服务器端口","plt_username":"登陆用户名","plt_password":"密码","plt_workbenchurl":"管理界面地址","plt_databasename":"数据库名称","plt_paramone":"参数One","plt_folderdepth":"扫描层数","plt_description":"描述","默认PG数据源__attributes":["plt_createtime","plt_creator","plt_currentprocess","plt_oid","plt_owner","plt_id","plt_lastmodifytime","plt_lastmodifier","plt_datasourcename","plt_description","plt_folderdepth","plt_paramone","plt_databasename","plt_workbenchurl","plt_password","plt_username","plt_serverport","plt_serverip","plt_datafileformat","plt_datasourcetype"]}' where plt_oid = 'ff80818169c26ebd0169c2a65b800108';
update plt_mdl_metaclass set plt_primarykey = 'plt_oid', plt_classcategory = 'ExternalItemClass', plt_parentclass = 'IdItem', plt_packagepath = '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasetname":"数据集名称","plt_datasourceid":"所属数据源ID","plt_targetentityclass":"目标实体类","plt_filterstring":"查询语句","plt_description":"描述","默认PG数据源__attributes":["plt_createtime","plt_creator","plt_currentprocess","plt_oid","plt_owner","plt_lastmodifytime","plt_lastmodifier","plt_datasetname","plt_datasourceid","plt_targetentityclass","plt_filterstring","plt_description"]}' where plt_oid = 'ff80818169c26ebd0169c2a752020109';
delete from plt_mdl_metaclass where plt_classname = 'DataSet' and plt_oid<>'ff80818169c26ebd0169c2a752020109';
delete from plt_mdl_metaclass where plt_classname = 'DataSource' and plt_oid<>'ff80818169c26ebd0169c2a65b800108';

-- 授权规则
alter table if exists plt_mdl_objaccessrule alter column plt_rulename type character varying(32);

select sys_dbversions_update('2020-06-04 14:24:00'::timestamp, '20200604-c6729c904'::varchar, 'update-3.1_to_3.2.sql'::varchar, '3.1'::varchar, '3.2'::varchar, '20200628-8c171ba9f'::varchar, ''::varchar);
