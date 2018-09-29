export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function Title() {
        Phaser.Scene.call(this, { key: 'Title' })
    },

    create: function() {
        this.cameras.main.y = -1

        this.add.cutout_sprite(100, 200, 'player', 'tex')
            .play('idle')
            .set_speed(0.1)
    },
})
