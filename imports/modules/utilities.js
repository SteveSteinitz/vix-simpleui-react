// Created by steinitz on 06 Sep 2016

// DT = {};
export const DT = {}; // (typeof DT === 'undefined') ? {} : DT;

// use in logging e.g. console.log (DT.callerName () + "blah blah")
// doesn't work for anonymous functions, obviously
DT.callerName = function callerName ()
{
	// return callerName.caller.name + " - ";
let stack = new Error().stack,
	caller = stack.split('\n')[2];
	caller = caller.split('(')[0].trim ();
	caller = caller.split(' ');

	let isConstructor = false;
	// constructor stack frames currently start with 'at new - this is fragile'
	if (caller [caller.length - 2].trim () === 'new')
	{
		isConstructor = true;
	}

	caller = caller [caller.length - 1].trim ();

	if (isConstructor)
	{
		caller = `${caller}.constructor`;
	}

	const result =  `${caller} - `;
	return result;
};

// merge objects
DT.mergeRecursive =
function mergeRecursive (obj1, obj2)
{
	for (const p in obj2)
	{
		try
		{
			// Property in destination object set; update its value.
			if (obj2 [p].constructor == Object)
			{
				obj1 [p] = mergeRecursive (obj1 [p], obj2 [p]);
			}
			else
			{
				obj1 [p] = obj2 [p];
			}
		}
		catch (e)
		{
			obj1 [p] = obj2 [p];	// Property in destination object not set; create it and set its value.
		}
	}
	return obj1;
};

//	Loops through arrays but, unlike forEach, it can wait for callbacks to finish - i.e. it's synchronous

DT.recursiveArray = {};
// DT.recursiveArray.next = null;
DT.recursiveArray.loop =
function recursiveArrayLoop (array, onContinue, onFinish)
{
const arrayLength = array.length;
	DT.recursiveArray.next =
	function recursiveArrayNext (arrayIndex)
	{
		if (arrayIndex >= arrayLength)
		{
			if (onFinish)
			{
				onFinish (array);
			}
			// console.log ("DT.recursiveArray.next - exiting (calling return) for index = " + arrayIndex);
			return;
		}
		//console.log ("DT.recursiveArray.next - calling " + onContinue.name);
		onContinue (array, arrayIndex);
		//console.log ("DT.recursiveArray.next - leaving at end of function for index = " +arrayIndex);
	};
	DT.recursiveArray.next (0);
	//console.log ("DT.recursiveArray.loop - leaving at end of function");
};
/*	Usage example given an array of data, theHabitDataArray, to create Habits:
	function createHabit (dataArray, arrayIndex)
	{
		var habitData = dataArray [arrayIndex];
		doCreateHabit (
			habitData,
			function () // doCreateHabit needs to call this on completion
			{
				DT.recursiveArray.next (arrayIndex + 1);
			}
		);
	}
	DT.recursiveArray.loop (theHabitDataArray, createHabit); */

DT.SimpleVar = function ()
{
	this.get = function ()
	{
		return this.value;
	};
	this.set = function (aValue)
	{
		this.value = aValue;
	};
};

DT.bootstrapColumnsWithWidth =
function bootstrapColumnsWithWidth (width, centered)
{
let result = `col-lg-${width} col-md-${width} col-sm-${width} col-xs-${width}`;
	if (centered)
	{
		result = `${result} center-block`; // doesn't seem to do anything
		//console.log ("DT.bootstrapColumnsWithWidth - centering");
	}
	return result;
};

DT.bootstrapColumnOffset =
function bootstrapColumnOffset (offset)
{
	const result = `col-lg-offset-${offset} col-md-offset-${offset} col-sm-offset-${offset} col-xs--offset-${offset}`;
	return result;
};

DT.getTemplateInstanceValue =
function getTemplateInstanceValue (key)
{
	let result;
	const templateInstance = Template.instance();
	if (templateInstance)
	{
		const templateInstanceData = templateInstance.data;
		{
			if (templateInstanceData)
			{
				result = templateInstanceData[key];
			}
		}
	}
	return result;
};

// useful for debugging when breakpoints don't work and  JSON.stringify fails with a 'circular structure' error
DT.stringifyTopKeys =
function stringifyTopKeys (theObject)
{
let result = "no object";
	if (theObject)
	{
		result = "";
	const keys = Object.keys (theObject);
		keys.forEach (
			(aKey) => {
			const keyString = `${aKey}: ${theObject[aKey]}\n`;
				result += keyString;
			}
		);
	}
	return result;
};

// *** This crashed Chrome

// Traverses a javascript object, and deletes all circular values
// Allows JSON.stringify (DT.preventCircularJson (troublesomeObject))
// @param source object to remove circular references from
// @param censoredMessage optional: what to put instead of censored values
// @param censorTheseItems should be kept null, used in recursion
// @returns non-circular object

DT.PreventCircularJsonMaxDepth = 8;
DT.preventCircularJson =
function preventCircularJson (source, censoredMessage_, censorTheseItems_, depth_)
{
	// SJS: preceded these two with var
const censorTheseItems	= censorTheseItems_ || [source];		// init recursive value if this is the first call
const censoredMessage 	= censoredMessage_ || "Circular Ref";	// default if none is specified
const recursiveItems	= {};									// values that have allready apeared will be placed here:
const result			= {};									// initiate a censored clone to return back
	//if (depth_ <= DT.PreventCircularJsonMaxDepth)				// bail if too deep
	{
	 // traverse the object:
		for (var key in source)
		{
		const value = source [key];
			if (typeof value === "object")
			{
			 // re-examine all complex children again later:
				recursiveItems [key] = value;
			}
			else
			{
				result [key] = value;							  // simple values copied as is
			}
		}
	 // create list of values to censor:
	const censorChildItems = [];
	for (var key in recursiveItems)
	{
		const value = source [key];
			censorChildItems.push (value);						// all complex child objects should not appear again in children:
	}
	 // censor all circular values
	for (var key in recursiveItems)
	{
		let value	   = source [key];
		let censored	= false;
			censorTheseItems.forEach (
				(item) => {
					if (item === value)
					{
						censored = true;
					}
				}
			);
			if (censored)
			{
				value = censoredMessage;						  // change circular values to this
			}
			else
			{													 // recursive
				//if (DT.PreventCircularJsonMaxDepthdepth_ > depth_)// bail if too deep
					value = preventCircularJson (value, censoredMessage, censorChildItems.concat (censorTheseItems), depth_ + 1);
				//else
					//value = "too deep";
			}
			result [key] = value;
		}
	}
	return result;
};

DT.datePickerRajitFormat 	= "dd M yyyy";
DT.datePickerTsegaFormat	= "DD MMM YYYY";
DT.dateMomentFormat 		= 'DD MMM YYYY';
DT.timestampMomentFormat 	= 'DD MMM YYYY HH:mm a';

DT.stringToNiceDateFormat =
function stringToNiceDateFormat (dateString)
{
const javaDate 	= new Date (dateString);
const result 		= DT.dateToNiceDateFormat (javaDate);
	return result;
};

DT.dateToNiceDateFormat =
function dateToNiceDateFormat (date)
{
const result 		= moment (date).format (DT.dateMomentFormat);
	return result;
};


/*
function arrayUniquer (array_)
{
	var result = [];
	$.each (
		array_,
		function (i, e)
		{
			if ($.inArray(e, result) == -1) result.push(e);
		}
	);
	return result;
}
*/

DT.stackTrace =
function DTStackTrace (numberOfLines, shortenLines)
{
let stack;
	try
	{
		throw new Error ('');
	}
	catch (error)
	{
		stack = error.stack || '';
	}
	stack = stack.split ('\n').map (
		line => line.trim ()
	);
	let result = stack.splice (stack[0] == 'Error' ? 2 : 1);
	if (numberOfLines)
	{
		result = result.slice (0, numberOfLines);
	}
	if (shortenLines)
	{
		result.forEach (
			(string, index, array) => {
				string			= string.replace (/\s*\(.*?\)\s*/g, '');
				string			= string.replace (/\s*\[.*?\]\s*/g, '');
				const n 		= string.indexOf('?');
				string 			= string.substring (0, n != -1 ? n : string.length);
				string 			= string.replace ("http://localhost:3000/", '');
				string			= string.replace ("at ", `${index}. `);
				array [index] 	= string;
			}
		);
	}
	console.log (result.join ('\n'));
};

DT.showWarningAlert =
function DTShowWarningAlert (title, message)
{
	const savedBertHideDelay = Bert.defaults.hideDelay;
	Bert.defaults.hideDelay = 21000;
	Bert.alert (
		{
			type: 		'warning',
			style: 		'fixed-bottom',
			title,
			message,
			icon: 		'fa-remove'
		}
	);
	Bert.defaults.hideDelay = savedBertHideDelay;
};

DT.showSuccessAlert =
function DTShowSuccessAlert (title, message, duration)
{
	const savedBertHideDelay = Bert.defaults.hideDelay;
	if (duration)
	{
		Bert.defaults.hideDelay = duration;
	}
	Bert.alert (
		{
			type: 		'success',
			style: 		'fixed-bottom',
			title,
			message,
			icon: 		'fa-remove'
		}
	);
	Bert.defaults.hideDelay = savedBertHideDelay;
};

DT.isNumeric =
function isNumeric (n)
{
	return !isNaN (parseFloat (n)) && isFinite (n);
};


DT.isEmpty =
function isEmpty (data)
{
	if (typeof (data) === 'number' || typeof (data) === 'boolean')
	{
		return false;
	}
	if (typeof (data) === 'undefined' || data === null)
	{
		return true;
	}
	if (typeof (data.length) !== 'undefined')
	{
		return data.length == 0;
	}
	let count = 0;
	for (const i in data)
	{
		if (data.hasOwnProperty(i))
		{
			count++;
		}
	}
	return count == 0;
};

DT.stringIsEmpty = function stringIsEmpty (theString)
{
	let result = false;
	if (theString == null)
	{
		result = true;
	}
	if (theString === "")
	{
		result = true;
	}
	return result;
};

DT.insertIntoString =
function insertIntoString (string, index, value)
{
	return string.substr (0, index) + value + string.substr(index);
};

DT.round =
function dt_round(value, exp)
{
  if (typeof exp === 'undefined' || +exp === 0)
	{ return Math.round (value); }

  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
	{ return NaN; }

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(`${value[0]}e${value[1] ? (+value[1] + exp) : exp}`));

  // Shift back
  value = value.toString().split('e');
  return +(`${value[0]}e${value[1] ? (+value[1] - exp) : -exp}`);
};

function hasMethod (obj, name) {
  const desc = Object.getOwnPropertyDescriptor (obj, name);
  return !!desc && typeof desc.value === 'function';
}

DT.getMethodsForInstance =
function getMethodsForInstance (
	instance,
	stop		// where to stop working up the chain, e.g. React.Component.prototype
)
{
	const array = [];
	let proto = Object.getPrototypeOf (instance);
	let doFirstRun = false;
	if (stop == null)
	{
		doFirstRun = true; 							// if no stop class then at least do one run through
	}
	while (
		proto &&
		(
			(stop ? proto !== stop : false) || 		// only test against the stop class if stop is defined
			doFirstRun
		)
	)
	{
		Reflect.ownKeys (proto).forEach
		(
			function (name)
			{
				if (name !== 'constructor')
				{
				 	if (hasMethod (proto, name))
				 	{
						array.push (name);
				 	}
				}
			 }
		);
		doFirstRun = false;
		proto = Object.getPrototypeOf (proto);
	}
	return array;
};

// bind all object method contexts to the instance - i.e. this = instance
DT.autoBind =
function autoBind (
	instance,
	stop		// where to stop working up the chain, e.g. React.Component.prototype
)
{
	const methods = DT.getMethodsForInstance (instance, stop);
	// Object.keys (instance.constructor.prototype).forEach (
	methods.forEach (
		(aMethod) => {
			try
			{
				instance [aMethod] = instance.constructor.prototype [aMethod].bind (instance);
				// console.log ("DT.Autobind - binding method " + aMethod);
			}
			catch (theException)
			{
				console.log (`DT.Autobind - error binding method ${aMethod}, error: ${theException.message}`);
			}
		}
	);
};

DT.once =
function once (fn, context)
{
let result;

	return function()
	{
		if (fn)
		{
			result = fn.apply(context || this, arguments);
			fn = null;
		}
		return result;
	};
};

/*
DT.once Usage
var canOnlyFireOnce = once(function() {
	console.log('Fired!');
});

canOnlyFireOnce(); // "Fired!"
canOnlyFireOnce(); // nada
*/
