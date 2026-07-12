import type { Question } from '@/types'
export const mockQuestions: Question[] = [
  // ========== HTML ==========
  {
    id: 'html-001',
    category: 'html',
    difficulty: 'easy',
    title: 'HTML5 新增了哪些语义化标签？',
    description: '请列举并说明 HTML5 中新增的语义化标签及其作用。',
    answer: `HTML5 新增的主要语义化标签包括：

1. **<header>**：定义页面或区域的头部
2. **<nav>**：定义导航链接
3. **<main>**：定义文档的主要内容
4. **<article>**：定义独立的文章内容
5. **<section>**：定义文档中的节
6. **<aside>**：定义侧边栏内容
7. **<footer>**：定义页面或区域的底部
8. **<figure>** 和 **<figcaption>**：定义图片或图表及其标题

**优点**：提高代码可读性、利于 SEO、方便屏幕阅读器解析。`,
    tips: '重点说清楚每个标签的用途，以及语义化的好处（SEO、无障碍访问）',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'html-002',
    category: 'html',
    difficulty: 'medium',
    title: 'DOM 事件流有哪几个阶段？',
    description: '请描述 DOM 事件流的三个阶段，并说明事件委托的原理。',
    answer: `DOM 事件流分为三个阶段：

1. **捕获阶段**（Capture Phase）：事件从 window 向下传递到目标元素
2. **目标阶段**（Target Phase）：事件到达目标元素
3. **冒泡阶段**（Bubbling Phase）：事件从目标元素向上冒泡到 window

**事件委托**：利用事件冒泡，把事件监听器添加到父元素上，通过 e.target 判断实际触发元素。

\`\`\`js
// 事件委托示例
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('点击了 li 元素')
  }
})
\`\`\`

**优点**：减少内存占用、动态元素无需重新绑定事件。`,
    codeExample: `// 阻止冒泡
e.stopPropagation()

// 阻止默认行为
e.preventDefault()`,
    tips: '面试常考，要能说出三个阶段名称和顺序，以及事件委托的实际应用场景',
    createdAt: Date.now() - 900000,
  },
  {
    id: 'html-003',
    category: 'html',
    difficulty: 'hard',
    title: '什么是 Virtual DOM？它为什么能提升性能？',
    description: '解释 Virtual DOM 的原理及其性能优化机制。',
    answer: `Virtual DOM 是一个轻量级的 JavaScript 对象，它是真实 DOM 的抽象表示。

**工作流程**：
1. 数据变化时，生成新的 Virtual DOM 树
2. 用 Diff 算法比较新旧 Virtual DOM 树的差异
3. 将差异批量更新到真实 DOM

**性能优化原理**：
- **批量更新**：将多次 DOM 操作合并为一次
- **最小化 DOM 操作**：只更新发生变化的部分
- **减少重排重绘**：减少直接操作 DOM 带来的性能开销

> 注意：Virtual DOM 并不总是比直接操作 DOM 快，它在复杂场景下优势更明显。`,
    tips: '要结合 Vue/React 的渲染机制来回答，能说出 Diff 算法的核心思想',
    createdAt: Date.now() - 800000,
  },

  // ========== CSS ==========
  {
    id: 'css-001',
    category: 'css',
    difficulty: 'easy',
    title: 'CSS 盒模型是什么？如何切换盒模型？',
    description: '请解释标准盒模型和怪异盒模型的区别。',
    answer: `**盒模型**：每个 HTML 元素都是一个矩形盒子，包含：
- content（内容区）
- padding（内边距）
- border（边框）
- margin（外边距）

**标准盒模型**（content-box）：
- width/height = 内容区大小
- 实际占用 = width + padding + border + margin

**怪异盒模型**（border-box）：
- width/height = 内容区 + padding + border
- 更符合直觉，推荐使用

\`\`\`css
/* 切换盒模型 */
box-sizing: content-box;  /* 标准 */
box-sizing: border-box;   /* 怪异 */
\`\`\``,
    tips: '基础但重要，要能说出两种模型的区别和实际开发中的选择',
    createdAt: Date.now() - 700000,
  },
  {
    id: 'css-002',
    category: 'css',
    difficulty: 'medium',
    title: 'Flex 布局和 Grid 布局有什么区别？',
    description: '请对比 Flexbox 和 CSS Grid 的特点和适用场景。',
    answer: `**Flexbox**（一维布局）：
- 主轴和交叉轴概念
- 适合排列方向明确的列表
- 子元素大小自适应

**CSS Grid**（二维布局）：
- 行和列同时控制
- 适合复杂页面的整体布局
- 精确控制元素位置

**选择建议**：
- 列表/导航 → Flexbox
- 页面整体布局 → Grid
- 可结合使用，Grid 做宏观布局，Flex 做微观排列`,
    codeExample: `/* Flex: 水平居中 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Grid: 网格布局 */
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}`,
    tips: '实际开发中两者经常结合使用，面试时最好能举例说明',
    createdAt: Date.now() - 600000,
  },

  // ========== JavaScript ==========
  {
    id: 'js-001',
    category: 'javascript',
    difficulty: 'medium',
    title: '闭包是什么？有什么实际应用？',
    description: '请解释闭包的概念、原理和常见应用场景。',
    answer: `**闭包**：一个函数可以访问其外部函数作用域中的变量，即使外部函数已经执行完毕。

**原理**：JavaScript 的作用域链机制，内部函数保存了对外部函数变量的引用。

**常见应用**：
1. **数据私有化**：封装私有变量
2. **函数柯里化**：固定部分参数
3. **防抖节流**：保留计时器引用
4. **模块模式**：实现模块化

\`\`\`js
// 闭包示例：计数器
function createCounter() {
  let count = 0
  return function() {
    return ++count
  }
}
const counter = createCounter()
console.log(counter()) // 1
console.log(counter()) // 2
\`\`\`

**注意**：闭包可能导致内存泄漏，不再使用时要注意释放引用。`,
    tips: '闭包是 JS 的核心概念，面试必考。要能说出原理和应用场景',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'js-002',
    category: 'javascript',
    difficulty: 'hard',
    title: '请解释 Promise 和 async/await 的区别',
    description: '对比 Promise 链式调用和 async/await 的异同。',
    answer: `**Promise**：
- 通过 .then() .catch() 链式调用
- 错误处理需要在每个 .catch() 中
- 适合复杂的并行任务（Promise.all）

**async/await**（语法糖）：
- 基于 Promise，但写法更像同步代码
- try/catch 统一处理错误
- 代码更直观、易读

\`\`\`js
// Promise 方式
fetchData()
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(err => console.error(err))

// async/await 方式
async function handleData() {
  try {
    const data = await fetchData()
    const result = await processData(data)
    console.log(result)
  } catch (err) {
    console.error(err)
  }
}
\`\`\`

**注意**：async/await 会阻塞函数内后续代码执行，并行任务仍需 Promise.all。`,
    tips: '重点说 async/await 是语法糖、错误处理更方便、代码更可读',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'js-003',
    category: 'javascript',
    difficulty: 'medium',
    title: '== 和 === 有什么区别？',
    description: '请解释 JavaScript 中的类型转换机制。',
    answer: `**===**（严格相等）：不进行类型转换，类型不同直接返回 false

**==**（抽象相等）：会进行类型转换后再比较

**类型转换规则**：
1. 字符串和数字 → 字符串转数字
2. 布尔值 → 转数字（true→1, false→0）
3. null == undefined → true
4. 对象 → 调用 valueOf() 或 toString()

\`\`\`js
'1' == 1    // true（字符串转数字）
'1' === 1   // false（类型不同）
null == undefined  // true
false == 0  // true（false 转 0）
[] == false // true（[] 转 '' 再转 0）
\`\`\`

**建议**：始终使用 ===，避免隐式类型转换带来的问题。`,
    tips: '面试高频题，要记住常见的类型转换规则和结果',
    createdAt: Date.now() - 300000,
  },

  // ========== Vue ==========
  {
    id: 'vue-001',
    category: 'vue',
    difficulty: 'easy',
    title: 'Vue 3 的 Composition API 和 Options API 有什么区别？',
    description: '对比两种 API 风格的特点和适用场景。',
    answer: `**Options API**（选项式）：
- 使用 data、methods、computed 等选项
- 适合简单组件，逻辑分散
- 学习门槛低

**Composition API**（组合式）：
- 使用 setup() 或 <script setup>
- 逻辑可以按功能组织、复用
- 适合复杂组件和大项目

\`\`\`vue
<!-- Options API -->
<script>
export default {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
}
</script>

<!-- Composition API -->
<script setup lang="ts">
const count = ref(0)
const increment = () => count.value++
</script>
\`\`\`

**选择**：新项目推荐 Composition API，逻辑复用更方便。`,
    tips: 'Vue 3 面试必考题，要能说出两种风格的核心区别和使用场景',
    createdAt: Date.now() - 200000,
  },
  {
    id: 'vue-002',
    category: 'vue',
    difficulty: 'medium',
    title: 'Vue 的 nextTick 有什么用？',
    description: '解释 nextTick 的原理和使用场景。',
    answer: `**nextTick**：在下次 DOM 更新循环结束后执行回调。

**原理**：Vue 的 DOM 更新是异步的，数据变化后不会立即更新 DOM，而是等待下一次事件循环。

**使用场景**：
1. 数据变化后需要操作更新后的 DOM
2. 获取元素宽高等布局信息
3. 某些第三方库初始化

\`\`\`js
// 错误：DOM 还没更新
count.value++
console.log(el.value.textContent) // 旧值

// 正确：等 DOM 更新后再取值
count.value++
await nextTick()
console.log(el.value.textContent) // 新值
\`\`\``,
    tips: '理解 Vue 异步更新机制的关键，面试中常结合具体场景提问',
    createdAt: Date.now() - 100000,
  },

  // ========== TypeScript ==========
  {
    id: 'ts-001',
    category: 'typescript',
    difficulty: 'easy',
    title: 'interface 和 type 的区别是什么？',
    description: '请对比 TypeScript 中 interface 和 type 的异同。',
    answer: `**相同点**：
- 都可以描述对象类型
- 都可以被 implements

**不同点**：
1. **合并声明**：interface 可以同名自动合并，type 不行
2. **类型运算**：type 支持联合（|）、交叉（&）、映射等
3. **基本类型**：type 可以定义基本类型别名，interface 不行

\`\`\`ts
// interface 可合并
interface User { name: string }
interface User { age: number }  // ✅ 合并为 { name, age }

// type 支持联合
type Status = 'success' | 'error' | 'loading'
type Result<T> = { data: T } | { error: string }
\`\`\`

**建议**：定义对象结构用 interface，需要类型运算用 type。`,
    tips: '面试高频题，要记住 interface 可合并、type 可做类型运算',
    createdAt: Date.now() - 50000,
  },

  // ========== 网络 ==========
  {
    id: 'net-001',
    category: 'network',
    difficulty: 'medium',
    title: 'HTTP 缓存机制有哪些？',
    description: '请解释强缓存和协商缓存的区别。',
    answer: `**强缓存**：直接从本地缓存读取，不请求服务器
- Expires（HTTP/1.0）：绝对时间
- Cache-Control（HTTP/1.1）：相对时间，优先级更高

**协商缓存**：向服务器询问资源是否过期
- Last-Modified / If-Modified-Since：最后修改时间
- ETag / If-None-Match：资源唯一标识（更精确）

**流程**：
1. 先检查强缓存 → 命中则直接使用
2. 未命中 → 发送协商缓存请求
3. 服务器返回 304 → 使用缓存；200 → 更新缓存

\`\`\`http
# 强缓存
Cache-Control: max-age=3600

# 协商缓存
ETag: "abc123"
Last-Modified: Mon, 01 Jan 2024 00:00:00 GMT
\`\`\``,
    tips: '性能优化重点，要能说出两种缓存的区别和具体 Header 字段',
    createdAt: Date.now() - 10000,
  },

  // ========== 工程化 ==========
  {
    id: 'eng-001',
    category: 'engineering',
    difficulty: 'medium',
    title: 'Webpack 和 Vite 有什么区别？',
    description: '请对比两种构建工具的核心差异。',
    answer: `**Webpack**：
- 打包方式：分析依赖，打包成 bundle
- 开发服务器：需要整个项目打包后启动
- 热更新：需要编译整个模块
- 配置：复杂，需要大量配置

**Vite**：
- 打包方式：基于 ESM，开发时按需编译
- 开发服务器：秒级启动
- 热更新：基于 ESM，只更新修改的模块
- 配置：简洁，开箱即用

**为什么 Vite 更快**：
- 开发时使用原生 ESM，无需打包
- 使用 esbuild 预构建依赖
- 按需编译，只处理当前页面需要的模块

> Vite 已成为 Vue 官方推荐构建工具。`,
    tips: 'Vite 是热点，要能说出核心优势（快）和原因（ESM + esbuild）',
    createdAt: Date.now(),
  },
]

/** 按分类分组的面试题 */
export const questionsByCategory = mockQuestions.reduce<
  Record<string, Question[]>
>((acc, q) => {
  const category = q.category
  if (!acc[category]) acc[category] = []
  acc[category]!.push(q)
  return acc
}, {} as Record<string, Question[]>)

/** 分类显示名称 */
export const categoryLabels: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  vue: 'Vue.js',
  typescript: 'TypeScript',
  algorithm: '算法',
  network: '网络',
  engineering: '工程化',
}

/** 分类颜色 */
export const categoryColors: Record<string, string> = {
  html: '#e44d26',
  css: '#264de4',
  javascript: '#f7df1e',
  vue: '#42b883',
  typescript: '#3178c6',
  algorithm: '#6b5b95',
  network: '#2e86ab',
  engineering: '#c0392b',
}
