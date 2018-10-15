setup:
	cd ./functions && npm install

start: setup
	cd ./functions && firebase serve

deploy:
	firebase deploy

clean:
	cd ./functions && npm run clean