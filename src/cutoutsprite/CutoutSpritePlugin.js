import { Data, Pose } from './spriter/spriter'

var data = {}

var CutoutSprite = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function CutoutSprite(scene, x, y, model, atlas_key, entity_name) {
        Phaser.GameObjects.Container.call(this, scene, x, y)

        this.atlas = atlas_key

        this.draw_bone = false

        this.time_scale = 1

        this.anim = new Pose(model)
        this.anim.setEntity(entity_name)
    },
    play: function(anim) {
        this.anim.setAnim(anim)
        return this
    },

    set_draw_bone: function(value) {
        this.draw_bone = !!value
    },
    get_draw_bone: function() {
        return this.draw_bone
    },

    set_time_scale: function (value) {
        if (value === undefined) { value = 1 }

        this.time_scale = value

        return this
    },
    get_time_scale: function() {
        return this.time_scale;
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
        this.anim.update(delta * this.time_scale)
        this.anim.strike()

        const entity = this.anim.data.entity_map[this.anim.entity_key]
        const pos = new Phaser.Geom.Point()

        let index = 0
        for (let obj of this.anim.object_array) {
            if (obj.type === 'sprite') {
                while (this.list.length <= index) {
                    this.add(this.scene.make.image({ add: false }))
                }

                const folder = this.anim.data.folder_array[obj.folder_index]
                if (!folder) {
                    continue
                }
                const file = folder.file_array[obj.file_index]
                if (!file) {
                    continue
                }

                this.list[index]
                    .setActive(true)
                    .setVisible(true)
                    .setPosition(obj.world_space.position.x, obj.world_space.position.y)
                    .setRotation(obj.world_space.rotation.rad)
                    .setScale(obj.world_space.scale.x, obj.world_space.scale.y)
                    .setTexture(this.atlas, file.name)
                    .setOrigin(obj.pivot.x, obj.pivot.y)
                    .setAlpha(obj.alpha)

                index += 1
            }
        }

        if (this.draw_bone) {
            for (let bone of this.anim.bone_array) {
                while (this.list.length <= index) {
                    this.add(this.scene.make.image({ add: false }))
                }

                let bone_info = entity.obj_info_map[bone.name]
                if (!bone_info) {
                    bone_info = entity.obj_info_map[bone.realname]
                }
                if (!bone_info) {
                    continue
                }

                this.list[index]
                    .setActive(true)
                    .setVisible(true)
                    .setPosition(bone.world_space.position.x, bone.world_space.position.y)
                    .setRotation(bone.world_space.rotation.rad)
                    .setTexture('rects', 'red.png')
                    .setOrigin(0, 0.5)
                    .setAlpha(1.0)
                    .setDisplaySize(bone_info.w * bone.world_space.scale.x, bone_info.h * bone.world_space.scale.y)

                index += 1
            }
        }

        for (let i = index; i < this.list.length; i++) {
            this.list[i]
                .setActive(false)
                .setVisible(false)
        }
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
        if (!data[scon]) {
            data[scon] = new Data().load(validate_data(this.systems.cache.json.get(scon)))
        }

        var sprite = new CutoutSprite(this.scene, x, y, data[scon], atlas, entity)

        this.displayList.add(sprite)
        this.updateList.add(sprite)

        return sprite
    },
})

function validate_data(data) {
    if (data.is_validated) {
        return data
    }

    // Invert the `pivot_y` of each file
    data.folder.forEach(folder => {
        folder.file.forEach(file => {
            file.pivot_y = 1 - file.pivot_y
        })
    })

    // Fix timeline keys
    data.entity.forEach(entity => {
        entity.animation.forEach(animation => {
            animation.timeline.forEach(timeline => {
                timeline.key.forEach(key => {
                    if (key.hasOwnProperty('object')) {
                        var obj = key.object
                        var res = Object.assign({}, obj)

                        // Negative the angle
                        if (obj.angle !== undefined) {
                            res.angle = -obj.angle
                        }

                        // Invert y
                        if (obj.y !== undefined) {
                            res.y = -obj.y
                        }

                        // Override with our new object
                        key.object = res
                    } else if (key.hasOwnProperty('bone')) {
                        var obj = key.bone
                        var res = Object.assign({}, obj)

                        if (obj.angle !== undefined) {
                            res.angle = -obj.angle
                        }

                        // Invert y
                        if (obj.y !== undefined) {
                            res.y = -obj.y
                        }

                        // Override with our new object
                        key.bone = res
                    }
                })
            })
        })
    })

    data.is_validated = true
    return data
}
