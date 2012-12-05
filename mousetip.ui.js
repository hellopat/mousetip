/**
 * Copyright 2012 Patrick Clark
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * MousetipUI is a tiny tooltip UI library to be used in conjunction with Mousetip.
 * It exists merely for those who do not currently have a tooltip library integrated
 * into their application.
 *
 * @version 0.0.1
 * @url hellopat.github.com/mousetip
 */

(function() {

  var

  /**
   * Holds a set of the previously passed through shortcuts for comparison
   */
  _previousShortcuts = [],

  /**
   * jQuery like utility function for getting element
   */
  $ = function(id) {
    return document.getElementById(id);
  },

  /**
   * Plucks a single value from a collection of objects and
   * returns them as an array
   *
   * @param {arr} arr
   * @param {key} key
   * @return arr
   */
  _pluck = function(arr, key) {
    var vals = [];

    for (var i = 0; i < arr.length; i++) {
      vals.push(arr[i][key]);
    }

    return vals;
  },

  /**
   * Escapes all regex special characters (except "|")
   *
   * @param {str} text
   * @return str
   */
  _escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$#\s]/g, "\\$&");
  },

  /**
   * Replaces all matched keys with a span for highlighting
   *
   * @param {str} shortcut
   * @param {arr} combination
   * @return string
   */
  _matchText = function(shortcut, combination) {
    var comboStr = _escape(combination.join("|"));
    var matched = shortcut.replace(new RegExp(comboStr, "g"), function(s, key) {
      return '<span class="matched">' + s + '</span>' || s;
    });

    return matched;
  },

  /**
   * Updates the text in the shortcuts with versions available for highlighting
   * keys that are currently being pressed
   *
   * @param {arr} shortcuts
   * @return void
   */
  _updateMatchText = function(shortcuts) {
    var i, ele;

    for (i = 0; i < shortcuts.length; i++) {
      ele = $(shortcuts[i].shortcut).firstChild;
      ele.innerHTML = _matchText(shortcuts[i].shortcut, shortcuts[i].combination);
    }
  },

  /**
   * Checks if a shortcut still exists from the previous event
   *
   * @param {obj} shortcut
   * @param {arr} previousShortcuts
   * @return void
   */
  _shortcutExists = function(shortcut, previousShortcuts) {
    return previousShortcuts.indexOf(shortcut.shortcut) > -1;
  },

  /**
   * Creates a container element for the tips to be inserted into
   *
   * @return void
   */
  _createContainer = function() {
    var container;

    if ($("mousetip-container") == null) {
      // Container element
      container = document.createElement("div");
      container.setAttribute("id", "mousetip-container");
      document.body.appendChild(container);
    }
  },

  /**
   * Filters tooltips based on comparison between current / previous events
   *
   * @param {arr} shortcuts
   * @return void
   */
  _filterTips = function(shortcuts) {
    if (shortcuts.length > _previousShortcuts.length) {
      _createTips(shortcuts);
    } else if (shortcuts.length < _previousShortcuts.length) {
      _removeTips(shortcuts);
    }

    if (shortcuts.length > 0) {
      _updateMatchText(shortcuts);
    }

    _previousShortcuts = shortcuts;
  },

  /**
   * Creates a set of tooltips on the page
   *
   * @param {arr} shortcuts
   * @return void
   */
  _createTips = function(shortcuts) {
    var previousShortcuts = _pluck(_previousShortcuts, 'shortcut');

    for (var i = 0; i < shortcuts.length; i++) {
      if (!_shortcutExists(shortcuts[i], previousShortcuts)) {
        _createTip(shortcuts[i]);
      }
    }
  },

  /**
   * Creates a single tooltip on the page
   * 
   * @param {obj} shortcut
   * @return void
   */
  _createTip = function(shortcut) {
    var tip,
        tipShortcut,
        tipDescription,
        container = $("mousetip-container");
    
    tip = document.createElement("div");
    tip.setAttribute("id", shortcut.shortcut);
    tip.className = "mousetip mousetip-show";
    tip.onclick = function() {
      Mousetip.trigger(true);
      Mousetrap.trigger(shortcut.unmodifiedShortcut);
      _removeTips([]);
      _previousShortcuts = [];
    }
    
    tipShortcut = document.createElement("h4");
    tipShortcut.className = "shortcut";
    tipShortcut.innerHTML = shortcut.shortcut;
    
    tipDescription = document.createElement("p");
    tipDescription.className = "description";
    tipDescription.innerHTML = shortcut.description;

    tip.appendChild(tipShortcut)
    tip.appendChild(document.createElement("hr"));
    tip.appendChild(tipDescription);

    container.appendChild(tip);

    setTimeout(function() {
      tip.className = tip.className + " mousetip-transition-in";
    }, 40);
  },

  /**
   * Removes a set of tooltips from the page
   *
   * @param {arr} shortcuts
   * @return void
   */
  _removeTips = function(shortcuts) {
    var shortcuts = _pluck(shortcuts, 'shortcut');

    for (var i = 0; i < _previousShortcuts.length; i++) {
      if (!_shortcutExists(_previousShortcuts[i], shortcuts)) {
        _removeTip(_previousShortcuts[i]);
      }
    }
  },

  /**
   * Removes a single tooltip from the page
   *
   * @param {obj} shortcut
   * @return void
   */
  _removeTip = function(shortcut) {
    var tip,
        container = $("mousetip-container");

    tip = $(shortcut.shortcut);
    tip.className = "mousetip mousetip-hide mousetip-transition-out";
    setTimeout(function() {
      container.removeChild(tip);
    }, 150);
  },

  MousetipUI = {

    /**
     * Displays the tooltips
     * This function accepts an array of shortcuts for display
     *
     * @return void
     */
    tip: function(shortcuts) {
      _createContainer();
      _filterTips(shortcuts);
    },
    
    /**
     * Turns the tooltips off
     *
     * @return void
     */
    off: function() {
      this.tip([]);
    }

  };

  window.MousetipUI = MousetipUI;

})();