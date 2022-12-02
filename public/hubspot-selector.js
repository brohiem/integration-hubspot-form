

var currentValue = null;
var isDisabled = true;
var config = null;
var forms = null;

function updateDisabled(disabled) {
  var elements = $(".selector").add(".remove").add(".spacer");
  if (disabled) {
    elements.hide();
  } else {
    elements.show();
  }
  updateSize();
  isDisabled = disabled;
}

function updateSize() {
  // Update the custom element height in the Kentico UI.
  const height = Math.ceil($("html").height());
  CustomElement.setHeight(height);
}

function validateConfig() {
  if (!config.apiEndpoint) {
    console.error(
      "Missing Hubspot API base URL. Please provide apiEndpoint within the custom element JSON config."
    );
  }
  if (!config.apiKey) {
    console.error(
      "Missing Hubspot API key. Please provide apiKey within the custom element JSON config."
    );
  }
}


function getForms(val) {
  axios.get('https://api.hubapi.com/forms/v2/forms',
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    (success, response) => {
      forms = response.forms;
      fillDropDown(val);
    },
    (err, data) => {
      // Handle the API response
    }
  );
}

function fillDropDown(val) {
  const $dropdown = $(".form__dropdown");
  for (var i = 0; i < forms.length; i++) {
    var option = document.createElement("option");
    option.value = forms[i].guid;
    option.text = forms[i].name;
    $dropdown[0].appendChild(option);
  }
  if (val) {
    $('#dropdown [value="' + val.name + '"]').attr("selected", "true");
  }
}

function renderSelected(form) {
  const $titleText = $(".title").find(".text");
  if (form) {
    $titleText.html(
      "<b>Selected form:</b> " +
      form.name +
      ` <a class="remove" onclick="remove()">Remove</a>`
    );
    $titleText.addClass("title--selected");
  } else {
    $titleText.text("No form selected");
    $titleText.removeClass("title--selected");
  }
  updateSize();
}

function remove() {
  $("#dropdown").find("option:disabled").prop("selected", "selected");
  formSelected(null);
}

function formSelected(form) {
  if (!isDisabled) {
    if (form) {
      currentValue = forms.find((x) => x.name == form);
      CustomElement.setValue(JSON.stringify(currentValue));
      renderSelected(currentValue);
    } else {
      currentValue = null;
      CustomElement.setValue(null);
      renderSelected(null);
    }
  }
}

function setupSelector(value) {
  if (value) {
    getForms(JSON.parse(value));
    currentValue = JSON.parse(value);
    renderSelected(currentValue);
  } else {
    getForms();
    renderSelected(null);
  }
  window.addEventListener("resize", updateSize);
}

function initCustomElement() {
  updateSize();
  try {
    CustomElement.init((element, _context) => {
      config = element.config || {};
      validateConfig();
      setupSelector(element.value);
      updateDisabled(element.disabled);
      updateSize();
    });
    // React on disabled changed (e.g. when publishing the item)
    CustomElement.onDisabledChanged(updateDisabled);
  } catch (err) {
    // Initialization with Kentico Custom element API failed (page displayed outside of the Kentico UI)
    console.error(err);
    setupSelector();
    updateDisabled(true);
  }
}

initCustomElement();
