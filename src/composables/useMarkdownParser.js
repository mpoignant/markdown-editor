import { computed, ref, watchEffect } from 'vue'
import { marked } from 'marked'
import { convertFileSrc } from '@tauri-apps/api/core'

let prismReady = null

function loadPrism() {
  if (!prismReady) {
    // The Prism core MUST be loaded and evaluated before any language
    // component: each component is an IIFE that references the global `Prism`
    // at evaluation time and throws `ReferenceError: Prism is not defined`
    // otherwise. Loading core + components together in one Promise.all does not
    // guarantee that order in the browser, so we await the core first.
    prismReady = import('prismjs')
      .then((prismModule) => Promise.all([
        import('prismjs/components/prism-javascript'),
        import('prismjs/components/prism-typescript'),
        import('prismjs/components/prism-css'),
        import('prismjs/components/prism-python'),
        import('prismjs/components/prism-bash'),
        import('prismjs/components/prism-json'),
        import('prismjs/components/prism-rust'),
        import('prismjs/components/prism-java'),
        import('prismjs/components/prism-markdown'),
      ]).then(() => prismModule.default))
      .catch((err) => {
        // Reset the cache so a later render can retry, instead of poisoning
        // every subsequent file that contains a code block.
        prismReady = null
        throw err
      })
  }
  return prismReady
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

function isRelativePath(src) {
  return src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('asset://') && !src.startsWith('/')
}

function resolveImageSrc(src, fileDir) {
  if (!fileDir || !isRelativePath(src)) return src
  const absolutePath = fileDir + '/' + src
  return convertFileSrc(absolutePath)
}

export function useMarkdownParser(source, filePath) {
  const html = ref('')

  watchEffect(async () => {
    const text = source.value
    if (!text) {
      html.value = ''
      return
    }

    const currentFilePath = filePath?.value
    const fileDir = currentFilePath ? currentFilePath.replace(/[/\\][^/\\]*$/, '') : null

    const hasCodeBlock = /```\w+/.test(text)
    const renderer = new marked.Renderer()

    renderer.image = function ({ href, title, text: alt }) {
      const resolvedSrc = resolveImageSrc(href, fileDir)
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img src="${resolvedSrc}" alt="${alt || ''}"${titleAttr} />`
    }

    if (hasCodeBlock) {
      // If Prism fails to load, still render the document with plain (un-highlighted)
      // code blocks rather than leaving the whole preview blank.
      try {
        const Prism = await loadPrism()
        renderer.code = function ({ text: code, lang }) {
          if (lang && Prism.languages[lang]) {
            const highlighted = Prism.highlight(code, Prism.languages[lang], lang)
            return `<pre><code class="language-${lang}">${highlighted}</code></pre>\n`
          }
          return `<pre><code>${code}</code></pre>\n`
        }
      } catch (err) {
        console.error('Prism failed to load; rendering code blocks without highlighting.', err)
      }
    }

    html.value = marked.parse(text, { renderer })
  })

  return { html }
}
