# KMP Router middleware for Express

This middleware is designed to work like the Symfony2 model of seperate routes and controllers.

Routes are defined in a .yml file; multiple controllers can be defined in their own .js file.<br>
This gives us great flexibility in setting up our routes; it's possible to change your complete url structure without touching any controller code.

To use named routing, we rely on the excellent express-reverse package (https://github.com/dizlexik/express-reverse).

## Install

```sh
npm install kmp-router
```

## Example

```js
#/app.js
var app = require('express')();
require('kmp-router')(app);
```

```yaml
#/app/config/routes.yml
home:
    pattern: /
    controller: main:home
    methods: [GET]

about:
    pattern: /about
    controller: main:about
    methods: [GET]

item:
    pattern: /item/edit/:id?
    controller: main:item
    methods: [GET, POST]

#load all routes for /api
api-loader:
    resource: routes/api.yml
    prefix: /api
```

```yaml
#/app/config/routes/api.yml
api-get:
    pattern: /get
    controller: api:get
    methods: [GET]
```

```js
#/app/controllers/main.js
module.exports = function() {
    return {
        homeController: function(req, res, next) {
            res.render('index.html.twig', {});
        },
        aboutController: function(req, res, next) {
            res.render('about.html.twig', {});
        },
        itemController: function(req, res, next) {
            
            req.params.id = req.params.id || 0;
            
            res.render('item.html.twig', {
                param: req.params.id
            });
        },
    }
};

```
The controller `main:about` will be parsed so the `aboutController` in `/app/controllers/main.js` is loaded.

Multiple .yml routing files can be loaded using the resource/prefix syntax, see code example above.

