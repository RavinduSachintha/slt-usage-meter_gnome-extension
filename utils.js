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
      Me.dir.get_child("schemas").get_path(), GioSSS.get_default(), false);

  let schemaObj = schemaSource.lookup(Cons.schemaId, true);

  if (!schemaObj) {
    throw new Error("cannot find schemas");
  }

  return new Gio.Settings({settings_schema : schemaObj});
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
