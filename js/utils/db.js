import state_io from "./state_io.js";
import { SubPub } from "./subpub.js";

const API_URL = "./db/api.php";
const HEADERS = { "Content-Type": "application/json" };
const SHOW_RAW_RESPONSE = true;
const SHOW_OBJECT_RESPONSE = true;

export default {}


// INIT SUBSCRIPTIONS
;(() => {

  function on_response ({ response, parsed_event, params  }) {
    SubPub.publish({
      event: parsed_event.type + "::" + parsed_event.name + "::" + parsed_event.action + "::received",
      detail: { response, params },
    });
  }

  function credentials_encode(token, id) {
    return encode_string(token) + encode_string(String(id));
  }
  function encode_string(string) {
    let _string = "";
    for (let i = 0; i < string.length; i++) {
      _string += String.fromCharCode(1 + string[i].charCodeAt(0));
    }
    return _string;
  }

  const events = [

    "db::get::login::request",
    "db::get::user::request",
    "db::get::users::request",
    "db::get::course::request",
    
    // USER
    "db::delete::user::request",
    "db::patch::user::request",
    "db::post::user::request",

    // USERS_UNITS
    "db::patch::users_units::request",

    // UNITS
    "db::delete::unit::request",
    "db::patch::unit::request",
    "db::post::unit::request",

    // SECTIONS
    "db::delete::section::request",
    "db::patch::section::request",
    "db::post::section::request",

    // DEPENDENCIES
    "db::delete::dependencies::request",
    "db::post::dependencies::request",

    // CHAPTERS
    "db::delete::chapter::request",
    "db::patch::chapter::request",
    "db::post::chapter::request",

    // COURSES
    "db::delete::course::request",
    "db::patch::course::request",
    "db::post::course::request",

    // QUIZ_QUESTIONS
    "db::post::quiz_question::request",
    "db::patch::quiz_question::request",

    // QUIZ ANSWERS
    "db::get::date_time::request",
    "db::post::quiz_answer::request",

    // QUIZ OPTIONS
    "db::delete::quiz_option::request",
    "db::patch::quiz_option::request",
    "db::post::quiz_option::request",
    
  ];

  events.forEach( event => {

    const parsed_event = SubPub.parseEvent(event);
    const action = parsed_event.action;

    SubPub.subscribe({
      event,
      listener: detail => {

        let { params } = detail;

        if (action !== "login") {
          params = {
            credentials: credentials_encode (state_io.state.user.user_token, state_io.state.user.user_id),
            ...params,
          };
          console.log(params);
        }
      

        switch (parsed_event.name) {

          case "get":

            if (parsed_event.wait === "no_wait") {
              _get({ action, params });
              on_response({response: null, parsed_event, params});
            } else {
              _get({ action, params })
                .then( response => on_response({ response, parsed_event, params }));
            }

            break;

          case "post":

            if (parsed_event.wait === "no_wait") {
              _post({ body: { action, params }});
              on_response({ response: null, parsed_event, params });
            } else {
              _post({ body: { action, params }})
                .then( response => on_response({ response, parsed_event, params }));
            }

            break;

          case "delete":

            if (parsed_event.wait === "no_wait") {
              _delete({ body: { action, params }});
              on_response({ response: null, parsed_event, params });
            } else {
              _delete({ body: { action, params }})
                .then( response => on_response({ response, parsed_event, params }));
            }

            break;

          case "patch":

            if (parsed_event.wait === "no_wait") {
              _patch({ body: { action, params }});
              on_response({ response: null, parsed_event, params });
            } else {
              _patch({ body: { action, params }})
                .then( response => on_response({ response, parsed_event, params }));
            }

            break;

        }
      }
    });
  });

})()



async function _get (data) {

  let { url, action, params } = data;
  url = url || API_URL;

  let paramsString = "";
  let counter = 0;
  for (const key in params) {
    paramsString += `&${key}=${params[key]}`;
  }
  const request = new Request(`${API_URL}?action=${action}${paramsString}`);
  
  return await _fetch({ request, body: { action } });

}
async function _post (data) {

  let { body, url, headers } = data;
  headers = headers || HEADERS;
  url = url || API_URL;

  console.log(body);

  let request = new Request(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
  });

  return await _fetch({ request, headers, ...data });

}
async function _delete (data) {

  let { body, url, headers } = data;
  headers = headers || HEADERS;
  url = url || API_URL;

  console.log(body);

  let request = new Request(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify(body)
  });

  return await _fetch({ request, headers, ...data });

}
async function _patch (data) {

  let { body, url, headers } = data;
  headers = headers || HEADERS;
  url = url || API_URL;

  console.log(body);

  let request = new Request(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body)
  });

  return await _fetch({ request, headers, ...data });

}
async function _fetch (data) {

  let { request, body } = data;
  let middle;
console.log(data.headers);
  console.log(data, request);
  try {
    console.log("Requesting", body.action );
    const _response = await fetch(request);
    console.log(_response.headers);
    middle = _response.headers.get("Content-Type").includes("text") ? "text" : "json";
    console.log(middle);
    let data = await _response[middle]();
    SHOW_RAW_RESPONSE && console.log(data);  
    
    if(data.message === "Wrong Password"){
      return
    }
  
    if (middle === "text") {
        data = JSON.parse(data);
    }
  
    SHOW_OBJECT_RESPONSE && console.log(data);

    return data;

  } catch (e) {
    console.log(e);
    kasta_error();
  }

}

