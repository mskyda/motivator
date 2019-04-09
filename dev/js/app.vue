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
				<chart v-if="dataCalories && dataCaloriesBMR" :data="burnedCalories" msg="your burned calories" color="#f4a742"></chart>
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
				dataCaloriesBMR: storage.get('caloriesbmr'),
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

			},

			burnedCalories(){

				const burnedCalories : { value: number, date: string }[] = [];

				this.dataCalories.forEach((item : {
					value: number,
					date: string
				}, i : number) => {

					const caloriesDiff = item.value - this.dataCaloriesBMR[i].value;

					if(caloriesDiff){ burnedCalories.push({ value: caloriesDiff, date: item.date }); }

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
					body: `token=${this.dataSession.access_token}`,
				}).then(this.clearAppState);

			},

			clearAppState() {

				storage.remove();

				this.dataSession = false;

			},

			fetchData(){

				// todo: !!check all responses for interesting data!!

				this.fetchUserData();

				const propertiesToFetch = [
					{
						property: 'Weight',
						url: `https://api.fitbit.com/1/user/${this.dataSession.user_id}/body/log/weight/date/`,
						responseKey: 'weight',
						value: 'weight',
						date: 'date',
						shiftDays: 60
					},
					{
						property: 'Calories',
						url: `https://api.fitbit.com/1/user/${this.dataSession.user_id}/activities/calories/date/`,
						responseKey: 'activities-calories',
						value: 'value',
						date: 'dateTime',
						shiftDays: 60
					},
					{
						property: 'CaloriesBMR',
						url: `https://api.fitbit.com/1/user/${this.dataSession.user_id}/activities/caloriesBMR/date/`,
						responseKey: 'activities-caloriesBMR',
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

				if(this.dataUser) { return; }

				fetch('https://api.fitbit.com/1/user/-/profile.json', { headers: {'Authorization': `Bearer ${this.dataSession.access_token}`} })
					.then(res => res.json())
					.then(res => {

						if(res.errors){ this.clearAppState(); }

						this.dataUser = res.user;

						storage.set({ user: this.dataUser });

					});

			},

			fetchUserProperty(settings : {
				property: string,
				url: string,
				responseKey: string,
				value: string,
				date: string,
				shiftDays: number }, result ?: { [key: string]: string }[]){

				const propertyName = `data${settings.property}`;

				if(this.$data[propertyName] && this.$data[propertyName].reverse()[0].date === this.getFormattedDate()){ return; } // todo: fetch only missing days, not 3 months

				fetch(`${settings.url}${this.getFormattedDate(settings.shiftDays)}/30d.json`, { headers: {'Authorization': `Bearer ${this.dataSession.access_token}`} })
					.then(res => res.json())
					.then((res) => {

						const batch = (res[settings.responseKey] as [{ [key: string]: string }]).map(data => ({ value: data[settings.value], date: data[settings.date] }));

						result = result ? result.concat(batch) : [...batch];

						if(settings.shiftDays <= 0){

							this.$data[propertyName]= result;

							storage.set({[settings.property.toLowerCase()]: this.$data[propertyName]});

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