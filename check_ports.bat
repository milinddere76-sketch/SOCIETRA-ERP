@echo off
netstat -ano | findstr :3000 > d:\Apps\CHS APP\ports_check.txt
netstat -ano | findstr :8080 >> d:\Apps\CHS APP\ports_check.txt
netstat -ano | findstr :80 >> d:\Apps\CHS APP\ports_check.txt
echo DONE >> d:\Apps\CHS APP\ports_check.txt
