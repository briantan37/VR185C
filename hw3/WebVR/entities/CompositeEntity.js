/**
 * CompositeEntity.js used to define an Entity built out of other entities
 */
import {Entity} from "../entities/Entity.js";
/**
 */
export class CompositeEntity extends Entity
{
    /**
     */
    constructor(parent, position, scale, radius, angle, axis, mass, velocity,
        frequency, acceleration)
    {
        super(parent, position, scale, radius, angle, axis, mass, velocity,
            frequency, acceleration);
        this.update_subentities = false;
        this.render_subentities = true;
        this.initEntities();
    }
    /**
     */
    addEntity(entity)
    {
        entity.parent = this;
        if (this.gl) {
            entity.gl = this.gl;
            entity.init();
        }
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].isCollidable(entity)) {
                this.collidables.push([this.entities[i], entity]);
            }
        }
        this.entities.push(entity);
    }
    /**
     */
    init()
    {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].gl = this.gl;
            this.entities[i].init();
        }
    }
    /**
     */
    initBuffers()
    {
        return null;
    }
    initEntities()
    {
        this.collidables = [];
        this.entities = [];
    }
    initShaders()
    {
        return null;
    }
    /**
     */
    removeEntity(entity)
    {
        var old_collidables = this.collidables;
        this.collidables = [];
        var old_entities = this.entities;
        this.entities = [];
        for (var i = 0; i < old_collidables.length; i++) {
            var item = old_collidables[i];
            if (item[0] !== entity && item[1] !== entity) {
                this.collidables.push(item);
            }
        }
        for (var i = 0; i < old_entities.length; i++) {
            var item = old_entities[i];
            if (item !== entity) {
                this.entities.push(item);
            }
        }
    }
    /**
     */
    update(delta_time)
    {
        if (this.update_subentities) {
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].update(delta_time);
            }
            var entity1, entity2;
            for (var i = 0; i < this.collidables.length; i++) {
                [entity1, entity2] = this.collidables[i];
                entity1.checkAndHandleCollision(entity2);
            }
            var now = new Date().getTime();
            for (var i = 0; i < this.entities.length; i++) {
                if (typeof this.entities[i].expires_time != 'undefined'
                    && now > this.entities[i].expires_time) {
                    this.removeEntity(this.entities[i]);
                }
            }
            for (var i = 0; i < this.entities.length; i++) {
                if(typeof this.entities[i].position != 'undefined'
                    && this.entities[i].velocity != 'undefined') {
                        if (this.entities[i].position[1] <= 0 
                            && this.entities[i].velocity[1] < 0) {
                                this.removeEntity(this.entities[i]);
                            }
                    }
                }
        }
    }
    /**
     */
    render()
    {
        if (this.render_subentities) {
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].render();
            }
        }
    }
}
