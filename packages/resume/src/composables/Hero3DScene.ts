import * as THREE from 'three'

const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export class Hero3DScene {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private raf = 0
  private clock = new THREE.Clock()
  private particles!: THREE.Points
  private floaters: THREE.Mesh[] = []
  private mouse = new THREE.Vector2(0, 0)
  private onResizeBound: () => void
  private onMouseMoveBound: (e: MouseEvent) => void

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    this.camera.position.set(0, 0, 5)

    this.onResizeBound = this._onResize.bind(this)
    this.onMouseMoveBound = this._onMouseMove.bind(this)

    this._buildParticles()
    this._buildFloaters()
    this._onResize()
    window.addEventListener('resize', this.onResizeBound, { passive: true })
    window.addEventListener('mousemove', this.onMouseMoveBound, { passive: true })
  }

  private _buildParticles() {
    const count = 1800
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      sizes[i] = 0.5 + Math.random() * 1.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      color: isDark() ? 0x2f81f7 : 0x0969da,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  private _buildFloaters() {
    const dark = isDark()
    const colorMain = dark ? 0x2f81f7 : 0x0969da
    const colorAlt  = dark ? 0x388bfd : 0x0550ae

    const shapes: Array<{ geo: THREE.BufferGeometry; wire?: boolean }> = [
      { geo: new THREE.OctahedronGeometry(0.28, 0) },
      { geo: new THREE.TetrahedronGeometry(0.22, 0) },
      { geo: new THREE.IcosahedronGeometry(0.2, 0) },
      { geo: new THREE.BoxGeometry(0.32, 0.32, 0.32), wire: true },
      { geo: new THREE.OctahedronGeometry(0.18, 0), wire: true },
      { geo: new THREE.TorusGeometry(0.18, 0.06, 8, 16) },
    ]

    const positions: [number, number, number][] = [
      [3.2, 1.4, -1], [-3, 0.6, -0.5], [2.5, -1.2, -0.8],
      [-2.2, -1.6, -1.2], [1.2, 2.0, -0.6], [-1.5, 2.2, -0.4],
    ]

    shapes.forEach(({ geo, wire }, i) => {
      const mat = wire
        ? new THREE.MeshBasicMaterial({ color: colorAlt, wireframe: true, opacity: 0.35, transparent: true })
        : new THREE.MeshPhongMaterial({ color: colorMain, emissive: colorMain, emissiveIntensity: 0.15,
            shininess: 80, transparent: true, opacity: 0.72 })
      const mesh = new THREE.Mesh(geo, mat)
      const [x, y, z] = positions[i] ?? [0, 0, 0]
      mesh.position.set(x, y, z)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      ;(mesh as any).__phase = Math.random() * Math.PI * 2
      ;(mesh as any).__speed = 0.3 + Math.random() * 0.5
      this.floaters.push(mesh)
      this.scene.add(mesh)
    })

    const ambLight = new THREE.AmbientLight(0xffffff, 0.6)
    const dirLight = new THREE.DirectionalLight(dark ? 0x2f81f7 : 0x0969da, 1.2)
    dirLight.position.set(3, 5, 3)
    this.scene.add(ambLight, dirLight)
  }

  private _onResize() {
    const parent = this.canvas.parentElement!
    const w = parent.offsetWidth
    const h = parent.offsetHeight
    this.canvas.width  = w
    this.canvas.height = h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private _onMouseMove(e: MouseEvent) {
    this.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
    this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
  }

  start() {
    this.clock.start()
    const loop = () => {
      this.raf = requestAnimationFrame(loop)
      const t = this.clock.getElapsedTime()

      // subtle camera parallax from mouse
      this.camera.position.x += (this.mouse.x * 0.4 - this.camera.position.x) * 0.04
      this.camera.position.y += (-this.mouse.y * 0.25 - this.camera.position.y) * 0.04
      this.camera.lookAt(0, 0, 0)

      // slow particle rotation
      this.particles.rotation.y = t * 0.018
      this.particles.rotation.x = t * 0.008

      // floaters orbit & spin
      this.floaters.forEach((m) => {
        const phase = (m as any).__phase as number
        const speed = (m as any).__speed as number
        m.rotation.x += 0.004 * speed
        m.rotation.y += 0.007 * speed
        m.position.y += Math.sin(t * speed + phase) * 0.0008
      })

      this.renderer.render(this.scene, this.camera)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResizeBound)
    window.removeEventListener('mousemove', this.onMouseMoveBound)
  }

  dispose() {
    this.stop()
    this.renderer.dispose()
    this.scene.clear()
  }
}
