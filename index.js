// Softron Multicam Logger
// Peter Daniel, 29/10/2023

import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedbacks.js'
import { updateVariables } from './variables.js'
import got, { Options } from 'got'

class MulticamLogger extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		// this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	async init(config) {
		console.log('init multicam logger')
		this.updateStatus(InstanceStatus.Connecting, 'Waiting')
		this.config = config

		this.gotOptions = new Options({
			prefixUrl: 'http://' + this.config.host + ':' + this.config.port,
			responseType: 'json',
			throwHttpErrors: false,
		})

		this.inputs = []
		this.logging = false
		this.pollTimer = null
		this.status = []

		console.log(this.config)

		// get list of inputs for dropdown
		this.sendGetCommand('inputs')

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariables() // export variable definitions

		this.setupPolling()
	}

	async destroy() {
		if (this.pollTimer != null) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
			console.log('Polling stopped')
		}
		console.log('Destroy ' + this.id)
	}

	async configUpdated(config) {
		let resetConnection = false

		if (this.config.host != config.host || this.config.port != config.port) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			this.updateStatus(InstanceStatus.Connecting, 'Waiting')
			this.gotOptions.prefixUrl = 'http://' + this.config.host + ':' + this.config.port
			// update list of inputs for dropdown
			this.sendGetCommand('inputs')
		}

		this.setupPolling()
		console.log(this.config)
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 4,
				default: '127.0.0.1',
				regex: Regex.IP,
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
				type: 'static-text',
				id: 'text',
				label: '',
				width: 4,
			},
			{
				type: 'checkbox',
				id: 'pollEnabled',
				label: 'Enable Polling',
				width: 4,
				default: false,
				tooltip: 'When enabled variables will be updated automatically',
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Polling Interval (ms)',
				width: 4,
				default: 1000,
				min: 10,
				tooltip:
					'Lower values will update variables more often and also increase the load on Companion and Multicam Logger',
			},
		]
	}

	setupPolling() {
		if (this.config.pollEnabled === true) {
			console.log('Start polling at ' + this.config.pollInterval + 'ms')
			clearInterval(this.pollTimer)
			this.pollTimer = setInterval(this._restPolling.bind(this), this.config.pollInterval)
			this.log('info', 'Polling enabled at ' + this.config.pollInterval + 'ms')
		} else {
			console.log('Stop polling')
			clearInterval(this.pollTimer)
			this.pollTimer = null
			this.log('info', 'Polling disabled')
		}
	}

	async sendGetCommand(GetURL) {
		console.log(this.gotOptions.prefixUrl + GetURL)
		// console.log('get: ' + GetURL)
		let response
		let poll

		try {
			response = await got(GetURL, undefined, this.gotOptions)
			poll = await got('status', undefined, this.gotOptions)
		} catch (error) {
			this.log('warn', 'Send command error')
			this.processError(error)
			return
		}
		this.processResult(response)
		this.processResult(poll)
	}

	async _restPolling() {
		// console.log('poll now')
		let response
		try {
			response = await got('status', undefined, this.gotOptions)
		} catch (error) {
			console.log(error.message)
			this.processError(error)
			return
		}
		this.processResult(response)
	}

	processResult(response) {
		// console.log(response.statusCode)
		switch (response.statusCode) {
			case 200:
				// console.log('success')
				this.updateStatus(InstanceStatus.Ok)
				this.processData(response.requestUrl.pathname, response.body)
				break
			default:
				console.log('unexpected http response code')
				this.updateStatus(InstanceStatus.UnknownError, `Unexpected HTTP status code: ${response.statusCode}`)
				this.log('warn', `Unexpected HTTP status code: ${response.statusCode} - ${response.body.error}`)
				break
		}
	}

	processError(error) {
		if (error !== null) {
			if (error.code !== undefined) {
				this.log('error', 'Connection failed (' + error.message + ')')
			} else {
				this.log('error', 'general HTTP failure')
			}
			this.updateStatus(InstanceStatus.Disconnected)
		}
	}

	processData(pathname, body) {
		// console.log(pathname)
		// console.log(body)
		// console.log(typeof body + body.length)
		switch (pathname) {
			case '/status':
				// set variables from json body
				if (typeof body == 'object') {
					this.status = body
					this.setVariableValues(this.status)
				}
				// add labels from inputs array
				if (this.inputs.length > 0) {
					this.setVariableValues({
						previewLabel: this.inputs[this.status.preview].label,
						programLabel: this.inputs[this.status.program].label,
					})
				}
				// logging variable for feedback
				this.logging = this.status.logging_state
				this.checkFeedbacks()
				break
			case '/inputs':
				if (typeof body == 'object' && body.length > 0) {
					this.inputs = []
					for (var i = 0; i < body.length; i++) {
						this.inputs.push({ id: i, label: body[i] })
					}
					console.log(this.inputs)
					this.log('info', body.length + ' inputs found')
					this.updateActions()
					this.updateFeedbacks()
				}
				break
			case '/start':
				if (typeof body == 'object') {
					if (body['success'] === true) {
						this.log('info', 'Logging Started')
					}
				}
				break
			case '/stop':
				if (typeof body == 'object') {
					if (body['success'] === true) {
						this.log('info', 'Logging Stopped')
					}
				}
				break
			default:
				break
		}
	}
}

runEntrypoint(MulticamLogger, [])
