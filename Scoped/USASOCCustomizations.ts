/// <reference path="types/service-now/index.d.ts" />

//System Properties
//URL (from arguents)
//system_properties_ui.do?sysparm_title=General%20Customization%20Settings&sysparm_category=USASOC Customization Settings

// SDLC Stage for the current ServiceNow instance
// x_44813_usasoc_cst.instance_sdlc_stage
// Production=prod,User Acceptance Testing=uat,Pre-Deployment Testing=test,Development=dev,Sandbox=sb,(none)=none

// Sys ID of Assignment Group for new Ideas.
// x_44813_usasoc_cst.new_idea_assignment_group

/**
 * ServiceNow instance SDLC Stage.
 * Production=prod,User Acceptance Testing=uat,Pre-Deployment Testing=test,Development=dev,Sandbox=sb,(none)=none
 */
type InstanceSdlcStage = "prod" | "uat" | "test" | "dev" | "sb" | "none";

interface IUSASOCCustomizations extends ICustomClassBase<IUSASOCCustomizations, "USASOCCustomizations"> {
    /**
     * Gets the SDLC Stage for the current ServiceNow instance.
     * @returns {InstanceSdlcStage} The SDLC Stage for the current ServiceNow instance.
     */
    getInstanceSdlcStage(): InstanceSdlcStage;
    getNewIdeaAssignmentGroupSysId(): string | undefined;
    getNewIdeaAssignmentGroup(): sys_user_groupGlideRecord | undefined;
}
interface IUSASOCCustomizationsPrototype extends ICustomClassPrototype0<IUSASOCCustomizations, IUSASOCCustomizationsPrototype, "USASOCCustomizations">, IUSASOCCustomizations {
    _newIdeaAssignmentGroup?: sys_user_groupGlideRecord | { sys_id: string; }
}
interface USASOCCustomizations extends Readonly<IUSASOCCustomizations> { }
interface USASOCCustomizationsConstructor extends CustomClassConstructor0<IUSASOCCustomizations, IUSASOCCustomizationsPrototype, USASOCCustomizations> {
    EVENTNAME_TASK_UNASSIGNED: "x_44813_usasoc_cst.task.unassigned";
    EVENTNAME_TASK_IDEA_NEW: "x_44813_usasoc_cst.idea.new";
    PROPERTY_CATEGORY: "USASOC Customization Settings";
    PROPERTYNAME_INSTANCE_SDLC_STAGE: "x_44813_usasoc_cst.instance_sdlc_stage";
    PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP: "x_44813_usasoc_cst.new_idea_assignment_group";
    new(): USASOCCustomizations;
    (): USASOCCustomizations;
}

const USASOCCustomizations: Readonly<USASOCCustomizationsConstructor> & { new(): USASOCCustomizations; } = (function (): USASOCCustomizationsConstructor {
    var usasocCustomizationsConstructor: USASOCCustomizationsConstructor = Class.create();
    usasocCustomizationsConstructor.EVENTNAME_TASK_UNASSIGNED = "x_44813_usasoc_cst.task.unassigned";
    usasocCustomizationsConstructor.EVENTNAME_TASK_IDEA_NEW = "x_44813_usasoc_cst.idea.new";
    usasocCustomizationsConstructor.PROPERTY_CATEGORY = "USASOC Customization Settings";
    usasocCustomizationsConstructor.PROPERTYNAME_INSTANCE_SDLC_STAGE = "x_44813_usasoc_cst.instance_sdlc_stage";
    usasocCustomizationsConstructor.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP = "x_44813_usasoc_cst.new_idea_assignment_group";

    usasocCustomizationsConstructor.prototype = {
        initialize: function (this: IUSASOCCustomizationsPrototype): void {
        },
        getInstanceSdlcStage: function (this: IUSASOCCustomizationsPrototype): InstanceSdlcStage {
            var result: string = gs.getProperty(USASOCCustomizations.PROPERTYNAME_INSTANCE_SDLC_STAGE, "");
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
        getNewIdeaAssignmentGroupSysId: function (this: IUSASOCCustomizationsPrototype): string | undefined {
            var result: string = gs.getProperty(USASOCCustomizations.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP, "");
            if (result.length > 0)
                return result;
        },
        getNewIdeaAssignmentGroup: function (this: IUSASOCCustomizationsPrototype): sys_user_groupGlideRecord | undefined {
            var sys_id: string = this.getNewIdeaAssignmentGroupSysId();
            if (typeof sys_id == "string" && (typeof this._newIdeaAssignmentGroup === "undefined" || this._newIdeaAssignmentGroup.sys_id != sys_id)) {
                var gr: sys_user_groupGlideRecord = <sys_user_groupGlideRecord>new GlideRecord("");
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