// imports
const Soup = imports.gi.Soup;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// import custom scripts
const Cons = Me.imports.constants;
const Utils = Me.imports.utils;

// send login request
function send_auth_request() {
  let soupSyncSession = new Soup.SessionSync();

  let url = Utils.schemaData.get_string("auth-url");
  let authReqParams =
    `client_id=${Utils.schemaData.get_string("xibmclientid")}` +
    `&grant_type=password` +
    `&password=${Cons.password}` +
    `&scope=scope1` +
    `&username=${Cons.username}`;

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
  message.request_headers.append(
    "x-ibm-client-id",
    Utils.schemaData.get_string("xibmclientid")
  );
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
