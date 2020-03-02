/// <reference path="types/service-now/index.d.ts" />
var USASOCCustomizations = (function () {
    var usasocCustomizationsConstructor = Class.create();
    usasocCustomizationsConstructor.EVENTNAME_TASK_UNASSIGNED = "x_44813_usasoc_cst.task.unassigned";
    usasocCustomizationsConstructor.EVENTNAME_TASK_IDEA_NEW = "x_44813_usasoc_cst.idea.new";
    usasocCustomizationsConstructor.PROPERTY_CATEGORY = "USASOC Customization Settings";
    usasocCustomizationsConstructor.PROPERTYNAME_INSTANCE_SDLC_STAGE = "x_44813_usasoc_cst.instance_sdlc_stage";
    usasocCustomizationsConstructor.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP = "x_44813_usasoc_cst.new_idea_assignment_group";
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
                var gr = new GlideRecord("");
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
//# sourceMappingURL=USASOCCustomizations.js.map