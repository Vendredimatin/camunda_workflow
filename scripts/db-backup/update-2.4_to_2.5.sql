-- 删除失效授权项
DELETE
FROM plt_mdl_authorityitem
WHERE plt_authorityid IN (
    SELECT plt_authority
    FROM plt_fpt_queryoprconfig opr
    WHERE plt_targetclass <> ''
      AND NOT EXISTS(
            SELECT *
            FROM plt_mdl_metaclass mc
            WHERE mc.plt_classname = opr.plt_targetclass
        )
);

-- 删除失效操作
DELETE
FROM plt_fpt_queryoprconfig opr
WHERE plt_targetclass <> ''
  AND NOT EXISTS(
        SELECT *
        FROM plt_mdl_metaclass mc
        WHERE mc.plt_classname = opr.plt_targetclass
    );

DO
$$
BEGIN
	IF NOT EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid='ff80818169c26ebd0169c2a752020109') THEN
		INSERT INTO public.plt_mdl_metaclass(plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_packagepath, plt_zonename)
		VALUES (false, 0, 'ff80818169c26ebd0169c2a752020109', 'ExternalItemClass', 'DataSet', 'PersistentClass', '数据集', 'IdItem', '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasetname":"数据集名称","plt_datasourceid":"所属数据源ID","plt_targetentityclass":"目标实体类","plt_filterstring":"查询语句","plt_description":"描述","默认PG数据源__attributes":["plt_oid","plt_id","plt_datasetname","plt_datasourceid","plt_targetentityclass","plt_filterstring","plt_description"]}', 'plt_mdl_metadataset');
	END IF;
	IF NOT EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid='ff80818169c26ebd0169c2a65b800108') THEN
		INSERT INTO public.plt_mdl_metaclass(plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_packagepath, plt_zonename)
	    VALUES (false, 0, 'ff80818169c26ebd0169c2a65b800108', 'ExternalItemClass', 'DataSource', 'PersistentClass', '数据源', 'IdItem', '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasourcename":"数据源名称","plt_datasourcetype":"数据源类型","plt_serverip":"服务器IP","plt_serverport":"服务器端口","plt_username":"登陆用户名","plt_password":"密码","plt_databasename":"数据库名称","plt_folderdepth":"扫描层数","plt_description":"描述","默认PG数据源__attributes":["plt_oid","plt_creator","plt_id","plt_datasourcename","plt_datasourcetype","plt_serverip","plt_serverport","plt_username","plt_password","plt_databasename","plt_folderdepth","plt_description"]}', 'plt_mdl_metadatasource');
    END IF;
END
$$;
delete from plt_mdl_metaclass where plt_classname = 'DataSet' and plt_oid<>'ff80818169c26ebd0169c2a752020109';
delete from plt_mdl_metaclass where plt_classname = 'DataSource' and plt_oid<>'ff80818169c26ebd0169c2a65b800108';

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20191211-xxxxxxxxx'::varchar, 'update-2.4_to_2.5.sql'::varchar, '2.4'::varchar, '2.5'::varchar, '20191211-xxxxxxxxx'::varchar, ''::varchar);
