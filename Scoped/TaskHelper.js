/// <reference path="types/service-now/index.d.ts" />
var TaskHelper = (function () {
    var taskHelperConstructor = Class.create();
    function getCaller(task) {
        /*
            .Feedback[Knowledge Feedback Task]User VIP = true
            .Request[Requested Item]Requested for VIP = true
            .Incident[Security Incident]Caller VIP = true
            .Affected user[Security Incident Response Task]VIP = true
                .Caller[Service Order]VIP = true
        */
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
            case 'kb_feedback_task':
                break;
            case 'sn_si_incident':
                break;
            case 'sn_si_task':
                break;
            case 'sm_task':
                break;
            case 'sc_request':
                caller = task.requested_for;
                break;
            case 'sc_req_item':
                caller = task.request.requested_for;
                break;
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
    taskHelperConstructor.getCaller = getCaller;
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
        type: 'TaskHelper'
    };
    return taskHelperConstructor;
})();
//# sourceMappingURL=TaskHelper.js.map