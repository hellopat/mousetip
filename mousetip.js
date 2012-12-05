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
 * Mousetip extends the Mousetrap library to generate keyboard shortcut
 * tooltips based on bound key combinations.
 *
 * @version 0.0.1
 * @url hellopat.github.com/mousetip
 */


/**
 * Adding indexOf functionality if it is missing
 * because of an older browser
 *
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this == null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}


(function(Mousetrap) {

  var

  /**
   * Used to turn characters required by shift modifier to their 
   * shift + character combination
   */
  _SHIFT_MAP = {
    '~': '`',
    '!': '1',
    '@': '2',
    '#': '3',
    '$': '4',
    '%': '5',
    '^': '6',
    '&': '7',
    '*': '8',
    '(': '9',
    ')': '0',
    '_': '-',
    '+': '=',
    ':': ';',
    '\"': '\'',
    '<': ',',
    '>': '.',
    '?': '/',
    '|': '\\'
  },

  /**
   * Used to map to more common aliases
   */
  _SPECIAL_ALIASES = {
    'option': 'alt',
    'command': 'meta',
    'return': 'enter',
    'escape': 'esc'
  },

  /**
   * Mapping of keys to their respective shortcuts
   */
  _shortcuts = [],

  /**
   * Holds reference to user created callback for unbinding when Mousetip
   * is turned off
   */
  _callback = null;

  /**
   * Wrapper for the callback function so the event can be passed through
   */
  _fire = null;

  /**
   * Holds currently matched shortcuts
   */
  _shortcutsMatched = [],

  /**
   * An array containing of all the keys currently being pressed
   */
  _combination = [],

  /**
   * An object containing all keys (and keyCodes) pressed in when associated
   * with the meta key, excluding modifiers
   */
  _combinationMeta = [];

  /**
   * If a combination has been completely matched, this flag will be set to true
   * to prevent additional tip events from firing
   */
  _matched = false;

  /**
   * Cross browser remove event method
   *
   * @param {Element} object
   * @param {str} type
   * @param {fnc} callback
   * @return void
   */
  _removeEvent = function(object, type, callback) {
    if (object.detachEvent) {
      object.detachEvent('on' + type, object[type + callback]);
      object[type + callback] = null;
    } else
      object.removeEventListener(type, callback, false);
  },

  /**
   * Normalizes key code to event.which
   *
   * http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
   * 
   * @param {Event} e
   * @return {Event} e
   */
  _normalizeKey = function(e) {
    if (typeof e.which !== 'number') {
      e.which = e.keyCode;
    }

    return e;
  },

  /**
   * Converts uppercase letters and numeric keys to shift + key combo
   *
   * @param {arr} keys
   * @return void
   */
  _convertUppercaseToShift = function(keys) {
    var shift = "shift";

    // Specially bound keys
    if (_SHIFT_MAP[keys[0]]) {
      keys.push(_SHIFT_MAP[keys[0]]);
      keys[0] = shift;
      return;
    }

    // Uppercase keys
    if (keys[0].toUpperCase() == keys[0]) {
      keys.push(keys[0].toLowerCase());
      keys[0] = shift;
    }
  },

  /**
   * Adds keys to the combination array as they are pressed by the user
   *
   * @param {Event} e
   * @return void
   */
  _addToCombination = function(e) {
    var index,
        key;

    // Normalize key code
    e = _normalizeKey(e);

    key = Mousetrap.characterFromEvent(e);
    index = _combination.indexOf(key);

    if (index == -1) {
      // Need to save any non-modifier keys associated with the meta key
      // because browsers don't fire off a keyup event while meta is still
      // depressed.
      if (_combination.indexOf('meta') != -1 && !Mousetrap.isModifier(key)) {
        _combinationMeta.push(key);
      }

      _combination.push(key);
    }
  },

  /**
   * Removes keys from the combination array as they are release by the user
   *
   * @param {Event} e
   * @return void
   */
  _removeFromCombination = function(e) {
    var index,
        key;

    // Normalize key code
    e = _normalizeKey(e);

    key = Mousetrap.characterFromEvent(e);
    index = _combination.indexOf(key);
    
    if (index != -1) {
      _combination.splice(index, 1);

      if (key == 'meta') {
        for (var i = 0; i < _combinationMeta.length; i++) {
          _forceRemoveFromCombination(_combinationMeta[i]);
        }
        // Reset combinationMeta
        _combinationMeta = [];
      }
    }
  },

  /**
   * Forces removal of a key from the combination when 'meta' is depressed
   *
   * @param {str} key
   * @return void
   */
  _forceRemoveFromCombination = function(key) {
    var index = _combination.indexOf(key);
    if (index != -1) {
      _combination.splice(index, 1);
    }
  },

  /**
   * Filters and returns a list of shortcuts available to display to the 
   * user based on the combination of keys they are actively pressing
   * 
   * @param {fnc} callback
   * @return void
   */
  _filterShortcuts = function(callback) {
    var i,
        matched = false,
        specialAliasIndex = -1,
        keysFoundInCombination = [];

    // Checks if the combination matches a trigger
    if (_matched == true) {
      // Once all keys have been release, we can check for a match again
      if (_combination.length == 0) {
        _matched = false;
      }
      return;
    }
    
    // Reset shortcuts matched
    _shortcutsMatched = [];

    if (_combination.length > 0) {
      // Loop through descriptions
      for (i = 0; i < _shortcuts.length; i++) {
        for (j = 0; j < _shortcuts[i].keys.length; j++) {
          key = _shortcuts[i].keys[j];
          specialAliasIndex = _combination.indexOf(_SPECIAL_ALIASES[key]);

          // Check if key exists in combination array
          if (_combination.indexOf(key) >= 0 || specialAliasIndex >= 0) {
            // Push this key onto keys found
            keysFoundInCombination.push(key);
          }

          // Compare length of combination w/ keys found in combination
          if (_combination.length == keysFoundInCombination.length) {
            // Set the relevance
            _shortcuts[i].relevance = Math.round(keysFoundInCombination.length / _shortcuts[i].keys.length * 100);
            // Set the current combination
            _shortcuts[i].combination = _combination.slice(0, _combination.length);

            // We can stop as soon as we find an exact match
            // This will prevent any new matches coming through
            if (_shortcuts[i].relevance == 100) {
              Mousetip.trigger(false);
              return;
            }

            // Convert actual key to special aliases
            if (specialAliasIndex >= 0) {
              _shortcuts[i].combination[specialAliasIndex] = key;
            }

            // Add description object to matched array
            _shortcutsMatched.push(_shortcuts[i]);
            matched = true;
          }

          // Reset keys found in combination
          if (j === _shortcuts[i].keys.length - 1 || matched === true) {
            keysFoundInCombination = [];
            matched = false;
            // Break out of current loop
            break;
          }
        }
      }
    }
  },

  /**
   * Maps a single shortcut event to it's description.
   * Store information in an object structured like:
   *
   * obj = {
   *   (arr) keys: ["ctrl", "h"],
   *   (str) shortcut: "ctrl+h",
   *   (str) unmodifiedShortcut: "ctrl+h",
   *   (str) type: "combination",
   *   (str) description: "Highlight line"
   *   (int) relevance: 50,
   *   (arr) combination: ["ctrl"]
   * }
   *
   * @param {str} shortcut
   * @param {str} description
   * @return void
   */
  _mapSingle = function(shortcut, description) {
    var i,
        type,
        keys,
        unmodifiedShortcut,
        assembleKeys = [];

    // Save an unmodified version of the shortcut
    unmodifiedShortcut = shortcut;

    // Determine if it's a sequence or a combination
    if (shortcut.indexOf(" ") >= 0) {
      type = "sequence";
      keys = shortcut.split(" ");
    } else {
      type = "combination";
      keys = shortcut.split("+");
    }

    // If a single key is bound, check if it is uppercase
    // and convert to shift + letter (can't do this for
    // combos bound to other modifiers)
    if (keys.length == 1) {
      _convertUppercaseToShift(keys)
      if (type == "combination") {
        shortcut = keys.join("+");
      } else {
        shortcut = keys.join(" ");
      }
    }

    _shortcuts.push({
      keys: keys,
      shortcut: shortcut,
      unmodifiedShortcut: unmodifiedShortcut,
      type: type,
      description: description,
      relevance: 0,
      combination: null
    });
  },

  /**
   * Handles mapping multiple shortcut combinations to their description
   *
   * @param {arr} shortcuts
   * @param {str} description
   * @return void
   */
  _mapMultiple = function(shortcuts, description) {
    for (var i = 0; i < shortcuts.length; ++i) {
      _mapSingle(shortcuts[i], description);
    }
  },

  Mousetip = {

    /**
     * On / Off flag
     */
    power: false,

    /**
     * Turn tooltips on
     *
     * @return void
     */
    on: function() {
      this.power = true;
      Mousetrap.addEvent(document, 'keydown', _addToCombination);
      Mousetrap.addEvent(document, 'keydown', _filterShortcuts);
      Mousetrap.addEvent(document, 'keyup', _removeFromCombination);
      Mousetrap.addEvent(document, 'keyup', _filterShortcuts);
      this.bindTooltip();
    },

    /**
     * Turn tooltips off
     *
     * @return void
     */
    off: function() {
      this.power = false;
      _removeEvent(document, 'keydown', _addToCombination);
      _removeEvent(document, 'keydown', _filterShortcuts);
      _removeEvent(document, 'keyup', _removeFromCombination);
      _removeEvent(document, 'keyup', _filterShortcuts);
      this.unbindTooltip();
    },

    /**
     * Toggles tooltips on / off
     *
     * @param {fnc} callback
     * @return void
     */
    toggle: function(callback) {
      if (this.power == false) {
        this.on();
      } else {
        this.off();
      }

      callback(this.power);
    },

    /**
     * Binds keys combinations to tooltips.  Passes bindings through to Mousetrap.
     * The only difference between Mousetrap's bind function and this is the additional
     * description parameter
     *
     * @param {str} shortcuts
     * @param {str} description
     * @param {fnc} callback
     * @param {str} action
     * @return void
     */
    bindKey: function(shortcuts, description, callback, action) {
      _mapMultiple(shortcuts instanceof Array ? shortcuts : [shortcuts], description);
      Mousetrap.bind(shortcuts, callback, action);
    },

    /**
     * Binds a callback function used as the visual cue for the shortcut tooltip
     *
     * @param {fnc} callback
     * @return void
     */
    bindTooltip: function(callback) {
      var self = this;

      _callback = callback || _callback;

      _fire = function(e) {
        _callback(_shortcutsMatched, e);
      };

      if (this.power) {
        Mousetrap.addEvent(document, 'keydown', _fire);
        Mousetrap.addEvent(document, 'keyup', _fire);
      }
    },

    /**
     * Removes tooltip binding
     *
     * @return void
     */
    unbindTooltip: function() {
      _removeEvent(document, 'keydown', _fire);
      _removeEvent(document, 'keyup', _fire);
      _fire = null;
    },

    /**
     * Resets matched shortcuts and combinations
     *
     * @return void
     */
    reset: function() {
      _shortcutsMatched = [];
      _combinationMeta = [];
      _combination = [];
    },

    /**
     * Emulates a shortcut that has been triggered to perform some 
     * maintenance duties
     *
     * @param {bool} reset
     * @return void
     */
    trigger: function(reset) {
      _matched = true;
      if (reset)
        this.reset();
    }

  };

  // Need to reset Mousetip every time the browser window gains or loses focus
  window.onfocus = Mousetip.reset;
  window.onblur = Mousetip.reset;

  window.Mousetip = Mousetip;

})(window.Mousetrap);