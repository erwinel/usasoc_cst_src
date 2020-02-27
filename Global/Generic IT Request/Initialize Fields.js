var generic_it_request;
(function (generic_it_request) {
    function initialize_fields(current) {
        var s = ('' + current.variables.short_description).trim();
        if (s.length > 0)
            current.short_description = s;
        s = ('' + current.variables.description).trim();
        if (s.length > 0)
            current.description = s;
        if (!gs.nil(current.variables.business_service))
            current.business_service = current.variables.business_service;
        if (!gs.nil(current.variables.cmdb_ci))
            current.configuration_item = current.variables.cmdb_ci;
        if (gs.nil(current.assignment_group) && gs.nil(current.variables.assignment_group) && !gs.nil(current.cat_item.group))
            current.variables.assignment_group = current.cat_item.group;
        if (!gs.nil(current.variables.due_date)) {
            if (gs.nil(current.due_date))
                current.due_date = current.variables.due_date;
            else if (current.variables.due_date != current.due_date) {
                current.work_notes = 'Changing due date from ' + current.due_date + ' to ' + current.variables.due_date;
                current.due_date = current.variables.due_date;
            }
        }
        if (gs.nil(current.variables.mission_impact))
            gs.warn('Mission Impact not defined (mission_impact variable missing or misconfigured)');
        else {
            switch ('' + current.variables.mission_impact) {
                case 'critical':
                    current.impact = 1;
                    current.urgency = 1;
                    current.priority = 1;
                    break;
                case 'essential':
                    current.impact = 1;
                    current.urgency = 2;
                    current.priority = 2;
                    break;
                case 'enhancing':
                    current.impact = 2;
                    current.urgency = 2;
                    current.priority = 3;
                    break;
                default:
                    current.impact = 3;
                    current.urgency = 3;
                    current.priority = 4;
                    break;
            }
        }
    }
    function assignment_set(current) {
        var answer = ifScript();
        function ifScript() {
            if (gs.nil(current.variables.assignment_group))
                return 'no';
            return 'yes';
        }
    }
    function route_request(current, task, workflow) {
        var req_for = current.request.requested_for.getDisplayValue();
        task.short_description = ((current.request.requested_for.vip) ? "Route VIP " : "Route ") +
            ((('' + current.short_description).indexOf('' + current.cat_item.short_description) < 0) ? current.cat_item.short_description +
                ' (' + current.short_description + ')' : current.cat_item.short_description) + ' for ' + req_for;
        task.description = "Please verify routing options for the associated generic service catalog IT service request item " + current.number + ".\n" +
            "  Description: " + current.short_description +
            "\nRequested For: " + req_for + " (" + current.request.requested_for.email + ")" +
            "\n          VIP: " + ((current.request.requested_for.vip) ? "Yes" : "No") +
            "\n Catalog Item: " + current.cat_item.short_description +
            "\n     Quantity: " + current.quantity +
            "\n Requested By: " + current.opened_by.getDisplayValue() +
            "\n\nRouting Options\n" +
            "	Directly route to fulfillment group.\n" +
            "        Use the \"Variables\" section to select the fulfillment group, leaving the approval group blank.\n" +
            "        Click the \"Close Task\" button to continue. The status for the associated request will be automatically updated and routed accordingly.\n" +
            "    Route to group for approval.\n" +
            "		Use the \"Variables\" section to select both the approval and the fulfillment groups.\n" +
            "        Click the \"Close Task\" button to continue. The status for the associated request will be automatically updated.\n" +
            "        Once (and if) the item is approved, the requested item will be re-assigned to the fulfillment groups.";
        workflow.scratchpad.task_number = task.number;
        gs.eventQueue('army.generic.request.route', current, '' + task.number);
    }
    function request_item_assigned(current) {
var answer = ifScript();
function ifScript() {
    if (gs.nil(current.assignment_group) && gs.nil(current.assigned_to)) {
        if (gs.nil(current.variables.assignment_group)) {
            if (gs.nil(current.cat_item.group))
                return 'no';
            current.variables.assignment_group = current.cat_item.group;
        }
        else
            current.assignment_group = current.variables.assignment_group;
    }
    return 'yes';
}
    }
})(generic_it_request || (generic_it_request = {}));
//# sourceMappingURL=Initialize Fields.js.map