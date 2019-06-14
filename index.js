'use strict';
let key = 'b2897fea4763cb2036510a79230ce9a1';
let hero1id = 3223;
let hero1Pop;
let hero1Credits;
let hero1Films = [];
let hero2id = 74568;
let hero2Credits;
let hero2Pop;
let hero2Films = [];
let hero1Money;
let hero2Money;

//
let hero1Info = jQuery.get(
	`https://api.themoviedb.org/3/person/${hero1id}?api_key=${key}&append_to_response=credits`,
	function() {
		hero1Info = hero1Info.responseJSON;
		$('#hero1Pic').attr('src', `https://image.tmdb.org/t/p/original/${hero1Info.profile_path}`);
		hero1Credits = jQuery.grep(hero1Info.credits.cast, function(role) {
			return role.character.includes('Iron');
		});
		hero1Pop = hero1Info.popularity;
		for (let movie of hero1Credits) {
			let film = jQuery.get(
				`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${key}&append_to_response=credits`,
				function() {
					hero1Films.push(film.responseJSON);
				}
			);
		}
	}
);
let hero2Info = jQuery.get(
	`https://api.themoviedb.org/3/person/${hero2id}?api_key=${key}&append_to_response=credits`,
	function() {
		hero2Info = hero2Info.responseJSON;
		$('#hero2Pic').attr('src', `https://image.tmdb.org/t/p/original/${hero2Info.profile_path}`);
		hero2Credits = jQuery.grep(hero2Info.credits.cast, function(role) {
			return role.character.includes('Thor');
		});

		hero2Pop = hero2Info.popularity;
		for (let movie of hero2Credits) {
			let film = jQuery.get(
				`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${key}&append_to_response=credits`,
				function() {
					hero2Films.push(film.responseJSON);
				}
			);
		}
	}
);
function compile(films, hero) {
	let gain = [];
	for (let film of films) {
		let rank = film.credits.cast.map((e) => e.id).indexOf(hero) + 1;
		gain.push(Math.floor(film.revenue / rank));
	}
	return gain.reduce(function(sum, num) {
		return sum + num;
	});
}
function show() {
	$('#stats').empty();

	moneyMade();
	popularity();
	movieNum();
}
function movieNum() {
	var svgWidth = 100;
	var svgHeight = 250;
	var svg = d3
		.select('#stats')
		.append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.attr('class', 'bar-chart');
	var dataset = [ hero1Films.length * (svgHeight / 20), hero2Films.length * (svgHeight / 20) ];
	var barPadding = 5;
	var barWidth = svgWidth / dataset.length;
	var color = [ '#a50000', '#999999' ];
	var barChart = svg
		.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr('y', function(d) {
			return svgHeight - d;
		})
		.attr('height', function(d) {
			return d;
		})
		.attr('width', barWidth - barPadding)
		.attr('transform', function(d, i) {
			var translate = [ barWidth * i, 0 ];
			return 'translate(' + translate + ')';
		})
		.attr('fill', function(d) {
			return color[dataset.indexOf(d)];
		});
	svg.append('text').attr('font-size', '20px').attr('y', 20).attr('x', 17).attr('fill', 'white').text('Movies');
	svg
		.append('text')
		.attr('font-size', '20px')
		.attr('y', svgHeight - 20)
		.attr('x', 12)
		.attr('fill', 'white')
		.text(hero1Films.length);
	svg
		.append('text')
		.attr('font-size', '20px')
		.attr('y', svgHeight - 20)
		.attr('x', 60)
		.attr('fill', 'white')
		.text(hero2Films.length);
}
function popularity() {
	var width = 150;
	var height = width;

	var radius = Math.min(width, height) / 2 - 1;

	var svg = d3
		.select('#stats')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

	var data = { a: hero1Pop, b: hero2Pop };

	var color = d3.scaleOrdinal().domain(data).range([ '#a50000', '#999999' ]);

	var pie = d3.pie().value(function(d) {
		return d.value;
	});
	var data_ready = pie(d3.entries(data));

	svg
		.selectAll('svgs')
		.data(data_ready)
		.enter()
		.append('path')
		.attr('d', d3.arc().innerRadius(radius - 20).outerRadius(radius))
		.attr('fill', function(d) {
			return color(d.data.key);
		});
	svg.append('text').attr('text-anchor', 'middle').attr('font-size', '20px').attr('y', 5).text('Popularity');
}
function moneyMade() {
	hero1Money = compile(hero1Films, hero1id);
	hero2Money = compile(hero2Films, hero2id);

	var width = 150;
	var height = width;

	var radius = Math.min(width, height) / 2 - 1;

	var svg = d3
		.select('#stats')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

	var data = { a: hero1Money, b: hero2Money };

	var color = d3.scaleOrdinal().domain(data).range([ '#a50000', '#999999' ]);

	var pie = d3.pie().value(function(d) {
		return d.value;
	});
	var data_ready = pie(d3.entries(data));

	svg
		.selectAll('svgs')
		.data(data_ready)
		.enter()
		.append('path')
		.attr('d', d3.arc().innerRadius(radius - 20).outerRadius(radius))
		.attr('fill', function(d) {
			return color(d.data.key);
		});
	svg.append('text').attr('text-anchor', 'middle').attr('font-size', '20px').attr('y', 5).text('Revenue');
}
