/// <reference path="types/index.d.ts" />
/// <reference path="USASOCCustomizations.ts" />
var usasoc_idea_submitting;
(function (usasoc_idea_submitting) {
    function executeRule(current, previous /*null when async*/) {
        var id = (new USASOCCustomizations()).getNewIdeaAssignmentGroupSysId();
        if (typeof id === "string")
            current.setValue('assignment_group', id);
    }
})(usasoc_idea_submitting || (usasoc_idea_submitting = {}));
var usasoc_task_submitted;
(function (usasoc_task_submitted) {
    function executeRule(current, previous /*null when async*/) {
        if (gs.nil(current.assignment_group) && gs.nil(current.assigned_to)) {
            gs.warn(current.number + " (" + current.sys_id + ") has been submitted, but has no assignment.");
            gs.eventQueue(USASOCCustomizations.EVENTNAME_TASK_UNASSIGNED, current);
        }
        if (current.getRecordClassName() == "idea")
            gs.eventQueue(USASOCCustomizations.EVENTNAME_TASK_IDEA_NEW, current);
    }
})(usasoc_task_submitted || (usasoc_task_submitted = {}));
