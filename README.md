# jworldcup-ui-an
JWorldcup soccer bet game user interface on HTML5/TypeScript/Angular (depends on jworldcup-be-sb backend)

## Install (Active LTS) Node.js (and npm) on Ubuntu

```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
nodejs --version
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
ng --version
```

## Create Angular application

`brazso@mars:~/work/jworldcup$ ng new jworldcup-ui-an`

> ? Would you like to add Angular routing? Yes

> ? Which stylesheet format would you like to use? SCSS   [ https://sass-lang.com/documentation/syntax#scss ]

### PrimeNG
Follow install tutorial [ https://primefaces.org/primeng/showcase/#/setup ]

```
npm install primeng --save
npm install primeicons --save
```

In angular.json file add new css files to styles block:

    "styles": [
        "src/styles.scss",
        "node_modules/primeicons/primeicons.css",
        "node_modules/primeng/resources/themes/saga-blue/theme.css",
        "node_modules/primeng/resources/primeng.min.css"
    ],

### Layout

npm install --save @angular/flex-layout

### Translation

npm install --save @ngneat/transloco

## Start Angular application
```
ng serve
```

### Role of package-lock.json

- Add the _package-lock.json_ you to your version control repository
- Use `npm ci` instead of `npm install` when building your application both locally and in your deployment pipeline.

## Trash

### Menu

```HTML
<p:tieredMenu overlay="true" trigger="menuButton" my="left top" at="left bottom" style="width:230px; ">
    <p:submenu id="view" label="#{msgs['menu.view']}">
        <p:menuitem id="matches" 
            value="#{msgs['menu.matches']}"
            actionListener="#{conversationController.endConversations}"
            url="/secured/match/matches.xhtml" />
        <p:menuitem id="groups_standing" 
            value="#{msgs['menu.groups_standing']}"
            actionListener="#{conversationController.endConversations}"
            url="/secured/group/groupStandings.xhtml" />
        <p:menuitem id="point_race" 
            value="#{msgs['menu.point_race']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/userGroup/scores.xhtml" />
        <p:menuitem id="certificate" 
            rendered="#{p:ifGranted('USER') and applicationBean.eventFinished}"
            value="#{msgs['menu.certificate']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/userGroup/certificates.xhtml" />
        <p:menuitem id="topUsers" 
            rendered="#{p:ifGranted('USER') and not empty applicationBean.completedEventIds}"
            value="#{msgs['menu.topUsers']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/userGroup/topUsers.xhtml" />
        <p:menuitem id="chat" 
            rendered="#{p:ifGranted('USER')}"
            value="#{msgs['menu.chat']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/chat/chat.xhtml" />
        <p:menuitem id="gameRule"
            value="#{msgs['menu.gameRule']}" 
            onclick="PF('gameRuleDialog').show();" />
    </p:submenu>
    <p:submenu id="bet" label="#{msgs['menu.bet']}" 
        rendered="#{p:ifGranted('USER')}">
        <p:menuitem id="bets"
            value="#{msgs['menu.bets']}" 
            actionListener="#{conversationController.endConversations}"
            url="/secured/bet/bets.xhtml" />
        <p:menuitem id="favourite_team" 
            value="#{msgs['menu.favourite_team']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/user/favouriteTeamDetail.xhtml" />
    </p:submenu>
    <p:submenu id="settings" label="#{msgs['menu.settings']}">
        <p:menuitem id="modify_user" 
            value="#{msgs['menu.modify_user']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/user/userDetail.xhtml" />
        <p:menuitem id="user_groups" 
            value="#{msgs['menu.user_groups']}"
            actionListener="#{conversationController.endConversations}" 
            url="/secured/userGroup/userGroups.xhtml" />
    </p:submenu>
    <p:menuitem id="namecard"
        value="#{msgs['menu.namecard']}" 
        onclick="PF('aboutDialog').show();" />
    <p:menuitem id="logout" 
        value="#{msgs['menu.logout']}"
        url="/logout.xhtml" />
</p:tieredMenu>
```

## Useful links

- [Angular: Core and Shared Modules](https://medium.com/@joao.aguas/angular-core-and-shared-modules-efe072bc9645)
- [Fully fledged example Angular application](https://github.com/gothinkster/angular-realworld-example-app)
- [Authentication-forms tutorial](https://thinkster.io/tutorials/building-real-world-angular-2-apps/authentication-forms)
- [Login/Register form sample](https://codepen.io/gstorbeck/embed/gbNEOr?height=530&theme-id=0&slug-hash=gbNEOr&default-tab=css%2Cresult&user=gstorbeck&pen-title=Login%20Form&name=cp_embed_93)
- [Layout demos](https://tburleson-layouts-demos.firebaseapp.com/)
