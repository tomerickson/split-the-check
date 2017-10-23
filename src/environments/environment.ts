// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyDYATESvb1tExA9ULLXzWu1IePaB2HSIiM',
    authDomain: 'split-the-check.firebaseapp.com',
    databaseURL: 'https://split-the-check.firebaseio.com',
    projectId: 'split-the-check',
    storageBucket: 'split-the-check.appspot.com',
    messagingSenderId: '820797856329'
  }
};
