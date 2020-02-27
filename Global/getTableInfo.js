/// <reference path="SnTypings/index.d.ts" />
var internalTypeToClassNameMapping = {
    "boolean": "GlideElementBoolean", "catalog_preview": "GlideElement", "choice": "GlideElement", "color": "GlideElement", "composite_field": "GlideElement",
    "compressed": "GlideElementCompressed", "conditions": "GlideElementConditions", "currency": "GlideElementCurrency", "data_object": "GlideElementDataObject", "decimal": "GlideElementNumeric",
    "decoration": "GlideElement", "document_id": "GlideElementDocumentId", "documentation_field": "GlideElementDocumentation", "domain_id": "GlideElementDomainId",
    "domain_path": "GlideElement", "due_date": "GlideElementGlideObject", "email": "GlideElement", "email_script": "GlideElement", "field_list": "GlideElement",
    "field_name": "GlideElement", "float": "GlideElementNumeric", "glide_action_list": "GlideElementGlideObject", "glide_date": "GlideElementGlideObject", "glide_date_time": "GlideElementGlideObject",
    "glide_duration": "GlideElementGlideObject", "glide_list": "GlideElementGlideObject", "glide_var": "GlideElementGlideVar", "html": "GlideElementGlideObject", "html_script": "GlideElement",
    "icon": "GlideElementIcon", "image": "GlideElement", "integer": "GlideElementNumeric", "journal": "GlideElementGlideObject", "journal_input": "GlideElementGlideObject",
    "journal_list": "GlideElementGlideObject", "multi_two_lines": "GlideElement", "name_values": "GlideElementNameValue", "password": "GlideElementPassword", "password2": "GlideElementPassword2",
    "percent_complete": "GlideElementNumeric", "ph_number": "GlideElement", "price": "GlideElementPrice", "reference": "GlideElementReference", "script": "GlideElementScript",
    "script_plain": "GlideElementScript", "short_table_name": "GlideElementShortTableName", "string": "GlideElement", "sys_class_code": "GlideElement",
    "sys_class_name": "GlideElementSysClassName", "sys_class_path": "GlideElement", "sysevent_name": "GlideElement", "table_name": "GlideElement",
    "template_value": "GlideElementWorkflowConditions", "timer": "GlideElementGlideObject", "translated_field": "GlideElementTranslatedField", "translated_html": "GlideElementTranslatedHTML",
    "translated_text": "GlideElementTranslatedText", "url": "GlideElementURL", "user_image": "GlideElementUserImage", "user_input": "GlideElementGlideObject", "user_roles": "GlideElement",
    "variables": "GlideElementVariables", "version": "GlideElement", "wide_text": "GlideElement", "workflow": "GlideElementWorkflow", "xml": "GlideElementScript",
    "GUID": "GlideElement", "glide_encrypted": "GlideElementEncrypted", "source_table": "GlideElementSourceTable", "time": "GlideElementGlideObject", "html_template": "GlideElement",
    "glide_precise_time": "GlideElementGlideObject", "source_id": "GlideElementSourceId", "translated": "GlideElementGlideObject", "day_of_week": "GlideElementGlideObject",
    "data_structure": "GlideElementGlideObject", "week_of_month": "GlideElementGlideObject", "month_of_year": "GlideElementGlideObject", "date": "GlideElementGlideObject", "reference_name": "GlideElement",
    "properties": "GlideElement", "workflow_conditions": "GlideElementWorkflowConditions", "counter": "GlideElementCounter", "color_display": "GlideElement", "days_of_week": "GlideElement",
    "source_name": "GlideElementSourceName", "longint": "GlideElement", "string_full_utf8": "GlideElementFullUTF8", "variable_conditions": "GlideElementVariableConditions", "bootstrap_color": "GlideElement",
    "glyphicon": "GlideElement", "char": "GlideElement", "long": "GlideElement", "datetime": "GlideElementGlideObject", "repeat_type": "GlideElement", "composite_name": "GlideElement",
    "schedule_date_time": "GlideElementGlideObject", "internal_type": "GlideElementInternalType", "breakdown_element": "GlideElementBreakdownElement", "glide_time": "GlideElementGlideObject",
    "short_field_name": "GlideElementShortFieldName", "wiki_text": "GlideElementWikiText", "order_index": "GlideElementNumeric", "slushbucket": "GlideElement", "int": "GlideElement",
    "repeat_count": "GlideElementNumeric", "json": "GlideElement", "integer_time": "GlideElementGlideObject", "integer_date": "GlideElementGlideObject", "css": "GlideElement", "script_server": "GlideElement",
    "condition_string": "GlideElement"
};
var baseFieldNames = ["sys_created_by", "sys_created_on", "sys_id", "sys_mod_count", "sys_updated_by", "sys_updated_on"];
function internalTypeToClassName(internal_type) {
    var className = internalTypeToClassNameMapping[internal_type];
    return (typeof className === "string") ? className : "IGlideElement";
}
function definesField(tableInfo, element) {
    if (tableInfo.is_extendable && element.name == "sys_class_name")
        return true;
    var i;
    for (i = 0; i < baseFieldNames.length; i++) {
        if (baseFieldNames[i] == element.name)
            return true;
    }
    for (i = 0; i < tableInfo.elements.length; i++) {
        if (tableInfo.elements[i].name == element.name)
            return true;
    }
    return typeof tableInfo.super_class !== "undefined" && definesField(tableInfo.super_class, element);
}
function getTableInfo(tableGr) {
    var result = {
        label: "" + tableGr.getDisplayValue(),
        name: "" + tableGr.name,
        elements: []
    };
    if (tableGr.is_extendable == true)
        result.is_extendable = true;
    if (!tableGr.super_class.nil())
        result.super_class = getTableInfo(tableGr.super_class.getRefRecord());
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', result.name);
    gr.addNotNullQuery('element');
    gr.query();
    var fields = [];
    while (gr.next()) {
        var internal_type = "" + gr.internal_type.name;
        var e = void 0;
        if (internal_type == "reference") {
            if (gr.reference.nil())
                e = { label: "" + gr.getDisplayValue(), internal_type: internal_type, className: "GLIDE.NilableRecordReference<GlideRecord, GlideElementReference>", name: "" + gr.element };
            else {
                var refersTo = "" + gr.reference.name;
                e = {
                    label: "" + gr.getDisplayValue(), internal_type: internal_type, className: "GLIDE.NilableRecordReference<" + refersTo + "GlideRecord, " + refersTo + "ReferenceElement>", name: "" + gr.element, refersTo: {
                        name: refersTo,
                        label: "" + gr.reference.label
                    }
                };
            }
        }
        else
            e = { label: "" + gr.getDisplayValue(), internal_type: internal_type, className: internalTypeToClassName(internal_type), name: "" + gr.element };
        if (!definesField(result, e))
            result.elements.push(e);
    }
    return result;
}
gs.info(["sys_metadata", "sys_db_object", "sys_dictionary", "sys_glide_object", "sys_number", "sys_package", "sys_scope", "sys_user_role", "sys_encryption_context"].map(function (n) {
    var gr = new GlideRecord("sys_db_object");
    gr.addQuery("name", n);
    gr.query();
    var lines = [];
    if (gr.next()) {
        var tableInfo = getTableInfo(gr);
        var interfaceName = tableInfo.name + "Fields";
        lines.push("/**");
        lines.push(" * " + tableInfo.label);
        lines.push(" * @interface " + interfaceName);
        if (typeof tableInfo.super_class !== "undefined") {
            lines.push(" * @extends {" + tableInfo.super_class.name + "Fields}");
            lines.push(" */");
            lines.push("declare interface " + tableInfo.name + "Fields extends " + tableInfo.super_class.name + "Fields {");
        }
        else if (tableInfo.is_extendable == true) {
            lines.push(" * @extends {IExtendedGlideTableProperties}");
            lines.push(" */");
            lines.push("declare interface " + tableInfo.name + "Fields extends IExtendedGlideTableProperties {");
        }
        else {
            lines.push(" * @extends {IGlideTableProperties}");
            lines.push(" */");
            lines.push("declare interface " + tableInfo.name + "Fields extends IGlideTableProperties {");
        }
        tableInfo.elements.forEach(function (e) {
            lines.push("    /**");
            lines.push("     * " + e.label);
            lines.push("     * @type {" + e.className + "}");
            if (e.className == "IGlideElement" || e.className == "GLIDE.ScriptProperty" || e.className == "GLIDE.GlideObjectProperty" || (e.className == "GLIDE.Numeric" && e.internal_type != "integer") || (e.className == "GLIDE.ElementProperty" && e.internal_type != "string")) {
                lines.push("     * @description Internal type is " + e.internal_type);
            }
            lines.push("     */");
            lines.push("    " + e.name + ": " + e.className + ";");
        });
        lines.push("}");
        if (typeof tableInfo.super_class !== "undefined")
            lines.push("declare type " + tableInfo.name + "GlideRecord = " + tableInfo.super_class.name + "GlideRecord & " + tableInfo.name + "Fields;");
        else
            lines.push("declare type " + tableInfo.name + "GlideRecord = GlideRecord & " + tableInfo.name + "Fields;");
        lines.push("declare type " + tableInfo.name + "ReferenceElement = GLIDE.RecordReferenceElement<" + tableInfo.name + "GlideRecord, " + tableInfo.name + "Fields>;");
    }
    return lines.join("\n");
}).join("\n"));
//# sourceMappingURL=getTableInfo.js.map