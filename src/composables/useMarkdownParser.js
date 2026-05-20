import { computed } from 'vue'
import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-java'

const renderer = new marked.Renderer()

renderer.code = function ({ text, lang }) {
  if (lang && Prism.languages[lang]) {
    const highlighted = Prism.highlight(text, Prism.languages[lang], lang)
    return `<pre><code class="language-${lang}">${highlighted}</code></pre>\n`
  }
  return `<pre><code>${text}</code></pre>\n`
}

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
})

export function useMarkdownParser(source) {
  const html = computed(() => {
    if (!source.value) return ''
    return marked.parse(source.value)
  })

  return { html }
}
