import Vue from 'vue';
import * as d3 from 'd3';

import { checkHash } from './helpers.ts';
import config from './config.ts';

export default Vue.extend({

	data() {

		const sessionFromLocalStorage = localStorage.motivatorApp && JSON.parse(localStorage.motivatorApp);
		const sessionFromHash = window.location.hash && checkHash(window.location.hash.substr(1));

		return {
			dataUser: null,
			dataCalories: null,
			dataSession: sessionFromLocalStorage || sessionFromHash
		}

	},

	created(){

		if(this.dataSession){ this.fetchData(); }

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

		fetchData(){

			const requestOpts = { headers: {'Authorization': `Bearer ${this.dataSession.access_token}`} };

			let date : Date | string = new Date();

			date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

			this.fetchUserData(requestOpts);

			this.fetchConsumedCalories(requestOpts, date);

			this.fetchWeightData(requestOpts, date);

			this.fetchCaloriesData(requestOpts, date);

			// todo: steps

		},

		fetchUserData(requestOpts : { headers: { [key: string]: string } }){

			fetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts)
				.then(res => res.json())
				.then(res => {

					if(res.errors){ this.clearAppState(); }

					this.dataUser = res.user;

			});

		},

		fetchConsumedCalories(requestOpts: { headers: { [key: string]: string } }, date : string){

			fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/foods/log/date/${date}.json`, requestOpts)
				.then(res => res.json())
				.then((res) => {

					// todo: check response for interesting data

					this.dataCalories = res.summary.calories;

				});

		},

		fetchWeightData(requestOpts: { headers: { [key: string]: string } }, date : string){

			fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts)
				.then(res => res.json())
				.then((res : { weight: [ { weight : number, date: string } ] }) => {

					// todo: check response for interesting data

					this.renderD3(res.weight.map(data => ({ value: data.weight, date: new Date(data.date) })), '#weight-graph', '#0095b2');

			});

		},

		fetchCaloriesData(requestOpts: { headers: { [key: string]: string } }, date : string){

			fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/activities/calories/date/${date}/1m.json`, requestOpts)
				.then(res => res.json())
				.then((res : { 'activities-calories': [ { value : number, dateTime: string } ] }) => {

					// todo: check response for interesting data

					this.renderD3(res['activities-calories'].map(data => ({ value: data.value, date: new Date(data.dateTime) })), '#calories-graph', '#f4a742');

				});

		},

		renderD3(data : { value : number, date: Date }[], svgSelector: string, lineColor: string) {

			data = data.splice(0, data.length - 1); // do not consider today

			const margin = 50;
			const height = 300;
			const width = ((document.querySelector(svgSelector) as HTMLElement).parentNode as HTMLElement).offsetWidth;

			const svg = d3.select(svgSelector)
				.attr('width', width)
				.attr('height', height);

			const x = d3.scaleTime().domain(d3.extent(data, d => d.date) as Date[]).range([margin, width - margin]);
			const y = d3.scaleLinear().domain(d3.extent(data, d => d.value) as number[]).nice().range([height - margin, margin]);

			svg.append('g')
				.attr('transform', `translate(0,${height - margin})`)
				.call(d3.axisBottom(x));

			svg.append('g')
				.attr('transform', `translate(${margin},0)`)
				.call(d3.axisLeft(y));

			const line = d3.line()
				.curve(d3.curveBasis)
				.x((d: { [key: string]: any }) => x(d.date))
				.y((d: { [key: string]: any }) => y(d.value));

			svg.append('path')
				.datum(data)
				.attr('fill', 'none')
				.attr('stroke', lineColor)
				.attr('stroke-width', 5)
				.attr('d', line as any);

		}
	}
});