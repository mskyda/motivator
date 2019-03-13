import Vue from 'vue'

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

				let date : Date | string = new Date();

				date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

				fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts).then(res => res.json()).then(res => {

					let weeks = [];

					res.weight.reverse().forEach((obj, index) => {

						const week = Math.floor(index / 7);

						weeks[week] = weeks[week] ? weeks[week] += obj.weight : obj.weight;

					});

					weeks = weeks.map((week, index) => {

						let divider = 7;

						if(index === weeks.length - 1){ divider = res.weight.length % 7; }

						return `${index === 0 ? 'This week: ' : `${index} week(s) ago: `} ${(week / divider).toFixed(2)} kg <br>`

					});

					html += `<h3>Your average weight:<br><br> ${weeks.join('<br>')}<h3><h3>Great job!</h3>`;

					this.$refs.infoBox.innerHTML = html;

				});

			});

		}

	}
});