@echo off
set "NODE_HOME=c:\SOCIETRA ERP\tools\node\fresh\node-v20.11.1-win-x64"
set "PATH=%NODE_HOME%;%PATH%"
cd frontend
npm run dev
