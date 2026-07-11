// Softron Multicam Logger
// Peter Daniel, 29/10/2023
// v2.0.0 update: Bart Snakenborg, 11/07/2026

import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { MulticamApi } from './api.js'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedbacks.js'
import { updateVariables, updateVariableValues } from './variables.js'
import { updatePresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

class MulticamLogger extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
		this.updateVariableValues = updateVariableValues.bind(this)
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting, 'Waiting')
		this.config = config

		this.api = new MulticamApi(() => this.config)
		this.inputs = []
		this.logging = false
		this.status = {}
		this.pollTimer = null
		this.inputsTimer = null

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariables() // export variable definitions
		this.updatePresets() // export presets

		// get list of inputs for dropdowns, then the initial status
		await this.refreshInputs()
		await this.pollStatus()

		this.setupPolling()
	}

	async destroy() {
		this.stopPolling()
		this.log('debug', 'Destroy ' + this.id)
	}

	async configUpdated(config) {
		const resetConnection = this.config.host != config.host || this.config.port != config.port

		this.config = config

		if (resetConnection === true) {
			this.updateStatus(InstanceStatus.Connecting, 'Waiting')
			// update list of inputs for dropdowns
			await this.refreshInputs()
			await this.pollStatus()
		}

		this.setupPolling()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP / Hostname',
				width: 4,
				default: '127.0.0.1',
				required: true,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: '8888',
				regex: Regex.PORT,
				required: true,
			},
			{
				type: 'textinput',
				id: 'token',
				label: 'Access Token (optional)',
				width: 4,
				default: '',
				tooltip:
					'Only needed when API authorization is enabled in Multicam Logger. Leave empty when authorization is disabled.',
			},
			{
				type: 'checkbox',
				id: 'pollEnabled',
				label: 'Enable Polling',
				width: 4,
				default: true,
				tooltip: 'When enabled variables and feedbacks will be updated automatically',
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Polling Interval (ms)',
				width: 4,
				default: 1000,
				min: 100,
				max: 60000,
				tooltip:
					'Lower values will update variables more often and also increase the load on Companion and Multicam Logger',
			},
		]
	}

	setupPolling() {
		this.stopPolling()

		if (this.config.pollEnabled === true) {
			this.pollTimer = setInterval(() => {
				this.pollStatus()
			}, this.config.pollInterval)
			this.log('info', 'Polling enabled at ' + this.config.pollInterval + 'ms')
		} else {
			this.log('info', 'Polling disabled')
		}

		// Refresh the input list periodically, this also lets the module
		// recover automatically when Multicam Logger was not running yet
		this.inputsTimer = setInterval(() => {
			this.refreshInputs()
		}, 10000)
	}

	stopPolling() {
		if (this.pollTimer != null) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
		if (this.inputsTimer != null) {
			clearInterval(this.inputsTimer)
			this.inputsTimer = null
		}
	}

	// Send a command request, log the outcome and refresh the status
	async runCommand(name, request) {
		let body
		try {
			body = await request()
		} catch (error) {
			this.processError(error)
			return
		}
		if (body !== null && typeof body === 'object' && body.success === false) {
			this.log('warn', name + ' failed: ' + (body.error ?? 'unknown error'))
		} else {
			this.log('info', name)
		}
		await this.pollStatus()
	}

	async pollStatus() {
		let body
		try {
			body = await this.api.getStatus()
		} catch (error) {
			this.processError(error)
			return
		}
		if (body !== null && typeof body === 'object') {
			this.status = body
			this.logging = body.logging_state === true
			this.updateVariableValues()
			this.checkFeedbacks()
			this.updateStatus(InstanceStatus.Ok)
		}
	}

	async refreshInputs() {
		let body
		try {
			body = await this.api.getInputs()
		} catch (error) {
			this.processError(error)
			return
		}
		if (Array.isArray(body) && body.length > 0) {
			const inputs = body.map((label, index) => ({ id: index, label: label }))
			if (JSON.stringify(inputs) !== JSON.stringify(this.inputs)) {
				this.inputs = inputs
				this.log('info', inputs.length + ' inputs found')
				// dropdown choices, variables and presets depend on the input names
				this.updateActions()
				this.updateFeedbacks()
				this.updateVariables()
				this.updatePresets()
				this.updateVariableValues()
			}
		}
	}

	// Input choices for dropdowns, with a fallback before the list is fetched
	getInputChoices() {
		if (this.inputs.length > 0) {
			return this.inputs
		}
		return Array.from({ length: 8 }, (_, i) => ({ id: i, label: 'Input ' + (i + 1) }))
	}

	processError(error) {
		if (error.status === 401 || error.status === 403) {
			this.updateStatus(InstanceStatus.AuthenticationFailure, error.message)
			this.log('error', 'Authorization failed, check the Access Token in the module config')
		} else {
			this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
			this.log('error', 'Connection failed (' + error.message + ')')
		}
	}
}

runEntrypoint(MulticamLogger, UpgradeScripts)
