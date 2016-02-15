(function($){
    "use strict";

    $.fn.serializeObject = function(){

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push":     /^$/,
                "fixed":    /^\d+$/,
                "named":    /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value){
            base[key] = value;
            return base;
        };

        this.push_counter = function(key){
            if(push_counters[key] === undefined){
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function(){

            // skip invalid keys
            if(!patterns.validate.test(this.name)){
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while((k = keys.pop()) !== undefined){

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if(k.match(patterns.push)){
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if(k.match(patterns.fixed)){
                    merge = self.build([], k, merge);
                }

                // named
                else if(k.match(patterns.named)){
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };

    window.gifCarregando = '<img id="gifCarregando" src="img/ajax-loader-overlayer.gif" />';
    window.carregando = '<div id="overlayer" class="transparent_class">' + window.gifCarregando + '/div>';    

    $.doAjaxJson = function(options){

    	doAjaxUtils(options, JSON.stringify(options.data), 'application/json; charset=UTF-8');

    };

    $.doAjaxForm = function(options){

    	doAjaxUtils(options, $.param(options.data), 'application/x-www-form-urlencoded; charset=UTF-8');

    };

    function doAjaxUtils(options, data, contentType) {

    	var $container = $(options.container);
    	$.ajax({
    		type: 'POST',
    		url: options.url,
    		data: data,
    		async : options.async == null ? true : options.async,
    		dataType: 'json',
    		processData: false,
    		contentType: contentType,
    		beforeSend: function(){
    			$container.hide();
    			$container.before(window.gifCarregando);
                options.beforeSend && options.beforeSend();
                
                if (options.overlayer) {
                	$('#overlayer').show();
                }                
    		},
    		success: options.success,
    		complete: function(jqXHR){
    			$container.parent().find('#gifCarregando').remove();
    			$container.show();
                options.complete && options.complete(jqXHR);
                
                if (options.overlayer) {
                	$('#overlayer').hide();
                }
    		},
    		error : function(jqXHR, textStatus, errorThrown) {
    			if (options.error){
                    options.error(jqXHR);
                } else {
                    document.body.innerHTML = jqXHR.responseText;
                }
    		}
    	});

    };

    $.download = function(args) {
    	var url    = args.url;
    	var data   = args.data || {};
    	var method = args.method || 'POST';

    	if( url && data ) {
    		var inputs = '';
    		for(var i in data) {
    			if($.isArray(data[i])) {
    				for(var j in data[i]) {
    					if(data[i][j]) {
    						inputs+='<input type="hidden" name="'+ i.replace(/\[|\]/ig, '') +'" value="'+ data[i][j] +'" />';
    					}
    				}
    			} else {
    				if(data[i]) {
    					inputs+='<input type="hidden" name="'+ i +'" value="'+ data[i] +'" />';
    				}
    			}
    		}
    		$('<form action="'+ url +'" method="'+ method +'">'+inputs+'</form>').appendTo('body').submit().remove();
    	}
    };

})(jQuery);

