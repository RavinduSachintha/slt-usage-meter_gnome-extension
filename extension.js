// imports
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// import custom scripts
const Cons = Me.imports.constants;
const UsageMeter = Me.imports.usagemeter;

var sltUsageMeter = null;

// initialize the extension
function init() {
  log("Slt Usage Meter extension initalized");
  Cons.iconSize = Math.round((Panel.PANEL_ICON_SIZE * 4) / 5);
}

// enable the extension
function enable() {
  log("Slt Usage Meter extension enabled");
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
  log("Slt Usage Meter extension disabled");
  sltUsageMeter.destroy();
}
