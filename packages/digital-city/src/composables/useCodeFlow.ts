/**
 * useCodeFlow — 黑客帝国风格墙面代码瀑布流 + 天花板随机折线光影
 *
 * 墙面：ShaderMaterial，头字符高亮 + 指数衰减尾迹
 * 天花板：ShaderMaterial，36 条随机折线缓慢游走 + 呼吸式明暗
 */

import * as THREE from 'three'

export interface CodeFlowResult {
  materials: {
    back: THREE.ShaderMaterial
    front: THREE.ShaderMaterial
    left: THREE.ShaderMaterial
    right: THREE.ShaderMaterial
  }
  update: (elapsed: number) => void
  dispose: () => void
}

export interface CeilingFlowResult {
  update: (elapsed: number) => void
  dispose: () => void
}

// ==============================
//  墙面代码雨
// ==============================

const WALL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const WALL_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uHeadColor;
  uniform vec3 uTrailColor;
  uniform float uOpacity;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    vec3 bg = vec3(0.010, 0.010, 0.028);

    float columns  = 72.0;
    float col      = floor(vUv.x * columns);
    float cx       = fract(vUv.x * columns);

    float h  = hash(col * 73.721);
    float h2 = hash(col * 89.123 + 67.89);
    float h3 = hash(col * 54.321 + 98.76);

    float speed       = 0.4  + h  * 1.4;
    float phase       = h2 * 200.0;
    float charSpacing = 0.030 + h3 * 0.025;
    float charHeight  = 0.016 + h  * 0.014;
    float charWidth   = 0.40  + h2 * 0.40;
    float trailDecay  = 0.055 + h  * 0.145;
    float maxTrail    = 15.0  + h3 * 22.0;

    float headY = fract(phase - uTime * speed);

    float halfW = charWidth * 0.5;
    float inCol = 1.0 - step(halfW, abs(cx - 0.5));

    float relY = vUv.y - headY;
    if (relY < 0.0) relY += 1.0;

    float code = 0.0;
    float trailSpan = maxTrail * charSpacing;

    if (relY < trailSpan) {
      float trailIdx  = floor(relY / charSpacing);
      float charLocal = fract(relY / charSpacing);
      float charH     = charHeight / charSpacing;

      float inChar = step(0.0, charLocal) * (1.0 - step(charH, charLocal));
      float bright = exp(-trailIdx * trailDecay);

      float headBoost = 0.0;
      if (trailIdx < 1.0) {
        headBoost = (1.0 - trailIdx) * 0.55;
      }

      float ch = hash(trailIdx * 17.3 + col * 41.9);
      float brightJitter = 0.65 + ch * 0.35;

      code = inCol * inChar * (bright * brightJitter + headBoost);

      if (trailIdx < 2.0) {
        float glowAlpha = inCol * (1.0 - trailIdx * 0.5);
        float glowDist  = abs(charLocal - charH * 0.5) / (charH * 0.5);
        float glow      = exp(-glowDist * 2.5) * 0.25;
        code += glowAlpha * glow;
      }
    }

    float flash = 0.0;
    float flashPhase = fract(uTime * 0.027 + h * 13.0);
    if (flashPhase < 0.012) {
      flash = inCol * (1.0 - flashPhase / 0.012) * 0.18;
    }

    float edgeFadeX = smoothstep(0.0, 0.05, vUv.x)
                    * (1.0 - smoothstep(0.95, 1.0, vUv.x));
    float edgeFadeY = smoothstep(0.0, 0.06, vUv.y)
                    * (1.0 - smoothstep(0.88, 1.0, vUv.y));
    float edgeFade = edgeFadeX * edgeFadeY;

    float finalCode = (code + flash) * edgeFade * uOpacity;
    vec3 litColor = mix(uTrailColor, uHeadColor, smoothstep(0.0, 0.35, code));
    vec3 result   = bg + litColor * finalCode;

    gl_FragColor = vec4(result, 1.0);
  }
`

function createWallFlowShader(headColor: string, trailColor: string, opacity: number): THREE.ShaderMaterial {
  const hc = new THREE.Color(headColor)
  const tc = new THREE.Color(trailColor)
  return new THREE.ShaderMaterial({
    vertexShader: WALL_VERT,
    fragmentShader: WALL_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uHeadColor:  { value: new THREE.Vector3(hc.r, hc.g, hc.b) },
      uTrailColor: { value: new THREE.Vector3(tc.r, tc.g, tc.b) },
      uOpacity:    { value: opacity },
    },
    depthWrite: true,
    depthTest:  true,
  })
}

// ==============================
//  天花板随机折线
// ==============================

const CEILING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const CEILING_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  // 点到线段的（平方）距离
  float lineDist2(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return dot(pa - ba * h, pa - ba * h);
  }

  void main() {
    vec3 bg = vec3(0.015, 0.015, 0.035);
    float glow = 0.0;

    for (int i = 0; i < 36; i++) {
      float fi = float(i);
      float h0 = hash(fi * 17.31 + 0.1);
      float h1 = hash(fi * 31.73 + 0.5);
      float h2 = hash(fi * 43.19 + 0.9);
      float h3 = hash(fi * 59.37 + 0.3);
      float h4 = hash(fi * 71.93 + 0.7);

      // 折线段由 3 个控制点组成：A → B → C
      vec2 a0 = vec2(h0, h1);
      vec2 b0 = vec2(h2, h3);
      vec2 c0 = vec2(h4, hash(fi * 83.57));

      // 缓慢游走
      float osc  = 0.06 + h1 * 0.14;
      float t    = uTime * osc;
      vec2  a    = a0 + 0.04 * vec2(sin(t + fi * 1.3),        cos(t * 0.7 + fi));
      vec2  b    = b0 + 0.04 * vec2(cos(t * 0.8 + fi * 1.7),  sin(t * 1.1 + fi * 0.9));
      vec2  c    = c0 + 0.04 * vec2(sin(t * 0.6 + fi * 2.1),  cos(t * 1.3 + fi * 0.5));

      // 两段距离（取较近的那段）
      float d2_ab = lineDist2(vUv, a, b);
      float d2_bc = lineDist2(vUv, b, c);
      float d2    = min(d2_ab, d2_bc);

      // 呼吸式明暗
      float life  = sin(uTime * 0.025 + fi * 1.5) * 0.5 + 0.5;
      float life2 = sin(uTime * 0.031 + fi * 2.3) * 0.5 + 0.5;
      life = mix(life, life2, 0.3);

      // 高斯辉光
      float sigma  = 0.0012 + h4 * 0.003;
      float seg    = exp(-d2 / (sigma * sigma));
      seg *= life;

      float bright = 0.25 + h0 * 0.75;
      glow += seg * bright;
    }

    // 边缘渐隐
    float edgeFadeX = smoothstep(0.0, 0.06, vUv.x)
                    * (1.0 - smoothstep(0.94, 1.0, vUv.x));
    float edgeFadeY = smoothstep(0.0, 0.06, vUv.y)
                    * (1.0 - smoothstep(0.94, 1.0, vUv.y));
    glow *= edgeFadeX * edgeFadeY * uOpacity;

    // 靛蓝色调 + 微弱暖色偏置
    vec3 lineCol = vec3(0.45, 0.52, 0.88);
    vec3 result  = bg + lineCol * glow;

    gl_FragColor = vec4(result, 1.0);
  }
`

function createCeilingShader(opacity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: CEILING_VERT,
    fragmentShader: CEILING_FRAG,
    uniforms: {
      uTime:    { value: 0 },
      uOpacity: { value: opacity },
    },
    depthWrite: true,
    depthTest:  true,
  })
}

// ==============================
//  导出
// ==============================

export function useCodeFlow(
  backWall:  THREE.Mesh | null,
  frontWall: THREE.Mesh | null,
  leftWall:  THREE.Mesh | null,
  rightWall: THREE.Mesh | null,
): CodeFlowResult {
  const backMat  = createWallFlowShader('#D6E0FF', '#4F5EC0', 0.60)
  const frontMat = createWallFlowShader('#C5D0F0', '#3B4A9E', 0.38)
  const leftMat  = createWallFlowShader('#CCD8F8', '#4658B8', 0.52)
  const rightMat = createWallFlowShader('#CCD8F8', '#4658B8', 0.52)

  if (backWall)  backWall.material  = backMat
  if (frontWall) frontWall.material = frontMat
  if (leftWall)  leftWall.material  = leftMat
  if (rightWall) rightWall.material = rightMat

  function update(elapsed: number) {
    backMat.uniforms.uTime.value  = elapsed
    frontMat.uniforms.uTime.value = elapsed
    leftMat.uniforms.uTime.value  = elapsed
    rightMat.uniforms.uTime.value = elapsed
  }

  function dispose() {
    backMat.dispose()
    frontMat.dispose()
    leftMat.dispose()
    rightMat.dispose()
  }

  return { materials: { back: backMat, front: frontMat, left: leftMat, right: rightMat }, update, dispose }
}

export function useCeilingFlow(ceiling: THREE.Mesh | null): CeilingFlowResult {
  const mat = createCeilingShader(0.55)
  if (ceiling) ceiling.material = mat

  function update(elapsed: number) {
    mat.uniforms.uTime.value = elapsed
  }

  function dispose() {
    mat.dispose()
  }

  return { update, dispose }
}
