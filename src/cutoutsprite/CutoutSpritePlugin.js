import Animator from './spriter/Animator'
import { Model } from './spriter/model'

var data = {}

var CutoutSprite = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function CutoutSprite(scene, x, y, model, atlas_key, entity_name) {
        Phaser.GameObjects.Container.call(this, scene, x, y)

        this.atlas = atlas_key

        this.anim = new Animator(model.entity[entity_name], this)
        this.anim.sprite_provider.load(model.folder)
    },
    play: function(anim) {
        return this.anim.play(anim)
    },
    set_speed: function(value) {
        return this.anim.set_speed(value)
    },
    transition: function(new_anim, transition_time) {
        this.anim.transition(new_anim, transition_time)
        return this
    },
    blend: function(first_anim, second_anim, factor) {
        this.anim.blend(first_anim, second_anim, factor)
        return this
    },

    preUpdate: function(time, delta) {
        this.anim.update(delta)
    },

    destroy: function(from_scene) {
        this.anim = null

        // TODO: recycle child sprites

        GameObjects.prototype.destroy.call(this, from_scene)
    },
})

export default new Phaser.Class({
    Extends: Phaser.Plugins.BasePlugin,
    initialize:
    function CutoutSpritePlugin(plugin_manager) {
        Phaser.Plugins.BasePlugin.call(this, plugin_manager)

        plugin_manager.registerGameObject('cutout_sprite', this.create_cutout_sprite)
    },

    create_cutout_sprite: function(x, y, scon, atlas, entity) {
        if (entity === undefined) { entity = 0 }

        if (!data[scon]) {
            data[scon] = new Model(this.systems.cache.json.get(scon))
        }

        var sprite = new CutoutSprite(this.scene, x, y, data[scon], atlas, entity)

        this.displayList.add(sprite)
        this.updateList.add(sprite)

        return sprite
    },
})
