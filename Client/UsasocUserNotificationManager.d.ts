/// <reference path="SnTypings/base.d.ts" />
interface IUsasocUserNotificationManagerResponse {
    code: number;
    user_id: string;
    sys_id?: string;
}
interface IUsasocUserNotificationManagerComplete extends IUsasocUserNotificationManagerResponse {
    code: 0;
    sys_id: string;
}
interface IUsasocUserNotificationManagerFault extends IUsasocUserNotificationManagerResponse {
    code: Exclude<number, 0>;
    message: string;
    reason?: string;
    fault?: any;
}
interface UserProfileFieldComplianceResult {
    label: string;
    passed: boolean;
}
interface UserProfileFieldAccessError extends Omit<UserProfileFieldComplianceResult, "passed">, IUsasocUserNotificationManagerFault {
}
interface UserProfileComplianceFieldResults {
    building: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
    department: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
    u_red_phone: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
}
export interface UserProfileComplianceCheck {
    passed: number;
    failed: number;
    notChecked: number;
    message: string;
    results: UserProfileComplianceFieldResults;
}
interface UserProfileComplianceResponse extends UserProfileComplianceCheck, IUsasocUserNotificationManagerComplete {
}
interface UserNotificationsResponse extends IUsasocUserNotificationManagerComplete {
    profileCompliance: UserProfileComplianceCheck;
}