-- 增加表单基础设置
DO $$
    BEGIN
        BEGIN
            alter table if exists plt_mdl_customview add column plt_basicinfo text;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column plt_basicinfo already exists in plt_mdl_customview';
        END;
    END;
$$;

select sys_dbversions_update('2020-05-18 15:53:15'::timestamp, '20200108-xxxxxxxxx'::varchar, 'update-2.6_to_2.7.sql'::varchar, '2.6'::varchar, '2.7'::varchar, '20200108-xxxxxxxxx'::varchar, '');
