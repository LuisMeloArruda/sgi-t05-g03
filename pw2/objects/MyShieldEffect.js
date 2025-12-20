import * as THREE from 'three'

class MyShieldEffect extends THREE.Object3D {
  constructor(geometry, options = {}) {
    super()
    this.uniforms = {
      c: { value: options.c ?? 0.6 },
      p: { value: options.p ?? 4 },
      glowColor: { value: new THREE.Color(options.color ?? 0x00ffff) }
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          float intensity = pow(c - dot(normal, viewDir), p);
          
          gl_FragColor = vec4(glowColor, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    })

    this.mesh = new THREE.Mesh(geometry.clone(), this.material)
    this.mesh.scale.multiplyScalar(options.scale ?? 1.15)

    this.add(this.mesh)
  }

  setColor(color) {
    this.uniforms.glowColor.value.set(color)
  }

  setIntensity(c, p) {
    this.uniforms.c.value = c
    this.uniforms.p.value = p
  }
}

export { MyShieldEffect };