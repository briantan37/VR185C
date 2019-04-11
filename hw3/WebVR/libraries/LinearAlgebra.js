/**
 *  Provides factory classes for 4x4 matrices, 3d vectors, and quaternions
 */
export const EPSILON = 0.000001;
/**
 */
export class Matrix4D
{
    /**
     */
    static create(m)
    {
        if (typeof m == 'undefined') {
            m = [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1];
        }
        var out = Float32Array.from(m);
        return out;
    }
    /**
     */
    static fromQuat(out, q)
    {
        var [x,y,z,w] = q;
        var [x2,y2,z2] = [x+x,y+y,z+z];
        var [xx,yx,yy,
             zx,zy,zz,
             wx,wy,wz] =
                [x*x2,y*x2,y*y2,
                 z*x2,z*y2,z*z2,
                 w*x2,w*y2,w*z2];
        [out[0],out[1],out[2],out[3],
         out[4],out[5],out[6],out[7],
         out[8],out[9],out[10],out[11],
         out[12],out[13],out[14],out[15]] =
            [1-yy-zz,yx+wz,zx-wy,0,
             yx-wz,1-xx-zz,zy+wx,0,
             zx+wy,zy-wx,1-xx-yy,0,
             0,0,0,1];
        return out;
    }
    /**
     */
    static invert(out, a)
    {
         var [a00,a01,a02,a03,
              a10,a11,a12,a13,
              a20,a21,a22,a23,
              a30,a31,a32,a33] = a;
        var [b00,b01,b02,b03,
             b04,b05,b06,b07,
             b08,b09,b10,b11] =
                [a00*a11-a01*a10,
                    a00*a12-a02*a10, a00*a13-a03*a10, a01*a12-a02*a11,
                 a01*a13-a03*a11,
                    a02*a13-a03*a12, a20*a31-a21*a30, a20*a32-a22*a30,
                 a20*a33-a23*a30,
                    a21*a32-a22*a31, a21*a33-a23*a31, a22*a33-a23*a32];
         // Calculate the determinant
         var det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
         if (!det) {
           return null;
         }
         det = 1.0 / det;
         [out[0],out[1],out[2],out[3],
          out[4],out[5],out[6],out[7],
          out[8],out[9],out[10],out[11],
          out[12],out[13],out[14],out[15]] = [
             (a11 * b11 - a12 * b10 + a13 * b09) * det,
             (a02 * b10 - a01 * b11 - a03 * b09) * det,
             (a31 * b05 - a32 * b04 + a33 * b03) * det,
             (a22 * b04 - a21 * b05 - a23 * b03) * det,
             (a12 * b08 - a10 * b11 - a13 * b07) * det,
             (a00 * b11 - a02 * b08 + a03 * b07) * det,
             (a32 * b02 - a30 * b05 - a33 * b01) * det,
             (a20 * b05 - a22 * b02 + a23 * b01) * det,
             (a10 * b10 - a11 * b08 + a13 * b06) * det,
             (a01 * b08 - a00 * b10 - a03 * b06) * det,
             (a30 * b04 - a31 * b02 + a33 * b00) * det,
             (a21 * b02 - a20 * b04 - a23 * b00) * det,
             (a11 * b07 - a10 * b09 - a12 * b06) * det,
             (a00 * b09 - a01 * b07 + a02 * b06) * det,
             (a31 * b01 - a30 * b03 - a32 * b00) * det,
             (a20 * b03 - a21 * b01 + a22 * b00) * det];
         return out;
    }
    /**
     */
    static multiplyVector4D(out, a, b)
    {
         var [a00,a01,a02,a03,
              a10,a11,a12,a13,
              a20,a21,a22,a23,
              a30,a31,a32,a33] = a;
        var [b0, b1, b2, b3] = [b[0], b[1], b[2], b[3]];
        [out[0],out[1],out[2],out[3]] =
            [b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
             b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
             b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
             b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33];
        return out;
    }
    /**
     */
    static multiply(out, a, b)
    {
         var [a00,a01,a02,a03,
              a10,a11,a12,a13,
              a20,a21,a22,a23,
              a30,a31,a32,a33] = a;
        // Cache only the current line of the second matrix
        var [b0, b1, b2, b3] = [b[0], b[1], b[2], b[3]];
        [out[0],out[1],out[2],out[3]] =
            [b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
             b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
             b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
             b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33];
        [b0, b1, b2, b3] = [b[4], b[5], b[6], b[7]];
        [out[4],out[5],out[6],out[7]] =
            [b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
             b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
             b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
             b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33];
        [b0, b1, b2, b3] = [b[8], b[9], b[10], b[11]];
        [out[8],out[9],out[10],out[11]] =
            [b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
             b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
             b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
             b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33];
        [b0, b1, b2, b3] = [b[12], b[13], b[14], b[15]];
        [out[12],out[13],out[14],out[15]] =
            [b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
             b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
             b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
             b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33];
        return out;
    }
    /**
     */
    static perspective(out, y_fov, aspect, z_near, z_far)
    {
        var f = 1.0 / Math.tan(y_fov / 2);
        var nf = 1 / (z_near - z_far);
        [out[0],out[1],out[2],out[3],
         out[4],out[5],out[6],out[7],
         out[8],out[9],out[10],out[11],
         out[12],out[13],out[14],out[15]] = [
            f/aspect,0,0,0,
            0,f,0,0,
            0,0,(z_far+z_near)*nf,-1,
            0,0,2*z_far*z_near*nf,0];
      return out;
    }
    /**
     */
    static rotate(out, a, angle, axis)
    {
        var [x,y,z] = axis;
        var len = Math.sqrt(x*x+y*y+z*z);
        if (typeof angle == 'undefined') {
            angle = 0;
        }
        var s=Math.sin(angle), c=Math.cos(angle), t=1-c;
        //don't rotate if axis too short
        if (Math.abs(len) < EPSILON) {
            return null;
        }
        // normalize rotation axis vector
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        var [a00, a01, a02, a03,
             a10, a11, a12, a13,
             a20, a21, a22, a23] =
            [a[0], a[1], a[2], a[3],
             a[4], a[5], a[6], a[7],
             a[8], a[9], a[10],a[11]];
        // Construct the elements of the rotation matrix
        var [b00, b01, b02,
             b10, b11, b12,
             b20, b21, b22] =
                [x*x*t+c, y*x*t+z*s, z*x*t-y*s,
                 x*y*t-z*s, y*y*t+c, z*y*t+x*s,
                 x*z*t+y*s, y*z*t-x*s, z*z*t+c];
        // Perform rotation-specific matrix multiplication
        [out[0], out[1], out[2], out[3],
         out[4], out[5], out[6], out[7],
         out[8], out[9], out[10],out[11]] =
            [a00*b00+a10*b01+a20*b02, a01*b00+a11*b01+a21*b02,
                a02*b00+a12*b01+a22*b02, a03*b00+a13*b01+a23*b02,
             a00*b10+a10*b11+a20*b12, a01*b10+a11*b11+a21*b12,
                a02*b10+a12*b11+a22*b12, a03*b10+a13*b11+a23*b12,
             a00*b20+a10*b21+a20*b22, a01*b20+a11*b21+a21*b22,
                a02*b20+a12*b21+a22*b22, a03*b20+a13*b21+a23*b22];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged last row
            [out[12],out[13],out[14],out[15]] = [a[12],a[13],a[14],a[15]];
        }
        return out;
    }
    /**
     */
    static scale(out, a, f)
    {
        var [x,y,z] = f;
        [out[0],out[1],out[2],out[3],
         out[4],out[5],out[6],out[7],
         out[8],out[9],out[10],out[11],
         out[12],out[13],out[14],out[15]] = [
            a[0]*x,a[1]*x,a[2]*x,a[3]*x,
            a[4]*y,a[5]*y,a[6]*y,a[7]*y,
            a[8]*z,a[9]*z,a[10]*z,a[11]*z,
            a[12],a[13],a[14],a[15]
        ];
        return out;
    }
    /**
     */
    static translate(out, a, t)
    {
        var [x,y,z] = t;
        if (a === out) {
            [out[12], out[13], out[14], out[15]] = [
                a[0]*x+a[4]*y+a[8]*z+a[12], a[1]*x+a[5]*y+a[9]*z+a[13],
                    a[2]*x+a[6]*y+a[10]*z+a[14], a[3]*x+a[7]*y+a[11]*z+a[15]];
        } else {
            var [a00, a01, a02, a03,
                 a10, a11, a12, a13,
                 a20, a21, a22, a23] =
                [a[0], a[1], a[2], a[3],
                 a[4], a[5], a[6], a[7],
                 a[8], a[9], a[10],a[11]];
            [out[0], out[1], out[2], out[3],
             out[4], out[5], out[6], out[7],
             out[8], out[9], out[10],out[11],
             out[12],out[13],out[14],out[15]] =
                [a00, a01, a02, a03,
                 a10, a11, a12, a13,
                 a20, a21, a22, a23,
                 a00*x+a10*y+a20*z+a[12], a01*x+a11*y+a21*z+a[13],
                    a02*x+a12*y+a22*z+a[14], a03*x+a13*y+a23*z+a[15]];
        }
        return out;
    }
}
/**
 */
export class Vector3D
{
    /**
     */
    static add(out, a, b)
    {
        [out[0],out[1],out[2]] = [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
        return out;
    }
    /**
     */
    static create(a)
    {
        if (typeof a == 'undefined') {
            a = [0,0,0];
        }
        var out = Float32Array.from(a);
        return out;
    }
    static cross(out, a, b)
    {
        var [ax,ay,az] = a;
        var [bx,by,bz] = b;
        [out[0], out[1], out[2]] =
            [ay*bz-az*by, az*bx-ax*bz, ax*by-ay*bx];
        return out;
    }
    static dot(a, b)
    {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }
    static length(a)
    {
        var [x,y,z] = [a[0],a[1],a[2]];
        return Math.sqrt(x*x + y*y + z*z);
    }
    static negate(out, a)
    {
        [out[0],out[1],out[2]] = [-a[0],-a[1],-a[2]];
        return out;
    }
    static normalize(out, a)
    {
        var [x,y,z] = a;
        var len = x*x + y*y + z*z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            [out[0],out[1],out[2]] = [a[0]*len, a[1]*len, a[2]*len];
        }
        return out;
    }
    static scale(out, a, b)
    {
        [out[0],out[1],out[2]] = [a[0]*b, a[1]*b, a[2]*b];
        return out;
    }
    /**
     */
    static subtract(out, a, b)
    {
        [out[0],out[1],out[2]] = [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
        return out;
    }
}

/**
 */
export class Quaternion
{
    /**
     */
    static create(a)
    {
        if (typeof a == 'undefined') {
            a = [0,0,0,1];
        }
        var out = Float32Array.from(a);
        return out;
    }
    /**
     */
    static identity(out)
    {
        var out = Float32Array.from([0,0,0,1]);
        return out;
    }
    /**
     */
    static setAxisAngle(out, axis, rad)
    {
        rad *= 0.5;
        var s = Math.sin(rad);
        [out[0],out[1],out[2],out[3]] =
            [s*axis[0], s*axis[1], s*axis[2], Math.cos(rad)];
        return out;
    }
    /**
     */
    static getAxisAngle(out_axis, q)
    {
        var rad = Math.acos(q[3]) * 2.0;
        var s = Math.sin(rad / 2.0);
        if (s != 0.0) {
            [out_axis[0],out_axis[1],out_axis[2]] =
                [q[0]/s,q[1]/s,q[2]/s];
        } else {
            // If s is zero, return any axis (no rotation)
            [out_axis[0],out_axis[1],out_axis[2]] = [1,0,0];
        }
        return rad;
    }
}
