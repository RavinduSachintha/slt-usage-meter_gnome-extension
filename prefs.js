const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  const widget = new SltUsageMeterPrefsWidget();
  widget.show_all();

  // Access the  main window of prefs
  GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    // In GTK4 (GNOME 40), call `get_root()` instead of `get_toplevel()`
    let window = widget.get_toplevel();
    window.resize(400, 200);

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

      this.add(builder.get_object("main_prefs"));
    }
  }
);
