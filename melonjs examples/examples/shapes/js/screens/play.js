game.PlayScreen = me.ScreenObject.extend({
    /** 
     *  action to perform on state change
     */
    onResetEvent: function() {  
        // clear the background
        me.game.world.addChild(new me.ColorLayer("background", "#5E3F66", 0), 0);
        
        // add a few shapes
        me.game.world.addChild(new game.Circle(250, 300, {width: 50, height: 50}), 1);
        me.game.world.addChild(new game.Poly(50, 150, {width: 200, height: 200, sprite:"hamburger"}), 1);
        me.game.world.addChild(new game.Poly(50, 350, {width: 200, height: 200, sprite:"hotdog"}), 1);
        me.game.world.addChild(new game.Poly(450, 150, {width: 200, height: 200, sprite:"icecream"}), 1);
        me.game.world.addChild(new game.Poly(450, 350, {width: 200, height: 200, sprite:"icecream2"}), 1);
        me.game.world.addChild(new game.Poly(650, 400, {width: 200, height: 200, sprite:"icecream3"}), 1);

        // register on the mousemove event
        me.input.registerPointerEvent("pointermove", me.game.viewport, function (event) {
            me.event.publish("pointermove", [ event ]);
        });
    }
});
