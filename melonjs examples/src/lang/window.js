/**
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2015, Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * melonJS is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function () {

    /**
     * The built in window Object
     * @external window
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window.window|window}
     */

    /**
     * (<b>m</b>)elonJS (<b>e</b>)ngine : All melonJS functions are defined inside
     * of this namespace.
     * <p>You generally should not add new properties to this namespace as it may be
     * overwritten in future versions.</p>
     * @name me
     * @namespace
     * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT}
     * @copyright (C) 2011 - 2015, Olivier Biot, Jason Oster, Aaron McLeod
     */
    window.me = window.me || {};

    /*
     * DOM loading stuff
     */
    var readyBound = false, isReady = false, readyList = [];

    // Handle when the DOM is ready
    function domReady() {
        // Make sure that the DOM is not already loaded
        if (!isReady) {
            // be sure document.body is there
            if (!document.body) {
                return setTimeout(domReady, 13);
            }

            // clean up loading event
            if (document.removeEventListener) {
                document.removeEventListener(
                    "DOMContentLoaded",
                    domReady,
                    false
                );
            }
            else {
                window.removeEventListener("load", domReady, false);
            }

            // Remember that the DOM is ready
            isReady = true;

            // execute the defined callback
            for (var fn = 0; fn < readyList.length; fn++) {
                readyList[fn].call(window, []);
            }
            readyList.length = 0;

            /*
             * Add support for AMD (Asynchronous Module Definition) libraries
             * such as require.js.
             */
            if (typeof define === "function" && define.amd) {
                define("me", [], function () {
                    return me;
                });
            }
        }
    }

    // bind ready
    function bindReady() {
        if (readyBound) {
            return;
        }
        readyBound = true;

        // directly call domReady if document is already "ready"
        if (document.readyState === "complete") {
            return domReady();
        }
        else {
            if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", domReady, false);
            }
            // A fallback to window.onload, that will always work
            window.addEventListener("load", domReady, false);
        }
    }

    /**
     * Specify a function to execute when the DOM is fully loaded
     * @memberOf external:window#
     * @alias onReady
     * @param {Function} handler A function to execute after the DOM is ready.
     * @example
     * // small main skeleton
     * var game = {
     *    // Initialize the game
     *    // called by the window.onReady function
     *    onload : function () {
     *       // init video
     *       if (!me.video.init('screen', 640, 480, true)) {
     *          alert("Sorry but your browser does not support html 5 canvas.");
     *          return;
     *       }
     *
     *       // initialize the "audio"
     *       me.audio.init("mp3,ogg");
     *
     *       // set callback for ressources loaded event
     *       me.loader.onload = this.loaded.bind(this);
     *
     *       // set all ressources to be loaded
     *       me.loader.preload(game.resources);
     *
     *       // load everything & display a loading screen
     *       me.state.change(me.state.LOADING);
     *    },
     *
     *    // callback when everything is loaded
     *    loaded : function () {
     *       // define stuff
     *       // ....
     *
     *       // change to the menu screen
     *       me.state.change(me.state.MENU);
     *    }
     * }; // game
     *
     * // "bootstrap"
     * window.onReady(function () {
     *    game.onload();
     * });
     */
    window.onReady = function (fn) {
        // Attach the listeners
        bindReady();

        // If the DOM is already ready
        if (isReady) {
            // Execute the function immediately
            fn.call(window, []);
        }
        else {
            // Add the function to the wait list
            readyList.push(function () {
                return fn.call(window, []);
            });
        }
        return this;
    };

    // call the library init function when ready
    // (this should not be here?)
    if (me.skipAutoInit !== true) {
        window.onReady(function () {
            me.boot();
        });
    }
    else {
        me.init = function () {
            me.boot();
            domReady();
        };
    }

    if (!window.throttle) {
        /**
         * a simple throttle function
         * use same fct signature as the one in prototype
         * in case it's already defined before
         * @ignore
         */
        window.throttle = function (delay, no_trailing, callback) {
            var last = window.performance.now(), deferTimer;
            // `no_trailing` defaults to false.
            if (typeof no_trailing !== "boolean") {
                no_trailing = false;
            }
            return function () {
                var now = window.performance.now();
                var elasped = now - last;
                var args = arguments;
                if (elasped < delay) {
                    if (no_trailing === false) {
                        // hold on to it
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function () {
                            last = now;
                            return callback.apply(null, args);
                        }, elasped);
                    }
                }
                else {
                    last = now;
                    return callback.apply(null, args);
                }
            };
        };
    }

    if (typeof console === "undefined") {
        /**
         * Dummy console.log to avoid crash
         * in case the browser does not support it
         * @ignore
         */
        console = { // jshint ignore:line
            log : function () {},
            info : function () {},
            error : function () {
                alert(Array.prototype.slice.call(arguments).join(", "));
            }
        };
    }

})();
