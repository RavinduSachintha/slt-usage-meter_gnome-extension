// imports
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// import custom scripts
const Cons = Me.imports.constants;
const Utils = Me.imports.utils;
const API = Me.imports.api;

// slt usage meter class
var SltUsageMeter = new Lang.Class({
  Name: "SltUsageMeter.indicator",
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0);
    this.remaining_percentage = 100;
    this.refresh_time = 5;

    let box = new St.BoxLayout();

    let gicon = Gio.icon_new_for_string(Me.path + "/assets/ext_icon.png");
    let icon = new St.Icon({ gicon, icon_size: Cons.iconSize, style_class: 'ext_icon' });

    this.label = new St.Label({
      text: ` ${this.remaining_percentage}%`,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    });

    this._refresh();

    box.add(icon);
    box.add(this.label);
    this.add_child(box);

    let menuItem1 = new PopupMenu.PopupMenuItem("Check Usage");
    menuItem1.actor.connect("button-press-event", check_usage_btn_action);
    this.menu.addMenuItem(menuItem1);

    let menuItem2 = new PopupMenu.PopupMenuItem("Settings");
    menuItem2.connect("activate", open_settings);
    this.menu.addMenuItem(menuItem2);
  },

  updateUI: function () {
    this.remaining_percentage = usage_label_update();

    if (this.remaining_percentage == undefined) {
      this.refresh_time = 90;
    } else {
      this.refresh_time = 5;
    }

    this.label.set_text(` ${this.remaining_percentage}%`);
  },

  _refresh: function () {
    this.updateUI();
    this._removeTimeout();
    this._timeout = Mainloop.timeout_add_seconds(this.refresh_time, Lang.bind(this, this._refresh));
    return true;
  },

  _removeTimeout: function () {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
  }
});

// check usage button action
function check_usage_btn_action() {
  let data = get_usage_data_from_api();
  if (data) {
    let limitData = parseFloat(data.package_summary.limit);
    let usedData = parseFloat(data.package_summary.used);
    Main.notify(
      "SLT Usage Meter",
      `Used: ${usedData}GB | Remains: ${(limitData - usedData).toFixed(1)}GB`
    );
  }
}

// usage icon label
function usage_label_update() {
  let data = get_usage_data_from_api();
  if (data) {
    let limitData = parseFloat(data.package_summary.limit);
    let usedData = parseFloat(data.package_summary.used);
    return Math.round(100 * (limitData - usedData) / limitData);
  }
}

function get_usage_data_from_api() {
  let consentedOn = Utils.schemaData.get_int("consented-on");
  let expiresIn = Utils.schemaData.get_int("expires-in");

  const dateObject = new Date(0);
  dateObject.setUTCSeconds(consentedOn + expiresIn - Cons.expiringOffset);

  let data = null;

  if (dateObject <= new Date()) {
    data = API.send_auth_request();
    if (data) {
      Utils.setAuthDataFromSchema(Utils.schemaData, data);
    }
  }

  let url = Utils.schemaData.get_string("vas-data-url");
  let authToken = Utils.schemaData.get_string("access-token");
  let subscriberId = Utils.schemaData.get_string("subscriber-id");

  return API.send_request(url, authToken, subscriberId);
}

function open_settings() {
  if (typeof ExtensionUtils.openPrefs === "function") {
    ExtensionUtils.openPrefs();
  }
}
