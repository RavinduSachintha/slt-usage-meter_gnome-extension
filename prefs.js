const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  const widget = new SltUsageMeterPrefsWidget();
  // gtk_window_set_default_size(widget,800,600); 
  gtk_widget_set_size_request(widget,200,300);
  widget.show_all();
  return widget;
}

const SltUsageMeterPrefsWidget = GObject.registerClass(
  class MyPrefsWidget extends Gtk.ScrolledWindow {
    _init(params) {
      super._init(params);
      log("Hello")

      let builder = new Gtk.Builder();
      builder.set_translation_domain('rs');
      builder.add_from_file(Me.path + '/prefs.ui');

      // this.connect("destroy", Gtk.main_quit);

      // this.margin = 20;
      // this.set_spacing(15);
      // this.set_orientation(Gtk.Orientation.VERTICAL);

      // // this.connect("destroy", Gtk.main_quit);

      // let myLabel = new Gtk.Label({
      //   label: "Translated Text",
      // });

      // let spinButton = new Gtk.SpinButton();
      // spinButton.set_sensitive(true);
      // spinButton.set_range(-60, 60);
      // spinButton.set_value(0);
      // spinButton.set_increments(1, 2);

      // spinButton.connect("value-changed", function (w) {
      //   log(w.get_value_as_int());
      // });

      // let hBox = new Gtk.Box();
      // hBox.set_orientation(Gtk.Orientation.HORIZONTAL);

      // hBox.pack_start(myLabel, false, false, 0);
      // hBox.pack_end(spinButton, false, false, 0);

      // this.add(hBox)

      this.add(builder.get_object('main_prefs'));
    }
  }
);
