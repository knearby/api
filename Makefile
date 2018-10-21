setup:
	cd ./functions && npm install

start: setup
	firebase use development
	cd ./functions && firebase serve

deploy:
	firebase use development
	firebase deploy

deploy.production:
	firebase use production
	-firebase deploy
	firebase use development

clean:
	cd ./functions && npm run clean
