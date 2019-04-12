<template>
	<section id="app">
		<header class="wrapper">
			<h1>FITBIT MOTIVATOR</h1>
			<a v-on:click="onLogout" href="#" v-if="session">LOG OUT</a>
			<a :href="loginUrl" v-else>LOG IN</a>
		</header>
		<main>
			<section v-if="session">
				<h2 v-if="user">Hello, {{user.displayName}}!</h2>
				<div class="wrapper">
					<chart v-if="weight" :data="weight"></chart>
					<chart v-if="caloriesOut && caloriesIn" :data="burnedCalories"></chart>
				</div>
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
				session: session,
				user: storage.get('user'),
				weight: storage.get('weight'),
				caloriesOut: storage.get('caloriesout'),
				caloriesIn: storage.get('caloriesin'),
			}

		},

		components : {
			'chart': chart
		},

		created(){

			if(this.$data.session){ this.fetchData(); }

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

			},

			burnedCalories(){

				const burnedCalories : { value: number, date: string }[] = [];

				this.$data.caloriesOut.forEach((item : {
					value: number,
					date: string
				}, i : number) => {

					if(+this.$data.caloriesIn[i].value){

						burnedCalories.push({ value: item.value - this.$data.caloriesIn[i].value, date: item.date });

					}

				});

				return burnedCalories;

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
					body: `token=${this.$data.session.access_token}`,
				}).then(this.clearAppState);

			},

			clearAppState() {

				storage.remove();

				this.$data.session = false;

			},

			fetchData(){

				// todo: !!check all responses for interesting data!!

				this.fetchUserData();

				const propertiesToFetch = [
					{
						property: 'weight',
						url: `https://api.fitbit.com/1/user/${this.$data.session.user_id}/body/log/weight/date/`,
						responseKey: 'weight',
						value: 'weight',
						date: 'date',
						shiftDays: 60
					},
					{
						property: 'caloriesOut',
						url: `https://api.fitbit.com/1/user/${this.$data.session.user_id}/activities/calories/date/`,
						responseKey: 'activities-calories',
						value: 'value',
						date: 'dateTime',
						shiftDays: 60
					},
					{
						property: 'caloriesIn',
						url: `https://api.fitbit.com/1/user/${this.$data.session.user_id}/foods/log/caloriesIn/date/`,
						responseKey: 'foods-log-caloriesIn',
						value: 'value',
						date: 'dateTime',
						shiftDays: 60
					}
				];

				propertiesToFetch.map(property => this.fetchUserProperty(property));



			},

			getFormattedDate(shift ?: number){

				let date : Date | string = new Date();

				if(shift) { date.setDate(date.getDate() - shift); }

				return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

			},

			fetchUserData(){

				if(this.$data.user) { return; }

				fetch('https://api.fitbit.com/1/user/-/profile.json', { headers: {'Authorization': `Bearer ${this.$data.session.access_token}`} })
					.then(res => res.json())
					.then(res => {

						if(res.errors){ this.clearAppState(); }

						this.$data.user = res.user;

						storage.set({ user: this.$data.user });

					});

			},

			fetchUserProperty(settings : {
				property: string,
				url: string,
				responseKey: string,
				value: string,
				date: string,
				shiftDays: number }, result ?: { [key: string]: string }[]){

				if(this.$data[settings.property] && this.$data[settings.property].reverse()[0].date === this.getFormattedDate()){ return; } // todo: fetch only missing days, not 3 months

				fetch(`${settings.url}${this.getFormattedDate(settings.shiftDays)}/30d.json`, { headers: {'Authorization': `Bearer ${this.$data.session.access_token}`} })
					.then(res => res.json())
					.then((res) => {

						const batch = (res[settings.responseKey] as [{ [key: string]: string }]).map(data => ({ value: data[settings.value], date: data[settings.date] }));

						result = result ? result.concat(batch) : [...batch];

						if(settings.shiftDays <= 0){

							this.$data[settings.property]= result;

							storage.set({[settings.property.toLowerCase()]: this.$data[settings.property]});

						} else {

							settings.shiftDays -= 30;

							this.fetchUserProperty(settings, result);

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
		position: relative;
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
		/*svg{
			position: absolute;
			left: 0;
			top: 0;

			&:first-of-type{ position: relative; }

		}*/
	}
</style>