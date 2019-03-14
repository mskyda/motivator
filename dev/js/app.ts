import Vue from 'vue';
import * as d3 from 'd3';

import { checkHash } from './helpers.ts';
import config from './config.ts';

export default Vue.extend({

	data() {

		console.log();

		const sessionFromLocalStorage = localStorage.motivatorApp && JSON.parse(localStorage.motivatorApp);
		const sessionFromHash = window.location.hash && checkHash(window.location.hash.substr(1));

		return {
			dataSession: sessionFromLocalStorage || sessionFromHash
		}

	},

	computed: {

		loginUrl(){

			const data : { [key: string]: string } = {
				response_type: 'token',
				client_id: config.clientId,
				redirect_uri: encodeURIComponent(window.location.origin),
				scope: 'activity nutrition heartrate location nutrition profile settings sleep social weight',
				expires_in: (60 * 60 * 24 * config.expirationDays).toString()
			};

			let loginUrl = `${config.paths.authorize}?`;

			for(const key in data){ loginUrl += `${key}=${data[key]}&`; }

			return loginUrl.substr(0, loginUrl.length - 1);

		}

	},

	methods: {

		onLogout(e : Event) {

			e.preventDefault();

			fetch(config.paths.revokeAccess, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${config.basicAuthId}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `token=${this.dataSession.access_token}`,
			}).then(this.clearAppState);

		},

		clearAppState() {

			localStorage.removeItem('motivatorApp');

			this.dataSession = false;

		},

		displayData(){

			const requestOpts = { headers: {'Authorization': `Bearer ${this.dataSession.access_token}`} };

			let html = '';

			fetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts).then(res => res.json()).then(res => {

				if(res.errors){

					if(res.errors[0].errorType === 'invalid_token'){ this.clearAppState(); }

				}

				html += `<h2>Hello ${res.user.displayName}!</h2>`;

				(this.$refs.infoBox as HTMLElement).innerHTML = html; // todo: remove this dirty hack

				let date : Date | string = new Date();

				date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

				fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts).then(res => res.json()).then((res : { weight: [ { weight : number, date: string } ] }) => {

					this.renderD3(res.weight);

				});

			});

		},

		renderD3(data : { weight : number, date: string }[]) {

			const margin = 50;
			const height = 500;
			const width = window.innerWidth;

			const svg = d3.select('#weight')
				.attr('width', width)
				.attr('height', height);

			const x = d3.scaleTime().domain(d3.extent(data, d => new Date(d.date)) as Date[]).range([margin, width - margin]);
			const y = d3.scaleLinear().domain(d3.extent(data, d => d.weight) as number[]).nice().range([height - margin, margin]);

			svg.append('g')
				.attr('transform', `translate(0,${height - margin})`)
				.call(d3.axisBottom(x));

			svg.append('g')
				.attr('transform', `translate(${margin},0)`)
				.call(d3.axisLeft(y));

			const line = d3.line()
				.curve(d3.curveBasis)
				.x((d: { [key: string]: any }) => x(new Date(d.date)))
				.y((d: { [key: string]: any }) => y(d.weight));

			svg.append('path')
				.datum(data)
				.attr('fill', 'none')
				.attr('stroke', 'steelblue')
				.attr('stroke-width', 2)
				.attr('d', line as any);
		}
	}
});