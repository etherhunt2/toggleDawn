'use client'

/**
 * ColorPickerField — Custom Payload CMS Admin UI component.
 * Renders a native color input alongside a hex text input.
 * Compatible with Payload v3 field component API.
 */
import React, { useCallback, useState } from 'react'
import { useField } from '@payloadcms/ui'

interface ColorPickerFieldProps {
  path: string
  label?: string
}

const PRESET_COLORS = [
  '#00f0ff', // cyan
  '#6C5CE7', // purple
  '#00ff9d', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f97316', // orange
]

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ path, label }) => {
  const { value, setValue } = useField<string>({ path })
  const [inputValue, setInputValue] = useState(value || '#00f0ff')

  const handleColorChange = useCallback(
    (hex: string) => {
      setInputValue(hex)
      setValue(hex)
    },
    [setValue],
  )

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      setInputValue(hex)
      // Only update field when it looks like a valid hex
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        setValue(hex)
      }
    },
    [setValue],
  )

  const currentColor = /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value! : '#00f0ff'

  return (
    <div className="field-type color-picker-field">
      {label && (
        <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {/* Native color picker swatch */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: currentColor,
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: `0 0 10px ${currentColor}60`,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          </div>
        </div>

        {/* Hex text input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          placeholder="#00f0ff"
          maxLength={7}
          style={{
            width: '100px',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        {/* Hex label preview */}
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: currentColor,
            textShadow: `0 0 8px ${currentColor}`,
            fontWeight: 'bold',
          }}
        >
          ● {currentColor.toUpperCase()}
        </span>
      </div>

      {/* Preset palette */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginTop: '10px',
        }}
      >
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            title={preset}
            onClick={() => handleColorChange(preset)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: preset,
              border:
                currentColor.toLowerCase() === preset.toLowerCase()
                  ? '2px solid white'
                  : '2px solid transparent',
              cursor: 'pointer',
              boxShadow:
                currentColor.toLowerCase() === preset.toLowerCase()
                  ? `0 0 8px ${preset}`
                  : 'none',
              transition: 'all 0.15s ease',
              padding: 0,
              outline: 'none',
            }}
          />
        ))}
      </div>

      <p
        style={{
          marginTop: '6px',
          fontSize: '11px',
          color: 'rgba(148,163,184,0.7)',
        }}
      >
        Pick a color or enter a hex value. This color is used for visual tagging in the HUD
        dashboard.
      </p>
    </div>
  )
}

export default ColorPickerField
