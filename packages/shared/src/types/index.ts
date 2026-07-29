/** resume-website 公共类型定义 */

/** 简历数据结构 */
export interface ResumeData {
  name: string
  title: string
  summary: string
  skills: Skill[]
  experiences: Experience[]
  projects: Project[]
  contact: Contact
}

export interface Skill {
  category: string
  items: SkillItem[]
}

export interface SkillItem {
  name: string
  level: number          // 0-100
  icon?: string
  description?: string
}

export interface Experience {
  company: string
  role: string
  period: string
  location?: string
  highlights: string[]
  techStack?: string[]
}

export interface Project {
  name: string
  url?: string
  description: string
  highlights: string[]
  techStack: string[]
  role?: string
}

export interface Contact {
  email: string
  github?: string
  blog?: string
  wechat?: string
  phone?: string
}

/** 主题模式 */
export type ThemeMode = 'light' | 'dark'

/** qiankun 子应用生命周期钩子 */
export interface QiankunLifeCycles {
  bootstrap: () => Promise<void>
  mount: (props: QiankunProps) => Promise<void>
  unmount: (props: QiankunProps) => Promise<void>
  update?: (props: QiankunProps) => Promise<void>
}

export interface QiankunProps {
  container?: HTMLElement
  [key: string]: unknown
}
