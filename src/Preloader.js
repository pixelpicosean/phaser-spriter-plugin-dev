var BAR_HEIGHT = 20

export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function Preloader() {
        Phaser.Scene.call(this, { key: 'Preloader' })

        this.bar
    },

    preload: function() {
        // Load assets
        this.load
            .setBaseURL('media/')
            .image('logo', 'logo.png')

            .atlas('tex', 'player.tps.png', 'player.tps.json')
            .json('player', 'player.scon')

            .atlas('rects', 'rects.png', 'rects.json')
            .json('test1', 'test1.scon')
            .json('test2', 'test2.scon')
            .json('test3', 'test3.scon')
            .json('test-bone', 'test-bone.scon')
            .json('zombie', 'zombie/zombie.scon')

        // Display loading progress
        var game_config = this.game.config
        var width = game_config.width
        this.bar = this.add.graphics({ x: game_config.width / 2 - width / 2, y: game_config.height / 2 })
        this.bar.fillStyle(0xAEAEAE, 1)
            .fillRect(0, -(BAR_HEIGHT / 2), width, BAR_HEIGHT)

        this.load.on('progress', this.update_progress_display, this)
    },

    create: function() {
        this.load.off('progress', this.update_progress_display, this)

        this.tweens.add({
            targets: this.bar,
            scaleY: 0,
            duration: 200,
            ease: 'EaseQuadOut',
            onComplete: function() {
                this.scene.switch('Title')
            },
            callbackScope: this,
        })
    },

    update_progress_display: function(pct) {
        this.bar.clear()
            .fillStyle(0x50576B, 1)
            .fillRect(0, -(BAR_HEIGHT / 2), this.game.config.width, BAR_HEIGHT)
            .fillStyle(0xFFFFFF, 1)
            .fillRect(0, -(BAR_HEIGHT / 2), Math.round(this.game.config.width * pct), BAR_HEIGHT)
    },
})
