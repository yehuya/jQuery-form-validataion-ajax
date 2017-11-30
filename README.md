# jQuery-form-validataion-ajax
Let you send form easly via ajax with validations
* Add extra parameters to form request without hidden input
* Validate form before submit
* Create custom validation
* Send form via ajax (on submit event)

## Init

### html
```html
<input type="text" name="firstName" placeholder="First name" 
validation="text" validation-text="First name incorrect" required/>
```
#### Attributes
* validation - The name of the validation function (you can create your own validation in addition to the defaults)
* validation-text - The text will show up when input invalid
* required - Input required

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

#### Add param to the ajax request (no hidden input)
Sometimes you want to add special parameters to your request like UTM etc..
```javascript 
send.addParam({name: '<PARAM-NAME>', value: '<PARAM-VALUE>'});
```

### Validation 
The default validations function.

Insert the name of the validation function in 'validation' attribute (see example above)

* israelPhone - Israel phone numbers
* text - Only for names (without some signs)
* fullName - For first name & last name in the same input - same test like 'text' validation
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
The plugin wait to reglur form submit event: 
```html
<button type="submit">Send</button>
```
After the user push the button the plugin validate all the inputs.
If everything ok it will send the form via ajax to the your endpoint url, else it will return error with your validation-text as placeholder.

### Notice
* If input is invalid the plugin add css class - 'inputError' to the input
* You must use jQuery for this plugin
* The 'name' of the input is the GET / POST key for ajax
* Remmember you must use server validaiton to prevent hackers attacks
