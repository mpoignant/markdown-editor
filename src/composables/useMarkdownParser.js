import { computed, ref, watchEffect } from 'vue'
import { marked } from 'marked'

let prismReady = null

function loadPrism() {
  if (!prismReady) {
    prismReady = Promise.all([
      import('prismjs'),
      import('prismjs/components/prism-javascript'),
      import('prismjs/components/prism-typescript'),
      import('prismjs/components/prism-css'),
      import('prismjs/components/prism-python'),
      import('prismjs/components/prism-bash'),
      import('prismjs/components/prism-json'),
      import('prismjs/components/prism-rust'),
      import('prismjs/components/prism-java'),
    ]).then(([prismModule]) => prismModule.default)
  }
  return prismReady
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

export function useMarkdownParser(source) {
  const html = ref('')

  watchEffect(async () => {
    const text = source.value
    if (!text) {
      html.value = ''
      return
    }

    const hasCodeBlock = /```\w+/.test(text)

    if (hasCodeBlock) {
      const Prism = await loadPrism()
      const renderer = new marked.Renderer()
      renderer.code = function ({ text: code, lang }) {
        if (lang && Prism.languages[lang]) {
          const highlighted = Prism.highlight(code, Prism.languages[lang], lang)
          return `<pre><code class="language-${lang}">${highlighted}</code></pre>\n`
        }
        return `<pre><code>${code}</code></pre>\n`
      }
      html.value = marked.parse(text, { renderer })
    } else {
      html.value = marked.parse(text)
    }
  })

  return { html }
}
