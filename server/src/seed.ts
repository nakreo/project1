import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db from './db.js'

console.log('🌱 开始初始化数据...')

// ===== 1. 插入预设用户 =====
const defaultUsers = [
  { username: 'admin', password: 'admin123', nickname: '管理员' },
  { username: 'user', password: 'user123', nickname: '面试者' },
  { username: 'test', password: 'test123', nickname: '测试用户' },
]

const now = Date.now()
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, password, nickname, created_at) VALUES (?, ?, ?, ?)'
)

for (const u of defaultUsers) {
  const hashedPassword = bcrypt.hashSync(u.password, 10)
  const result = insertUser.run(u.username, hashedPassword, u.nickname, now)
  if (result.changes > 0) {
    console.log(`  ✅ 用户已创建: ${u.username} (${u.nickname})`)
  } else {
    console.log(`  ⏭️ 用户已存在: ${u.username}`)
  }
}

// ===== 2. 插入面试题 =====
const questions = [
  // HTML
  { id: 'html-001', category: 'html', difficulty: 'easy', title: 'HTML5 新增了哪些语义化标签？', description: '请列举并说明 HTML5 中新增的语义化标签及其作用。', answer: `HTML5 新增的主要语义化标签包括：

1. **<header>**：定义页面或区域的头部
2. **<nav>**：定义导航链接
3. **<main>**：定义文档的主要内容
4. **<article>**：定义独立的文章内容
5. **<section>**：定义文档中的节
6. **<aside>**：定义侧边栏内容
7. **<footer>**：定义页面或区域的底部
8. **<figure>** 和 **<figcaption>**：定义图片或图表及其标题

**优点**：提高代码可读性、利于 SEO、方便屏幕阅读器解析。`, tips: '重点说清楚每个标签的用途，以及语义化的好处（SEO、无障碍访问）', codeExample: null, relatedQuestions: null },
  { id: 'html-002', category: 'html', difficulty: 'medium', title: 'DOM 事件流有哪几个阶段？', description: '请描述 DOM 事件流的三个阶段，并说明事件委托的原理。', answer: `DOM 事件流分为三个阶段：

1. **捕获阶段**（Capture Phase）：事件从 window 向下传递到目标元素
2. **目标阶段**（Target Phase）：事件到达目标元素
3. **冒泡阶段**（Bubbling Phase）：事件从目标元素向上冒泡到 window

**事件委托**：利用事件冒泡，把事件监听器添加到父元素上，通过 e.target 判断实际触发元素。

**优点**：减少内存占用、动态元素无需重新绑定事件。`, tips: '面试常考，要能说出三个阶段名称和顺序，以及事件委托的实际应用场景', codeExample: `// 阻止冒泡\ne.stopPropagation()\n\n// 阻止默认行为\ne.preventDefault()`, relatedQuestions: null },
  { id: 'html-003', category: 'html', difficulty: 'hard', title: '什么是 Virtual DOM？它为什么能提升性能？', description: '解释 Virtual DOM 的原理及其性能优化机制。', answer: `Virtual DOM 是一个轻量级的 JavaScript 对象，它是真实 DOM 的抽象表示。

**工作流程**：
1. 数据变化时，生成新的 Virtual DOM 树
2. 用 Diff 算法比较新旧 Virtual DOM 树的差异
3. 将差异批量更新到真实 DOM

**性能优化原理**：
- **批量更新**：将多次 DOM 操作合并为一次
- **最小化 DOM 操作**：只更新发生变化的部分
- **减少重排重绘**：减少直接操作 DOM 带来的性能开销

> 注意：Virtual DOM 并不总是比直接操作 DOM 快，它在复杂场景下优势更明显。`, tips: '要结合 Vue/React 的渲染机制来回答，能说出 Diff 算法的核心思想', codeExample: null, relatedQuestions: JSON.stringify(['js-002']) },

  // CSS
  { id: 'css-001', category: 'css', difficulty: 'easy', title: 'CSS 盒模型是什么？如何切换盒模型？', description: '请解释标准盒模型和怪异盒模型的区别。', answer: `**盒模型**：每个 HTML 元素都是一个矩形盒子，包含：
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

\`\`\`css\n/* 切换盒模型 */\nbox-sizing: content-box;  /* 标准 */\nbox-sizing: border-box;   /* 怪异 */\n\`\`\``, tips: '基础但重要，要能说出两种模型的区别和实际开发中的选择', codeExample: null, relatedQuestions: null },
  { id: 'css-002', category: 'css', difficulty: 'medium', title: 'Flex 布局和 Grid 布局有什么区别？', description: '请对比 Flexbox 和 CSS Grid 的特点和适用场景。', answer: `**Flexbox**（一维布局）：
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
- 可结合使用，Grid 做宏观布局，Flex 做微观排列`, tips: '实际开发中两者经常结合使用，面试时最好能举例说明', codeExample: `/* Flex: 水平居中 */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n/* Grid: 网格布局 */\n.container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 20px;\n}`, relatedQuestions: null },

  // JavaScript
  { id: 'js-001', category: 'javascript', difficulty: 'medium', title: '闭包是什么？有什么实际应用？', description: '请解释闭包的概念、原理和常见应用场景。', answer: `**闭包**：一个函数可以访问其外部函数作用域中的变量，即使外部函数已经执行完毕。

**原理**：JavaScript 的作用域链机制，内部函数保存了对外部函数变量的引用。

**常见应用**：
1. **数据私有化**：封装私有变量
2. **函数柯里化**：固定部分参数
3. **防抖节流**：保留计时器引用
4. **模块模式**：实现模块化

\`\`\`js\n// 闭包示例：计数器\nfunction createCounter() {\n  let count = 0\n  return function() {\n    return ++count\n  }\n}\nconst counter = createCounter()\nconsole.log(counter()) // 1\nconsole.log(counter()) // 2\n\`\`\`

**注意**：闭包可能导致内存泄漏，不再使用时要注意释放引用。`, tips: '闭包是 JS 的核心概念，面试必考。要能说出原理和应用场景', codeExample: null, relatedQuestions: JSON.stringify(['js-003']) },
  { id: 'js-002', category: 'javascript', difficulty: 'hard', title: '请解释 Promise 和 async/await 的区别', description: '对比 Promise 链式调用和 async/await 的异同。', answer: `**Promise**：
- 通过 .then() .catch() 链式调用
- 错误处理需要在每个 .catch() 中
- 适合复杂的并行任务（Promise.all）

**async/await**（语法糖）：
- 基于 Promise，但写法更像同步代码
- try/catch 统一处理错误
- 代码更直观、易读

**注意**：async/await 会阻塞函数内后续代码执行，并行任务仍需 Promise.all。`, tips: '重点说 async/await 是语法糖、错误处理更方便、代码更可读', codeExample: `// Promise 方式\nfetchData()\n  .then(data => processData(data))\n  .then(result => console.log(result))\n  .catch(err => console.error(err))\n\n// async/await 方式\nasync function handleData() {\n  try {\n    const data = await fetchData()\n    const result = await processData(data)\n    console.log(result)\n  } catch (err) {\n    console.error(err)\n  }\n}`, relatedQuestions: null },
  { id: 'js-003', category: 'javascript', difficulty: 'medium', title: '== 和 === 有什么区别？', description: '请解释 JavaScript 中的类型转换机制。', answer: `**===**（严格相等）：不进行类型转换，类型不同直接返回 false

**==**（抽象相等）：会进行类型转换后再比较

**类型转换规则**：
1. 字符串和数字 → 字符串转数字
2. 布尔值 → 转数字（true→1, false→0）
3. null == undefined → true
4. 对象 → 调用 valueOf() 或 toString()

**建议**：始终使用 ===，避免隐式类型转换带来的问题。`, tips: '面试高频题，要记住常见的类型转换规则和结果', codeExample: `'1' == 1    // true（字符串转数字）\n'1' === 1   // false（类型不同）\nnull == undefined  // true\nfalse == 0  // true（false 转 0）\n[] == false // true（[] 转 '' 再转 0）`, relatedQuestions: null },

  // Vue
  { id: 'vue-001', category: 'vue', difficulty: 'easy', title: 'Vue 3 的 Composition API 和 Options API 有什么区别？', description: '对比两种 API 风格的特点和适用场景。', answer: `**Options API**（选项式）：
- 使用 data、methods、computed 等选项
- 适合简单组件，逻辑分散
- 学习门槛低

**Composition API**（组合式）：
- 使用 setup() 或 <script setup>
- 逻辑可以按功能组织、复用
- 适合复杂组件和大项目

**选择**：新项目推荐 Composition API，逻辑复用更方便。`, tips: 'Vue 3 面试必考题，要能说出两种风格的核心区别和使用场景', codeExample: `<!-- Options API -->\n<script>\nexport default {\n  data() { return { count: 0 } },\n  methods: { increment() { this.count++ } }\n}\n</script>\n\n<!-- Composition API -->\n<script setup lang="ts">\nconst count = ref(0)\nconst increment = () => count.value++\n</script>`, relatedQuestions: null },
  { id: 'vue-002', category: 'vue', difficulty: 'medium', title: 'Vue 的 nextTick 有什么用？', description: '解释 nextTick 的原理和使用场景。', answer: `**nextTick**：在下次 DOM 更新循环结束后执行回调。

**原理**：Vue 的 DOM 更新是异步的，数据变化后不会立即更新 DOM，而是等待下一次事件循环。

**使用场景**：
1. 数据变化后需要操作更新后的 DOM
2. 获取元素宽高等布局信息
3. 某些第三方库初始化`, tips: '理解 Vue 异步更新机制的关键，面试中常结合具体场景提问', codeExample: `// 错误：DOM 还没更新\ncount.value++\nconsole.log(el.value.textContent) // 旧值\n\n// 正确：等 DOM 更新后再取值\ncount.value++\nawait nextTick()\nconsole.log(el.value.textContent) // 新值`, relatedQuestions: null },

  // TypeScript
  { id: 'ts-001', category: 'typescript', difficulty: 'easy', title: 'interface 和 type 的区别是什么？', description: '请对比 TypeScript 中 interface 和 type 的异同。', answer: `**相同点**：
- 都可以描述对象类型
- 都可以被 implements

**不同点**：
1. **合并声明**：interface 可以同名自动合并，type 不行
2. **类型运算**：type 支持联合（|）、交叉（&）、映射等
3. **基本类型**：type 可以定义基本类型别名，interface 不行

**建议**：定义对象结构用 interface，需要类型运算用 type。`, tips: '面试高频题，要记住 interface 可合并、type 可做类型运算', codeExample: `// interface 可合并\ninterface User { name: string }\ninterface User { age: number }  // ✅ 合并为 { name, age }\n\n// type 支持联合\ntype Status = 'success' | 'error' | 'loading'`, relatedQuestions: null },

  // 算法
  { id: 'alg-001', category: 'algorithm', difficulty: 'easy', title: '如何反转一个单链表？', description: '实现一个反转单链表的函数，并分析其时间复杂度。', answer: `**迭代法**（推荐）：
- 使用三个指针 prev、curr、next
- 每次将当前节点的 next 指向前一个节点
- 时间复杂度 O(n)，空间复杂度 O(1)

**递归法**：
- 先反转后面的链表
- 将当前节点的下一个节点的 next 指向自己
- 时间复杂度 O(n)，空间复杂度 O(n)

> 面试中建议先写迭代法，再提递归法作为优化方案。`, tips: '链表题的经典入门题，要能手写出迭代法和递归法', codeExample: `// 迭代法\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev = null\n  let curr = head\n  while (curr) {\n    const next = curr.next\n    curr.next = prev\n    prev = curr\n    curr = next\n  }\n  return prev\n}`, relatedQuestions: null },
  { id: 'alg-002', category: 'algorithm', difficulty: 'medium', title: '如何判断一个字符串是否是回文？', description: '给出至少两种方法判断字符串是否为回文。', answer: `**方法一：双指针法**
- 左右指针向中间移动，比较字符是否相等
- 时间复杂度 O(n)，空间复杂度 O(1)

**方法二：反转比较法**
- 反转字符串后与原字符串比较
- 时间复杂度 O(n)，空间复杂度 O(n)

**方法三：递归法**
- 比较首尾字符，然后递归处理子串
- 时间复杂度 O(n)，空间复杂度 O(n)

> 双指针法最优，面试时优先写双指针。`, tips: '除了基本回文，还要考虑忽略空格和大小写的变体', codeExample: `// 双指针法\nfunction isPalindrome(s: string): boolean {\n  let left = 0, right = s.length - 1\n  while (left < right) {\n    if (s[left] !== s[right]) return false\n    left++\n    right--\n  }\n  return true\n}`, relatedQuestions: null },

  // 网络
  { id: 'net-001', category: 'network', difficulty: 'medium', title: 'HTTP 缓存机制有哪些？', description: '请解释强缓存和协商缓存的区别。', answer: `**强缓存**：直接从本地缓存读取，不请求服务器
- Expires（HTTP/1.0）：绝对时间
- Cache-Control（HTTP/1.1）：相对时间，优先级更高

**协商缓存**：向服务器询问资源是否过期
- Last-Modified / If-Modified-Since：最后修改时间
- ETag / If-None-Match：资源唯一标识（更精确）

**流程**：
1. 先检查强缓存 → 命中则直接使用
2. 未命中 → 发送协商缓存请求
3. 服务器返回 304 → 使用缓存；200 → 更新缓存`, tips: '性能优化重点，要能说出两种缓存的区别和具体 Header 字段', codeExample: `# 强缓存\nCache-Control: max-age=3600\n\n# 协商缓存\nETag: "abc123"\nLast-Modified: Mon, 01 Jan 2024 00:00:00 GMT`, relatedQuestions: null },
  { id: 'net-002', category: 'network', difficulty: 'hard', title: '从输入 URL 到页面渲染发生了什么？', description: '请完整描述浏览器输入 URL 后的全过程。', answer: `**完整流程**：
1. **DNS 解析**：域名 → IP 地址
2. **建立 TCP 连接**：三次握手
3. **发送 HTTP 请求**：请求页面资源
4. **服务器处理请求**：返回 HTML 响应
5. **浏览器解析 HTML**：构建 DOM 树
6. **加载外部资源**：CSS、JS、图片等
7. **构建 CSSOM 树**：解析 CSS
8. **构建渲染树**：DOM + CSSOM
9. **布局（Layout）**：计算元素位置和大小
10. **绘制（Paint）**：将像素绘制到屏幕

> 常考：在这个过程中的性能优化点（DNS 预解析、CDN、CSS 放头部、JS 放尾部等）。`, tips: '面试极高频题，要能完整说出每个步骤，能引出性能优化点', codeExample: null, relatedQuestions: JSON.stringify(['net-001']) },

  // 工程化
  { id: 'eng-001', category: 'engineering', difficulty: 'medium', title: 'Webpack 和 Vite 有什么区别？', description: '请对比两种构建工具的核心差异。', answer: `**Webpack**：
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

> Vite 已成为 Vue 官方推荐构建工具。`, tips: 'Vite 是热点，要能说出核心优势（快）和原因（ESM + esbuild）', codeExample: null, relatedQuestions: null },
]

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO questions (id, category, difficulty, title, description, answer, tips, code_example, related_questions, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

let questionCount = 0
for (const q of questions) {
  const result = insertQuestion.run(
    q.id, q.category, q.difficulty, q.title, q.description, q.answer,
    q.tips, q.codeExample, q.relatedQuestions, now
  )
  if (result.changes > 0) {
    questionCount++
  }
}

console.log(`  ✅ 面试题已插入: ${questionCount} 道`)
console.log(`  ⏭️ 已存在的题目: ${questions.length - questionCount} 道`)

console.log('')
console.log('🎉 数据初始化完成！')
console.log('')
console.log('📋 测试账号:')
console.log('  admin / admin123 (管理员)')
console.log('  user  / user123  (面试者)')
console.log('  test  / test123  (测试用户)')
console.log('')
console.log('📝 运行命令: pnpm dev')
