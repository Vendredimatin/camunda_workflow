-- clearPG分支
drop table if exists plt_cus_condition;
drop table if exists plt_cus_participant;
drop table if exists plt_cus_printtemplate;
drop table if exists plt_cus_rule;
drop table if exists plt_mdl_metaresource;
drop table if exists plt_mdl_metabizitem;
drop table if exists plt_mdl_debugmodelscript;
drop table if exists plt_mdl_entity2server;
drop table if exists plt_cus_resource;
drop table if exists plt_mdl_r_res2class2attr;
drop table if exists plt_org_role;
drop table if exists plt_mdl_resfilter;
drop table if exists plt_org_role2project;
drop table if exists plt_org_r_participant2rp;
drop table if exists plt_org_project;
drop table if exists plt_qry_action;
drop table if exists plt_qry_contype;
delete from plt_mdl_metaclass where plt_classcategory = 'ResourceClass';
delete from plt_mdl_r_class2attribute where plt_classname is null;

-- workflow分支
-- 流程模型类删除
delete from plt_mdl_metaclass where plt_oid = '5C89F5702EBAAB43BAC0E4A711436410';
-- 流程建模、流程监控操作删除
delete from plt_fpt_queryoprconfig where plt_oid = '1C7D4072F6C5EB4A8E28FA780C47EB6F' or plt_oid = '900FA8977377CD4188D36FC85817E619';
-- 类、操作的授权项删除
delete from plt_mdl_authorityitem where plt_authorityid = 'WorkflowModel' or plt_authorityid = 'WfAdmin' or plt_authorityid = 'WfModeler';

-- queryOpr分支
-- queryoprconfig增加属性oprScript
DO $$
    BEGIN
        alter table if exists plt_fpt_queryoprconfig add column plt_oprscript text;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column plt_oprscript already exists in plt_fpt_queryoprconfig';
    END;
$$;
-- queryoprconfig增加属性implementType
DO $$
    BEGIN
        alter table if exists plt_fpt_queryoprconfig add column plt_implementtype character varying(50);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column plt_implementtype already exists in plt_fpt_queryoprconfig';
    END;
$$;
-- 所有脚本数据统一到oprScript
DO
$$
    DECLARE
        eachOid varchar;
        oprOids varchar[] := ARRAY(select plt_oid FROM plt_fpt_queryoprconfig)::varchar[];
        params varchar;
        expre varchar;
        script varchar;
        impServerScript varchar;
        impClientScript varchar;
        appBeforeScript varchar;
        appAfterScript varchar;
    BEGIN
        IF (select distinct plt_oprscript from plt_fpt_queryoprconfig limit 1) is null then
            FOREACH eachOid IN ARRAY oprOids
                LOOP
                    -- insert into test (test) values ('------ oid ------ ' || eachOid);
                    params := (select plt_params from plt_fpt_queryoprconfig where plt_oid = eachOid);
                    expre := (select plt_conditionexpre from plt_fpt_queryoprconfig where plt_oid = eachOid);

                    -- insert into test (test) values ('params --- ' || params);
                    -- insert into test (test) values ('expre --- ' || expre);

                    -- script := '{"implement":{"entry":"___IMP_entry_placeholder___","client":{"default":"___IMP_clientScript_placeholder___"},"server":{"default":"___IMP_serverScript_placeholder___"}},"appBefore":{"entry":"___APP_beforeEntry_placeholder___","client":{"default":"___APP_beforeScript_placeholder___"},"server":{"default":""}},"appAfter":{"entry":"___APP_afterEntry_placeholder___","client":{"default":"___APP_afterScript_placeholder___"},"server":{"default":""}}}';
                    script := '{"implement":{"entry":"___IMP_entry_placeholder___","client":{"default":{"script":"___IMP_clientScript_placeholder___","displayName":"默认impClient操作"}},"server":{"default":{"script":"___IMP_serverScript_placeholder___","displayName":"默认impServer操作"}}},"appBefore":{"entry":"___APP_beforeEntry_placeholder___","client":{"default":{"script":"___APP_beforeScript_placeholder___","displayName":"默认appBeforeClient操作"}},"server":{"default":{"script":"","displayName":"默认appBeforeServer操作"}}},"appAfter":{"entry":"___APP_afterEntry_placeholder___","client":{"default":{"script":"___APP_afterScript_placeholder___","displayName":"默认appAfterClient操作"}},"server":{"default":{"script":"","displayName":"默认appAfterServer操作"}}}}';
                    impServerScript := '';
                    impClientScript := '';
                    appBeforeScript := '';
                    appAfterScript := '';

                    IF (SELECT substring(plt_conditionexpre, 'serverScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        impServerScript := (SELECT substring(plt_conditionexpre, 1 + length('serverScript:')) FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid);
                        IF (select position(E'\r\n' in impServerScript)) = 0 THEN
                            impServerScript := (select replace(impServerScript, E'\n', E'\\n'));
                        ELSE
                            impServerScript := (select replace(impServerScript, E'\r\n', E'\\r\\n'));
                        END IF;
                        script := (select replace(script, '___IMP_entry_placeholder___', 'server'));
                        -- insert into test (test) values ('impServerScript --- ' || impServerScript);
                    END IF;

                    IF (SELECT substring(plt_conditionexpre, 'clientScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        impClientScript := (SELECT substring(plt_conditionexpre, 1 + length('clientScript:')) FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid);
                        IF (select position(E'\r\n' in impClientScript)) = 0 THEN
                            impClientScript := (select replace(impClientScript, E'\n', E'\\n'));
                        ELSE
                            impClientScript := (select replace(impClientScript, E'\r\n', E'\\r\\n'));
                        END IF;
                        script := (select replace(script, '___IMP_entry_placeholder___', 'client'));
                        -- insert into test (test) values ('impClientScript --- ' || impClientScript);
                    END IF;

                    IF (SELECT substring(plt_params, 'APP_beforeScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        appBeforeScript := (SELECT substring(plt_params from 'APP_beforeScript:(.*)APP_afterScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid);
                        appAfterScript := (SELECT substring(plt_params from 'APP_afterScript:(.*)') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid);
                        IF (select position(E'\r\n' in appBeforeScript)) = 0 THEN
                            appBeforeScript := (select replace(appBeforeScript, E'\n', E'\\n'));
                        ELSE
                            appBeforeScript := (select replace(appBeforeScript, E'\r\n', E'\\r\\n'));
                        END IF;
                        IF (select position(E'\r\n' in appAfterScript)) = 0 THEN
                            appAfterScript := (select replace(appAfterScript, E'\n', E'\\n'));
                        ELSE
                            appAfterScript := (select replace(appAfterScript, E'\r\n', E'\\r\\n'));
                        END IF;
                        script := (select replace(script, '___APP_beforeEntry_placeholder___', 'client'));
                        script := (select replace(script, '___APP_afterEntry_placeholder___', 'client'));
                        -- appBeforeScript := (SELECT substring(plt_params from '(.*)(?=APP_afterScript:)') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid);
                        -- appBeforeScript := (SELECT substring(appBeforeScript, 1 + length('clientScript:'));
                        -- insert into test (test) values ('appBeforeScript --- ' || appBeforeScript);
                        -- insert into test (test) values ('appAfterScript --- ' || appAfterScript);
                    END IF;

                    script := (select replace(script, '___IMP_entry_placeholder___', ''));
                    script := (select replace(script, '___APP_beforeEntry_placeholder___', ''));
                    script := (select replace(script, '___APP_afterEntry_placeholder___', ''));
                    script := (select replace(script, '___IMP_serverScript_placeholder___', replace(impServerScript, '"', '\"')));
                    script := (select replace(script, '___IMP_clientScript_placeholder___', replace(impClientScript, '"', '\"')));
                    script := (select replace(script, '___APP_beforeScript_placeholder___', replace(appBeforeScript, '"', '\"')));
                    script := (select replace(script, '___APP_afterScript_placeholder___', replace(appAfterScript, '"', '\"')));
                    -- insert into test (test) values ('script --- ' || script);
                    -- insert into test (testtest) values (script);
                    update plt_fpt_queryoprconfig set plt_oprscript = script where plt_oid = eachOid;

                END LOOP;
        END IF;
    END
$$;
-- oprscript初始化
alter table if exists plt_fpt_queryoprconfig alter column plt_oprscript set default '{"implement":{"entry":"","client":{"default":{"script":"","displayName":"默认impClient操作"}},"server":{"default":{"script":"","displayName":"默认impServer操作"}}},"appBefore":{"entry":"","client":{"default":{"script":"","displayName":"默认appBeforeClient操作"}},"server":{"default":{"script":"","displayName":"默认appBeforeServer操作"}}},"appAfter":{"entry":"","client":{"default":{"script":"","displayName":"默认appAfterClient操作"}},"server":{"default":{"script":"","displayName":"默认appAfterServer操作"}}}}';
-- implement和global_implement操作类型维护到implementType
DO
$$
    DECLARE
        eachOid varchar;
        oprOids varchar[] := ARRAY(select plt_oid FROM plt_fpt_queryoprconfig where plt_action = 'implement' or plt_action = 'global_implement')::varchar[];
        expre varchar;
        updated boolean;
    BEGIN
        IF (select distinct plt_implementtype from plt_fpt_queryoprconfig where plt_action = 'implement' or plt_action = 'global_implement' order by plt_implementtype desc limit 1) is null then
            FOREACH eachOid IN ARRAY oprOids
                LOOP
                    expre := (select plt_conditionexpre from plt_fpt_queryoprconfig where plt_oid = eachOid);
                    updated := false;

                    IF not updated and (SELECT substring(plt_conditionexpre, 'serverScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        update plt_fpt_queryoprconfig set plt_implementtype = 'serverScript' where plt_oid = eachOid;
                        updated := true;
                    END IF;
                    IF not updated and (SELECT substring(plt_conditionexpre, 'clientScript:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        update plt_fpt_queryoprconfig set plt_implementtype = 'clientScript' where plt_oid = eachOid;
                        updated := true;
                    END IF;
                    IF not updated and (SELECT substring(plt_conditionexpre, 'addin:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        update plt_fpt_queryoprconfig set plt_implementtype = 'addin' where plt_oid = eachOid;
                        updated := true;
                    END IF;
                    IF not updated and (SELECT substring(plt_conditionexpre, 'procedure:') FROM plt_fpt_queryoprconfig WHERE plt_oid = eachOid) is not null THEN
                        update plt_fpt_queryoprconfig set plt_implementtype = 'procedure' where plt_oid = eachOid;
                        updated := true;
                    END IF;
                    IF not updated THEN
                        update plt_fpt_queryoprconfig set plt_implementtype = 'addinAlias' where plt_oid = eachOid;
                        updated := true;
                    END IF;
                END LOOP;
        end if;
    END
$$;

-- formTemplate分支
-- 新增类CustomViewTemplate
drop table if exists plt_mdl_customviewtemplate;
CREATE TABLE if not exists public.plt_mdl_customviewtemplate (
                                                                 plt_oid character varying(32) NOT NULL,
                                                                 plt_content text,
                                                                 plt_v3content text,
                                                                 plt_widgetannotation text,
                                                                 plt_basicinfo text,
                                                                 plt_devicetype character varying(32) DEFAULT 'actPc'::character varying NOT NULL,
                                                                 plt_formtype character varying(32) DEFAULT 'PC'::character varying NOT NULL,
                                                                 plt_templatename character varying(1024) NOT NULL,
                                                                 plt_thumbnail bytea,
                                                                 plt_icon character varying,
                                                                 plt_displayname character varying(500),
                                                                 plt_note character varying(500),
                                                                 plt_createtime timestamp without time zone,
                                                                 plt_creator character varying(32),
                                                                 plt_lastmodifytime timestamp without time zone DEFAULT now() NOT NULL,
                                                                 plt_lastmodifier character varying(32),
                                                                 CONSTRAINT plt_mdl_customviewtemplate_pkey PRIMARY KEY (plt_oid)
);
-- DataDict增加4个默认字段
DO $$
    BEGIN
        BEGIN
            alter table if exists plt_mdl_datadict add column plt_lastmodifier character varying(32);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifier already exists in plt_mdl_datadict';
        END;
        BEGIN
            alter table if exists plt_mdl_datadict add column plt_creator character varying(32);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_creator already exists in plt_mdl_datadict';
        END;
        BEGIN
            alter table if exists plt_mdl_datadict add column plt_lastmodifytime timestamp without time zone DEFAULT now() NOT NULL;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifytime already exists in plt_mdl_datadict';
        END;
        BEGIN
            alter table if exists plt_mdl_datadict add column plt_createtime timestamp without time zone DEFAULT now() NOT NULL;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_createtime already exists in plt_mdl_datadict';
        END;
    END;
$$;
-- DataDict新增3个默认view
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_customview WHERE plt_oid = '5C5A58F5A8796D49B02CF6D4D0417FE1') THEN
            delete from plt_mdl_customview where plt_classname = 'DataDict' and (plt_viewname = 'DataDictKeyValueAdd' or plt_viewname = 'DataDictTypeAdd' or plt_viewname = 'DataDictMgn');
            insert into plt_mdl_customview (plt_oid, plt_classname, plt_viewname, plt_displayname, plt_note, plt_devicetype, plt_v3content, plt_basicinfo, plt_modifytime, plt_createtime, plt_creator, plt_lastmodifier, plt_widgetannotation)
            values ('5C5A58F5A8796D49B02CF6D4D0417FE1', 'DataDict', 'DataDictKeyValueAdd', '字典取值', '', 'actPc',
                    '{"data":{"elements":[{"self":{"elementType":"addin_col","properties":{"id":"col1","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"083EB62002054A62BF493D30B0684DD3","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"083EB62002054A62BF493D30B0684DD3","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_TextInput","properties":{"dynamic":false,"needCheckDuplic":false,"defaultValue":"","label_color":"initial","main_fontColor":"initial","main_color":"initial","title":"文本框","id":"TextInput1","size":"default","type":"text","placeholder":"","clearable":false,"readonly":false,"required":true,"hided":false,"icon":"","value":"","label_width":1,"main_width":4,"label_align":7,"main_align":1,"maxAreaRow":2,"rule":"","ruleMessage":"","prefixIcon":"","suffixIcon":"","label":"键值","name":"key","targetDataType":"String","height":30,"heightType":"px","width":100,"widthType":"%","label_fontColor":"initial","txt_fontColor":"initial","txt_bgColor":"#fff","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","col":true,"rows":3,"cols":3,"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"失去焦点"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"获得焦点"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","失去焦点","鼠标悬停","获得焦点","值校验"],"structural_layout":"horizontal","uuid":"505B1A4E14BA4E4E944A8F22D7C8A34F","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"505B1A4E14BA4E4E944A8F22D7C8A34F","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col2","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"76A3D174262E40CD92F09F80629409EE","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"76A3D174262E40CD92F09F80629409EE","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_TextInput","properties":{"dynamic":false,"needCheckDuplic":false,"defaultValue":"","label_color":"initial","main_fontColor":"initial","main_color":"initial","title":"文本框","id":"TextInput2","size":"default","type":"text","placeholder":"","clearable":false,"readonly":false,"required":true,"hided":false,"icon":"","value":"","label_width":1,"main_width":4,"label_align":7,"main_align":1,"maxAreaRow":2,"rule":"","ruleMessage":"","prefixIcon":"","suffixIcon":"","label":"显示名","name":"label","targetDataType":"String","height":30,"heightType":"px","width":100,"widthType":"%","label_fontColor":"initial","txt_fontColor":"initial","txt_bgColor":"#fff","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","col":true,"rows":3,"cols":3,"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"失去焦点"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"获得焦点"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","失去焦点","鼠标悬停","获得焦点","值校验"],"structural_layout":"horizontal","uuid":"7C65F26753994420955D90CF1EBA6F5A","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"7C65F26753994420955D90CF1EBA6F5A","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col3","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"D550F8DE3D5C49F28D13945C6860E073","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"D550F8DE3D5C49F28D13945C6860E073","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_NumberInput","properties":{"dynamic":false,"needCheckDuplic":false,"defaultValue":1,"rule":"","label_fontColor":"initial","txt_fontColor":"initial","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","txt_bgColor":"#fff","label_color":"initial","main_fontColor":"initial","main_color":"initial","id":"NumberInput1","title":"数字输入框","max":1.7976931348623157e+308,"min":-1.7976931348623157e+308,"step":1,"placeholder":"数字输入框","required":false,"readonly":false,"ruleMessage":"","hided":false,"label":"排序","name":"order","label_width":1,"main_width":4,"label_align":7,"main_align":1,"targetDataType":"Integer","width":100,"widthType":"%","height":30,"heightType":"px","col":true,"rows":0,"cols":0,"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"失去焦点"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"获得焦点"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","失去焦点","鼠标悬停","获得焦点","值校验"],"structural_layout":"horizontal","uuid":"06F29C507D4E4A60B8B52BFA3AF3C8D6","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"06F29C507D4E4A60B8B52BFA3AF3C8D6","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col4","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"5A89B20D8B2A4B32882394B81A5BD630","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"5A89B20D8B2A4B32882394B81A5BD630","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_SelectInput","properties":{"dynamic":false,"defaultValue":"","bindTargetClass":"DataDict&e","filterQuery":"and obj.key is null","useDictionary":true,"noNumber":true,"labelAttr":["type","desc"],"valueAttr":["type"],"label_fontColor":"initial","txt_fontColor":"initial","txt_bgColor":"#fff","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","width":100,"widthType":"%","label_color":"initial","main_fontColor":"initial","main_color":"initial","title":"选择框","id":"SelectInput2","_id":"0","style":"","label_width":1,"main_width":4,"label_align":7,"main_align":1,"_type":"attribute","required":true,"readonly":false,"hided":false,"label":"字典类型","name":"type","targetDataType":"String","height":30,"heightType":"px","col":true,"cols":3,"selfOptions":"","selectDis":false,"selectMuti":false,"selectFilt":false,"selectList":[],"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","鼠标悬停","值校验"],"structural_layout":"horizontal","uuid":"8CDFC9A0DA9C4FDFB435BB6D73215C64","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"8CDFC9A0DA9C4FDFB435BB6D73215C64","DWFADDINARGSVERSION":1},"elements":[]}]}],"targetClass":"DataDict","isRelation":false,"basicArgs":{},"deviceType":"actPc"}}',
                    '{"label_width":1,"main_width":4,"label_align":7,"main_align":1,"row_space":0,"col_space":0,"label_fontColor":"initial","txt_fontColor":"initial","form_bgColor":"#fff","form_fsize":14,"form_font_size":"14px","lfsize":14,"fsize":14,"label_align_horizontal":"2","label_align_vertical":"1","main_align_horizontal":"1","defaultMultiAddin":"","labelWidthUnit":"px","label_widthByPx":200}',
                    statement_timestamp(), statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0', '{}'),
                   ('1E72DAC2842753498D7577F3A1D3C337', 'DataDict', 'DataDictTypeAdd', '新增数据字典', '', 'actPc',
                    '{"data":{"elements":[{"self":{"elementType":"addin_col","properties":{"id":"col1","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"54E5C831618543CA95E914F4171CEF16","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"54E5C831618543CA95E914F4171CEF16","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_TextInput","properties":{"dynamic":false,"needCheckDuplic":false,"defaultValue":"","label_color":"initial","main_fontColor":"initial","main_color":"initial","title":"文本框","id":"TextInput1","size":"default","type":"text","placeholder":"","clearable":false,"readonly":false,"required":true,"hided":false,"icon":"","value":"","label_width":1,"main_width":4,"label_align":7,"main_align":1,"maxAreaRow":2,"rule":"","ruleMessage":"","prefixIcon":"","suffixIcon":"","label":"类型","name":"type","targetDataType":"String","height":30,"heightType":"px","width":100,"widthType":"%","label_fontColor":"initial","txt_fontColor":"initial","txt_bgColor":"#fff","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","col":true,"rows":3,"cols":3,"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"失去焦点"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"获得焦点"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","失去焦点","鼠标悬停","获得焦点","值校验"],"structural_layout":"horizontal","uuid":"11115C45F9A4400386302EF08130EC2E","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"11115C45F9A4400386302EF08130EC2E","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col2","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"12DEF015BAAB4043A8CF17F5B93FCCAE","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"12DEF015BAAB4043A8CF17F5B93FCCAE","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_TextInput","properties":{"dynamic":false,"needCheckDuplic":false,"defaultValue":"","label_color":"initial","main_fontColor":"initial","main_color":"initial","title":"文本框","id":"TextInput2","size":"default","type":"text","placeholder":"","clearable":false,"readonly":false,"required":false,"hided":false,"icon":"","value":"","label_width":1,"main_width":4,"label_align":7,"main_align":1,"maxAreaRow":2,"rule":"","ruleMessage":"","prefixIcon":"","suffixIcon":"","label":"描述","name":"desc","targetDataType":"String","height":30,"heightType":"px","width":100,"widthType":"%","label_fontColor":"initial","txt_fontColor":"initial","txt_bgColor":"#fff","lfsize":14,"lfsizeType":"px","fsize":14,"fsizeType":"px","col":true,"rows":3,"cols":3,"events":[{"opr_path":"","opr_type":"","name":"值变化"},{"opr_path":"","opr_type":"","name":"失去焦点"},{"opr_path":"","opr_type":"","name":"鼠标悬停"},{"opr_path":"","opr_type":"","name":"获得焦点"},{"opr_path":"","opr_type":"","name":"值校验"}],"eventRange":["值变化","失去焦点","鼠标悬停","获得焦点","值校验"],"structural_layout":"horizontal","uuid":"CA74E9787CE3491FB6B1AD483CF36914","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"CA74E9787CE3491FB6B1AD483CF36914","DWFADDINARGSVERSION":1},"elements":[]}]}],"targetClass":"DataDict","isRelation":false,"basicArgs":{},"deviceType":"actPc"}}',
                    '{"label_width":1,"main_width":4,"label_align":7,"main_align":1,"row_space":0,"col_space":0,"label_fontColor":"initial","txt_fontColor":"initial","form_bgColor":"#fff","form_fsize":14,"form_font_size":"14px","lfsize":14,"fsize":14,"label_align_horizontal":"2","label_align_vertical":"1","main_align_horizontal":"1","defaultMultiAddin":"","labelWidthUnit":"px","label_widthByPx":200}',
                    statement_timestamp(), statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0', '{}'),
                   ('4C4DFEBB0573D448BCEA2FA364885D30', 'DataDict', 'DataDictMgn', '数据字典维护', '', 'actPc',
                    '{"data":{"elements":[{"self":{"elementType":"addin_row","properties":{"padding":true,"rpadding":10,"cpadding":0,"title":"多列","id":"row1","_id":"0","type":"flex","align":"middle","justify":"start","layoutBorder":{"color":"#000","type":"solid","width":"1px","show":false},"hided":false,"rows":1,"cols":2,"span":8,"offset":0,"push":0,"pull":0,"children":{"1":{"id":"1","type":"flex","align":"middle","justify":"start","cols":2},"1,1":{"id":"1,1","hideWidgetAnnotation":true,"span":12,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"},"1,2":{"id":"1,2","hideWidgetAnnotation":true,"span":12,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"}},"iCols":{"1":[{"id":"1,1"},{"id":"1,2"}]},"iRows":[{"id":"1"}],"label_align":7,"main_align":1,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"height":30,"heightType":"px","width":100,"widthType":"%","uuid":"15FB929E9B2B440DA70C370C6C4F7173"},"dropTarget":0,"uuid":"15FB929E9B2B440DA70C370C6C4F7173","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_row","properties":{"padding":true,"rpadding":10,"cpadding":0,"title":"多列","id":"row2","_id":"0","type":"flex","align":"middle","justify":"start","layoutBorder":{"color":"#000","type":"solid","width":"1px","show":false},"hided":false,"rows":1,"cols":2,"span":8,"offset":0,"push":0,"pull":0,"children":{"1":{"id":"1","type":"flex","align":"middle","justify":"start","cols":2},"1,1":{"id":"1,1","hideWidgetAnnotation":true,"span":6,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"},"1,2":{"id":"1,2","hideWidgetAnnotation":true,"span":18,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"}},"iCols":{"1":[{"id":"1,1"},{"id":"1,2"}]},"iRows":[{"id":"1"}],"label_align":7,"main_align":1,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"height":30,"heightType":"px","width":100,"widthType":"%","uuid":"712E3AA2D35D47EE9C5C7A52053574B4"},"dropTarget":"1,1","uuid":"712E3AA2D35D47EE9C5C7A52053574B4","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_Operation","properties":{"extend":false,"opr_path":"B741B5056FE75D43AD4C2BA7AFF1E49E","opr_name":"tip","type":"primary","shape":false,"width":"auto","widthType":"px","heightType":"px","height":34,"icon":"","text":"新增字典","opr_type":"query","auth":false,"auth_item":"newDict","disabled":false,"id":"Operation1","main_fontColor":"#fff","hided":false,"title":"按钮","col":true,"cols":3,"targetDataType":null,"chooseTable":["Grid1"],"events":[{"opr_path":"B741B5056FE75D43AD4C2BA7AFF1E49E","opr_type":"query","name":"单击"}],"eventRange":["单击"],"uuid":"EEC9793532724CCCBC0DDF1F015FFDDF"},"dropTarget":"1,1","uuid":"EEC9793532724CCCBC0DDF1F015FFDDF","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_Grid","properties":{"dynamic":false,"title":"表格","id":"Grid1","agGridTheme":"ag-theme-balham","columnDefs":[{"field":"_SNColumn","headerName":"#","editable":false,"suppressMovable":false,"suppressSizeToFit":true,"alignCode":4,"cellStyle":{"line-height":"40px;","text-align":"center","pointer-events":"auto"},"colId":"_SNColumn","width":80,"lockPosition":true,"operationParams":[],"menuTabs":["filterMenuTab"],"pinned":"left","checkboxSelection":false,"headerClass":"grid-header-center"},{"field":"type","attrCategory":"Variable","attrName":"type","attrValueType":"String","headerName":"类型","editable":false,"suppressMovable":false,"width":132,"widthType":"px","widthPercent":0,"uuid":"3D50BCFFF2FC384D9B3D6ECECF9ED969","colId":"type_id","alignCode":4,"enableFilter":true,"resizable":true,"compactMode":false,"menuTabs":["filterMenuTab"],"_cellRendererFramework":null,"cellStyle":{"text-align":"center","line-height":"40px;","pointer-events":"auto"},"headerClass":"grid-header-center","checkboxSelection":false},{"field":"desc","attrCategory":"Variable","attrName":"desc","attrValueType":"String","headerName":"描述","editable":false,"suppressMovable":false,"width":132,"widthType":"px","widthPercent":0,"uuid":"3BF2201169FFC348996A0510BD19BBE2","colId":"desc_id","alignCode":4,"enableFilter":true,"resizable":true,"compactMode":false,"menuTabs":["filterMenuTab"],"_cellRendererFramework":null,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","checkboxSelection":false},{"field":"_oprColumn","headerName":"操作列","editable":false,"suppressMovable":false,"suppressSizeToFit":true,"colId":"_oprColumn","width":"202","widthType":"px","widthPercent":22,"operationParams":[{"opr_path":"465908924C19F44382D9E5874B198277","opr_showMessage":true,"opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"编辑","opr_type":"query","auth":false,"auth_item":"editDict","color":"","disabled":false,"uniLabel":"编辑","uuid":"CB5B67AD99D2448F9F8586CC21D60578"},{"opr_path":"delete","opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"删除","opr_type":"sys","auth":false,"auth_item":"delete","color":"","disabled":false,"uniLabel":"删除","uuid":"DCB30093F17F4B93BF1635B8A0D1DDE6"},{"opr_path":"CA107E3381D8E447AC93C7EFA32EA00A","opr_showMessage":true,"opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"管理键值","opr_type":"query","auth":false,"auth_item":"keyValueMgn","color":"","disabled":false,"uniLabel":"管理键值","uuid":"F57D56F976FA491DB5222C0D1375BD6A","compactMode":false}],"menuTabs":["filterMenuTab"],"checkboxSelection":false,"alignCode":4,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","resizable":true,"sortable":true,"filter":true,"renderType":"operationRender","pinned":null,"_cellRendererFramework":"operationRender","cellRendererParams":{"opr_path":"CA107E3381D8E447AC93C7EFA32EA00A","opr_showMessage":true,"opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"管理键值","opr_type":"query","auth":false,"auth_item":"keyValueMgn","color":"","disabled":false,"uniLabel":"管理键值","uuid":"F57D56F976FA491DB5222C0D1375BD6A","compactMode":false},"isEditable":false}],"enableSorting":true,"enableFilter":true,"rowSelection":false,"colResiable":true,"rowDragManaged":true,"notEditable":false,"statusBar":false,"rangeSection":false,"statusBarConfig":{},"compactMode":false,"autoSize":true,"pageable":true,"enableCellChangeFlash":true,"enableExport":false,"width":100,"widthType":"%","heightType":"px","height":500,"rowHeight":40,"select_type":"obj","selected_attributes":["type","desc"],"selected_attributes_sort":[],"bindTargetClass":"DataDict&e","targetClass":"DataDict","oprTargetClass":"DataDict","filterQuery":"and obj.key is null","dbclk_type":"","dbclk_path":"","dbclk_del_alert":true,"dbclk_text":"","sgclk_text":"","sgclk_type":"","sgclk_path":"","sgclk_del_alert":true,"event_oprs":{"double_click":{"opr_path":null,"opr_type":""},"single_click":{"opr_path":null,"opr_type":""}},"pagination":true,"pageSize":25,"oprCol":true,"SNCol":true,"globalAlignCode":4,"oidNameMap":null,"refClass":"DataDict","classCategory":"ItemClass","events":[{"opr_path":"","opr_type":"","name":"初始化"},{"opr_path":"","opr_type":"","name":"前处理"},{"opr_path":"","opr_type":"","name":"翻页"},{"opr_path":"","opr_type":"","name":"鼠标悬浮Tooltip"},{"opr_path":"","opr_type":"","name":"单击"},{"opr_path":"","opr_type":"","name":"双击"}],"eventRange":["初始化","前处理","翻页","鼠标悬浮Tooltip","单击","双击"],"cacheGrid":false,"hided":false,"uuid":"D1643121E75A48B69B52404047C8808D"},"dropTarget":"1,1","uuid":"D1643121E75A48B69B52404047C8808D","DWFADDINARGSVERSION":1},"elements":[]},{"self":{"elementType":"addin_row","properties":{"padding":true,"rpadding":10,"cpadding":0,"title":"多列","id":"row3","_id":"0","type":"flex","align":"middle","justify":"start","layoutBorder":{"color":"#000","type":"solid","width":"1px","show":false},"hided":false,"rows":1,"cols":2,"span":8,"offset":0,"push":0,"pull":0,"children":{"1":{"id":"1","type":"flex","align":"middle","justify":"start","cols":2},"1,1":{"id":"1,1","hideWidgetAnnotation":true,"span":6,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"},"1,2":{"id":"1,2","hideWidgetAnnotation":true,"span":18,"offset":0,"push":0,"pull":0,"col":false,"topBorder":{"width":"0","color":"#000","style":"dashed"},"rightBorder":{"width":"0","color":"#000","style":"dashed"},"bottomBorder":{"width":"0","color":"#000","style":"dashed"},"leftBorder":{"width":"0","color":"#000","style":"dashed"},"alignItems":"flex-start","justifyContent":"flex-start"}},"iCols":{"1":[{"id":"1,1"},{"id":"1,2"}]},"iRows":[{"id":"1"}],"label_align":7,"main_align":1,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"height":30,"heightType":"px","width":100,"widthType":"%","uuid":"9134A12FD5B64FA8B99AFB2BD3A2F56A"},"dropTarget":"1,2","uuid":"9134A12FD5B64FA8B99AFB2BD3A2F56A","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_Operation","properties":{"extend":false,"opr_path":"F20CE09F5D22364C9B69DC7AD3258C77","opr_name":"tip","type":"primary","shape":false,"width":"auto","widthType":"px","heightType":"px","height":34,"icon":"","text":"新增键值","opr_type":"query","auth":false,"auth_item":"AddKeyValue","disabled":false,"id":"Operation2","main_fontColor":"#fff","hided":false,"title":"按钮","col":true,"cols":3,"targetDataType":null,"chooseTable":["Grid2"],"events":[{"opr_path":"F20CE09F5D22364C9B69DC7AD3258C77","opr_type":"query","name":"单击"}],"eventRange":["单击"],"uuid":"4A0E148E99114552A363AD88694A3087"},"dropTarget":"1,1","uuid":"4A0E148E99114552A363AD88694A3087","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_Grid","properties":{"dynamic":false,"title":"表格","id":"Grid2","agGridTheme":"ag-theme-balham","columnDefs":[{"field":"_SNColumn","headerName":"#","editable":false,"suppressMovable":false,"suppressSizeToFit":true,"alignCode":4,"cellStyle":{"line-height":"40px;","text-align":"center","pointer-events":"auto"},"colId":"_SNColumn","width":80,"lockPosition":true,"operationParams":[],"menuTabs":["filterMenuTab"],"pinned":"left","checkboxSelection":false,"headerClass":"grid-header-center"},{"field":"key","attrCategory":"Variable","attrName":"key","attrValueType":"String","headerName":"键值","editable":false,"suppressMovable":false,"width":88,"widthType":"px","widthPercent":0,"uuid":"46AE9468982D4D449FFEC2EECD84CF03","colId":"key_id","alignCode":4,"enableFilter":true,"resizable":true,"compactMode":false,"menuTabs":["filterMenuTab"],"_cellRendererFramework":null,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","checkboxSelection":false},{"field":"label","attrCategory":"Variable","attrName":"label","attrValueType":"String","headerName":"显示名","editable":false,"suppressMovable":false,"width":88,"widthType":"px","widthPercent":0,"uuid":"A31C58D746C0744CA786E03B7089445B","colId":"label_id","alignCode":4,"enableFilter":true,"resizable":true,"compactMode":false,"menuTabs":["filterMenuTab"],"_cellRendererFramework":null,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","checkboxSelection":false},{"field":"order","attrCategory":"Variable","attrName":"order","attrValueType":"Integer","headerName":"排序","editable":false,"suppressMovable":false,"width":88,"widthType":"px","widthPercent":0,"uuid":"0E15B3CFA8AFA4488353FC71EA08AF2E","colId":"order_id","alignCode":4,"enableFilter":true,"resizable":true,"compactMode":false,"menuTabs":["filterMenuTab"],"_cellRendererFramework":null,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","checkboxSelection":false},{"field":"_oprColumn","headerName":"操作列","editable":false,"suppressMovable":false,"suppressSizeToFit":true,"colId":"_oprColumn","width":102,"widthType":"px","widthPercent":22,"operationParams":[{"opr_path":"539903C5CFA2D04793C69D26E87DAC1E","opr_showMessage":true,"opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"编辑","opr_type":"query","auth":false,"auth_item":"editKeyValue","color":"","disabled":false,"uniLabel":"编辑","uuid":"602E4343818D460E9AB639E7111C66DE"},{"opr_path":"delete","opr_sys_path":"","name":"","style":"white","targetDataType":null,"type":"text","shape":false,"icon":"","text":"删除","opr_type":"sys","auth":false,"auth_item":"delete","color":"","disabled":false,"uniLabel":"删除","uuid":"3C08A793CD934C25A740F905326CA49B","compactMode":false}],"menuTabs":["filterMenuTab"],"checkboxSelection":false,"alignCode":4,"cellStyle":{"text-align":"center","line-height":"40px;"},"headerClass":"grid-header-center","resizable":true,"sortable":true,"filter":true,"renderType":"operationRender","pinned":null,"_cellRendererFramework":"operationRender","cellRendererParams":{"opr_path":"delete","opr_sys_path":"","name":"","style":{"border":"3pxdashedred","color":""},"targetDataType":null,"type":"text","shape":false,"icon":"","text":"删除","opr_type":"sys","auth":false,"auth_item":"delete","color":"","disabled":false,"uniLabel":"删除","uuid":"3C08A793CD934C25A740F905326CA49B","compactMode":false},"isEditable":false}],"enableSorting":true,"enableFilter":true,"rowSelection":false,"colResiable":true,"rowDragManaged":true,"notEditable":false,"statusBar":false,"rangeSection":false,"statusBarConfig":{},"compactMode":false,"autoSize":true,"pageable":true,"enableCellChangeFlash":true,"enableExport":false,"width":100,"widthType":"%","heightType":"px","height":500,"rowHeight":40,"select_type":"obj","selected_attributes":["key","label","order"],"selected_attributes_sort":[],"bindTargetClass":"DataDict&e","targetClass":"DataDict","oprTargetClass":"DataDict","filterQuery":"and 1!=1","dbclk_type":"","dbclk_path":"","dbclk_del_alert":true,"dbclk_text":"","sgclk_text":"","sgclk_type":"","sgclk_path":"","sgclk_del_alert":true,"event_oprs":{"double_click":{"opr_path":null,"opr_type":""},"single_click":{"opr_path":null,"opr_type":""}},"pagination":true,"pageSize":25,"oprCol":true,"SNCol":true,"globalAlignCode":4,"oidNameMap":null,"refClass":"DataDict","classCategory":"ItemClass","events":[{"opr_path":"","opr_type":"","name":"初始化"},{"opr_path":"","opr_type":"","name":"前处理"},{"opr_path":"","opr_type":"","name":"翻页"},{"opr_path":"","opr_type":"","name":"鼠标悬浮Tooltip"},{"opr_path":"","opr_type":"","name":"单击"},{"opr_path":"","opr_type":"","name":"双击"}],"eventRange":["初始化","前处理","翻页","鼠标悬浮Tooltip","单击","双击"],"cacheGrid":false,"hided":false,"uuid":"5D3087D539C84A1F947ECD79B3106288"},"dropTarget":"1,2","uuid":"5D3087D539C84A1F947ECD79B3106288","DWFADDINARGSVERSION":1},"elements":[]}]}],"targetClass":"DataDict","isRelation":false,"basicArgs":{},"deviceType":"actPc"}}',
                    '{"label_width":1,"main_width":4,"label_align":7,"main_align":1,"row_space":0,"col_space":0,"label_fontColor":"initial","txt_fontColor":"initial","form_bgColor":"#fff","form_fsize":14,"form_font_size":"14px","lfsize":14,"fsize":14,"label_align_horizontal":"2","label_align_vertical":"1","main_align_horizontal":"1","defaultMultiAddin":"","labelWidthUnit":"px","label_widthByPx":200}',
                    statement_timestamp(), statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0', '{}');
        END IF;
    END
$$;
-- MetaClass新增类DataDict
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = 'A718D3454FA9E540972C3D91C1C74454') THEN
            delete from plt_mdl_metaclass where plt_classname ~* 'DataDict';
            insert into plt_mdl_metaclass (plt_issystem, plt_state, plt_oid, plt_classcategory, plt_classname, plt_classtype, plt_displayname, plt_parentclass, plt_zonename, plt_modifytime)
            values (true, 1, 'A718D3454FA9E540972C3D91C1C74454', 'ItemClass', 'DataDict', 'PersistentClass', '数据字典', 'IdItem', 'MDL', statement_timestamp());
        END IF;
    END
$$;
-- 为类DataDict绑定属性
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_r_class2attribute WHERE plt_oid = 'A31C58D746C0744CA786E03B7089445B') THEN
            delete from plt_mdl_r_class2attribute where plt_classname = 'DataDict';
            insert into plt_mdl_r_class2attribute (plt_editable, plt_visible, plt_isunique, plt_oid, plt_attributename, plt_classname, plt_displayname, plt_modifytime, plt_nullable, plt_valuelength, plt_attributecategory, plt_valuetype, plt_isprimarykey, plt_isidentity, plt_isinform, plt_isintable, plt_isinquerybox, plt_order)
            values (true, true, false, 'A31C58D746C0744CA786E03B7089445B', 'label', 'DataDict', '显示名', statement_timestamp(), true, 50, 'Variable', 'String', false, false, false, true, true, 100),
                   (true, true, false, '46AE9468982D4D449FFEC2EECD84CF03', 'key', 'DataDict', '键值', statement_timestamp(), true, 50, 'Variable', 'String', false, false, false, true, true, 100),
                   (true, true, false, '3BF2201169FFC348996A0510BD19BBE2', 'desc', 'DataDict', '描述', statement_timestamp(), true, 300, 'Variable', 'String', false, false, false, true, true, 100),
                   (true, true, false, '0E15B3CFA8AFA4488353FC71EA08AF2E', 'order', 'DataDict', '排序', statement_timestamp(), true, 9, 'Variable', 'Integer', false, false, false, true, true, 100),
                   (true, true, false, '3D50BCFFF2FC384D9B3D6ECECF9ED969', 'type', 'DataDict', '类型', statement_timestamp(), true, 50, 'Variable', 'String', false, false, false, true, true, 100);
        END IF;
    END
$$;
-- 为DataDict新增操作
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'B741B5056FE75D43AD4C2BA7AFF1E49E') THEN
            delete from plt_fpt_queryoprconfig where plt_modulename = 'DataDict-*';
            insert into plt_fpt_queryoprconfig (plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_params, plt_targetclass, plt_viewname, plt_viewtitle, plt_viewtype, plt_authority, plt_modifytime, plt_extsettings)
            values ('B741B5056FE75D43AD4C2BA7AFF1E49E', 'create', 'dialog', '', '新增字典', 'ios-add', 'DataDict-*', 'APP_beforeScript:APP_afterScript:', 'DataDict', 'DataDictTypeAdd', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'newDict', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}'),
                   ('F20CE09F5D22364C9B69DC7AD3258C77', 'create', 'dialog', '', '新增键值', 'ios-add', 'DataDict-*', 'APP_beforeScript:var grid1 = this.getAddinById("Grid1");var selectedObjs=grid1.getSelected();if(selectedObjs.length>0){var obj=selectedObjs[0];console.log(obj);return {obj:obj}}else{this.msgbox.info("请选择要维护的数据字典！");}APP_afterScript:var grid1=this.getAddinById("Grid1");var grid2=this.getAddinById("Grid2");var selectedObjs=grid1.getSelected();if(selectedObjs.length>0){var obj=selectedObjs[0];console.log(obj);var query=" and obj.type = ''"+obj.type+"'' and obj.key is not null order by obj.order asc";grid2.freshData(query);}', 'DataDict', 'DataDictKeyValueAdd', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'AddKeyValue', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}'),
                   ('465908924C19F44382D9E5874B198277', 'edit', 'dialog', '', '编辑', 'ios-add', 'DataDict-*', 'APP_beforeScript:APP_afterScript:', 'DataDict', 'DataDictTypeAdd', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'editDict', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}'),
                   ('CA107E3381D8E447AC93C7EFA32EA00A', 'implement', 'dialog', 'clientScript:var grid1=this.getAddinById("Grid1");var grid2=this.getAddinById("Grid2");var selectedObjs=grid1.getSelected();if(selectedObjs.length>0){var obj=selectedObjs[0];console.log(obj);var query=" and obj.type = ''"+obj.type+"'' and obj.key is not null order by obj.order asc";grid2.freshData(query);}', '管理键值', 'ios-add', 'DataDict-*', 'APP_beforeScript:APP_afterScript:', '', '', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'keyValueMgn', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}'),
                   ('539903C5CFA2D04793C69D26E87DAC1E', 'edit', 'dialog', '', '编辑', 'ios-add', 'DataDict-*', 'APP_beforeScript:APP_afterScript:', 'DataDict', 'DataDictKeyValueAdd', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'editKeyValue', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}');
        END IF;
    END
$$;
-- CustomViewTemplate新增5个默认模板
DO
$$
    BEGIN
        delete from plt_mdl_customviewtemplate where plt_oid = '316979D14F205F46B809828A57B06F58'
                                                  or plt_oid = '2C79D7B3337A9B4C835985885098711B'
                                                  or plt_oid = '2B95485DEF7F294FB3DCBF306154EDDF'
                                                  or plt_oid = '36649B6F58BBD342B4CF1664C62F1CD8'
                                                  or plt_oid = 'AE75FF7E4BAEC74B8C3F48968F48E1D7';
        IF NOT EXISTS (SELECT * FROM plt_mdl_customviewtemplate WHERE plt_oid = '316979D14F205F46B809828A57B06F58') THEN
            insert into plt_mdl_customviewtemplate (plt_oid, plt_createtime, plt_creator, plt_devicetype, plt_formtype, plt_displayname, plt_lastmodifier, plt_lastmodifytime, plt_templatename, plt_v3content, plt_icon)
            values ('316979D14F205F46B809828A57B06F58', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', 'actPc', 'PC', '单对象单列表单', '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), 'singleCol',
                    '{"data":{"elements":"${elements}","targetClass":"${targetClass}","isRelation":"${isRelation}","basicArgs":{},"deviceType":"actPc"}}',
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAPFBMVEUAAADv7+/u7u7u7u7z8/P////v7+/u7u7////39/fd3d0tjPD5+fnv7+/9/f3n5+fy8vJlq/Tf39/n8v5W3ZWVAAAAB3RSTlMAkvPVKwa9zEb/gAAAAgpJREFUeNrtnVFugzAQRCHQOGlsEpL737WlldVUAsk/tnaf530D8mjFjndkycPGPE6n4JTTNM7DLx9jcM748aPjHNxz3pS4r8fGOAxzQDAzCrKVZAoIpsFt3/3PaQgQkEJSXC6OWGLaF5JcydhY0q6QeHFH3BXiriDfJdkVcnGIhFijgpAlXpsQl7pCrik0Il1rComhIbFYSLx/FnB/++AjNORRLGTTUaLk740UGpKKhTzLhDzfPtiU/iqC+UcwXatjH+E4e320aXRBXjtzQsTM7JgUBZNr+UZCrCEh1iB2LYyPYJzdXUGUxhtEQo7gzOyUFMVorvVabwWsr/y82aRxvRWx5ufNZr+3QvLzZtN4TEUw/wima3XsIxxnr482jS7Ia2dOiJiZHZOiYHIt30iINSTEGsSuhfERjLO7K4jSeINIyBGcmZ2SohjNtTDnfjEnsXU2vgU6G++5a3XsIxxnr482jS7Ia2dOiJiZHZOiYHIt30iINSTEGsSuhfERjLO7K4jSeINIyBGcmZ2SohjNtTBJIyb7VRrfAqXxnrtWxz7Ccfb6aNPogrx25oSImdkxKQom1/KNhFhDQqxB7FoYH8E4u7uCKI03iIQcwZnZKSmK0VwLkzRisl+l8S1QGu+5a3XsIxxnr0+Hm0bfcIRgLnbEXLWJufwUcx0toyQj6cpmzCXakGvNvwAT1r3q1p3BogAAAABJRU5ErkJggg=='),
                   ('2C79D7B3337A9B4C835985885098711B', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', 'actPc', 'PC', '单对象双列表单', '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), 'doubleCol',
                    '{"data":{"elements":"${elements}","targetClass":"${targetClass}","isRelation":"${isRelation}","basicArgs":{},"deviceType":"actPc"}}',
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAOVBMVEUAAADv7+/u7u7u7u7z8/P////v7+/////u7u739/fd3d35+fn9/f3n5+ctjPHy8vLf399lq/Tn8v5oFFnZAAAAB3RSTlMAkvPVKwa9zEb/gAAAAiZJREFUeNrtnUuOgzAQRCGQ2Ikhv/sfdoRnYScsiBR65HrTb4voqGK5q11Ccrcw9sMhinIY+rH75dhHcfpj1nGK8pwWJfLrsdB33RgRjIwFWZZkiAiGTrbvvnLoIgSmkDSFPZlSzBiXXwuZwt5M0b78WkgK+5P+rHxn8Y8VJvvyayHBAuPyLoQjZErnDV6brE3574Wc4wecQ8Gk/PdCUtxg1Wkty28LSfOlMFfv3eJH3MobluW3hcyXmnn13iblDcvy20Lul5r7N79kUv7/rQhmj2C6Ft9HOM7OmbVciE159gkRc2bHpCicXEsaF9IaLqQ1kF2L4iMYZ8fMWqFCevrNT1yImhDKmZ2SoqjlWpikEZP9ehrf2opg9gima/F9hOPsnFnLhXga72m8forCybWkcSGt4UJaA9m1KD6CcXbMrBUqpKff/MSFqAmhnNkpKYparmWcND4f18LjqZvGZx1FiW4af31FN41/WxHdNP5tj3ga7z5CcnbOrOVCPI33NF4/ReHkWtK4kNZwIa2B7FoUH8E4O2bWChXS029+4kLUhFDO7JQURS3Xwnz3i/kS27+Nb21FMHsE07X4PsJxds6s5UI8jfc0Xj9F4eRa0riQ1nAhrYHsWhQfwTg7ZtYKFdLTb37iQtSEUM7slBRFLdfCJI2Y7NfT+NZWBLNHMF2L7yMcZ+fMWgpCtOEIwVzsiLlqE3P5KeY6WsaS9KQrmzGXaEOuNf8BZc+7rAoo6psAAAAASUVORK5CYII='),
                   ('2B95485DEF7F294FB3DCBF306154EDDF', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', 'actPc', 'PC', '多对象卡片', '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), 'multiCard',
                    '{"data":{"elements":[{"self":{"elementType":"addin_col","properties":{"id":"col1","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"#fff","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"8BDE0A08574B472B83EB93110BD4CE11","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"8BDE0A08574B472B83EB93110BD4CE11","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_SearchBox","properties":{"width":100,"widthType":"%","title":"查询框","id":"SearchBox1","labelDisabled":false,"style":"","targetDataType":null,"buttonTxt":"查询","buttonReset":"重置","unitInputWidth":33,"readonly":false,"hided":false,"events":[{"opr_path":"","opr_type":"","name":"值变化"}],"eventRange":["值变化"],"selectAttr":"${selectAttr}","chooseTable":["FormEngine1"],"oldChooseTable":[],"dataAttr":"${dataAttr}","uuid":"AF71AFFAAA4C45E79FF1193ACB5D3722"},"dropTarget":0,"uuid":"AF71AFFAAA4C45E79FF1193ACB5D3722","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col2","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"C6986D1D82D1417492E4507D307DF8C5","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"C6986D1D82D1417492E4507D307DF8C5","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_FormEngine","properties":{"pageSize":25,"pagination":true,"hided":false,"main_color":"initial","unit_width":30,"unit_widthType":"%","unit_height":100,"unit_heightType":"%","unit_padding":10,"multi":true,"multiChoose":false,"hasAdd":true,"viewName":"${viewName}","groupDisplayName":"","addviewName":"","title":"卡片","id":"FormEngine1","width":100,"widthType":"%","height":500,"heightType":"px","targetClass":"","condition":"","bindTargetClass":"${bindTargetClass}","filterQuery":"","initScript":"","returnFormat":"#json","events":[{"opr_path":"","opr_type":"","name":"新增"},{"opr_path":"","opr_type":"","name":"初始化"},{"opr_path":"","opr_type":"","name":"自定义"}],"eventRange":["新增","初始化","自定义"],"uuid":"6B9270A9B77947EFB29828867C9291C6","select_type":"${select_type}","selected_attributes":"${selected_attributes}"},"dropTarget":0,"uuid":"6B9270A9B77947EFB29828867C9291C6","DWFADDINARGSVERSION":1},"elements":[]}]}],"targetClass":"${targetClass}","isRelation":false,"basicArgs":{},"deviceType":"actPc"}}',
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAQlBMVEUAAADv7+/u7u7u7u7z8/P////v7+/////u7u7MzMz9/f36+vrz8/MtjPDa2trx8fHPz8/39/f19fXC3vtYpPQzkPES1xneAAAAB3RSTlMAkvPVKwa9zEb/gAAAAnlJREFUeNrtnd1uozAUhPlJe1ybYtIm7/+qK++iUGuJMULpsYf5rhIpc/FhYhvmwk3g0vadqZSuby/NP95aUznt21+Pd1M978Gk+vEItE1zMRBcMAYkDElvIOibaufdmK4xIGCKOCsVYd0zkao0AnZdxEl1uB8iFQ+IiF0VkQqhSGlQpDS2RJw3m3gnCyrZbRFnsnBLQiW7LeJNFn5JqGS3RUwGceJ3s+cbEZj/CMysVQ8UKQ2KlAZFSuM0IgcWtUN83+6fM/fbtzzw4/QxM43+5dv44x6fEQ8T/xHhX7xpPM4tFrnJzBiLjC/exh/nHovcZWaKRabzjQjMfwRm1qoHipQGRUoDu+iBqd7qGxKLXk9XDUVKgyKlQZHSoEhpAIs4u2eXUEZ2TcTKLmwJ2TURJztx+tlVESs7sfrZVRHZjX6WIhShCEVWcOP0eB8eTfr62X0iY9y0LOhns0QGc/2//prkB/rZHBEXFt30ldHPZouk71X9bI6IfPmrpNHPpkXcYCUL/WxSxGa3z/rZlIgNte4QPsgW+tmUyGACV3HmSzbQzyZE3Pztujy72cGYmPlm1s8+F7HeLHi7XKuYQQL62eciQzoX/1g/m73XSl8Z/WyuyMa9qp896fMIRShCESwRmHe/MG/jYfoRnMaqVihSGhQpDdxZC2UdgVnZYfZaMLtfilCEImcXYc/Onp09O3t2w56dPTt7dvbs7NnZs7Nn18+e9HmEIhShCJYIzLtfmLfxMP0ITmNVKxQpDYqUBu6shbKOwKzsMHstmN0vRShCkbOLsGf/rZ69w+jZu6bH6Nn7psXo2Vuc42gxzqNtkY5shjlEG+RY8z/eSrXKgpKA5wAAAABJRU5ErkJggg=='),
                   ('36649B6F58BBD342B4CF1664C62F1CD8', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', 'actPc', 'PC', '多对象列表', '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), 'multiList',
                    '{"data":{"elements":[{"self":{"elementType":"addin_col","properties":{"id":"col1","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"#fff","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"52CB62290C0049AD9188D72C0C9BD5CB","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"52CB62290C0049AD9188D72C0C9BD5CB","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_Operation","properties":{"extend":false,"opr_path":"","opr_name":"tip","type":"primary","shape":false,"width":"auto","widthType":"px","heightType":"px","height":34,"icon":"","text":"新增","opr_type":null,"auth":false,"auth_item":null,"disabled":false,"id":"Operation1","main_fontColor":"#fff","hided":false,"title":"按钮","col":true,"cols":3,"targetDataType":null,"chooseTable":[],"events":[{"opr_path":"createForm","opr_type":"sys","name":"单击","opr_sys_path":""}],"eventRange":["单击"],"uuid":"280DD57A1CDD4211977C30C18A776C4B"},"dropTarget":0,"uuid":"280DD57A1CDD4211977C30C18A776C4B","DWFADDINARGSVERSION":1},"elements":[]},{"self":{"elementType":"addin_Operation","properties":{"extend":false,"opr_path":"","opr_name":"tip","type":"primary","shape":false,"width":"auto","widthType":"px","heightType":"px","height":34,"icon":"","text":"编辑","opr_type":null,"auth":false,"auth_item":null,"disabled":false,"id":"Operation2","main_fontColor":"#fff","hided":false,"title":"按钮","col":true,"cols":3,"targetDataType":null,"chooseTable":[],"events":[{"opr_path":"editForm","opr_type":"sys","name":"单击","opr_sys_path":""}],"eventRange":["单击"],"uuid":"256FE320F2D54F00A81CDA35277D7818"},"dropTarget":0,"uuid":"256FE320F2D54F00A81CDA35277D7818","DWFADDINARGSVERSION":1},"elements":[]},{"self":{"elementType":"addin_Operation","properties":{"extend":false,"opr_path":"delete","opr_name":"tip","type":"primary","shape":false,"width":"auto","widthType":"px","heightType":"px","height":34,"icon":"","text":"删除","opr_type":"sys","auth":false,"auth_item":"delete","disabled":false,"id":"Operation3","main_fontColor":"#fff","hided":false,"title":"按钮","col":true,"cols":3,"targetDataType":null,"chooseTable":["Grid1"],"events":[{"opr_path":"delete","opr_type":"sys","name":"单击","opr_sys_path":""}],"eventRange":["单击"],"uuid":"E93CB7566CE94885A15274FF3EF9F495"},"dropTarget":0,"uuid":"E93CB7566CE94885A15274FF3EF9F495","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_col","properties":{"id":"col2","height":30,"width":100,"widthType":"%","heightType":"px","hided":false,"align":"Vertical","g_align":0,"imgOrigin":"imgSelf","back_color":"#fff","back_picture":"","bgStyle":"cover","bgSize":"cover","bgRepeat":"no-repeat","bgPercent":100,"border":true,"marginTop":0,"marginTopType":"px","marginBottom":0,"marginBottomType":"px","marginLeft":0,"marginLeftType":"px","marginRight":0,"marginRightType":"px","paddingTop":0,"paddingTopType":"px","paddingBottom":0,"paddingBottomType":"px","paddingLeft":0,"paddingLeftType":"px","paddingRight":0,"paddingRightType":"px","tbColor":"#bbb","tbWidth":0,"tbStyle":"dashed","bbColor":"#bbb","bbWidth":0,"bbStyle":"dashed","lbColor":"#bbb","lbWidth":0,"lbStyle":"dashed","rbColor":"#bbb","rbWidth":0,"rbStyle":"dashed","ltRadius":0,"ltRadiusType":"px","rtRadius":0,"rtRadiusType":"px","lbRadius":0,"lbRadiusType":"px","rbRadius":0,"rbRadiusType":"px","shadowType":"外阴影","xShadow":0,"yShadow":0,"blurShadow":0,"spreadShadow":0,"shadowColor":"","layout":true,"title":"单列","span":8,"offset":0,"push":0,"pull":0,"type":"flex","justify":"start","label_width":1,"main_width":4,"label_align":7,"main_align":1,"picActIndex":-1,"alignItems":"flex-start","justifyContent":"flex-start","uuid":"3B8F03DEC48547E8821691D2C7045045","labelWidthUnit":"px","label_widthByPx":200},"dropTarget":0,"uuid":"3B8F03DEC48547E8821691D2C7045045","DWFADDINARGSVERSION":1},"elements":[{"self":{"elementType":"addin_SearchBox","properties":{"width":100,"widthType":"%","title":"查询框","id":"SearchBox1","labelDisabled":false,"style":"","targetDataType":null,"buttonTxt":"查询","buttonReset":"重置","unitInputWidth":33,"readonly":false,"hided":false,"events":[{"opr_path":"","opr_type":"","name":"值变化"}],"eventRange":["值变化"],"selectAttr":"${selectAttr}","chooseTable":["Grid1"],"oldChooseTable":[],"dataAttr":"${dataAttr}","uuid":"B6822D4E884445A4919B427EF6FD20E8"},"dropTarget":0,"uuid":"B6822D4E884445A4919B427EF6FD20E8","DWFADDINARGSVERSION":1},"elements":[]}]},{"self":{"elementType":"addin_Grid","properties":{"dynamic":false,"title":"表格","id":"Grid1","agGridTheme":"ag-theme-balham","columnDefs":["${columnDefs}"],"enableSorting":true,"enableFilter":true,"rowSelection":false,"colResiable":true,"rowDragManaged":true,"notEditable":false,"statusBar":false,"rangeSection":false,"statusBarConfig":{},"compactMode":false,"autoSize":false,"pageable":true,"enableCellChangeFlash":true,"enableExport":true,"width":100,"widthType":"%","heightType":"px","height":500,"rowHeight":40,"select_type":"${select_type}","selected_attributes":"${selected_attributes}","selected_attributes_sort":[],"bindTargetClass":"${bindTargetClass}","targetClass":"${targetClass}","oprTargetClass":"${targetClass}","filterQuery":"","dbclk_type":"","dbclk_path":"","dbclk_del_alert":true,"dbclk_text":"","sgclk_text":"","sgclk_type":"","sgclk_path":"","sgclk_del_alert":true,"event_oprs":{"double_click":{"opr_path":null,"opr_type":""},"single_click":{"opr_path":null,"opr_type":""}},"pagination":true,"pageSize":25,"oprCol":false,"SNCol":false,"globalAlignCode":1,"oidNameMap":null,"refClass":"${targetClass}","classCategory":"RelationClass","events":[{"opr_path":"","opr_type":"","name":"初始化"},{"opr_path":"","opr_type":"","name":"前处理"},{"opr_path":"","opr_type":"","name":"翻页"},{"opr_path":"","opr_type":"","name":"鼠标悬浮Tooltip"},{"opr_path":"","opr_type":"","name":"单击"},{"opr_path":"","opr_type":"","name":"双击"}],"eventRange":["初始化","前处理","翻页","鼠标悬浮Tooltip","单击","双击"],"cacheGrid":false,"hided":false,"uuid":"1744F13129CD4AB7B17719E0D1450D1B"},"dropTarget":0,"uuid":"1744F13129CD4AB7B17719E0D1450D1B","DWFADDINARGSVERSION":1},"elements":[]}],"targetClass":"${targetClass}","isRelation":false,"basicArgs":{},"deviceType":"actPc"}}',
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAANlBMVEUAAADv7+/u7u7u7u7z8/P////v7+/u7u7////z8/MtjPDMzMz6+vrC3vtYpPTX19czkPHPz8/rHSA0AAAAB3RSTlMAkvPVKwa9zEb/gAAAAedJREFUeNrs2duKAyEQRVH7klSZmL78/88OTkRahiGCdPpUWevdh80hRmgXzcM0klDjNMzu7TaQcMPtt+NO4t1jifg9osG5mVSYdQwSJ5lIhcmJvXdLoyMldIYEFiX8F8LiHEPE7hGFQ4jkQZgtBI2FoOkmJHj6yAc+uOBsRUigKoGzC87WhHiq4jm74GxNCFXi7Ltn+1tEzW9Eza0lh4WgsRA0FoKmm5CGP7Umr2V7JNvy4ozW/ZnsK3F20hOlveNRyCX0LJz9aGy3lCELJ2sZsnJy0jO+3VaGbJzsZcjObx0touY3oubWksNC0FgIGt0haj69CZxE++dp0SwEjYWgsRA0FoJGcYiId0r4FCLn5fgnROIeUaCSEzoIs4WgsRA0FoKmPsQTHF8fAt1xLKkPIUg9L4JY4vu+tcBZCJoOQ37au2MbhoEYCIJwxP47dsoSRvydDhYC/jLxyqsFdrTsnpYdVoimEM1sT7xaYEfL7mnZYYVoCtHM9sSrBXa07J6WHVaIphDNbE+8WmBHy+5p2WGFaArRzPbEqwV2tOyelh1WiKYQzWxPvFpgR8vuadlhhWgK0cz2xKsFdrTsnpYdVoimEM1sp3+581F3DjueObV55vjpmXO0Nz7J79LJ5jNHtI+cNf8DcJyp2PMtfp0AAAAASUVORK5CYII='),
                   ('AE75FF7E4BAEC74B8C3F48968F48E1D7', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', 'actPc', 'PC', '空白表单', '9C92E891E9AE534DB685737DE467A9D0', statement_timestamp(), 'Blank',
                    '',
                    'data:image/png;base64,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');
        END IF;
    END
$$;
-- 增加全剧脚本getFilteredGrid
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'B22C7AE96654EB469468CFCCDDE2E79B') THEN
            insert into plt_fpt_queryoprconfig(plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_params, plt_targetclass, plt_viewname, plt_viewtitle, plt_viewtype, plt_authority, plt_modifytime, plt_extsettings, plt_oprscript, plt_implementtype)
            values ('B22C7AE96654EB469468CFCCDDE2E79B', 'global_implement', 'dialog', '', '当前项表格数据', 'ios-add', 'Root-*', '', '', '', '',
                    '{"needPopTitle":false,"popTitleTxt":"提示","popTitleFs":14,"popTitleColor":"#333","tipPlacement":"right","popWidth":400,"dialogWidth":80,"dialogWidthType":"%","dialogAutoHeight":true,"dialogHeight":400,"dialogHeightType":"px","dragDialog":false,"drawerWidth":720,"drawerWidthType":"px"}',
                    'getFilteredGrid', statement_timestamp(), '{"needDefaultOpr":false,"needDialogDefaultOpr":true,"autoClose":"auto","sysBindOpr":false}',
                    '{"implement":{"entry":"client","client":{"default":{"script":"var treeNode = this.getAddinById(\"SelfJoinsTree1\").getSelected()[0];\r\n\r\nconsole.log(treeNode);\r\nconsole.log(this.obj);\r\nqueryStr = ` and obj.parentOid = ''${treeNode.oid}'' `;\r\n\r\nvar grid=this.getAddinById(\"Grid1\");\r\ngrid.freshData(queryStr);","displayName":""}},"server":{"default":{"script":"","displayName":"默认脚本"}}},"appBefore":{"entry":"client","client":{"default":{"script":"","displayName":""}},"server":{"default":{"script":"","displayName":"默认脚本"}}},"appAfter":{"entry":"client","client":{"default":{"script":"","displayName":""}},"server":{"default":{"script":"","displayName":"默认脚本"}}}}',
                    'clientScript');
        END IF;
    END
$$;

-- SchemaN分支
-- 创建默认创建一个异构数据源的datasource ip为本机ip
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT * FROM plt_mdl_metadatasource WHERE plt_oid = '9046E69473A6B748BF2B551F90B00984') THEN
            INSERT INTO public.plt_mdl_metadatasource(plt_createtime, plt_creator, plt_oid, plt_lastmodifytime, plt_lastmodifier, plt_datasourcename, plt_serverip, plt_serverport, plt_username, plt_password, plt_databasename, plt_folderdepth, plt_datasourcetype)
            VALUES (statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '9046E69473A6B748BF2B551F90B00984', statement_timestamp(), '9C92E891E9AE534DB685737DE467A9D0', '异构数据源', '127.0.0.1', 5432, 'postgres', 123456, 'dataway', 0, 'POSTGRESQL');
        END IF;
    END
$$;
-- 默认modeler应用新增子菜单
DO
$$
    BEGIN
        IF EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20') THEN
            -- 数据模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37') THEN
                -- update plt_fpt_queryoprconfig set plt_order = 2, plt_conditionexpre = 'addin:DataConnectionMgr', plt_displayname = '数据连接管理', plt_authority = 'DataConnectionManage', plt_modifytime = statement_timestamp() where plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8';
                -- 删除外部数据连接
                delete from plt_fpt_queryoprconfig where plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8';
                -- 数据连接管理
                IF NOT EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '7FCF8A9E72EBFD4BA4D75D1872252730') THEN
                    insert into plt_fpt_queryoprconfig(plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_order, plt_authority, plt_modifytime)
                    values ('7FCF8A9E72EBFD4BA4D75D1872252730', 'implement', 'tab', 'addin:DataConnectionMgr', '数据连接管理', 'ios-link', 'DataModel', 2, 'DataConnectionManage', statement_timestamp());
                END IF;
                -- 异构数据集成
                IF NOT EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'EAD8C18076AFF54C81F6D5720AFF45BD') THEN
                    insert into plt_fpt_queryoprconfig(plt_oid, plt_action, plt_contype, plt_conditionexpre, plt_displayname, plt_icon, plt_modulename, plt_order, plt_authority, plt_modifytime)
                    values ('EAD8C18076AFF54C81F6D5720AFF45BD', 'implement', 'tab', 'addin:DataIntegrate', '异构数据集成', 'icon-shujufangwenkongzhi', 'DataModel', 3, 'dataingrate', statement_timestamp());
                END IF;
                -- 外部实体类
                update plt_fpt_queryoprconfig set plt_order = 4 where plt_oid = '5105F81587F2394E8EEC0A2734A055A7';
                -- 属性库管理
                update plt_fpt_queryoprconfig set plt_order = 5 where plt_oid = '2D7645E72E897D4EB4709D7D29EA6166';
            END IF;
        END IF;
    END
$$;

-- appMobile分支
-- 应用增加type、defaultopr属性，旧有数据type默认值为PC
DO $$
    BEGIN
        alter table if exists plt_mdl_appinfo
            add column plt_type varchar default 'PC',
            add column plt_defaultopr varchar;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column already exists in plt_mdl_appinfo';
    END;
$$;

-- 视图增加formtype属性，旧有数据默认值为PC
DO $$
    BEGIN
        ALTER TABLE if exists plt_mdl_customview ADD COLUMN plt_formtype varchar(32) NOT NULL DEFAULT 'PC';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column plt_formtype already exists in plt_mdl_customview';
    END;
$$;
update plt_mdl_customview set plt_formtype = 'PC' where plt_formtype is null;

-- 操作增加viewOid属性，旧数据迁移
-- 老版本pg不支持if not exists这个写法
-- ALTER TABLE if exists plt_fpt_queryoprconfig ADD COLUMN if not exists plt_viewoid varchar(50);
DO $$
    BEGIN
        ALTER TABLE if exists plt_fpt_queryoprconfig ADD COLUMN plt_viewoid varchar(50);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column plt_viewoid already exists in plt_fpt_queryoprconfig';
    END;
$$;
DO
$$
    DECLARE
        eachOid varchar;
        oprOids varchar[] := ARRAY(select plt_oid FROM plt_fpt_queryoprconfig where plt_targetclass is not null and plt_targetclass <> '' and plt_viewname is not null and plt_viewname <> '')::varchar[];
        targetclass varchar;
        viewname varchar;
        viewoid varchar;
    BEGIN
        IF (select distinct plt_viewoid from plt_fpt_queryoprconfig where plt_targetclass is not null and plt_targetclass <> '' and plt_viewname is not null and plt_viewname <> '' limit 1) is null then
            FOREACH eachOid IN ARRAY oprOids
                LOOP
                    targetclass := (select plt_targetclass from plt_fpt_queryoprconfig where plt_oid = eachOid);
                    viewname := (select plt_viewname from plt_fpt_queryoprconfig where plt_oid = eachOid);

                    viewoid := (select plt_oid from plt_mdl_customview where plt_classname = targetclass and plt_viewname = viewname limit 1);
                    IF viewoid is not null THEN
                        update plt_fpt_queryoprconfig set plt_viewoid = viewoid where plt_oid = eachOid;
                    END IF;
                END LOOP;
        end if;
    END
$$;

-- schemaN 异构数据源类型改为PG
update plt_mdl_metadatasource set plt_datasourcetype = 'POSTGRESQL' where plt_oid = '9046E69473A6B748BF2B551F90B00984';

-- class2attribute 表格显示默认为true
alter table if exists plt_mdl_r_class2attribute alter column PLT_isInTable set default true;

-- fix 7555 修复未知原因导致操作授权项不存在的问题
DO
$$
    DECLARE
        eachOid varchar;
        oprOids varchar[] := ARRAY(select plt_oid FROM plt_fpt_queryoprconfig where plt_authority not in (select plt_authorityid from plt_mdl_authorityitem))::varchar[];
        authority varchar;
        displayname varchar;
        modulename varchar;
    BEGIN
        FOREACH eachOid IN ARRAY oprOids
            LOOP
                authority := (select plt_authority from plt_fpt_queryoprconfig where plt_oid = eachOid);
                displayname := (select plt_displayname from plt_fpt_queryoprconfig where plt_oid = eachOid);
                modulename := (select plt_modulename from plt_fpt_queryoprconfig where plt_oid = eachOid);

                insert into plt_mdl_authorityitem(plt_oid, plt_authorityid, plt_displayname, plt_note) VALUES (upper(replace(cast(uuid_generate_v4() as VARCHAR), '-', '')), authority, displayname, modulename);
            END LOOP;
    END
$$;

-- -- 删除无主authitem脏数据
-- DO
-- $$
--     DECLARE
--         eachAuth varchar;
--         authority varchar[] := ARRAY(select distinct plt_authority from plt_rul_accessrule where plt_authority not in (select plt_authorityid from plt_mdl_authorityitem)
--                                                                                            and plt_authority <> 'CommonOpAuth' and plt_authority <> 'CreateObjects' and plt_authority <> 'EditObjects' and plt_authority <> 'DeleteObj'
--                                                                                            and plt_authority <> 'SaveModules' and plt_authority <> 'EditModules' and plt_authority <> 'DeleteModules'
--                                                                                            and plt_authority <> 'SaveOperations' and plt_authority <> 'EditOperations' and plt_authority <> 'DeleteOperations')::varchar[];
--         classOid varchar;
--         oprOid varchar;
--     BEGIN
--         FOREACH eachAuth IN ARRAY authority
--             LOOP
--                 oprOid := (select plt_oid from plt_fpt_queryoprconfig where plt_authority = eachAuth);
--                 classOid := (select plt_oid from plt_mdl_metaclass where plt_classname = eachAuth);
--                 if oprOid is null and classOid is null then
--                     delete from plt_rul_accessrule where plt_authority = eachAuth;
--                 end if;
--             END LOOP;
--     END
-- $$;

-- 修复错误代码导致应用授权项不存在的问题
DO
$$
    DECLARE
        eachAppName varchar;
        appNames varchar[] := ARRAY(select plt_appname FROM plt_mdl_appinfo where 'APP_' || plt_appname not in (select plt_authorityid from plt_mdl_authorityitem))::varchar[];
        authority varchar;
        displayname varchar;
        modulename varchar;
    BEGIN
        FOREACH eachAppName IN ARRAY appNames
            LOOP
                authority := 'APP_' || eachAppName;
                displayname := eachAppName;
                modulename := '应用-' || eachAppName;

                insert into plt_mdl_authorityitem(plt_oid, plt_authorityid, plt_displayname, plt_note) VALUES (upper(replace(cast(uuid_generate_v4() as VARCHAR), '-', '')), authority, displayname, modulename);
            END LOOP;
    END
$$;

select sys_dbversions_update('2021-03-01 11:05:00'::timestamp, '20210208-8722e3ce1'::varchar, 'update-4.2_to_4.3.sql'::varchar, '4.2'::varchar, '4.3'::varchar, '20210227-06c69891d'::varchar, ''::varchar);