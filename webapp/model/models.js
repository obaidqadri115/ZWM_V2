sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		types: function () {
			return [{
				"ID": "1",
				"Type": "Work Orders",
				/*"icon":"util/wo.png"*/
				"icon":$.sap.getModulePath("com.acc.ZWM_V2", "/util/wo.png")
			}, {
				"ID": "2",
				"Type": "Notifications",
				"icon":$.sap.getModulePath("com.acc.ZWM_V2", "/util/notification.png")
			}, {
				"ID": "3",
				"Type": "Timesheets",
				"icon":$.sap.getModulePath("com.acc.ZWM_V2", "/util/timeSheets.png")
			}, {
				"ID": "4",
				"Type": "Functional Location",
				"icon":$.sap.getModulePath("com.acc.ZWM_V2", "/util/fl.png")
			}, {
				"ID": "5",
				"Type": "Equipment",
				"icon":$.sap.getModulePath("com.acc.ZWM_V2", "/util/equipment.png")
			}];
		},
		backgroundImage:function(){
			return {
				image:$.sap.getModulePath("com.acc.ZWM_V2", "/css/energy.JPG")
			};
		},
		references:function(viewName,ref){
			/*if(!this["viewName"]){
				this["viewName"] = ref; 
			}else{
				this["viewName"] = ref;
			}*/
			this[viewName] = ref;
		},
		getReferences:function(viewName){
			return this[viewName];
		}

	};
});