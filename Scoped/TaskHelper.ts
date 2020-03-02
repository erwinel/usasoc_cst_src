/// <reference path="types/service-now/index.d.ts" />
interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    getCaller(): sys_userFields | undefined;
    isVip(): boolean;
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
}

const TaskHelper: Readonly<TaskHelperConstructor> & { new(task: string | taskFields): TaskHelper; } = (function (): TaskHelperConstructor {
    var taskHelperConstructor: TaskHelperConstructor = Class.create();

    function getCaller(task: taskFields): sys_userFields | undefined {
        /*
            .Feedback[Knowledge Feedback Task]User VIP = true
            .Request[Requested Item]Requested for VIP = true
            .Incident[Security Incident]Caller VIP = true
            .Affected user[Security Incident Response Task]VIP = true
                .Caller[Service Order]VIP = true
        */
        var caller: sys_userFields | undefined;
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
        var caller: sys_userFields | undefined = getCaller(task);
        return typeof caller !== 'undefined' && caller.vip == true;
    }

    taskHelperConstructor.getCaller = getCaller;
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
        getCaller: function (this: ITaskHelperPrototype): sys_userFields | undefined {
            return getCaller(this._task);
        },
        isVip: function (this: ITaskHelperPrototype): boolean {
            return isVip(this._task);
        },
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();