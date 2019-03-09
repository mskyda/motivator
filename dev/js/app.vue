<template>
	<section id="app">
		<header>
			<h1>Fitbit Motivator</h1>
		</header>
		<main>
			<section id="login-view" class="hide">
				<h2>Please login to Fitbit to use Motivator</h2>
				<a id="login-button" href="#">LOG IN</a>
			</section>
			<section id="data-view" class="hide">
				<div id="info-box"></div>
				<a id="logout-button" href="#">LOG OUT</a>
			</section>
		</main>
	</section>
</template>

<script lang="ts">

	export default {
		data() {
			return {};
		},
		mounted() {

			document.querySelector('#logout-button').addEventListener('click', (e) => {

				e.preventDefault();

				localStorage && localStorage.removeItem('motivatorApp');

				// todo: revoke token on logout

				init();

			});

			function init(){

				let sessionData = localStorage && localStorage.getItem('motivatorApp') || {};

				if(!Object.keys(sessionData).length){

					let hashData = window.location.hash;

					hashData ? readDataFromHash(hashData, sessionData) : login();

				} else { displayData(JSON.parse(sessionData)); }

			}

			function login(){

				document.querySelector('#login-view').classList.remove('hide');
				document.querySelector('#data-view').classList.add('hide');

				const data = {
					response_type: 'token',
					client_id: '22DJKC',
					redirect_uri: encodeURIComponent(window.location.origin),
					scope: 'activity nutrition heartrate location nutrition profile settings sleep social weight',
					expires_in: '31536000'
				};

				let loginUrl = 'https://www.fitbit.com/oauth2/authorize?';

				for(const key in data){ loginUrl += `${key}=${data[key]}&`; }

				document.querySelector('#login-button').setAttribute('href', loginUrl.substr(0, loginUrl.length - 1));

			}

			function readDataFromHash(hashData, sessionData){

				hashData = hashData.substr(1).split('&');

				hashData.forEach(chunk => { sessionData[chunk.split('=')[0]] = chunk.split('=')[1]; });

				localStorage.setItem('motivatorApp', JSON.stringify(sessionData));

				history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);

				displayData(sessionData);

			}

			function displayData(appData){

				document.querySelector('#data-view').classList.remove('hide');
				document.querySelector('#login-view').classList.add('hide');

				const infoBox = document.querySelector('#info-box');
				const requestOpts = { headers: {'Authorization': `Bearer ${appData.access_token}`} };

				infoBox.innerHTML = '';

				fetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts).then(res => res.json()).then(res => {

					infoBox.innerHTML += `<h2>Hello ${res.user.displayName}!</h2>`;

					let date = new Date();

					date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

					fetch(`https://api.fitbit.com/1/user/${appData.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts).then(res => res.json()).then(res => {

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

						infoBox.innerHTML += `<h3>Your average weight:<br><br> ${weeks.join('<br>')}<h3><h3>Great job!</h3>`;

					});

				});

			}

			init();

		},
		methods: {}
	}

</script>

<style lang="scss">
	body{
		margin: 0;
		padding: 0;
		font: 14px/18px Helvetica, Arial, sans-serif;
	}
	header{
		border-bottom: 2px solid #ccc;
		padding: 20px;

		h1{
			margin: 0;
			text-align: center;
		}

	}
	.hide{
		display: none !important;
	}
	main{
		text-align: center;
	}
</style>