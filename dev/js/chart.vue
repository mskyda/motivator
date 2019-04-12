<template>
	<svg ref="svg"></svg>
</template>

<script lang="ts">

	import Vue from 'vue';
	import * as d3 from 'd3';

	export default Vue.extend({

		props: [ 'data', 'msg', 'color' ],

		mounted(){

			this.renderD3();

		},

		methods: {

			renderD3() {

				const data : { value : number, date: Date }[] = (this.$props.data as [{ value: number, date: string }]).map(data => ({ value: data.value, date: new Date(data.date) }));
				const width = ((this.$refs.svg as HTMLElement).parentNode as HTMLElement).offsetWidth;
				const margin = 50;
				const height = 300;

				data.shift();

				console.log(data);

				const svg = d3.select(this.$refs.svg as HTMLElement)
					.attr('width', width)
					.attr('height', height);

				const x = d3.scaleTime().domain(d3.extent(data, d => d.date) as Date[]).range([margin, width - margin]);
				const y = d3.scaleLinear().domain(d3.extent(data, d => d.value) as number[]).range([height - margin, margin]);

				svg.append('g')
					.attr('transform', `translate(0,${height - margin})`)
					.call(d3.axisBottom(x));

				svg.append('g')
					.attr('transform', `translate(${margin},0)`)
					.call(d3.axisLeft(y));

				const line = d3.line()
					// .curve(d3.curveCardinal.tension(1))
					.x((d: { [key: string]: any }) => x(d.date))
					.y((d: { [key: string]: any }) => y(d.value));

				const randomHex = new Array(7).join('f').split('').map(() => Math.round(Math.random() * 15).toString(16)).join('');

				svg.append('path')
					.datum(data)
					.attr('fill', 'none')
					.attr('stroke', `#${randomHex}`)
					.attr('stroke-width', 3)
					.attr('d', line as any);

			}

		}

	});

</script>