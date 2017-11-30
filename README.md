# jQuery-form-validataion-ajax
This plugin let you send form easly via ajax with validtaions
* Add some extra params without hidden input
* Check form validation before form submit
* Create custom validation
* Send form via ajax when form submit 

## Init

### html
```html
<input type="text" name="firstName" placeholder="First name"
validation="text" validation-text="First name incorrect" required/>
```
#### Attributes
* validation - the name of validation function (you can create your own in addition to the defaults)
* validation-text - this text will show up when the input invalid
* required - if input is required

### JavaScript
```javascript
var send = $('<DOM>').form({
  url: '<AJAX-URL>',
  method: '<METHOD>',
  done: function(data){
    // DO SOMETHING WHEN FORM SENT
    // @data IS AJAX RESPONSE
  }
})
```

#### Add param to the ajax request (hidden input)
Sometimes you want to add special params to the form like UTM etc..
```javascript 
send.addParam({name: '<PARAM-NAME>', value: '<PARAM-VALUE>'});
```

### Validation 
The default validations.

Insert the name of the validation in 'validation' attribute in the html (see Html example)

* israelPhone - Israel phone numbers
* text - only for names (without some signs)
* fullName - for first name & last name in the same input - its use 'text' validation
* email

#### Add custom validation
```javascript
send.addValidation('<CUSTOM-VALIDATION-NAME>', function(value){
    if(value == 'foo'){
        return false; // invalid
    }else{
        return true; // valid
    }
});
```

## Send form
The plugin wait to reglur form submit like: 
```html
<button type="submit">Send</button>
```
After the user push the button the plugin check if all the require inputs is validate.
If form is valid it will send the form via ajax to the url, else it will return error with your validation-text as placeholder.

### Notice
* If input is invalid the plugin add css class - 'inputError' to the input
* You must use jQuery for this plugin
* The 'name' of the input is the GET / POST key for ajax
* Remmember you need to use server validaiton to prevent Hackers attacks
