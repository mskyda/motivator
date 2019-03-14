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

<script lang="ts" src="./app.ts"></script>

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