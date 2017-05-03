"use strict";

/**
 * send form via ajax with validation
 * jquery
 */

(function($){
    // JQUERY IS MUUST
    if(typeof $ === 'undefined') return console.error('jQuery is must for sendForm plugin');

    // DOM binding
    $.fn.form = function(options){
        return new form(this, options);
    }

    function form(jqueryElem, options){
        this.elem = jqueryElem;

        var option = {
            url: null,
            method: null,
            crossDomain: true,
            dataType: 'jsonp',
            done: null
        }

        this.options = $.extend(option, options);
        this.inputs = [];
        this.ok;
        this.click = true; // for prevent dbl sending

        this.noBrowserValidation();
        this.getFields();
        this.inputsObject();
        this.submit();

        return this;
    }

    /**
     * prevent browser validation
     */
    form.prototype.noBrowserValidation = function(){
        this.elem.attr('novalidate', 'novalidate');
    }

    /**
     * get form fields
     * input | select | textarea
     * @retun Object of Array
     */
    form.prototype.getFields = function(){
        var field = {};
        var input = this.elem.find('input');
        var select = this.elem.find('select');
        var textarea = this.elem.find('textarea');
        
        var inputClean = [];
        for(var i = 0 ; i < input.length ; i++){
            inputClean.push(input[i]);
        }
        field.input = inputClean;

        var selectClean = [];
        for(var i = 0 ; i < select.length ; i++){
            selectClean.push(select[i]);
        }
        field.select = selectClean;

        var textareaClean = [];
        for(var i = 0 ; i < textarea.length ; i++){
            textareaClean.push(textarea[i]);
        }
        field.textarea = textareaClean;
        
        return this.fields = field;
    }

    /**
     * input validation function
     */
    form.prototype.validation = {
        israelPhone: function(value){
            var rgx = /^(02|03|04|08|09|05\d|072|073|075|076|077|078)[\-\s{1}]?\d{1}[\-\s{1}]?\d{6}$/;
            var valid = rgx.test(value);
            
            if(valid){
                return true;
            }else{
                return false;
            }
        },
        fullName: function(value){
            var split = value.trim().split(' ');
            if(split.length > 1){
                var valid = true;
                for(var i = 0 ; i < split.length ; i++){
                    valid = this.text(split[i]);
                    if(!valid){
                        return valid;
                    }
                }

                return valid;
            }else{
                return false;
            }
        },
        text: function(value){
            var rgx = /[!@#\$%\^&\*\[\]:;'"<>|+\\]|\d/;
            var valid = rgx.test(value);

            if(!valid){
                if(value.trim().length > 1){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        },
        email: function(value){
            var rgx =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var valid = rgx.test(value);
            
            if(valid){
                return true;
            }else{
                return false;
            }
        }
    }

    /**
     * set array of inputs with their value and property
     * @return Array of Objects
     */
    form.prototype.inputsObject = function(){
        var fields = this.fields;
       
        for(var f in fields){
            for(var i = 0 ; i < fields[f].length ; i++){
                var field = fields[f][i];
              
                if(field && field.name != undefined && field.name.trim().length > 0 && field.type != 'submit'){
                    var obj = {
                        name: field.name,
                        type: f == 'input' ? field.type : f,
                        value: field.value,
                        require: field.hasAttribute('required') ? true : false,
                        validation: field.hasAttribute('validation') ? field.getAttribute('validation') : false,
                        validation_text: field.hasAttribute('validation-text') ? field.getAttribute('validation-text') : false,
                        element: field
                    }

                    this.inputs.push(obj);
                }
            }
        }

        return this.inputs; 
    }

    /**
     * check if input are valid
     * @return Array of Object (update this.inputs)
     */
    form.prototype.inputsValid = function(){
        var inputs = this.inputs;
        
        for(var i = 0 ; i < inputs.length ; i++){
            var input = inputs[i];
            if(input.element) input.value = input.element.value; // get the current value
            if(input.require){
                if(input.validation){
                    var valid = this.validation[input.validation](input.value);
                    input.valid = valid; 
                }else{
                    if(input.value.trim().length > 0){
                        input.valid = true;
                    }else{
                        input.valid = false;
                    }
                }
            }else{
                if(input.validation && input.value.trim().length > 0){
                    var valid = this.validation[input.validation](input.value);
                    input.valid = valid; 
                }else{
                    input.valid = true;
                }
            }
        }
    }

    /**
     * if input not valid - form not will send
     * add element error class
     * add element placeholder error text
     */
    form.prototype.valid = function(){
        var inputs = this.inputs;
        var setValidError = function(input){
            if(!input.element.classList.contains('inputError')){
                input.element.classList.add('inputError');
            }

            var placeholder = input.validation_text;
            var oldVal = input.element.value;

            if(input.element.hasAttribute('placeholder')){
                input.element.value = '';
                if(placeholder) input.element.setAttribute('placeholder', placeholder);

                var focus = function(){
                    input.element.value = oldVal;
                    input.element.removeEventListener('focus', focus);
                }

                input.element.addEventListener('focus', focus);
            }
        }
        
        this.ok = true;
        for(var i = 0 ; i < inputs.length ; i++){
            if(!inputs[i].valid){ 
                setValidError(inputs[i]);
                this.ok = false;
            }else{
                if(inputs[i].element) inputs[i].element.classList.remove('inputError');
            }
        }
    }

    /**
     * add input to send via ajax
     * @param Object
     */
    form.prototype.addParam = function(obj){
        var def = {
            name: null,
            value: null,
            require: false,
            validation: false
        }

        var param = $.extend(def, obj);
        if(param.name != null){
            this.inputs.push(param);
        }

        return this;
    }

    /**
     * add custom validation 
     * @param String (validataion name)
     * @param Object (validataion function)
     */
    form.prototype.addValidation = function(name, object){
        this.validation[name] = object;

        return this;
    }

    /**
     * set object for ajax
     */
    form.prototype.ajaxObjects = function(){
        var ajax = {}
        var inputs = this.inputs;

        for(var i = 0 ; i < inputs.length ; i++){
            ajax[inputs[i].name] = inputs[i].value;
        }

        return this.ajax = ajax;
    }

    /**
     * send ajax
     */
    form.prototype.submit = function(){
        var self = this;

        this.elem.on('submit', function(e){
            e.preventDefault();
            self.inputsValid();
            self.ajaxObjects();
            self.valid();

            if(self.ok && self.click){
                self.click = false;
                $.ajax({
                    type: self.options.method,
                    url: self.options.url,
                    data: self.ajax,
                    crossDomain: self.options.crossDomain,
                    dataType: self.options.dataType
                }).done(function(data){
                    self.options.done(data);
                });
            }
        });
    }

})(jQuery);
