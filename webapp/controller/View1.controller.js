sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    'sap/ui/core/Fragment',
    'sap/m/Token',
    "sap/m/MessageToast",
    'sap/ui/model/type/String'


],
    /**
     * @param {typeof sap.ui.core.mvc.Controller,FilterOperator} Controller
     */
    function (Controller, ODataModel, Filter, FilterOperator, JSONModel, coreLibrary, Fragment, Token, MessageToast, TypeString) {
        "use strict";
        var ValueState = coreLibrary.ValueState;
        return Controller.extend("zsnetorderdetails.controller.View1", {
            onInit: function () {


                this._oMultipleConditionsInput = this.byId("idOrderNumber");
                this.oFilter = {};
                this._oOrderType = this.byId("idOrderTypeVH");
                this.orderTypeModel = new JSONModel();
                this.oFilterBar = this.getView().byId("filterbar");
                // this.returnOrderModel.setData({
                //     company: [
                //         {
                //             serialNo: "123",
                //             orderType: "RE",
                //             status: "Ecus",
                //             returnOrder: "3234",
                //             equipment: "Test1"
                //         },
                //         {
                //             serialNo: "223",
                //             orderType: "OR",
                //             status: "Not Installed",
                //             returnOrder: "",
                //             equipment: "Test2"
                //         },
                //         {
                //             serialNo: "323",
                //             orderType: "OR",
                //             status: "Install",
                //             returnOrder: "3235",
                //             equipment: "Test3"
                //         }
                //     ]

                // });
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("RouteView1").attachPatternMatched(this._onMasterMatched, this);

                // -----------------Start of Fetch OrderType Data -------------------------------------
                this.getView().setModel(this.orderTypeModel, "orderTypeModel");

                var oModel = this.getOwnerComponent().getModel();

                //  oModel.read("/OrderTypeSet(SerialNumber='" + scanner[0] + "')", {
                oModel.read("/OrderTypeSet", {
                    // filters: oFilter,
                    success: function (oData, oResponse) {

                        this.orderTypeModel = new JSONModel();
                        var obj = oResponse.data.results;
                        var i = 0;
                        this.orderTypeModel.setData(obj);


                        this.getView().setModel(this.orderTypeModel, "orderTypeModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        this.orderTypeModel.setData({});
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this),
                });

                // -------------- Ebd of Fetch Order Type Data--------------------------------------

                //--------------- Start of Fetching Sales Org -------------------------------------

                this.salesOrgModel = new JSONModel();

                oModel.read("/SalesOrgSet", {
                    // filters: oFilter,
                    success: function (oData, oResponse) {

                        this.salesOrgModel = new JSONModel();
                        var obj = oResponse.data.results;
                        var i = 0;
                        this.salesOrgModel.setData(obj);


                        this.getView().setModel(this.salesOrgModel, "salesOrgModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        this.salesOrgModel.setData({});
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this),
                });
                //----------------- End of Fetchinf Sales Org ------------------------------------


            },
            onNavToCustomer: function (oEvent) {
                var orderID = parseInt(oEvent.getSource().mProperties.text);
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                    oCrossAppNav.toExternal({
                        target: { semanticObject: "Dest1", action: "manage" },
                        params: { OrderID: [orderID] }
                    })
                }

            },

            _onMasterMatched: function () {
                var supplierID;
                var aFilter = [];
                var startupParams = this.getOwnerComponent().getComponentData().startupParameters; // get Startup params from Owner Component
                var OrderID = parseInt(startupParams.OrderID);
                if (OrderID) {


                    //this.getView().byId("idOrderNumber").setValue(parseInt(startupParams.OrderID));
                    this._oMultipleConditionsInput.addToken(new sap.m.Token({
                        text: OrderID

                    }));

                    // var sQuery = oEvent.getParameter("query");
                    // if (sQuery && sQuery.length > 0) {

                    //}

                    aFilter.push(new Filter("OrderNumber", FilterOperator.Contains, OrderID));
                    //aFilter.push(new Filter("serialNo", FilterOperator.Contains, OrderID));



                    //---------Search the Order Number after Navigation



                    var oModel = this.getView().getModel();
                    sap.ui.core.BusyIndicator.show(0);

                    //  oModel.read("/RETURN_ORDERSet(SerialNumber='" + scanner[0] + "')", {
                    oModel.read("/DELIVERYSet", {
                        filters: aFilter,
                        success: function (oData, oResponse) {

                            this.returnOrderModel = new JSONModel();
                            var obj = oResponse.data.results;
                            var i = 0;
                            this.returnOrderModel.setData(obj);

                            this.getView().setModel(this.returnOrderModel, "returnOrderModel");
                            sap.ui.core.BusyIndicator.hide();
                        }.bind(this),
                        error: function (oError) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                        }.bind(this),
                    });

                    // --------End of Search ---------------


                }

                // this.getRouter().navTo("object", {
                // supplierID: startupParams.supplierID[0]  // read Supplier ID. Every parameter is placed in an array therefore [0] holds the value

                else {
                    this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
                        function (mParams) {
                            if (mParams.list.getMode() === "None") {
                                return;
                            }
                            supplierID = mParams.firstListitem.getBindingContext().getProperty("SupplierID");
                            this.getRouter().navTo("object", {
                                supplierID: supplierID
                            }, true);
                        }.bind(this),
                        function (mParams) {
                            if (mParams.error) {
                                return;
                            }
                            this.getRouter().getTargets().display("detailNoObjectsAvailable");
                        }.bind(this)
                    );
                }

            },
            onPressOrderType: function (oEvent) {

            },

            onSearch: function (oEvent) {

                var oFilterBar = oEvent.getSource();
                var aFilterItems = oFilterBar.getFilterGroupItems();
                this.getView().byId("idPGRBtn").setEnabled(false);
                this.getView().byId("idItemDetailsButton").setEnabled(false);
                this.getView().byId("idDismantlePartButton").setEnabled(false);
                var oFilter = [];


                var aFilters = aFilterItems.map(function (oFilterItem) {
                    var sFilterName = oFilterItem.getName();
                    var oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
                    var sValue;

                    if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Order Number') {

                        var aTokens = oControl.getTokens();
                        var aFilters = aTokens.map(function (oToken) {
                            if (oToken.data("range")) {
                                var oRange = oToken.data("range");
                                oFilter.push(new Filter({
                                    path: "OrderNumber",
                                    operator: oRange.operation,
                                    value1: oRange.value1,
                                    value2: oRange.value2
                                }));
                            }

                        });


                        // sValue = oControl.getValue();
                        // oFilter.push(new sap.ui.model.Filter("OrderNumber", sap.ui.model.FilterOperator.EQ, sValue));
                    }
                    else if (oControl.getMetadata().getName() === "sap.m.DateRangeSelection") {

                        // sValue = "20240110";
                        if (oControl.mProperties.value) {
                            oFilter.push(new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.GE, this.oFilter.sFrom),
                                    new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.LE, this.oFilter.sTo)
                                ],
                                and: true
                                // oFilter.push(new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.GE, this.oFilter.sFrom ));
                                // oFilter.push(new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.LE, this.oFilter.sTo));
                            }));
                        }
                    }
                    else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Order Type') {
                        if (oControl.getTokens()) {
                            //  sValue = oControl.mProperties._semanticFormValue;
                            //  oFilter.push(new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.Contains, sValue));
                            var aTokens = oControl.getTokens();
                            var aFilters = aTokens.map(function (oToken) {
                                if (oToken.mProperties.text !== '') {

                                    oFilter.push(new Filter({
                                        path: "OrderType",
                                        operator: 'EQ',
                                        value1: oToken.mProperties.text

                                    }));
                                }

                            });
                        }

                    }
                    else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Sales Org') {
                        if (oControl.getTokens()) {
                            // sValue = oControl.mProperties._semanticFormValue;
                            // oFilter.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, sValue));
                            var aTokens = oControl.getTokens();
                            var aFilters = aTokens.map(function (oToken) {
                                if (oToken.mProperties.text !== '') {

                                    oFilter.push(new Filter({
                                        path: "SalesOrg",
                                        operator: 'EQ',
                                        value1: oToken.mProperties.text

                                    }));
                                }

                            });
                        }
                    }

                    //  new sap.ui.model.Filter(sFilterName, "EQ", sValue);
                    return oFilter;
                }, this);

                var oModel = this.getView().getModel();
                sap.ui.core.BusyIndicator.show(0);

                //  oModel.read("/RETURN_ORDERSet(SerialNumber='" + scanner[0] + "')", {
                oModel.read("/DELIVERYSet", {
                    filters: oFilter,
                    success: function (oData, oResponse) {

                        this.returnOrderModel = new JSONModel();
                        var obj = oResponse.data.results;
                        var i = 0;
                        this.returnOrderModel.setData(obj);

                        this.getView().setModel(this.returnOrderModel, "returnOrderModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                   //     this.returnOrderModel = new JSONModel();
                        this.returnOrderModel.setData({});
                        MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this),
                });
            },

            onChangeSearch: function (oEvent) {

                var oOrderNumber = oEvent.getParameter("value");
                var oFilter = [];

                oFilter.push(new Filter("OrderNumber", FilterOperator.Contains, oOrderNumber));
                //aFilter.push(new Filter("serialNo", FilterOperator.Contains, OrderID));







                var oModel = this.getView().getModel();
                sap.ui.core.BusyIndicator.show(0);

                //  oModel.read("/RETURN_ORDERSet(SerialNumber='" + scanner[0] + "')", {
                oModel.read("/DELIVERYSet", {
                    filters: oFilter,
                    success: function (oData, oResponse) {

                        this.returnOrderModel = new JSONModel();
                        var obj = oResponse.data.results;
                        var i = 0;
                        this.returnOrderModel.setData(obj);

                        this.getView().setModel(this.returnOrderModel, "returnOrderModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this),
                });

            },

            onSelectRow: function (oEvent) {

                var returOrderNumber = "";
                var oItem = this.getView().byId("idReturnOrderTable").getSelectedItem();
                //   var oEntry = oItem.returnOrderModel("yourODataModel").getObject();
                if (oItem) {

                    returOrderNumber = oItem.getBindingContext("returnOrderModel").getObject().OrderNumber;
                    this.getView().byId("idDismantlePartButton").setEnabled(true);
                    this.getView().byId("idPGRBtn").setEnabled(true);

                    this.getView().byId("idItemDetailsButton").setEnabled(true);

                }

            },



            onPressedItemDetails: function (oEvent) {
              
                var oRowSelected = this.getView().byId("idReturnOrderTable").getSelectedItem();
                //   var oEntry = oItem.returnOrderModel("yourODataModel").getObject();
              
                var orderID = oRowSelected.getBindingContext("returnOrderModel").getObject().OrderNumber;
                var oModel = this.getView().getModel();
                var oFilter = [];
                oFilter.push(new Filter({
                    path: "OrderNumber",
                    operator: 'EQ',
                    value1: orderID

                }));
                sap.ui.core.BusyIndicator.show(0);

                //  oModel.read("/DELIVERYSet('" +orderID + "')/OrderDetails_Nav", {
                oModel.read("/ORDER_ITEMSet", {
                    filters: oFilter,
                    success: function (oData, oResponse) {
                       
                        this.itemDetailModels = new JSONModel();
                        var obj = oResponse.data.results;
                     
                        this.itemDetailModels.setData(obj);

                        this.getView().setModel(this.itemDetailModels, "itemDetailModels");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        this.returnOrderModel = new JSONModel();
                        this.returnOrderModel.setData({});
                        MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this),
                });
                
               
                    var oView = this.getView();
                    // create dialog lazily
                    if (!this.byId("openDialog")) {
                        // load asynchronous XML fragment
                        Fragment.load({
                            id: oView.getId(),
                            name: "zsnetorderdetails.fragment.ItemsDetails",
                            controller: this
                        }).then(function (oDialog) {
                            // connect dialog to the root view 
                            //of this component (models, lifecycle)
                            oView.addDependent(oDialog);
                            oDialog.open();
                        });
                    } else {
                        this.byId("openDialog").open();
                    }
                },
                    onPresDismantlePart: function (oEvent) {
              
                    var oRowSelected = this.getView().byId("idReturnOrderTable").getSelectedItem();
                    //   var oEntry = oItem.returnOrderModel("yourODataModel").getObject();
                  
                    var oPayload = {};
                     oPayload.OrderNumber = oRowSelected.getBindingContext("returnOrderModel").getObject().OrderNumber;
                     oPayload.CreationDate = oRowSelected.getBindingContext("returnOrderModel").getObject().CreationDate;
                     oPayload.OrderType = oRowSelected.getBindingContext("returnOrderModel").getObject().OrderType;
                     oPayload.SalesOrg = oRowSelected.getBindingContext("returnOrderModel").getObject().SalesOrg;
                    var oModel = this.getView().getModel();
                    // var oFilter = [];
                    // oFilter.push(new Filter({
                    //     path: "OrderNumber",
                    //     operator: 'EQ',
                    //     value1: orderID
    
                    // }));
                    sap.ui.core.BusyIndicator.show(0);
                    
                    oModel.create("/DISMANTLESet", oPayload, {
                        method: "POST",
                        success: function (data, oResponse) {
                            sap.ui.core.BusyIndicator.hide();
                            this.getView().byId("idDismantlePartButton").setEnabled(false);
                            MessageToast.show(JSON.parse(oResponse.headers['sap-message']).message);
                        }.bind(this),
                        error: function (e) {
                            //MessageToast.show(e.responseText.split(',')[2].split(":")[1] + ' ' + e.responseText.split(',')[2].split(":")[2]);
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show(JSON.parse(e.responseText).error.message.value);
                            //   this.getView().byId("idButtonUpdate").setEnabled(false);
                        }.bind(this)
                    });
    
                 
                    
                   
                    
                    },

                closeDialog: function () {
                    this.byId("openDialog").close();
                    this.byId("openDialog").destroy();
                },


                onOrderNumberClick : function(oEvent)
                {
                
                    var obj = parseInt(oEvent.getSource().mProperties.text);
                    const oLink = new URL(
                        window.location.origin +
                        "/sap/bc/gui/sap/its/webgui?~transaction=VA02 VBAK-VBELN="+obj+"&sap-system=LOCAL"
                       // "/fiori#Shell-startGUI?sap-ui2-tcode=VA02&~VBELN=60008188&sap-system=LOCAL"
                       //   "/sap/bc/ui2/flp?#Shell-startGUI?sap-ui2-tcode=VA02&~VBELN=60008188&sap-system=LOCAL"
                         
                      );
                      let URLHelper =sap.m.URLHelper;
                      URLHelper.redirect(oLink.href, true);
                },
                onPressedCreatePGR: function (oEvent) {
    
                    var payLoad = {};
                    var oRowSelected = this.getView().byId("idReturnOrderTable").getSelectedItem();
                    //   var oEntry = oItem.returnOrderModel("yourODataModel").getObject();
                    sap.ui.core.BusyIndicator.show(0);
                    var oTableData = oRowSelected.getBindingContext("returnOrderModel").getObject();
                    payLoad.OrderNumber = oTableData.OrderNumber;
                    payLoad.CreationDate = oTableData.CreationDate;
                    payLoad.OrderType = oTableData.OrderType;
                    payLoad.SalesOrg = oTableData.SalesOrg;

                    var oModel = this.getView().getModel();


                    oModel.create("/DELIVERYSet", payLoad, {
                        method: "POST",
                        success: function (data, oResponse) {

                            sap.ui.core.BusyIndicator.hide();

                            MessageToast.show(JSON.parse(oResponse.headers['sap-message']).message);
                        }.bind(this),
                        error: function (e) {

                            //MessageToast.show(e.responseText.split(',')[2].split(":")[1] + ' ' + e.responseText.split(',')[2].split(":")[2]);
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show(JSON.parse(e.responseText).error.message.value);
                            //   this.getView().byId("idButtonUpdate").setEnabled(false);
                        }.bind(this)
                    });

                },

                handleChange: function (oEvent) {

                    this.oFilter.sFrom = oEvent.getParameter("from");
                    this.oFilter.sTo = oEvent.getParameter("to");
                    var bValid = oEvent.getParameter("valid"),
                        oEventSource = oEvent.getSource();
                    //     oText = this.byId("etarangedateID");

                    this._iEvent++;

                    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        //   pattern: "yyyyMMdd"
                        pattern: "MM/dd/yyyy"
                    });

                    this.oFilter.sFrom = dateFormat.format(this.oFilter.sFrom);
                    this.oFilter.sTo = dateFormat.format(this.oFilter.sTo);
                    this.oFilter.sFrom = this.formatDate1(this.oFilter.sFrom);
                    this.oFilter.sTo = this.formatDate1(this.oFilter.sTo);
                    //   //  oText.setValue("Id: " + oEventSource.getId() + "\nFrom: " + this.oFilter.sFrom+ "\nTo: " + this.oFilter.sTo);

                    //     if (bValid) {
                    //       //  oEventSource.setValueState(ValueState.None);
                    //     } else {
                    //       //  oEventSource.setValueState(ValueState.Error);
                    //     }
                },

                // format Date 

                formatDate1: function (oValue) {

                    if (oValue) {
                        var obj = oValue.split('/')
                        return obj[2] + obj[0] + obj[1]
                    }


                },


                //------------------------------ Start of Order Type --------------------------------------

                onOrderTypeVH: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();
                    this.oMultiInput1 = oEvent.getSource().getId();
                    // create value help dialog
                    if (!this._pValueHelpDialog) {
                        this._pValueHelpDialog = Fragment.load({
                            id: oView.getId(),
                            name: "zsnetorderdetails.fragment.OrderType",
                            controller: this
                        }).then(function (oValueHelpDialog) {
                            oView.addDependent(oValueHelpDialog);
                            return oValueHelpDialog;
                        });
                    }

                    this._pValueHelpDialog.then(function (oValueHelpDialog) {
                        // create a filter for the binding
                        oValueHelpDialog.getBinding("items").filter([new Filter(
                            "Bezei",
                            FilterOperator.Contains,
                            sInputValue
                        )]);
                        // open value help dialog filtered by the input value
                        oValueHelpDialog.open(sInputValue);
                    });
                },

                _handleValueHelConfirm: function (evt) {
                    //    var aSelectedItems = evt.getParameter("selectedItems");
                    var aSelectedItems = evt.getParameters("tokens").selectedContexts;
                    var alength = aSelectedItems.length;
                    //  oMultiInput1 = this.byId("idOrderTypeVH");
                    // this.oMultiInput1 = evt.getSource().getId();

                    for (var i = 0; i < alength; i++) {
                        var sPath = parseInt(aSelectedItems[i].sPath.split("/")[1]);
                        for (var j = 0; j < this.orderTypeModel.oData.length; j++) {
                            if (sPath === j) {
                                this.byId(this.oMultiInput1).addToken(new Token({
                                    text: this.orderTypeModel.oData[sPath].Auart
                                    //  text :aSelectedItems[0].mProperties.title

                                }));
                            }
                        }
                    }

                 
                },

                _handleValueHelpSearch: function (evt) {
                    var sValue = evt.getParameter("value");
                    var oFilter = new Filter(
                        "Auart",
                        FilterOperator.Contains,
                        sValue
                    );
                    evt.getSource().getBinding("items").filter([oFilter]);
                },


                onDialogClose: function (evt) {
                    var aSelectedItems = evt.getParameter("selectedItems"),
                        oMultiInput1 = this.byId("idOrderTypeVH");

                    if (aSelectedItems && aSelectedItems.length > 0) {
                        aSelectedItems.forEach(function (oItem) {
                            oMultiInput1.addToken(new Token({
                                text: oItem.getTitle()
                            }));
                        });
                    }
                },

                // End of Order Type

                //------------------------------ Start of Sales Type --------------------------------------

                onSalesOrgVH: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();

                    // create value help dialog
                    if (!this._pValueHelpDialog1) {
                        this._pValueHelpDialog1 = Fragment.load({
                            id: oView.getId(),
                            name: "zsnetorderdetails.fragment.SalesOrg",
                            controller: this
                        }).then(function (oValueHelpDialog) {
                            oView.addDependent(oValueHelpDialog);
                            return oValueHelpDialog;
                        });
                    }

                    this._pValueHelpDialog1.then(function (oValueHelpDialog) {
                        // create a filter for the binding
                        oValueHelpDialog.getBinding("items").filter([new Filter(
                            "Vkorg",
                            FilterOperator.Contains,
                            sInputValue
                        )]);
                        // open value help dialog filtered by the input value
                        oValueHelpDialog.open(sInputValue);
                    });
                },

                _handleSalesOrgValueHelConfirm: function (evt) {
                    var aSelectedItems = evt.getParameter("selectedItems"),
                        oMultiInput = this.byId("idSalesOrgVH");

                    if (aSelectedItems && aSelectedItems.length > 0) {
                        aSelectedItems.forEach(function (oItem) {
                            oMultiInput.addToken(new Token({
                                text: oItem.getTitle()
                                //  text :aSelectedItems[0].mProperties.title

                            }));
                        });
                    }
                },

                _handleSalesOrgValueHelpSearch: function (evt) {
                    var sValue = evt.getParameter("value");
                    var oFilter = new Filter(
                        "Vkorg",
                        FilterOperator.Contains,
                        sValue
                    );
                    evt.getSource().getBinding("items").filter([oFilter]);
                },


                _handleSalesOrgValueHelpClose: function (evt) {
                    var aSelectedItems = evt.getParameter("selectedItems"),
                        oMultiInput = this.byId("idSalesOrgVH");

                    if (aSelectedItems && aSelectedItems.length > 0) {
                        aSelectedItems.forEach(function (oItem) {
                            oMultiInput.addToken(new Token({
                                text: oItem.getTitle()
                            }));
                        });
                    }
                },

                //-------------------------------------------------- End of Sales Org-------------------------------------------------------------

                //----------------------------------------------------------------------- Start of Order Number Value Help------------------------------------------------------------------

                onOrderNumbersVHRequested: function (oEvent) {

                    this._oValueHelpDialog = sap.ui.xmlfragment("zsnetorderdetails.fragment.OrderNumberVH", this);
                    this.getView().addDependent(this._oValueHelpDialog);
                    this._oValueHelpDialog.setRangeKeyFields([{
                        label: "Order Number",
                        key: "OrderID",
                        type: "string",
                        typeInstance: new TypeString({}, {
                            maxLength: 15
                        })
                    }]);

                    this._oValueHelpDialog.setTokens(this._oMultipleConditionsInput.getTokens());
                    this._oValueHelpDialog.open();

                    // this.loadFragment({
                    //     name: "zsnetorderdetails.fragment.OrderNumberVH"
                    // }).then(function (oMultipleConditionsDialog) {

                    //     this._oMultipleConditionsDialog = oMultipleConditionsDialog;
                    //     this.getView().addDependent(oMultipleConditionsDialog);
                    //     oMultipleConditionsDialog.setRangeKeyFields([{
                    //         label: "Order Number",
                    //         key: "OrderID",
                    //         type: "string",
                    //         typeInstance: new TypeString({}, {
                    //             maxLength: 15
                    //         })
                    //     }]);


                    //     oMultipleConditionsDialog.open();
                    // }.bind(this));
                },
                onMultipleConditionsValueHelpOkPress: function (oEvent) {






                    ///
                    var aTokens = oEvent.getParameter("tokens");
                    // this._oValueHelpDialog.setTokens(aTokens);
                    // this._oValueHelpDialog.close();
                    this._oMultipleConditionsInput.setTokens(aTokens);
                    this._oValueHelpDialog.close();
                },
                onMultipleConditionsCancelPress: function () {
                    //  this._oMultipleConditionsDialog.close();
                    this._oValueHelpDialog.close();
                },
                onMultipleConditionsAfterClose: function () {
                    //    this._oMultipleConditionsDialog.destroy();
                    this._oValueHelpDialog.destroy();
                },


                //---------------------------------------------------------------End of OrderNumber Value Help ---------------------------------------------------------------------------
                //End of Order Number Value Help

            });
    });
