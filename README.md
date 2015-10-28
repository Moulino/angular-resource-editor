# angular-resource-editor

Angular Resource Editor is a module for the AngularJS framework. It allows you to manage resource objects in a dialog box or directly in a template.
 
The editor display the list of objects in a table element and provides tools to add, edit or delete resource objects.
It performs the requests to the server through the module 'angular-resource'.

This module is still developing. Please, excuse me for my poor english.

## Module setup
The easiest way to install the angular-resource-dialog module is via Bower:

```bash
bower install angular-resource-editor --save
```

You can then include angular-resource-dialog script after including its dependencies, angular, angular-resource and angular-material :

```html
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/angular-resource/angular-resource.min.js"></script>
<script src="bower_components/angular-animate/angular-animate.min.js"></script>
<script src="bower_components/angular-aria/angular-aria.min.js"></script>
<script src="bower_components/angular-material/angular-material.min.js"></script>
<script src="bower_components/angular-resource-editor/angular-resource-editor.min.js"></script>
```

And you can include the stylesheets :

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css">
<link rel="stylesheet" href="bower_components/angular-resource-editor/angular-resource-editor.min.css">
```

## Usage example

The easiest way to understant how this module works is to see it in action. In this section, we'll configure it for manage to resources on remote api : category and task.

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

Then you need to configure the mlResources provider
```javascript
app.config(function(mlResourcesProvider) {

    mlResourcesProvider.addResource({
        name: 'categories',
        url: 'api/categories/:id.json', // for more explains, see angular-resource documentation
        url_params: {id: '@id'}, // url parameters for $resource service
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
    
    mlResourcesProvider.addResources({
        name: 'tasks',
        url: 'api/tasks/:id.json', // for more explains, see angular-resource documentation
        url_params: {id: '@id'}, // url parameters for $resource service
        title_list: 'Tasks',
        title_add: 'Add a task',
        title_edit: 'Edit the task',
        question_remove: 'Do you want to remove this task ?',
        fields: [
            {
                label: 'Category',
                model: 'category',
                type: 'select',
                // to_string is called when displaying the item in table element
                to_string: function(item) { 
                    return item.category.name;
                },
                select_resource: {
                    collection: 'categories', // reference to the category resource
                    column: 'name' // category member displaying in option node
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
app.run(function(mlResources) {
    mlResources.init();
});
```

And now, you can edit the resource in dialog box or directly into your template.

### For example in dialog box:

```javascript
var app = angular.module('exampleApp');
app.controller('MainCtrl', ['$scope', 'mlResources', function($scope, mlResources) {

    $scope.openFactoryEditor = mlResources.displayInDialog('factories');
    $scope.openTaskEditor = mlResources.displayInDialog('tasks');
    
}]);
```

### Or displaying the editor directly in an angular template :

You need to use the 'mlResourceEditor' directive with the attribute 'name' containing the name of the resource.

The code for your template :

```html
<div ng-app="ExampleApp">
    <div ml-resource-editor name="factories"></div>
    <div ml-resource-editor name="tasks"></div>
</div>
```