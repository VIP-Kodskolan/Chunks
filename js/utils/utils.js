
export default {
  get_parameter, parse_get_parameters, get_parameters_string,
  push_state_window_history,
  escape_html, get_current_week_number
}

function push_state_window_history(search) {

  const pathname = window.location.pathname;
  window.history.pushState("string", "Title", `${pathname}${search}`);

}
function parse_get_parameters() {
  let string = window.location.search.substring(1);
  let parsed = {};

  while (string) {
    const key_index = string.indexOf("=");
    const key = string.substring(0, key_index);
    string = string.substring(key_index + 1);

    let value_index = string.indexOf("&");
    let value;

    if (value_index === -1) {
      value_index = 100;
      value = string;
      string = "";
    } else {
      value = string.substring(0, value_index);
      string = string.substring(value_index + 1);
    }

    parsed[key] = value;
  }

  return parsed;
}
function get_parameter(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
function get_parameters_string(potential_parameters) {

  const parsed_get_params = parse_get_parameters();
  let get_parameters_string = "";
  potential_parameters.forEach((gp, index) => {
    const ampersand_string = index ? "&" : "";
    get_parameters_string += parsed_get_params[gp] ? `${ampersand_string}${gp}=${parsed_get_params[gp]}` : "";
  });

  return get_parameters_string;

}

function escape_html(string) {
  return string.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

// Courtesy of: https://stackoverflow.com/a/14127528
function get_current_week_number() {
  // Create a copy of the current date, we don't want to mutate the original
  const now = new Date()
  const date = new Date(now.getTime());

  // Find Thursday of this week starting on Monday
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const thursday = date.getTime();

  // Find January 1st
  date.setMonth(0); // January
  date.setDate(1);  // 1st
  const jan1st = date.getTime();

  // Round the amount of days to compensate for daylight saving time
  const days = Math.round((thursday - jan1st) / 86400000); // 1 day = 86400000 ms
  return Math.floor(days / 7) + 1;
}
