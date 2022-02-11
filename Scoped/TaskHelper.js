/// <reference path="types/index.d.ts" />
var TaskHelper = (function () {
    var taskHelperConstructor = Class.create();
    taskHelperConstructor.TASKSTATE_PENDING = -5;
    taskHelperConstructor.TASKSTATE_OPEN = 1;
    taskHelperConstructor.TASKSTATE_WORK_IN_PROGRESS = 2;
    taskHelperConstructor.TASKSTATE_CLOSED_COMPLETE = 3;
    taskHelperConstructor.TASKSTATE_CLOSED_INCOMPLETE = 4;
    taskHelperConstructor.TASKSTATE_CLOSED_SKIPPED = 7;
    taskHelperConstructor.TASKAPPPROVAL_NOT_REQUESTED = "not requested";
    taskHelperConstructor.TASKAPPPROVAL_REQUESTED = "requested";
    taskHelperConstructor.TASKAPPPROVAL_NOT_REQUIRED = "not_required";
    taskHelperConstructor.TASKAPPPROVAL_APPROVED = "approved";
    taskHelperConstructor.TASKAPPPROVAL_REJECTED = "rejected";
    taskHelperConstructor.TASKAPPPROVAL_CANCELLED = "cancelled";
    taskHelperConstructor.TASKAPPPROVAL_DUPLICATE = "duplicate";
    function isClosed(task) {
        return !gs.nil(task) && task.state >= TaskHelper.TASKSTATE_CLOSED_COMPLETE;
    }
    function isPending(task) {
        return !gs.nil(task) && task.state <= TaskHelper.TASKSTATE_PENDING;
    }
    function isPendingOrClosed(task) {
        return !gs.nil(task) && (task.state >= TaskHelper.TASKSTATE_CLOSED_COMPLETE || task.state <= TaskHelper.TASKSTATE_PENDING);
    }
    function isInProgress(task) {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS;
    }
    function isInProgressOrPending(task) {
        return !gs.nil(task) && (task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS || task.state <= TaskHelper.TASKSTATE_PENDING);
    }
    function isClosedComplete(task) {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_COMPLETE;
    }
    function isPreApproval(task) {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REQUESTED || task.approval == TaskHelper.TASKAPPPROVAL_NOT_REQUESTED);
    }
    function isApprovedOrNotRequired(task) {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_APPROVED || task.approval == TaskHelper.TASKAPPPROVAL_NOT_REQUIRED);
    }
    function isUnapproved(task) {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REJECTED || task.approval == TaskHelper.TASKAPPPROVAL_CANCELLED || task.approval == TaskHelper.TASKAPPPROVAL_DUPLICATE);
    }
    function isRejectedOrDuplicate(task) {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REJECTED || task.approval == TaskHelper.TASKAPPPROVAL_DUPLICATE);
    }
    function isOpen(task) {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_OPEN;
    }
    function isClosedIncomplete(task) {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_INCOMPLETE;
    }
    function isClosedSkipped(task) {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_SKIPPED;
    }
    function setPending(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_PENDING || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_PENDING;
        return true;
    }
    function setOpen(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_OPEN || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_OPEN;
        return true;
    }
    function setInProgress(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_WORK_IN_PROGRESS;
        return true;
    }
    function setClosedComplete(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_COMPLETE || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_COMPLETE;
        return true;
    }
    function setClosedIncomplete(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_INCOMPLETE || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_INCOMPLETE;
        return true;
    }
    function setClosedSkipped(task, force) {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_SKIPPED || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_SKIPPED;
        return true;
    }
    function isOrInherits(tableName, target) {
        if (typeof target !== 'object' || null == target)
            return false;
        if (!(target instanceof GlideTableHierarchy)) {
            if (gs.nil(target.getTableName()))
                return false;
            if (tableName == target.getTableName())
                return true;
            target = new GlideTableHierarchy(target.getTableName());
        }
        for (var n in target.getTables()) {
            if (n == tableName)
                return true;
        }
        return false;
    }
    function getCaller(target, gth) {
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
    function isVip(target) {
        var caller = getCaller(task);
        return typeof caller !== 'undefined' && caller.vip == true;
    }
    function isTask(target) {
        return isOrInherits('task', target);
    }
    function isBusinessUnit(target) {
        return isOrInherits('business_unit', target);
    }
    function isDepartment(target) {
        return isOrInherits('cmn_department', target);
    }
    function isUser(target) {
        return isOrInherits('sys_user', target);
    }
    function isCompany(target) {
        return isOrInherits('core_company', target);
    }
    function isLocation(target) {
        return isOrInherits('cmn_location', target);
    }
    function isBuilding(target) {
        return isOrInherits('cmn_building', target);
    }
    function isSla(target) {
        return isOrInherits('sla', target);
    }
    function isCmdb(target) {
        return isOrInherits('cmdb', target);
    }
    function isAlmAsset(target) {
        return isOrInherits('alm_asset', target);
    }
    function isCatalogItem(target) {
        return isOrInherits('sc_cat_item', target);
    }
    function isScCategory(target) {
        return isOrInherits('sc_category', target);
    }
    function isChangeRequest(target) {
        return isOrInherits('change_request', target);
    }
    function getDepartment(target, gth) {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'cmn_department')
                return target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isDepartment(gth))
            return target;
        if (isUser(gth)) {
            if (!gs.nil(target.department))
                return target.department;
        }
        else if (isAlmAsset(gth)) {
            if (!gs.nil(target.department))
                return target.department;
        }
        else if (isCmdb(gth)) {
            if (!gs.nil(target.department))
                return target.department;
        }
        else if (isSla(gth)) {
            if (!gs.nil(target.department))
                return target.department;
        }
        else if (isOrInherits('change_request_imac', target)) {
            if (!gs.nil(target.move_department))
                return target.move_department;
        }
    }
    function getBusinessUnit(target, gth) {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'business_unit')
                return target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isBusinessUnit(gth))
            return target;
        if (isUser(gth))
            return getBusinessUnit(target.department, gth);
        if (isDepartment(gth)) {
            if (gs.nil(target.business_unit))
                return getBusinessUnit(target.parent, gth);
            if (!gs.nil(target.business_unit))
                return target.business_unit;
        }
    }
    function getCompany(target, gth) {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'core_company')
                return target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isCompany(gth))
            return target;
        var result;
        if (isUser(gth)) {
            if (!gs.nil(target.company))
                return target.company;
            result = getCompany(target.department, gth);
            if (gs.nil(result)) {
                result = getCompany(target.building, gth);
                if (gs.nil(result))
                    return getCompany(target.location, gth);
            }
        }
        else if (isBusinessUnit(gth)) {
            if (!gs.nil(target.company))
                return target.company;
            return getCompany(target.parent, gth);
        }
        else if (isDepartment(gth)) {
            if (!gs.nil(target.company))
                return target.company;
            result = getCompany(target.business_unit, gth);
            if (gs.nil(result))
                return getCompany(target.parent, gth);
        }
        else if (isBuilding(gth)) {
            return getCompany(target.location, gth);
        }
        else if (isLocation(gth)) {
            if (!gs.nil(target.company))
                return target.company;
            return getCompany(target.parent, gth);
        }
        else if (isCatalogItem(gth)) {
            if (!gs.nil(target.vendor))
                return target.vendor;
            result = getCompany(target.category, gth);
            if (gs.nil(result))
                return getCompany(target.model, gth);
        }
        else if (isTask(gth)) {
            if (!gs.nil(target.company))
                return target.company;
            result = getCompany(target.parent, gth);
            if (gs.nil(result)) {
                result = getCompany(target.location, gth);
                if (gs.nil(result))
                    return getCompany(getCaller(target), gth);
            }
        }
        else if (isAlmAsset(gth)) {
            if (!gs.nil(target.company))
                return target.company;
        }
        else if (isCmdb(gth)) {
            if (!gs.nil(target.company))
                return target.company;
        }
        else if (isScCategory(gth))
            return getCompany(getLocation(target), gth);
        return result;
    }
    /*
     * sc_category,
     * task
     * sys_user
     * cmn_building
     * sc_cat_item
     * alm_asset
     * cmdb
     */
    function getLocation(target, gth) {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'cmn_location')
                return target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isLocation(target))
            return target;
        if (isUser(gth)) {
            if (!gs.nil(target.location))
                return target.location;
            return getLocation(target.building);
        }
        else if (isBuilding(gth)) {
            if (!gs.nil(target.location))
                return target.location;
        }
        else if (isScCategory(gth)) {
            if (!gs.nil(target.location))
                return target.location;
        }
    }
    taskHelperConstructor.getCaller = getCaller;
    taskHelperConstructor.getBusinessUnit = getBusinessUnit;
    taskHelperConstructor.getCompany = getCompany;
    taskHelperConstructor.getLocation = getLocation;
    taskHelperConstructor.isVip = isVip;
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
        isClosed: function () { return isClosed(this._task); },
        isPending: function () { return isPending(this._task); },
        isPendingOrClosed: function () { return isPendingOrClosed(this._task); },
        isInProgress: function () { return isInProgress(this._task); },
        isInProgressOrPending: function () { return isInProgressOrPending(this._task); },
        isClosedComplete: function () { return isClosedComplete(this._task); },
        isPreApproval: function () { return isPreApproval(this._task); },
        isApprovedOrNotRequired: function () { return isApprovedOrNotRequired(this._task); },
        isUnapproved: function () { return isUnapproved(this._task); },
        isRejectedOrDuplicate: function () { return isRejectedOrDuplicate(this._task); },
        isClosedIncomplete: function () { return isClosedIncomplete(this._task); },
        isClosedSkipped: function () { return isClosedSkipped(this._task); },
        isOpen: function () { return isOpen(this._task); },
        setClosedComplete: function (force) { return setClosedComplete(this._task, force); },
        setClosedIncomplete: function (force) { return setClosedIncomplete(this._task, force); },
        setClosedSkipped: function (force) { return setClosedSkipped(this._task, force); },
        setInProgress: function (force) { return setInProgress(this._task, force); },
        setOpen: function (force) { return setOpen(this._task, force); },
        setPending: function (force) { return setPending(this._task, force); },
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();
