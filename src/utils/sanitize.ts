import DOMPurify from 'dompurify'

/**
 * 安全消毒 HTML 字符串，防止 XSS 攻击
 *
 * - 移除 <script>、<style>、事件处理器等危险内容
 * - 保留安全的 HTML 标签和属性（适用于富文本编辑器输出）
 * - 所有使用 v-html 渲染用户内容的地方，都必须先经过此函数处理
 *
 * @param html 原始 HTML 字符串
 * @returns 消毒后的安全 HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // 允许富文本编辑器常用的标签
    ALLOWED_TAGS: [
      // 标题
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // 文本格式
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'span', 'mark',
      // 列表
      'ul', 'ol', 'li',
      // 代码
      'code', 'pre',
      // 链接和图片
      'a', 'img',
      // 引用
      'blockquote',
      // 表格
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // 其他
      'div', 'sub', 'sup', 'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'style',
      'title',
    ],
    // 允许链接以 http/https/mailto 开头
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  })
}

/**
 * 从 HTML 内容中提取纯文本（去掉所有 HTML 标签）
 * 用于在卡片预览等场景中显示内容摘要
 *
 * @param html 原始 HTML 字符串
 * @param maxLength 最大长度，超出部分截断
 * @returns 纯文本摘要
 */
export function stripHtml(html: string, maxLength: number = 120): string {
  const text = html.replace(/<[^>]*>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
