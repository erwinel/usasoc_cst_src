/// <reference path="SnTypings/index.d.ts" />

declare namespace x_44813_usasoc_cst {
    export class TaskHelper {
        constructor(task: string | taskFields);
        static getCaller(task: taskFields): sys_userFields | undefined;
        static isVip(task: taskFields): boolean;
        getCaller(): sys_userFields | undefined;
        isVip(): boolean;
        readonly type: "TaskHelper";
    }
}