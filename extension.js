// imports
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// import custom scripts
const Cons = Me.imports.constants;
const UsageMeter = Me.imports.usagemeter;
const Utils = Me.imports.utils;

var sltUsageMeter = null;

// initialize the extension
function init() {
  Cons.iconSize = Math.round((Panel.PANEL_ICON_SIZE * 4) / 5);
}

// enable the extension
function enable() {
  sltUsageMeter = new UsageMeter.SltUsageMeter();

  Main.panel._addToPanelBox(
    "SltUsageMeter",
    sltUsageMeter,
    1,
    Main.panel._rightBox
  );
}

// disable the extension
function disable() {
  let handlers = Utils.schemaData.get_strv("handler-list");
  Utils.setSignalsHandlerListToSchema(Utils.schemaData, []);

  // destry objects
  if (sltUsageMeter) {
    sltUsageMeter.destroy();
    sltUsageMeter = null;
  }

  // desconnet signals
  for (const handlerId of handlers) {
    global.settings.disconnect(handlerId);
  }
}
