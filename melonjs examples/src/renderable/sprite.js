/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2015, Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * A Simple object to display a sprite on screen.
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the sprite object
     * @param {Number} y the y coordinates of the sprite object
     * @param {Object} settings Contains additional parameters for the sprite
     * @param {Image|String} settings.image reference to the Sprite Image. See {@link me.loader.getImage}
     * @param {Number} [settings.framewidth=settings.image.width] Image source width.
     * @param {Number} [settings.frameheight=settings.image.height] Image source height.
     * @param {Number} [settings.rotation] Initial rotation angle in radians.
     * @param {Boolean} [settings.flipX] Initial flip for X-axis.
     * @param {Boolean} [settings.flipY] Initial flip for Y-axis.
     * @example
     * // create a static Sprite Object
     * mySprite = new me.Sprite (100, 100, {
     *     image : me.loader.getImage("mySpriteImage")
     * });
     */
    me.Sprite = me.Renderable.extend(
    /** @scope me.Sprite.prototype */
    {
        /**
         * @ignore
         */
        init : function (x, y, settings) {

            /**
             * private/internal scale factor
             * @ignore
             */
            this._scale = new me.Vector2d(1, 1);

            // if true, image flipping/scaling is needed
            this.scaleFlag = false;

            // just to keep track of when we flip
            this.lastflipX = false;
            this.lastflipY = false;

            this.flipX(!!settings.flipX);
            this.flipY(!!settings.flipY);

            // current frame texture offset
            /**
             * The position to draw from on the source image.
             * @public
             * @type me.Vector2d
             * @name offset
             * @memberOf me.Vector2d
             */
            this.offset = new me.Vector2d(0, 0);

            /**
             * Set the angle (in Radians) of a sprite to rotate it <br>
             * WARNING: rotating sprites decreases performance with Canvas Renderer
             * @public
             * @type Number
             * @default 0
             * @name me.Sprite#angle
             */
            this.angle = settings.rotation || 0;

            /**
             * Source rotation angle for pre-rotating the source image<br>
             * Commonly used for TexturePacker
             * @ignore
             */
            this._sourceAngle = 0;

            // to manage the flickering effect
            this.flickering = false;
            this.flickerDuration = 0;
            this.flickercb = null;
            this.flickerState = false;

            // Used by the game engine to adjust visibility as the
            // sprite moves in and out of the viewport
            this.isSprite = true;

            var image = me.utils.getImage(settings.image);

            // call the super constructor
            this._super(me.Renderable, "init", [
                x, y,
                settings.framewidth  || image.width,
                settings.frameheight || image.height
            ]);

            // cache image reference
            this.image = image;
        },

        /**
         * return the flickering state of the object
         * @name isFlickering
         * @memberOf me.Sprite
         * @function
         * @return {Boolean}
         */
        isFlickering : function () {
            return this.flickering;
        },

        /**
         * make the object flicker
         * @name flicker
         * @memberOf me.Sprite
         * @function
         * @param {Number} duration expressed in milliseconds
         * @param {Function} callback Function to call when flickering ends
         * @example
         * // make the object flicker for 1 second
         * // and then remove it
         * this.flicker(1000, function () {
         *     me.game.world.removeChild(this);
         * });
         */
        flicker : function (duration, callback) {
            this.flickerDuration = duration;
            if (this.flickerDuration <= 0) {
                this.flickering = false;
                this.flickercb = null;
            }
            else if (!this.flickering) {
                this.flickercb = callback;
                this.flickering = true;
            }
        },

        /**
         * Flip object on horizontal axis
         * @name flipX
         * @memberOf me.Sprite
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipX : function (flip) {
            if (flip !== this.lastflipX) {
                this.lastflipX = flip;

                // invert the scale.x value
                this._scale.x = -this._scale.x;

                // set the scaleFlag
                this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;
            }
        },

        /**
         * Flip object on vertical axis
         * @name flipY
         * @memberOf me.Sprite
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipY : function (flip) {
            if (flip !== this.lastflipY) {
                this.lastflipY = flip;

                // invert the scale.x value
                this._scale.y = -this._scale.y;

                // set the scaleFlag
                this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;
            }
        },

        /**
         * scale the sprite around his center<br>
         * @name scale
         * @memberOf me.Sprite
         * @function
         * @param {Number} ratioX x scaling ratio
         * @param {Number} ratioY y scaling ratio
         */
        scale : function (ratioX, ratioY) {
            var x = ratioX;
            var y = typeof(ratioY) === "undefined" ? ratioX : ratioY;
            if (x > 0) {
                this._scale.x = this._scale.x < 0.0 ? -x : x;
            }
            if (y > 0) {
                this._scale.y = this._scale.y < 0.0 ? -y : y;
            }
            // set the scaleFlag
            this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;

        },

        /**
         * scale the sprite around his center<br>
         * @name scaleV
         * @memberOf me.Sprite
         * @function
         * @param {me.Vector2d} vector ratio
         */
        scaleV : function (ratio) {
            this.scale(ratio.x, ratio.y);
        },

        /**
         * sprite update<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name update
         * @memberOf me.Sprite
         * @function
         * @protected
         * @return false
         **/
        update : function (dt) {
            //update the "flickering" state if necessary
            if (this.flickering) {
                this.flickerDuration -= dt;
                if (this.flickerDuration < 0) {
                    if (this.flickercb) {
                        this.flickercb();
                    }
                    this.flicker(-1);
                }
                return true;
            }
            return false;
        },

        /**
         * object draw<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name draw
         * @memberOf me.Sprite
         * @function
         * @protected
         * @param {me.CanvasRenderer|me.WebGLRenderer} a renderer object
         **/
        draw : function (renderer) {
            // do nothing if we are flickering
            if (this.flickering) {
                this.flickerState = !this.flickerState;
                if (!this.flickerState) {
                    return;
                }
            }
            // save global alpha
            var alpha = renderer.globalAlpha();
            // sprite alpha value
            renderer.setGlobalAlpha(alpha * this.getOpacity());

            // clamp position vector to pixel grid
            var xpos = ~~this.pos.x, ypos = ~~this.pos.y;

            var w = this.width, h = this.height;
            var angle = this.angle + this._sourceAngle;

            if ((this.scaleFlag) || (angle !== 0)) {
                // save context
                renderer.save();

                // calculate pixel pos of the anchor point
                var ax = w * this.anchorPoint.x, ay = h * this.anchorPoint.y;
                // translate to the defined anchor point
                renderer.translate(xpos + ax, ypos + ay);
                // scale
                if (this.scaleFlag) {
                    renderer.scale(this._scale.x, this._scale.y);
                }
                if (angle !== 0) {
                    renderer.rotate(angle);
                }

                if (this._sourceAngle !== 0) {
                    // swap w and h for rotated source images
                    w = this.height;
                    h = this.width;

                    xpos = -ay;
                    ypos = -ax;
                }
                else {
                    // reset coordinates back to upper left coordinates
                    xpos = -ax;
                    ypos = -ay;
                }
            }

            renderer.drawImage(
                this.image,
                this.offset.x, this.offset.y,   // sx,sy
                w, h,                           // sw,sh
                xpos, ypos,                     // dx,dy
                w, h                            // dw,dh
            );

            if ((this.scaleFlag) || (angle !== 0)) {
                // restore context
                renderer.restore();
            }
            // restore global alpha
            renderer.setGlobalAlpha(alpha);
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            this.onDestroyEvent.apply(this, arguments);
        },

        /**
         * OnDestroy Notification function<br>
         * Called by engine before deleting the object
         * @name onDestroyEvent
         * @memberOf me.Sprite
         * @function
         */
        onDestroyEvent : function () {
            // to be extended !
        }
    });

})();
