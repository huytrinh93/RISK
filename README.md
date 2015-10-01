#RISK
This is an RPF game that similar to RISK boardgame. Main goal are creating a game that allow 3-6 players attend at the same time.

Main tools are based on SAILs - a web framework that intergrate socket.io 
For UI: we use HTML, CSS, JavaScript 
For database: we use PgSQL 
For additions: Bcrypt, bootstrap
# testProject

A [Sails](http://sailsjs.org) application

#Installation
1/ Install nodeJS
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js 
sudo apt-get update
sudo apt-get install nodejs

2/ Install Sails

sudo npm -g install sails

3/ Navigate To Current Directory

cd RiskOnline

4/ Install dependencies

sudo npm install

5/ Install PostgreSQL

sudo apt-get install postgresql postgresql-contrib

6/ Setup PostgreSQL

sudo -i -u postgres
psql
CREATE USER cs4320 password 'risk';
CREATE DATABASE riskonline OWNER cs4320;
\q
exit

7/ Run Application

sails lift

