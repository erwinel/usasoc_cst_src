/// <reference path="types/index.d.ts" />
/// <reference types="service-now" />
declare let internalTypeToClassNameMapping: {
    [key: string]: string;
};
interface IChoiceInfo {
    label: string;
    value: string;
    dependent_value?: string;
    hint?: string;
    sequence?: number;
}
declare let baseFieldNames: string[];
declare function internalTypeToClassName(internal_type: string): string;
interface IElementInfo {
    label: string;
    name: string;
    internal_type: string;
    className: string;
    refersTo?: {
        label: string;
        name: string;
    };
}
interface ITableInfo {
    is_extendable?: boolean;
    label: string;
    name: string;
    super_class?: ITableInfo;
    elements: IElementInfo[];
}
declare function definesField(tableInfo: ITableInfo, element: IElementInfo): boolean;
declare function getTableInfo(tableGr: sys_db_objectGlideRecord): ITableInfo;
declare class Glide {
}
declare class GlideCompositeElement {
}
declare class GlideIntegerTime {
}
declare class GlideNumber {
}
