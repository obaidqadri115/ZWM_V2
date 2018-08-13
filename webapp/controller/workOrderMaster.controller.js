sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "com/acc/ZWM_V2/model/models"
], function (Controller, JSONModel, models) {
	"use strict";
	return Controller.extend("com.acc.ZWM_V2.controller.workOrderMaster", {
		onInit: function () {
			this.oModel = this.getOwnerComponent().getModel();
			this.getOwnerComponent().getRouter().getRoute("workOrderMaster").attachPatternMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function (event) {
			models.references("workOrderMaster", this);
			this.bindWorkOrderList();
		},
		bindWorkOrderList: function () {
			this.getOwnerComponent().bDialog.open();
			var that = this;
			var path = "/HeaderSet";
			var params = {
				$filter: "Userid eq '11153519'",
				$expand: "NVHEADERTOOPERATIONS,NVHEADERTOCOMPONENTS,NVHEADERTOOBJECTS,NVHEADERTOATTACHMENTS,NVHEADERTOWOMAP"
			};
			this.oModel.read(path, {
				urlParameters: params,
				success: function (oData, response) {
					that.getView().setModel(new JSONModel(oData.results), "workOrders");
					//that.getOwnerComponent().bDialog.close();
				},
				error: function (error) {
					that.showNoDataPage();
					that.getOwnerComponent().bDialog.close();
				}
			});
		},
		onUpdateFinish: function (oEvent) {
			var oList = oEvent.oSource;
			var oFirstListItem = oEvent.oSource.getItems()[0];
			if (oFirstListItem && !sap.ui.Device.system.phone) {
				oList.setSelectedItem(oFirstListItem);
				oList.fireItemPress({
					listItem: oFirstListItem,
					srcControl: oFirstListItem
				});
				this.getOwnerComponent().bDialog.close();
			} else {
				this.getOwnerComponent().bDialog.close();
			}

		},
		onListItemPress: function (oEvent) {
			var path = oEvent.mParameters.listItem.getBindingContextPath("workOrders");
			var items = oEvent.oSource.getItems();
			if (items.length == 0) {
				this.showNoDataPage();
			} else {
				this.getRouter().navTo("workOrderDetail", {
					context: path.split("/")[1]
				});
			}
		},
		showNoDataPage: function () {
			if (!sap.ui.Device.system.phone) {
				this.getRouter().navTo("noDataPage", {});
			}

		},
		dateFormatter: function (value1) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			var date = oDateFormat.format(new Date(value1));
			return date;
		},
		onSearchByWorkOrder: function (oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery.length > 0) {
				if (!isNaN(sQuery)) { // ClaimAmt claimNo
					var filter1 = new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter1);
				}
			}
			var list = this.getView().byId("workorderListId");
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},
		piority: function (val) {
			if (val) {
				if (val == "") {
					val = "None";
				} else {
					val = val.split("-")[1];
				}
				return val;
			}
		},
		onBacktoMaster: function () {
			this.getRouter().navTo("Master", {});
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});

});