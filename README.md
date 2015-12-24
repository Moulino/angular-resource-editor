# angular-resource-editor

Angular Resource Editor is a module for the AngularJS framework. It allows you to manage resource objects from a REST API in a dialog box or directly in a template.

The Rest API must observe the [Hydra Core Vocabulary](http://www.hydra-cg.com/) web standards.

I wrote this module to operate in conjunction with the [Dunglas Api Bundle](https://github.com/dunglas/DunglasApiBundle) for [Symfony](symfony.com) that provides a way to develops an API REST quickly.
 
The editor display the list of objects in a table element and provides tools to add, edit or delete resource objects.
It performs the requests to the server through the module '[Restangular](https://github.com/mgonto/restangular)'.

To improve the ergonomics and the visual rendering, this module depends of [Angular Material](https://material.angularjs.org/latest/) that implements the Google's Material Design.

[Example in JsFiddle](https://jsfiddle.net/moulino/3su98hqt/8/)

This module is still developing. Please, excuse me for my poor english.

## Module setup
The easiest way to install the angular-resource-editor module is via Bower:

```bash
bower install angular-resource-editor --save
```

You can then include angular-resource-editor script after including its dependencies, angular, angular-resource and angular-material :

```html
<script src="bower_components/jquery/jquery.min.js"></script>
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/angular-animate/angular-animate.min.js"></script>
<script src="bower_components/angular-aria/angular-aria.min.js"></script>
<script src="bower_components/angular-aria/angular-messages.min.js"></script>
<script src="bower_components/lodash/lodash.min.js"></script>
<script src="bower_components/restangular/dist/restangular.min.js"></script>
<script src="bower_components/angular-material/angular-material.min.js"></script>
<script src="bower_components/angular-resource-editor/dist/mlResourceEditor.min.js"></script>
```

or you include them from a CDN :

```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular-animate.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular-aria.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular-messages.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js"></script> <!-- restangular dependency -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/restangular/1.5.1/restangular.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.0.0-rc5/angular-material.js"></script>
<script src="https://cdn.rawgit.com/Moulino/angular-resource-editor/master/dist/mlResourceEditor.min.js"></script>
```

And you can include the stylesheets :

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css">
<link rel="stylesheet" href="bower_components/angular-resource-editor/dist/mlResourceEditor.min.css">
```

or include them from a CDN :

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/angular-material/0.11.4/angular-material.min.css">
<link rel="stylesheet" href="https://cdn.rawgit.com/Moulino/angular-resource-editor/master/dist/mlResourceEditor.min.css">
```

## Usage example

The easiest way to understand how this module works is to see it in action. In this section, we'll configure it for manage to resources on remote api : category and task.

The category api returns a collection of objects like this :
```javascript
[
    {id: 1, name: 'category1'},
    {id: 2, name: 'category2'},
    {...}
]
```

The task api returns a collection of objects like this :
```javascript
[
    {id: 1, name: 'task1', date: '01-01-2015', category: {id: 1, name: 'category1'}},
    {id: 2, name: 'task2', date: '02-01-2015', category: {id: 2, name: 'category2'}},
    {...}
]
```

First you need to inject the module in your app.

```javascript
var app = angular.module('ExampleApp', ['mlResourceEditor']);
```

Then you need to configure the mlResource provider
```javascript
app.config(function(mlResourceProvider) {

    mlResourceProvider.setBaseUrl('http://api-tasks');

    mlResourceProvider.addResource({
        name: 'categories',
        url: 'api/categories', // for more explains, see angular-resource documentation
        filters: { // set of filters to add to the query
            'order[name]': 'ASC'
        },
        title_list: 'Categories',
        title_add: 'Add a category',
        title_edit: 'Edit the category',
        question_remove: 'Do you want to remove this category ?',
        fields: [
            {
                label: 'Name',
                model: 'name',
                type: 'text',
                required: true
            }
        ]
    });
    
    mlResourceProvider.addResource({
        name: 'tasks',
        url: 'api/tasks', // for more explains, see angular-resource documentation
        title_list: 'Tasks',
        title_add: 'Add a task',
        title_edit: 'Edit the task',
        question_remove: 'Do you want to remove this task ?',
        fields: [
            {
                label: 'Category',
                model: 'category',
                type: 'select',
                to_string: function(category) {
                    return category.name;
                },
                // to_string is called when displaying the item in table element
                select_resource: {
                    resource: 'categories',
                    label: 'name',
                    params: { // set of parameters to add to the query
                        'order[name]': 'ASC'
                    }
                },
                required: true
            },
            {
                label: 'Name',
                model: 'name',
                type: 'text',
                required: true
            },
            {
                label: 'Date',
                model: 'date',
                type: 'date',
                date_format: 'dd/MM/yyy', // date format to displaying it in the table element
                required: true
            }
        ]                
    });
});
```

Then you need to initialize the module and fetch the data
```javascript
app.run(function(mlResource) {
    mlResource.init();
});
```

And now, you can edit the resource in dialog box or directly into your template.

### For example in dialog box:

```javascript
var app = angular.module('exampleApp');
app.controller('MainCtrl', ['$scope', 'mlListDialog', function($scope, mlListDialog) {

    $scope.openFactoryAction = mlListDialog.open('factories');
    $scope.openTaskAction = mlListDialog.open('tasks');
    
}]);
```

### Or displaying the editor directly in an angular template :

You need to use the 'mlList' directive with the attribute 'name' containing the name of the resource.

The code for your template :

```html
<div ng-app="ExampleApp">
    <div ml-list name="factories"></div>
    <div ml-list name="tasks"></div>
</div>
```

### Dependencies :

 * [jQuery](https://jquery.com/) : The module requires JQuery because Jqlite features provided by Angular are not sufficient.
 * [lodash](https://lodash.com/) : This is a dependency of Restangular.
 * [Restangular](https://github.com/mgonto/restangular) : This module easier to manage the Ajax requests.
 * [Angular Material](https://material.angularjs.org/latest/) : Enables implementation of Google's Material Design