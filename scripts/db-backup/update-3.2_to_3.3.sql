DO
$$
BEGIN
--     为default应用新增授权项
	IF NOT EXISTS (SELECT * FROM plt_mdl_authorityitem WHERE plt_oid = 'EEF1CF8FAF2266449A319337FD364059') THEN
	    insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values ('EEF1CF8FAF2266449A319337FD364059', 'APP_default', '默认应用授权项', '应用-默认应用');
    END IF;

--     新增属性parentOid
    IF NOT EXISTS (SELECT * FROM plt_mdl_metaattribute WHERE plt_oid = 'D74165F64E91454E931FD7D790A7F381') THEN
        delete from plt_mdl_metaattribute where plt_attributename = 'parentOid';
	    insert into plt_mdl_metaattribute (plt_nullable, plt_valuelength, plt_oid, plt_attributecategory, plt_attributename, plt_displayname, plt_valuetype, plt_modifytime) values (true, 0, 'D74165F64E91454E931FD7D790A7F381', 'Variable', 'parentOid', '父对象标识', 'String', statement_timestamp());
    END IF;

--     新增属性childrenCount
    IF NOT EXISTS (SELECT * FROM plt_mdl_metaattribute WHERE plt_oid = 'C5028664E5BD7F4B94C8CB12F1B0600A') THEN
	    insert into plt_mdl_metaattribute (plt_nullable, plt_valuelength, plt_oid, plt_attributecategory, plt_attributename, plt_displayname, plt_valuetype, plt_modifytime) values (true, 9, 'C5028664E5BD7F4B94C8CB12F1B0600A', 'Variable', 'childrenCount', '孩子数', 'Integer', statement_timestamp());
    END IF;

--     appinfo的note字段改名为plt_note
    IF NOT EXISTS (select * from information_schema.columns where table_schema = 'public' and table_name = 'plt_mdl_appinfo' and column_name = 'plt_note') THEN
        alter table plt_mdl_appinfo rename column note to plt_note;
    END IF;

--     新增modeler应用及其相关模块/操作，为modeler应用及其相关模块/操作新增授权项
	IF NOT EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20') THEN
	    delete from plt_mdl_appinfo where plt_appname = 'modeler';
	    insert into plt_mdl_appinfo (plt_id, plt_appname, plt_note, plt_startpageurl, plt_title, plt_modifytime, plt_extconfig) values ('C9C2F20D1EBA4A4FA4B6FA47C0F04D20', 'modeler', '建模工具', 'login', '建模工具', statement_timestamp(), '{"indexPageOpr":"","logoImg":"/modeler-web/img/dLogo.25cc01d4.jpg","cssName":"","skinStyle":"light","extendJs":"","flexDeriction":"左右任务栏布局","extendCss":"","icoImg":"","indexPageUrl":"home"}');
	    insert into plt_mdl_metaclass (plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_packagepath, plt_zonename, plt_modifytime, plt_appid) values
            (true, 0, '72237969537771468142E39CCBA4B0AE', 'ModuleClass', 'OrganizationalModel', 'DynamicClass', '组织模型', 'Module', 'ios-ionic', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 1, 'DFB27CB3DD33944FA59E4A4078406D37', 'ModuleClass', 'DataModel', 'DynamicClass', '数据模型', 'Module', 'ios-cube', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 2, '769C3B5674E7264F8FEE71E7C801599B', 'ModuleClass', 'FormEngine', 'DynamicClass', '表单模型', 'Module', 'ios-folder', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 3, '2F8703DBDD81A34E80181E97536564E2', 'ModuleClass', 'FunctionalModel', 'DynamicClass', '功能模型', 'Module', 'md-help-buoy', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 4, '688390550FC66641BE854876C33B2B96', 'ModuleClass', 'AuthModel', 'DynamicClass', '授权模型', 'Module', 'md-unlock', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 5, '5C89F5702EBAAB43BAC0E4A711436410', 'ModuleClass', 'WorkflowModel', 'DynamicClass', '流程模型', 'Module', 'ios-archive', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 6, '2D97F8E2BDE68340A58CFB0D828D34C9', 'ModuleClass', 'ModelPackage', 'DynamicClass', '模型管理', 'Module', 'ios-cloud', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'),
            (true, 7, '005C0473F81EFC41814A62BD3B002045', 'ModuleClass', 'SystemManagement', 'DynamicClass', '系统管理', 'Module', 'md-cog', 'MDL', statement_timestamp(), 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20');
        insert into plt_fpt_queryoprconfig (plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_order, plt_authority, plt_modifytime) values
            ('FCD49C91A088CA4DA12A03B522C8F98B', 'implement', 'tab', 'addin:UserManagement', '用户管理', 'ios-person', 'OrganizationalModel', 0, 'UserManagement', statement_timestamp()),
            ('88B3A77475483A4C8D607B6EA64A8D2E', 'implement', 'tab', 'addin:UsersManagement', '用户组管理', 'ios-people', 'OrganizationalModel', 1, 'UsersManagement', statement_timestamp()),
            ('5008F81C064D9C4E939C3C382BF9FF55', 'implement', 'tab', 'addin:OnlineManagement', '在线管理', 'md-cloud-upload', 'OrganizationalModel', 2, 'OnlineManagement', statement_timestamp()),
            ('2D7645E72E897D4EB4709D7D29EA6166', 'implement', 'tab', 'addin:AttributesLib', '属性库管理', 'md-podium', 'DataModel', 0, 'AttributesLib', statement_timestamp()),
            ('DFA6A251BDB217498525A9B092AAE5A3', 'implement', 'tab', 'addin:InternalEntityModeling', '实体类管理', 'ios-color-wand', 'DataModel', 1, 'InternalEntityModeling', statement_timestamp()),
            ('517E356BF7117542B6A6109949058E96', 'implement', 'tab', 'addin:RelationModeling', '关联类管理', 'md-swap', 'DataModel', 2, 'RelationModeling', statement_timestamp()),
            ('BDB973F1A7F1744888E511F1E68DF1D8', 'implement', 'tab', 'addin:DataSourceMgr', '外部数据连接', 'ios-cube', 'DataModel', 3, 'DataSourceManagement', statement_timestamp()),
            ('5105F81587F2394E8EEC0A2734A055A7', 'implement', 'tab', 'addin:ExternalEntityModeling', '外部实体类', 'ios-color-wand', 'DataModel', 4, 'ExternalEntityModeling', statement_timestamp()),
            ('B45C508463F4E041B8B1743EBE6E5536', 'implement', 'tab', 'addin:FormManagement', '实体类表单管理', 'ios-list', 'FormEngine', 0, 'FormManagement', statement_timestamp()),
            ('5843EA9ABA750A49ACC22AAAF501164B', 'implement', 'tab', 'addin:RelationFormManagement', '关联类表单管理', 'ios-paper-outline', 'FormEngine', 1, 'RelationFormManagement', statement_timestamp()),
            ('3FBC68630FDF5F4199B44AB436C563DB', 'implement', 'tab', 'addin:ApplicationManagement', '应用管理', 'logo-dropbox', 'FunctionalModel', 0, 'ApplicationManagement', statement_timestamp()),
            ('8D9EC20ADC619C44B9414DDDCE8B29FA', 'implement', 'tab', 'addin:GlobalOperationManagement', '全局操作', 'ios-medical-outline', 'FunctionalModel', 1, 'GlobalOperationManagement', statement_timestamp()),
            ('160CF7918A14C54689662EBBB70C8205', 'implement', 'tab', 'addin:EntityClassOperation', '实体类操作', 'md-locate', 'FunctionalModel', 2, 'EntityClassOperation', statement_timestamp()),
            ('FE1DA3A0A095474B93D70EDC7C81E30A', 'implement', 'tab', 'addin:RelationClassOperation', '关联类操作', 'md-git-commit', 'FunctionalModel', 3, 'RelationClassOperation', statement_timestamp()),
            ('6C4F2A3CFD78CE47BDB3BEF54004F5A2', 'implement', 'tab', 'addin:AuthBrief', '快速授权', 'ios-funnel', 'AuthModel', 0, 'AuthBrief', statement_timestamp()),
            ('6C4F3A3CFD73CE37BDB3BEF53004F5A3', 'implement', 'tab', 'addin:AuthBriefEnhance', '快速授权增强', 'ios-funnel', 'AuthModel', 1, 'AuthBriefEnhance', statement_timestamp()),
            ('5A34DB5211C3A44AAFCA9FC171FB9065', 'implement', 'tab', 'addin:AuthBlock', '访问控制', 'ios-funnel', 'AuthModel', 2, 'AuthBlock', statement_timestamp()),
            ('C098EDA0829A4543B36D9E4D57A293F3', 'implement', 'tab', 'addin:AttrAccessRule', '属性授权规则', 'ios-funnel', 'AuthModel', 3, 'AttrAccessRule', statement_timestamp()),
            ('98E840AF304A4647B3522F0DA1E301EC', 'implement', 'tab', 'addin:ObjAccessRule', '对象授权规则', 'ios-funnel', 'AuthModel', 4, 'ObjAccessRule', statement_timestamp()),
            ('1C7D4072F6C5EB4A8E28FA780C47EB6F', 'implement', 'tab', 'addin:WfModeler', '流程建模', 'md-cloud-upload', 'WorkflowModel', 0, 'WfModeler', statement_timestamp()),
            ('900FA8977377CD4188D36FC85817E619', 'implement', 'tab', 'addin:WfAdmin', '流程监控', 'md-cloud-upload', 'WorkflowModel', 1, 'WfAdmin', statement_timestamp()),
            ('8E0BDCD94F4F0147AAEFC946A8361608', 'implement', 'tab', 'addin:ModelPackageManage', '模型包管理', 'md-cloud-upload', 'ModelPackage', 0, 'ModelPackageManage', statement_timestamp()),
            ('5406D219CE606C409E672D583D2552E4', 'implement', 'tab', 'addin:CodeAssembly', '代码装配', 'ios-construct', 'ModelPackage', 1, 'CodeAssembly', statement_timestamp()),
            ('F4932CED1BC8774D8FD5F26EA651ABB0', 'implement', 'tab', 'addin:ViewScriptLog', '脚本日志', 'ios-analytics', 'SystemManagement', 0, 'ViewScriptLog', statement_timestamp());
        delete from plt_mdl_authorityitem where plt_authorityid = 'APP_modeler' or plt_authorityid = 'OrganizationalModel' or plt_authorityid = 'DataModel' or plt_authorityid = 'FormEngine' or
            plt_authorityid = 'FunctionalModel' or plt_authorityid = 'AuthModel' or plt_authorityid = 'WorkflowModel' or plt_authorityid = 'ModelPackage' or plt_authorityid = 'SystemManagement';
        insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values
            ('D3CBF72F64CD834EBE1CCDD0392A84BB', 'APP_modeler', '建模工具授权项', '应用-建模工具'),
            ('27FD7DFD75D2AA449A878A337955E398', 'OrganizationalModel', '组织模型', '模块-组织模型'),
            ('2CCA5B2A05816B498F74A3DED8CC0D20', 'DataModel', '数据模型', '模块-数据模型'),
            ('BD1A78B346EE7541997AED76FEC29D4F', 'FormEngine', '表单模型', '模块-表单模型'),
            ('105EAF1D3DC8A545B59434F513640279', 'FunctionalModel', '功能模型', '模块-功能模型'),
            ('E20A0A3AEC6AAD48BD22CB96B8DFD501', 'AuthModel', '授权模型', '模块-授权模型'),
            ('4E2C4E4273D5AB42A3FED7D7C91A3830', 'WorkflowModel', '流程模型', '模块-流程模型'),
            ('77097E0130F5D2448BF7B9779D357981', 'ModelPackage', '模型管理', '模块-模型管理'),
            ('0F96960DF2C22B43A5BB75CDF2D1528D', 'SystemManagement', '系统管理', '模块-系统管理');
--     新增操作时会自动生成授权项，因此无需手动新增
--         delete from plt_mdl_authorityitem where plt_authorityid = 'ViewScriptLog' or plt_authorityid = 'SystemManagement' or plt_authorityid = 'CodeAssembly' or plt_authorityid = 'ModelPackageManage' or plt_authorityid = 'ModelPackage' or plt_authorityid = 'WfAdmin' or plt_authorityid = 'WfModeler' or plt_authorityid = 'WorkflowModel' or
--             plt_authorityid = 'ObjAccessRule' or plt_authorityid = 'AttrAccessRule' or plt_authorityid = 'AuthBlock' or plt_authorityid = 'AuthBrief' or plt_authorityid = 'AuthModel' or plt_authorityid = 'RelationClassOperation' or plt_authorityid = 'EntityClassOperation' or plt_authorityid = 'GlobalOperationManagement' or
--             plt_authorityid = 'ApplicationManagement' or plt_authorityid = 'FunctionalModel' or plt_authorityid = 'RelationFormManagement' or plt_authorityid = 'FormManagement' or plt_authorityid = 'FormEngine' or plt_authorityid = 'ExternalEntityModeling' or plt_authorityid = 'DataSourceManagement' or plt_authorityid = 'RelationModeling' or
--             plt_authorityid = 'InternalEntityModeling' or plt_authorityid = 'AttributesLib' or plt_authorityid = 'DataModel' or plt_authorityid = 'OnlineManagement' or plt_authorityid = 'UsersManagement' or plt_authorityid = 'UserManagement' or plt_authorityid = 'OrganizationalModel';
--         insert into plt_mdl_authorityitem (plt_oid, plt_authorityid, plt_displayname, plt_note) values
--             ('f182bcce-dc15-4b6e-ae3f-3377b89d7415', 'UserManagement', '用户管理', 'OrganizationalModel'),
--             ('a46ababd-9ec2-4f43-be62-64bdf7d07273', 'UsersManagement', '用户组管理', 'OrganizationalModel'),
--             ('83e83f1b-0dec-4e8f-abe7-07b314d0cfa1', 'OnlineManagement', '在线管理', 'OrganizationalModel'),
--             ('d8c422c5-0f62-42a3-9a19-a887fc233ad2', 'AttributesLib', '属性库管理', 'DataModel'),
--             ('1e0fd7b2-0a4e-4e73-b315-aeba2aa44c0e', 'InternalEntityModeling', '实体类管理', 'DataModel'),
--             ('fc288121-092c-42dc-88e7-582f51be472d', 'RelationModeling', '关联类管理', 'DataModel'),
--             ('0b17d41a-c174-4909-ab86-e412c1f84e4a', 'DataSourceManagement', '外部数据连接', 'DataModel'),
--             ('7458fd7d-1564-4b5c-9abf-7aa0a49342e8', 'ExternalEntityModeling', '外部实体类', 'DataModel'),
--             ('e9acc079-6b1e-448f-a3f6-246e09170e34', 'FormManagement', '实体类表单管理', 'FormEngine'),
--             ('6ffad73f-445b-4a80-b42d-bd25df26b0ba', 'RelationFormManagement', '关联类表单管理', 'FormEngine'),
--             ('197f941c-f3ec-472c-af56-30e6ef11817f', 'ApplicationManagement', '应用管理', 'FunctionalModel'),
--             ('823d5328-15de-4a4b-bcd0-e03dbd404fcb', 'GlobalOperationManagement', '全局操作', 'FunctionalModel'),
--             ('1a1fb5b9-8506-4743-b40b-32c6f0cc83be', 'EntityClassOperation', '实体类操作', 'FunctionalModel'),
--             ('efba7335-fd13-4598-af70-7d3b0e062262', 'RelationClassOperation', '关联类操作', 'FunctionalModel'),
--             ('a49c7d09-d69a-41e3-87df-a0b867aac176', 'AuthBrief', '快速授权', 'AuthModel'),
--             ('a49c7d09-d69a-41e3-87df-a0b867aac177', 'AuthBriefEnhance', '快速授权增强', 'AuthModel'),
--             ('d7c19adc-f131-4e2d-96d5-847855b527df', 'AuthBlock', '访问控制', 'AuthModel'),
--             ('47fa16fd-67d8-4385-975c-ee4e861178c5', 'AttrAccessRule', '属性授权规则', 'AuthModel'),
--             ('aa98b2f9-2587-43ee-99a0-1bd61127523c', 'ObjAccessRule', '对象授权规则', 'AuthModel'),
--             ('ae63c0f4-57d7-412c-9619-abe1b6033730', 'WfModeler', '流程建模', 'WorkflowModel'),
--             ('a6cd8f01-f4cf-494d-b535-0ebcc6667881', 'WfAdmin', '流程监控', 'WorkflowModel'),
--             ('036e78cf-7fc2-4de4-9965-5e3722cea45e', 'ModelPackageManage', '模型包管理', 'ModelPackage'),
--             ('1da769c3-0b08-44bf-9179-ef7b224cddf4', 'CodeAssembly', '代码装配', 'ModelPackage'),
--             ('fdb638d3-470b-4a43-bea8-bf88c3936ef7', 'ViewScriptLog', '脚本日志', 'SystemManagement');
    END IF;

END
$$;

-- 新增系统日志表plt_sys_log
create table IF NOT EXISTS plt_sys_log (plt_oid varchar(32) primary key,
                                        plt_logtype character varying(100),
                                        plt_logcontent text,
                                        plt_username character varying(100),
                                        plt_userdisplayname character varying(200),
                                        plt_ip character varying(20),
                                        plt_operationname character varying(100),
                                        plt_action character varying(100),
                                        plt_targetclass character varying(100),
                                        plt_formname character varying(100),
                                        plt_url text,
                                        plt_implementtype character varying(100),
                                        plt_costtime bigint,
                                        plt_creator character varying(32),
                                        plt_createtime timestamp without time zone not null DEFAULT now(),
                                        plt_description text);

select sys_dbversions_update('2020-06-15 16:44:00'::timestamp, '20200628-8c171ba9f'::varchar, 'update-3.2_to_3.3.sql'::varchar, '3.2'::varchar, '3.3'::varchar, '20200710-b893de8d5'::varchar, ''::varchar);
