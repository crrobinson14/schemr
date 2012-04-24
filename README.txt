This module produces schema diagrams and dump files to make it easier to work
with complex CCK schemas in a version-control repository, such as GIT.

Please see http://drupal.org/sandbox/crobinson/1175870 (to be updated with
final project path, hopefully http://drupal.org/projects/schemr) for more
information.


Drush Commands
--------------
To generate a schema file, run "drush schu". This will update:
	
	SCHEMR_DATA_PATH/schemr.profile

SCHEMR_DATA_PATH defaults to sites/default/files/schemr (or your system's
files path), and is configurable at admin/content/types/schemr/configure. You
should change this path if you have configured your revision-control system
to ignore your site's files directory (as you generally should).

Note that all Schemr files end in .profile. This takes advantage of Drupal's
current .htaccess security configuration which blocks these files from being
accessed by the general public. You should maintain this block if you modify
the .htaccess file.

Once created, you may commit this file to your version-control repository,
then keep it up to date in the future by re-running "drush schu".

You can also check the differences between your database schema and this file
by running "drush schd". This will produce a diff output highlighting the
differences between the file on disk and your database. The database is
considered the "new" set of values, so if you see:

   -    "type" : "appearanc2",
   +    "type" : "appearance",

this indicates somebody has changed the "appearanc2" content type's machine
name in the database to "appearance". You can also run
"drush schd --side-by-side". This will produce a side-by-side diff if your
system's diff command supports the "-y" flag. Although this is a much longer
output, it is also easier for a human to read. The same change above would
look like this:

[                                                   [
  {                                                   {
    "type" : "appearanc2",                        |     "type" : "appearance",
    "label" : "Appearance",                             "label" : "Appearance",
    "groups" : [                                        "groups" : [
      {                                                   {

The middle column will contain '|' for a changed line, '<' for a deleted line,
and '>' for an added line. It is usually a good idea to pipe the output of this
command to a suitable pager, such as "drush schd --side-by-side | less".


Diagrams
--------
Schemr also produces schema diagrams for themers and developers. By default,
these are available at "http://YOURSITE/admin/content/types/schemr".

When you first access the diagram, items will be placed at positions determined
by a simple alphabetical ordering by machine name, with 15px spacing between
each box. You may then drag/drop the titles of the various types to sort or
reposition them, and save the new layout to the server. The layout will be
automatically reloaded each time you access the diagram in the future. Note
that support for multiple diagrams is planned, but not yet available.

Diagram layouts may be adjusted by simply dragging and dropping elements on
the canvas. This facility is crude at the moment - there are no alignment/
ordering facilities, grid snapping, etc. Its main purpose is to allow you to
shuffle the order in which elements are presented to conceptually group
related items.

Once arranged, a layout may be saved back to the server with the Save button,
or reset to a reasonably-spaced alphabetically-sorted arrangement with the
Reset button. After saving, future loads of the same diagram will honor the
saved layout.

At this time, Schemr supports only a single layout shared by all users.
Support for multiple diagrams is planned for the future, but was out of
scope for this release.

A PDF file may also be produced from a diagram. This is not necessarily an
identical reproduction but it should be fairly close. The PDF is produced
as a single page of all elements, which you can then tile, scale, or
adjust to the best paper size you have available, or simply refer to as
an electronic file.

Diagrams are themeable - class tags are output for content type and group
elements, so colors, fonts, and other aspects may be customized. However,
note that these are currently not (and may never be) synchronized to the
PDF output facility, as we wanted to standardize on an easily-installed
PDF library with minimal prerequisites (FPDF). We would need sophisticated
HTML parsing to calculate styles and extents for a true reproduction, and
that was beyond the scope of this project. Feel free to contribute!
