// imports
const Main = imports.ui.main;
const St = imports.gi.St;
const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Gio = imports.gi.Gio;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

// constants
const username = "";
const password = "";
const schemaId = "org.gnome.shell.extensions.slt_usage_meter";
const expiringOffset = 30;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const schemaData = getSchemaValues();

// get the schema values
function getSchemaValues() {
  let GioSSS = Gio.SettingsSchemaSource;

  let schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    GioSSS.get_default(),
    false
  );

  let schemaObj = schemaSource.lookup(schemaId, true);

  if (!schemaObj) {
    throw new Error("cannot find schemas");
  }

  return new Gio.Settings({ settings_schema: schemaObj });
}

// send login request
function send_auth_request() {
  let soupSyncSession = new Soup.SessionSync();

  let url = schemaData.get_string("auth-url");
  let authReqParams =
    `client_id=${schemaData.get_string("xibmclientid")}` +
    `&grant_type=password` +
    `&password=${password}` +
    `&scope=scope1` +
    `&username=${username}`;

  let message = Soup.Message.new("POST", url);
  message.request_headers.append("Accept", "application/json");
  message.set_request("application/x-www-form-urlencoded", 2, authReqParams);

  let responseCode = soupSyncSession.send_message(message);
  let out;
  if (responseCode == 200) {
    try {
      out = JSON.parse(message["response-body"].data);
    } catch (error) {
      log(error);
    }
  }
  return out;
}

// send other requests
function send_request(url, token, subscriberId, type = "GET") {
  let soupSyncSession = new Soup.SessionSync();

  let message = Soup.Message.new(type, url);
  message.request_headers.append("Authorization", `Bearer ${token}`);
  message.request_headers.append("x-ibm-client-id", schemaData.get_string("xibmclientid"));
  message.request_headers.append("subscriberid", subscriberId);
  message.request_headers.set_content_type("application/json", null);

  let responseCode = soupSyncSession.send_message(message);
  let out;

  if (responseCode == 200) {
    try {
      out = JSON.parse(message["response-body"].data);
    } catch (error) {
      log(error);
    }
  }

  return out;
}

// set authentication request data to the schema
function setAuthDataFromSchema(schemaData, data) {
  schemaData.set_string("access-token", data.access_token);
  schemaData.set_string("token-type", data.token_type);
  schemaData.set_string("subscriber-id", data.metadata);
  schemaData.set_int("expires-in", data.expires_in);
  schemaData.set_int("consented-on", data.consented_on);
  schemaData.set_string("scope", data.scope);
  schemaData.set_string("refresh-token", data.refresh_token);
  schemaData.set_int("refresh-token-expires-in", data.refresh_token_expires_in);
}

// check usage button action
function check_usage_btn_action() {
  let consentedOn = schemaData.get_int("consented-on");
  let expiresIn = schemaData.get_int("expires-in");

  const dateObject = new Date(0);
  dateObject.setUTCSeconds(consentedOn + expiresIn - expiringOffset);

  let data = null;

  if (dateObject <= new Date()) {
    data = send_auth_request();
    if (data) {
      setAuthDataFromSchema(schemaData, data);
    }
  }

  let url = schemaData.get_string("vas-data-url");
  let authToken = schemaData.get_string("access-token");
  let subscriberId = schemaData.get_string("subscriber-id");

  data = send_request(url, authToken, subscriberId);
  if (data) {
    let limitData = parseFloat(data.package_summary.limit);
    let usedData = parseFloat(data.package_summary.used);
    Main.notify(
      "SLT Usage Meter",
      `Used: ${usedData}GB | Remains: ${(limitData - usedData).toFixed(1)}GB`
    );
  }
}

// slt usage meter class
const SltUsageMeter = new Lang.Class({
  Name: "SltUsageMeter.indicator",
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0);

    // let gicon = Gio.icon_new_for_string(Me.path + "/assets/ext_icon.png");
    let icon = new St.Icon({ style_class: "ext_icon" });
    this.add_child(icon);

    let menuItem = new PopupMenu.PopupMenuItem("Check Usage");
    menuItem.actor.connect("button-press-event", check_usage_btn_action);

    this.menu.addMenuItem(menuItem);
  },
});

// initialize the extension
function init() {
  log("Slt Usage Meter extension initalized");
}

// enable the extension
function enable() {
  log("Slt Usage Meter extension enabled");

  let _indicator = new SltUsageMeter();
  Main.panel._addToPanelBox(
    "SltUsageMeter",
    _indicator,
    1,
    Main.panel._rightBox
  );
}

// disable the extension
function disable() {
  log("Slt Usage Meter extension disabled");

  _indicator.destroy();
}
