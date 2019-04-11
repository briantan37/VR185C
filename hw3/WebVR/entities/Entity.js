/**
 * Entity.js
 *
 */
import {Quaternion, Vector3D, Matrix4D} from "../libraries/LinearAlgebra.js";
import {Shader} from "../libraries/Shader.js";
/**
 */
export class Entity
{
    /**
     */
    constructor(parent, position, scale, radius, angle, axis, mass, velocity,
        frequency, acceleration)
    {
        if (typeof parent == 'undefined') {
            return (void 0);
        }
        if (typeof position == 'undefined') {
            position = Vector3D.create();
        }
        if (typeof scale == 'undefined') {
            scale = Vector3D.create([1, 1, 1]);
        }
        if (typeof radius == 'undefined') {
            radius = 1;
        }
        if (typeof angle == 'undefined') {
            angle = 0;
        }
        if (typeof axis == 'undefined') {
            axis = Vector3D.create([0,0,1]);
        }
        if (typeof mass == 'undefined') {
            mass = 1;
        }
        if (typeof velocity == 'undefined') {
            velocity = Vector3D.create([0,0,0]);
        }
        if (typeof angular_velocity == 'undefined') {
            frequency = 0;
        }
        if (typeof acceleration == 'undefined') {
            acceleration = Vector3D.create([0,0,0]);
        }
        this.parent = parent;
        this.shader = null;
        this.buffers = null;
        this.position = position;
        this.scale = scale;
        this.radius = radius;
        this.angle = angle;
        this.axis = axis;
        this.velocity = velocity;
        this.frequency = frequency;
        this.acceleration = acceleration;
        this.gl = null;
        this.allow_rendering = true;
        this.track_orientation = 'NO_TRACKING';
    }
    /**
     */
    get geometry()
    {
        // Now create an array of positions for the cube.
        var positions;
        if (typeof this.positions == "undefined") {
            positions = [
                // Front face
                -1.0, -1.0,  1.0,
                 1.0, -1.0,  1.0,
                 1.0,  1.0,  1.0,
                -1.0,  1.0,  1.0,
                // Back face
                -1.0, -1.0, -1.0,
                -1.0,  1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0, -1.0, -1.0,
                // Top face
                -1.0,  1.0, -1.0,
                -1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0,
                 1.0,  1.0, -1.0,
                // Bottom face
                -1.0, -1.0, -1.0,
                 1.0, -1.0, -1.0,
                 1.0, -1.0,  1.0,
                -1.0, -1.0,  1.0,
                // Right face
                 1.0, -1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0,  1.0,  1.0,
                 1.0, -1.0,  1.0,
                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0,  1.0,
                -1.0,  1.0,  1.0,
                -1.0,  1.0, -1.0,
            ];
            this.positions = positions;
        } else {
            positions = this.positions;
        }
        /* Now set up the colors for the faces. We'll use solid colors
           for each face.
        */
        var face_colors;
        if (typeof this.face_colors == "undefined") {
            face_colors = [
                [1.0,  1.0,  1.0,  1.0],    // Front face: white
                [1.0,  0.0,  0.0,  1.0],    // Back face: red
                [0.0,  1.0,  0.0,  1.0],    // Top face: green
                [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
                [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
                [1.0,  0.0,  1.0,  1.0],    // Left face: purple
            ];
            this.face_colors = face_colors;
        } else {
            face_colors = this.face_colors;
        }
        var colors = [];
        for (var j = 0; j < face_colors.length; ++j) {
            var c = face_colors[j];
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
        }
        /* This array defines each face as two triangles, using the
           indices into the vertex array to specify each triangle's
           position.
         */
        var indices;
        if (typeof this.indices == "undefined") {
            var indices = [
                0,  1,  2,      0,  2,  3,    // front
                4,  5,  6,      4,  6,  7,    // back
                8,  9,  10,     8,  10, 11,   // top
                12, 13, 14,     12, 14, 15,   // bottom
                16, 17, 18,     16, 18, 19,   // right
                20, 21, 22,     20, 22, 23,   // left
            ];
        } else {
            indices = this.indices;
        }
        return {
            "positions" : positions,
            "colors" : colors,
            "indices" : indices
        }
    }
    /**
     */
    set position(p)
    {
        this._position = new Float32Array(3);
        [this._position[0],this._position[1],this._position[2]] =
            [p[0], p[1], p[2]];
    }
    get position()
    {
        return this._position;
    }
    set scale(s)
    {
        this._scale = Float32Array.from(
            [1,0,0,0,
             0,1,0,0,
             0,0,1,0,
             0,0,0,1]);
        [this._scale[0],this._scale[5],this._scale[10]] =
            [s[0], s[1], s[2]];
    }
    /**
     */
    get scale()
    {
        return this._scale;
    }
    /**
     */
    isCollidable(entity)
    {
        var name = entity.constructor.name;
        if (name == "PlayerEntity" || name == "GamepadEntity") {
            return true;
        } else {
            return false;
        }
    }
    /**
     */
    init()
    {
        this.shader = this.initShader();
        this.buffers = this.initBuffers();
    }
    /**
     */
    initShader()
    {
        if (!this.gl) {
            return null;
        }
        return new Shader(this.gl);
    }
    /*
      Initialize the buffers we'll need. For this demo, we just
      have one object -- a simple three-dimensional cube.
    */
    initBuffers()
    {
        if (!this.gl) {
            return null;
        }
        var gl = this.gl;
        // Create a buffer for our entity's positions.
        const position_buffer = gl.createBuffer();
        /*
           set up position buffer for points in our entity
         */
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(this.geometry.positions), gl.STATIC_DRAW);
        /* Now set up the color buffer faces.
        */
        const color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.geometry.colors),
            gl.STATIC_DRAW);
        /* Build the element array buffer; this specifies the indices
           into the vertex arrays for each face's vertices.
         */
        const index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.geometry.indices), gl.STATIC_DRAW);
        return {
            position: position_buffer,
            color: color_buffer,
            indices: index_buffer
        };
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
        Matrix4D.rotate(model_matrix, model_matrix, this.angle,
            this.axis);
        Matrix4D.multiply(model_matrix, model_matrix,
            this.scale);
        return model_matrix;
    }
    /**
     */
    set orientation(pose)
    {
        if (typeof pose == 'undefined' ||
            typeof pose.orientation == 'undefined') {
            this._orientation = Float32Array.from([0, 0, 0, 1]);
        } else if (typeof pose.orientation != 'undefined') {
            this._orientation = pose.orientation;
        } else {
            this._orientation = pose;
        }
    }
    /**
     */
    get orientation()
    {
        if (typeof this._orientation == 'undefined' ||
            !this._orientation) {
            this._orientation = Float32Array.from([0, 0, 0, 1]);
        }
        var out = Matrix4D.create();
        Matrix4D.fromQuat(out, this._orientation);
        Matrix4D.invert(out, out);
        return out;
    }
    /**
     */
    checkAndHandleCollision(entity)
    {
        if (entity.name == "PlayerEntity" || entity.name == "GamepadEntity") {
            entity.checkAndHandleCollision(this);
        }
    }
    /**
     */
    projectionMatrix()
    {
        var projection_matrix = this.parent.projectionMatrix();
        return projection_matrix;
    }
    /**
     */
    viewMatrix()
    {
        var view_matrix = this.parent.viewMatrix();
        return view_matrix;
    }
    /**
     */
    update(delta_time)
    {
        var delta_position = Vector3D.create();
        var delta_velocity = Vector3D.create();
        Vector3D.scale(delta_position, this.velocity, delta_time);
        Vector3D.add(this._position, this._position, delta_position);
        Vector3D.scale(delta_velocity, this.acceleration, delta_time);
        Vector3D.add(this.velocity, this.velocity, delta_velocity);
        this.angle += this.frequency * delta_time;
        if (this.track_orientation == 'ENTITY') {
            var q = Quaternion.create();
            Quaternion.setAxisAngle(q, this.axis, this.angle);
            this._orientation = q;
        }
    }
    /**
     */
    render()
    {
        if (!this.gl || !this.allow_rendering) {
            return;
        }
        var gl = this.gl;
        var shader = this.shader;
        var buffers = this.buffers;
        var model_matrix = this.modelMatrix();
        var view_matrix = this.viewMatrix();
        var model_view_matrix = Matrix4D.create();
        Matrix4D.multiply(model_view_matrix, view_matrix, model_matrix);
        /* Tell WebGL how to pull out the positions from the position
           buffer into the vertexPosition attribute
        */
        var num_components = 3;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(shader.attribute_locations.vertex_position,
            num_components, type, normalize, stride, offset);
        gl.enableVertexAttribArray(shader.attribute_locations.vertex_position);
        /* Tell WebGL how to pull out the colors from the color buffer
        into the vertexColor attribute.
        */
        num_components = 4;
        type = gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(shader.attribute_locations.vertex_color,
            num_components, type, normalize, stride, offset);
        gl.enableVertexAttribArray(shader.attribute_locations.vertex_color);
        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        // Tell WebGL to use our program when drawing
        gl.useProgram(shader.program);
        gl.uniformMatrix4fv(shader.uniform_locations.model_view_matrix,
            false, model_view_matrix);
        gl.uniformMatrix4fv(shader.uniform_locations.projection_matrix,
            false, this.projectionMatrix());
        var vertex_count = this.geometry.indices.length;
        type = gl.UNSIGNED_SHORT;
        offset = 0;
        gl.drawElements(gl.TRIANGLES, vertex_count, type, offset);
    }
    worldPosition()
    {
        if (!this.parent) {
            return this.position;
        }
        var pos = Vector3D.create();
        Vector3D.add(pos, this.parent.worldPosition(), this.position);
        return pos;
    }
}
