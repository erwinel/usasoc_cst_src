/// <reference path="types/index.d.ts" />
var USASOCCustomizations = (function () {
    var usasocCustomizationsConstructor = Class.create();
    usasocCustomizationsConstructor.EVENTNAME_TASK_UNASSIGNED = "x_44813_usasoc_cst.task.unassigned";
    usasocCustomizationsConstructor.EVENTNAME_TASK_IDEA_NEW = "x_44813_usasoc_cst.idea.new";
    usasocCustomizationsConstructor.PROPERTY_CATEGORY = "USASOC Customization Settings";
    usasocCustomizationsConstructor.PROPERTYNAME_INSTANCE_SDLC_STAGE = "x_44813_usasoc_cst.instance_sdlc_stage";
    usasocCustomizationsConstructor.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP = "x_44813_usasoc_cst.new_idea_assignment_group";
    usasocCustomizationsConstructor.PROPERTYNAME_DEFAULT_GIT_INSTANCE_BASE_URL = "x_44813_usasoc_cst.default_git_instance_base_url";
    usasocCustomizationsConstructor.PROPERTYNAME_DEFAULT_SC_CAT_APPROVER_GROUP = "x_44813_usasoc_cst.default_sc_cat_approver_group";
    usasocCustomizationsConstructor.PROPERTYNAME_DEFAULT_SC_CAT_ASSIGNMENT_GROUP = "default_sc_cat_assignment_group";
    usasocCustomizationsConstructor.prototype = {
        initialize: function () {
        },
        getInstanceSdlcStage: function () {
            var result = gs.getProperty(USASOCCustomizations.PROPERTYNAME_INSTANCE_SDLC_STAGE, "");
            switch (result) {
                case "prod":
                case "uat":
                case "test":
                case "dev":
                case "sb":
                    return result;
            }
            return "none";
        },
        getNewIdeaAssignmentGroupSysId: function () {
            var result = gs.getProperty(USASOCCustomizations.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP, "");
            if (result.length > 0)
                return result;
        },
        getNewIdeaAssignmentGroup: function () {
            var sys_id = this.getNewIdeaAssignmentGroupSysId();
            if (typeof sys_id == "string" && (typeof this._newIdeaAssignmentGroup === "undefined" || this._newIdeaAssignmentGroup.sys_id != sys_id)) {
                var gr = new GlideRecord("sys_user_group");
                gr.addQuery(sys_id);
                gr.query();
                if (gr.next())
                    this._newIdeaAssignmentGroup = gr;
                else
                    this._newIdeaAssignmentGroup = { sys_id: sys_id };
            }
            if (typeof this._newIdeaAssignmentGroup === "object" && this._newIdeaAssignmentGroup instanceof GlideRecord)
                return this._newIdeaAssignmentGroup;
        },
        getDefaultScCatItemApprovalGroupSysId: function () {
            var result = gs.getProperty(USASOCCustomizations.PROPERTYNAME_DEFAULT_SC_CAT_APPROVER_GROUP, "");
            if (result.length > 0)
                return result;
        },
        getDefaultScCatItemApprovalGroup: function () {
            var sys_id = this.getDefaultScCatItemApprovalGroupSysId();
            if (typeof sys_id == "string" && (typeof this._defaultScCatItemApprovalGroup === "undefined" || this._defaultScCatItemApprovalGroup.sys_id != sys_id)) {
                var gr = new GlideRecord("sys_user_group");
                gr.addQuery(sys_id);
                gr.query();
                if (gr.next())
                    this._defaultScCatItemApprovalGroup = gr;
                else
                    this._defaultScCatItemApprovalGroup = { sys_id: sys_id };
            }
            if (typeof this._defaultScCatItemApprovalGroup === "object" && this._defaultScCatItemApprovalGroup instanceof GlideRecord)
                return this._defaultScCatItemApprovalGroup;
        },
        getDefaultScCatItemAssignmentGroupSysId: function () {
            var result = gs.getProperty(USASOCCustomizations.PROPERTYNAME_DEFAULT_SC_CAT_ASSIGNMENT_GROUP, "");
            if (result.length > 0)
                return result;
        },
        getDefaultScCatItemAssignmentGroup: function () {
            var sys_id = this.getDefaultScCatItemAssignmentGroupSysId();
            if (typeof sys_id == "string" && (typeof this._defaultScCatItemAssignmentGroup === "undefined" || this._defaultScCatItemApprovalGroup.sys_id != sys_id)) {
                var gr = new GlideRecord("sys_user_group");
                gr.addQuery(sys_id);
                gr.query();
                if (gr.next())
                    this._defaultScCatItemAssignmentGroup = gr;
                else
                    this._defaultScCatItemAssignmentGroup = { sys_id: sys_id };
            }
            if (typeof this._defaultScCatItemAssignmentGroup === "object" && this._defaultScCatItemAssignmentGroup instanceof GlideRecord)
                return this._defaultScCatItemAssignmentGroup;
        },
        type: "USASOCCustomizations"
    };
    return usasocCustomizationsConstructor;
})();
