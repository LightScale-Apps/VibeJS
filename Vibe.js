Vibe = {
	_eval:function(str,ctrl){
 		for(var prop in ctrl) {
   			str = str.replace(new RegExp('{{'+prop+'}}','g'), ctrl[prop]);
		}
 		return str;
	},
	_parse:function(scope){
		var nodes = scope.childNodes;
		var ret = {}

		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].tagName) {
				if (nodes[i].childNodes[0].tagName) {
					ret[nodes[i].tagName.toLowerCase()] = Vibe._parse(nodes[i])
				} else {
					ret[nodes[i].tagName.toLowerCase()] = nodes[i].innerHTML
				}
			}
		}

		return ret;
	},
	controller:function(name, func){
		Vibe.memory.controllers[name] = {}
		Vibe.memory.controllers[name].data = (typeof func == 'function') ? func({}) : Vibe._parse(func)
		Vibe.memory.controllers[name].name = name
		if (!(typeof func == 'function')) {
			var attrs = func.attributes
			for (var j = 0; j < attrs.length; j++) {
				if (attrs[j].name.startsWith("vb-")) Vibe.memory.controllers[name][attrs[j].name.replace("vb-", "")] = attrs[j].value
			}
		}	
		return Vibe.memory.controllers[name]
	},
	template:function(name, html){
		Vibe.memory.templates[name] = {} 
		Vibe.memory.templates[name].data = (typeof html == "string") ? html : html.innerHTML
		Vibe.memory.templates[name].name = name
		if (!(typeof html == 'string')) {
			var attrs = html.attributes
			for (var j = 0; j < attrs.length; j++) {
				if (attrs[j].name.startsWith("vb-")) Vibe.memory.templates[name][attrs[j].name.replace("vb-", "")] = attrs[j].value
			}
		}	
		return Vibe.memory.templates[name]
	},
	memory:{templates:{},controllers:{}},
	init:function(){
		var objects = document.querySelectorAll("[vb-name]")
		for (var i = 0; i < objects.length; i++) {
			var objtype = objects[i].getAttribute("vb-type") ? objects[i].getAttribute("vb-type") : objects[i].tagName
			objtype = objtype.toLowerCase()

			switch(objtype){
				case "template":
					Vibe.memory.templates[objects[i].getAttribute("vb-name")] = {data:objects[i].innerHTML,name:objects[i].getAttribute("vb-name")}
					var attrs = objects[i].attributes
					for (var j = 0; j < attrs.length; j++) {
						if (attrs[j].name.startsWith("vb-")) Vibe.memory.templates[objects[i].getAttribute("vb-name")][attrs[j].name.replace("vb-", "")] = attrs[j].value
					}
					break;
				case "controller":
					Vibe.memory.controllers[objects[i].getAttribute("vb-name")] = {data:Vibe._parse(objects[i]),name:objects[i].getAttribute("vb-name")}
					var attrs = objects[i].attributes
					for (var j = 0; j < attrs.length; j++) {
						if (attrs[j].name.startsWith("vb-")) Vibe.memory.controllers[objects[i].getAttribute("vb-name")][attrs[j].name.replace("vb-", "")] = attrs[j].value
					}
			}
		}


		var targets = []
		var types = ["templates", "controllers"]
		for (i = 0; i < types.length; i++) {
			var location = Vibe.memory[types[i]]
			for (id in location) {
				if (location[id].target != "") targets.push({d:location[id],t:types[i]})
			}
		}
		for (i = 0; i < targets.length; i++) {
			for (var o = 0; o < targets[i].d.target.split(" ").length; o++) {
				var loads = document.querySelectorAll(targets[i].d.target.split(" ")[o])
				for (var j = 0; j < loads.length; j++) {
					switch(targets[i].t){
						case "templates":
							loads[j].setAttribute("vb-load", targets[i].d.name)
							break;
						case "controllers":
							loads[j].setAttribute("vb-controller", targets[i].d.name)
							break;
					}
				}
			}
		}

		var loads = document.querySelectorAll("[vb-load]")
		for (i = 0; i < loads.length; i++) {
			loads[i].innerHTML += Vibe.memory.templates[loads[i].getAttribute("vb-load")].data
		}

		var ctrls = document.querySelectorAll("[vb-controller]")
		for (i = 0; i < ctrls.length; i++) {
			ctrls[i].innerHTML = Vibe._eval(ctrls[i].innerHTML, Vibe.memory.controllers[ctrls[i].getAttribute("vb-controller")].data )
		}

		var inlineCtrl = document.querySelectorAll("[vb-type='controller']:not([vb-name]), controller:not([vb-name])")
		for (i = 0; i < inlineCtrl.length; i++) {
			var control = Vibe._parse(inlineCtrl[i])
			inlineCtrl[i].innerHTML = ""
			inlineCtrl[i].parentNode.innerHTML = Vibe._eval(inlineCtrl[i].parentNode.innerHTML, control)
		}


		

	}
}



