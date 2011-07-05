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
	drush_log(dt('Schema updated in ' . $path . '/schema.profile'), 'ok');
}

/**
 * Command handler.  Show source code of specified function or method.
 */
function drush_schemr_diff() {
  // Get implementations in the .install files as well.
  include_once './includes/install.inc';
  drupal_load_updates();
  
  if (strpos($function_name, '::') === FALSE) {
    if (!function_exists($function_name)) {
      return drush_set_error(dt('Function not found'));
    }
    $reflect = new ReflectionFunction($function_name);
  }
  else {
    list($class, $method) = explode('::', $function_name);
    if (!method_exists($class, $method)) {
      return drush_set_error(dt('Method not found'));
    }
    $reflect = new ReflectionMethod($class, $method);
  }
  $func_info = array('!file' => $reflect->getFileName(), '!startline' => $reflect->getStartLine(), '!endline' => $reflect->getEndLine());
  //drush_print_pipe(dt("!file -line !startline", $func_info));
  drush_print_pipe($reflect->getFileName());
  drush_print(dt("// file: !file, lines !startline-!endline", $func_info));

  _drush_devel_print_function($reflect->getFileName(), $reflect->getStartLine(), $reflect->getEndLine());
}
