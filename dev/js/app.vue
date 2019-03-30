<template>
	<section id="app">
		<header class="wrapper">
			<h1>FITBIT MOTIVATOR</h1>
			<a v-on:click="onLogout" href="#" v-if="dataSession">LOG OUT</a>
			<a :href="loginUrl" v-else>LOG IN</a>
		</header>
		<main>
			<section v-if="dataSession">
				<h2 v-if="dataUser">Hello, {{dataUser.displayName}}!</h2>
				<chart v-if="dataWeight" :data="dataWeight" msg="your weight changes" color="#0095b2"></chart>
				<chart v-if="dataCalories" :data="dataCalories" msg="your burned calories" color="#f4a742"></chart>
			</section>
			<h2 v-else class="greeting">Please <a :href="loginUrl" class="login-btn">login</a> with Fitbit account to use Motivator</h2>
		</main>
	</section>
</template>

<script lang="ts">

	import Vue from 'vue';
	import chart from './chart.vue';

	import { checkHash, Storage } from './helpers.ts';
	import config from './config.ts';

	const storage = new Storage('motivatorApp');

	export default Vue.extend({

		data() {

			let session = storage.get('session');

			if(!session){ session = checkHash(); }

			if(session){ storage.set({ session }); }

			return {
				dataSession: session,
				dataUser: storage.get('user'),
				dataWeight: storage.get('weight'),
				dataCalories: storage.get('calories'),
			}

		},

		components : {
			'chart': chart
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

				storage.remove();

				this.dataSession = false;

			},

			fetchData(){

				// todo: !!check all responses for interesting data!!

				const requestOpts = { headers: {'Authorization': `Bearer ${this.dataSession.access_token}`} };

				this.fetchUserData(requestOpts);

				if(!this.dataWeight) { this.fetchWeightData(requestOpts, 60, []); }

				if(!this.dataCalories) { this.fetchCaloriesData(requestOpts, 60, []); }

			},

			getFormattedDate(shift ?: number){

				let date : Date | string = new Date();

				if(shift) { date.setDate(date.getDate() - shift); }

				return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

			},

			fetchUserData(requestOpts : { headers: { [key: string]: string } }){

				if(!this.dataUser) {

					fetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts)
						.then(res => res.json())
						.then(res => {

							if(res.errors){ this.clearAppState(); }

							this.dataUser = res.user;

							storage.set({ user: this.dataUser });

						});

				}

			},

			fetchWeightData(requestOpts: { headers: { [key: string]: string } }, shift : number, response : { [key: string]: string }[]){

				fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/body/log/weight/date/${this.getFormattedDate(shift)}/30d.json`, requestOpts)
					.then(res => res.json())
					.then((res) => {

						const batch = (res.weight as [{ [key: string]: string }])
							.map(data => ({ value: data.weight, date: data.date }));

						response = response.concat(batch);

						if(shift <= 0){

							this.dataWeight = response.splice(0, response.length - 1);

							storage.set({weight: this.dataWeight});

						} else {

							shift = shift - 30;

							this.fetchWeightData(requestOpts, shift , response);

						}

					});
			},

			fetchCaloriesData(requestOpts: { headers: { [key: string]: string } }, shift : number, response : { [key: string]: string }[]){

				fetch(`https://api.fitbit.com/1/user/${this.dataSession.user_id}/activities/calories/date/${this.getFormattedDate(shift)}/30d.json`, requestOpts)
					.then(res => res.json())
					.then((res) => {

						const batch = (res['activities-calories'] as [{ [key: string]: string }])
							.map(data => ({ value: data.value, date: data.dateTime }));

						response = response.concat(batch);

						if(shift <= 0){

							this.dataCalories = response.splice(0, response.length - 1);

							storage.set({calories: this.dataCalories});

						} else {

							shift = shift - 30;

							this.fetchCaloriesData(requestOpts, shift , response)

						}

					});
			}
		}
	});

</script>

<style lang="scss">
	body{
		margin: 0;
		padding: 0;
		font: 14px/18px Helvetica, Arial, sans-serif;
		background: #eee;
	}
	a{
		color: #0095b2;
		font-weight: bold;
		&:hover{
			text-decoration: none;
		}
	}
	.wrapper{
		width: 100%;
		overflow: hidden;
	}
	header{
		border-bottom: 2px solid #ccc;
		padding: 20px 0;
		width: 100%;
		overflow: hidden;
		background: #fff;

		h1{
			margin: 0 0 0 20px;
			color: #0095b2;
			float: left;
		}

		a{
			float: right;
			margin: 0 20px 0 0;
		}

	}
	main{
		text-align: center;
		padding: 20px 0 0;

		h2{
			font: 34px/50px Helvetica, Arial, sans-serif;
			margin: 0;

			&.greeting{ margin-top: 40vh; }

		}
	}
</style>