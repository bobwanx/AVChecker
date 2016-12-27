/*  
 *  Plug-in template for you, 
 *  do whatever you want. Have fun :)
 */
((function (sandbox){
  	function MyAnalysis(){
      	var trace = []
  		var cbFun_list = []
        var event_list = []
        var fun_list = []
		var curEve = ''
        var curHandle = ''
        var formTag = ''
		
		function add2Trace(){
			var ele = {}
			var event = {}
            
			switch(arguments[arguments.length-1]){
				case 'XHR':                	
					ele = {
						_id : arguments[0],
						attr : arguments[1],
						attr_val : arguments[2],
						type : arguments[arguments.length-1]
					}
                    if(curHandle == '' ){
                    	getEventWithOutHandle(ele)
                    }
					break
				case 'EventHandler':
                	curEve = ''
					ele = {
						_id : arguments[0],
						event_type : arguments[1],
						target : arguments[2],
						state : arguments[3],
						type : arguments[arguments.length-1]
					}
        			curHandle = ele
					if(arguments[3] == 'start'){
						event = {
							_id : ele._id,
							target : ele.target,
							first_index : trace.length 
						}
                        if(event_list.length > 0){
                        	checkXHREve(event)
                        }
                      	event_list.push(event)
					}else if(arguments[3] == 'end'){
                      	curHandle = ''
                        if(event_list.length > 0){
                        	event = event_list.pop()
                            event.last_index =  trace.length 
                            event_list.push(event)
                            getEventHandleSource()	
                        }
					}
					break
				case 'cbFun':
					ele = {
						_id : arguments[0],
						name : arguments[1].name ||'anonymous',
						type : arguments[arguments.length-1]
					}
                    if(event_list.length > 0){
                        curEve = getEventByCB(arguments[1])
                        var cbEve = clone(curEve)
                        var curXHR = clone(cbEve.XHR)
                        curXHR.readyState = 4
                        cbEve.XHR = curXHR
                        event_list.push(cbEve)
                    }
					break
				case 'Fun':
                	curEve = ''	
					ele = {
						_id : arguments[0],
						name : arguments[1],
						type : arguments[arguments.length-1]
					}
                    if(curHandle == '' ){
                    	gatherFunWithOutHandle(ele)
                    }
					break
				case 'DOMElement':
                	switch (arguments[1]){
                    	case 'form':
                        	formTag = arguments[2]
                            ele = {
                                _id : arguments[0],
                                f_name : arguments[1],
                                args : arguments[2],
                                type : arguments[arguments.length-1]
                            }
                            break
                    	case 'ele':
                        	var pre = ''
                            if(formTag){
                              	pre = formTag + '.'
                           	} 
                        	ele = {
                              _id : arguments[0],
                              f_name : arguments[1],
                              args : pre + arguments[2],
                              type : arguments[arguments.length-1]
                            }
                        	formTag = ''
                            break
                        default:
                        	ele = {
                                _id : arguments[0],
                                f_name : arguments[1],
                                args : arguments[2],
                                type : arguments[arguments.length-1]
                            }
                    }
                    if(curEve ){
                        var cbEve = event_list.pop()
                      	var cb_html_list = cbEve.cbHandleSource || []
                        cb_html_list.push(ele.args)	
                        cbEve.cbHandleSource = cb_html_list
						checkCbSource(cbEve)
                        event_list.push(cbEve)
					}
					break
				default:
					ele = {}	
			}
			trace.push(ele)	
            //console.log(event_list)
            //console.log(fun_list)
		}
      	/*		A FUNCTION TO GATHER THE FUNCTION WHITOUT A HANDLE WHICH ALSO COULD BE A EVENT 
         *		ARGUMENTS: CURRENT FUNCTION
         *      RETURN:  EVENT
         */
      	var eveNoHan = ''
        function gatherFunWithOutHandle(curFun){
            if(curFun.name !== 'anonymous'){
                eveNoHan = getFunByFunName(curFun)
                if(eveNoHan){
                    eveNoHan.last_index = trace.length
                    fun_list.push(eveNoHan)
                }else{
                    eveNoHan = {}
                    eveNoHan._id = curFun._id
                    eveNoHan.first_index = trace.length
                    eveNoHan.target = curFun._id
                    eveNoHan.last_index = trace.length
                    eveNoHan.name = curFun.name
                    fun_list.push(eveNoHan)
                }
            }
        }
      	/*		A FUNCTION TO GET THE RELATED FUNCTION BY FUNCTION NAME 
         *		ARGUMENTS: FUNCTION NAME
         *      RETURN:  EVENT
         */
        function getFunByFunName(curFun){
          	var fName = curFun.name
            var iid = curFun._id
            var result = ''
            if(fun_list.length == 0 ) return ''
            for(var i =0 ;i<fun_list.length;i++ ){
                if(fun_list[i].name == fName){
                    var pre_list , last_list
                    if(i == 0){
                    	pre_list = []
                    }else{ 
                    	pre_list = fun_list.slice(0,i)
                    }
                    if(i == fun_list.length-1){
                    	last_list = []
                    }else{ 
                    	last_list = fun_list.slice(i+1)
                    }
                    if(fun_list[i]._id !== iid){
                      	result = fun_list[i]
                    }
                    fun_list = pre_list.concat(last_list)     
                    break
                }
            }
            return result
        }
      	/*		A FUNCTION TO GET THE RELATED EVENT WHICH DO NOT HAVE A HANDLE
         *		ARGUMENTS: XHR ELEMENTS
         *      RETURN:  EVENT
         */
        var XHRTag
        function getEventWithOutHandle(curEle){
            switch(curEle.attr){
              case 'open':
                  XHRTag = trace.length
                  break  
              case 'send':
                  var fun = getXHRFun(XHRTag)
                  if(fun){
                      var event = {
                          _id : fun._id,
                          target : fun.target,
                          first_index : fun.first_index,
                          last_index : fun.last_index
                      }
                      if(event_list.length > 0){
                      	  checkXHREve(event)
                      }
                      event_list.push(event) 
                      getEventHandleSource()	
                  }
                  break
              default:
            }
        }
      	/*		A FUNCTION TO GET THE RELATED FUNCTION BY A XHR OPEN TAG
         *		ARGUMENTS: XHRTAG
         *      RETURN:  EVENT
         */
        function getXHRFun(index){
            if(fun_list.length ==0) return ''
            for(var i in fun_list){
                if(fun_list[i].first_index< index && fun_list[i].last_index>index) return fun_list[i]
            }
            return ''
        }
      
		/* 		A CHECKER TO FIND IF TWO EVENTS EMITED BY THE SAME ELEMENT FROM HTML
         *		ARGUMENTS: CURRENT EVENT
         *      RETURN: ERROR(IF THE RESULT EVENT'S readyState IS 1 )
         * 				WARNING(IF THE RESULT EVENT'S readyState IS 4 )
         */
		function checkXHREve(curEve){
            for(var i = event_list.length-1;i>-1;i--){
                if(event_list[i]._id == curEve._id && event_list[i].first_index !== curEve._id.first_index ){                  
                  	if(event_list[i].XHR.readyState == 1){
                      console.log('==================ERROR=================')
                      console.log('||                                    ||')
                      console.log('||  The same HTML target emit Event   ||')
                      console.log('||                                    ||')
                      console.log('========================================')
                      break
                    }else{
                      console.log('================WARNING=================')
                      console.log('||                                    ||')
                      console.log('||  The same HTML target emit Event   ||')
                      console.log('||                                    ||')
                      console.log('========================================')	
                      break
                    }
                }
            }
		}
		/* 		A CHECKER TO FIND IF TWO EVENTS HTML HANDLE SOURCE CONTAIN SAME ELEMENTS
         *		ARGUMENTS: CURRENT EVENT
         *      RETURN: ERROR(IF THE RESULT EVENT HAPPEN FIRST )
         * 				WARNING(IF THE RESULT EVENT HAPPEN LAST )
         */
      	function checkCbSource(curEve){
            if(hasInterEle(curEve).result){
              	var preIndex = hasInterEle(curEve).eve.first_index
                var curIndex = curEve.first_index
                if(curIndex < preIndex){
                	console.log('=================ERROE==================')
                    console.log('||                                    ||')
                    console.log('||  HTML SOURCE ATOMICITY VIOLATION   ||')
                    console.log('||                                    ||')
                    console.log('========================================') 
                }else{
                	console.log('================WARNING=================')
                    console.log('||                                    ||')
                    console.log('||  HTML SOURCE ATOMICITY VIOLATION   ||')
                    console.log('||                                    ||')
                    console.log('========================================')                
                } 
            }
        }
		/*		A FUNCTION TO FIND IF TWO EVENTS HTML HANDLE SOURCE CONTAIN SAME ELEMENTS
         *		ARGUMENTS: CURRENT EVENT
         *      RETURN: RESULT EVENT
         */
        function hasInterEle(curEve){
          	var obj = {
                result : false,
              	eve : {}
          	}
            for(var i = event_list.length -1 ;i>-1;i--){
              if(event_list[i]._id !==curEve._id && event_list[i].cbHandleSource){
                var pre_list = event_list[i].cbHandleSource
                var cur_list = curEve.cbHandleSource
                if(curEve.handleSource){
                	cur_list = curEve.handleSource.concat(curEve.cbHandleSource)
                }
                var result = false
                for(var m = 0;m<cur_list.length;m++){
                  for(var n = 0;n<pre_list.length;n++){
                    if(cur_list[m] == pre_list[n]){
                      result = true
                      break
                    }
                  }
                }
                if(result){
                	obj.result = result
                    obj.eve = event_list[i]  
                    break
                }
              }
            }
			return obj
		}                                  
        /* 		A FUNCTION TO GET EVENT HANDLE SOURCE IF EXISTS THEN UPDATE THE RELATED EVENT 
         *		ARGUMENTS: 
         *      RETURN: 
         */                                                                                     
		function getEventHandleSource(){
            if(event_list.length > 0){
                var event = event_list.pop()
                var HTMLDocument = []
                var start = event.first_index
                var end = event.last_index
                event_list.push(event)
                event = event_list.pop()
                for(var i = start;i<end;i++){
                    var curEle = trace[i]
                    switch(curEle.type){
                        case 'XHR':
                            var attr = curEle.attr
                            var curXHR = event.XHR || {}
                            curXHR[attr] = curEle.attr_val
                            event.XHR = curXHR
                            break
                        case 'DOMElement':
                            var html_list = event.handleSource || []
                            html_list.push(curEle.args)
                            event.handleSource = html_list
                            break
                        case 'Fun':
                            if(curEle.name){
                              	var funName = curEle.name
                                removeEveFun(funName)
                            }
                            break
                        default:	
                    }
                }
                if(event.XHR){
                    event_list.push(event)
                }
            }
		}
      	/* 		A FUNCTION TO REMOVE THE FUNCTION FORM FUN_LIST CHICH WAS INCLUDED IN A EVE
         *		ARGUMENTS: FUNCTION NAME
         *      RETURN: 
         */
        function removeEveFun(name){
          	if(fun_list.length == 0 ) return ''
            for(var i =0 ;i<fun_list.length;i++ ){
                if(fun_list[i].name == name){
                    var pre_list , last_list
                    if(i == 0){
                    	pre_list = []
                    }else{ 
                    	pre_list = fun_list.slice(0,i)
                    }
                    if(i == fun_list.length-1){
                    	last_list = []
                    }else{ 
                    	last_list = fun_list.slice(i+1)
                    }
                    fun_list = pre_list.concat(last_list)  
                    break
                }
            }
        }
		/* 		A FUNCTION TO GET RELATED EVENT BY CURRENT CALLBACK
         *		ARGUMENTS: CURRENT CALLBACK
         *      RETURN: EVENT
         */ 
		function getEventByCB(cb){
			for(var i =0;i< event_list.length;i++){
				if(event_list[i].XHR.onreadystatechange && event_list[i].XHR.onreadystatechange == cb){   
					return event_list[i]
				}
			}
		}
      	/* 		A FUNCTION TO CLONE THE CURRENT OBJECT
         *		ARGUMENTS: CURRENT OBJECT
         *      RETURN: CLONED OBJECT
         */ 
      	function clone(obj){
        	if(typeof obj ==='undefined') return null
        	var newObj ={}
       		for(var i in obj){
           		newObj[i] = obj[i]
            }
          	return newObj
        }
		/* 		A FUNCTION TO GET CHANGED ELEMENT IN COOKIE
         *		ARGUMENTS: CURRENT COOKIE
         *      RETURN: ELEMENT
         */ 
      	function getChangeCookie(newCookie){
          	var result = []
            if(tempCookie){
                for(var i =0;i<newCookie.length;i++){
                    if(tempCookie.indexOf(newCookie[i]) < 0){
                      	result.push(newCookie[i])
                    }
                }
            }else{
              	result = newCookie
            }
          	return result
        }
      	// called before setting field to an entity (e.g., object, function etc.)
		// base is the entity, offset is the field name, so val === base[offset]
		// should return val
      	var tempCookie 
		this.putFieldPre = function (iid, base, offset, val) {
          	if(base.constructor.toString().indexOf('HTMLDocument')> -1 && offset =='cookie'){
                if(base[offset] !== ''){
                	tempCookie = base[offset].split(';')
                }
            }
			return val;
		}
		// called during setting field
		// should return val
		this.putField = function (iid, base, offset, val) {
            if(base.constructor.toString().indexOf('XMLHttpRequest')>-1 && offset == 'onreadystatechange'){
                if(!isContain(val)){
                    cbFun_list.push(val)
                    console.log('XHR :{iid : ' +iid+',attr :'+ offset + ", value : " + typeof val + '}')
                    add2Trace(iid, offset, val ,'XHR')
                }         
            }else if(base.constructor.toString().indexOf('HTMLDocument')> -1 && offset =='cookie'){
                var cookie = val.split(';')
                var changeCookie = getChangeCookie(cookie)
                for(var i =0;i<changeCookie.length;i++){
                  	console.log('cookie :{iid : ' +iid+',attr :'+ changeCookie[i].split('=')[0] + ", value : " + changeCookie[i].split('=')[1] + '}')
               		add2Trace(iid, offset, offset ,'DOMElement')
              	}
            }
          
            return val;
		}
        /* 		A FUNCTION TO CHECK IF CURRENT CALLBACK IS IN THE LIST
         *		ARGUMENTS: CURRENT CALLBACK
         *      RETURN: BOOLEAN
         */
        function isContain(target){
            var l = cbFun_list.length
            var result = false
            if(l == 0){
              	result = false
            }else{
                for(var i = 0; i < l;i++){
                    if(cbFun_list[i] == target){
                      	result = true
                    }
                } 
            }
            return result
        }

		// during retrieving field from an entity
		this.getField = function  (iid, base, offset, val) {
            if(typeof base !== 'undefined' && typeof base != null){
                if(base.constructor.toString().indexOf('XMLHttpRequest')> -1){
                    console.log('XHR :{iid : ' +iid+',attr :'+ offset + ", value : " + val + '}')
                    add2Trace(iid, offset, val ,'XHR')
                }else if(base.constructor.toString().indexOf('HTMLDocument')> -1 && val && val.toString().indexOf('HTMLFormElement')> -1 ){
                	console.log('formEle :{iid : ' +iid+',attr :'+ offset + ", value : " + val + '}'+base)
                    add2Trace(iid, 'form', offset ,'DOMElement')
                }else if(base.constructor.toString().indexOf('HTMLFormElement')> -1 && val && val.toString().indexOf('HTMLInputElement')> -1){
                	console.log('formEle :{iid : ' +iid+',attr :'+ offset + ", value : " + val + '}')
                    add2Trace(iid, 'ele', offset ,'DOMElement')
                }
            }
            return val;
		}
        /* 		A FUNCTION TO CONFIRM IF CURRENT FUNCTION IS CALLED BY A EVENTHANDLER
         *		ARGUMENTS: CURRENT FUNCTION
         *      RETURN: BOOLEAN
         */ 
        var	EVENTHANDLER = ['onclick','onload','onsubmit','onunload']
        function isEventHandler(args){
          	var result = false
          	var caller = args.callee.caller.name
            for(var i =0;i< EVENTHANDLER.length;i++){
              	if(EVENTHANDLER[i] == caller){
               		result =true
                    break
                }
            }
        	return result
        }
		// before invoking a function/method
        this.invokeFunPre = function  (iid, f, base, args, isConstructor) {		  
            if(args.callee.caller.name && isEventHandler(args)){    
                console.log('EventHandler: {iid : ' + iid + ',type : onclick , state : start ,target : ' + args.callee.caller.arguments[0].target +'}')
                add2Trace(iid, 'onclick', args.callee.caller.arguments[0].target ,'start', 'EventHandler')
            }
		}

		// during invoking a function/method
		// val is the return value and should be returned
		this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            if(isContain(args.callee.caller)){
                console.log('cbFun: {iid : ' + iid + ',name : ' + args.callee.caller.name +'}') 
                add2Trace(iid, args.callee.caller ,'cbFun')
            }else if(args.callee.caller.name && isEventHandler(args) ){
                console.log('EventHandler: {iid : ' + iid + ',type : onclick, state : end ,target:' + args.callee.caller.arguments[0].target +' }')
                add2Trace(iid, 'onclick', args.callee.caller.arguments[0].target ,'end', 'EventHandler')
            }else {
              	console.log('Fun: {iid : ' + iid + ',name : ' + args.callee.caller.name + '}')
                add2Trace(iid, args.callee.caller.name || 'anonymous' ,'Fun')
            }
            if(f.name === 'alert'){
              	console.log('DOMElement : {iid : ' +iid+',fName : alert ,args : ' + args[0] + '}')
				add2Trace(iid, 'Window' , 'GLOBAL', 'DOMElement')
            }
            if(base.constructor.toString().indexOf('HTMLDocument')> -1){
                console.log('DOMElement : {iid : ' +iid+',fName :' + f.toString().split('function')[1].split('(')[0] + ",args : " + args[0] + '}')
                add2Trace(iid, f.toString().split('function')[1].split('(')[0] , args[0] || '', 'DOMElement')
            }
            return val;
		}		
			
		// called during reading a variable, 
		// val is the read value, do not forget to return it
		this.read = function read (iid, name, val, isGlobal) {
            if(typeof val === 'function' && name !== 'alert'){
				console.log('Fun: {iid : ' + iid + ',name : ' + name + '}')
                add2Trace(iid, name ,'Fun')
            }
            if(typeof val === 'object' && val.toString().indexOf('HTMLFormElement') > -1){
              	console.log('formEle :{iid : ' +iid+',attr :'+ name + ", value : " + val + '}')
                add2Trace(iid, 'form', name ,'DOMElement')
            }
			return val;
		}
        
        // called during writing a variable
		// val is the value to be written, do not forget to return it
		this.write = function write (iid, name, val) {
          	//console.log(name + '||'+val)
			return val;
		}
      
        // before getting a conditional expression evaluation
		this.conditionalPre = function (iid, left) {
        	 
		}

		// during a conditional expression evaluation
		// result_c is the evaluation result and should be returned
		this.conditional = function (iid, left, result_c) {
	        //console.log('condition:' + left + result_c) 	
			return !result_c;
		}
      	
	}
	sandbox.analysis = new MyAnalysis();
  	
})(J$));
		
	