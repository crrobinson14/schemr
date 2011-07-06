<?php

/**
 * @file
 * Limited printable-PDF support for Schemr.
 *
 * This facility makes some crude approximations to generate its output. For now, the
 * primary goal is to generate a PDF file that's a good approximation of the positioning
 * of diagram elements as specified by the site admin and saved to the server. This
 * generally gives better results when printed than using the browser's print function
 * because a) colors are preserved, and b) the PDF can be produced as a single page,
 * allowing the site admin to scale it to fit whatever their available paper size might
 * be.
 *
 * The FPDF module is required to support this facility. See INSTALL.txt for details.
 */

require_once('fpdf/fpdf.php');

/**
 * Provides a rough extents value for each ctype box.
 */
function _schemr_ctype_extents($pdf, $ctype) {
  $ret = array();
  
  $pdf->SetFont('Arial', 'B', 12);
  $ret['width'] = $pdf->GetStringWidth($ctype->label . ' (' . $ctype->type . ')');
  $ret['height'] = 0.225;

  $rows = 1;
  $col1 = 0;
  $col2 = 0;
  $col3 = 0;
  $col4 = 0;
  $col5 = 0;
  foreach ($ctype->groups as $group) {
    $pdf->SetFont('Arial', 'U', 12);
    $ret['height'] += 0.25;
    $ret['width'] = max($ret['width'], $pdf->GetStringWidth($group->label));
    $col1 = max($col1, $pdf->GetStringWidth($group->label));
    
    $pdf->SetFont('Arial', '', 11);
    foreach ($group->fields as $field) {
      $ret['height'] += 0.25;
      $col1 = max($col1, $pdf->GetStringWidth($field->machine_name) + 0.2);
      $col2 = max($col2, $pdf->GetStringWidth('S') + 0.2); // TODO: Optimize this out
      $col3 = max($col3, $pdf->GetStringWidth('*') + 0.2);
      $col4 = max($col4, $pdf->GetStringWidth($field->type) + 0.2);
      $col5 = max($col5, $pdf->GetStringWidth($field->notes) + 0.2);
      $ret['width'] = max($ret['width'], $col1+$col2+$col3+$col4+$col5);
    }
  }
  
  $ret['col1'] = $col1;
  $ret['col2'] = $col2;
  $ret['col3'] = $col3;
  $ret['col4'] = $col4;
  $ret['col5'] = $col5;
  $ret['left'] = $ctype->left / 72;
  $ret['top'] = $ctype->top / 72;

  return $ret;
}

/**
 * Menu hook callback to generate a PDF display.
 */
function schemr_generate_pdf() {
  // Merge up a types array
  $t = schemr_generate_type_tree();
  $ctypes = array();
  foreach ($t as $e) {
    $ctypes[$e->type] = $e;
    $ctypes[$e->type]->left = 15;
    $ctypes[$e->type]->top = 15;
  }
  $diagram = json_decode(_schemr_load_diagram());
  foreach ($diagram as $d) {
    $ctypes[$d->ctype]->left = $d->left;
    $ctypes[$d->ctype]->top = $d->top;
  }

  $pdf = new FPDF('P', 'in');
  $pdf->SetFont('Arial', '', 12);
  
  // TODO: It would be nice some day to allow the designer to set colors as config elements.
  $gcolors = array(
    array(221, 255, 255),
    array(255, 255, 221),
    array(255, 221, 238),
    array(255, 204, 102),
    array(221, 221, 255),
    array(221, 255, 221),
  );
  
  // TODO: It would be nice to optimize some of these repetitive loops...
  $max_x = 0;
  $max_y = 0;
  foreach ($ctypes as $ctype) {
    $ctype->extents = _schemr_ctype_extents($pdf, $ctype);
    $max_x = max($max_x, $ctype->extents['left'] + $ctype->extents['width'] + 0.5);
    $max_y = max($max_y, $ctype->extents['top'] + $ctype->extents['height'] + 0.5);
  }
  
  $pdf->SetDisplayMode('fullpage', 'single');
  $pdf->SetAutoPageBreak(false);
  $pdf->SetMargins(0.5, 0.5);
  $pdf->SetTextColor(0, 0, 0);
  $pdf->AddPage($max_x > $max_y ? 'L' : 'P', array($max_y+1, $max_x+1));

  foreach ($ctypes as $ctype) {
    $extents = $ctype->extents;
    $top = $extents['top'];
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetFillColor(255, 177, 100);
    $pdf->SetXY($extents['left'], $top);
    $pdf->Cell($extents['width'], 0.25, $ctype->label . ' (' . $ctype->type . ')', 1, 1, 'L', true);
    $top += 0.25;
    
    $i = 0;
    foreach ($ctype->groups as $group) {
      $color = $gcolors[$i++ % sizeof($gcolors)];
      $pdf->SetFont('Arial', 'U', 12);
      $pdf->SetFillColor($color[0], $color[1], $color[2]);
      $pdf->SetXY($extents['left'], $top);
      $pdf->Cell($extents['width'], 0.25, $group->label, 'LR', 1, 'L', true);
      $top += 0.25;

      $pdf->SetFont('Arial', '', 11);
      foreach ($group->fields as $field) {
        $pdf->SetXY($extents['left'], $top);
        $pdf->Cell($extents['col1'], 0.25, $field->machine_name, 'L', 0, 'L', true);
        $pdf->SetXY($extents['left'] + $extents['col1'], $top);
        $pdf->Cell($extents['col2'], 0.25, $field->shared == 1 ? 'S' : ' ', '', 0, 'C', true);
        $pdf->SetXY($extents['left'] + $extents['col1'] + $extents['col2'], $top);
        $pdf->Cell($extents['col3'], 0.25, $field->multiple == 1 ? '*' : ' ', '', 0, 'C', true);
        $pdf->SetXY($extents['left'] + $extents['col1'] + $extents['col2'] + $extents['col3'], $top);
        $pdf->Cell($extents['col4'], 0.25, $field->type, '', 0, 'L', true);
        $pdf->SetXY($extents['left'] + $extents['col1'] + $extents['col2'] + $extents['col3'] + $extents['col4'], $top);
        $pdf->Cell($extents['col5'], 0.25, $field->notes, 'R', 0, 'L', true);
        
        $top += 0.25;
      }
    }
    
    $pdf->Line($extents['left'], $top, $extents['left'] + $extents['width'], $top);
  }
  
  $pdf->Output();
  die();
}
