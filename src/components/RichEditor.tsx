'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Link, Minus, Code } from 'lucide-react'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  accent?: string
}

export function RichEditor({ value, onChange, placeholder = '¿Qué quieres compartir?', minHeight = 120, accent = '#6C47FF' }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value
    }
  }, [])

  // Reset when value cleared externally
  useEffect(() => {
    if (!value && editorRef.current && editorRef.current.innerHTML) {
      editorRef.current.innerHTML = ''
    }
  }, [value])

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (!isComposing.current && editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd/Ctrl shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); exec('bold'); break
        case 'i': e.preventDefault(); exec('italic'); break
        case 'u': e.preventDefault(); exec('underline'); break
      }
    }
    // Tab for indent
    if (e.key === 'Tab') {
      e.preventDefault()
      exec('insertText', '    ')
    }
  }, [exec])

  const insertLink = useCallback(() => {
    const url = prompt('URL del enlace:')
    if (url) exec('createLink', url)
  }, [exec])

  const isEmpty = !value || value === '<br>' || value === ''

  const btnStyle = (active = false) => ({
    width: 30, height: 30,
    borderRadius: 7,
    background: active ? `${accent}15` : 'transparent',
    border: active ? `1px solid ${accent}30` : '1px solid transparent',
    color: active ? accent : 'var(--muted2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all .12s',
  } as React.CSSProperties)

  return (
    <div style={{ border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg)' }}>
      
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg1)',
        flexWrap: 'wrap',
      }}>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold') }} style={btnStyle()} title="Negrita (Ctrl+B)">
          <Bold size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic') }} style={btnStyle()} title="Cursiva (Ctrl+I)">
          <Italic size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('strikeThrough') }} style={btnStyle()} title="Tachado">
          <Minus size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'code') }} style={btnStyle()} title="Código">
          <Code size={13} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />

        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} style={btnStyle()} title="Lista">
          <List size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} style={btnStyle()} title="Lista numerada">
          <ListOrdered size={13} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />

        <button type="button" onMouseDown={e => { e.preventDefault(); insertLink() }} style={btnStyle()} title="Insertar enlace">
          <Link size={13} />
        </button>

        {/* Headings */}
        {['H2', 'H3'].map(h => (
          <button key={h} type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', h) }} style={{ ...btnStyle(), fontSize: 10, fontWeight: 700, width: 'auto', padding: '0 8px' }} title={`Título ${h}`}>
            {h}
          </button>
        ))}

        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p') }} style={{ ...btnStyle(), fontSize: 10, fontWeight: 500, width: 'auto', padding: '0 8px' }} title="Párrafo normal">
          ¶
        </button>
      </div>

      {/* Editable area */}
      <div style={{ position: 'relative' }}>
        {isEmpty && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            padding: '12px 14px',
            color: 'var(--muted)',
            fontSize: 14,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposing.current = true }}
          onCompositionEnd={() => {
            isComposing.current = false
            handleInput()
          }}
          style={{
            minHeight,
            padding: '12px 14px',
            outline: 'none',
            fontSize: 14,
            lineHeight: 1.7,
            color: 'var(--text)',
            fontFamily: 'Inter, sans-serif',
            wordBreak: 'break-word',
          }}
        />
      </div>

      {/* Rich content styles */}
      <style>{`
        [contenteditable] h2 { font-size: 18px; font-weight: 700; margin: 8px 0 4px; }
        [contenteditable] h3 { font-size: 15px; font-weight: 600; margin: 6px 0 3px; }
        [contenteditable] ul { padding-left: 20px; margin: 4px 0; }
        [contenteditable] ol { padding-left: 20px; margin: 4px 0; }
        [contenteditable] li { margin: 2px 0; }
        [contenteditable] a { color: var(--purple); text-decoration: underline; }
        [contenteditable] code { background: var(--bg2); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
        [contenteditable] s { text-decoration: line-through; }
        [contenteditable] blockquote { border-left: 3px solid var(--border2); padding-left: 12px; color: var(--muted2); margin: 6px 0; }
        [contenteditable]:focus { outline: none; }
      `}</style>
    </div>
  )
}

// Helper to strip HTML for plain text preview
export function htmlToText(html: string): string {
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '')
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
