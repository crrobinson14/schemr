This module produces schema diagrams and dump files to make it easier to work
with complex CCK schemas in a version-control repository, such as GIT.

Please see http://drupal.org/sandbox/crobinson/1175870 (to be updated with
final project path, hopefully http://drupal.org/projects/schemr) for more
information.


Drush Commands
--------------
To generate a schema file, run "drush schu". This will update:
	
	INSTALL_PATH/schemr.profile

This is currently a hard-coded path because we're taking advantage of Drupal's
default security filter to block *.profile files from public access. It will be
configurable in a future release.) You may then commit this file to your
version-control repository, and keep it up to date with additional "drush schu"
commands in the future.

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
reposition them.

