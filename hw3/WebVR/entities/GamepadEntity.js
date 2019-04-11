/**
 * GamepadEntity.js defines an entiy for a game controller in the scene
 */
import {Quaternion, Vector3D, Matrix4D} from "../libraries/LinearAlgebra.js";
import {Entity} from "../entities/Entity.js";
import {CompositeEntity} from "../entities/CompositeEntity.js";
/**
 * Encapsulates a game controller in our VR experience
 */
export class GamepadEntity extends CompositeEntity
{
    /**
     * Check for a collision of the laser from the Gamepad and
     * an Entity in the scene
     */
    checkAndHandleCollision(entity)
    {
        if (this.laser.face_colors != this.red_face_colors) {
            return;
        }
        var c = entity.worldPosition();
        var r = entity.radius;
        var o = this.worldPosition();
        var oMinusC = Vector3D.create();
        Vector3D.subtract(oMinusC,o,c);
        var normSquareOMinusC = Vector3D.dot(oMinusC, oMinusC);
        var normal = Float32Array.from([0,0,1,1]);
        Matrix4D.multiplyVector4D(normal, this.orientation, normal);
        var n = Vector3D.create();
        [n[0], n[1], n[2]] = [normal[0], normal[1], normal[3]];
        Vector3D.normalize(n,n);
        //left-right handed coordinate system madness
        n[2] = -n[2];
        console.log("n=" + n);
        var nDotOMinusC = Vector3D.dot(n, oMinusC);
        /* formula from
           https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
         */
        if (nDotOMinusC*nDotOMinusC < (normSquareOMinusC - r*r)) {
            // no intersection
            return;
        }
        entity.face_colors = this.red_face_colors;
        entity.expires_time = (new Date().getTime()) + 1000;
        entity.init();
    }
    /*
     */
    initEntities()
    {
        var gamepads = navigator.getGamepads();
        this.white_face_colors = [
                [1.0,  1.0,  1.0,  1.0],
                [1.0,  1.0,  1.0,  0.0],
                [1.0,  1.0,  1.0,  0.0],
                [1.0,  1.0,  1.0,  0.0],
                [1.0,  1.0,  1.0,  0.0],
                [1.0,  1.0,  1.0,  0.0],
            ];
        this.red_face_colors = [
                [1.0,  0.0,  0.0,  1.0],
                [1.0,  0.0,  0.0,  0.0],
                [1.0,  0.0,  0.0,  0.0],
                [1.0,  0.0,  0.0,  0.0],
                [1.0,  0.0,  0.0,  0.0],
                [1.0,  0.0,  0.0,  0.0],
            ];
        this.entities = [];
        this.collidables = [];
        var controller = new Entity(null, [0, 0, 0.04], [.04, .04, .08]);
        controller.face_colors = this.white_face_colors;
        this.addEntity(controller);
        this.laser = new Entity(null, [0, 0, -10], [.01, .01, 10]);
        this.addEntity(this.laser);
        this.laser.face_colors = this.white_face_colors;
        this.toggle_time = -1;
    }
    /**
     */
    modelMatrix()
    {
        var model_matrix;
        if (typeof this.parent == 'undefined' || !this.parent) {
            model_matrix = Matrix4D.create();
        } else {
            model_matrix = this.parent.modelMatrix();
        }
        Matrix4D.translate(model_matrix, model_matrix,
            this.position);
        var gamepads = navigator.getGamepads();
        if (gamepads == {} || !gamepads[0] || !gamepads[0].connected ||
            !gamepads[0].pose.hasOrientation) {
            Matrix4D.rotate(model_matrix, model_matrix, this.angle,
                this.axis);
        } else {
            this.orientation = gamepads[0].pose;
            var orientation = Matrix4D.create();
            Matrix4D.invert(orientation, this.orientation);
            Matrix4D.multiply(model_matrix, model_matrix, orientation);
        }
        Matrix4D.multiply(model_matrix, model_matrix,
            this.scale);
        return model_matrix;
    }
    /**
     */
    update(delta_time)
    {
        var gamepads = navigator.getGamepads();
        var now = new Date().getTime();
        if (gamepads != {} && gamepads[0] && gamepads[0].connected) {
            var toggle = false;
            if(this.laser.face_colors == this.white_face_colors) {
                if (gamepads[0].buttons[1].pressed) {
                    this.laser.face_colors = this.red_face_colors;
                    toggle = true;
                    this.toggle_time = now;
                }
            } else {
                if (this.toggle_time > 0 && (now - this.toggle_time) > 250) {
                    this.laser.face_colors = this.white_face_colors;
                    toggle = true;
                    this.toggle_time = -1;
                }
            }
            if (toggle) {
                this.laser.buffers = this.laser.initBuffers();
            }
        }
    }
}
