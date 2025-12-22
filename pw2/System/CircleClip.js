import * as THREE from 'three'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

class CircleClip {
    constructor(radius = 0.45) {
        this.pass = new ShaderPass({
            uniforms: {
                tDiffuse: {value: null},
                radius: {value: radius},
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },

            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,

            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float radius;
                uniform vec2 resolution;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    float aspect = resolution.x / resolution.y;
                    uv.x = (uv.x - 0.5) * aspect + 0.5;
                    
                    float dist = distance(uv, vec2(0.5));

                    if (dist > radius) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                        return;
                    }
                    gl_FragColor = texture2D(tDiffuse, vUv);
                }
            `,
        })

        this.pass.enabled = false;
    }

    setRadius(r) {
        this.pass.uniforms.radius.value = r
    }

    resize(width, height) {
        this.pass.uniforms.resolution.value.set(width, height)
    }
}

export { CircleClip };