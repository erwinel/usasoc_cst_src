/// <reference path="types/index.d.ts" />
var USASOCCustomizations = (function () {
    var usasocCustomizationsConstructor = Class.create();
    usasocCustomizationsConstructor.EVENTNAME_TASK_UNASSIGNED = "x_44813_usasoc_cst.task.unassigned";
    usasocCustomizationsConstructor.EVENTNAME_TASK_IDEA_NEW = "x_44813_usasoc_cst.idea.new";
    usasocCustomizationsConstructor.PROPERTY_CATEGORY = "USASOC Customization Settings";
    usasocCustomizationsConstructor.PROPERTYNAME_INSTANCE_SDLC_STAGE = "x_44813_usasoc_cst.instance_sdlc_stage";
    usasocCustomizationsConstructor.SDLC_STAGE_PRODUCTION = "prod";
    usasocCustomizationsConstructor.SDLC_STAGE_UAT = "uat";
    usasocCustomizationsConstructor.SDLC_STAGE_TEST = "test";
    usasocCustomizationsConstructor.SDLC_STAGE_DEVELOPMENT = "dev";
    usasocCustomizationsConstructor.SDLC_STAGE_SANDBOX = "sb";
    usasocCustomizationsConstructor.SDLC_STAGE_NONE = "none";
    usasocCustomizationsConstructor.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP = "x_44813_usasoc_cst.new_idea_assignment_group";
    usasocCustomizationsConstructor.PROPERTYNAME_DEFAULT_GIT_INSTANCE_BASE_URL = "x_44813_usasoc_cst.default_git_instance_base_url";
    usasocCustomizationsConstructor.TABLENAME_LOCATION_APPROVERS = "x_44813_usasoc_cst_location_approvers";
    usasocCustomizationsConstructor.REGEX_SYS_ID = /^[a-fA-F\d]{32}$/;
    usasocCustomizationsConstructor.asSysIdStringOrUndefined = function (sys_id) {
        if (!gs.nil(sys_id)) {
            sys_id = ('' + sys_id).trim();
            if (USASOCCustomizations.REGEX_SYS_ID.test(sys_id))
                return sys_id;
        }
    };
    usasocCustomizationsConstructor.extendsTable = function (obj, tableName) {
        if (typeof obj === 'object' && null !== obj && obj.getTableName) {
            var n = obj.getTableName();
            if (typeof n !== 'undefined' && null != n && (n = ('' + n).trim()).length > 0) {
                if (n == tableName)
                    return true;
                var h = new GlideTableHierarchy(n);
                while (!h.isBaseClass()) {
                    n = h.getBase();
                    if (n == tableName)
                        return true;
                    h = new GlideTableHierarchy(n);
                }
            }
        }
        return false;
    };
    usasocCustomizationsConstructor.isTaskGlideRecord = function (obj) {
        if (typeof obj === 'object' && null !== obj && obj.getTableName) {
            var n = obj.getTableName();
            if (typeof n !== 'undefined' && null != n && (n = ('' + n).trim()).length > 0) {
                if (n == 'task')
                    return true;
                var h = new GlideTableHierarchy(n);
                return !h.isBaseClass() && h.getRoot() == 'task';
            }
        }
        return false;
    };
    usasocCustomizationsConstructor.prototype = {
        initialize: function () {
        },
        getInstanceSdlcStage: function () {
            var result = '' + gs.getProperty(USASOCCustomizations.PROPERTYNAME_INSTANCE_SDLC_STAGE, "");
            switch (result.toLowerCase()) {
                case USASOCCustomizations.SDLC_STAGE_PRODUCTION:
                case USASOCCustomizations.SDLC_STAGE_UAT:
                case USASOCCustomizations.SDLC_STAGE_TEST:
                case USASOCCustomizations.SDLC_STAGE_DEVELOPMENT:
                case USASOCCustomizations.SDLC_STAGE_SANDBOX:
                    return result;
            }
            return USASOCCustomizations.SDLC_STAGE_NONE;
        },
        isProduction: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_PRODUCTION;
        },
        isUAT: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_UAT;
        },
        isTest: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_TEST;
        },
        isDevelopment: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_DEVELOPMENT;
        },
        isSandbox: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_SANDBOX;
        },
        isSdlcDefined: function () {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_NONE;
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
        type: "USASOCCustomizations"
    };
    return usasocCustomizationsConstructor;
})();
