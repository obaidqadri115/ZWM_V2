sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "com/acc/ZWM_V2/model/models", "sap/m/MessageBox",
	"com/acc/ZWM_V2/util/formatter"
], function (Controller, JSONModel, models, MessageBox, formatter) {
	"use strict";

	return Controller.extend("com.acc.ZWM_V2.controller.workOrderDetail", {
		formatter: formatter,
		onInit: function () {
			this.oModel = this.getOwnerComponent().getModel();
			this.getOwnerComponent().getRouter().getRoute("workOrderDetail").attachPatternMatched(this.onRouteMatched, this);
		},
		onRouteMatched: function (event) {
			models.references("workOrderDetail", this);
			if (event.mParameters.arguments) {
				this.byId("docSubBtnId").setVisible(false);
				this.byId("iconTabBarId").setSelectedKey("detailTab");
				this.bindData(event.mParameters.arguments.context);
				var detailEditNoteData = {
					enable: false,
					btnVisibility: false,
					editBtn: true
				};
				this.getView().getModel("device").setData({
					isPhone: sap.ui.Device.system.phone || sap.ui.Device.system.tablet
				});
				this.getView().setModel(new JSONModel(detailEditNoteData), "detailEditNoteModel");
				var index = event.mParameters.arguments.context;
				var mapsArr = this.MasterRef.getView().getModel("workOrders").getData()[index].NVHEADERTOWOMAP;
				//var url = mapsArr.Url.replace("http", "https");
				//var url = "https://hved.utl.accenture.com/geoeam-au/index.html?id=" + woNum + "&locale=en";
				//var url = "https://hved.utl.accenture.com/geowm/index.html";
				var woNum = this.MasterRef.getView().getModel("workOrders").getData()[index].Aufnr;
				var url = "https://hved.utl.accenture.com/geoeam-au/index.html?id=" + woNum + "&locale=en";
				var frame = "<iframe src=" + url + " width='100%' height='550px'></iframe>";
				this.byId("mapsId").setContent(frame);
			}

		},
		bindData: function (index) {
			this.MasterRef = models.getReferences("workOrderMaster");
			var data = this.MasterRef.getView().getModel("workOrders").getData()[index];
			this.getView().setModel(new JSONModel(data), "WODetModel");
		},
		onDetailEditPress: function (oEvent) {
			this.getView().getModel("detailEditNoteModel").setProperty("/enable", true);
			this.getView().getModel("detailEditNoteModel").setProperty("/btnVisibility", true);
			this.getView().getModel("detailEditNoteModel").setProperty("/editBtn", false);
		},

		onSaveDetailNotes: function (oEvent) {
			var that = this;
			this.getOwnerComponent().bDialog.open();
			var selModel = this.getView().getModel("WODetModel").getData();
			var notes = this.byId("detailNotesId").getValue();
			if (notes === "" && notes.length == 0) {
				that.getOwnerComponent().bDialog.close();
				sap.m.MessageToast.show("Notes should not be empty");
				return;
			}
			var data = {
				Aufnr: selModel.Aufnr,
				NVHEADERTOWONOTES: [{
					"Objtype": "",
					"Objkey": "",
					"FormatCol": "*",
					"TextLine": notes
				}]
			};
			var path = "/HeaderSet";
			this.oModel.create(path, data, {
				success: function (odata, responce) {
					/*var a = $(responce.headers["sap-message"]);
					var msg = a.find("message").eq(0).text();
					var severity = a.find("severity").eq(0).text();*/

					var obj = JSON.parse(responce.headers["sap-message"]);
					var msg = obj.message;
					var severity = obj.severity;
					var detailEditNoteData = {
						enable: false,
						btnVisibility: false,
						editBtn: true
					};
					that.getOwnerComponent().bDialog.close();
					that.byId("detailNotesId").setValue("");
					if (severity.toLowerCase() === "info") {
						MessageBox.information(msg, {
							onClose: function (sAction) {
								that.onBacktoWOMaster();
								that.MasterRef.bindWorkOrderList();
							}
						});
						that.getView().getModel("detailEditNoteModel").setData(detailEditNoteData);
					} else if (severity.toLowerCase() === "success") {
						MessageBox.success(msg, {
							onClose: function (sAction) {
								that.onBacktoWOMaster();
								that.MasterRef.bindWorkOrderList();
							}
						});
						that.getView().getModel("detailEditNoteModel").setData(detailEditNoteData);
					} else if (severity.toLowerCase() === "error") {
						MessageBox.error(msg, {
							onClose: function (sAction) {

							}
						});
						return;
					}

				},
				error: function (error) {
					var msg = error.statusText;
					MessageBox.error(msg + ": contact System Administator", {
						onClose: function (sAction) {

						}
					});
					var detailEditNoteData = {
						enable: true,
						btnVisibility: true,
						editBtn: false
					};
					that.getView().getModel("detailEditNoteModel").setData(detailEditNoteData);
					that.getOwnerComponent().bDialog.close();
				}
			});

		},
		onCancelDetailNotes: function (oEvent) {
			this.getView().getModel("detailEditNoteModel").setProperty("/editBtn", true);
			this.getView().getModel("detailEditNoteModel").setProperty("/enable", false);
			this.getView().getModel("detailEditNoteModel").setProperty("/btnVisibility", false);
		},
		dateFormatter: function (value1, value2) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			var date = oDateFormat.format(new Date(value1));
			return date;
		},
		/* on Selection of components List Item */
		onComponentListItemPress: function (oEvent) {
			if (!this.compDialog) {
				this.compDialog = sap.ui.xmlfragment("com.acc.ZWM_V2.fragments.componentsDialog", this);
			}
			var selObj = oEvent.mParameters.listItem.getBindingContext("WODetModel").getObject();
			this.compDialog.setModel(new JSONModel(selObj), "ComponentDetailModel");
			sap.ui.getCore().byId("componentsSFId").bindElement("/");
			this.compDialog.open();
		},

		/* on Selection of Operations List Item*/
		onOperationsListItemPress: function (oEvent) {
			var data = {
				enable: false,
				btnVisibility: false,
				editBtn: true
			};
			if (!this.operDialog) {
				this.operDialog = sap.ui.xmlfragment("com.acc.ZWM_V2.fragments.operationsDialog", this);
				this.operDialog.setModel(new JSONModel(data), "operationsNotesData");
			}
			this.operDialog.getModel("operationsNotesData").setData(data);
			var selObj = oEvent.mParameters.listItem.getBindingContext("WODetModel").getObject();
			this.operDialog.setModel(new JSONModel(selObj), "operationDetailModel");
			sap.ui.getCore().byId("operationsSFId").bindElement("/");
			this.operDialog.open();
		},
		onOperationsEditPress: function () {
			this.operDialog.getModel("operationsNotesData").setProperty("/editBtn", false);
			this.operDialog.getModel("operationsNotesData").setProperty("/enable", true);
			this.operDialog.getModel("operationsNotesData").setProperty("/btnVisibility", true);
		},
		onSaveOperationsNotes: function () {
			var oData = this.operDialog.getModel("operationDetailModel").getData();
			var that = this;
			this.getOwnerComponent().bDialog.open();
			var notes = sap.ui.getCore().byId("operationsNotesId").getValue();
			if (notes === "" && notes.length == 0) {
				that.getOwnerComponent().bDialog.close();
				sap.m.MessageToast.show("Notes should not be empty");
				return;
			}
			var data = {
				Aufnr: oData.Aufnr,
				Vornr: oData.Vornr,
				NVOPERATIONTOOPNOTES: [{
					Objtype: "",
					Objkey: "",
					FormatCol: "*",
					TextLine: notes
				}]
			};
			var path = "/OperationsSet";
			this.oModel.create(path, data, {
				success: function (odata, responce) {
					/*var a = $(responce.headers["sap-message"]);
					var msg = a.find("message").eq(0).text();
					var severity = a.find("severity").eq(0).text();*/

					var obj = JSON.parse(responce.headers["sap-message"]);
					var msg = obj.message;
					var severity = obj.severity;
					var data1 = {
						enable: false,
						btnVisibility: false,
						editBtn: true
					};
					that.getOwnerComponent().bDialog.close();

					if (severity.toLowerCase() === "info") {
						MessageBox.information(msg, {
							onClose: function (sAction) {
								that.onBacktoWOMaster();
								that.MasterRef.bindWorkOrderList();
							}
						});
						that.operDialog.getModel("operationsNotesData").setData(data1);
						that.operDialog.close();
					} else if (severity.toLowerCase() === "success") {
						MessageBox.success(msg, {
							onClose: function (sAction) {
								that.onBacktoWOMaster();
								that.MasterRef.bindWorkOrderList();
							}
						});
						that.operDialog.getModel("operationsNotesData").setData(data1);
						that.operDialog.close();
					} else if (severity.toLowerCase() === "error") {
						MessageBox.error(msg, {
							onClose: function (sAction) {

							}
						});
						return;
					}

				},
				error: function (error) {
					var msg = error.statusText;
					MessageBox.error(msg + ": contact System Administator", {
						onClose: function (sAction) {

						}
					});
					var data2 = {
						enable: true,
						btnVisibility: true,
						editBtn: false
					};
					that.operDialog.getModel("operationsNotesData").setData(data2);
					that.getOwnerComponent().bDialog.close();
				}
			});

		},
		onOperationFinish: function () {
			if (!this.timeEntryDialog) {
				this.timeEntryDialog = sap.ui.xmlfragment("com.acc.ZWM_V2.fragments.TimeEntryDialog", this);
				this.timeEntryDialog.setModel(new JSONModel({}), "timeEntryModel");
			}
			var data = this.operDialog.getModel("operationDetailModel").getData();
			this.timeEntryDialog.getModel("timeEntryModel").setData(data);
			sap.ui.getCore().byId("timeEntryFId").bindElement("/");
			this.timeEntryDialog.open();
		},
		onTimeEntryCancel: function () {
			this.timeEntryDialog.close();
		},
		handleValueHelp: function (oEvent) {
			var that = this;
			if (!this.absAttTypeDialog) {
				this.absAttTypeDialog = sap.ui.xmlfragment("com.acc.ZWM_V2.fragments.abs_att_type", this);
				sap.ui.getCore().setModel(new JSONModel([]), "absAttModel");
			}
			sap.ui.getCore().getModel("absAttModel").setData([]);
			var path = "/ActyTypeF4Set";
			this.oModel.read(path, true, {
				success: function (odata, responce) {
					debugger;
					sap.ui.getCore().getModel("absAttModel").setData(odata.results);
				},
				error: function (error) {
					debugger;
				}
			});

			this.absAttTypeDialog.open();
		},
		onFileUpload: function (oEvent) {
			var file = oEvent.mParameters.files[0];
			var data = {
				Name: file.name,
				fileContent: file
			};
			if (file) {
				var modelData = this.getView().getModel("WODetModel").getData();
				modelData.NVHEADERTOATTACHMENTS.results.unshift(data);
				this.getView().getModel("WODetModel").refresh();
			}

		},
		onDecumentDelete: function (oEvent) {
			var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
			this.getView().getModel("WODetModel").oData.NVHEADERTOATTACHMENTS.results.splice(index, 1);
			this.getView().getModel("WODetModel").refresh();
		},
		onIconTabBarSelect: function (oEvent) {
			var key = oEvent.oSource.getSelectedKey();
			if (key === "documents") {
				this.byId("docSubBtnId").setVisible(true);
			} else {
				this.byId("docSubBtnId").setVisible(false);
			}
		},

		onSelect1: function (e) {
			if (!this.docDialog) {
				var that = this;
				this.docDialog = new sap.m.Dialog({
					title: "Attachment",
					contentWidth: "900px",
					contentHeight: "500px",
					content: new sap.ui.core.HTML({

					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						type: "Reject",
						press: function () {
							that.docDialog.close();
						}
					})
				});
			}
			//var entity = "AttDownloadSet(Objid='12EFDB6B857E1EE893BD907E632CC5AB')/$value";
			//var entity = "https://hved.utl.accenture.com/sap/opu/odata/SAP/ZEAM_066_WM_FIORI_APP_SRV/AttDownloadSet(Objid='12EFDB6B857E1EE893BD907E632CC5AB')/$value";
			var url1 = this.getOwnerComponent().getModel();
			var url = encodeURI(location.origin + '/' + url1.sServiceUrl.replace("../", "") + entity);
			if (sap.ui.Device.system.desktop) {
				var oContent = "<div><iframe src=" + entity + " width='100%' height='520'></iframe></div>";
				this.docDialog.getContent()[0].setContent(oContent);
				this.docDialog.open();
			} else {
				window.open(url);
			}
			var path = "/AttDownloadSet(Objid='12EFDB6B857E1EE893BD907E632CC5AB')/$value";
			this.oModel.read(path, true, {
				success: function (odata, responce) {
					debugger;
				},
				error: function (error) {
					debugger;
				}
			});

		},
		onSelect: function (e) {
			debugger;
			var bObj = e.oSource.getBindingContext("WODetModel").getObject().Objid;
			if (bObj) {
				var url = "https://hved.utl.accenture.com/sap/opu/odata/SAP/ZEAM_066_WM_FIORI_APP_SRV/AttDownloadSet(Objid='" + bObj + "')/$value";
				window.open(url);
				/*	var path = "/AttDownloadSet(Objid='"+bObj+"')/$value";
					this.oModel.read(path, true, {
						success: function (odata, responce) {
							debugger;
						},
						error: function (error) {
							debugger;
						}
					})*/
			}
		},
		onFileUploadByCamera: function () {
			var options = {
				quality: 10,
				destinationType: navigator.camera.DestinationType.DATA_URL
			};
			navigator.camera.getPicture(function (resp) {
				sap.m.MessageToast.show("Success");
			}, function (error) {
				sap.m.MessageToast.show("Error");
			}, options);
		},
		onCancelOperationsNotes: function (oEvent) {
			this.operDialog.getModel("operationsNotesData").setProperty("/editBtn", true);
			this.operDialog.getModel("operationsNotesData").setProperty("/enable", false);
			this.operDialog.getModel("operationsNotesData").setProperty("/btnVisibility", false);
		},
		onCloseOperationsDialog: function () {
			this.operDialog.close();
		},
		onCloseCompDialog: function () {
			this.compDialog.close();
		},
		onBacktoWOMaster: function () {
			//if (sap.ui.Device.system.phone) {
			this.getRouter().navTo("workOrderMaster", {});
			//}
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onExit: function () {
			if (this.operDialog) {
				this.operDialog.destroy();
			}
			if (this.compDialog) {
				this.compDialog.destroy();
			}
		}
	});

});