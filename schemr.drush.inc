<?php

/**
 * @file
 * Drush integration for the Schemr module.
 */

/**
 * Implements hook_drush_command().
 */
function schemr_drush_command() {
	$items['schemr-update'] = array(
		'description' => 'Update the local Schemr dump file with the latest schema from the database.',
		'aliases' => array('schu'),
	);
	$items['schemr-diff'] = array(
		'description' => 'Show differences between the current schema in the database, and the last report that was produced.',
		'options' => array(
			'--unified' => 'Output a unified diff',
			'--side-by-side' => 'Output a side-by-side display, suitable for parsing or comitting as its own element.',
		),
		'aliases' => array('schd'),
	);
	
	return $items;
}

/**
 * Command handler. Update schemr output file.
 *
 * @TODO: Make the output file configurable? At the moment we hard-code it to a single file that we
 * know Drupal's .htaccess will protect from having the outside world download via a browser.
 */
function drush_schemr_update() {
	$path = drupal_get_path('module', 'schemr');
	
	$_REQUEST['r'] = 'types';
	$r = schemr_json_indent(json_encode(schemr_generate_type_tree()));
	
	file_put_contents($path . '/schemr.profile', $r);
	drush_log(dt('Schema updated in ' . $path . '/schemr.profile'), 'ok');
}

/**
 * Command handler.  Show source code of specified function or method.
 */
function drush_schemr_diff() {
	$path = drupal_get_path('module', 'schemr');
	
	$_REQUEST['r'] = 'types';
	$r = schemr_json_indent(json_encode(schemr_generate_type_tree()));
	
	$unified = drush_get_option('unified');
	$sbs = drush_get_option('side-by-side');
	$format = (($unified || !$sbs) ? "-u" : "-y");
	
	$tmpfile = drush_save_data_to_temp_file($r);
	drush_shell_exec("diff $format $tmpfile $path/schemr.profile");
	drush_print(implode("\n", drush_shell_exec_output()));
}
