import config from './config';

export default {

	data() {

		return {
			sessionData: localStorage.motivatorApp && JSON.parse(localStorage.motivatorApp) || this.checkHash(window.location.hash)
		}

	},

	template: `<section id="app">
		<header>
			<h1>Fitbit Motivator</h1>
		</header>
		<main>
			<section id="data-view" v-if="sessionData">
				<div id="info-box" v-html="displayData()" ref="infoBox"></div>
				<a id="logout-button" v-on:click="onLogout" href="#">LOG OUT</a>
			</section>
			<section id="login-view" v-else>
				<h2>Please login to Fitbit to use Motivator</h2>
				<a id="login-button" v-bind:href="generateLoginUrl()">LOG IN</a>
			</section>
		</main>
	</section>`,

	methods: {

		onLogout(e : Event) {

			e.preventDefault();

			fetch(config.pathes.revokeAccess, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${config.basicAuthId}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `token=${this.sessionData.access_token}`,
			}).then(this.clearAppState);

		},

		clearAppState() {

			localStorage.removeItem('motivatorApp');

			this.sessionData = false;

		},

		generateLoginUrl(){

			const data = {
				response_type: 'token',
				client_id: config.clientId,
				redirect_uri: encodeURIComponent(window.location.origin),
				scope: 'activity nutrition heartrate location nutrition profile settings sleep social weight',
				expires_in: (60 * 60 * 24 * config.expirationDays).toString()
			};

			let loginUrl = `${config.pathes.authorize}?`;

			for(const key in data){ loginUrl += `${key}=${data[key]}&`; }

			return loginUrl.substr(0, loginUrl.length - 1);

		},

		checkHash(hashData){

			if(!hashData){ return; }

			const sessionData = {};

			hashData = hashData.substr(1).split('&');

			hashData.forEach(chunk => { sessionData[chunk.split('=')[0]] = chunk.split('=')[1]; });

			localStorage.setItem('motivatorApp', JSON.stringify(sessionData));

			history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);

			return sessionData;

		},

		displayData(){

			const requestOpts = { headers: {'Authorization': `Bearer ${this.sessionData.access_token}`} };

			let html = '';

			fetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts).then(res => res.json()).then(res => {

				if(res.errors){

					if(res.errors[0].errorType === 'invalid_token'){ this.clearAppState(); }

				}

				html += `<h2>Hello ${res.user.displayName}!</h2>`;

				let date : Date | string = new Date();

				date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

				fetch(`https://api.fitbit.com/1/user/${this.sessionData.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts).then(res => res.json()).then(res => {

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
};