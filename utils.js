// imports
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// import custom scripts
const Cons = Me.imports.constants;

var schemaData = getSchemaValues();

// get the schema values
function getSchemaValues() {
  let GioSSS = Gio.SettingsSchemaSource;

  let schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    GioSSS.get_default(),
    false
  );

  let schemaObj = schemaSource.lookup(Cons.schemaId, true);

  if (!schemaObj) {
    throw new Error("cannot find schemas");
  }

  return new Gio.Settings({ settings_schema: schemaObj });
}

// set authentication request data to the schema
function setAuthDataToSchema(schemaData, data) {
  schemaData.set_string("access-token", data.access_token);
  schemaData.set_string("token-type", data.token_type);
  schemaData.set_string("subscriber-id", data.metadata);
  schemaData.set_int("expires-in", data.expires_in);
  schemaData.set_int("consented-on", data.consented_on);
  schemaData.set_string("scope", data.scope);
  schemaData.set_string("refresh-token", data.refresh_token);
  schemaData.set_int("refresh-token-expires-in", data.refresh_token_expires_in);
}

function setAuthCredentials(schemaData, data) {
  schemaData.set_string("username", data.username);
  schemaData.set_string("password", data.password);
}

function setPrefsCredentialBtnsSensitivity(
  btnSave,
  btnClear,
  btnTest,
  entUsername,
  entPassword,
  lblStatus
) {
  if (
    entUsername.get_text_length() >= 1 ||
    entPassword.get_text_length() >= 1
  ) {
    btnClear.set_sensitive(true);
    lblStatus.set_text("");
  } else {
    btnClear.set_sensitive(false);
  }

  if (
    entUsername.get_text_length() >= 1 &&
    entPassword.get_text_length() >= 1
  ) {
    btnSave.set_sensitive(true);
  } else {
    btnSave.set_sensitive(false);
  }

  if (btnClear.get_sensitive() || btnSave.get_sensitive()) {
    btnTest.set_sensitive(false);
  } else {
    btnTest.set_sensitive(true);
  }
}

function setSignalsHandlerListToSchema(schemaData, handlerList) {
  schemaData.set_strv("handler-list", handlerList);
}