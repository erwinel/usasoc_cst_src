/// <reference path="SnTypings/base.d.ts" />
/// <reference path="USASOCCustomizations.ts" />

namespace usasoc_idea_submitting {
    function executeRule(current: ideaGlideRecord, previous: ideaGlideRecord | null /*null when async*/) {
        var id: string = (new USASOCCustomizations()).getNewIdeaAssignmentGroupSysId();
        if (typeof id === "string")
            current.setValue('assignment_group', id);
    }
}

namespace usasoc_task_submitted {
    function executeRule(current: taskGlideRecord, previous: taskGlideRecord | null /*null when async*/) {
        if (gs.nil(current.assignment_group) && gs.nil(current.assigned_to)) {
            gs.warn(current.number + " (" + current.sys_id + ") has been submitted, but has no assignment.");
            gs.eventQueue(USASOCCustomizations.EVENTNAME_TASK_UNASSIGNED, current);
        }
        if (current.getRecordClassName() == "idea")
            gs.eventQueue(USASOCCustomizations.EVENTNAME_TASK_IDEA_NEW, current);
    }
}