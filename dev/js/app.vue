<template>
	<section id="app">
		<header>
			<h1>Fitbit Motivator</h1>
		</header>
		<main>
			<section id="data-view" v-if="dataSession">
				<a id="logout-button" v-on:click="onLogout" href="#">LOG OUT</a>
				<div id="info-box" v-html="displayData()" ref="infoBox"></div>
				<svg id="weight"></svg>
			</section>
			<section id="login-view" v-else>
				<h2>Please login to Fitbit to use Motivator</h2>
				<a id="login-button" v-bind:href="loginUrl">LOG IN</a>
			</section>
		</main>
	</section>
</template>

<script lang="ts" src="./app.ts"></script>

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