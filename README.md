# Mousetip

Mousetip is a tooltip layer for keyboard shortcuts built on top of the Mousetrap library.

A weekend project that was a proof of concept.  There are quite a few things that need to
be worked out, however it's been heavily 'used' in the latest versions of Chrome and Firefox
on a Mac.  I still haven't tried it in Windows and IE, but when I get access to a Windows PC
I'll be sure to begin fixing bugs that creep up.

## Getting started

1.  Head over to http://craig.is/killing/mice and check out the documentation

2.  Include mousetip on your page before the closing ``</body>`` tag

    ```html
    <script src="/path/to/mousetip.js"></script>
    ```

3.  Add some keyboard events to listen for and add a description for the action

    ```html
    <script>
      
    // single key example
    Mousetip.bindKey("a", "Change background color to yellow", function(e, combo) {
      $('body').css('background-color', 'yellow');
    });

    // shift + single key example bound to uppercase value
    Mousetip.bindKey("A", "Insert the text 'hello world' into div", function(e, combo) {
      $("#container").text("hello world");
    });

    // meta key example
    Mousetip.bindKey("meta+shift+e", "Change background color to red", function(e, combo) {
      $('body').css('background-color', 'red');
    });

    // another meta key example with longer description
    Mousetip.bindKey("meta+shift+v", "You can only bind one non-modifier key when the meta key is part of the combination.", function(e, combo) {
      $("#container").text(combo);
    });

    // taking focus away from the window with an alert message
    Mousetip.bindKey("ctrl+k+v", "Alert message", function() {
      alert("Alert message"); 
    });

    // simple console message
    Mousetip.bindKey("ctrl+i", "Console message", function(e, combo) {
      console.log(combo);
    });

    // alt key example
    Mousetip.bindKey("meta+alt+.", "harharhar", function(e, combo) {
      $('body').css('background-color', 'blue');
    });

    // option key example
    Mousetip.bindKey("meta+option+2", "harharhar", function(e, combo) {
      $('body').css('background-color', 'green');
    });

    // invalid binding
    Mousetip.bindKey("ctrl+M", "If you'd like to bind an uppercase letter, you can only do it with a shift+lowercase when there is a modifier involved", function(e, combo) {
      console.log("This will never execute");
    });

    // binding the tooltip toggle to a combination
    Mousetip.bindKey("ctrl+t", "Toggle mousetip", function(e, combo) {
      Mousetip.toggle(function(power) {
        if (!power)
          MousetipUI.off();
      });
    });

    // binding the tooltip output to the UI library
    // you can use any tooltip library you'd like
    Mousetip.bindTooltip(function(shortcuts, e) {
      MousetipUI.tip(shortcuts);
    });

    </script>
    ```

## Why Mousetip?

Well I haven't found one that does something similar, so it's pretty unique in that sense!

* 'Realtime' keyboard shortcut tooltips
* Clicking the tooltip triggers the action bound to the shortcut
* Interchangable tooltip UI
* Small footprint
* No external dependencies

## TODO

* Support for sequences
* Better click support
* Fix known bugs
* Tests
* Documentation
* Project Page

## Documentation

Check the source code for now