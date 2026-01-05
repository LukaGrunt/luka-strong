'use client'

import { useEffect, useState, useCallback } from 'react'

interface FullscreenTimerProps {
  isOpen: boolean
  seconds: number
  totalSeconds: number
  exerciseName: string
  onClose: () => void
}

export default function FullscreenTimer({
  isOpen,
  seconds,
  totalSeconds,
  exerciseName,
  onClose,
}: FullscreenTimerProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  // Calculate progress for circular ring
  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0
  const circumference = 2 * Math.PI * 120 // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    if (seconds > 0) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 2000)
    } else {
      onClose()
    }
  }, [seconds, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackdropClick()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleBackdropClick])

  // Play sound and vibrate when timer completes
  useEffect(() => {
    if (isOpen && seconds === 0) {
      // Vibrate 3 times: 200ms vibrate, 100ms pause, repeat
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200])
      }

      // Optional: Play completion sound
      // const audio = new Audio('/sounds/timer-complete.mp3')
      // audio.play().catch(() => {})

      // Visual flash effect
      const timer = setTimeout(() => {
        onClose()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, seconds, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-foundation/95 backdrop-blur-xl"
        onClick={handleBackdropClick}
      />

      {/* Timer Content */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-scale-in">
        {/* Exercise Name */}
        <p className="text-muted text-lg mb-8 tracking-wide uppercase">{exerciseName}</p>

        {/* Circular Progress Ring + Countdown */}
        <div className="relative">
          {/* SVG Circle */}
          <svg className="transform -rotate-90" width="280" height="280">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="rgba(113, 113, 122, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
          </svg>

          {/* Countdown Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-bold text-textWhite transition-transform duration-1000 ${
                seconds > 0 ? 'animate-timer-pulse' : 'text-primary'
              }`}
              style={{ fontSize: '120px', lineHeight: '1' }}
            >
              {seconds}
            </span>
          </div>
        </div>

        {/* Completion message or dismiss hint */}
        <div className="mt-8 text-center">
          {seconds === 0 ? (
            <p className="text-primary text-2xl font-bold animate-scale-in">Complete!</p>
          ) : showConfirm ? (
            <p className="text-accent text-base animate-fade-in">Tap again to dismiss</p>
          ) : (
            <p className="text-muted text-sm">Tap to dismiss</p>
          )}
        </div>
      </div>

      {/* Flash effect on completion */}
      {seconds === 0 && (
        <div className="absolute inset-0 bg-primary/20 animate-fade-out pointer-events-none" />
      )}
    </div>
  )
}
