import * as THREE from 'three';

function createGodrayMaterial(params = {}) {
  const uniforms = {
    u_color: { value: new THREE.Color(params.color || '#ffffff') },
    u_time: { value: 0 },
    u_timeSpeed: { value: params.timeSpeed || 0.1 },
    u_noiseScale: { value: params.noiseScale || 5.0 },
    u_smoothTop: { value: params.smoothTop || 0.9 },
    u_smoothBottom: { value: params.smoothBottom || 0.1 },
    u_fresnelPower: { value: params.fresnelPower || 5.0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,

    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;

      void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);

          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;

          // posição local (para cortar o cilindro)
          vLocalPos = position;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,

    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying vec3 vLocalPos;

      uniform float u_time;
      uniform float u_timeSpeed;
      uniform float u_noiseScale;
      uniform float u_smoothTop;
      uniform float u_smoothBottom;
      uniform float u_fresnelPower;
      uniform vec3 u_color;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float worley(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float d = 1.0;

        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 g = vec2(x, y);
            vec2 o = vec2(hash(i + g), hash(i + g + 13.1));
            d = min(d, length(g + o - f));
          }
        }
        return 1.0 - d;
      }

      void main() {
        float n = worley(vNormal.xy * u_noiseScale + u_time * u_timeSpeed);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fres = pow(abs(dot(vNormal, viewDir)), u_fresnelPower);

        float y = 1.0 - vUv.y;
        float mask = smoothstep(u_smoothTop, u_smoothBottom, y);
        mask = pow(mask, 1.8);

        float ang = atan(vLocalPos.x, vLocalPos.z);
        if (abs(ang) > 1.57) discard;

        float alpha = n * fres * mask;

        gl_FragColor = vec4(u_color, alpha);
      }
    `
  });

  return material;
}

function createGodray(params) {
   const height = params.height || 10;

  const geo = new THREE.CylinderGeometry(
    params.topRadius || 3,
    params.bottomRadius || 2,
    height,
    64,
    1,
    true
  );

  const mat = createGodrayMaterial(params);

  const group = new THREE.Group();

  const mesh = new THREE.Mesh(geo, mat);


  mesh.position.y = -height / 2;

  group.add(mesh);

  if (params.position) group.position.fromArray(params.position);
  if (params.rotation) group.rotation.set(...params.rotation);

  group.osc = Math.random() * Math.PI * 2;
  group.speed = 0.5 + Math.random();
  
  group.tick = (dt) => {
      group.osc += dt * group.speed;
      const t = dt * (1 + Math.sin(group.osc) * 0.5); 
      mat.uniforms.u_time.value += t;
  };

  return group;
}

export { createGodrayMaterial, createGodray };