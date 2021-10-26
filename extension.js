// imports
const Main = imports.ui.main;
const St = imports.gi.St;
const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Gio = imports.gi.Gio;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();

// constants
const xIbmClientId = "622cc49f-6067-415e-82cd-04b1b76f6377";
const username = "";
const password = "";
const schemaId = "org.gnome.shell.extensions.slt_usage_meter";
const expiringOffset = 30;

const vasDataUrl =
  "https://omniscapp.slt.lk/mobitelint/slt/sltvasservices/dashboard/vas_data";
const authUrl =
  "https://omniscapp.slt.lk/mobitelint/slt/sltvasoauth/oauth2/token";

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

  const authReqParams =
    `client_id=${xIbmClientId}` +
    `&grant_type=password` +
    `&password=${password}` +
    `&scope=scope1` +
    `&username=${username}`;

  let message = Soup.Message.new("POST", authUrl);
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
  message.request_headers.append("x-ibm-client-id", xIbmClientId);
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
  let schemaData = getSchemaValues();
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

  let authToken = schemaData.get_string("access-token");
  let subscriberId = schemaData.get_string("subscriber-id");

  data = send_request(vasDataUrl, authToken, subscriberId);
  if (data) {
    let limitData = parseFloat(data.package_summary.limit);
    let usedData = parseFloat(data.package_summary.used);
    Main.notify(
      "SLT Usage Meter",
      `Used: ${usedData}GB | Remains: ${limitData - usedData}GB`
    );
  }
}

// slt usage meter class
const SltUsageMeter = new Lang.Class({
  Name: "SltUsageMeter.indicator",
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0);

    let icon = new St.Icon({
      icon_name: "face-cool",
      icon_size: 18,
    });
    this.actor.add_child(icon);

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
