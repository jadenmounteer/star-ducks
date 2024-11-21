# This script deploys the app to firebase.
# It assumes you are already authenticated. If you get an auth error, run firebase login --reauth
# It also assumes you have initialized the app running firebase init. Make sure the public folder is dist/star-ducks/browser.
# Also make sure to say no to replacing index.html.
ng build --configuration production
firebase deploy