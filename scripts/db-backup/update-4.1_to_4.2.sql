-- dataModelAttr分支
-- metaattribute增加属性isPrimaryKey和isIdentity
DO $$
    BEGIN
        alter table if exists PLT_MDL_MetaAttribute
            add column plt_isprimarykey boolean,
            add column plt_isidentity boolean;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column already exists in PLT_MDL_MetaAttribute';
    END;
$$;

-- metaattribute转移到class2attribute
DO $$
    BEGIN
        BEGIN
            alter table if exists plt_mdl_r_class2attribute
                add column plt_nullable boolean,
                add column plt_valuelength bigint,
                add column plt_attributecategory character varying(20),
                add column plt_valuetype character varying(20),
                add column plt_isprimarykey boolean,
                add column plt_isidentity boolean;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column already exists in plt_mdl_r_class2attribute';
        END;
        IF (select distinct(plt_dblatestver) from plt_sys_dbversions) = '4.1' THEN
            update plt_mdl_r_class2attribute set plt_nullable = a.plt_nullable,
                                                 plt_valuelength = a.plt_valuelength,
                                                 plt_attributecategory = a.plt_attributecategory,
                                                 plt_valuetype = a.plt_valuetype,
                                                 plt_isprimarykey = a.plt_isprimarykey,
                                                 plt_isidentity = a.plt_isidentity from plt_mdl_metaattribute a where a.plt_attributename = plt_mdl_r_class2attribute.plt_attributename;
        END IF;
    END;
$$;

DO $$
    BEGIN
        BEGIN
            alter table if exists plt_mdl_r_class2attribute
                add column PLT_isInForm boolean default true,
                add column PLT_isInTable boolean default false,
                add column PLT_isInQueryBox boolean default false,
                add column PLT_defaultComponent character varying(100),
                add column PLT_attrDict character varying,
                add column PLT_queryBoxDisplayType character varying,
                add column PLT_order integer default 100,
                add column plt_note character varying;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column already exists in plt_mdl_r_class2attribute';
        END;
        IF (select distinct(plt_dblatestver) from plt_sys_dbversions) = '4.1' THEN
            update plt_mdl_r_class2attribute set PLT_isInForm = false;
            update plt_mdl_r_class2attribute set PLT_order = 0 where plt_className in (
                with recursive findAncestors as (
                    select plt_className, plt_parentclass from plt_mdl_metaclass where (
                                                                                                   plt_className = 'IdItem' or plt_className = 'Relation'
                                                                                               or plt_className = 'PrintTemplate' or plt_className = 'ScriptCode'
                                                                                               or plt_className = 'ValueType' or plt_className = 'Unit'
                                                                                               or plt_className = 'QueryOprConfig' or plt_className = 'OperationConfig'
                                                                                               or plt_className = 'Script2Class' or plt_className = 'ScriptAction'
                                                                                               or plt_className = 'RscScriptAction' or plt_className = 'RscScript'
                                                                                               or plt_className = 'RscTrueOrFalse' or plt_className = 'RscGroup'
                                                                                               or plt_className = 'RscQryConType' or plt_className = 'RscQueryAction'
                                                                                               or plt_className = 'RscQryViewName' or plt_className = 'RscUser'
                                                                                               or plt_className = 'Participant' or plt_className = 'User' or plt_className = 'Group'
                                                                                               or plt_className = 'AccessRule' or plt_className = 'Rule'
                                                                                               or plt_className = 'Condition' or plt_className = 'TrueOrFalse'
                                                                                           )
                    union all
                    select t.plt_className, t.plt_parentclass from findAncestors f join plt_mdl_metaclass t on t.plt_className = f.plt_parentclass
                ) select distinct plt_className from findAncestors
            );
        end if;
    END;
$$;


-- formComponent分支
-- 新增plt_mdl_formcomponentgroup
CREATE TABLE IF NOT EXISTS plt_mdl_formcomponentgroup (
                                                          plt_oid character varying(32) NOT NULL,
                                                          plt_createtime timestamp without time zone DEFAULT statement_timestamp(),
                                                          plt_creator character varying(32),
                                                          plt_lastmodifytime timestamp without time zone DEFAULT statement_timestamp(),
                                                          plt_lastmodifier character varying(32),
                                                          plt_order integer,
                                                          plt_name character varying(32) NOT NULL,
                                                          plt_displayname character varying(15),
                                                          plt_ishidden boolean default false,
                                                          plt_issystem boolean default false,
                                                          CONSTRAINT plt_mdl_formcomponentgroup_pkey PRIMARY KEY (plt_oid)
);

-- 新增plt_mdl_formcomponent
CREATE TABLE IF NOT EXISTS plt_mdl_formcomponent (
                                                     plt_oid character varying(32) NOT NULL,
                                                     plt_createtime timestamp without time zone DEFAULT statement_timestamp(),
                                                     plt_creator character varying(32),
                                                     plt_lastmodifytime timestamp without time zone DEFAULT statement_timestamp(),
                                                     plt_lastmodifier character varying(32),
                                                     plt_order integer,
                                                     plt_name character varying(32) NOT NULL,
                                                     plt_displayname character varying(10),
                                                     plt_formcomponentgroupoid character varying(32),
                                                     plt_note character varying,
                                                     plt_icon character varying,
                                                     plt_path character varying,
                                                     plt_module character varying(32),
                                                     plt_ishidden boolean default false,
                                                     plt_issystem boolean default false,
                                                     CONSTRAINT plt_mdl_formcomponent_pkey PRIMARY KEY (plt_oid)
);

-- 默认控件分组
DO $$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponentgroup WHERE plt_oid = 'B510B2568011419EA66BAFE8199CCDAB') THEN
            insert into plt_mdl_formcomponentgroup(plt_oid, plt_order, plt_name, plt_displayname, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('B510B2568011419EA66BAFE8199CCDAB', 0, 'addins_layout', '布局', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('E83EAB8AE43D4B6CA4AE61519F7D53CB', 1, 'addins_single', '单对象控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0C7700E513614DE28DD7FC3E5F9488DB', 2, 'addins_multi', '多对象控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0360AC2A661F49A9AA2BF502730D28E3', 3, 'addins_visual', '可视化控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('6DBC618801CD4D529EADFA9889235FC6', 4, 'addins_model', '模型点选控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('09AFB0EAB135492A81E79761B623B58D', 5, 'addins_code', '编码扩展', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('E12935C520054A74B65E8FC8AC1B9994', 6, 'addins_timeseries', 'IoTDB专用控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('282D4D0CC41242FF80259CB3EBB20A63', 7, 'addins_collect', 'HTML/VUE收藏控件', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('44F28AC3854D4FE29046100B4157292A', 8, 'addins_search', '查询框控件', true, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
    END;
$$;

-- 默认控件
DO $$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '3225EE822A134C409F83AB5D4A749FEE') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('3225EE822A134C409F83AB5D4A749FEE', 0, 'col', '单列', '单列', '&#xe6a7', 'form/col.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('7ED7C0C7ACEA4E499EB0572EA2C1F17D', 1, 'row', '多列', '多列', '&#xe6b9', 'form/row.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('9D00E97CC18C48A694FEC05976425313', 2, 'colRows', '多行', '多行', '&#xe6a9', 'form/colRows.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('DC9121EE1D664F12B803A98341A9932E', 3, 'Tab', '标签页', '标签页', '&#xe62a', 'form/Tab.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('5AFAFDA6EA044AC99B64F939A4326D68', 4, 'GroupBox', '分组框', '分组框', '&#xe631', 'form/GroupBox.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('423B4A3D0E0D4EE1BE578DFEF0AF037C', 5, 'DragLayout', '拖拽池', '拖拽池', '&#xe6a0', 'form/DragLayout.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('F8649F1DCB224D42BDFB2A82A6CBDEEB', 6, 'DragItem', '拖拽块', '拖拽块', '&#xe69f', 'form/DragItem.vue', 'form/layout', 'B510B2568011419EA66BAFE8199CCDAB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = 'F4C1F205CE4C431BB0FCA278A5CB91F2') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('F4C1F205CE4C431BB0FCA278A5CB91F2', 0, 'Operation', '按钮', '按钮', '&#xe62f', 'form/Operation.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('BD1709780606457F90889F792F88CC3C', 1, 'TextInput', '文本框', '文本框', '&#xe624', 'form/TextInput.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('CCA3CCF6D3C244C7A418412E0FE00583', 2, 'NumberInput', '数字框', '数字框', '&#xe628', 'form/NumberInput.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('7BF24312C2174D0D94BDBC43C0A245DD', 3, 'DateInput', '日期框', '日期框', '&#xe62b', 'form/DateInput.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0E7C14F1A9C448B6AE995234A006DDD6', 4, 'RadioButton', '单选框', '单选框', '&#xe621', 'form/RadioButton.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('A7A84C0A5A51419BA8235A7CCD4C68D3', 5, 'CheckBox', '复选框', '复选框', '&#xe61f', 'form/CheckBox.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('F33B1670FAA94B97ABCA1EF484E3BC96', 6, 'SelectInput', '选择框', '选择框', '&#xe644', 'form/SelectInput.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('E53323108EEC4A3BB8303F75C9F8C815', 7, 'RichTextEditor', '富文本', '富文本', '&#xe68c', 'form/RichTextEditor.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('55245B4C211C43238EE0F5C44DB40D07', 8, 'Label', '文本标签', '文本标签', '&#xe619', 'form/Label.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('9059333F291E48D389CEC21B18BFAFE5', 9, 'MultiObjectsTag', '对象标签', '对象标签', '&#xe6b8', 'form/MultiObjectsTag.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('1EE572FD03984D5F800D2992B39A3777', 10, 'Attachments', '上传文件', '上传文件', '&#xe656', 'form/Attachments.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('CB5ED06B27B74D2D836F51049C6C4478', 11, 'MultiFilesList', '多文件上传', '多文件上传', '&#xe6c4', 'form/MultiFilesList.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('296CFE2B55F648C3A1904AA21249261D', 12, 'ProgressBar', '进度条', '进度条', '&#xe618', 'form/ProgressBar.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('5BF7506A78544D12A3D398242D4C37F2', 13, 'HyperLink', '超链接', '超链接', '&#xe62d', 'form/HyperLink.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0CF86A4CE53344CE969FF0093DA63216', 14, 'Switch', '开关', '开关', '&#xe623', 'form/Switch.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('E7E520BC29DC46DD89DD848AFC6685AF', 15, 'D_Rate', '评分', '评分', '&#xe645', 'form/D_Rate.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('BB7D648E07764B748BA607C501BE96D9', 16, 'Liked', '点赞', '点赞', '&#xe651', 'form/Liked.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('8FADBBC04E544B809B19B37546ED3061', 17, 'icon', '图标', '图标', '&#xe69a', 'form/icon.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('29FC45241FA840AFACCA386FE8CC128B', 18, 'DynamicParameterFrame', '动态参数', '动态参数', '&#xe699', 'form/DynamicParameterFrame.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('3FFAA7673AFA42D6BA8CF9D2F6342452', 19, 'CompoundLabel', '静态标签', '静态标签', '&#xe6c9', 'form/CompoundLabel.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('3A5516F6C0F2454C80A601807B11F061', 20, 'Iframe', '嵌入网页', '嵌入网页', '&#xe612', 'form/Iframe.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('905A70D42A2A4733B3163FC1DF38D07F', 21, 'SingleObjectSelector', '对象选择', '对象选择', '&#xe647', 'form/SingleObjectSelector.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', true, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('201CA349D22246EF91957C42F7AE2240', 22, 'SingleObjectModal', '对象弹窗', '对象弹窗', '&#xe630', 'form/SingleObjectModal.vue', 'form/single', 'E83EAB8AE43D4B6CA4AE61519F7D53CB', true, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '2610EC110F834327A5E72C09B2A1AE9C') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('2610EC110F834327A5E72C09B2A1AE9C', 0, 'Grid', '表格', '表格', '&#xe637', 'form/Grid.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('01C5680148374C379EC920DC9353DD9C', 1, 'SearchBox', '查询框', '查询框', '&#xe646', 'form/SearchBox.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('F3266EC225304E8CB13711E6588EDEF4', 2, 'FormEngine', '卡片', '卡片', '&#xe624', 'form/FormEngine.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('96A0DAB455894693A81044D592F3BE68', 3, 'MultiObjPicture', '多媒体', '多媒体', '&#xe66b', 'form/MultiObjPicture.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('9271F801815241CFB3416369D48BFD04', 4, 'JoinCascaderTree', '级联点选', '级联点选', '&#xe6c5', 'form/JoinCascaderTree.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('DB9D68DE09F24B08A3A9A44ABB92F0FE', 5, 'SelfJoinsTree', '目录树', '目录树', '&#xe6c8', 'form/SelfJoinsTree.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('E011AD7D596E4E109D6A7737990127A3', 6, 'RelationTree', '关联结构树', '关联结构树', '&#xe676', 'form/RelationTree.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('ACDB2FE9F74D4FFE80D59E80DBF7A3CD', 7, 'WatchMessage', '消息订阅', '消息订阅', '&#xe6c2', 'form/WatchMessage.vue', 'form/multi', '0C7700E513614DE28DD7FC3E5F9488DB', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = 'D5D11AD577174DF691A435B9F23CCA3E') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('D5D11AD577174DF691A435B9F23CCA3E', 0, 'EchartBar', '混合图', '混合图', '&#xe6aa', 'form/EchartBar.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('6E4F573C72D4403EA73F9B0D6F480D00', 1, 'PieChart', '饼状图', '饼状图', '&#xe64c', 'form/_PieChart.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('589E9E38A5DC44F4894D8836C6B7C27F', 2, 'GaugeChart', '仪表盘', '仪表盘', '&#xe665', 'form/_GaugeChart.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('1AB1ABCABFF94F64B26140A28E707735', 3, 'ScatterChart', '散点图', '散点图', '&#xe65a', 'form/_ScatterChart.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('63C27F45BA204D05B0596046BEC59AD2', 4, 'DynamicDigitalLabel', '动态数字', '动态数字', '&#xe68d', 'form/DynamicDigitalLabel.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('53D2C32B58B04F628D2C1E394FF4A7A6', 5, 'DynamicMap', '百度地图', '百度地图', '&#xe69b', 'form/DynamicMap.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('FCA519BCE6A043E48895035F7F1F3EAC', 6, 'MapChart', '省份地图', '省份地图', '&#xe658', 'form/MapChart.vue', 'form/visual', '0360AC2A661F49A9AA2BF502730D28E3', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '5CFE41B0E3C044088A6B583680EF51B1') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('5CFE41B0E3C044088A6B583680EF51B1', 0, 'OrgUserSelect', '组织用户', '组织用户', '&#xe6a1', 'form/OrgUserSelect.vue', 'form/model', '6DBC618801CD4D529EADFA9889235FC6', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0A302AF91DAB449394AA8334DA8DEAB6', 1, 'EntitiesAttrSelect', '类属性点选器', '类属性点选器', '&#xe6b0', 'form/EntitiesAttrSelect.vue', 'form/model', '6DBC618801CD4D529EADFA9889235FC6', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('CDA4F3D8A781475988264B7FB5A7A865', 2, 'FormSelect', '表单模型', '表单模型', '&#xe6c7', 'form/FormSelect.vue', 'form/model', '6DBC618801CD4D529EADFA9889235FC6', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '5DFA9EF1E2E14CBEAFD16F0E8B67C58D') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('5DFA9EF1E2E14CBEAFD16F0E8B67C58D', 0, 'EChart', 'Echarts', 'Echarts扩展', '&#xe69e', 'form/EChart.vue', 'form/code', '09AFB0EAB135492A81E79761B623B58D', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('8F13025768C44A9E8540AD8392228B11', 1, 'SelfCode', 'Html', 'Html扩展', '&#xe69d', 'form/SelfCode.vue', 'form/code', '09AFB0EAB135492A81E79761B623B58D', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = 'EEC144910B2A40D3BD54D03B312EDA6B') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('EEC144910B2A40D3BD54D03B312EDA6B', 0, 'TimeSeriesSelect', '时序点选', '时序点选', '&#xe655', 'form/TimeSeriesSelect.vue', 'form/timeseries', 'E12935C520054A74B65E8FC8AC1B9994', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('F617D890BBAC4CC98310AFE2D2C1431F', 1, 'TimeSeriesCharts', '时序图表', '时序图表', '&#xe6c6', 'form/TimeSeriesCharts.vue', 'form/timeseries', 'E12935C520054A74B65E8FC8AC1B9994', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('34F12039483443F0849EEC6965A735EA', 2, 'TimeSeriesBoard', '时序看板', '时序看板', '&#xe6c3', 'form/TimeSeriesBoard.vue', 'form/timeseries', 'E12935C520054A74B65E8FC8AC1B9994', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '0B9BB39DAF8D41F4B6D59EBE60ABF02C') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('0B9BB39DAF8D41F4B6D59EBE60ABF02C', 0, 'DateSInput', '日期范围选择框', '日期范围选择框', '', 'form/DateSInput.vue', 'form/search', '44F28AC3854D4FE29046100B4157292A', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('69667E1EBEE4486095C61ADE9CC883BF', 1, 'SelectSInput', '查询框用动态选择框', '查询框用动态选择框', '', 'form/SelectSInput.vue', 'form/search', '44F28AC3854D4FE29046100B4157292A', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('0313028D8BA74C818F9EC815079C0BA7', 2, 'NumbersInput', '数字范围选择框', '数字范围选择框', '', 'form/NumbersInput.vue', 'form/search', '44F28AC3854D4FE29046100B4157292A', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0'),
            ('DF40A61F96F348FCA02BE89609E759C2', 3, 'SingleObjectSelectors', '对象选择框', '对象选择框', '', 'form/SingleObjectSelectors.vue', 'form/search', '44F28AC3854D4FE29046100B4157292A', false, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
        IF NOT EXISTS (SELECT * FROM plt_mdl_formcomponent WHERE plt_oid = '0218EB8912814C248FDB50CEE5703D1E') THEN
            insert into plt_mdl_formcomponent(plt_oid, plt_order, plt_name, plt_displayname, plt_note, plt_icon, plt_path, plt_module, plt_formcomponentgroupoid, plt_ishidden, plt_issystem, plt_createtime, plt_creator, plt_lastmodifytime, plt_lastmodifier) values
            ('0218EB8912814C248FDB50CEE5703D1E', 0, 'IconUnit', '控件图标', '控件图标', '', 'form/IconUnit.vue', 'form/iconunit', '282D4D0CC41242FF80259CB3EBB20A63', true, true, statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0');
        END IF;
    END;
$$;


select sys_dbversions_update('2021-01-13 17:50:00'::timestamp, '20201231-bda9d4e01'::varchar, 'update-4.1_to_4.2.sql'::varchar, '4.1'::varchar, '4.2'::varchar, '20210208-8722e3ce1'::varchar, ''::varchar);
