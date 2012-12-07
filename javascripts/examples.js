// single key example
Mousetip.bindKey("a", "A single key example.  This will never display a tooltip", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// single key example showing uppercase to shift + lowercase conversion
Mousetip.bindKey("A", "A single key magically converted into it's multiple key combo", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// shift + single key example bound, bypassing uppercase to shift + lowercase combo
Mousetip.bindKey("shift+l", "Shift key example, bypassing automatic conversion", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// single key example showing uppercase to shift + lowercase conversion
Mousetip.bindKey("E", "A single key magically converted into it's multiple key combo", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// meta key example
Mousetip.bindKey("meta+e", "This shortcut is bound to functionality in chrome on Mac.  To prevent the default event from firing, simple return false in your callback", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// meta key example
Mousetip.bindKey("meta+shift+e", "A simple meta + shift key example", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// another meta key example with longer description
Mousetip.bindKey("meta+shift+v", "You can only bind one non-modifier key when the meta key is part of the combination", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// alt key example
Mousetip.bindKey("meta+alt+.", "Alt and option are both bound to the same keys", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// option key example
Mousetip.bindKey("meta+option+2", "Option is a special alias, proxied to alt", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// shortcut bound to most browsers (find text)
Mousetip.bindKey("meta+f", "This shortcut is bound to an event in chrome. To prevent the default action simply return false in your callback", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
  return false;
});

// shortcut bound to chrome action
Mousetip.bindKey("meta+z", "This shortcut is bound to an action in chrome. To prevent the default action simply return false in your callback", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
  return false;
});

// taking focus away from the window with an alert message
Mousetip.bindKey("ctrl+k+v", "This will trigger an alert message to take focus away from the browser window.", function() {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
  alert("Testing window focus");
});

// simple ctrl + key shortcut
Mousetip.bindKey("ctrl+0", "Simple control key shortcut", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// invalid binding
Mousetip.bindKey("ctrl+M", "If you'd like to bind an uppercase letter, you can only do it with a shift+lowercase when there is no modifier involved", function(e, combo) {
  $.bootstrapGrowl('You triggered shortcut: ' + combo);
});

// binding the tooltip toggle to a combination
Mousetip.bindKey("ctrl+t", "Toggle mousetip", function(e, combo) {
  toggleMousetip();
});

// binding the tooltip output to the UI library
// you can use any tooltip library you'd like
Mousetip.bindTooltip(function(shortcuts, e) {
  MousetipUI.tip(shortcuts);
});

var toggleMousetip = function() {
  Mousetip.toggle(function(power) {
    var switchText = power ? "ON" : "OFF",
        alertType = power ? "success" : "error";
    if (!power) {
      MousetipUI.off();
    }

    $.bootstrapGrowl("Mousetip " + switchText, alertType);
    $("#power").text(switchText);
  });
};

$(function() {
  $("#toggle").click(function(e) {
    toggleMousetip();
  });
});