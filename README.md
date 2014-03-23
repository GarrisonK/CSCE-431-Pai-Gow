Setting up Pai Gow
==================
	All commands that are to be entered in a command line will be in quotes.

Steps install Pai Gow:
	1. Install the package manager for Node.js packages, npm. This is system dependent. "sudo apt-get install npm" for Ubuntu.
	1a. Install curl. For Ubuntu enter "sudo apt-get install curl". OS X comes with curl by default.
	2. Install the Node.js version manager by running "sudo npm install -g n".
	3. Install the latest stable version of Node.js by running "sudo n stable". *Note that the 'latest' version does not work!*
	4. Install git. This is system dependent. "sudo apt-get install git" for Ubuntu.
	5. Change to a directory that you want to have the project source code and run "git clone https://github.com/GarrisonK/CSCE-431-Pai-Gow.git".
	6. Change into the project root directory and run "npm install".

How to run Pai Gow:
	1. After the installation is complete, run "node app.js".
	2. Go to 'http://localhost:3000/' in your web browser.

How to run the unit tests and code lint tool:
	1. Run "sudo npm install -g grunt-cli".
	2a. To run a single round of tests/checks, run "grunt".
	2b. To run the tests/checks every time a project file is updated run "grunt watch".

