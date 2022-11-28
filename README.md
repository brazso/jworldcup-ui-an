# jworldcup-ui-an
JWorldcup soccer bet game frontend developed on HTML5/TypeScript/Angular (depends on jworldcup-be-sb backend)

## Install (Active LTS) Node.js (and npm) on Ubuntu

```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

## Install (update) npm

```
sudo npm install -g npm
npm --version
```

## Install Angular CLI

```
sudo npm uninstall -g angular-cli
sudo npm uninstall -g @angular/cli
npm cache clean --force
sudo npm install -g @angular/cli
ng version
```

## Create Angular application

`brazso@mars:~/work/jworldcup$ ng new jworldcup-ui-an`

> ? Would you like to add Angular routing? Yes

> ? Which stylesheet format would you like to use? SCSS   [ https://sass-lang.com/documentation/syntax#scss ]

### Role of package-lock.json

- Add the _package-lock.json_ you to your version control repository
- Use `npm ci` instead of `npm install` when building your application both locally and in your deployment pipeline.
- To update a single package use `npm update @angular/flex-layout`

### Additional packages

#### PrimeNG
Follow install tutorial [ https://primefaces.org/primeng/showcase/#/setup ]

```
npm install primeng
npm install primeicons
```

In angular.json file add new css files to styles block:

    "styles": [
        "src/styles.scss",
        "node_modules/primeicons/primeicons.css",
        "node_modules/primeng/resources/themes/saga-blue/theme.css",
        "node_modules/primeng/resources/primeng.min.css"
    ],

#### Layout

npm install @angular/flex-layout

#### Translation

npm install @ngneat/transloco

#### Input Trim

npm install ng2-trim-directive

#### Charts.js
npm install chart.js

### PDF viewer
npm install print-js

### Websocket
npm install @stomp/rx-stomp

## Start Angular application
```
ng serve
```

## Upgrade application to a newer Angular version, e.g. #14

- `ng update @angular/core@14 @angular/cli@14`
- upgrade additonal packages in package.json, e.g. primeng, and run `npm install`

## Build Angular application for production
```
ng build
```

## Docker images
In production the application runs in a docker container.

### Start docker container of the application for production
```
docker-compose --profile production --env-file .env.prod up --build -d
```

### Stop running docker container of the application (in production)
```
docker-compose down
```

## Use maintenance mode in case of production
Rename file
`src/maintenance_off.html`
to
`src/maintenance_on.html`
Ngnix web server on the production server checks the latter file. All request will be redirected there if that file exits. Rename the file back if you want the application to be online again.

## Useful links

- [Angular: Core and Shared Modules](https://medium.com/@joao.aguas/angular-core-and-shared-modules-efe072bc9645)
- [Fully fledged example Angular application](https://github.com/gothinkster/angular-realworld-example-app)
- [Authentication-forms tutorial](https://thinkster.io/tutorials/building-real-world-angular-2-apps/authentication-forms)
- [Login/Register form sample](https://codepen.io/gstorbeck/embed/gbNEOr?height=530&theme-id=0&slug-hash=gbNEOr&default-tab=css%2Cresult&user=gstorbeck&pen-title=Login%20Form&name=cp_embed_93)
- [Layout demos](https://tburleson-layouts-demos.firebaseapp.com/)
- [An input validation message to use with PrimeNG ](https://gist.github.com/sannonaragao/dbf747676016ed0c4054f8abd2e2a4d2)
- [The Ultimate Guide to handling JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)
- [JWT Authentication With Refresh Tokens](https://www.geeksforgeeks.org/jwt-authentication-with-refresh-tokens/)
