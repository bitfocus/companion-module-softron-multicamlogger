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
		this.log('debug', 'init multicam logger')
		this.updateStatus(InstanceStatus.Connecting, 'Waiting')
		this.config = config

		this.gotOptions = new Options({
			prefixUrl: 'http://' + this.config.host + ':' + this.config.port,
			responseType: 'json',
			throwHttpErrors: false,
			timeout: { request: 2000 },
			retry: { limit: 0 },
		})

		this.inputs = []
		this.logging = false
		this.pollTimer = null
		this.status = []

		this.log('debug', this.config)

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
			this.log('debug', 'Polling stopped')
		}
		this.log('debug', 'Destroy ' + this.id)
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
		this.log('debug', this.config)
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				default: '127.0.0.1',
				regex: Regex.IP,
				required: true,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				default: '8888',
				regex: Regex.PORT,
				required: true,
			},
			{
				type: 'checkbox',
				id: 'pollEnabled',
				label: 'Enable Polling',
				default: false,
				description: 'When enabled variables will be updated automatically',
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Polling Interval (ms)',
				default: 1000,
				min: 10,
				description:
					'Lower values will update variables more often and also increase the load on Companion and Multicam Logger',
			},
		]
	}

	setupPolling() {
		if (this.config.pollEnabled === true) {
			this.log('debug', 'Start polling at ' + this.config.pollInterval + 'ms')
			clearInterval(this.pollTimer)
			this.pollTimer = setInterval(this._restPolling.bind(this), this.config.pollInterval)
			this.log('info', 'Polling enabled at ' + this.config.pollInterval + 'ms')
		} else {
			this.log('debug', 'Stop polling')
			clearInterval(this.pollTimer)
			this.pollTimer = null
			this.log('info', 'Polling disabled')
		}
	}

	async sendGetCommand(GetURL) {
		this.log('debug', this.gotOptions.prefixUrl + GetURL)
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
		let response
		try {
			response = await got('status', undefined, this.gotOptions)
		} catch (error) {
			this.log('error', error.message)
			this.processError(error)
			return
		}
		this.processResult(response)
	}

	processResult(response) {
		switch (response.statusCode) {
			case 200:
				this.updateStatus(InstanceStatus.Ok)
				this.processData(response.requestUrl.pathname, response.body)
				break
			default:
				this.log('warn', 'unexpected http response code')
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
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
	}

	processData(pathname, body) {
		switch (pathname) {
			case '/status':
				// set variables from json body
				this.status = body
				this.setVariableValues(this.status)
				// add labels from inputs array
				if (this.inputs.length > 0) {
					this.setVariableValues({
						previewLabel: this.inputs[this.status.preview]?.label ?? '',
						programLabel: this.inputs[this.status.program]?.label ?? '',
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
					this.log('debug', this.inputs)
					this.log('info', body.length + ' inputs found')
					this.updateActions()
					this.updateFeedbacks()
				}
				if (typeof body == 'object' && body.length == 0) {
					this.inputs = []
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
