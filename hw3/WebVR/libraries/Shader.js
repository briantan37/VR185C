/**
 * Shader.js defines a class to encapsulate GLSL shader programs
 */
export class Shader
{
    constructor(gl, vs_source, fs_source, attribute_locations,
        uniform_locations)
    {
        if (typeof gl == 'undefined') {
            return null;
        }
        if (typeof vertex_shader == 'undefined') {
            vs_source = `
                attribute vec4 vertex_position;
                attribute vec4 vertex_color;
                uniform mat4 model_view_matrix;
                uniform mat4 projection_matrix;
                varying lowp vec4 v_color;
                void main(void) {
                    gl_Position = projection_matrix * model_view_matrix *
                        vertex_position;
                    v_color = vertex_color;
                }
            `;
            fs_source = `
                varying lowp vec4 v_color;
                void main(void) {
                    gl_FragColor = v_color;
                }
            `;
            attribute_locations = ['vertex_position', 'vertex_color'];
            uniform_locations = ['model_view_matrix', 'projection_matrix'];
        }
        this.program = Shader.initShaderProgram(gl, vs_source, fs_source);
        this.attribute_locations = {};
        for (var location in attribute_locations) {
            this.attribute_locations[attribute_locations[location]] =
                gl.getAttribLocation(this.program,
                attribute_locations[location]);
        }
        this.uniform_locations = {};
        for (var location in uniform_locations) {
            this.uniform_locations[uniform_locations[location]] =
                gl.getUniformLocation(this.program,
                uniform_locations[location]);
        }
    }
    /*
      Initialize a shader program, so WebGL knows how to draw our data
    */
    static initShaderProgram(gl, vs_source, fs_source)
    {
        const vertex_shader = Shader.loadShader(gl, gl.VERTEX_SHADER,
            vs_source);
        const fragment_shader = Shader.loadShader(gl, gl.FRAGMENT_SHADER,
            fs_source);
        // Create the shader program
        const shader_program = gl.createProgram();
        gl.attachShader(shader_program, vertex_shader);
        gl.attachShader(shader_program, fragment_shader);
        gl.linkProgram(shader_program);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
            console.log('Unable to initialize the shader program: ' +
                gl.getProgramInfoLog(shader_program));
            return null;
        }
        return shader_program;
    }
    /*
      creates a shader of the given type, uploads the source and
      compiles it.
    */
    static loadShader(gl, type, source)
    {
        const shader = gl.createShader(type);
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log('An error occurred compiling the shaders: ' +
                gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
}
