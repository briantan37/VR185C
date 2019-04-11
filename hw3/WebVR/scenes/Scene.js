/**
 * Scene.js used to define a scene of entity with a view point
 */
import {Vector3D, Matrix4D} from "../libraries/LinearAlgebra.js";
import {PlayerEntity} from "../entities/PlayerEntity.js";
import {CompositeEntity} from "../entities/CompositeEntity.js";
/**
 */
export class Scene extends CompositeEntity
{
    /**
     */
    constructor(gl, view_entity)
    {
        if (typeof view_entity == 'undefined') {
            view_entity = new PlayerEntity(null, [0,0,5]);

            view_entity.track_orientation = 'SCENE';
        }
        super(null);
        this.gl = gl;
        this.view_entity = view_entity;
        this.initEntities();
        this.update_subentities = true;
    }
    /**
     */
    get projection()
    {
        if (typeof this._projection == 'undefined') {
            var gl = this.gl;
            this.changeProjection(45*Math.PI/180,
                gl.canvas.clientWidth/gl.canvas.clientHeight, .1, 100);
        }
        return this._projection;
    }
    /**
     */
    set projection(m)
    {
        this._projection = m;
    }
    /**
     */
    changeProjection(fov, aspect, near, far)
    {
        var projection = Matrix4D.create();
        Matrix4D.perspective(projection, fov, aspect, near, far);
        this._projection = projection;
    }
    /**
     */
    initEntities()
    {
        this.entities = [];
        this.collidables = [];
        if (typeof this.view_entity != 'undefined') {
            this.addEntity(this.view_entity);
        }
    }
    /**
     */
    viewMatrix()
    {
        var view_matrix = Matrix4D.create();
        var neg_position = Vector3D.create();
        Vector3D.negate(neg_position, this.view_entity.position);
        Matrix4D.translate(view_matrix, view_matrix,
            neg_position);
        var orientation;
        if (this.view_entity.track_orientation != 'ENTITY') {
            orientation = this.orientation;
        } else {
            orientation = this.view_entity.orientation;
        }
        Matrix4D.multiply(view_matrix, orientation,
            view_matrix);
        return view_matrix;
    }
    /**
     */
    projectionMatrix()
    {
        return this.projection;
    }

}
