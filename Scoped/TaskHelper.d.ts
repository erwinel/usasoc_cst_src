/// <reference path="types/index.d.ts" />
interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    /**
     * Gets the caller or requestor.
     */
    getCaller(): sys_userFields;
    /**
     * Indicates whether the caller/requestor is VIP.
     */
    isVip(): boolean;
    /**
     * Gets approval group according to location-based rules.
     */
    getDefaultApprovalGroupByCallerLocation(): sys_user_groupFields;
    /**
     * Indicates whether a task is in one of the closed states.
     */
    isClosed(): boolean;
    /**
     * Indicates whether a task is in the pending state.
     */
    isPending(): boolean;
    /**
     * Indicates whether a task is in one of the closed states or is in the pending state.
     */
    isPendingOrClosed(): boolean;
    /**
     * Indicates whether a task is in the in-progress state.
     */
    isInProgress(): boolean;
    /**
     * Indicates whether a task is in the in-progress or pending state.
     */
    isInProgressOrPending(): boolean;
    /**
     * Indicates whether a task is in the closed-complete state.
     */
    isClosedComplete(): boolean;
    /**
     * Indicates whether a task awaiting approval or approval has not been requested.
     */
    isPreApproval(): boolean;
    /**
     * Indicates whether a task is approved or approval is not required.
     */
    isApprovedOrNotRequired(): boolean;
    /**
     * Indicates whether a task approval status is rejected, cancelled or it is marked as duplicate.
     */
    isUnapproved(): boolean;
    /**
     * Indicates whether a task approval status is rejected or it is marked as duplicate.
     */
    isRejectedOrDuplicate(): boolean;
}
interface ITaskHelperPrototype extends ICustomClassPrototype1<ITaskHelper, ITaskHelperPrototype, "TaskHelper", string>, ITaskHelper {
    _task: taskGlideRecord;
}
interface TaskHelper extends Readonly<ITaskHelper> {
}
interface TaskHelperConstructor extends CustomClassConstructor1<ITaskHelper, ITaskHelperPrototype, TaskHelper, string> {
    TASKSTATE_PENDING: -5;
    TASKSTATE_OPEN: 1;
    TASKSTATE_WORK_IN_PROGRESS: 2;
    TASKSTATE_CLOSED_COMPLETE: 3;
    TASKSTATE_CLOSED_INCOMPLETE: 4;
    TASKSTATE_CLOSED_SKIPPED: 7;
    TASKAPPPROVAL_NOT_REQUESTED: "not requested";
    TASKAPPPROVAL_CANCELLED: "cancelled";
    TASKAPPPROVAL_REQUESTED: "requested";
    TASKAPPPROVAL_DUPLICATE: "duplicate";
    TASKAPPPROVAL_NOT_REQUIRED: "not_required";
    TASKAPPPROVAL_APPROVED: "approved";
    TASKAPPPROVAL_REJECTED: "rejected";
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
