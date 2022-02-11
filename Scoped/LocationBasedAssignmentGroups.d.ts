/// <reference path="types/index.d.ts" />
/// <reference path="TaskHelper.d.ts" />
declare type USASOC_CST_ASSIGNMENT_GROUP_TYPE = "assignment" | "approval" | "any";
declare type USASOC_CST_ASSIGNMENT_RULE_TYPE = "all" | "any";
interface org_based_assigment_groupsFields extends IGlideTableProperties {
    group: sys_user_groupProperty;
    building: $$rhino.Nilable<cmn_buildingProperty>;
    location: $$rhino.Nilable<cmn_locationProperty>;
    department: $$rhino.Nilable<cmn_departmentProperty>;
    business_unit: $$rhino.Nilable<business_unitProperty>;
    company: $$rhino.Nilable<core_companyProperty>;
    assignment_type: $$property.generic.Element<USASOC_CST_ASSIGNMENT_GROUP_TYPE>;
    rule_type: $$property.generic.Element<USASOC_CST_ASSIGNMENT_RULE_TYPE>;
    short_description: $$rhino.Nilable<$$property.Element>;
    description: $$rhino.Nilable<$$property.Element>;
    order: $$property.Numeric;
    active: $$property.Boolean;
    getTableName(): "x_44813_usasoc_cst_org_based_assigment_groups";
}
declare type org_based_assigment_groupsGlideRecord = GlideRecord & org_based_assigment_groupsFields;
declare type org_based_assigment_groupsElement = $$element.Reference<org_based_assigment_groupsFields, org_based_assigment_groupsGlideRecord>;
declare type org_based_assigment_groupsProperty = $$property.generic.ReferenceProperty<org_based_assigment_groupsFields, org_based_assigment_groupsGlideRecord, org_based_assigment_groupsElement>;
interface ISysIdAndName {
    sys_id: string;
    name: string;
}
interface IAssignmentGroupRule {
    group: ISysIdAndName;
    building?: ISysIdAndName;
    location?: ISysIdAndName;
    department?: ISysIdAndName;
    business_unit?: ISysIdAndName;
    company?: ISysIdAndName;
    approval: boolean;
    assignment: boolean;
    match_any: boolean;
    title: string;
}
interface ILocationBasedAssignmentGroupsExt extends ICustomClassBase<ILocationBasedAssignmentGroups, "LocationBasedAssignmentGroups"> {
}
interface ILocationBasedAssignmentGroups extends ILocationBasedAssignmentGroupsExt, Omit<IAbstractAjaxProcessor, "type"> {
}
interface ILocationBasedAssignmentGroupsPrototype extends ICustomClassPrototype0<ILocationBasedAssignmentGroups, ILocationBasedAssignmentGroupsPrototype, "LocationBasedAssignmentGroups">, ILocationBasedAssignmentGroups {
    getApprovalGroup(): void;
    getAssignmentGroup(): void;
}
interface LocationBasedAssignmentGroups extends Readonly<ILocationBasedAssignmentGroups> {
}
interface LocationBasedAssignmentGroupsConstructor extends CustomClassConstructor0<ILocationBasedAssignmentGroups, ILocationBasedAssignmentGroupsPrototype, LocationBasedAssignmentGroups>, AbstractAjaxProcessorConstructor {
    new (): LocationBasedAssignmentGroups;
    (): LocationBasedAssignmentGroups;
    getAssignmentGroupRules(): IAssignmentGroupRule[];
    getApprovalGroupId(target: taskFields | sys_userFields): string | undefined;
    getApprovalGroup(target: taskFields | sys_userFields): sys_user_groupGlideRecord | undefined;
    getAssignmentGroupId(target: taskFields | sys_userFields): string | undefined;
    getAssignmentGroup(target: taskFields | sys_userFields): sys_user_groupGlideRecord | undefined;
    RULE_TYPE_ALL: "all";
    RULE_TYPE_ANY: "any";
    GROUP_TYPE_ASSIGNMENT: "assignment";
    GROUP_TYPE_APPROVAL: "approval";
    GROUP_TYPE_ANY: "any";
    RULES_TABLE_NAME: "x_44813_usasoc_cst_org_based_assigment_groups";
}
interface LocationBasedAssignmentGroupsPrivate {
    _assignmentGroupRules?: IAssignmentGroupRule[];
}
declare const LocationBasedAssignmentGroups: Readonly<LocationBasedAssignmentGroupsConstructor> & {
    new (): LocationBasedAssignmentGroups;
};
