setup:
	cd ./functions && npm install

start: setup
	firebase use development
	cd ./functions && firebase serve

deploy:
	firebase use development
	firebase deploy

deploy.fn:
	firebase use development
	firebase deploy --only functions

deploy.db:
	firebase use development
	firebase deploy --only database

deploy.production:
	firebase use production
	-firebase deploy
	firebase use development

clean:
	cd ./functions && npm run clean
