-- 保证MetaDataSet和MetaDataSource有4个基本属性
DO $$
    BEGIN
        BEGIN
            alter table if exists plt_mdl_metadataset add column plt_createtime timestamp(6) without time zone DEFAULT statement_timestamp();
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_createtime already exists in plt_mdl_metadataset';
        END;
        BEGIN
            alter table if exists plt_mdl_metadataset add column plt_creator character varying;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_creator already exists in plt_mdl_metadataset';
        END;
        BEGIN
            alter table if exists plt_mdl_metadataset add column plt_lastmodifytime timestamp(6) without time zone DEFAULT statement_timestamp();
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifytime already exists in plt_mdl_metadataset';
        END;
        BEGIN
            alter table if exists plt_mdl_metadataset add column plt_lastmodifier character varying;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifier already exists in plt_mdl_metadataset';
        END;
        BEGIN
            alter table if exists plt_mdl_metadatasource add column plt_createtime timestamp(6) without time zone DEFAULT statement_timestamp();
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_createtime already exists in plt_mdl_metadatasource';
        END;
        BEGIN
            alter table if exists plt_mdl_metadatasource add column plt_creator character varying;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_creator already exists in plt_mdl_metadatasource';
        END;
        BEGIN
            alter table if exists plt_mdl_metadatasource add column plt_lastmodifytime timestamp(6) without time zone DEFAULT statement_timestamp();
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifytime already exists in plt_mdl_metadatasource';
        END;
        BEGIN
            alter table if exists plt_mdl_metadatasource add column plt_lastmodifier character varying;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_lastmodifier already exists in plt_mdl_metadatasource';
        END;
    END;
$$;

-- 修改modeler应用子菜单图标
DO
$$
    BEGIN
        IF EXISTS (SELECT * FROM plt_mdl_appinfo WHERE plt_id = 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20') THEN
            -- 组织模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '72237969537771468142E39CCBA4B0AE') THEN
                update plt_mdl_metaclass set plt_packagepath = 'ios-people' where plt_oid = '72237969537771468142E39CCBA4B0AE';
                -- 用户管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'FCD49C91A088CA4DA12A03B522C8F98B') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-person' where plt_oid = 'FCD49C91A088CA4DA12A03B522C8F98B';
                END IF;
                -- 用户组管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '88B3A77475483A4C8D607B6EA64A8D2E') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-people' where plt_oid = '88B3A77475483A4C8D607B6EA64A8D2E';
                END IF;
                -- 在线管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5008F81C064D9C4E939C3C382BF9FF55') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-cloud-done' where plt_oid = '5008F81C064D9C4E939C3C382BF9FF55';
                END IF;
            END IF;

            -- 数据模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37') THEN
                update plt_mdl_metaclass set plt_packagepath = 'md-cube' where plt_oid = 'DFB27CB3DD33944FA59E4A4078406D37';
                -- 属性库管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '2D7645E72E897D4EB4709D7D29EA6166') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-podium' where plt_oid = '2D7645E72E897D4EB4709D7D29EA6166';
                END IF;
                -- 实体类管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'DFA6A251BDB217498525A9B092AAE5A3') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-color-wand' where plt_oid = 'DFA6A251BDB217498525A9B092AAE5A3';
                END IF;
                -- 关联类管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '517E356BF7117542B6A6109949058E96') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-swap' where plt_oid = '517E356BF7117542B6A6109949058E96';
                END IF;
                -- 外部数据连接
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-link' where plt_oid = 'BDB973F1A7F1744888E511F1E68DF1D8';
                END IF;
                -- 外部实体类
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5105F81587F2394E8EEC0A2734A055A7') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-link' where plt_oid = '5105F81587F2394E8EEC0A2734A055A7';
                END IF;
            END IF;

            -- 表单模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '769C3B5674E7264F8FEE71E7C801599B') THEN
                update plt_mdl_metaclass set plt_packagepath = 'md-filing' where plt_oid = '769C3B5674E7264F8FEE71E7C801599B';
                -- 实体类表单管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'B45C508463F4E041B8B1743EBE6E5536') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-paper' where plt_oid = 'B45C508463F4E041B8B1743EBE6E5536';
                END IF;
                -- 关联类表单管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5843EA9ABA750A49ACC22AAAF501164B') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-paper' where plt_oid = '5843EA9ABA750A49ACC22AAAF501164B';
                END IF;
            END IF;

            -- 功能模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '2F8703DBDD81A34E80181E97536564E2') THEN
                update plt_mdl_metaclass set plt_packagepath = 'md-help-buoy' where plt_oid = '2F8703DBDD81A34E80181E97536564E2';
                -- 应用管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '3FBC68630FDF5F4199B44AB436C563DB') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'logo-dropbox' where plt_oid = '3FBC68630FDF5F4199B44AB436C563DB';
                END IF;
                -- 全局操作
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '8D9EC20ADC619C44B9414DDDCE8B29FA') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-medical' where plt_oid = '8D9EC20ADC619C44B9414DDDCE8B29FA';
                END IF;
                -- 实体类操作
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '160CF7918A14C54689662EBBB70C8205') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-locate' where plt_oid = '160CF7918A14C54689662EBBB70C8205';
                END IF;
                -- 关联类操作
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'FE1DA3A0A095474B93D70EDC7C81E30A') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-git-commit' where plt_oid = 'FE1DA3A0A095474B93D70EDC7C81E30A';
                END IF;
            END IF;

            -- 授权模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '688390550FC66641BE854876C33B2B96') THEN
                update plt_mdl_metaclass set plt_packagepath = 'md-unlock' where plt_oid = '688390550FC66641BE854876C33B2B96';
                -- 基于功能授权
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '6C4F2A3CFD78CE47BDB3BEF54004F5A2') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-basketball' where plt_oid = '6C4F2A3CFD78CE47BDB3BEF54004F5A2';
                END IF;
                -- 基于组织授权
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '6C4F3A3CFD73CE37BDB3BEF53004F5A3') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-baseball' where plt_oid = '6C4F3A3CFD73CE37BDB3BEF53004F5A3';
                END IF;
                -- 数据访问控制
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5A34DB5211C3A44AAFCA9FC171FB9065') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-cloud-download' where plt_oid = '5A34DB5211C3A44AAFCA9FC171FB9065';
                END IF;
                -- 属性授权规则
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'C098EDA0829A4543B36D9E4D57A293F3') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-ionic' where plt_oid = 'C098EDA0829A4543B36D9E4D57A293F3';
                END IF;
                -- 对象授权规则
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '98E840AF304A4647B3522F0DA1E301EC') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-disc' where plt_oid = '98E840AF304A4647B3522F0DA1E301EC';
                END IF;
            END IF;

            -- 流程模型
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '5C89F5702EBAAB43BAC0E4A711436410') THEN
                update plt_mdl_metaclass set plt_packagepath = 'md-medal' where plt_oid = '5C89F5702EBAAB43BAC0E4A711436410';
                -- 流程建模
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '1C7D4072F6C5EB4A8E28FA780C47EB6F') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-git-merge' where plt_oid = '1C7D4072F6C5EB4A8E28FA780C47EB6F';
                END IF;
                -- 流程监控
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '900FA8977377CD4188D36FC85817E619') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'md-analytics' where plt_oid = '900FA8977377CD4188D36FC85817E619';
                END IF;
            END IF;

            -- 模型管理
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '2D97F8E2BDE68340A58CFB0D828D34C9') THEN
                update plt_mdl_metaclass set plt_packagepath = 'ios-archive' where plt_oid = '2D97F8E2BDE68340A58CFB0D828D34C9';
                -- 模型包管理
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '8E0BDCD94F4F0147AAEFC946A8361608') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'logo-codepen' where plt_oid = '8E0BDCD94F4F0147AAEFC946A8361608';
                END IF;
                -- 代码装配
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = '5406D219CE606C409E672D583D2552E4') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-construct' where plt_oid = '5406D219CE606C409E672D583D2552E4';
                END IF;
            END IF;

            -- 系统管理
            IF EXISTS (SELECT * FROM plt_mdl_metaclass WHERE plt_oid = '005C0473F81EFC41814A62BD3B002045') THEN
                update plt_mdl_metaclass set plt_packagepath = 'ios-cog' where plt_oid = '005C0473F81EFC41814A62BD3B002045';
                -- 脚本日志
                IF EXISTS (SELECT * FROM plt_fpt_queryoprconfig WHERE plt_oid = 'F4932CED1BC8774D8FD5F26EA651ABB0') THEN
                    update plt_fpt_queryoprconfig set plt_icon = 'ios-analytics' where plt_oid = 'F4932CED1BC8774D8FD5F26EA651ABB0';
                END IF;
            END IF;
        END IF;
    END
$$;

-- appMobileFile分支
-- 新增cname字段
DO $$
    BEGIN
        alter table if exists plt_mdl_file add column plt_cname varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column plt_cname already exists in plt_mdl_file';
    END;
$$;

-- 旧数据中所有filename复制到cname
update plt_mdl_file set plt_cname = plt_filename;

-- 新增数据表plt_mdl_multifile
CREATE TABLE IF NOT EXISTS plt_mdl_multifile (
                                                 plt_oid character varying(32) NOT NULL,
                                                 plt_createtime timestamp without time zone DEFAULT statement_timestamp(),
                                                 plt_creator character varying(32),
                                                 plt_filepath character varying(300),
                                                 plt_filename character varying(255),
                                                 plt_filesizekb double precision,
                                                 plt_cname character varying(255),
                                                 plt_lastmodifier character varying(32),
                                                 plt_lastmodifytime timestamp without time zone DEFAULT statement_timestamp()
);

-- 数据源数据集选中属性统一
update plt_mdl_metaclass set plt_packagepath = '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasetname":"数据集名称","plt_datasourceid":"所属数据源ID","plt_targetentityclass":"目标实体类","plt_filterstring":"查询语句","plt_description":"描述","默认PG数据源__attributes":["plt_createtime","plt_creator","plt_currentprocess","plt_oid","plt_owner","plt_lastmodifytime","plt_lastmodifier","plt_datasetname","plt_datasourceid","plt_targetentityclass","plt_filterstring","plt_description"]}' where plt_oid = 'ff80818169c26ebd0169c2a752020109';
update plt_mdl_metaclass set plt_packagepath = '{"plt_createtime":"创建时间","plt_creator":"创建人","plt_currentprocess":"当前流程","plt_oid":"全局唯一标识","plt_owner":"拥有者","plt_id":"代号","plt_lastmodifytime":"最近更新时间","plt_lastmodifier":"最近更新人","plt_datasourcename":"数据源名称","plt_datasourcetype":"数据源类型","plt_datafileformat":"数据源文件类型","plt_serverip":"服务器IP","plt_serverport":"服务器端口","plt_username":"登陆用户名","plt_password":"密码","plt_workbenchurl":"管理界面地址","plt_databasename":"数据库名称","plt_paramone":"参数One","plt_folderdepth":"扫描层数","plt_description":"描述","默认PG数据源__attributes":["plt_createtime","plt_creator","plt_currentprocess","plt_oid","plt_owner","plt_id","plt_lastmodifytime","plt_lastmodifier","plt_datasourcename","plt_description","plt_folderdepth","plt_paramone","plt_databasename","plt_workbenchurl","plt_password","plt_username","plt_serverport","plt_serverip","plt_datafileformat","plt_datasourcetype"]}' where plt_oid = 'ff80818169c26ebd0169c2a65b800108';

select sys_dbversions_update('2020-12-17 11:35:00'::timestamp, '20201211-907b212f2'::varchar, 'update-4.0_to_4.1.sql'::varchar, '4.0'::varchar, '4.1'::varchar, '20201231-bda9d4e01'::varchar, ''::varchar);
