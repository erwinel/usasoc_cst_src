/// <reference path="types/index.d.ts" />
var UsasocUserNotificationManager = (function () {
    var UsasocUserNotificationManagerConstructor = Class.create();
    UsasocUserNotificationManagerConstructor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
        getUserProfileCompliance: function () {
            gs.info("Entering checkUserProfileCompliance");
            var response = UsasocUserNotificationManager.getUserProfileCompliance(this.getParameter('sysparm_user_id'));
            if (UsasocUserNotificationManager.isUsasocUserNotificationManagerFault(response))
                this.setError(response);
            else
                return JSON.stringify(response);
        },
        getUserNotifications: function () {
            gs.info("Entering checkUserNotifications!");
            var response = UsasocUserNotificationManager.getUserNotifications(this.getParameter('sysparm_user_id'));
            if (UsasocUserNotificationManager.isUsasocUserNotificationManagerFault(response))
                this.setError(response);
            else
                return JSON.stringify(response);
        },
        type: "UsasocUserNotificationManager"
    });
    var SYSID_RE = /^[\da-f]{32}$/i;
    var PROFILE_FIELDS = [
        { name: 'building', label: 'Building', failAdj: "selected" },
        { name: 'department', label: 'Department', failAdj: "selected" },
        { name: 'u_red_phone', label: 'Red Phone', failAdj: "empty" }
    ];
    UsasocUserNotificationManagerConstructor.isUsasocUserNotificationManagerFault = function (result) {
        gs.info("Entering isUsasocUserNotificationManagerFault!");
        return typeof result === 'object' && null != result && result.code !== 0;
    };
    UsasocUserNotificationManagerConstructor.getUserGlideObject = function (user) {
        gs.info("Entering getUserGlideObject");
        var user_id, sys_id;
        var systemProvidedId;
        if (typeof user === 'object') {
            if (user != null) {
                if (user instanceof GlideRecord || user instanceof GlideElement) {
                    user_id = '' + user.sys_id;
                    return { code: 0, sys_id: user_id, user_id: user_id, user: user };
                }
                if (user instanceof GlideUser)
                    sys_id = user_id = '' + user.getID();
                else
                    user_id = ('' + user).trim();
            }
            else
                sys_id = user_id = '' + gs.getUserID();
        }
        else if (typeof user === 'undefined' || (user_id = ('' + user).trim()).length == 0)
            sys_id = user_id = '' + gs.getUserID();
        try {
            var gr = new GlideRecord('sys_user');
            if (typeof sys_id === 'string') {
                gr.addQuery('sys_id', sys_id);
                gr.query();
                if (gr.next())
                    return { code: 0, sys_id: sys_id, user_id: user_id, user: gr };
            }
            else {
                if (SYSID_RE.test(user_id)) {
                    gr.addQuery('sys_id', user_id.toLowerCase());
                    gr.query();
                    if (gr.next())
                        return { code: 0, sys_id: sys_id, user_id: user_id, user: gr };
                    // In the off-chance that someone has a user_name that matches the pattern of a sys_id
                    gr = new GlideRecord('sys_user');
                }
                gr.addQuery('user_name', user_id);
                gr.query();
                if (gr.next())
                    return { code: 0, sys_id: '' + gr.sys_id, user_id: user_id, user: gr };
            }
        }
        catch (e) {
            return { code: 2, user_id: user_id, sys_id: sys_id, message: 'Unexpected exception while looking up user record', fault: e };
        }
        if (typeof sys_id === 'string')
            return { code: 1, user_id: user_id, sys_id: sys_id, message: 'User with sys_id "' + sys_id + '" not found' };
        if (SYSID_RE.test(user_id))
            return { code: 1, user_id: user_id, sys_id: user_id.toLowerCase(), message: 'User with sys_id or user_name "' + user_id + '" not found' };
        return { code: 1, user_id: user_id, message: 'User with user_name "' + user_id + '" not found' };
    };
    UsasocUserNotificationManagerConstructor.checkUserProfileCompliance = function (sys_user) {
        var result = {
            notChecked: 0,
            results: {}
        };
        var failed = PROFILE_FIELDS.filter(function (value) {
            try {
                if (gs.nil(sys_user[value.name])) {
                    result.results[value.name] = { label: value.label, passed: false };
                    return true;
                }
                result.results[value.name] = { label: value.label, passed: true };
            }
            catch (e) {
                result.notChecked++;
                result.results[value.name] = {
                    label: value.label,
                    message: 'Unexpected exception accessing field',
                    fault: e
                };
            }
            return false;
        });
        result.passed = PROFILE_FIELDS.length - ((result.failed = failed.length) + result.notChecked);
        if (failed.length == 0) {
            if (result.notChecked == 0)
                result.message = "All compliance checks passed";
            else if (result.passed > 0)
                result.message = (result.notChecked == 1) ? "One compliance check was inconclusive due to unexpected error; all other compliance checks passed." :
                    result.notChecked + " compliance checks were inconclusive due to unexpected errors; all other compliance checks passed.";
            else
                result.message = "All compliance checks were inconclusive due to unexpected errors.";
        }
        else {
            var last = failed.pop();
            if (result.notChecked == 0) {
                if (failed.length == 0)
                    result.message = last.label + " is not " + last.failAdj + ".";
                else
                    result.message = failed.map(function (value) { return value.label; }).join(", ") + " and " + last.label + " are empty.";
            }
            else if (result.notChecked == 1) {
                if (failed.length == 0)
                    result.message = last.label + " is not " + last.failAdj + "; 1 check failed due to unexpected error.";
                else
                    result.message = failed.map(function (value) { return value.label; }).join(", ") + " and " + last.label + " are empty; 1 check failed due to unexpected error.";
            }
            else if (failed.length == 0)
                result.message = last.label + " is not " + last.failAdj + "; " + result.notChecked + " checks failed due to unexpected errors.";
            else
                result.message = failed.map(function (value) { return value.label; }).join(", ") + " and " + last.label + " are empty; " + result.notChecked + " checks failed due to unexpected errors.";
        }
        return result;
    };
    UsasocUserNotificationManagerConstructor.getUserProfileCompliance = function (user) {
        gs.info("Entering getUserProfileCompliance");
        var getUserResponse = UsasocUserNotificationManager.getUserGlideObject(user);
        if (UsasocUserNotificationManager.isUsasocUserNotificationManagerFault(getUserResponse))
            return getUserResponse;
        var result = UsasocUserNotificationManager.checkUserProfileCompliance(getUserResponse.user);
        result.code = 0;
        result.user_id = getUserResponse.user_id;
        result.sys_id = getUserResponse.sys_id;
        return result;
    };
    UsasocUserNotificationManagerConstructor.getUserNotifications = function (user) {
        gs.info("Entering getUserNotifications");
        var getUserResult = UsasocUserNotificationManager.getUserGlideObject(user);
        if (UsasocUserNotificationManager.isUsasocUserNotificationManagerFault(getUserResult))
            return getUserResult;
        return {
            code: 0,
            user_id: getUserResult.user_id,
            sys_id: getUserResult.sys_id,
            profileCompliance: UsasocUserNotificationManager.checkUserProfileCompliance(getUserResult.user)
        };
    };
    return UsasocUserNotificationManagerConstructor;
})();
//# sourceMappingURL=UsasocUserNotificationManager.js.map