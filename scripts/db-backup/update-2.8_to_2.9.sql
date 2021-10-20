-- getAttrsFromMetaAttribute函数
CREATE OR REPLACE FUNCTION getAttrsFromMetaAttribute()
RETURNS TABLE(attributename varchar, valuetype varchar) AS
$BODY$
BEGIN
    if( to_regclass('plt_mdl_metaattribute') is not null ) then
        RETURN QUERY EXECUTE 'select plt_attributename, plt_valuetype from plt_mdl_metaattribute';
    end if;
END;
$BODY$
LANGUAGE 'plpgsql' VOLATILE
COST 100;

-- plt_mdl_modelpackage添加主键
DO
$$
BEGIN
	IF NOT EXISTS (SELECT * FROM information_schema.key_column_usage AS c LEFT JOIN information_schema.table_constraints AS t ON t.constraint_name = c.constraint_name WHERE t.table_name = 'plt_mdl_modelpackage' AND t.constraint_type = 'PRIMARY KEY' AND c.column_name='plt_oid') THEN
	    ALTER TABLE if exists plt_mdl_modelpackage ADD PRIMARY KEY (plt_oid);
-- 	    ALTER TABLE if exists plt_mdl_modelpackage ADD CONSTRAINT plt_mdl_modelpackage_pkey PRIMARY KEY (plt_oid);
	END IF;
END
$$;

-- DataSource和DataSet更改为系统类
update plt_mdl_metaclass set plt_classcategory='ItemClass', plt_parentclass='Root' where plt_oid='ff80818169c26ebd0169c2a65b800108';
update plt_mdl_metaclass set plt_classcategory='ItemClass', plt_parentclass='Root' where plt_oid='ff80818169c26ebd0169c2a752020109';

-- User和Group改为继承IdItem，并设置isSystem=true
update plt_mdl_metaclass set plt_issystem=true, plt_parentclass='IdItem' where plt_oid='96944170AE34994CA297299038C22918';
update plt_mdl_metaclass set plt_issystem=true, plt_parentclass='IdItem' where plt_oid='922EC784996FBC409FC3BF1DBAA3E2F4';

-- 为User和Group绑定name属性（原本绑定在Participant上）
DO
$$
BEGIN
	IF NOT EXISTS (SELECT * FROM plt_mdl_r_class2attribute WHERE plt_oid='AEED5315DIEMA83D8B12611149568B05') THEN
	    insert into plt_mdl_r_class2attribute (plt_editable, plt_visible, plt_isunique, plt_oid, plt_attributename, plt_classname, plt_modifytime) values (true, true, true, 'AEED5315DIEMA83D8B12611149568B05', 'name', 'User', '2019-07-05 19:18:56.541465');
	END IF;
	IF NOT EXISTS (SELECT * FROM plt_mdl_r_class2attribute WHERE plt_oid='A525E939234910D5BE2051A445ABA39C') THEN
	    insert into plt_mdl_r_class2attribute (plt_editable, plt_visible, plt_isunique, plt_oid, plt_attributename, plt_classname, plt_modifytime) values (true, true, true, 'A525E939234910D5BE2051A445ABA39C', 'name', 'Group', '2019-07-05 19:18:56.541465');
    END IF;
END
$$;

-- 添加列plt_primarykey记录外部实体类映射的主键
-- DO
-- $$
-- BEGIN
-- 	IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE column_name='plt_primarykey' and table_name='plt_mdl_metaclass' and table_schema='public') THEN
-- 		alter table plt_mdl_metaclass add column plt_primarykey varchar(20);
-- 	END IF;
-- END
-- $$;
DO $$
    BEGIN
        BEGIN
            alter table plt_mdl_metaclass add column plt_primarykey varchar(20);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_primarykey already exists in plt_mdl_metaclass';
        END;
    END;
$$;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20200407-xxxxxxxxx'::varchar, 'update-2.8_to_2.9.sql'::varchar, '2.8'::varchar, '2.9'::varchar, '20200407-xxxxxxxxx'::varchar, ''::varchar);
