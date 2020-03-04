/// <reference path="service-now/index.d.ts" />

declare type USASOC_CST_LOCATION_APPROVERS_TYPE = "all" | "any";

declare interface x_44813_usasoc_cst_location_approversFields extends IGlideTableProperties {
    building: $$rhino.Nilable<$$property.generic.Reference<cmn_buildingFields, cmn_buildingGlideRecord>>;
    location: $$rhino.Nilable<$$property.generic.Reference<cmn_locationFields, cmn_locationGlideRecord>>;
    department: $$rhino.Nilable<$$property.generic.Reference<cmn_departmentFields, cmn_departmentGlideRecord>>;
    business_unit: $$rhino.Nilable<$$property.generic.Reference<business_unitFields, business_unitGlideRecord>>;
    company: $$rhino.Nilable<$$property.generic.Reference<core_companyFields, core_companyGlideRecord>>;
    type: $$property.generic.Element<USASOC_CST_LOCATION_APPROVERS_TYPE>;
    approval_group: $$property.generic.Reference<sys_user_groupFields, sys_user_groupGlideRecord>;
    order: $$property.Numeric;
}
declare type x_44813_usasoc_cst_location_approversGlideRecord = GlideRecord & x_44813_usasoc_cst_location_approversFields;