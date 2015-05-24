# Angular-app
#### Web app, built with mean stack (MongoDB, Express, Angularjs and Node js)

## Demo
[Demo site](http://141.8.193.253:3000/)

## Installation
#### Dependencies

```sh
$ npm install
```

#### You need to install GraphicsMagick 
GraphicsMagick is the swiss army knife of image processing.

#### Also need MongoDB 
Installation Guide - [Go to the site](http://docs.mongodb.org/manual/installation/)


#### Set admin
After first run, you should create account and set "isAdmin" - true, in Mongo shell.

```sh
use angular_app

db.users.update({username: "YOUR_USERNAME"},{$set: {"isAdmin": true}})
```
After this manipulation you can go to admin panel.
