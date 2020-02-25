/// <reference path="SnTypings/base.d.ts" />
interface NameLabelAndFailMessage<T extends string> {
    name: T;
    label: string;
    failAdj: string;
}
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
interface GetUserGlideObjectResult extends IUsasocUserNotificationManagerComplete {
    user: sys_userFields & (GlideRecord | GlideElement);
}
interface UserProfileFieldComplianceResult {
    label: string;
    passed: boolean;
}
interface UserProfileFieldAccessError extends Omit<UserProfileFieldComplianceResult, "passed">, IUsasocUserNotificationManagerFault {
}
declare type PROFILE_FIELD_NAME = 'building' | 'department' | 'u_red_phone';
interface UserProfileComplianceFieldResults {
    building: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
    department: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
    u_red_phone: UserProfileFieldComplianceResult | UserProfileFieldAccessError;
}
interface UserProfileComplianceCheck {
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
interface IUsasocUserNotificationManagerExt extends ICustomClassBase<IUsasocUserNotificationManager, "UsasocUserNotificationManager"> {
    getUserNotifications(): string;
    getUserProfileCompliance(): string;
}
interface IUsasocUserNotificationManager extends IUsasocUserNotificationManagerExt, Omit<IAbstractAjaxProcessor, "type"> {
}
interface IUsasocUserNotificationManagerPrototype extends ICustomClassPrototype0<IUsasocUserNotificationManager, IUsasocUserNotificationManagerPrototype, "UsasocUserNotificationManager">, IUsasocUserNotificationManager {
}
interface UsasocUserNotificationManager extends Readonly<IUsasocUserNotificationManager> {
}
interface UsasocUserNotificationManagerConstructor extends CustomClassConstructor0<IUsasocUserNotificationManager, IUsasocUserNotificationManagerPrototype, UsasocUserNotificationManager>, AbstractAjaxProcessorConstructor {
    new (): UsasocUserNotificationManager;
    (): UsasocUserNotificationManager;
    isUsasocUserNotificationManagerFault(result: IUsasocUserNotificationManagerResponse): result is IUsasocUserNotificationManagerFault;
    getUserGlideObject(user?: $$rhino.String | GlideUser | sys_userFields): GetUserGlideObjectResult | IUsasocUserNotificationManagerFault;
    checkUserProfileCompliance(sys_user: sys_userFields): UserProfileComplianceCheck;
    getUserProfileCompliance(user?: $$rhino.String | GlideUser | sys_userFields): UserProfileComplianceResponse | IUsasocUserNotificationManagerFault;
    getUserNotifications(user?: $$rhino.String | GlideUser | sys_userFields): UserNotificationsResponse | IUsasocUserNotificationManagerFault;
}
declare const UsasocUserNotificationManager: Readonly<UsasocUserNotificationManagerConstructor> & {
    new (): UsasocUserNotificationManager;
};
