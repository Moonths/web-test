/**
 * assetPath — 静态资源（public 目录）URL 解析
 *
 * 作为 qiankun 子应用运行时，Vite dev 模式下子应用代码由浏览器原生
 * ESM 加载，window 是主应用的真实 window；qiankun 会把沙箱 proxy 挂到
 * window.proxy 上，注入的 __INJECTED_PUBLIC_PATH_BY_QIANKUN__ 只能从
 * 该 proxy 读取（与 vite-plugin-qiankun 的 qiankunWindow 逻辑一致）。
 * 若直接用主应用 window 上的变量，base 会回退为 '/'，资源请求会落到
 * portal 域名下导致 404。
 */

function getAssetBase(): string {
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, any>
    const qk = (w.proxy || w) as Record<string, any>
    if (qk.__POWERED_BY_QIANKUN__ && qk.__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
      const base = String(qk.__INJECTED_PUBLIC_PATH_BY_QIANKUN__)
      return base.endsWith('/') ? base : base + '/'
    }
  }
  return '/'
}

/** 将 'models/xxx.glb' 或 '/screens/xxx.png' 解析为可跨 qiankun 加载的完整 URL */
export function assetUrl(path: string): string {
  return getAssetBase() + path.replace(/^\/+/, '')
}
