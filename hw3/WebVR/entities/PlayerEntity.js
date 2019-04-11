/**
 * PlayerEntity.js defines a player viewpoint entity
 */
import {Entity} from "../entities/Entity.js";
import {CompositeEntity} from "../entities/CompositeEntity.js";
import {GamepadEntity} from "../entities/GamepadEntity.js";
/**
 */
export class PlayerEntity extends CompositeEntity
{
    /**
     */
    checkAndHandleCollision(entity)
    {
        this.controller.checkAndHandleCollision(entity);
    }
    initEntities()
    {
        this.entities = [];
        this.collidables = [];
        this.controller = new GamepadEntity(null, [0.1, -0.3, -0.5]);
        this.addEntity(this.controller);
        this.update_subentities = true;
    }
    isCollidable(entity)
    {
        return true;
    }
}
