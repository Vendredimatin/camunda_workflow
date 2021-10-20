const fs = require("fs");
const watch = require("node-watch");
const exec = require("child_process").exec;

watch("../dwf-part-all/", { recursive: true }, function(evt, name) {
    // console.info(evt, name);
    var paths = name.split("/");
    if (paths.length < 2 || paths[1] !== "dwf-part-all") paths = name.split("\\");
    if (paths.length < 4 || paths[3] !== "part-web") return;
    var is_dir = false;
    if (evt === "update") {
        var stat = fs.lstatSync(name);
        is_dir = stat.isDirectory();
    } else if (evt === "remove") {
        is_dir = paths[paths.length-1].indexOf(".") === -1;
    }
    if (paths[paths.length-1] === "assemble-to.yaml") {
        if (evt === "update") {
            exec("python3 ../scripts/assemble.py clearConfig", err => {
                if (err) console.info("重置assemble_config.js失败: " + err);
            });
            exec("python3 ../scripts/assemble.py clearPackage", err => {
                if (err) console.info("重置package.json失败: " + err);
            });
            // exec("python3 ../scripts/assemble.py scanConfig", err => {
            //     if (err) console.info("生成assemble_config.js与package.json失败:" + err);
            //     else console.info("生成assemble_config.js与package.json成功");
            // });
            exec("python3 ../scripts/assemble.py scanConfig", function(error, stdout) {
                if (error) console.info("生成assemble_config.js与package.json失败: " + error);
                else console.info(stdout);
            });
        }
    } else if (paths.length > 6 && ["app","common","modeler"].indexOf(paths[4]) > -1 && ["forms", "operations"].indexOf(paths[5]) > -1) {
        var target;
        if (paths[4] === "common") target = ["../modeler-web/src/assemble_components/", "../app-web/src/assemble_components/"];
        else if (paths[4] === "modeler") target = ["../modeler-web/src/assemble_components/"];
        else target = ["../app-web/src/assemble_components/"];
        for (tar in target) {
            tar = target[tar];
            if (paths[5] === "forms") tar += "form";
            else tar += "operation";
            tar += "/" + paths[2];
            try {
                fs.accessSync(tar, fs.constants.F_OK);
            } catch (err) {
                let rtar = tar;
                try {
                    fs.mkdirSync(tar);
                    console.info("创建目录 " + rtar + " 成功" );
                } catch (err2) {
                    console.info("创建目录 " + rtar + " 失败");
                }
            }
            for (var i = 6;i < paths.length;i++) tar += "/" + paths[i];
            let rtar = tar;
            if (is_dir) {
                if (evt === "update") {
                    fs.mkdir(tar, err => {
                        if (err) console.info("创建目录 " + rtar + " 失败: " + err);
                        else console.info("创建目录 " + rtar + " 成功");
                    });
                } else if (evt === "remove") {
                    fs.rmdir(tar, err => {
                        if (err) console.info("删除目录 " + rtar + " 失败: " + err);
                        else console.info("删除目录 " + rtar + " 成功");
                    });
                }
            } else {
                if (evt === "update") {
                    fs.copyFile(name, tar, err => {
                        if (err) console.info("拷贝文件 " + rtar + " 失败: " + err);
                        else console.info("拷贝文件 " + rtar + " 成功");
                    });
                } else if (evt === "remove") {
                    fs.unlink(tar, err => {
                        if (err) console.info("删除文件 " + rtar + " 失败: " + err);
                        else console.info("删除文件 " + rtar + " 成功");
                    })
                }
            }
        }
    }
});