import * as THREE from "three";

class MyWaterSurface extends THREE.Object3D {
    constructor(width = 500, length = 500, segWidth = 30, segLength = 30) {
        super();
        this.width = width;
        this.length = length;
        this.segWidth = segWidth;
        this.segLength = segLength;
        this.uniforms = { time: { value: 2.0 } };
        this.material = this._initShader();
        this.timer = new THREE.Timer();
        this.timer.connect(document);
        this._build();
    }

    _build() {
        let vertices = [];
        let uvs = [];
        let colors = [];
        for (
            let x = -this.width / 2;
            x <= this.width / 2;
            x += this.width / (this.segWidth - 1)
        ) {
            for (
                let z = -this.length / 2;
                z <= this.length / 2;
                z += this.length / (this.segLength - 1)
            ) {
                vertices.push(x, 0, z);
                const u = (x - -this.width / 2) / this.width;
                const v = (z - -this.length / 2) / this.length;
                uvs.push(u, v);
                colors.push(16 / 255, 33 / 255, 42 / 255); // Background color (#10212a)
            }
        }

        let indexes = [];
        const getIndex = (l, w) => l * this.segLength + w;
        for (let l = 1; l < this.segLength; l++) {
            for (let w = 1; w < this.segWidth; w++) {
                const sup_left = getIndex(l - 1, w - 1);
                const sup_right = getIndex(l, w - 1);
                const inf_left = getIndex(l - 1, w);
                const inf_right = getIndex(l, w); // Loop point

                indexes.push(sup_right, inf_left, sup_left);
                indexes.push(sup_right, inf_right, inf_left);
            }
        }

        let geometry = new THREE.BufferGeometry()
            .setAttribute(
                "position",
                new THREE.Float32BufferAttribute(new Float32Array(vertices), 3),
            )
            .setAttribute(
                "uv",
                new THREE.BufferAttribute(new Float32Array(uvs), 2),
            )
            .setAttribute(
                "color",
                new THREE.BufferAttribute(new Float32Array(colors), 3),
            )
            .setIndex(indexes);

        geometry.computeVertexNormals();
        let mesh = new THREE.Mesh(geometry, this.material);
        this.add(mesh);
    }

    _initShader() {
        return new THREE.ShaderMaterial({
            vertexShader: `
            //
            // GLSL textureless classic 2D noise "cnoise",
            // with an RSL-style periodic variant "pnoise".
            // Author:  Stefan Gustavson (stefan.gustavson@gmail.com)
            // Version: 2024-11-07
            //
            // Many thanks to Ian McEwan of Ashima Arts for the
            // ideas for permutation and gradient selection.
            //
            // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
            // Distributed under the MIT license. See LICENSE file.
            // https://github.com/stegu/webgl-noise
            //
            
            vec4 mod289(vec4 x)
            {
              return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 permute(vec4 x)
            {
              return mod289(((x*34.0)+10.0)*x);
            }
            
            vec4 taylorInvSqrt(vec4 r)
            {
              return 1.79284291400159 - 0.85373472095314 * r;
            }
            
            vec2 fade(vec2 t) {
              return t*t*t*(t*(t*6.0-15.0)+10.0);
            }
            
            // Classic Perlin noise
            float cnoise(vec2 P)
            {
              vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
              vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
              Pi = mod289(Pi); // To avoid truncation effects in permutation
              vec4 ix = Pi.xzxz;
              vec4 iy = Pi.yyww;
              vec4 fx = Pf.xzxz;
              vec4 fy = Pf.yyww;
            
              vec4 i = permute(permute(ix) + iy);
            
              vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
              vec4 gy = abs(gx) - 0.5 ;
              vec4 tx = floor(gx + 0.5);
              gx = gx - tx;
            
              vec2 g00 = vec2(gx.x,gy.x);
              vec2 g10 = vec2(gx.y,gy.y);
              vec2 g01 = vec2(gx.z,gy.z);
              vec2 g11 = vec2(gx.w,gy.w);
            
              vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            
              float n00 = norm.x * dot(g00, vec2(fx.x, fy.x));
              float n01 = norm.y * dot(g01, vec2(fx.z, fy.z));
              float n10 = norm.z * dot(g10, vec2(fx.y, fy.y));
              float n11 = norm.w * dot(g11, vec2(fx.w, fy.w));
            
              vec2 fade_xy = fade(Pf.xy);
              vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
              float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
              return 2.3 * n_xy;
            }
            
            // Classic Perlin noise, periodic variant
            float pnoise(vec2 P, vec2 rep)
            {
              vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
              vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
              Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
              Pi = mod289(Pi);        // To avoid truncation effects in permutation
              vec4 ix = Pi.xzxz;
              vec4 iy = Pi.yyww;
              vec4 fx = Pf.xzxz;
              vec4 fy = Pf.yyww;
            
              vec4 i = permute(permute(ix) + iy);
            
              vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
              vec4 gy = abs(gx) - 0.5 ;
              vec4 tx = floor(gx + 0.5);
              gx = gx - tx;
            
              vec2 g00 = vec2(gx.x,gy.x);
              vec2 g10 = vec2(gx.y,gy.y);
              vec2 g01 = vec2(gx.z,gy.z);
              vec2 g11 = vec2(gx.w,gy.w);
            
              vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
            
              float n00 = norm.x * dot(g00, vec2(fx.x, fy.x));
              float n01 = norm.y * dot(g01, vec2(fx.z, fy.z));
              float n10 = norm.z * dot(g10, vec2(fx.y, fy.y));
              float n11 = norm.w * dot(g11, vec2(fx.w, fy.w));
            
              vec2 fade_xy = fade(Pf.xy);
              vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
              float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
              return 2.3 * n_xy;
            }
            
            float color(vec2 xy) { return cnoise(1.5*xy); }
            
            uniform float time;
            varying float n;
            void main() {
                n = color(position.xz);
                vec3 newPosition = vec3(position.x, n * 5.0, position.z);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
            `,
            fragmentShader: `
                uniform float time;
                varying float n;
                void main() {
                    float clearer = 5.0 * (0.5 + (0.5 * (-n))) * (1.0 + (0.5 * sin(time)));
                    gl_FragColor = vec4((16.0 + clearer)/255.0, (33.0 + clearer)/255.0, (42.0 + clearer * 2.0)/255.0, 1.0);
                }
            `,
            uniforms: this.uniforms,
        });
    }

    update() {
        this.timer.update();
        this.uniforms.time.value = this.timer.getElapsed();
    }
}

export { MyWaterSurface };
