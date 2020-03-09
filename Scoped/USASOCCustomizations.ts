/// <reference path="types/index.d.ts" />

/**
 * ServiceNow instance SDLC Stage.
 * 
 * @typedef {("prod" | "uat" | "test" | "dev" | "sb" | "none")} InstanceSdlcStage
 * @description Production=prod,User Acceptance Testing=uat,Pre-Deployment Testing=test,Development=dev,Sandbox=sb,(none)=none
 */
type InstanceSdlcStage = "prod" | "uat" | "test" | "dev" | "sb" | "none";

interface IUSASOCCustomizations extends ICustomClassBase<IUSASOCCustomizations, "USASOCCustomizations"> {
    /**
     * Gets the SDLC Stage for the current ServiceNow instance.
     * @returns {InstanceSdlcStage} The SDLC Stage for the current ServiceNow instance, obtained from the "x_44813_usasoc_cst.instance_sdlc_stage" system property.
     * @description The name of the associated system property is stored in the {@link USASOCCustomizations.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP} variable.
     */
    getInstanceSdlcStage(): InstanceSdlcStage;

    /**
     * Indicates whether the current ServiceNow instance is for production use.
     *
     * @returns {boolean} True if the current ServiceNow isntance is for production use; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} returns "prod".
     */
    isProduction(): boolean;

    /**
     * Indicates whether the current ServiceNow instance is for user-acceptance testing.
     *
     * @returns {boolean} True if the current ServiceNow isntance is for user-acceptance testing; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} returns "uat".
     */
    isUAT(): boolean;

    /**
     * Indicates whether the current ServiceNow instance is for technical pre-production deployment testing.
     *
     * @returns {boolean} True if the current ServiceNow isntance is for technical pre-production deployment testing; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} returns "test".
     */
    isTest(): boolean;

    /**
     * Indicates whether the current ServiceNow instance is for building release packages.
     *
     * @returns {boolean} True if the current ServiceNow isntance is for building release packages; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} returns "dev".
     */
    isDevelopment(): boolean;

    /**
     * Indicates whether the current ServiceNow instance is for research and development purposes.
     *
     * @returns {boolean} True if the current ServiceNow isntance is for research and development purposes; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} returns "sb".
     */
    isSandbox(): boolean;

    /**
     * Indicates whether the current ServiceNow instance does not specify a SDLC stage.
     *
     * @returns {boolean} True if the current ServiceNow isntance does not specify a SDLC stage; otherwise, false.
     * @memberof IUSASOCCustomizations
     * @description This returns true when {@link #getInstanceSdlcStage} does not return "prod", "uat", "test", "dev" or "sb".
     */
    isSdlcDefined(): boolean;

    /**
     * Gets the Sys ID of the default assignment group for new Ideas.
     *
     * @returns {(string | undefined)} The Sys ID of the default assignment group for new Ideas or undefined if the "x_44813_usasoc_cst.idea.new" system property value is not defined.
     * @memberof IUSASOCCustomizations
     * @description The name of the associated system property is stored in the {@link USASOCCustomizations.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP} variable.
     */
    getNewIdeaAssignmentGroupSysId(): string | undefined;

    /**
     * Gets the {@link GlideRecord} of the default assignment group for new Ideas.
     *
     * @returns {(sys_user_groupGlideRecord | undefined)} The {@link GlideRecord} of the default assignment group for new Ideas or undefined if the
     * {@link USASOCCustomizations#getNewIdeaAssignmentGroupSysId} is not a valid group Sys ID.
     * @memberof IUSASOCCustomizations
     */
    getNewIdeaAssignmentGroup(): sys_user_groupGlideRecord | undefined;
}
interface IUSASOCCustomizationsPrototype extends ICustomClassPrototype0<IUSASOCCustomizations, IUSASOCCustomizationsPrototype, "USASOCCustomizations">, IUSASOCCustomizations {
    _newIdeaAssignmentGroup?: sys_user_groupGlideRecord | { sys_id: string; }
    _defaultScCatItemApprovalGroup?: sys_user_groupGlideRecord | { sys_id: string; }
    _defaultScCatItemAssignmentGroup?: sys_user_groupGlideRecord | { sys_id: string; }
}

interface USASOCCustomizations extends Readonly<IUSASOCCustomizations> { }
interface USASOCCustomizationsConstructor extends CustomClassConstructor0<IUSASOCCustomizations, IUSASOCCustomizationsPrototype, USASOCCustomizations> {
    /**
     * The name of event for newly submitted task-based records that are not assigned.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst.task.unassigned"}
     * @memberof USASOCCustomizationsConstructor
     */
    EVENTNAME_TASK_UNASSIGNED: "x_44813_usasoc_cst.task.unassigned";

    /**
     * The name of event for newly submitted Ideas.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst.idea.new"}
     * @memberof USASOCCustomizationsConstructor
     */
    EVENTNAME_TASK_IDEA_NEW: "x_44813_usasoc_cst.idea.new";

    /**
     * The name of category for custom USASOC system properties.
     *
     * @static
     * @readonly
     * @type {"USASOC Customization Settings"}
     * @memberof USASOCCustomizationsConstructor
     */
    PROPERTY_CATEGORY: "USASOC Customization Settings";

    /**
     * The name of system property that contains the SDLC-related usage for the current ServiceNow instance.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst.instance_sdlc_stage"}
     * @memberof USASOCCustomizationsConstructor
     * @see {InstanceSdlcStage} for values that can be stored by this property.
     */
    PROPERTYNAME_INSTANCE_SDLC_STAGE: "x_44813_usasoc_cst.instance_sdlc_stage";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance is for production use.
     *
     * @static
     * @readonly
     * @type {"prod"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_PRODUCTION: "prod";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance is for user-acceptance testing.
     *
     * @static
     * @readonly
     * @type {"uat"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_UAT: "uat";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance is for technical pre-production deployment testing.
     *
     * @static
     * @readonly
     * @type {"test"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_TEST: "test";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance is for building release packages.
     *
     * @static
     * @readonly
     * @type {"dev"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_DEVELOPMENT: "dev";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance is for research and development purposes.
     *
     * @static
     * @readonly
     * @type {"sb"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_SANDBOX: "sb";

    /**
     * The value of the "x_44813_usasoc_cst.instance_sdlc_stage" system property ({@link #getInstanceSdlcStage}) when the current ServiceNow instance does not pertain to a specific SDLC-relate purpose.
     *
     * @static
     * @readonly
     * @type {"none"}
     * @memberof USASOCCustomizationsConstructor
     */
    SDLC_STAGE_NONE: "none";

    /**
     * The name of system property that contains the base URL of the default GIT repository used version control of ServiceNow applications.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst.default_git_instance_base_url"}
     * @memberof USASOCCustomizationsConstructor
     */
    PROPERTYNAME_DEFAULT_GIT_INSTANCE_BASE_URL: "x_44813_usasoc_cst.default_git_instance_base_url";

    /**
     * The name of the system property that contains the Sys ID of the assignment group for newly-submitted ideas.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst.new_idea_assignment_group"}
     * @memberof USASOCCustomizationsConstructor
     */
    PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP: "x_44813_usasoc_cst.new_idea_assignment_group";

    /**
     * The name of the database that defines location-based approval groups.
     *
     * @static
     * @readonly
     * @type {"x_44813_usasoc_cst_location_approvers"}
     * @memberof USASOCCustomizationsConstructor
     */
    TABLENAME_LOCATION_APPROVERS: "x_44813_usasoc_cst_location_approvers";

    /**
     * A {@link RegExp} that matches a valid ServiceNow Sys ID string.
     *
     * @static
     * @readonly
     * @type {RegExp}
     * @memberof USASOCCustomizationsConstructor
     */
    REGEX_SYS_ID: RegExp;

    new(): USASOCCustomizations;
    (): USASOCCustomizations;

    /**
     * Converts a value to a JavaScript string that contains a Sys ID.
     *
     * @static
     * @readonly
     * @param {*} sys_id The value to convert.
     * @returns {(string | undefined)} The value as a JavaScript string containing a Sys ID or undefined if the converted string value does not match {@link .REGEX_SYS_ID}.
     * @memberof USASOCCustomizationsConstructor
     */
    asSysIdStringOrUndefined(sys_id: any): string | undefined;

    /**
     * Tests whether an object is a {@link GlideRecord} whose table extends from the "task" table.
     *
     * @static
     * @readonly
     * @param {*} obj The object to test.
     * @returns {obj is taskGlideRecord} True if the object is a {@link GlideRecord} whose table extends from the "task" table; otherwise, false.
     * @memberof USASOCCustomizationsConstructor
     */
    isTaskGlideRecord(obj: any): obj is taskGlideRecord;

    /**
     * Tests whether a {@link $$element.IDBObject} is a {@link GlideRecord} or {@link IGlideElement} whose table matches or extends the name of a specified table.
     *
     * @static
     * @readonly
     * @param {$$element.IDbObject} obj The object to test.
     * @param {string} tableName The name of the table or parent table to match.
     * @returns {boolean} true if the object is a {@link GlideRecord} or {@link IGlideElement} whose table matches or extends the name of a specified table; otherwise, false.
     * @memberof USASOCCustomizationsConstructor
     */
    extendsTable(obj: $$element.IDbObject, tableName: string): boolean;

    /**
     * Tests whether an object is a {@link GlideRecord} or {@link IGlideElement} whose table extends from the "task" table.
     *
     * @static
     * @readonly
     * @param {*} obj The object to test.
     * @returns {obj is taskFields} true if the object is a {@link GlideRecord} or {@link IGlideElement} whose table extends from the "task" table; otherwise, false.
     * @memberof USASOCCustomizationsConstructor
     */
    isTaskElement(obj: any): obj is taskFields;
}

const USASOCCustomizations: Readonly<USASOCCustomizationsConstructor> & { new(): USASOCCustomizations; } = (function (): USASOCCustomizationsConstructor {
    var usasocCustomizationsConstructor: USASOCCustomizationsConstructor = Class.create();
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
    usasocCustomizationsConstructor.asSysIdStringOrUndefined = function(sys_id: any): string | undefined {
        if (!gs.nil(sys_id)) {
            sys_id = ('' + sys_id).trim();
            if (USASOCCustomizations.REGEX_SYS_ID.test(sys_id))
                return sys_id;
        }
    };
    usasocCustomizationsConstructor.extendsTable = function (obj: $$element.IDbObject, tableName: string): boolean {
        if (typeof obj === 'object' && null !== obj && obj.getTableName) {
            var n: string = obj.getTableName();
            if (typeof n !== 'undefined' && null != n && (n = ('' + n).trim()).length > 0) {
                if (n == tableName)
                    return true;
                var h: GlideTableHierarchy = new GlideTableHierarchy(n);
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
    usasocCustomizationsConstructor.isTaskGlideRecord = function (obj: $$element.IDbObject): obj is taskGlideRecord {
        if (typeof obj === 'object' && null !== obj && obj.getTableName) {
            var n: string = obj.getTableName();
            if (typeof n !== 'undefined' && null != n && (n = ('' + n).trim()).length > 0) {
                if (n == 'task')
                    return true;
                var h: GlideTableHierarchy = new GlideTableHierarchy(n);
                return !h.isBaseClass() && h.getRoot() == 'task';
            }
        }
        return false;
    };
    usasocCustomizationsConstructor.prototype = {
        initialize: function (this: IUSASOCCustomizationsPrototype): void {
        },
        getInstanceSdlcStage: function (this: IUSASOCCustomizationsPrototype): InstanceSdlcStage {
            var result: string = '' + gs.getProperty(USASOCCustomizations.PROPERTYNAME_INSTANCE_SDLC_STAGE, "");
            switch (result.toLowerCase()) {
                case USASOCCustomizations.SDLC_STAGE_PRODUCTION:
                case USASOCCustomizations.SDLC_STAGE_UAT:
                case USASOCCustomizations.SDLC_STAGE_TEST:
                case USASOCCustomizations.SDLC_STAGE_DEVELOPMENT:
                case USASOCCustomizations.SDLC_STAGE_SANDBOX:
                    return <InstanceSdlcStage>result;
            }
            return USASOCCustomizations.SDLC_STAGE_NONE;
        },
        isProduction: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_PRODUCTION;
        },
        isUAT: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_UAT;
        },
        isTest: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_TEST;
        },
        isDevelopment: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_DEVELOPMENT;
        },
        isSandbox: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_SANDBOX;
        },
        isSdlcDefined: function (this: IUSASOCCustomizationsPrototype): boolean {
            return this.getInstanceSdlcStage() == USASOCCustomizations.SDLC_STAGE_NONE;
        },
        getNewIdeaAssignmentGroupSysId: function (this: IUSASOCCustomizationsPrototype): string | undefined {
            var result: string = gs.getProperty(USASOCCustomizations.PROPERTYNAME_NEW_IDEA_ASSIGNMENT_GROUP, "");
            if (result.length > 0)
                return result;
        },
        getNewIdeaAssignmentGroup: function (this: IUSASOCCustomizationsPrototype): sys_user_groupGlideRecord | undefined {
            var sys_id: string = this.getNewIdeaAssignmentGroupSysId();
            if (typeof sys_id == "string" && (typeof this._newIdeaAssignmentGroup === "undefined" || this._newIdeaAssignmentGroup.sys_id != sys_id)) {
                var gr: sys_user_groupGlideRecord = <sys_user_groupGlideRecord>new GlideRecord("sys_user_group");
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