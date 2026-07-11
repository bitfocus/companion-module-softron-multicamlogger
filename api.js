// Thin wrapper around the Multicam Logger REST API using the built in fetch.
// All methods return the parsed JSON body, or throw on network / HTTP errors.
// Thrown errors carry a 'status' property when an HTTP status code is known.

const REQUEST_TIMEOUT = 3000

export class MulticamApi {
	constructor(getConfig) {
		this.getConfig = getConfig
	}

	get baseUrl() {
		const { host, port } = this.getConfig()
		return 'http://' + host + ':' + port
	}

	async request(path, options = {}) {
		const { token } = this.getConfig()
		const headers = { ...options.headers }
		if (token) {
			headers['Authorization'] = 'Bearer ' + token
		}

		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
		try {
			const res = await fetch(this.baseUrl + path, { ...options, headers: headers, signal: controller.signal })
			if (!res.ok) {
				const error = new Error('HTTP ' + res.status + ' on ' + path)
				error.status = res.status
				throw error
			}
			const text = await res.text()
			if (!text) return null
			try {
				return JSON.parse(text)
			} catch {
				return text
			}
		} catch (error) {
			if (error.name === 'AbortError') {
				throw new Error('Timeout on ' + path)
			}
			throw error
		} finally {
			clearTimeout(timer)
		}
	}

	async get(path) {
		return this.request(path, { method: 'GET' })
	}

	async post(path, body) {
		return this.request(path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
	}

	// Convenience endpoints, see http://<host>:8888/api.html for the API docs

	getStatus() {
		return this.get('/status')
	}

	getInputs() {
		return this.get('/inputs')
	}

	startLogging() {
		return this.get('/start')
	}

	stopLogging() {
		return this.get('/stop')
	}

	addMarker(body) {
		return this.post('/add_marker', body)
	}

	changeAngle(body) {
		// Empty body performs a TAKE (swap preview and program)
		return this.post('/change_angle', body ?? {})
	}
}
