import { combineRgb } from '@companion-module/base'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const RED = combineRgb(240, 0, 0)
const GREEN = combineRgb(0, 240, 0)
const YELLOW = combineRgb(255, 200, 0)
const DARK = combineRgb(40, 40, 40)

export function updatePresets() {
	let presets = {}

	// Logging
	presets['logging_toggle'] = {
		type: 'button',
		category: 'Logging',
		name: 'Toggle logging',
		style: { text: 'LOG\n$(MulticamLogger:timecode)', size: '14', color: WHITE, bgcolor: DARK },
		steps: [{ down: [{ actionId: 'toggle_logging', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'loggingState', options: {}, style: { bgcolor: GREEN, color: BLACK } }],
	}
	presets['logging_start'] = {
		type: 'button',
		category: 'Logging',
		name: 'Start logging',
		style: { text: 'START', size: '18', color: WHITE, bgcolor: DARK },
		steps: [{ down: [{ actionId: 'start_logging', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'loggingState', options: {}, style: { bgcolor: GREEN, color: BLACK } }],
	}
	presets['logging_stop'] = {
		type: 'button',
		category: 'Logging',
		name: 'Stop logging',
		style: { text: 'STOP', size: '18', color: WHITE, bgcolor: DARK },
		steps: [{ down: [{ actionId: 'stop_logging', options: {} }], up: [] }],
		feedbacks: [],
	}

	// Markers
	presets['marker_quick'] = {
		type: 'button',
		category: 'Markers',
		name: 'Add marker (live)',
		style: { text: 'MARK', size: '18', color: BLACK, bgcolor: YELLOW },
		steps: [
			{
				down: [
					{
						actionId: 'add_marker',
						options: { markerText: 'Marker', reference: 'live', offset: '0', time: '' },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	for (const [id, name, offset] of [
		['marker_highlight', 'Highlight', '0'],
		['marker_replay', 'Replay -10s', '-10'],
	]) {
		presets[id] = {
			type: 'button',
			category: 'Markers',
			name: 'Add "' + name + '" marker',
			style: { text: name.toUpperCase().replace(' ', '\n'), size: '14', color: BLACK, bgcolor: YELLOW },
			steps: [
				{
					down: [
						{
							actionId: 'add_marker',
							options: { markerText: name, reference: 'live', offset: offset, time: '' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	// Angles
	presets['take'] = {
		type: 'button',
		category: 'Angles',
		name: 'Take',
		style: { text: 'TAKE', size: '18', color: WHITE, bgcolor: combineRgb(120, 0, 0) },
		steps: [{ down: [{ actionId: 'change_angle', options: {} }], up: [] }],
		feedbacks: [],
	}

	for (const input of this.getInputChoices()) {
		presets['program_' + input.id] = {
			type: 'button',
			category: 'Angles: Program',
			name: 'Program: ' + input.label,
			style: { text: 'PGM\n' + input.label, size: '14', color: WHITE, bgcolor: DARK },
			steps: [{ down: [{ actionId: 'set_program', options: { angle: input.id } }], up: [] }],
			feedbacks: [{ feedbackId: 'program', options: { angle: input.id }, style: { bgcolor: RED, color: BLACK } }],
		}
		presets['preview_' + input.id] = {
			type: 'button',
			category: 'Angles: Preview',
			name: 'Preview: ' + input.label,
			style: { text: 'PVW\n' + input.label, size: '14', color: WHITE, bgcolor: DARK },
			steps: [{ down: [{ actionId: 'set_preview', options: { angle: input.id } }], up: [] }],
			feedbacks: [{ feedbackId: 'preview', options: { angle: input.id }, style: { bgcolor: GREEN, color: BLACK } }],
		}
	}

	// Status
	presets['status_timecode'] = {
		type: 'button',
		category: 'Status',
		name: 'Timecode display',
		style: { text: '$(MulticamLogger:timecode)', size: '14', color: WHITE, bgcolor: BLACK },
		steps: [],
		feedbacks: [],
	}
	presets['status_document'] = {
		type: 'button',
		category: 'Status',
		name: 'Document name display',
		style: { text: '$(MulticamLogger:document_name)', size: '14', color: WHITE, bgcolor: BLACK },
		steps: [],
		feedbacks: [],
	}

	this.setPresetDefinitions(presets)
}
