/// <reference path="types/index.d.ts" />
interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    getCaller(): sys_userFields;
    isVip(): boolean;
    getDefaultApprovalGroupByCallerLocation(): sys_user_groupFields;
}
interface ITaskHelperPrototype extends ICustomClassPrototype1<ITaskHelper, ITaskHelperPrototype, "TaskHelper", string>, ITaskHelper {
    _task: taskGlideRecord;
}
interface TaskHelper extends Readonly<ITaskHelper> {
}
interface TaskHelperConstructor extends CustomClassConstructor1<ITaskHelper, ITaskHelperPrototype, TaskHelper, string> {
    new (task: string | taskFields): TaskHelper;
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
declare const TaskHelper: Readonly<TaskHelperConstructor> & {
    new (task: string | taskFields): TaskHelper;
};
