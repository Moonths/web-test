import { type Ref, ref, onUnmounted } from 'vue'

export type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function use3DScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  const state = ref<LoadState>('idle')
  let scene: import('./Hero3DScene').Hero3DScene | null = null

  async function activate() {
    if (state.value === 'loading' || state.value === 'ready') return
    const canvas = canvasRef.value
    if (!canvas) return

    state.value = 'loading'
    try {
      // Dynamic import — Three.js (~600 KB) only loads when user requests 3D
      const { Hero3DScene } = await import('./Hero3DScene')
      scene = new Hero3DScene(canvas)
      scene.start()
      state.value = 'ready'
    } catch {
      state.value = 'error'
    }
  }

  function deactivate() {
    scene?.stop()
  }

  function destroy() {
    scene?.dispose()
    scene = null
    state.value = 'idle'
  }

  onUnmounted(destroy)

  return { state, activate, deactivate, destroy }
}
