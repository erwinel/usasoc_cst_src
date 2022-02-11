/// <reference path="types/index.d.ts" />
/// <reference path="TaskHelper.ts" />
var LocationBasedAssignmentGroups = (function () {
    var LocationBasedAssignmentGroups = Class.create();
    var privateData = {};
    function getSysId(target) {
        if (!gs.nil(target)) {
            var sys_id = target.sys_id;
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
    LocationBasedAssignmentGroups.getAssignmentGroupRules = function () {
        if (typeof privateData._assignmentGroupRules !== 'undefined')
            return privateData._assignmentGroupRules;
        privateData._assignmentGroupRules = [];
        var gr = new GlideRecord(LocationBasedAssignmentGroups.RULES_TABLE_NAME);
        gr.addActiveQuery();
        gr.orderBy('order');
        gr.query();
        var ruleNumber = 0;
        while (gr.next()) {
            ruleNumber++;
            var item = {
                group: {
                    sys_id: '' + gr.group.sys_id,
                    name: '' + gr.group.name
                },
                match_any: gr.rule_type == LocationBasedAssignmentGroups.GROUP_TYPE_ANY,
                title: (gs.nil(gr.short_description)) ? 'Rule ' + ruleNumber + ' (' + gr.sys_id + ')' : 'Rule ' + ruleNumber + ': ' + gr.short_description,
                assignment: gr.assignment_type != LocationBasedAssignmentGroups.GROUP_TYPE_APPROVAL,
                approval: gr.assignment_type != LocationBasedAssignmentGroups.GROUP_TYPE_ASSIGNMENT
            };
            if (!gs.nil(gr.building))
                item.building = {
                    sys_id: '' + gr.building.sys_id,
                    name: '' + gr.building.name
                };
            if (!gs.nil(gr.location))
                item.building = {
                    sys_id: '' + gr.location.sys_id,
                    name: '' + gr.location.name
                };
            if (!gs.nil(gr.department))
                item.department = {
                    sys_id: '' + gr.department.sys_id,
                    name: '' + gr.department.name
                };
            if (!gs.nil(gr.business_unit))
                item.business_unit = {
                    sys_id: '' + gr.business_unit.sys_id,
                    name: '' + gr.business_unit.name
                };
            if (!gs.nil(gr.company))
                item.company = {
                    sys_id: '' + gr.company.sys_id,
                    name: '' + gr.company.name
                };
            privateData._assignmentGroupRules.push(item);
        }
        return privateData._assignmentGroupRules;
    };
    function getMatchingRule(target, approval) {
        var rules = LocationBasedAssignmentGroups.getAssignmentGroupRules();
        var caller;
        if (target.getTableName() == "sys_user")
            caller = target;
        else {
            caller = TaskHelper.getCaller(target);
            if (gs.nil(caller)) {
                caller = new GlideRecord("sys_user");
                caller.addQuery('sys_id', gs.getUserID());
                caller.query();
                caller.next();
            }
        }
        var bld = getSysId(target.building);
        var bu = getSysId(TaskHelper.getBusinessUnit(target));
        var c = getSysId(TaskHelper.getCompany(target));
        var d = getSysId(caller.department);
        var l = getSysId(TaskHelper.getLocation(target));
        for (var index = 0; index < rules.length; index++) {
            var r = rules[index];
            if (r.approval == approval) {
                if (r.match_any) {
                    if ((typeof r.building !== 'undefined' && r.building.sys_id == bld) || (typeof r.business_unit !== 'undefined' && r.business_unit.sys_id == bu) ||
                        (typeof r.company !== 'undefined' && r.company.sys_id == c) || (typeof r.department !== 'undefined' && r.department.sys_id == d) ||
                        (typeof r.location !== 'undefined' && r.location.sys_id == l))
                        return r;
                }
                else if ((typeof r.building !== 'undefined' || r.building == bld) && (typeof r.business_unit !== 'undefined' || r.business_unit == bu) &&
                    (typeof r.company !== 'undefined' || r.company == c) && (typeof r.department !== 'undefined' || r.department == d) &&
                    (typeof r.location !== 'undefined' || r.location == l))
                    return r;
            }
        }
    }
    function getGroup(target, approval) {
        var rule = getMatchingRule(target, true);
        if (typeof rule !== 'undefined') {
            var gr = new GlideRecord('sys_user_group');
            gr.addQuery('sys_id', rule.group.sys_id);
            gr.query();
            if (gr.next)
                return gr;
        }
    }
    LocationBasedAssignmentGroups.getApprovalGroupId = function (target) {
        var rule = getMatchingRule(target, true);
        if (typeof rule !== 'undefined')
            return rule.group.sys_id;
    };
    LocationBasedAssignmentGroups.getApprovalGroup = function (target) {
        return getGroup(target, true);
    };
    LocationBasedAssignmentGroups.getAssignmentGroupId = function (target) {
        var rule = getMatchingRule(target, false);
        if (typeof rule !== 'undefined')
            return rule.group.sys_id;
    };
    LocationBasedAssignmentGroups.getAssignmentGroup = function (target) {
        return getGroup(target, false);
    };
    LocationBasedAssignmentGroups.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
        getApprovalGroup: function () {
        },
        getAssignmentGroup: function () {
        },
        type: "LocationBasedAssignmentGroups"
    });
    return LocationBasedAssignmentGroups;
})();
