
// ------ Sebbes kod, lite modifierad -------
const listeners = {};
const ignore_publish = ["render::users::user"];

export const SubPub = {
    
	parseEvent: function (event) {

			const separator = "::";
			const parsed = {};
			const keys = ["type", "name", "action", "phase", "wait"];

			let i = 0;
			while (event.length > 0) {
				let index = event.indexOf(separator);
				if (index === -1) index = 100;
				parsed[keys[i++]] = event.substring(0, index);
				event = event.substring(index + separator.length);
			}
			
			return parsed;
	},

	subscribe: function (data) {
    let {event, listener, events} = data;

		if (!events) {
			events = [event];
		}

		events.forEach( event => {

			if (listeners[event] === undefined) {
				listeners[event] = [listener];
			} else {
				listeners[event] = [...listeners[event], listener];
			}    

		});

	},

	publish: function (data) {
			let { event, detail } = data;
			if ( !event ) { myError.throw("No Event Type"); }
	
			const doLog = !ignore_publish.includes(event);

			if (doLog) {
					// console.log( "Event Published: " + event, detail );
			}

			if (listeners[event] === undefined) {
					// doLog && console.log(`Event (${event}) has no listeners`);
					return;
			}
	
			listeners[event].forEach((listener) => {
	
					// If the listener is a function we'll invoke it with detail
					if (typeof listener === 'function') {
							// TODO: catch errors?
							listener(detail);
					} else {
							// Otherwise we'll dispatch a CustomEvent
							listener.dispatchEvent(new CustomEvent(event, { detail }));
					}
			});
	},

	unsubscribe: function (data) {
			let {event, listener} = data;
			// If no one is listening we'll do nothing
			if (listeners[event] === undefined) {
					return;
			}
	
			// Otherwise we'll filter out the listener from the array of listeners
			listeners[event] = listeners[event].filter((currentListener) => {
					// If they're unsubscribing a listener which is a function, we'll compare
					// the function names
					if (typeof currentListener === 'function') {
							return currentListener.name !== listener.name;
					}
	
					// Components can be compared normally
					return currentListener !== listener;
			});
	},

}

export class Listener {
    constructor ({event, callback}) {
        this.event = event;
        this.callback = callback;
    }
}