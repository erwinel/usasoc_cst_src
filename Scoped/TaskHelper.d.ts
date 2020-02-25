/// <reference path="SnTypings/base.d.ts" />
interface ITaskHelper extends ICustomClassBase<ITaskHelper, "TaskHelper"> {
    getCaller(): sys_userFields | undefined;
    isVip(): boolean;
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
}
declare const TaskHelper: Readonly<TaskHelperConstructor> & {
    new (task: string | taskFields): TaskHelper;
};
