/// <reference path="types/index.d.ts" />

interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    /**
     * Gets the caller or requestor.
     */
    getCaller(): sys_userFields;
    /**
     * Indicates whether the caller/requestor is VIP.
     */
    isVip(): boolean;
    /**
     * Indicates whether a task is in one of the closed states.
     */
    isClosed(): boolean;
    /**
     * Indicates whether a task is in one of the closed states or is in the pending state.
     */
    isPendingOrClosed(): boolean;
    /**
     * Indicates whether a task is in the in-progress or pending state.
     */
    isInProgressOrPending(): boolean;
    /**
     * Indicates whether a task awaiting approval or approval has not been requested.
     */
    isPreApproval(): boolean;
    /**
     * Indicates whether a task is approved or approval is not required.
     */
    isApprovedOrNotRequired(): boolean;
    /**
     * Indicates whether a task approval status is rejected, cancelled or it is marked as duplicate.
     */
    isUnapproved(): boolean;
    /**
     * Indicates whether a task approval status is rejected or it is marked as duplicate.
     */
    isRejectedOrDuplicate(): boolean;
    /**
     * Indicates whether a task is in the pending state.
     */
    isPending(): boolean;
    /**
     * Indicates whether a task is in the open state.
     */
    isOpen(): boolean;
    /**
     * Indicates whether a task is in the in-progress state.
     */
    isInProgress(): boolean;
    /**
     * Indicates whether a task is in the closed-complete state.
     */
    isClosedComplete(): boolean;
    /**
     * Indicates whether a task is in the closed-incomplete state.
     */
    isClosedIncomplete(): boolean;
    /**
     * Indicates whether a task is in the closed-skipped state.
     */
    isClosedSkipped(): boolean;
    /**
     * Sets the status to pending.
     * @param {boolean} [force] if true, set status to pending even if it is in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setPending(force?: boolean): boolean;
    /**
     * Sets the status to open.
     * @param {boolean} [force] if true, set status to open even if it is in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setOpen(force?: boolean): boolean;
    /**
     * Sets the status to work-in-progress.
     * @param {boolean} [force] if true, set status to work-in-progress even if it is in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setInProgress(force?: boolean): boolean;
    /**
     * Sets the status to closed-complete.
     * @param {boolean} [force] if true, set status to closed-complete even if it is already in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setClosedComplete(force?: boolean): boolean;
    /**
     * Sets the status to closed-incomplete.
     * @param {boolean} [force] if true, set status to closed-incomplete even if it is already in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setClosedIncomplete(force?: boolean): boolean;
    /**
     * Sets the status to closed-skipped.
     * @param {boolean} [force] if true, set status to closed-skipped even if it is already in a closed state.
     * @returns {boolean} true if the status was changed; otherwise, false.
     */
    setClosedSkipped(force?: boolean): boolean;
}

interface ITaskHelperPrototype extends ICustomClassPrototype1<ITaskHelper, ITaskHelperPrototype, "TaskHelper", string>, ITaskHelper {
    _task: taskGlideRecord;
}

interface TaskHelper extends Readonly<ITaskHelper> { }

interface TaskHelperConstructor extends CustomClassConstructor1<ITaskHelper, ITaskHelperPrototype, TaskHelper, string> {
    TASKSTATE_PENDING: -5;
    TASKSTATE_OPEN: 1;
    TASKSTATE_WORK_IN_PROGRESS: 2;
    TASKSTATE_CLOSED_COMPLETE: 3;
    TASKSTATE_CLOSED_INCOMPLETE: 4;
    TASKSTATE_CLOSED_SKIPPED: 7;
    TASKAPPPROVAL_NOT_REQUESTED: "not requested";
    TASKAPPPROVAL_CANCELLED: "cancelled";
    TASKAPPPROVAL_REQUESTED: "requested";
    TASKAPPPROVAL_DUPLICATE: "duplicate";
    TASKAPPPROVAL_NOT_REQUIRED: "not_required";
    TASKAPPPROVAL_APPROVED: "approved";
    TASKAPPPROVAL_REJECTED: "rejected";
    new(task: string | taskFields): TaskHelper;
    (task: string | taskFields): TaskHelper;
    getCaller(task: taskFields): sys_userFields | undefined;
    isVip(task: taskFields): boolean;
    isTask(target: $$element.IDbObject): target is taskElement | taskGlideRecord;
    getBusinessUnit(target: $$element.IDbObject): business_unitFields | undefined;
    getCompany(target: $$element.IDbObject): core_companyFields | undefined;
    getLocation(target: $$element.IDbObject): cmn_locationFields | undefined;
}

interface IRuleCacheItem {
    building?: string;
    location?: string;
    department?: string;
    business_unit?: string;
    company?: string;
    type: USASOC_CST_LOCATION_APPROVERS_TYPE;
    approval_group: sys_user_groupFields;
}

const TaskHelper: Readonly<TaskHelperConstructor> & { new(task: string | taskFields): TaskHelper; } = (function (): TaskHelperConstructor {
    var taskHelperConstructor: TaskHelperConstructor & { _locationApproverRules?: IRuleCacheItem[]; } = Class.create();
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

    function isClosed(task: taskFields): boolean {
        return !gs.nil(task) && task.state >= TaskHelper.TASKSTATE_CLOSED_COMPLETE;
    }
    function isPending(task: taskFields): boolean {
        return !gs.nil(task) && task.state <= TaskHelper.TASKSTATE_PENDING;
    }
    function isPendingOrClosed(task: taskFields): boolean {
        return !gs.nil(task) && (task.state >= TaskHelper.TASKSTATE_CLOSED_COMPLETE || task.state <= TaskHelper.TASKSTATE_PENDING);
    }
    function isInProgress(task: taskFields): boolean {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS;
    }
    function isInProgressOrPending(task: taskFields): boolean {
        return !gs.nil(task) && (task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS || task.state <= TaskHelper.TASKSTATE_PENDING);
    }
    function isClosedComplete(task: taskFields): boolean {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_COMPLETE;
    }
    function isPreApproval(task: taskFields): boolean {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REQUESTED || task.approval == TaskHelper.TASKAPPPROVAL_NOT_REQUESTED);
    }
    function isApprovedOrNotRequired(task: taskFields): boolean {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_APPROVED || task.approval == TaskHelper.TASKAPPPROVAL_NOT_REQUIRED);
    }
    function isUnapproved(task: taskFields): boolean {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REJECTED || task.approval == TaskHelper.TASKAPPPROVAL_CANCELLED || task.approval == TaskHelper.TASKAPPPROVAL_DUPLICATE);
    }
    function isRejectedOrDuplicate(task: taskFields): boolean {
        return !gs.nil(task) && (task.approval == TaskHelper.TASKAPPPROVAL_REJECTED || task.approval == TaskHelper.TASKAPPPROVAL_DUPLICATE);
    }
    function isOpen(task: taskFields): boolean {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_OPEN;
    }
    function isClosedIncomplete(task: taskFields): boolean {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_INCOMPLETE;
    }
    function isClosedSkipped(task: taskFields): boolean {
        return !gs.nil(task) && task.state == TaskHelper.TASKSTATE_CLOSED_SKIPPED;
    }
    function setPending(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_PENDING || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_PENDING;
        return true;
    }
    function setOpen(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_OPEN || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_OPEN;
        return true;
    }
    function setInProgress(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_WORK_IN_PROGRESS || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_WORK_IN_PROGRESS;
        return true;
    }
    function setClosedComplete(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_COMPLETE || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_COMPLETE;
        return true;
    }
    function setClosedIncomplete(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_INCOMPLETE || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_INCOMPLETE;
        return true;
    }
    function setClosedSkipped(task: taskFields, force?: boolean): boolean {
        if (gs.nil(task) || task.state == TaskHelper.TASKSTATE_CLOSED_SKIPPED || (task.state > TaskHelper.TASKSTATE_WORK_IN_PROGRESS && !force))
            return false;
        task.state = TaskHelper.TASKSTATE_CLOSED_SKIPPED;
        return true;
    }
    function isOrInherits(tableName: string, target: $$element.IDbObject | GlideTableHierarchy): boolean {
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
    function getCaller(target: $$element.IDbObject, gth?: GlideTableHierarchy): sys_userFields {
        var caller: sys_userFields;
        switch ('' + task.sys_class_name) {
            case 'incident':
                caller = <sys_userFields>(<incidentFields>task).caller_id;
                break;
            case 'change_request_imac':
                caller = <sys_userFields>(<change_request_imacFields>task).move_user;
                break;
            case 'incident_task':
                caller = <sys_userFields>(<incidentFields>(<incident_taskFields>task).incident).caller_id;
                break;
            case 'sm_order':
            case 'sn_si_incident':
                caller = <sys_userFields>((gs.nil((<sm_orderFields>task).opened_for)) ? (<sm_orderFields>task).caller : (<sm_orderFields>task).opened_for);
                break;
            case 'sn_si_task':
                if (!gs.nil((<{ affected_user: sys_userFields }><any>task).affected_user))
                    caller = (<{ affected_user: sys_userFields }><any>task).affected_user;
                break;
            case 'sm_task':
                break;
            case 'sc_request':
                caller = <sys_userFields>(<sc_requestFields>task).requested_for;
                break;
            case 'sc_req_item':
            case 'sc_task':
                caller = <sys_userFields>(<sc_requestFields>(<sc_req_itemFields | sc_taskFields>task).request).requested_for;
                break;
        }
        if (!gs.nil(caller))
            return caller;
    }

    function isVip(target: $$element.IDbObject): boolean {
        var caller: sys_userFields = <sys_userFields>getCaller(task);
        return typeof caller !== 'undefined' && caller.vip == true;
    }

    function isTask(target: $$element.IDbObject | GlideTableHierarchy): target is taskFields | GlideTableHierarchy {
        return isOrInherits('task', target);
    }

    function isBusinessUnit(target: $$element.IDbObject | GlideTableHierarchy): target is business_unitFields | GlideTableHierarchy {
        return isOrInherits('business_unit', target);
    }

    function isDepartment(target: $$element.IDbObject | GlideTableHierarchy): target is cmn_departmentFields | GlideTableHierarchy {
        return isOrInherits('cmn_department', target);
    }

    function isUser(target: $$element.IDbObject | GlideTableHierarchy): target is sys_userFields | GlideTableHierarchy {
        return isOrInherits('sys_user', target);
    }

    function isCompany(target: $$element.IDbObject | GlideTableHierarchy): target is core_companyFields | GlideTableHierarchy {
        return isOrInherits('core_company', target);
    }

    function isLocation(target: $$element.IDbObject | GlideTableHierarchy): target is cmn_locationFields | GlideTableHierarchy {
        return isOrInherits('cmn_location', target);
    }

    function isBuilding(target: $$element.IDbObject | GlideTableHierarchy): target is cmn_buildingFields | GlideTableHierarchy {
        return isOrInherits('cmn_building', target);
    }

    function isSla(target: $$element.IDbObject | GlideTableHierarchy): target is slaFields | GlideTableHierarchy {
        return isOrInherits('sla', target);
    }

    function isCmdb(target: $$element.IDbObject | GlideTableHierarchy): target is cmdbFields | GlideTableHierarchy {
        return isOrInherits('cmdb', target);
    }

    function isAlmAsset(target: $$element.IDbObject | GlideTableHierarchy): target is alm_assetFields | GlideTableHierarchy {
        return isOrInherits('alm_asset', target);
    }

    function isCatalogItem(target: $$element.IDbObject | GlideTableHierarchy): target is sc_cat_itemFields | GlideTableHierarchy {
        return isOrInherits('sc_cat_item', target);
    }

    function isScCategory(target: $$element.IDbObject | GlideTableHierarchy): target is sc_categoryFields | GlideTableHierarchy {
        return isOrInherits('sc_category', target);
    }

    function isChangeRequest(target: $$element.IDbObject | GlideTableHierarchy): target is change_requestFields | GlideTableHierarchy {
        return isOrInherits('change_request', target);
    }

    function getDepartment(target: $$element.IDbObject, gth?: GlideTableHierarchy): cmn_departmentFields | undefined {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'cmn_department')
                return <cmn_departmentFields>target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isDepartment(gth))
            return <cmn_departmentFields>target;
        if (isUser(gth)) {
            if (!gs.nil((<sys_userFields>target).department))
                return <cmn_departmentFields>(<sys_userFields>target).department;
        } else if (isAlmAsset(gth)) {
            if (!gs.nil((<alm_assetFields>target).department))
                return <cmn_departmentFields>(<alm_assetFields>target).department;
        } else if (isCmdb(gth)) {
            if (!gs.nil((<cmdbFields>target).department))
                return <cmn_departmentFields>(<cmdbFields>target).department;
        } else if (isSla(gth)) {
            if (!gs.nil((<slaFields>target).department))
                return <cmn_departmentFields>(<slaFields>target).department;
        } else if (isOrInherits('change_request_imac', target)) {
            if (!gs.nil((<change_request_imacFields>target).move_department))
                return <cmn_departmentFields>(<change_request_imacFields>target).move_department;
        }
    }

    function getBusinessUnit(target: $$element.IDbObject, gth?: GlideTableHierarchy): business_unitFields | undefined {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'business_unit')
                return <business_unitFields>target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isBusinessUnit(gth))
            return <business_unitFields>target;
        if (isUser(gth))
            return getBusinessUnit(<cmn_departmentFields>(<sys_userFields>target).department, gth);
        if (isDepartment(gth)) {
            if (gs.nil((<cmn_departmentFields>target).business_unit))
                return getBusinessUnit(<cmn_departmentFields>(<cmn_departmentFields>target).parent, gth);
            if (!gs.nil((<cmn_departmentFields>target).business_unit))
                return <business_unitFields>(<cmn_departmentFields>target).business_unit;
        }
    }

    function getCompany(target: $$element.IDbObject, gth?: GlideTableHierarchy): core_companyFields | undefined {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'core_company')
                return <core_companyFields>target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isCompany(gth))
            return <core_companyFields>target;
        var result: core_companyFields;
        if (isUser(gth)) {
            if (!gs.nil((<sys_userFields>target).company))
                return <core_companyFields>(<sys_userFields>target).company;
            result = getCompany(<cmn_departmentFields>(<sys_userFields>target).department, gth);
            if (gs.nil(result)) {
                result = getCompany(<cmn_buildingFields>(<sys_userFields>target).building, gth);
                if (gs.nil(result))
                    return getCompany(<cmn_locationFields>(<sys_userFields>target).location, gth);
            }
        } else if (isBusinessUnit(gth)) {
            if (!gs.nil((<business_unitFields>target).company))
                return <core_companyFields>(<business_unitFields>target).company;
            return getCompany(<business_unitFields>(<business_unitFields>target).parent, gth);
        } else if (isDepartment(gth)) {
            if (!gs.nil((<cmn_departmentFields>target).company))
                return <core_companyFields>(<cmn_departmentFields>target).company;
            result = getCompany(<business_unitFields>(<cmn_departmentFields>target).business_unit, gth);
            if (gs.nil(result))
                return getCompany(<cmn_departmentFields>(<cmn_departmentFields>target).parent, gth);
        } else if (isBuilding(gth)) {
            return getCompany(<cmn_locationFields>(<cmn_buildingFields>target).location, gth);
        } else if (isLocation(gth)) {
            if (!gs.nil((<cmn_locationFields>target).company))
                return <core_companyFields>(<cmn_locationFields>target).company;
            return getCompany(<cmn_locationFields>(<cmn_locationFields>target).parent, gth);
        } else if (isCatalogItem(gth)) {
            if (!gs.nil((<sc_cat_itemFields>target).vendor))
                return <core_companyFields>(<sc_cat_itemFields>target).vendor;
            result = getCompany(<sc_categoryFields>(<sc_cat_itemFields>target).category, gth);
            if (gs.nil(result))
                return getCompany(<cmdb_modelFields>(<sc_cat_itemFields>target).model, gth);
        } else if (isTask(gth)) {
            if (!gs.nil((<taskFields>target).company))
                return <core_companyFields>(<taskFields>target).company;
            result = getCompany(<taskFields>(<taskFields>target).parent, gth);
            if (gs.nil(result)) {
                result = getCompany(<cmn_locationFields>(<taskFields>target).location, gth);
                if (gs.nil(result))
                    return getCompany(getCaller(target), gth);
            }
        } else if (isAlmAsset(gth)) {
            if (!gs.nil((<alm_assetFields>target).company))
                return <core_companyFields>(<alm_assetFields>target).company;
        } else if (isCmdb(gth)) {
            if (!gs.nil((<cmdbFields>target).company))
                return <core_companyFields>(<cmdbFields>target).company;
        } else if (isScCategory(gth))
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
    function getLocation(target: $$element.IDbObject, gth?: GlideTableHierarchy): cmn_locationFields | undefined {
        if (typeof target != 'object' || null === target || !target.getTableName)
            return;
        if (typeof gth === 'undefined') {
            if (gs.nil(target.getTableName()))
                return;
            if (target.getTableName() == 'cmn_location')
                return <cmn_locationFields>target;
            gth = new GlideTableHierarchy(target.getTableName());
        }
        if (isLocation(target))
            return <cmn_locationFields>target;
        if (isUser(gth)) {
            if (!gs.nil((<sys_userFields>target).location))
                return <cmn_locationFields>(<sys_userFields>target).location;
            return getLocation(<cmn_buildingFields>(<sys_userFields>target).building);
        } else if (isBuilding(gth)) {
            if (!gs.nil((<cmn_buildingFields>target).location))
                return <cmn_locationFields>(<cmn_buildingFields>target).location;
        } else if (isScCategory(gth)) {
            if (!gs.nil((<sc_categoryFields>target).location))
                return <cmn_locationFields>(<sc_categoryFields>target).location;
        }
    }

    taskHelperConstructor.getCaller = getCaller;
    taskHelperConstructor.getBusinessUnit = getBusinessUnit;
    taskHelperConstructor.getCompany = getCompany;
    taskHelperConstructor.getLocation = getLocation;
    taskHelperConstructor.isVip = isVip;
    taskHelperConstructor.prototype = {
        _task: undefined,
        initialize: function (this: ITaskHelperPrototype, task: string | taskFields) {
            var gr: taskGlideRecord;
            if (typeof task === 'string') {
                gr = <taskGlideRecord>new GlideRecord('task');
                gr.addQuery('sys_id', task);
                gr.query();
                if (!gr.next())
                    throw new Error("Task not found");
                this._task = gr;
            } else {
                if (gs.nil(task))
                    throw new Error("No task specified");
                if (task instanceof GlideRecord) {
                    if (task.isNewRecord() || !task.isValidRecord())
                        throw new Error("Not a valiid task record");
                    this._task = task;
                } else {
                    this._task = (<$$element.Reference<taskFields, taskGlideRecord>>task).getRefRecord();
                    if (gs.nil(this._task))
                        throw new Error("No task referenced");
                }
            }
            let n: string = this._task.getRecordClassName();
            if (n == this._task.getTableName() || !gs.tableExists(n))
                return;

            try {
                gr = <taskGlideRecord>new GlideRecord(n);
                gr.addQuery('sys_id', task);
                gr.query();
                if (gr.next())
                    this._task = gr;
            } catch { /* okay to ignore */ }
        },
        getCaller: function (this: ITaskHelperPrototype): sys_userFields {
            return getCaller(this._task);
        },
        isVip: function (this: ITaskHelperPrototype): boolean {
            return isVip(this._task);
        },
        isClosed(this: ITaskHelperPrototype): boolean { return isClosed(this._task); },
        isPending(this: ITaskHelperPrototype): boolean { return isPending(this._task); },
        isPendingOrClosed(this: ITaskHelperPrototype): boolean { return isPendingOrClosed(this._task); },
        isInProgress(this: ITaskHelperPrototype): boolean { return isInProgress(this._task); },
        isInProgressOrPending(this: ITaskHelperPrototype): boolean { return isInProgressOrPending(this._task); },
        isClosedComplete(this: ITaskHelperPrototype): boolean { return isClosedComplete(this._task); },
        isPreApproval(this: ITaskHelperPrototype): boolean { return isPreApproval(this._task); },
        isApprovedOrNotRequired(this: ITaskHelperPrototype): boolean { return isApprovedOrNotRequired(this._task); },
        isUnapproved(this: ITaskHelperPrototype): boolean { return isUnapproved(this._task); },
        isRejectedOrDuplicate(this: ITaskHelperPrototype): boolean { return isRejectedOrDuplicate(this._task); },
        isClosedIncomplete(this: ITaskHelperPrototype): boolean { return isClosedIncomplete(this._task); },
        isClosedSkipped(this: ITaskHelperPrototype): boolean { return isClosedSkipped(this._task); },
        isOpen(this: ITaskHelperPrototype): boolean { return isOpen(this._task); },
        setClosedComplete(this: ITaskHelperPrototype, force?: boolean): boolean { return setClosedComplete(this._task, force); },
        setClosedIncomplete(this: ITaskHelperPrototype, force?: boolean): boolean { return setClosedIncomplete(this._task, force); },
        setClosedSkipped(this: ITaskHelperPrototype, force?: boolean): boolean { return setClosedSkipped(this._task, force); },
        setInProgress(this: ITaskHelperPrototype, force?: boolean): boolean { return setInProgress(this._task, force); },
        setOpen(this: ITaskHelperPrototype, force?: boolean): boolean { return setOpen(this._task, force); },
        setPending(this: ITaskHelperPrototype, force?: boolean): boolean { return setPending(this._task, force); },
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();