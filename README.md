This is a small module in NodeJS, which scans a directory for new files filtered by extension, and print them all, on one printer or another depending on the server time. After print, move the files to another directory.

REQUIREMENTS
express
node-cron is to scheduler task.
pdf-to-printer is to send a file to print.

The sleep(ms) function is to wait for a while on print intervals.
