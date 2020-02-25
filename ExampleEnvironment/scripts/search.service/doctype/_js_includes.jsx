/*! RESOURCE: /scripts/search.service/doctype/_js_includes.js */
/*! RESOURCE: /scripts/search.service/SearchService.js */
var SearchService = Class.create();
SearchService.prototype = {
HTTP_OK: "200",
HTTP_PARTIAL_CONTENT: "206",
INTERLEAVED: "interleaved",
EVENT_SEARCH_SERVICE_ACTIVATED: "cxs:search_service_activated",
EVENT_TARGET_UPDATED: "cxs:target_update",
CXS_SEARCH_RESULTS_HEADER: "cxs_results_header",
CXS_RESULTS_VCR: "cxs_results_vcr",
CXS_SHOW_MORE_VCR: "cxs_show_more",
CXS_FORCE_DISPLAY_RESULTS: "cxs:force_display_results",
CXS_SHOW_MORE_ACTIVATED: "cxs:has_more",
initialize: function(searchConfig, session, targetElement, availableSearchFields, waitPeriod, resultThreshold, isAdmin, appendPagedResults) {
this.timeout = null;
this.searchConfig = searchConfig;
this.availableSearchFields = availableSearchFields;
this.waitPeriod = waitPeriod;
this.resultThreshold = resultThreshold;
this.resultsHeaderText = searchConfig.resultsHeaderText;
this.macroNames = {};
this.sessionConfig = searchConfig.cxs_session_config;
this.isAdmin = isAdmin;
this.previousSearch = "";
this.targetElement = targetElement;
this.session = session;
this.appendPagedResults = appendPagedResults;
this.ajaxQueue = [];
this.resultsMsg = "";
this.hideOnEmptySearchTerm = true;
this.onClearHTML = "";
this.onSearchHTML = "";
this.tsQueryKbId = "";
this.limit = isNaN(searchConfig.limit) ? null : parseInt(searchConfig.limit);
this.resultsPerPage = isNaN(searchConfig.results_per_page) ? null : parseInt(searchConfig.results_per_page);
if (this.limit && this.resultsPerPage && (this.resultsPerPage > this.limit))
this.resultsPerPage = this.limit;
this.afterDataHandler = null;
},
saveState: function(key){
if (!this._state)
this._state = {};
if (!this._state[key])
this._state[key] = {};
this._state[key].currentSearchID = this.currentSearchID;
this._state[key].previousSearch = this.previousSearch;
this._state[key].currentRow = this.currentRow;
this._state[key].lastRow = this.lastRow;
this._state[key].response = this.response;
this._state[key].searchSource = this.searchSource
this._state[key].limitReached = this.limitReached;
this._state[key].hasMoreResults = this.hasMoreResults;
this._state[key].backAllowed = this.backAllowed;
},
restoreState: function(key){
if (!this._state)
this._state = {};
if (!this._state[key]){
this._state[key] = {
backAllowed : false,
hasMoreResults : false,
currentRow : 0,
lastRow : this.currentRow + this.resultsPerPage
};
}
this.currentSearchID = this._state[key].currentSearchID;
this.previousSearch = this._state[key].previousSearch;
this.currentRow = this._state[key].currentRow;
this.lastRow = this._state[key].lastRow;
this.response = this._state[key].response;
this.searchSource = this._state[key].searchSource
this.limitReached = this._state[key].limitReached;
this.hasMoreResults = this._state[key].hasMoreResults;
this.backAllowed = this._state[key].backAllowed;
},
search: function(searchElement, forceSearch) {
if (!searchElement && !this._lastSearchElement)
return;
if (!searchElement)
searchElement = this._lastSearchElement;
this.currentSearchID = searchElement.id;
var currentSearch = searchElement.value.trim();
if (!currentSearch) {
this._clear();
return;
}
if (currentSearch == this.previousSearch)
return;
this._lastSearchElement = searchElement;
this.previousSearch = currentSearch;
this._stop();
this.backAllowed = false;
this.hasMoreResults = false;
this.currentRow = 0;
this.lastRow = this.currentRow + this.resultsPerPage;
if (forceSearch)
this._start(currentSearch);
else
this._start(currentSearch, this.waitPeriod);
},
_start: function(newSearch, waitPeriod) {
if (!newSearch)
return;
var _startSearch = function() {
var filters = this._buildSearchFilters();
var resultDataElem = this.targetElement.select("#cxs_results_data")[0];
if (resultDataElem)
resultDataElem.addClassName("cxs_results_data_reloading");
var glideAjax = new GlideAjax("cxs_SearchResultsAJAX");
glideAjax.addParam("sysparm_name", "process");
glideAjax.addParam("payload", this._wrap(newSearch));
glideAjax.addParam("cxs_macro_names", Object.toJSON(this.macroNames));
if (Object.getOwnPropertyNames(filters).length > 0) {
glideAjax.addParam("cxs_filter_data", Object.toJSON(filters));
}
glideAjax.preventCancelNotification();
glideAjax.setErrorCallback(this._errorHandler.bind(this));
glideAjax.getXML(this._dataHandler.bind(this));
this.ajaxQueue.push(this.session.id);
}.bind(this);
if (!waitPeriod)
_startSearch();
else
this.timeout = setTimeout(_startSearch, this.waitPeriod);
if (!this.targetElement.down("#cxs_results_data"))
this.targetElement.update(this.onSearchHTML);
},
_buildSearchFilters: function() {
var filterMap = {};
var fieldValues;
if(!this.searchConfig.filter_config || Object.getOwnPropertyNames(this.searchConfig.filter_config).length == 0 || !this.searchConfig.filter_config.filters_configured) {
return filterMap;
}
filterMap = this.searchConfig.filter_config;
fieldValues = g_form.serializeChanged();
filterMap.fieldValues = fieldValues;
return filterMap;
},
_stop: function() {
var resultDataElem = this.targetElement.select("#cxs_results_data")[0];
if (resultDataElem)
resultDataElem.removeClassName("cxs_results_data_reloading");
if (!this.timeout)
return;
this._clearTimeout();
},
_clear: function() {
this.previousSearch = "";
this._clearTimeout();
this.targetElement.update(this.onClearHTML);
if (this.hideOnEmptySearchTerm)
this.targetElement.hide();
this.targetElement.fire(this.EVENT_TARGET_UPDATED);
_frameChanged();
},
_clearTimeout: function() {
if (!this.timeout)
return;
clearTimeout(this.timeout);
this.timeout = null;
},
_dataHandler: function(response) {
this.ajaxQueue.pop();
if (!response || !response.responseXML) {
if (this.isAdmin && g_form) {
g_form.clearMessages();
g_form.addErrorMessage(getMessage("Search Service Error: Empty ajax response returned"));
}
this.response = null;
this._stop();
this._clear();
return;
}
var payload = response.responseXML.getElementsByTagName("payload");
if (!payload || payload.length == 0 || !payload[0].getAttribute("response") || payload[0].getAttribute("response").length == 0) {
if (this.isAdmin && g_form) {
g_form.clearMessages();
g_form.addErrorMessage(getMessage("Search Service Error: Empty payload returned"));
}
this.response = null;
this._stop();
this._clear();
return;
}
var payloadObj = payload[0].getAttribute("response").evalJSON();
if (payloadObj.status.code != this.HTTP_OK && payloadObj.status.code != this.HTTP_PARTIAL_CONTENT) {
var errorMsg = payloadObj.status.err_msg;
if (this.isAdmin && g_form) {
g_form.clearMessages();
g_form.addErrorMessage(new GwtMessage().getMessage("Search Service Error: {0}", errorMsg.join("<br/>")));
}
this.response = null;
this._stop();
return;
}
if(payloadObj.meta.hasOwnProperty("tsQueryId"))
this.tsQueryKbId = payloadObj.meta.tsQueryId
var previousResponse = this.response;
var formattedResults = payload[0].getAttribute("html");
this.response = payloadObj;
this.searchSource = null;
if (this.response.meta.sources && this.response.meta.sources[this.INTERLEAVED])
this.searchSource = this.response.meta.sources[this.INTERLEAVED];
if (this.searchSource && this.searchSource.window.start != 0 && this.appendPagedResults){
this.targetElement.select("#cxs_results_data>tbody")[0].insert(formattedResults);
this.response.results = previousResponse.results.concat(this.response.results);
} else{
if (g_form)
g_form.setDisplay("contextual_search_results",true);
this.targetElement.update(this._getResultsMsgHtml() + formattedResults);
}
if (this.hideOnEmptySearchTerm)
this.targetElement.show();
this._showHideHeader();
this._updateVCR();
this._updateHasMoreVCR();
var params  = {};
params.vcr = {
backAllow: this.backAllowed,
hasMoreResults: this.hasMoreResults
};
if(this.searchSource  &&  this.searchSource.window)
params.window = this.searchSource.window;
else
params.window = {start:0, end:0};
this.targetElement.fire(this.EVENT_TARGET_UPDATED, params, true);
if (typeof this.afterDataHandler == "function") {
try {
this.afterDataHandler();
} catch (e) {
jslog("SearchService: afterDataHandler function error:\n" + e)
}
this.afterDataHandler = null;
}
_frameChanged();
this._stop();
},
_errorHandler: function (request, callbackArgs) {
this.ajaxQueue.pop();
if (this.ajaxQueue.length == 0) {
this._stop();
g_form.clearMessages();
g_form.addInfoMessage(getMessage("Your search timed out"));
}
},
setAfterDataHandler: function(afterFunction) {
this.afterDataHandler = afterFunction;
},
_wrap: function(searchTerms) {
var payload = {
context: this.searchConfig.cxs_context_config,
meta: {
results_header_text: this.resultsHeaderText,
result_actions_position: this.searchConfig.result_actions_position,
source_table: this.session.sourceTable,
current_search_field: this.currentSearchID,
session: this.session.id,
is_doctype: this.session.is_doctype,
is_new_record: this.session.is_new,
includePinnedArticles: true,
form : {
tn: g_form.getTableName(),
sys_id: g_form.getUniqueValue(),
serialized: g_form.serialize()
},
ts_query_kbId : ""
},
query: {
freetext: searchTerms,
},
debug: true
};
if(this.currentRow !=0){
payload.meta.ts_query_kbId = this.tsQueryKbId;
}
if (this.resultsPerPage)
payload.meta.window = {
"start": this.currentRow,
"end": this.lastRow
};
if (this.search_as && this.search_as != "")
payload.search_as = this.search_as;
if (this.limit)
payload.meta.limit = this.limit;
if (this.session.sourceDoc)
payload.meta.source_doc = this.session.sourceDoc;
if (searchTerms == this.previousSearch && this.response && this.response.meta)
payload.meta.sources = this.response.meta.sources;
return Object.toJSON(payload);
},
onShowMore: function(el) {
this.currentRow = this.currentRow + this.resultsPerPage;
this.lastRow = this.currentRow + this.resultsPerPage;
if (this.lastRow > this.limit)
this.lastRow = this.limit;
Event.fire(this.targetElement, this.CXS_SHOW_MORE_ACTIVATED, {id:el.id}, true);
this._start(this.previousSearch);
},
_updateHasMoreVCR: function() {
if (!this.searchSource || !this.searchSource.window || !this.targetElement)
return;
var buttons = this.targetElement.select("#" + this.CXS_SHOW_MORE_VCR);
if (!buttons || buttons.length != 1)
return;
var button = buttons[0];
this.hasMoreResults = this.searchSource.has_more_results &&
(this.limit && this.lastRow < this.limit) &&
(this.resultThreshold && this.lastRow < this.resultThreshold);
if (this.searchSource.window.start == 0){
if (this.hasMoreResults) {
var showMoreContainer = this.targetElement.select("#cxs_show_more_container");
if (showMoreContainer && showMoreContainer.length == 1)
showMoreContainer[0].show();
}
}
if (!this.hasMoreResults)
button.disabled = true;
},
_updateVCR: function() {
if (!this.searchSource || !this.searchSource.window)
return;
if (this.response.request.limit)
this.limit = this.response.request.limit;
this.currentRow = this.searchSource.window.start;
this.lastRow = this.searchSource.window.end;
this.limitReached = false;
if (this.response.meta.limit_reached == "true")
this.limitReached = true;
this.hasMoreResults = this.searchSource.has_more_results &&
(this.limit && this.lastRow < this.limit) &&
(this.resultThreshold && this.lastRow < this.resultThreshold);
var vcrSpan = $(this.CXS_RESULTS_VCR);
if (!vcrSpan)
return;
if (!this.resultsPerPage || (this.currentRow == 0 && !this.hasMoreResults)) {
this._setVisible(vcrSpan, false);
return;
}
this._setVisible(vcrSpan, true);
vcrSpan.on('click', "[data-nav=true]", this._gotoActionEvent.bind(this));
var firstRowSpan = $("cxs_results_first_row");
var lastRowSpan = $("cxs_results_last_row");
if (firstRowSpan)
firstRowSpan.update(this.currentRow + 1);
if (lastRowSpan)
lastRowSpan.update(this.lastRow);
this.backAllowed = (this.currentRow > 0);
var images = vcrSpan.select("[data-nav=true]");
if (images && images.length) {
this._setAction(images[0], this.backAllowed);
this._setAction(images[1], this.backAllowed);
this._setAction(images[2], this.hasMoreResults);
}
},
_showHideHeader: function() {
var headerTable = $(this.CXS_SEARCH_RESULTS_HEADER);
if (!headerTable)
return;
if (this.resultsHeaderText || (this.resultsPerPage && this.searchSource.meta.has_more_results))
this._setVisible(headerTable, true);
},
_setVisible: function(element, flag) {
if (!element)
return;
if ((flag && !element.visible()) || (!flag && element.visible()))
element.toggle();
},
_setAction: function(img, allowed) {
img.writeAttribute("aria-disabled", !allowed + "");
if (img.tagName.toLowerCase() == "img") {
if (allowed) {
img.addClassName("pointerhand");
this._removeDis(img);
} else {
img.removeClassName("pointerhand");
this._addDis(img);
}
} else {
if (!allowed)
img.addClassName("tab_button_disabled");
else
img.removeClassName("tab_button_disabled");
}
},
_removeDis: function(img) {
var src = img.src;
if (src.indexOf('_dis.gifx') != -1)
img.src = src.replace(/\_dis\.gifx/i, ".gifx");
},
_addDis: function(img) {
var src = img.src;
if (src.indexOf('_dis.gifx') == -1)
img.src = src.replace(/\.gifx/i, "_dis.gifx");
},
_gotoActionEvent: function(ev, el) {
ev.preventDefault();
var action = el.name.substring(4);
if (!action)
return;
Event.fire(this.targetElement, this.CXS_FORCE_DISPLAY_RESULTS, {id: el.id}, true);
this._gotoAction(action);
},
_gotoAction: function(action) {
if (!action)
return;
if (!this.backAllowed && ((action == 'first') || (action == 'back')))
return;
if (!this.hasMoreResults && ((action == 'next') || (action == 'last')))
return;
if (action == 'first') {
this.currentRow = 0;
this.lastRow = this.currentRow + this.resultsPerPage;
} else if (action == 'back') {
this.currentRow = this.currentRow - this.resultsPerPage;
if (this.currentRow < 0)
this.currentRow = 0;
this.lastRow = this.currentRow + this.resultsPerPage;
} else if (action == 'next') {
this.currentRow = this.currentRow + this.resultsPerPage;
this.lastRow = this.currentRow + this.resultsPerPage;
if (this.lastRow > this.limit)
this.lastRow = this.limit;
} else
return;
this._start(this.previousSearch);
},
_filterResultsBySource: function(elem) {
if (elem.meta && (elem.meta.interleaved || elem.meta.pinned))
return true;
return false;
},
_getResultsMsgHtml: function() {
if (!this.resultsMsg || this.response.results.length == 0)
return "";
var resultsMsgHtml = "";
if (this.session.is_doctype)
resultsMsgHtml =  "<div id='cxs_ou_search_warning' class='fieldmsg-container'>" +
"<div class='fieldmsg notification notification-info' role='alert'>" +
this.resultsMsg +
"</div>" +
"</div>";
else
resultsMsgHtml =  "<div class='outputmsg_info' role = 'alert'>" +
"<img src='images/outputmsg_success.gifx' alt='Informational Message'>" +
this.resultsMsg +
"</div>";
return resultsMsgHtml;
},
type: "SearchService"
};
;
/*! RESOURCE: /scripts/search.service/ResultsOverlay.js */
var ResultsOverlay = Class.create();
ResultsOverlay.prototype = {
_UP_BUTTON: "<a role = 'button' tabindex='0' aria-label = '"+ getMessage("Displays previous search result content") + "' id='cxs_previous_result'><img role = 'presentation' title='" + getMessage("Previous result") + "' src='images/nav_up.gifx' height='16' style='cursor:pointer; margin: 0px;' alt='" + getMessage("Previous result") + "' width='15'></a>",
_DOWN_BUTTON: "<a role = 'button' tabindex='0' aria-label = '"+ getMessage("Displays Next search result content") + "' id='cxs_next_result'><img role = 'presentation' title='" + getMessage("Next result") + "' height='16' src='images/nav_down.gifx' style='cursor:pointer; margin: 0px;' alt='" + getMessage("Next result") + "' width='15'></a>",
_ACTION_BUTTON: "<table id='cxs_action_button' class='cxs_action_button' cellspacing='0' cellpadding='0'>" +
"<tr>" +
"<td style='padding: 0; margin: 0;'>" +
"<a class='cxs_header_indicator' role = 'presentation'>" +
"<img src='images/icons/result_cached_true.gif' tabindex='0' id='{0}' action-value='{1}' alt = '{1}' role = 'checkbox' aria-checked = 'false' />" +
"</a>" +
"</td>" +
"<td style='padding: 0; margin: 0;'>" +
"<span id='{2}' action-value='{3}' class='cxs_action_button_label'>&nbsp;{4}</span>" +
"</td>" +
"</tr>" +
"</table>",
_ATTACH_KB_BUTTON: "<button id='cxs_attach_kb' action-value='{2}' value='sysverb_attach' class='cxs_attach_kb' style='white-space:nowrap;' aria-label = '"+ getMessage("Attaches the knowledge article to this form on save") +"'>" + "{1} " + getMessage("to") + " {0}" + "</button>",
_GOTO_SC_BUTTON: "<button id='cxs_cat_item' action-value='{0}' aria-label = '{2}' value='sysverb_attach' class='request_catalog_button_with_icon btn btn-default' style='white-space:nowrap;'>{3}</button>",
_ARROWS: "<span style='white-space: nowrap;'>{0}{1}</span>",
_ENABLED_ARROWS: {
"cxs_previous_result": "/images/nav_up.gifx",
"cxs_next_result": "/images/nav_down.gifx"
},
_DISABLED_ARROWS: {
"cxs_previous_result": "/images/nav_up_dis.gifx",
"cxs_next_result": "/images/nav_down_dis.gifx"
},
initialize: function(searchService, index, feedback, options) {
this.rendered = false;
this.options = options;
this.feedback = feedback;
this.targetTable = this.feedback.session.sourceTableName;
this.setSearchService(searchService);
this.setResponse(this.searchService.response);
this.setRequest(this.searchService.response.request);
this.setResults(this.searchService.response.results);
this.setSearchConfig(this.searchService.searchConfig);
this.setIndex(index);
this.currentElement = null;
this.redirectURL = "";
this.overlay = new GlideOverlay(this.options);
this.overlay.addToolbarRightDecoration(this._format(this._ARROWS, this._UP_BUTTON, this._DOWN_BUTTON), true);
this.previousButton = $("cxs_previous_result");
this._observe(this.previousButton, this.previousResult);
this.nextButton = $("cxs_next_result");
this._observe(this.nextButton, this.nextResult);
},
registerCallbackAfterClose: function(callback) {
this.overlay.options.onAfterClose = function() {
callback && callback();
}
},
render: function(focusToDialog) {
var currentResult = this.getResult();
var currentElement = this.getResultElement();
if (currentResult == null || currentElement == null)
return false;
this.overlay.setTitleHtml("");
this.overlay.setTitle(currentResult.title);
var tmpIfb = gb_BoxIFrameBody;
var tmpLd = gb_LoadingBody;
if (currentElement && currentElement.readAttribute("href").indexOf("sys_attachment.do") > -1) {
gb_BoxIFrameBody = gb_BoxIFrameBody.replace("Loading", getMessage("Downloading"));
gb_LoadingBody = gb_LoadingBody.replace("Loading", getMessage("Downloading"));
}
var dialog = this.overlay.getBoxElement();
if(focusToDialog) {
var dialogTabIndex =dialog.readAttribute("tabindex");
if(dialogTabIndex == null || dialogTabIndex < 0)
dialog.writeAttribute("tabindex", 0);
}
if (!this.rendered)
this.rendered = true;
var linkTarget = currentElement.readAttribute("target");
var href = currentElement.readAttribute("href");
if (typeof linkTarget !== "undefined" && linkTarget == "_blank")
this.overlay.options.iframe = "cxs_new_window.do?sysparm_title=" + encodeURIComponent(currentResult.title) + "&sysparm_url=" + encodeURIComponent(href);
else{
if (currentElement.readAttribute("data-type") == "application/pdf") {
this.overlay.setBody(
"<object style=\"width: 100%; height: 100%;\" data=\""+ href +"\" type=\"application/pdf\">" +
"   <iframe src=\"" + href + "\" style=\"width: 100%; height: 100%;\" ></iframe>" +
"</object>");
this.overlay.options.iframe = null;
} else
this.overlay.options.iframe = href;
}
this.overlay.options.onAfterLoad = function() {
if(focusToDialog)
dialog.focus();
this.autoDimension();
this.autoPosition();
this._createIframeShim();
if (this.getIFrameElement().contentWindow.parent == window.top) {
this.getIFrameElement().setAttribute('height',this.correctHeight - this._box.select('.gb_body_wrapper')[0].getHeight());
this._box.setStyle({height: this.correctHeight + this._box.select('thead')[0].getHeight() + 'px'});
this._box.select('.gb_body_wrapper')[0].setStyle({height: this.correctHeight + 'px'})
}
if (this.getIFrameElement().contentWindow.parent == window) {
this.getIFrameElement().setAttribute('height',this.correctHeight);
this._box.setStyle({height: this.correctHeight + this._box.select('thead')[0].getHeight() + 'px'});
this._box.select('.gb_body_wrapper')[0].setStyle({height: this.correctHeight + 'px'})
}
}.bind(this.overlay);
this.overlay.render();
if (currentElement && currentElement.readAttribute("href").indexOf("sys_attachment.do") === -1)
this.overlay.getIFrameElement().up().up().show().previous().hide();
if(this.overlay.getIFrameElement().contentWindow.parent == window.top || this.overlay.getIFrameElement().contentWindow.parent == window)
this.overlay.correctHeight = this.overlay.getHeight()
gb_BoxIFrameBody = tmpIfb;
gb_LoadingBody = tmpLd;
this._checkOverlayButtons();
this._checkButtons();
_frameChanged();
this.feedback.sendFeedback(this.searchService.response.request, this.searchService.response.results[this.getIndex()],this.getIndex(), "Preview", false);
return true;
},
doRedirect: function(event) {
var element = event.element();
var actionValue = element.readAttribute("action-value");
if (!actionValue)
return;
this.feedback.sendFeedback(this.getRequest(), this.getResult(),this.getIndex(), actionValue, false, function (){
window.location.href = this.redirectURL;
this.overlay.close();
}.bind(this));
},
doAction: function(event) {
var actionButton = $(this.actionButtonId);
var actionValue = actionButton.readAttribute("action-value");
if (!actionValue)
return;
var isChecked = actionButton.hasClassName("cxs_header_icon_checked");
this._toggleAriaCheckedForThisHelped(!isChecked);
this.feedback.sendFeedback(this.getRequest(), this.getResult(),this.getIndex(), actionValue, isChecked, function (){
if (actionButton.hasClassName("cxs_header_icon_checked"))
this._untickAction();
else
this._tickAction();
this._toggleListDisplay(actionValue);
}.bind(this));
},
attachArticle: function(event) {
var element = event.element();
var actionValue = element.readAttribute("action-value");
var currentResult = this.getResult();
var config = this.getSearchConfig();
var kb_attachment = currentResult.searchResultActions ? JSON.parse(currentResult.searchResultActions.attach).attachType : config.kb_attachment;
var ajax = new GlideAjax("cxs_Knowledge");
ajax.addParam("sysparm_name", "getArticleInfo");
ajax.addParam("sysparm_kb_sys_id", currentResult.id.split(":")[1]);
ajax.addParam("sysparam_kb_insert_as_link", kb_attachment);
ajax.getXMLAnswer(function(answer) {
var articleInfo = answer.evalJSON();
if (!articleInfo.article.id || articleInfo.article.id == ""){
g_form.addInfoMessage(getMessage("Could not attach article details"));
return;
}
var targetField = this._updateRecordFromAttach(articleInfo.fields, articleInfo.article);
if (targetField != null){
var title = currentResult.title.escapeHTML();
g_form.addInfoMessage(new GwtMessage().getMessage("Details of {0} have been added to the {1} field", title, targetField));
}
console.log('sending attach request with action value '+actionValue);
this.feedback.sendFeedback(this.getRequest(), this.getResult(),this.getIndex(), actionValue, false, function (){
this._toggleListDisplay(actionValue);
}.bind(this));
}.bind(this));
this.overlay.close();
},
previousResult: function() {
if (this.previousButton.hasClassName("disabled"))
return;
if (this.index > 0) {
this.setIndex(this.index - 1);
return this.render();
}
if (!this.searchService.backAllowed)
return;
this.rendered = false;
this.searchService.setAfterDataHandler(this.afterPageBack.bind(this));
this.searchService._gotoAction("back");
},
nextResult: function() {
if (this.nextButton.hasClassName("disabled"))
return;
if (this.index < this.results.length - 1) {
this.setIndex(this.index + 1);
return this.render();
}
if (!this.searchService.hasMoreResults)
return;
this.rendered = false;
this.searchService.setAfterDataHandler(this.afterPageNext.bind(this));
this.searchService._gotoAction("next");
},
afterPageNext: function() {
this.setResponse(this.searchService.response);
this.setRequest(this.searchService.response.request);
this.setResults(this.searchService.response.results);
if (this.searchService.appendPagedResults)
this.setIndex(this.index + 1);
else
this.setIndex(0);
this.render();
},
afterPageBack: function() {
this.setResponse(this.searchService.response);
this.setRequest(this.searchService.response.request);
this.setResults(this.searchService.response.results);
this.setIndex(this.results.length - 1);
this.render();
},
getSearchService: function() {
return this.searchService;
},
setSearchService: function(searchService) {
this.searchService = searchService;
},
getResponse: function() {
return this.response;
},
setResponse: function(response) {
this.response = response;
},
getResults: function() {
return this.results;
},
setResults: function(results) {
this.results = results;
},
getSearchConfig: function() {
return this.searchConfig;
},
setSearchConfig: function(searchConfig) {
this.searchConfig = searchConfig;
},
getRequest: function() {
return this.request;
},
setRequest: function(request) {
this.request = request;
},
getResult: function() {
if (this.index > this.getResults().length - 1)
return null;
var result = this.getResults()[this.index];
return !result ? null : result;
},
getResultElement: function() {
var nextElement = this.searchService.targetElement.select(this._format("a.cxs_result[data-index='{0}']", this.index));
if (nextElement && nextElement.length == 1)
return nextElement[0];
else
null;
},
setIndex: function(index) {
this.index = parseInt(index);
},
getIndex: function() {
return this.index;
},
_getResultsButton: function(actionValue) {
if (!actionValue)
return null;
var resultsButton = this.searchService.targetElement.select(this._format("span[data-index='{0}'][action-value='{1}']", this.getIndex(), actionValue));
if (!resultsButton || resultsButton.length == 0)
return null;
return resultsButton[0];
},
_checkOverlayButtons: function() {
this.overlay.removeToolbarDecoration(".cxs_action_button");
this.overlay.removeToolbarDecoration(".cxs_attach_kb");
this.overlay.removeToolbarDecoration(".request_catalog_button_with_icon");
var currentResult = this.getResult();
var config = this.getSearchConfig();
if (!currentResult.searchResultActions)
return this._checkOverlayButtonsForKupgrade(currentResult, config);
var orderActionDetails = currentResult.searchResultActions.order ? JSON.parse(currentResult.searchResultActions.order) : null;
var thisHelpedActionDetails = currentResult.searchResultActions.this_helped ? JSON.parse(currentResult.searchResultActions.this_helped) : null;
var attachActionDetails = currentResult.searchResultActions.attach ? JSON.parse(currentResult.searchResultActions.attach) : null;
if (currentResult.id.split(":")[0] == "kb_knowledge" && this.searchService.session.displayed_on.split(":")[0] == "table" && attachActionDetails != null){
var lastSaved = $("onLoad_sys_updated_on");
var showOnNew = attachActionDetails.showOnNew;
var showAttach = showOnNew && (showOnNew + "") === "true" ? true: lastSaved && lastSaved.value;
if (showAttach && !this.getResult().related_links) {
this.overlay.addToolbarRightDecoration(this._format(this._ATTACH_KB_BUTTON, this.targetTable, attachActionDetails.actionLabel, attachActionDetails.actionValue), true);
this.attachKBButton = $("cxs_attach_kb");
this._observe(this.attachKBButton, this.attachArticle);
}
}
if (currentResult.related_links) {
var cxs_link_parent = "";
var isNewRecord = this.searchService.response.request.meta.is_new_record;
if (isNewRecord === false) {
cxs_link_parent += "&sysparm_view=catalog_default";
var tableName = this.searchService.response.request.meta.form.tn;
if (tableName)
cxs_link_parent += "&sysparm_parent_table=" + tableName;
var recordId = this.searchService.response.request.meta.form.sys_id;
if (recordId)
cxs_link_parent += "&sysparm_parent_sys_id=" + recordId;
}
for (var i = 0; i < currentResult.related_links.length; i++) {
var relatedLink = currentResult.related_links[i];
if (orderActionDetails != null) {
this.overlay.addToolbarRightDecoration(this._format(this._GOTO_SC_BUTTON, orderActionDetails.actionValue, orderActionDetails.actionLabel, getMessage("Navigates to catalog item page"), orderActionDetails.actionLabel), true);
this.attachSCButton = $("cxs_cat_item");
this._observe(this.attachSCButton, this.doRedirect);
this.redirectURL = relatedLink.link + cxs_link_parent;
}
}
}
if(typeof(thisHelpedActionDetails) !== 'undefined' && thisHelpedActionDetails !== null){
this.actionButtonId = "cxs_overlay_result_action";
this.actionButtonLabelId = "cxs_overlay_result_action_label";
this.overlay.addToolbarRightDecoration(this._format(this._ACTION_BUTTON, this.actionButtonId, thisHelpedActionDetails.actionValue, this.actionButtonLabelId, thisHelpedActionDetails.actionValue, thisHelpedActionDetails.actionLabel), true);
this._observe($("cxs_action_button"), this.doAction);
this._checkActionButton();
}
},
_checkOverlayButtonsForKupgrade: function(currentResult, config) {
if (currentResult.id.split(":")[0] == "kb_knowledge" && this.searchService.session.displayed_on.split(":")[0] == "table"){
var lastSaved = $("onLoad_sys_updated_on");
if (lastSaved && lastSaved.value) {
if(!this.getResult().related_links) {
this.overlay.addToolbarRightDecoration(this._format(this._ATTACH_KB_BUTTON, this.targetTable, getMessage("Attach"), "attach"), true);
this.attachKBButton = $("cxs_attach_kb");
this._observe(this.attachKBButton, this.attachArticle);
}
}
}
if (currentResult.related_links) {
for (var i = 0; i < currentResult.related_links.length; i++) {
var relatedLink = currentResult.related_links[i];
this.overlay.addToolbarRightDecoration(this._format(this._GOTO_SC_BUTTON, "order", getMessage("Order"), getMessage("Navigates to catalog item page"), getMessage("Order")), true);
this.attachSCButton = $("cxs_cat_item");
this._observe(this.attachSCButton, this.doRedirect);
this.redirectURL = relatedLink.link;
}
}
this.actionButtonId = "cxs_overlay_result_action";
this.actionButtonLabelId = "cxs_overlay_result_action_label";
this.overlay.addToolbarRightDecoration(this._format(this._ACTION_BUTTON, this.actionButtonId, config.result_action_value, this.actionButtonLabelId, config.result_action_value, config.result_action_label), true);
this._untickAction();
this._observe($("cxs_action_button"), this.doAction);
this._checkActionButton();
},
_checkButtons: function() {
var resultsLength = this.results.length;
if (this.index != resultsLength - 1 || this.searchService.hasMoreResults)
this._enableButton(this.nextButton);
else
this._disableButton(this.nextButton);
if (this.index > 0 || this.searchService.backAllowed)
this._enableButton(this.previousButton);
else
this._disableButton(this.previousButton);
},
_observe: function(element, func) {
element.stopObserving("mousedown");
element.observe("mousedown", function(event) {
func.call(this, event);
event.stop();
}.bind(this));
element.stopObserving("keydown");
element.observe("keydown", function(event) {
if (!(event.keyCode == 13 || event.keyCode == 32))
return;
func.call(this, event);
event.stop();
}.bind(this));
},
_enableButton: function(button) {
button.writeAttribute("aria-disabled", "false");
var imgSrc = button.firstChild.src;
button.firstChild.style.cssText = "cursor: pointer; margin: 0px;";
button.firstChild.src = this._ENABLED_ARROWS[button.readAttribute("id")];
button.removeClassName("disabled");
},
_disableButton: function(button) {
button.writeAttribute("aria-disabled", "true");
var imgSrc = button.firstChild.src;
button.firstChild.style.cssText = "cursor: default; margin: 0px;";
button.firstChild.src = this._DISABLED_ARROWS[button.readAttribute("id")];
button.addClassName("disabled");
},
_checkActionButton: function() {
var actionButton = $(this.actionButtonId);
if (!actionButton)
return;
var resultsActionButton = this._getResultsButton(actionButton.readAttribute("action-value"));
if (!resultsActionButton)
return;
var r = resultsActionButton.hasClassName("cxs_show_pill");
if (r)
this._tickAction();
else
this._untickAction();
this._toggleAriaCheckedForThisHelped(r);
},
_toggleAriaCheckedForThisHelped: function(val) {
var els = $j("button.cxs_action_button, img#cxs_overlay_result_action");
els.each(function(index, el) {
el.writeAttribute("aria-checked", val + "");
});
},
_toggleListDisplay: function(actionValue) {
var resultButton = this._getResultsButton(actionValue);
if (!resultButton)
return;
if (this._getResultsButton(actionValue).hasClassName("cxs_show_pill") && actionValue != "attach") {
this._getResultsButton(actionValue).removeClassName("cxs_show_pill");
this._getResultsButton(actionValue).addClassName("cxs_hide_pill");
} else {
this._getResultsButton(actionValue).removeClassName("cxs_hide_pill");
this._getResultsButton(actionValue).addClassName("cxs_show_pill");
}
},
_updateRecordFromAttach: function(names, article) {
names.push("comments");
names.push("description");
var target = null;
var targetName = null;
for (var i = 0; i != names.length; i++) {
targetName = names[i];
if (targetName.indexOf(this.feedback.session.sourceTable + ".") == 0)
targetName = targetName.substring(this.feedback.session.sourceTable.length + 1);
target = $(this.feedback.session.sourceTable + "." + targetName);
if (target)
break;
}
if (target) {
var ed = g_form.getGlideUIElement(targetName);
if (ed && ed.type == "reference")
g_form.setValue(targetName, article.id);
else {
var newValue = "";
if (target.value == "")
newValue = article.content;
else {
if(target.value.indexOf(article.content) >= 0)
return;
newValue = target.value + "\n" + article.content;
}
g_form.setValue(targetName, newValue);
g_form.fieldChanged(target.id, true);
}
return g_form.getLabelOf(targetName);
}
return null;
},
_tickAction: function() {
var actionButton = $(this.actionButtonId);
this._toggleAriaCheckedForThisHelped(true);
actionButton.writeAttribute("src", "images/icons/result_cached_true.gif");
actionButton.addClassName("cxs_header_icon_checked");
},
_untickAction: function() {
var actionButton = $(this.actionButtonId);
this._toggleAriaCheckedForThisHelped(false);
actionButton.writeAttribute("src", "images/icons/result_cached.gif");
actionButton.removeClassName("cxs_header_icon_checked");
},
_format: function(msg) {
if (!msg)
return "";
var str = msg;
for (var i = 1; i < arguments.length; i++) {
var paramIndex = i - 1;
var rx = new RegExp("\{[" + paramIndex + "]\}", "g");
str = str.replace(rx, arguments[i]);
}
return str;
},
type: "ResultsOverlay"
};
;
/*! RESOURCE: /scripts/search.service/doctype/ResultsOverlay.js */
ResultsOverlay.prototype._UP_BUTTON = "<button id='cxs_previous_result' class='btn btn-icon icon-arrow-up' title='" + getMessage("Previous result") + "' alt='" + getMessage("Previous result") +
"' aria-label='" + getMessage("Displays previous search result content") + "'></button>";
ResultsOverlay.prototype._DOWN_BUTTON = "<button id='cxs_next_result' class='btn btn-icon icon-arrow-down' title='" + getMessage("Next result") + "' alt='" + getMessage("Next result") +
"' aria-label='" + getMessage("Displays Next search result content ") + "'></button>";
ResultsOverlay.prototype._ACTION_BUTTON = "<button aria-label = '{4}' role = 'checkbox' aria-checked = 'false' id='cxs_action_button' class='btn btn-default cxs_action_button'>" +
"<i aria-hidden = 'true' class='icon-check-circle cxs_action_button_icon' id='{0}' action-value='{1}'></i>" +
"<span aria-hidden = 'true' id='{2}' action-value='{3}'>&nbsp;{4}</span>" +
"</button>";
ResultsOverlay.prototype._ATTACH_KB_BUTTON = "<button id='cxs_attach_kb' action-value='{2}' value='sysverb_attach' class='cxs_attach_kb' style='white-space:nowrap;' aria-label = '"+ getMessage("Attaches the knowledge article to this form on save") +"'>" + "{1} " + getMessage("to") + " {0}" + "</button>";
ResultsOverlay.prototype.previousResult = function() {
if (this.index > 0) {
this.setIndex(this.index - 1);
return this.render();
}
if (!this.searchService.backAllowed)
return;
this.rendered = false;
this.searchService.setAfterDataHandler(this.afterPageBack.bind(this));
this.searchService._gotoAction("back");
};
ResultsOverlay.prototype.nextResult = function() {
if (this.index < this.results.length - 1) {
this.setIndex(this.index + 1);
return this.render();
}
if (!this.searchService.hasMoreResults)
return;
this.rendered = false;
this.searchService.setAfterDataHandler(this.afterPageNext.bind(this));
this.searchService._gotoAction("next");
};
ResultsOverlay.prototype._checkButtons = function() {
var resultsLength = this.results.length;
if (this.index != resultsLength - 1 || this.searchService.hasMoreResults)
this.nextButton.enable();
else
this.nextButton.disable();
if (this.index > 0 || this.searchService.backAllowed)
this.previousButton.enable();
else
this.previousButton.disable();
};
ResultsOverlay.prototype._tickAction = function() {
var actionButton = $(this.actionButtonId);
actionButton.addClassName("icon-check-circle");
actionButton.removeClassName("icon-empty-circle");
actionButton.addClassName("cxs_header_icon_checked");
};
ResultsOverlay.prototype._untickAction = function() {
var actionButton = $(this.actionButtonId);
actionButton.addClassName("icon-empty-circle");
actionButton.removeClassName("icon-check-circle");
actionButton.removeClassName("cxs_header_icon_checked");
};
ResultsOverlay.prototype._observe = function(element, func) {
element.stopObserving("click");
element.observe("click", function(event) {
func.call(this, event);
}.bind(this));
};
;
/*! RESOURCE: /scripts/search.service/FeedbackService.js */
var FeedbackService = Class.create();
FeedbackService.HELPED = "helped";
FeedbackService.prototype = {
HTTP_OK: "200",
initialize: function(session) {
this.session = session;
},
sendFeedback: function(request, result, resultIndex, relevance, isActive, callback) {
if (!request || !result)
return;
this.callback = callback || null;
var originalSearchTerms = "";
if (ContextualSearchController.relatedSearchActive && $(ContextualSearchController.lastSearchField))
originalSearchTerms = $(ContextualSearchController.lastSearchField).value;
var feedback = {
session: this.session.id,
relevant_doc: result.id,
relevant_doc_url: result.link,
relevant: !isActive,
relevance: relevance,
score: result.meta['score'],
index: resultIndex,
displayed_on: this.session.displayed_on,
original_search_terms: originalSearchTerms,
search_request: request
};
if (!this.session.is_new) {
feedback.source_doc = this.session.sourceDoc;
feedback.source_doc_url = this.session.sourceUrl;
}
var glideAjax = new GlideAjax("XMLFeedbackService");
glideAjax.addParam("sysparm_name", "process");
glideAjax.addParam("payload", Object.toJSON(feedback));
glideAjax.getXML(this._responseHandler.bind(this));
},
_responseHandler: function(response) {
var reponseJSON = response.responseXML.documentElement.getAttribute("payload");
if (!reponseJSON){
this._invokeCallback();
return;
}
var response = reponseJSON.evalJSON();
if (response.status.code != this.HTTP_OK && this.isAdmin && g_form) {
var errorMsg = response.status.err_msg;
g_form.clearMessages();
g_form.addErrorMessage(new GwtMessage().getMessage("Feedback Service Error: {0}", errorMsg.join("<br/>")));
}
this._invokeCallback();
},
_invokeCallback: function() {
if (!this.callback)
return;
this.callback();
},
type: "FeedbackService"
}
;
/*! RESOURCE: /scripts/search.service/ContextualSearchController.js */
var ContextualSearchController = {
isAdmin: "",
errorMsg: "",
isA11yEnabled: "",
isDocType:"",
tableName:"",
resultThreshold:"",
waitTime:"",
expandOnOpen:"",
noResultsMsg:"",
searchingMsg:"",
loadingMoreResultsMsg:"",
moreResultsLoadingCompleteMsg:"",
shownAllResults:"",
searchCompleteMsg:"",
searchAsFieldLabel:"",
searchAsWarningMsg:"",
expandedClass:"",
collapsedClass:"",
collapsedSpacerClass:"",
relatedSearchActive : false,
lastSearchField : null,
checkSearchConfig: function(searchConfig) {
var configuredSearchFields = searchConfig.search_fields;
var availableSearchFields = [];
var defaultSearchFieldObj = null;
var fieldNames = [];
for (var i = 0; i != configuredSearchFields.length; i++) {
fieldNames.push(configuredSearchFields[i].name);
var elementId = searchConfig.table + "." + configuredSearchFields[i].field;
if ($(elementId)) {
availableSearchFields.push(elementId);
if (configuredSearchFields[i].default_config == "1") {
defaultSearchFieldObj = configuredSearchFields[i];
defaultSearchFieldObj.id = elementId;
}
}
}
if (availableSearchFields.length == 0) {
if (this.isAdmin)
g_form.addErrorMessage(new GwtMessage().getMessage("Search Service Error: The following fields are configured but cannot be found on the form:<br/>{0}", fieldNames.toString()));
var parentContainer2 = $("cxs_widget_container");
parentContainer2.hide();
return;
}
$("cxs_maximize_results").removeClassName("disabled");
if (searchConfig.srch_as_available && searchConfig.search_as_field) {
searchConfig.search_as_field_elem = $(searchConfig.table + "." + searchConfig.search_as_field);
var asUserId = g_form.getValue(searchConfig.search_as_field);
if (asUserId != "") {
var tabName = new GwtMessage().getMessage('{0} Results', g_form.getDisplayBox(searchConfig.search_as_field).value.escapeHTML());
$("cxs_ou_results_label").update(tabName);
if (asUserId == g_user.userID) {
$("cxs_ou_results_label").hide();
$("cxs_ou_results_label").up().addClassName("disabled");
}
}
}
if (searchConfig.srch_as_available && (!searchConfig.search_as_field || !searchConfig.search_as_field_elem)) {
$("cxs_ou_results_label").hide();
$("cxs_ou_results_label").up().addClassName("disabled");
if (this.isAdmin) {
var url = "<a href='" + searchConfig.configURL + "'>" + searchConfig.configDisplayValue + "</a>";
if (!searchConfig.search_as_field)
g_form.addErrorMessage(new GwtMessage().getMessage("Search Service Error: No search as user field defined for {0}", url));
else
g_form.addErrorMessage(new GwtMessage().getMessage("Search Service Error: The search as user field {0} cannot be found on the form", "<strong>"+_this.searchAsFieldLabel+"</strong>"));
}
}
this.activateSearchService(searchConfig, availableSearchFields, defaultSearchFieldObj);
},
activateSearchService: function(searchConfig, availableSearchFields, defaultSearchFieldObj) {
$$('a[data-type="attribute_knowledge"]').each(function(elem) {
elem.hide();
});
var searchContainer = $("cxs_search_container");
var targetElement = $("cxs_results_container");
var tabStrip = $("cxs_tab_strip");
var prevHoverIndex = undefined;
var _this = this;
function toggleBackground(index, toBeShown) {
Element.select(searchContainer, 'tr[data-kb-index="'+ index +'"]').
each(function(el) {
if (toBeShown)
el.addClassName('kb_hover');
else
el.removeClassName('kb_hover');
});
}
function onKBMouseLeave(event) {
var el = event.target || event.srcElement;
var currentHoverIndex = el.readAttribute('data-kb-index');
toggleBackground(currentHoverIndex, false);
el.stopObserving();
prevHoverIndex = undefined;
};
searchContainer.on('mouseover', 'tr.kb_info,tr.kb_fields', function(event, el) {
var currentHoverIndex = el.readAttribute('data-kb-index');
if (prevHoverIndex == currentHoverIndex)
return;
el.observe('mouseleave', onKBMouseLeave);
toggleBackground(currentHoverIndex, true);
prevHoverIndex = currentHoverIndex;
});
var session = {
is_new: g_form.isNewRecord(),
id: $("sysparm_cxs_session_id").value,
displayed_on: "table:" + g_form.getTableName(),
is_doctype: _this.isDocType
};
session.sourceTable = g_form.getTableName();
session.sourceTableName = _this.tableName;
session.sourceId = g_form.getUniqueValue();
session.sourceDoc = session.sourceTable + ":" + session.sourceId;
session.sourceUrl = session.sourceTable + ".do?sys_id=" + session.sourceId;
var noResultsHTML = '<div role = "alert" class="cxs_result_static_message" style="padding: 30px 0px 30px 0px; text-align: center; vertical-align: middle; font-weight: bolder;">'+_this.noResultsMsg+'</div>';
var searchingHTML = '<div role = "alert" class="cxs_result_static_message" style="padding: 30px 0px 30px 0px; text-align: center; vertical-align: middle; font-weight: bolder;">'+_this.searchingMsg+'</div>';
var resultsLoading = '<div role = "alert">'+ _this.loadingMoreResultsMsg+'</div>';
var moreResultsLoaded = '<div role = "alert">'+_this.moreResultsLoadingCompleteMsg+'</div>';
var showingAllResults = '<div role = "alert">'+_this.shownAllResults+'</div>';
var searchCompleted = '<div role = "alert">'+_this.searchCompleteMsg+'</div>';
if (_this.isA11yEnabled) {
var cxsStatus = $("cxs_aria_status");
var prevAriaMsgTimerId = 0;
searchContainer.observe(SearchService.prototype.CXS_SHOW_MORE_ACTIVATED, function(event) {
cxsStatus.update(resultsLoading);
});
searchContainer.observe(SearchService.prototype.EVENT_TARGET_UPDATED, function(event) {
if (!event.memo.window)
return;
var resultMsg = moreResultsLoaded;
if (event.memo.window.start == 0 && event.memo.window.end == 0) {
var ariaMsg = $('aria_msg');
resultMsg = ariaMsg.readAttribute("data-aria-msg");
resultMsg = '<div role = "alert">' + resultMsg + '</div>';
} else {
var isStart = event.memo.window.start == 0;
var hasMore = event.memo.vcr.hasMoreResults;
resultMsg = showingAllResults;
if (isStart && hasMore) {
resultMsg = searchCompleted;
} else if (!isStart && hasMore)
resultMsg = moreResultsLoaded
}
if (prevAriaMsgTimerId)
clearTimeout(prevAriaMsgTimerId)
prevAriaMsgTimerId = undefined;
prevAriaMsgTimerId = setTimeout(function() {
cxsStatus.update(resultMsg);
}, 2000);
});
}
var searchService = new SearchService(searchConfig, session, targetElement, availableSearchFields, _this.waitTime, _this.resultThreshold , _this.isAdmin, true);
_this.searchService = searchService;
searchService.macroNames["result_header_macro"] = "cxs_results_header_table";
searchService.macroNames["results_macro"] = "cxs_results_table";
searchService.macroNames["result_macro"] = "cxs_result_table";
searchService.hideOnEmptySearchTerm = false;
searchService.onClearHTML = noResultsHTML;
searchService.onSearchHTML = searchingHTML;
targetElement.update(noResultsHTML);
if (tabStrip)
$("cxs_ou_results_container").update(noResultsHTML);
var feedbackService = new FeedbackService(session);
var relatedSearchHelpIcon = $("related-search-help-icon");
function setRelatedSearchHelpText(field) {
if (!$("cxs_related_search"))
return;
if(!field)
relatedSearchHelpIcon.hide()
var labelText = g_form.getLabelOf(field);
var x = new GwtMessage();
var helpText = x.getMessage('By default, this displays results related to the \'{0}\' field', labelText);
relatedSearchHelpIcon.writeAttribute('aria-label', helpText);
relatedSearchHelpIcon.writeAttribute('data-original-title', helpText);
}
var firstFieldToSearch = "";
if (defaultSearchFieldObj) {
this.lastSearchField = defaultSearchFieldObj.id;
firstFieldToSearch = defaultSearchFieldObj.field
if (searchContainer.visible())
searchService.search($(this.lastSearchField), true);
} else {
for (var i = availableSearchFields.length - 1; i != -1; i--) {
if ($(availableSearchFields[i]).value != "") {
this.lastSearchField = availableSearchFields[i];
firstFieldToSearch = this.lastSearchField.substring(this.lastSearchField.lastIndexOf('.') + 1);
if (searchContainer.visible())
searchService.search($(this.lastSearchField), true);
break;
}
}
}
setRelatedSearchHelpText(firstFieldToSearch);
var relatedSearchField = $("cxs_related_search");
if (relatedSearchField && $(_this.lastSearchField))
relatedSearchField.placeholder = $(_this.lastSearchField).value;
availableSearchFields.each(function(elemId) {
var elem = $(elemId);
elem.observe("keyup", function(event) {
if (event.keyCode == 9 || event.keyCode == 16)
return;
if (relatedSearchField)
relatedSearchField.placeholder = this.value;
_this.lastSearchField = this.readAttribute("id");
if (_this.relatedSearchActive)
return;
prevHoverIndex = undefined;
searchService.search(this);
});
g_event_handlers.push(new GlideEventHandler("contextual_search.suggest.change", function(element, oldVal, newVal, loading, template) {
if (oldVal == newVal)
return;
if (relatedSearchField)
relatedSearchField.placeholder = newVal;
if (_this.relatedSearchActive)
return;
searchService.search(element);
_this.lastSearchField = element.readAttribute("id");
}, elemId));
}.bind(_this));
if (relatedSearchField) {
relatedSearchField.observe("keyup", function(event) {
if (event.keyCode == 9 || event.keyCode == 16)
return;
if (this.value) {
_this.relatedSearchActive = true;
searchService.search(this);
} else {
_this.relatedSearchActive = false;
searchService.search($(_this.lastSearchField));
}
});
}
_this.onPreviewResult = function(element) {
var initialIndex = element.readAttribute("data-index");
var cxsOverlay = new ResultsOverlay(searchService, initialIndex, feedbackService, {
id: "cxs_overlay",
height: "90%",
width: "80%",
});
cxsOverlay.render(true);
element.blur();
cxsOverlay.registerCallbackAfterClose(function() {
element.focus();
});
};
searchContainer.on("click", "button[id^='cxs_result_action']", function(event, element) {
Event.stop(event);
var index = element.readAttribute("data-index");
var actionValue = element.readAttribute("action-value");
feedbackService.sendFeedback(searchService.response.request, searchService.response.results[index], index, actionValue, element.parentNode.hasClassName("cxs_show_pill"));
if (element.parentNode.hasClassName("cxs_show_pill")) {
element.parentNode.removeClassName("cxs_show_pill");
element.parentNode.addClassName("cxs_hide_pill");
} else {
element.parentNode.removeClassName("cxs_hide_pill");
element.parentNode.addClassName("cxs_show_pill");
}
}.bind(_this));
_this.onResultAttach = function(element) {
var index = element.readAttribute("data-index");
var actionValue = element.readAttribute("action-value");
var currentResult = searchService.response.results[index];
var kb_attachment = currentResult.searchResultActions ? JSON.parse(currentResult.searchResultActions.attach).attachType: searchService.searchConfig.kb_attachment;
var ajax = new GlideAjax("cxs_Knowledge");
ajax.addParam("sysparm_name", "getArticleInfo");
ajax.addParam("sysparm_kb_sys_id", currentResult.id.split(":")[1]);
ajax.addParam("sysparam_kb_insert_as_link", kb_attachment);
ajax.getXMLAnswer(function(answer) {
var articleInfo = answer.evalJSON();
if (!articleInfo.article.id || articleInfo.article.id == "") {
g_form.addInfoMessage(getMessage("Could not attach article details"));
return;
}
var targetField = null;
var names = articleInfo.fields;
var article = articleInfo.article;
names.push("comments");
names.push("description");
var target = null;
var targetName = null;
for (var i = 0; i != names.length; i++) {
targetName = names[i];
if (targetName.indexOf(g_form.getTableName() + ".") != -1)
target = $(targetName);
else
target = $(g_form.getTableName() + "." + targetName);
if (target)
break;
}
if (target) {
var ed = g_form.getGlideUIElement(targetName);
if (ed && ed.type == "reference")
g_form.setValue(targetName, article.id);
else {
var newValue = "";
if (target.value == "")
newValue = article.content;
else {
if (target.value.indexOf(article.content) >= 0)
return;
newValue = target.value + "\n" + article.content;
}
g_form.setValue(targetName, newValue);
g_form.fieldChanged(target.id, true);
}
targetField = g_form.getLabelOf(targetName);
}
if (targetField != null) {
var title = currentResult.title.escapeHTML();
g_form.addInfoMessage(new GwtMessage().getMessage("Details of {0} have been added to the {1} field", title, targetField));
}
}.bind(_this));
feedbackService.sendFeedback(searchService.response.request, searchService.response.results[index],index, actionValue, false);
}
_this.onCatalogOrder = function(element) {
var index = element.readAttribute("data-index");
var actionValue = element.readAttribute("action-value");
feedbackService.sendFeedback(searchService.response.request, searchService.response.results[index],index, actionValue, false, function () {
window.location.href = element.readAttribute("data-url");
});
};
_this.toggleHeaderIcon = function(event) {
var icon = $("cxs_maximize_results").down("i");
if (icon) {
icon.toggleClassName(ContextualSearchController.expandedClass);
icon.toggleClassName(ContextualSearchController.collapsedClass);
icon.toggleClassName(ContextualSearchController.collapsedSpacerClass);
}
};
_this.toggleMaximiseResults = function(element, event) {
if (event)
Event.stop(event);
var btnMaximizeResults = $("cxs_maximize_results");
if (searchContainer.visible()) {
searchContainer.hide();
btnMaximizeResults.writeAttribute('aria-expanded', 'false');
}
else {
btnMaximizeResults.writeAttribute('aria-expanded', 'true');
searchContainer.show();
if (!_this.relatedSearchActive && $(_this.lastSearchField))
searchService.search($(_this.lastSearchField), true);
}
_frameChanged();
};
_this.maximizeHeaderIcon = function(event) {
if (!_this.isDocType)
return;
var icon = $("cxs_maximize_results").down("i");
if (icon.hasClassName("icon-chevron-down"))
return;
_this.toggleHeaderIcon($("cxs_maximize_results"), event);
};
searchContainer.observe("cxs:force_display_results", function(event) {
if (searchContainer.visible())
return;
var el = $("cxs_maximize_results");
_this.toggleMaximiseResults(el,event);
_this.maximizeHeaderIcon(event);
el.writeAttribute('aria-expanded', 'true');
}.bind(_this));
if (_this.isDocType) {
if (tabStrip) {
tabStrip.on("click", "li", function(event, element) {
if ((element.hasClassName("active") && !element.hasClassName('justselected')) || element.hasClassName("disabled"))
return;
var tabHeader = element.down("a").readAttribute("aria-controls");
searchService.saveState(searchService.targetElement.id);
searchService.restoreState(tabHeader);
searchService.targetElement = $(tabHeader);
if (tabHeader == "cxs_ou_results_container") {
searchService.search_as = g_form.getValue(searchConfig.search_as_field);
searchService.resultsMsg = _this.searchAsWarningMsg;
if (searchService.search_as != "" && searchService.search_as != null)
searchService.search(null ,true);
} else {
searchService.search_as = "";
searchService.resultsMsg = "";
searchService.search(null, true);
}
});
}
}
if (!_this.isDocType) {
if (tabStrip) {
tabStrip.on("click", ".tab_header", function(event, element) {
Event.stop(event);
if (element.down(".tabs2_active") || element.down(".disabled"))
return;
var tabHeader = element.readAttribute("data-controls");
searchService.saveState(searchService.targetElement.id);
searchService.restoreState(tabHeader);
searchService.targetElement = $(tabHeader);
$("cxs_header").down(".tabs2_tab").toggleClassName("tabs2_active");
$("cxs_results_container").toggle();
$("cxs_ou_header").down(".tabs2_tab").toggleClassName("tabs2_active");
$("cxs_ou_results_container").toggle();
if (tabHeader == "cxs_ou_results_container") {
searchService.search_as = g_form.getValue(searchConfig.search_as_field);
searchService.resultsMsg = _this.searchAsWarningMsg;
if (searchService.search_as != "" && searchService.search_as != null)
searchService.search(null ,true);
} else {
searchService.search_as = "";
searchService.resultsMsg = "";
searchService.search(null, true);
}
});
}
}
if (searchConfig.srch_as_available && searchConfig.search_as_field_elem) {
CustomEvent.observe("change.handlers.run", function(tableName, fieldName) {
if (fieldName != searchConfig.search_as_field)
return;
var asUserId = g_form.getValue(searchConfig.search_as_field);
if (asUserId != "") {
var tabName = new GwtMessage().getMessage('{0} Results', g_form.getDisplayBox(searchConfig.search_as_field).value.escapeHTML());
$("cxs_ou_results_label").update(tabName);
if (asUserId == g_user.userID) {
$("cxs_ou_results_label").hide();
$("cxs_ou_results_label").up().addClassName("disabled");
} else {
$("cxs_ou_results_label").up().removeClassName("disabled");
$("cxs_ou_results_label").show();
}
if (searchService.search_as != "")
searchService.search(null, true);
} else {
$("cxs_ou_results_label").hide();
$("cxs_ou_results_label").up().addClassName("disabled");
}
});
}
searchContainer.observe(searchService.EVENT_TARGET_UPDATED, function() {
Event.fire(searchService.targetElement, "cxs:force_display_results");
});
if (_this.expandOnOpen) {
Event.fire(searchService.targetElement, "cxs:force_display_results");
}
addUnloadEvent(function() {
searchService._stop();
targetElement.stopObserving();
availableSearchFields.each(function(elemId) {
$(elemId).stopObserving();
});
});
window.NOW = window.NOW || {};
window.NOW.cxs_searchService = searchService;
CustomEvent.fire(searchService.EVENT_SEARCH_SERVICE_ACTIVATED);
}
};
function cxs_onToggleResults(el) {
ContextualSearchController.toggleMaximiseResults(el);
if (ContextualSearchController.isDocType)
ContextualSearchController.toggleHeaderIcon(el);
}
function cxs_onPreviewResult(el) {
ContextualSearchController.onPreviewResult(el);
}
function cxs_onResultAttach(el) {
ContextualSearchController.onResultAttach(el);
}
function cxs_onCatalogOrder(el) {
ContextualSearchController.onCatalogOrder(el);
}
function cxs_onShowMore(el) {
ContextualSearchController.searchService.onShowMore(el);
}
;
;
