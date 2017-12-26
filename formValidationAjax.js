"use strict";

/**
 * send form via ajax with validation
 * we used jquery for $.ajax only
 */

(function(){
    // JQUERY IS MUUST
    if(typeof jQuery === 'undefined') return console.error('jQuery is must for sendForm plugin');

    if(typeof jQuery !== undefined){
        // DOM binding
        jQuery.fn.form = function(options){
            return new form(this, options);
        }
    }

    function form(jqueryElem, options){
        this.elem = jqueryElem;

        this.options = extendImmutable({
            url: null,
            method: null,
            crossDomain: true,
            dataType: 'jsonp',
            done: null
        }, options);
        
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
        this.elem.setAttribute('novalidate', 'novalidate');
    }

    /**
     * get form fields
     * input | select | textarea
     * @retun Object of Array
     */
    form.prototype.getFields = function(){
        this.field = {
            input: [].slice.call(this.elem.getElementsByTagName('input')),
            select: [].slice.call(this.elem.getElementsByTagName('select')),
            textarea: [].slice.call(this.elem.getElementsByTagName('textarea'))
        };
        
        return this.fields;
    }

    /**
     * input validation function
     */
    form.prototype.validation = {
        israelPhone: function(value){
            var rgx = /^(02|03|04|08|09|05\d|072|073|075|076|077|078)[\-\s{1}]?\d{1}[\-\s{1}]?\d{6}$/;  
            return rgx.test(value);
        },
        fullName: function(value){
            var split = value.trim().split(' ');
            if(split <= 1) return false;

            for(var i = 0 ; i < split.length ; i++){
                if(!this.text(split[i])) return false;
            }

            return true;
        },
        text: function(value){
            var rgx = /[!@#\$%\^&\*\[\]:;'"<>|+\\]|\d/;
            return (!rgx.test(value) && value.trim().length > 1);
        },
        email: function(value){
            var rgx =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return rgx.test(value);
        }
    }

    /**
     * set array of inputs with their value and property
     * @return Array of Objects
     */
    form.prototype.inputsObject = function(){
        var fields = this.fields;
       
        for(var f in fields){
            this.inputs.concat(fields[f].map(function(field){
                return {
                    name: field.name,
                    type: f == 'input' ? field.type : f,
                    value: field.value,
                    require: field.hasAttribute('required') ? true : false,
                    validation: field.hasAttribute('validation') ? field.getAttribute('validation') : false,
                    validation_text: field.hasAttribute('validation-text') ? field.getAttribute('validation-text') : false,
                    element: field
                }
            }));
        }

        return this.inputs; 
    }

    /**
     * check if input are valid
     * @return Array of Object (update this.inputs)
     */
    form.prototype.inputsValid = function(){        
        for(var i = 0 ; i < this.inputs.length ; i++){
            var input = this.inputs[i];
            if(input.element) input.value = input.element.value; // get the current value

            if(input.require){
                if(input.validation) {
                    input.valid = this.validation[input.validation](input.value);
                }else{
                    input.valid = input.value.trim().length > 0;
                }
            }else{
                if(input.validation && input.value.trim().length > 0){
                    input.valid = this.validation[input.validation](input.value);
                }else{
                    input.valid = true;
                }
            }
        }
    }

    /**
     * show / hide error on input
     * @param Object 
     */
    form.prototype.setValidError = function(input){
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

    /**
     * if input not valid - form not send
     * add element error class
     * add element placeholder error text
     */
    form.prototype.valid = function(){
        var inputs = this.inputs;
        
        this.ok = true;
        for(var i = 0 ; i < inputs.length ; i++){
            if(!inputs[i].valid){ 
                this.setValidError(inputs[i]);
                this.ok = false;
                continue;
            }
            
            if(inputs[i].element) inputs[i].element.classList.remove('inputError');
        }
    }

    /**
     * add input to send via ajax
     * @param Object
     */
    form.prototype.addParam = function(obj){
        var param = extendImmutable({
            name: null,
            value: null,
            require: false,
            validation: false
        }, obj);

        if(param.name) this.inputs.push(param);

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
        var ajax = {};
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

        this.elem.addEventListener('submit', function(e){
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

    function extendImmutable(source, target){
        var res = {};
        for(var f in source){
            res[f] = target.hasOwnProperty(f) ? target[f] : source[f];
        }
    
        return res;
    }

})();
