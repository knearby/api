setup:
	cd ./functions && npm install

start: setup
	cd ./functions && firebase serve

deploy:
	firebase use production
	firebase deploy
	firebase use development

clean:
	cd ./functions && npm run clean