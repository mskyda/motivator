<template>
	<section id="app">
		<header class="wrapper">
			<h1>FITBIT MOTIVATOR</h1>
			<a v-on:click="onLogout" href="#" v-if="dataSession">LOG OUT</a>
			<a v-bind:href="loginUrl" v-else>LOG IN</a>
		</header>
		<main>
			<section v-if="dataSession">
				<h2 v-if="dataUser">Hello, {{dataUser.displayName}}!</h2>
				<div class="wrapper">
					<div class="weight">
						<h3>Your weight changes:</h3>
						<svg id="weight-graph" height="0"></svg>
					</div>
					<div class="calories">
						<h3>Consumed calories today:</h3>
						<h3 class="calories-title">{{ dataCalories }}</h3>
					</div>
				</div>
				<div class="wrapper">
					<h3>Your burned calories:</h3>
					<svg id="calories-graph" height="0"></svg>
				</div>
			</section>
			<h2 v-else class="greeting">Please <a v-bind:href="loginUrl" class="login-btn">login</a> with Fitbit account to use Motivator</h2>
		</main>
	</section>
</template>

<script lang="ts">

	import Vue from 'vue';
	import * as d3 from 'd3';

	import { checkHash, Storage } from './helpers.ts';
	import config from './config.ts';

	const storage = new Storage('motivatorApp');

	export default Vue.extend({

		data() {

			let session = storage.get('session');

			if(!session){ session = checkHash(); }

			if(session){ storage.set({ session }); }

			return {
				dataUser: null,
				dataCalories: null,
				dataSession: session
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

				storage.remove();

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
	.hide{
		display: none !important;
	}
	main{
		text-align: center;
		padding: 20px 0 0;

		h2{
			font: 34px/50px Helvetica, Arial, sans-serif;
			margin: 0;

			&.greeting{ margin-top: 40vh; }

		}

		h3{
			font: 18px/22px Helvetica, Arial, sans-serif;
			margin: 0 0 20px;

			&.calories-title{
				font: 200px/300px Helvetica, Arial, sans-serif;
				color: #0095b2;
			}

		}

		.weight{
			float: left;
			width: 70%;
		}
		.calories{
			float: right;
			width: 30%;
		}

	}
</style>