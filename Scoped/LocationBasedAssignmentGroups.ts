/// <reference path="types/index.d.ts" />
/// <reference path="TaskHelper.ts" />

type USASOC_CST_ASSIGNMENT_GROUP_TYPE = "assignment" | "approval" | "any";
type USASOC_CST_ASSIGNMENT_RULE_TYPE = "all" | "any";

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
type org_based_assigment_groupsGlideRecord = GlideRecord & org_based_assigment_groupsFields;
type org_based_assigment_groupsElement = $$element.Reference<org_based_assigment_groupsFields, org_based_assigment_groupsGlideRecord>;
type org_based_assigment_groupsProperty = $$property.generic.ReferenceProperty<org_based_assigment_groupsFields, org_based_assigment_groupsGlideRecord, org_based_assigment_groupsElement>;

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
interface LocationBasedAssignmentGroups extends Readonly<ILocationBasedAssignmentGroups> { }
interface LocationBasedAssignmentGroupsConstructor extends CustomClassConstructor0<ILocationBasedAssignmentGroups, ILocationBasedAssignmentGroupsPrototype, LocationBasedAssignmentGroups>, AbstractAjaxProcessorConstructor {
    new(): LocationBasedAssignmentGroups;
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

const LocationBasedAssignmentGroups: Readonly<LocationBasedAssignmentGroupsConstructor> & { new(): LocationBasedAssignmentGroups; } = (function (): LocationBasedAssignmentGroupsConstructor {
    var LocationBasedAssignmentGroups: LocationBasedAssignmentGroupsConstructor = Class.create();

    var privateData: LocationBasedAssignmentGroupsPrivate = {};

    function getSysId(target: any): string | undefined {
        if (!gs.nil(target)) {
            var sys_id: $$rhino.Nilable<$$property.Element> | string = (<IGlideTableProperties>target).sys_id;
            if (!gs.nil(sys_id)) {
                if ((sys_id = '' + sys_id).length > 0)
                    return sys_id;
            }
            if ((sys_id = '' + target).length > 0 && sys_id.match(/^[a-fA-F\d]{32}$/))
                return target;
        }
    }

    //function getDefaultApprovalGroupByLocation(user: sys_userFields): sys_user_groupFields | undefined {
        
    //    var rules: IRuleCacheItem[] = TaskHelper.getLocationApproverRules();
    //    var bld: string = getSysId(user.building);
    //    var bu: string = getSysId(getBusinessUnit(user));
    //    var c: string = getSysId(getCompany(user));
    //    var d: string = getSysId(user.department);
    //    var l: string = getSysId(getLocation(user));
    //    for (let index = 0; index < rules.length; index++) {
    //        const r = rules[index];
    //        if (r.type == "any") {
    //            if ((typeof r.building !== 'undefined' && r.building == bld) || (typeof r.business_unit !== 'undefined' && r.business_unit == bu) ||
    //                (typeof r.company !== 'undefined' && r.company == c) || (typeof r.department !== 'undefined' && r.department == d) ||
    //                (typeof r.location !== 'undefined' && r.location == l))
    //                return r.approval_group;
    //        } else if ((typeof r.building !== 'undefined' || r.building == bld) && (typeof r.business_unit !== 'undefined' || r.business_unit == bu) &&
    //            (typeof r.company !== 'undefined' || r.company == c) && (typeof r.department !== 'undefined' || r.department == d) &&
    //            (typeof r.location !== 'undefined' || r.location == l))
    //            return r.approval_group;
    //    }
    //}
    LocationBasedAssignmentGroups.getAssignmentGroupRules = function (): IAssignmentGroupRule[] {
        if (typeof privateData._assignmentGroupRules !== 'undefined')
            return privateData._assignmentGroupRules;
        privateData._assignmentGroupRules = [];
        var gr: org_based_assigment_groupsGlideRecord = <org_based_assigment_groupsGlideRecord>new GlideRecord(LocationBasedAssignmentGroups.RULES_TABLE_NAME);
        gr.addActiveQuery();
        gr.orderBy('order');
        gr.query();
        var ruleNumber = 0;
        while (gr.next()) {
            ruleNumber++;
            var item: IAssignmentGroupRule = {
                group: {
                    sys_id: '' + (<sys_user_groupFields>gr.group).sys_id,
                    name: '' + (<sys_user_groupFields>gr.group).name
                },
                match_any: gr.rule_type == LocationBasedAssignmentGroups.GROUP_TYPE_ANY,
                title: (gs.nil(gr.short_description)) ? 'Rule ' + ruleNumber + ' (' + gr.sys_id + ')' : 'Rule ' + ruleNumber + ': ' + gr.short_description,
                assignment: gr.assignment_type != LocationBasedAssignmentGroups.GROUP_TYPE_APPROVAL,
                approval: gr.assignment_type != LocationBasedAssignmentGroups.GROUP_TYPE_ASSIGNMENT
            };
            if (!gs.nil(gr.building))
                item.building = {
                    sys_id: '' + (<cmn_buildingFields>gr.building).sys_id,
                    name: '' + (<cmn_buildingFields>gr.building).name
                };
            if (!gs.nil(gr.location))
                item.building = {
                    sys_id: '' + (<cmn_locationFields>gr.location).sys_id,
                    name: '' + (<cmn_locationFields>gr.location).name
                };
            if (!gs.nil(gr.department))
                item.department = {
                    sys_id: '' + (<cmn_departmentFields>gr.department).sys_id,
                    name: '' + (<cmn_departmentFields>gr.department).name
                };
            if (!gs.nil(gr.business_unit))
                item.business_unit = {
                    sys_id: '' + (<business_unitFields>gr.business_unit).sys_id,
                    name: '' + (<business_unitFields>gr.business_unit).name
                };
            if (!gs.nil(gr.company))
                item.company = {
                    sys_id: '' + (<core_companyFields>gr.company).sys_id,
                    name: '' + (<core_companyFields>gr.company).name
                };
            privateData._assignmentGroupRules.push(item);
        }
        return privateData._assignmentGroupRules;
    }
    function getMatchingRule(target: taskFields | sys_userFields, approval: boolean): IAssignmentGroupRule | undefined {
        var rules: IAssignmentGroupRule[] = LocationBasedAssignmentGroups.getAssignmentGroupRules();
        var caller: sys_userFields;

        if (target.getTableName() == "sys_user")
            caller = <sys_userFields>target;
        else {
            caller = TaskHelper.getCaller(<taskFields>target);
            if (gs.nil(caller)) {
                caller = <sys_userGlideRecord>new GlideRecord("sys_user");
                (<sys_userGlideRecord>caller).addQuery('sys_id', gs.getUserID());
                (<sys_userGlideRecord>caller).query();
                (<sys_userGlideRecord>caller).next();
            }
        }
        var bld: string = getSysId((<sys_userFields>target).building);
        var bu: string = getSysId(TaskHelper.getBusinessUnit(target));
        var c: string = getSysId(TaskHelper.getCompany(target));
        var d: string = getSysId(caller.department);
        var l: string = getSysId(TaskHelper.getLocation(target));
        for (let index = 0; index < rules.length; index++) {
            const r: IAssignmentGroupRule = rules[index];
            if (r.approval == approval) {
                if (r.match_any) {
                    if ((typeof r.building !== 'undefined' && r.building.sys_id == bld) || (typeof r.business_unit !== 'undefined' && r.business_unit.sys_id == bu) ||
                        (typeof r.company !== 'undefined' && r.company.sys_id == c) || (typeof r.department !== 'undefined' && r.department.sys_id == d) ||
                        (typeof r.location !== 'undefined' && r.location.sys_id == l))
                        return r;
                } else if ((typeof r.building !== 'undefined' || r.building == bld) && (typeof r.business_unit !== 'undefined' || r.business_unit == bu) &&
                    (typeof r.company !== 'undefined' || r.company == c) && (typeof r.department !== 'undefined' || r.department == d) &&
                    (typeof r.location !== 'undefined' || r.location == l))
                    return r;
            }
        }
    }
    function getGroup(target: taskFields | sys_userFields, approval: boolean): sys_user_groupGlideRecord | undefined {
        var rule: IAssignmentGroupRule | undefined = getMatchingRule(target, true);
        if (typeof rule !== 'undefined') {
            var gr: sys_user_groupGlideRecord = <sys_user_groupGlideRecord>new GlideRecord('sys_user_group');
            gr.addQuery('sys_id', rule.group.sys_id);
            gr.query();
            if (gr.next)
                return gr;
        }
    }

    LocationBasedAssignmentGroups.getApprovalGroupId = function (target: taskFields | sys_userFields): string | undefined {
        var rule: IAssignmentGroupRule | undefined = getMatchingRule(target, true);
        if (typeof rule !== 'undefined')
            return rule.group.sys_id;
    };
    LocationBasedAssignmentGroups.getApprovalGroup = function (target: taskFields | sys_userFields): sys_user_groupGlideRecord | undefined {
        return getGroup(target, true);
    };
    LocationBasedAssignmentGroups.getAssignmentGroupId = function (target: taskFields | sys_userFields): string | undefined {
        var rule: IAssignmentGroupRule | undefined = getMatchingRule(target, false);
        if (typeof rule !== 'undefined')
            return rule.group.sys_id;
    };
    LocationBasedAssignmentGroups.getAssignmentGroup = function (target: taskFields | sys_userFields): sys_user_groupGlideRecord | undefined {
        return getGroup(target, false);
    };
    LocationBasedAssignmentGroups.prototype = Object.extendsObject<IAbstractAjaxProcessor, ILocationBasedAssignmentGroupsExt, ILocationBasedAssignmentGroupsPrototype>(global.AbstractAjaxProcessor, <ILocationBasedAssignmentGroupsPrototype>{
        getApprovalGroup: function (this: ILocationBasedAssignmentGroupsPrototype): void {
            
        },
        getAssignmentGroup: function (this: ILocationBasedAssignmentGroupsPrototype): void {

        },
        type: "LocationBasedAssignmentGroups"
    });



    return LocationBasedAssignmentGroups;
})();