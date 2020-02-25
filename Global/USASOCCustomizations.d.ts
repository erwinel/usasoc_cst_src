/// <reference path="SnTypings/base.d.ts" />

declare namespace x_44813_usasoc_cst {
	/**
	 * ServiceNow instance SDLC Stage.
	 * Production=prod,User Acceptance Testing=uat,Pre-Deployment Testing=test,Development=dev,Sandbox=sb,(none)=none
	 */
	export type InstanceSdlcStage = "prod" | "uat" | "test" | "dev" | "sb" | "none";
	export class USASOCCustomizations {
		constructor();
		static readonly EVENTNAME_TASK_UNASSIGNED: "x_44813_usasoc_cst.task.unassigned";
		static readonly EVENTNAME_TASK_IDEA_NEW: "x_44813_usasoc_cst.idea.new";
		static readonly PROPERTY_CATEGORY: "USASOC Customization Settings";
		static readonly PROPERTYNAME_INSTANCE_SDLC_STAGE: "x_44813_usasoc_cst.instance_sdlc_stage";
		static readonly PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP: "x_44813_usasoc_cst.new_idea_assignment_group";
		readonly type: "USASOCCustomizations";
		/**
		 * Gets the SDLC Stage for the current ServiceNow instance.
		 * @returns {InstanceSdlcStage} The SDLC Stage for the current ServiceNow instance.
		 */
		getInstanceSdlcStage(): InstanceSdlcStage;
		getNewIdeaAssignmentGroupSysId(): string | undefined;
		getNewIdeaAssignmentGroup(): sys_user_groupGlideRecord | undefined;
	}
}