# jworldcup-ui-an
JWorldcup soccer bet game user interface on HTML5/TypeScript/Angular (depends on jworldcup-be-sb backend)

## Install (Active LTS) Node.js (and npm) on Ubuntu

```
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Install (update) npm

`sudo npm install -g npm`

## Install Angular CLI

```
sudo npm uninstall -g angular-cli
sudo npm uninstall -g @angular/cli
npm cache clean --force
sudo npm install -g @angular/cli
```

## Create Angular application

`brazso@mars:~/work/jworldcup$ ng new jworldcup-ui-an`

> ? Would you like to add Angular routing? Yes

> ? Which stylesheet format would you like to use? SCSS   [ https://sass-lang.com/documentation/syntax#scss ]

### Role of package-lock.json

- Add the _package-lock.json_ you to your version control repository
- Use `npm ci` instead of `npm install` when building your application both locally and in your deployment pipeline.
