/// <reference path="types/index.d.ts" />
/// <reference path="types/service-now/js_includes_listv2_doctype.d.ts" />
/// <reference path="types/service-now/js_includes_ui16_form.d.ts" />
/// <reference path="UsasocUserNotificationManager.d.ts" />

import { UserNotificationsResponse } from "./UsasocUserNotificationManager";

interface USASOC_OnLogin {
    readonly UI_PAGE_ID: "x_44813_usasoc_cst_profile_incomplete_warning";
    readonly SESSION_CHECKED_VALUE: "true2";
    readonly type: "USASOC_OnLogin";
    onDialogClose(): void;
}
interface IUSASOC_OnLogin extends USASOC_OnLogin {
    _dialogWindow?: GlideModal | GlideDialogWindow;
    _isChecked: boolean;
}

var USASOC_OnLogin = (function (): USASOC_OnLogin {
    var USASOC_OnLogin: IUSASOC_OnLogin = <IUSASOC_OnLogin>{
        UI_PAGE_ID: "x_44813_usasoc_cst_profile_incomplete_warning",
        SESSION_CHECKED_VALUE: "true2",
        type: "USASOC_OnLogin",
        _isChecked: false
    };
    function setValidated() {
        USASOC_OnLogin._isChecked = true;
        window.sessionStorage.setItem(USASOC_OnLogin.UI_PAGE_ID, USASOC_OnLogin.SESSION_CHECKED_VALUE);
    }
    USASOC_OnLogin.onDialogClose = function () {
        setValidated();
        USASOC_OnLogin._dialogWindow.destroy();
        USASOC_OnLogin._dialogWindow = null;
        g_navigation.openRecord("sys_user", g_user.userID);
    };
    addLateLoadEvent(function () {
        try {
            var tableName = '';
            if (typeof g_form !== 'undefined' && null != g_form) {
                jslog('g_form.getTableName() == ' + ((typeof g_form.getTableName() !== 'undefined') ? JSON.stringify(g_form.getTableName()) : 'undefined'));
                if (typeof g_form.getTableName() === 'string')
                    tableName = g_form.getTableName();
            } else if (typeof window.opener != 'undefined' && null != window.opener && typeof window.opener.g_form !== 'undefined' && null != window.opener.g_form) {
                if (typeof window.opener.g_form.getTableName() === 'string')
                    tableName = window.opener.g_form.getTableName()
            }
            if (tableName == 'sys_user' && !g_user.hasRole('admin')) {
                window.sessionStorage.setItem(USASOC_OnLogin.UI_PAGE_ID, "");
                USASOC_OnLogin._isChecked = false;
                return;
            }
            if (USASOC_OnLogin._isChecked)
                return;
            if (window.sessionStorage.getItem(USASOC_OnLogin.UI_PAGE_ID) == USASOC_OnLogin.SESSION_CHECKED_VALUE || g_user.hasRole('admin')) {
                USASOC_OnLogin._isChecked = true;
                return;
            }
            // Temporarily set to true to prevent multiple calls
            USASOC_OnLogin._isChecked = true;
            var ga: GlideAjax = new GlideAjax("x_44813_usasoc_cst.UsasocUserNotificationManager");
            ga.addParam('sysparm_name', 'getUserNotifications');
            ga.setErrorCallback(function (result: AjaxErrorResponse) {
                USASOC_OnLogin._isChecked = false;
                if (typeof result.error !== 'undefined' && null != result.error) {
                    var s = ('' + result.error).trim();
                    if (s.length > 0) {
                        jslog('Error response from x_44813_usasoc_cst.UsasocUserNotificationManager: ' + s);
                        return;
                    }
                }
                jslog('Error response from x_44813_usasoc_cst.UsasocUserNotificationManager: ' + result.responseText);
            });
            ga.getXMLAnswer(function (result: string) {
                USASOC_OnLogin._isChecked = false;
                var notifications: UserNotificationsResponse = JSON.parse(result);
                if (notifications.profileCompliance.failed == 0) {
                    setValidated();
                    jslog('x_44813_usasoc_cst.UsasocUserNotificationManager: ' + notifications.profileCompliance.message);
                    return;
                }
                var dialogClass = ((<{ GlideModal: GlideModal; }><any>window).GlideModal) ? GlideModal : GlideDialogWindow;
                USASOC_OnLogin._dialogWindow = new dialogClass(USASOC_OnLogin.UI_PAGE_ID, true);
                USASOC_OnLogin._dialogWindow.setTitle('User Profile Incomplete');
                USASOC_OnLogin._dialogWindow.render();
                jslog('x_44813_usasoc_cst.UsasocUserNotificationManager: ' + notifications.profileCompliance.message);
            });
        } catch (e) {
            USASOC_OnLogin._isChecked = false;
            jslog("Error invoking GlideAjax for x_44813_usasoc_cst.UsasocUserNotificationManager: " + e);
        }
    });
    return <USASOC_OnLogin>USASOC_OnLogin;
})();