/// <reference path="types/index.d.ts" />

interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    getCaller(): sys_userFields;
    isVip(): boolean;
    getDefaultApprovalGroupByCallerLocation(): sys_user_groupFields;
}

interface ITaskHelperPrototype extends ICustomClassPrototype1<ITaskHelper, ITaskHelperPrototype, "TaskHelper", string>, ITaskHelper {
    _task: taskGlideRecord;
}

interface TaskHelper extends Readonly<ITaskHelper> { }

interface TaskHelperConstructor extends CustomClassConstructor1<ITaskHelper, ITaskHelperPrototype, TaskHelper, string> {
    new(task: string | taskFields): TaskHelper;
    (task: string | taskFields): TaskHelper;
    getCaller(task: taskFields): sys_userFields | undefined;
    isVip(task: taskFields): boolean;
    getDefaultApprovalGroupByLocation(user: sys_userFields): sys_user_groupFields | undefined;
    getLocationApproverRules(): IRuleCacheItem[];
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

    function getCaller(task: taskFields): sys_userFields {
        /*
            .Feedback[Knowledge Feedback Task]User VIP = true
            .Request[Requested Item]Requested for VIP = true
            .Incident[Security Incident]Caller VIP = true
            .Affected user[Security Incident Response Task]VIP = true
                .Caller[Service Order]VIP = true
        */
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
            case 'kb_feedback_task':
                break;
            case 'sn_si_incident':
                break;
            case 'sn_si_task':
                break;
            case 'sm_task':
                break;
            case 'sc_request':
                caller = <sys_userFields>(<sc_requestFields>task).requested_for;
                break;
            case 'sc_req_item':
                caller = <sys_userFields>(<sc_requestFields>(<sc_req_itemFields>task).request).requested_for;
                break;
            case 'sc_task':
                caller = <sys_userFields>(<sc_requestFields>(<sc_taskFields>task).request).requested_for;
                break;
        }
        if (!gs.nil(caller))
            return caller;
    }

    function isVip(task: taskFields): boolean {
        var caller: sys_userFields = <sys_userFields>getCaller(task);
        return typeof caller !== 'undefined' && caller.vip == true;
    }

    function isBusinessUnit(target: $$element.IDbObject): target is business_unitFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'business_unit';
    }

    function isDepartment(target: $$element.IDbObject): target is cmn_departmentFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_department';
    }

    function isUser(target: $$element.IDbObject): target is sys_userFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'sys_user';
    }

    function isCompany(target: $$element.IDbObject): target is core_companyFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'core_company';
    }

    function isLocation(target: $$element.IDbObject): target is cmn_locationFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_location';
    }

    function isBuilding(target: $$element.IDbObject): target is cmn_buildingFields {
        return typeof target === 'object' && null != target && target.getTableName && target.getTableName() == 'cmn_building';
    }

    function getBusinessUnit(target: $$element.IDbObject): business_unitFields | undefined {
        if (isUser(target))
            return getBusinessUnit(<cmn_departmentFields>target.department);

        if (isDepartment(target)) {
            if (gs.nil(target.business_unit))
                return getBusinessUnit(<cmn_departmentFields>target.parent);
            return <business_unitFields>target.business_unit;
        }
    }

    function getCompany(target: $$element.IDbObject): core_companyFields | undefined {
        if (isCompany(target))
            return target;
        if (isUser(target)) {
            if (!gs.nil(target.company))
                return <core_companyFields>target.company;
            return getCompany(<cmn_departmentFields>target.department);
        }
        if (isBusinessUnit(target))
            return getCompany(<business_unitFields>target.parent);
        if (isDepartment(target)) {
            var result: core_companyFields = getCompany(<business_unitFields>target.business_unit);
            if (gs.nil(result))
                return getCompany(<cmn_departmentFields>target.parent);
            return result;
        }
    }

    function getLocation(target: $$element.IDbObject): cmn_locationFields | undefined {
        if (isLocation(target))
            return target;
        if (isUser(target)) {
            if (!gs.nil(target.location))
                return <cmn_locationFields>target.location;
            return getLocation(<cmn_buildingFields>target.building);
        } else if (isBuilding(target)) {
            if (!gs.nil(target.location))
                return <cmn_locationFields>target.location;
        }
    }

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

    function getDefaultApprovalGroupByLocation(user: sys_userFields): sys_user_groupFields | undefined {
        var rules: IRuleCacheItem[] = TaskHelper.getLocationApproverRules();
        var bld: string = getSysId(user.building);
        var bu: string = getSysId(getBusinessUnit(user));
        var c: string = getSysId(getCompany(user));
        var d: string = getSysId(user.department);
        var l: string = getSysId(getLocation(user));
        for (let index = 0; index < rules.length; index++) {
            const r = rules[index];
            if (r.type == "any") {
                if ((typeof r.building !== 'undefined' && r.building == bld) || (typeof r.business_unit !== 'undefined' && r.business_unit == bu) ||
                    (typeof r.company !== 'undefined' && r.company == c) || (typeof r.department !== 'undefined' && r.department == d) ||
                    (typeof r.location !== 'undefined' && r.location == l))
                    return r.approval_group;
            } else if ((typeof r.building !== 'undefined' || r.building == bld) && (typeof r.business_unit !== 'undefined' || r.business_unit == bu) &&
                (typeof r.company !== 'undefined' || r.company == c) && (typeof r.department !== 'undefined' || r.department == d) &&
                (typeof r.location !== 'undefined' || r.location == l))
                return r.approval_group;
        }
    }

    taskHelperConstructor.getCaller = getCaller;
    taskHelperConstructor.isVip = isVip;
    taskHelperConstructor.getDefaultApprovalGroupByLocation = getDefaultApprovalGroupByLocation;
    taskHelperConstructor.getLocationApproverRules = function (): IRuleCacheItem[] {
        if (typeof taskHelperConstructor._locationApproverRules !== 'undefined')
            return taskHelperConstructor._locationApproverRules;
        taskHelperConstructor._locationApproverRules = [];
        var gr: x_44813_usasoc_cst_location_approversGlideRecord = <x_44813_usasoc_cst_location_approversGlideRecord>new GlideRecord('x_44813_usasoc_cst_location_approvers');
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            var item: IRuleCacheItem = {
                approval_group: <sys_user_groupFields>gr.approval_group,
                type: <USASOC_CST_LOCATION_APPROVERS_TYPE>('' + gr.type)
            };
            item.business_unit;
            item.company;
            item.department;
            if (!gs.nil(gr.building))
                item.building = '' + (<cmn_buildingFields>gr.building).sys_id;
            if (!gs.nil(gr.location))
                item.location = '' + (<cmn_locationFields>gr.location).sys_id;
            if (!gs.nil(gr.department))
                item.department = '' + (<cmn_departmentFields>gr.department).sys_id;
            if (!gs.nil(gr.business_unit))
                item.business_unit = '' + (<business_unitFields>gr.business_unit).sys_id;
            if (!gs.nil(gr.company))
                item.company = '' + (<core_companyFields>gr.company).sys_id;
            taskHelperConstructor._locationApproverRules.push(item);
        }
        return taskHelperConstructor._locationApproverRules;
    };

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
        getDefaultApprovalGroupByCallerLocation: function(this: ITaskHelperPrototype): sys_user_groupFields {
            return getDefaultApprovalGroupByLocation(<sys_userFields>this.getCaller());
        },
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();