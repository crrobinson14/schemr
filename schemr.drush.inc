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
 * Credit to: https://gist.github.com/906036
 *
 * Indents a flat JSON string to make it more human-readable.
 * Stolen from http://recursive-design.com/blog/2008/03/11/format-json-with-php/
 * and adapted to put spaces around : characters.
 *
 * @param string $json The original JSON string to process.
 *
 * @return string Indented version of the original JSON string.
 */
function _schemr_json_indent($json) {
  $result      = '';
  $pos         = 0;
  $strLen      = strlen($json);
  $indentStr   = '  ';
  $newLine     = "\n";
  $prevChar    = '';
  $outOfQuotes = true;

  for ($i=0; $i<=$strLen; $i++) {

    // Grab the next character in the string.
    $char = substr($json, $i, 1);

    // Put spaces in front of :
    if ($outOfQuotes && $char == ':' && $prevChar != ' ') {
      $result .= ' ';
    }

    if ($outOfQuotes && $char != ' ' && $prevChar == ':') {
      $result .= ' ';
    }

    // Are we inside a quoted string?
    if ($char == '"' && $prevChar != '\\') {
      $outOfQuotes = !$outOfQuotes;

      // If this character is the end of an element, 
      // output a new line and indent the next line.
    } else if(($char == '}' || $char == ']') && $outOfQuotes) {
      $result .= $newLine;
      $pos --;
      for ($j=0; $j<$pos; $j++) {
        $result .= $indentStr;
      }
    }

    // Add the character to the result string.
    $result .= $char;

    // If the last character was the beginning of an element, 
    // output a new line and indent the next line.
    if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
      $result .= $newLine;
      if ($char == '{' || $char == '[') {
        $pos ++;
      }

      for ($j = 0; $j < $pos; $j++) {
        $result .= $indentStr;
      }
    }

    $prevChar = $char;
  }

  return $result;
}

/**
 * Command handler. Update schemr output file.
 */
function drush_schemr_update() {
  $path = schemr_get_data_path();
  
  $_REQUEST['r'] = 'types';
  $r = _schemr_json_indent(json_encode(schemr_generate_type_tree()));
  
  file_put_contents($path . '/schemr.profile', $r);
  drush_log(dt('Schema updated in ' . $path . '/schemr.profile'), 'ok');
}

/**
 * Command handler.  Show source code of specified function or method.
 */
function drush_schemr_diff() {
  $path = drupal_get_path('module', 'schemr');
  
  $_REQUEST['r'] = 'types';
  $r = _schemr_json_indent(json_encode(schemr_generate_type_tree()));
  
  $unified = drush_get_option('unified');
  $sbs = drush_get_option('side-by-side');
  $format = (($unified || !$sbs) ? "-u" : "-y");
  
  $tmpfile = drush_save_data_to_temp_file($r);
  drush_shell_exec("diff $format $path/schemr.profile $tmpfile");
  drush_print(implode("\n", drush_shell_exec_output()));
}
