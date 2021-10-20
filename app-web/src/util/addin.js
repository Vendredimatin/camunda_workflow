import Vue from 'vue';
import { entries as form_entries } from '@/ext_components/form/config';
import { entries as operation_entries } from '@/ext_components/operation/config';
import { entries as ext_form_entries } from '@/assemble_components/form/assemble_config';
import { entries as ext_operation_entries } from '@/assemble_components/operation/assemble_config';

let entries = {form: {}, operation: {}};
form_entries.forEach(x => entries.form[x.name] = x.path);
operation_entries.forEach(x => entries.operation[x.name] = x.path);
let ext_entries = {form: {}, operation: {}};
ext_form_entries.forEach(x => ext_entries.form[x.name] = x.path);
ext_operation_entries.forEach(x => ext_entries.operation[x.name] = x.path);

const getAddin = (name, module, args) => {
    try {
        if (!module) module = "form";
        name = name.replace("addin_", "");
        var a = null;
        if (name in ext_entries[module]) {
            a = Vue.extend(require("@/assemble_components/" + ext_entries[module][name]).default);
        } else {
            let path = name in entries[module] ? entries[module][name] : `${module}/${name}.vue`;
            a = Vue.extend(require("@/ext_components/" + path).default);
        }
        return new a(args);
    } catch (e) {
        console.log(e);
        return null;
    }
};

const getAddinDom = (name, module, args) => {
    try {
        if (!module) module = "form";
        name = name.replace("addin_", "");
        var a = null;
        if (name in ext_entries[module]) {
            a = Vue.extend(require("@/assemble_components/" + ext_entries[module][name]).default);
        } else {
            let path = name in entries[module] ? entries[module][name] : `${module}/${name}.vue`;
            a = Vue.extend(require("@/ext_components/" + path).default);
        }
        return new a(args).$mount().$el;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const getAddinFunc = (name, module) => {
    try {
        if (!module) module = "form";
        name = name.replace("addin_", "");
        var a = null;
        if (name in ext_entries[module]) {
            a = Vue.extend(require("@/assemble_components/" + ext_entries[module][name]).default);
        } else {
            let path = name in entries[module] ? entries[module][name] : `${module}/${name}.vue`;
            a = Vue.extend(require("@/ext_components/" + path).default);
        }
        return a;
    } catch (e) {
        console.log(e, name, module);
        return null;
    }
}

export { getAddin, getAddinDom, getAddinFunc };
