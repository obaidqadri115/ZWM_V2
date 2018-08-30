sap.ui.define([
	"sap/ui/core/mvc/Controller","com/acc/ZWM_V2/model/models", "sap/ui/model/json/JSONModel"
], function (Controller,models, JSONModel) {
	"use strict";

	return Controller.extend("com.acc.ZWM_V2.controller.MessagePage", {
		onInit: function () {
			this.getView().setModel(new JSONModel(models.backgroundImage()),"messagePageModel");
			
		}
	});

});