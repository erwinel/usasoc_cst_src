/// <reference path="types/index.d.ts" />
var TaskHelper = (function () {
    var taskHelperConstructor = Class.create();
    function getCaller(task) {
        var caller;
        switch ('' + task.sys_class_name) {
            case 'incident':
                caller = task.caller_id;
                break;
            case 'change_request_imac':
                caller = task.move_user;
                break;
            case 'incident_task':
                caller = task.incident.caller_id;
                break;
            case 'sm_order':
            case 'sn_si_incident':
                caller = ((gs.nil(task.opened_for)) ? task.caller : task.opened_for);
                break;
            case 'sn_si_task':
                if (!gs.nil(task.affected_user))
                    caller = task.affected_user;
                break;
            case 'sm_task':
                break;
            case 'sc_request':
                caller = task.requested_for;
                break;
            case 'sc_req_item':
            case 'sc_task':
                caller = task.request.requested_for;
                break;
        }
        if (!gs.nil(caller))
            return caller;
    }
    function isVip(task) {
        var caller = getCaller(task);
        return typeof caller !== 'undefined' && caller.vip == true;
    }
    function isBusinessUnit(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'business_unit';
    }
    function isDepartment(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_department';
    }
    function isUser(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'sys_user';
    }
    function isCompany(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'core_company';
    }
    function isLocation(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_location';
    }
    function isBuilding(target) {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_building';
    }
    function getBusinessUnit(target) {
        if (isUser(target))
            return getBusinessUnit(target.department);
        if (isDepartment(target)) {
            if (gs.nil(target.business_unit))
                return getBusinessUnit(target.parent);
            return target.business_unit;
        }
    }
    function getCompany(target) {
        if (isCompany(target))
            return target;
        if (isUser(target)) {
            if (!gs.nil(target.company))
                return target.company;
            return getCompany(target.department);
        }
        if (isBusinessUnit(target))
            return getCompany(target.parent);
        if (isDepartment(target)) {
            var result = getCompany(target.business_unit);
            if (gs.nil(result))
                return getCompany(target.parent);
            return result;
        }
    }
    function getLocation(target) {
        if (isLocation(target))
            return target;
        if (isUser(target)) {
            if (!gs.nil(target.location))
                return target.location;
            return getLocation(target.building);
        }
        else if (isBuilding(target)) {
            if (!gs.nil(target.location))
                return target.location;
        }
    }
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
    function getDefaultApprovalGroupByLocation(user) {
        var rules = TaskHelper.getLocationApproverRules();
        var bld = getSysId(user.building);
        var bu = getSysId(getBusinessUnit(user));
        var c = getSysId(getCompany(user));
        var d = getSysId(user.department);
        var l = getSysId(getLocation(user));
        for (var index = 0; index < rules.length; index++) {
            var r = rules[index];
            if (r.type == "any") {
                if ((typeof r.building !== 'undefined' && r.building == bld) || (typeof r.business_unit !== 'undefined' && r.business_unit == bu) ||
                    (typeof r.company !== 'undefined' && r.company == c) || (typeof r.department !== 'undefined' && r.department == d) ||
                    (typeof r.location !== 'undefined' && r.location == l))
                    return r.approval_group;
            }
            else if ((typeof r.building !== 'undefined' || r.building == bld) && (typeof r.business_unit !== 'undefined' || r.business_unit == bu) &&
                (typeof r.company !== 'undefined' || r.company == c) && (typeof r.department !== 'undefined' || r.department == d) &&
                (typeof r.location !== 'undefined' || r.location == l))
                return r.approval_group;
        }
    }
    taskHelperConstructor.getCaller = getCaller;
    taskHelperConstructor.isVip = isVip;
    taskHelperConstructor.getDefaultApprovalGroupByLocation = getDefaultApprovalGroupByLocation;
    taskHelperConstructor.getLocationApproverRules = function () {
        if (typeof taskHelperConstructor._locationApproverRules !== 'undefined')
            return taskHelperConstructor._locationApproverRules;
        taskHelperConstructor._locationApproverRules = [];
        var gr = new GlideRecord('x_44813_usasoc_cst_location_approvers');
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            var item = {
                approval_group: gr.approval_group,
                type: ('' + gr.type)
            };
            if (!gs.nil(gr.building))
                item.building = '' + gr.building.sys_id;
            if (!gs.nil(gr.location))
                item.location = '' + gr.location.sys_id;
            if (!gs.nil(gr.department))
                item.department = '' + gr.department.sys_id;
            if (!gs.nil(gr.business_unit))
                item.business_unit = '' + gr.business_unit.sys_id;
            if (!gs.nil(gr.company))
                item.company = '' + gr.company.sys_id;
            taskHelperConstructor._locationApproverRules.push(item);
        }
        return taskHelperConstructor._locationApproverRules;
    };
    taskHelperConstructor.prototype = {
        _task: undefined,
        initialize: function (task) {
            var gr;
            if (typeof task === 'string') {
                gr = new GlideRecord('task');
                gr.addQuery('sys_id', task);
                gr.query();
                if (!gr.next())
                    throw new Error("Task not found");
                this._task = gr;
            }
            else {
                if (gs.nil(task))
                    throw new Error("No task specified");
                if (task instanceof GlideRecord) {
                    if (task.isNewRecord() || !task.isValidRecord())
                        throw new Error("Not a valiid task record");
                    this._task = task;
                }
                else {
                    this._task = task.getRefRecord();
                    if (gs.nil(this._task))
                        throw new Error("No task referenced");
                }
            }
            var n = this._task.getRecordClassName();
            if (n == this._task.getTableName() || !gs.tableExists(n))
                return;
            try {
                gr = new GlideRecord(n);
                gr.addQuery('sys_id', task);
                gr.query();
                if (gr.next())
                    this._task = gr;
            }
            catch ( /* okay to ignore */_a) { /* okay to ignore */ }
        },
        getCaller: function () {
            return getCaller(this._task);
        },
        isVip: function () {
            return isVip(this._task);
        },
        getDefaultApprovalGroupByCallerLocation: function () {
            return getDefaultApprovalGroupByLocation(this.getCaller());
        },
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();
