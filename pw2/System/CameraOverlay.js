import * as THREE from 'three'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

/**
 * CameraOverlay
 * Applies a screen-space overlay texture to the camera view.
 *
 * Note: the input texture must have a white background.
 * A multiply blend is used, where white is neutral and darker details remain visible.
 */
class CameraOverlay {
    constructor(texture, strength = 0.3, keepAspect = false) {

        this.pass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                inputTex: { value: texture },
                strength: { value: strength },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uKeepAspect: { value: keepAspect ? 1.0 : 0.0 }
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
                uniform sampler2D inputTex;
                uniform float strength;
                uniform vec2 resolution;
                uniform float uKeepAspect;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;

                    if (uKeepAspect > 0.5) {
                        float aspect = resolution.x / resolution.y;
                        uv.x = (uv.x - 0.5) * aspect + 0.5;

                        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                            gl_FragColor = texture2D(tDiffuse, vUv);
                            return;
                        }
                    }

                    vec4 baseColor = texture2D(tDiffuse, vUv);
                    vec3 Tex = 1.0 - texture2D(inputTex, uv).rgb;

                    gl_FragColor = vec4(baseColor.rgb + Tex * strength, baseColor.a);
                }
            `
        })

        this.pass.enabled = false
    }

    setStrength(v) {
        this.pass.uniforms.strength.value = v
    }

    resize(width, height) {
        this.pass.uniforms.resolution.value.set(width, height)
    }
}

export { CameraOverlay }