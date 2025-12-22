import * as THREE from 'three'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

class TintEffect {
    constructor(
        {
            tintColor = new THREE.Vector3(1.0, 1.15, 0.85),
            strength = 1.0
        } = {}
    ) {
        this.tintColor = tintColor
        this.strength = strength
    
        this.pass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                tintColor: { value: this.tintColor.clone()},
                strength: { value: this.strength},
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
                uniform vec3 tintColor;
                uniform float strength;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    vec3 tinted = color.rgb * tintColor;
                    color.rgb = mix(color.rgb, tinted, strength);
                    gl_FragColor = color;
                }
            `,
        })

        this.pass.enabled = false
    }

    setTintColor(value) {
        this.pass.uniforms.strength.value = value
    }

    setStrength(value) {
        this.pass.uniforms.strength.value = value
    }
}

export { TintEffect };