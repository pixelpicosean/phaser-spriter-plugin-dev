export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function Title() {
        Phaser.Scene.call(this, { key: 'Title' })
    },

    create: function() {
        this.cameras.main.y = -1

        const x = 200,
            y = 300

        this.add.image(x, y, 'rects', 'red.png')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(800, 1)
        this.add.image(x, y, 'rects', 'red.png')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(1, 600)

        this.add.cutout_sprite(x - 130, y, 'player', 'tex', 'Player')
            .play('walk')
            .set_time_scale(0.5)
            .set_draw_bone(true)

        this.add.cutout_sprite(x, y - 10, 'test-bone', 'rects', 'entity_000')
            .play('rotate')
            .setScale(0.5)
            .set_draw_bone(true)

        this.add.cutout_sprite(x + 130, y, 'zombie', 'rects', 'zombie_1')
            .play('walk')
            .set_draw_bone(true)
    },
})
