/**
 * Grunt Module
 */
module.exports = function (grunt)
{
	'use strict';
	/**
	 * Configuration
	 */
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON('package.json'),
		project:
		{
			app: 'healthapp',
			css: [
				'<%= project.app %>/scss/*.scss'
			],
			js: [
				'<%= project.app %>/js/*.js'
			]
		},
		tag:
		{
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * <%= pkg.title %>\n' +
				' * <%= pkg.description %>\n' +
				' * <%= pkg.homepage %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * @version <%= pkg.version %>\n' +
				' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
				' */\n'
		},
		sass:
		{
			dev:
			{
				options:
				{
					style: 'expanded',
					banner: '<%= tag.banner %>',
					compass: false
				},
				// files:
				// {
				// 	'<%= project.app %>/css/*.css': '<%= project.css %>'
				// },
				files:
				[{
					expand: true,
					cwd: './scss',
					src: ['*.scss'],
					dest: './css',
					ext: '.css'
				}]
			},
			dist:
			{
				options:
				{
					style: 'compressed',
					compass: false
				},
				files:
				{
					'<%= project.app %>/css/*.css': '<%= project.css %>'
				}
			}
		},
		watch:
		{
			sass:
			{
				// files: '<%= project.app %>/scss/{,*/}*.{scss,sass}',
				files: 'scss/{,*/}*.scss',
				tasks: ['sass:dev']
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', [
		'sass:dev',
		'watch'
	]);
};
