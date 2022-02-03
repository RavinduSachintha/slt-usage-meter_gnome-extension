const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Utils = Me.imports.utils;
const API = Me.imports.api;

function init() {}

function buildPrefsWidget() {
  const widget = new SltUsageMeterPrefsWidget();
  widget.show_all();

  // Access the  main window of prefs
  GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    // In GTK4 (GNOME 40), call `get_root()` instead of `get_toplevel()`
    let window = widget.get_toplevel();
    window.resize(400, 200);
    // window.set_resizable(false);

    let headerBar = window.get_titlebar();
    headerBar.title = `${Me.metadata.name} Preferences`;

    return GLib.SOURCE_REMOVE;
  });

  return widget;
}

const SltUsageMeterPrefsWidget = GObject.registerClass(
  class MyPrefsWidget extends Gtk.ScrolledWindow {
    _init(params) {
      super._init(params);

      let builder = new Gtk.Builder();
      builder.set_translation_domain("rs");
      builder.add_from_file(Me.path + "/prefs.ui");

      // this.connect("destroy", Gtk.main_quit);

      let btnSave = builder.get_object("btnSave");
      let btnClear = builder.get_object("btnClear");
      let btnTest = builder.get_object("btnTest");

      let entUsername = builder.get_object("entUsername");
      let entPassword = builder.get_object("entPassword");

      let lblStatus = builder.get_object("lblStatus");
      let spinStatus = builder.get_object("spinStatus");

      let SignalHandler = {
        entUsername_changed_cb() {
          Utils.setPrefsCredentialBtnsSensitivity(
            btnSave,
            btnClear,
            btnTest,
            entUsername,
            entPassword,
            lblStatus
          );
        },

        entPassword_changed_cb() {
          Utils.setPrefsCredentialBtnsSensitivity(
            btnSave,
            btnClear,
            btnTest,
            entUsername,
            entPassword,
            lblStatus
          );
        },

        btnSave_clicked_cb() {
          spinStatus.start();

          Utils.setAuthCredentials(Utils.schemaData, {
            username: entUsername.get_text(),
            password: entPassword.get_text(),
          });

          entUsername.set_text("");
          entPassword.set_text("");
          lblStatus.set_text("Credentials are successfully saved.");

          spinStatus.stop();
        },

        btnClear_clicked_cb() {
          entUsername.set_text("");
          entPassword.set_text("");
          lblStatus.set_text("");
        },

        btnTest_clicked_cb() {
          spinStatus.start();

          let data = API.send_auth_request();

          if (
            (data != undefined || data != null) &&
            data.access_token != null
          ) {
            lblStatus.set_text(
              "Stored credentials are successfully authenticated."
            );
          } else {
            lblStatus.set_text("Stored credentials are incorrect. Try again.");
          }

          spinStatus.stop();
        },
      };

      builder.connect_signals_full((builder, object, signal, handler) => {
        object.connect(signal, SignalHandler[handler].bind(this));
      });

      this.add(builder.get_object("main_prefs"));
    }
  }
);
