'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff } from 'lucide-react'
import { useSpeech } from '@/lib/hooks/useSpeech'
import clsx from 'clsx'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  accent?: string
  placeholder?: string
}

export default function ChatInput({
  onSend,
  disabled = false,
  accent = '#a855f7',
  placeholder = 'Send a message…',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { listening, toggle: toggleMic } = useSpeech((text) => {
    setValue(prev => prev ? `${prev} ${text}` : text)
    textareaRef.current?.focus()
  })

  const send = () => {
    const msg = value.trim()
    if (!msg || disabled) return
    onSend(msg)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div
      className="flex items-end gap-2 p-3 rounded-2xl border transition-all duration-200"
      style={{
        background: 'rgba(13,13,30,0.6)',
        borderColor: listening ? accent : 'rgba(99,102,241,0.2)',
        boxShadow: listening ? `0 0 12px ${accent}30` : undefined,
      }}
    >
      {/* Mic */}
      <button
        type="button"
        onClick={toggleMic}
        className={clsx(
          'flex-shrink-0 p-2 rounded-xl transition-all duration-200',
          listening
            ? 'text-white'
            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
        )}
        style={listening ? { background: `${accent}25`, color: accent } : undefined}
        title={listening ? 'Stop recording' : 'Voice input'}
      >
        <AnimatePresence mode="wait">
          {listening ? (
            <motion.div
              key="mic-on"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="mic-off" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
              <Mic className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Input */}
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={e => { setValue(e.target.value); autoResize() }}
        onKeyDown={onKey}
        placeholder={listening ? '🎙 Listening…' : placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 resize-none outline-none leading-relaxed py-1 min-h-[28px]"
        style={{ maxHeight: 160 }}
      />

      {/* Send */}
      <button
        type="button"
        onClick={send}
        disabled={!value.trim() || disabled}
        className="flex-shrink-0 p-2 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: value.trim() && !disabled ? `${accent}25` : undefined,
          color: value.trim() && !disabled ? accent : '#64748b',
        }}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}
