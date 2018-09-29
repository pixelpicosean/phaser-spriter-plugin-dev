import Signal from 'mini-signals'

import { Entity, Animation, Obj } from './model'
import { FrameData, frame_data_calculator } from './FrameData'
import { SpriteProvider, object_provider } from './provider'

export default class Animator {
    /**
     * @param {Entity} entity
     * @param {CutoutSprite} parent
     */
    constructor(entity, parent) {
        /**
         * @type {Entity}
         */
        this.entity = entity

        /**
         * @type {CutoutSprite}
         */
        this.parent = parent

        /**
         * @type {Animation}
         */
        this.current_animation = null

        /**
         * @type {Animation}
         */
        this.next_animation = null

        /**
         * @type {number}
         */
        this.speed = 1

        /**
         * @type {number}
         */
        this.length = 0

        /**
         * @type {number}
         */
        this.time = 0

        this.sprite_provider = new SpriteProvider()

        /**
         * @type {FrameData}
         */
        this.frame_data = null

        /**
         * @type {Object}
         */
        this.animations = entity.get_animations()

        this._total_transition_time = 0
        this._transition_time = 0
        this._factor = 0
    }

    /**
     * @returns {number}
     */
    get_progress() {
        return this.time / this.length
    }
    /**
     * @param {number} value
     */
    set_progress(value) {
        this.time = value * this.length
    }

    /**
     * @returns {Array<string>}
     */
    get_animations() {
        return Object.keys(this.animations)
    }

    set_speed(value) {
        this.speed = value
        return this.parent
    }

    /**
     * Play the animation
     * @param {string} key
     * @param {bool} [ignore_if_playing=false]
     */
    play(key, ignore_if_playing) {
        if (ignore_if_playing === undefined) { ignore_if_playing = false }

        if (ignore_if_playing && this.current_animation.name === key) {
            return this.parent
        }

        this.current_animation = this.animations[key]

        this.next_animation = null
        this.length = this.current_animation.length

        this.parent.emit('animationstart', this.name)

        return this.parent
    }

    /**
     * Transition to give animation doing a progressive blend
     * @param {string} name
     * @param {number} total_transition_time
     */
    transition(name, total_transition_time) {
        this._total_transition_time = total_transition_time * 1000
        this._transition_time = 0
        this._factor = 0
        this.next_animation = this.animations[name]
    }

    /**
     * Blend two animations with the given weight factor.
     * Factor ranges from 0.0f - 1.0f
     * @param {string} first
     * @param {string} second
     * @param {number} factor
     */
    blend(first, second, factor) {
        this.play(first)
        this.next_animation = this.animations[second]
        this._total_transition_time = 0
        this._factor = factor
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        if (!this.current_animation) {
            this.play(this.get_animations()[0])
        }

        let initial_time = this.time
        let elapsed = delta * this.speed

        if (this.next_animation && this._total_transition_time > 0) {
            elapsed += elapsed * this._factor * this.current_animation.length / this.next_animation.length

            this._transition_time += Math.abs(elapsed)
            this._factor = this._transition_time / this._total_transition_time
            if (this._transition_time >= this._total_transition_time) {
                let progress = this.get_progress()
                this.play(this.next_animation.name)
                this.set_progress(progress)
                this.next_animation = null
            }
        }

        this.time += elapsed

        if (this.time < 0) {
            if (this.current_animation.looping) {
                this.time += this.length
            }
            else {
                this.time = 0
            }
            if (this.time !== initial_time) {
                this.parent.emit('animationcomplete', this.name)
            }
        }
        else if (this.time >= this.length) {
            if (this.current_animation.looping) {
                this.time -= this.length
            }
            else {
                this.time = this.length
            }
            if (this.time !== initial_time) {
                this.parent.emit('animationcomplete', this.name)
            }
        }

        this.animate(elapsed)
    }

    /**
     * Apply transform to sprites
     * @param {number} delta
     */
    animate(delta) {
        /**
         * @type {FrameData}
         */
        let frame = null
        if (!this.next_animation) {
            frame = frame_data_calculator.get_frame_data(this.current_animation, this.time, delta)
        }
        else {
            frame = frame_data_calculator.get_frame_data_with_blend(this.current_animation, this.next_animation, this.time, delta, this._factor)
        }

        /**
         * @type {Array<Obj>}
         */
        let objs = frame.sprite_data

        if (this.parent.list.length < objs.length) {
            let len = objs.length - this.parent.list.length
            for (let i = 0; i < len; i++) {
                this.parent.add(object_provider.get_sprite(this.parent.scene))
            }
        }
        else if (this.parent.list.length > objs.length) {
            for (let i = objs.length - 1; i < this.parent.list.length; i++) {
                this.parent.list[i]
                    .setActive(false)
                    .setVisible(false)
            }
        }

        for (let i = 0; i < objs.length; i++) {
            let obj = objs[i]
            let info = this.sprite_provider.get(obj.folder, obj.file)

            this.parent.list[i]
                .setActive(true)
                .setVisible(true)
                .setPosition(obj.x, obj.y)
                .setTexture(this.parent.atlas, info.texture)
                .setOrigin(obj.pivot_x + info.pivot_x, obj.pivot_y + info.pivot_y)
                .setAngle(obj.angle)
                .setScale(obj.scale_x, obj.scale_y)
                .setAlpha(obj.a)
        }
    }
}
