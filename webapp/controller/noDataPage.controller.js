sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.acc.ZWM_V2.controller.noDataPage", {
		onPressGoHomeBtn: function () {
			this.getRouter().navTo("Master", {});
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
	});

});