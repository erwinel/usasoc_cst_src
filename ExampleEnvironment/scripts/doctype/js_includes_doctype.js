/// <reference path="../lib/prototype.min.js" />
/// <reference path="../lib/glide_updates/prototype.js" />
/// <reference path="../lib/glide_updates/prototype.template.js" />
/// <reference path="../lib/labjs/LAB.min.js" />
/// <reference path="../ScriptLoader.js" />
/// <reference path="../consts/GlideEvent.js" />
/// <reference path="../functions/textutil.js" />
/// <reference path="functions_bootstrap14.js" />
/// <reference path="../functions/xmlhttp.js" />
/// <reference path="../classes/event/GwtObservable.js" />
/// <reference path="CustomEventManager.js" />
/// <reference path="../classes/ui/Point.js" />
/// <reference path="../classes/util/CookieJar.js" />
/// <reference path="../list_filter.js" />
/// <reference path="simpleStorage.js" />
/// <reference path="GwtMessage14.js" />
/// <reference path="../classes/GlideFilterDescription.js" />
/// <reference path="../classes/GlideFilterHandlers.js" />
/// <reference path="../classes/GlideDuration.js" />
/// <reference path="../classes/GlideFilterReference.js" />
/// <reference path="../classes/GlideFilterVariables.js" />
/// <reference path="../classes/GlideFilterQuestions.js" />
/// <reference path="../classes/GlideFilterItemVariables.js" />
/// <reference path="../classes/GlideFilterVariableMap.js" />
/// <reference path="../classes/GlideFilterLabels.js" />
/// <reference path="../classes/GlideFilterReferenceMulti.js" />
/// <reference path="../classes/GlideFilterDate.js" />
/// <reference path="../classes/GlideEventHandler.js" />
/// <reference path="../classes/GlideUIElement.js" />
/// <reference path="../classes/GlideUser.js" />
/// <reference path="GlideForm14.js" />
/// <reference path="GwtContextMenu.js" />
/// <reference path="functions.js" />
/// <reference path="../scoped_object_generators.js" />
/// <reference path="../functions_reference.js" />
/// <reference path="../functions_onchange.js" />
/// <reference path="../functions_fontsizer.js" />
/// <reference path="../functions_attachments.js" />
/// <reference path="../functions_calendar.js" />
/// <reference path="../functions_email.js" />
/// <reference path="../functions_user_image.js" />
/// <reference path="../formatting.js" />
/// <reference path="utils14.js" />
/*! RESOURCE: /scripts/accessibility_tabindex.js */
addLoadEvent(function () {
    $(document).on('keydown', '*[tabindex], .glide_ref_item_link', function (event) {
        if (event.keyCode != Event.KEY_RETURN)
            return;
        var element = event.element();
        if (!element.hasAttribute('tabindex'))
            return;
        if (element.click)
            element.click();
        event.stop();
    });
    if (typeof jQuery != 'undefined') {
        jQuery('[click-on-enter]').on('keydown', function (event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode != 13)
                return;
            var $this = jQuery(this);
            setTimeout(function () {
                $this.trigger('click');
            }, 200);
        });
    }
});
;
/*! RESOURCE: /scripts/accessibility_readonly.js */
addLateLoadEvent(function () {
    document.body.on('click', 'input.disabled', blockValueChange);
    function blockValueChange(evt, element) {
        var type = element.type;
        if (type.match('radio|checkbox')) {
            element.checked = !element.checked;
            evt.stop();
            return false;
        }
    }
});
;
/*! RESOURCE: /scripts/doctype/ariaLiveService.js */
(function (window, document) {
    window.NOW = window.NOW || {};
    function ariaLivePolite(text, delay) {
        setTimeout(_ariaLiveMessage, delay || 0, text, false);
    }
    function ariaLiveAssertive(text, delay) {
        setTimeout(_ariaLiveMessage, delay || 0, text, true);
    }
    function _ariaLiveMessage(text, assertive) {
        var ariaLiveId = !!assertive
            ? 'html_page_aria_live_assertive'
            : 'html_page_aria_live_polite';
        var ariaLive = document.getElementById(ariaLiveId);
        if (!ariaLive)
            return;
        if (window.NOW.ariaLiveDisabled)
            return;
        if (ariaLive.children.length > 50 || (ariaLive.children.length > 0 && ariaLive.textContent.length > 10000))
            ariaLive.children[0].remove();
        ariaLive.insertAdjacentText('beforeEnd', text);
    }
    CustomEvent.observe('global_aria_live_polite', ariaLivePolite);
    CustomEvent.observe('global_aria_live_assertive', ariaLiveAssertive);
    window.NOW.accessibility = window.NOW.accessibility || {};
    window.NOW.accessibility['ariaLivePolite'] = ariaLivePolite;
    window.NOW.accessibility['ariaLiveAssertive'] = ariaLiveAssertive;
})(window, document);
;
/// <reference path="../classes/ajax/GlideURL.js" />
/*! RESOURCE: /scripts/ga_batch/batchedGlideAjax.js */
window.NOW.batchedGlideAjax = function batchedGlideAjax(toProcess) {
    var batchGA = new GlideAjax("AJAXXMLHttpAggregator");
    batchGA.disableRunInBatch();
    function batchErrorHandler(onCompletionFn) {
        return function (error) {
            console.log("BatchedGlideAjax: Got error", error);
            toProcess.forEach(function (ga) {
                handleChildResponseError({
                    status: 500,
                    glideAjax: ga,
                    error: "Batch failed"
                });
            });
            if (onCompletionFn)
                onCompletionFn([]);
        }
    }
    function batchResponseHandler(onCompletionFn) {
        return function (response) {
            console.log("BatchedGlideAjax: Got response", response);
            if (!response || !response.responseXML) {
                batchErrorHandler(onCompletionFn)(response);
                return;
            }
            var doc = response.responseXML.documentElement;
            if (!doc || !doc.childNodes) {
                batchErrorHandler(onCompletionFn)(response);
                return;
            }
            var unprocessedGas = processIndividualResponses(Array.prototype.slice.apply(doc.childNodes));
            if (onCompletionFn)
                onCompletionFn(unprocessedGas);
        }
    }
    function processIndividualResponses(nodes) {
        var processedIndicies = [];
        nodes.forEach(function (node) {
            var response = responseNode(node);
            try {
                if (response.succeeded)
                    handleChildResponseSuccess(response);
                else
                    handleChildResponseError(response);
            }
            catch (e) {
                console.warn("BatchedGlideAjax: Error processing child response", response, ":", e);
            }
            finally {
                processedIndicies.push(response.queueIndex);
            }
        });
        return toProcess.filter(function (ga, idx) {
            return processedIndicies.indexOf(idx) < 0;
        });
    }
    function responseNode(node) {
        var processorIdx = ~~node.getAttribute("sysparm_processor_index");
        if (processorIdx < 0 || processorIdx >= toProcess.length) {
            console.error("BatchedGlideAjax: Processor index " + processorIdx + " out of bounds for batch queue", toProcess);
            return null;
        }
        var ga = toProcess[processorIdx];
        var status = ~~node.getAttribute("status");
        var error = node.getAttribute("error");
        var answer = node.getAttribute("answer");
        var responseDocument = null;
        return {
            queueIndex: processorIdx,
            status: status,
            error: error,
            answer: answer,
            glideAjax: ga,
            succeeded: status >= 200 && status < 300,
            get responseDocument() {
                if (responseDocument == null) {
                    responseDocument = document.implementation.createDocument("", "", null);
                    var clonedNode = responseDocument.importNode(node, true);
                    responseDocument.appendChild(clonedNode);
                }
                return responseDocument;
            }
        };
    }
    function handleChildResponseError(response) {
        var errorObject = {
            status: response.status,
            statusText: response.error,
            error: response.error,
            description: response.error,
            responseText: response.error
        };
        var ga = response.glideAjax;
        if (ga.errorCallbackFunction)
            setTimeout(function () {
                ga.errorCallbackFunction(errorObject, ga.callbackArgs)
            }, 0);
    }
    function handleChildResponseSuccess(response) {
        var ga = response.glideAjax;
        if (!ga.callbackFunction)
            return;
        if (ga.wantAnswer) {
            var answer = response.answer;
            setTimeout(function () {
                ga.callbackFunction(answer, ga.callbackArgs);
            }, 0);
        } else {
            var requestObject = {
                responseXML: response.responseDocument,
                status: status
            };
            setTimeout(function () {
                ga.callbackFunction(requestObject, ga.callbackArgs)
            }, 0);
        }
    }
    function addParamsToBatch(params, index) {
        var param;
        if (!params)
            return;
        for (param in params) {
            if (!params.hasOwnProperty(param))
                continue;
            batchGA.addParam(index + '.' + param, params[param]);
        }
    }
    function decodeFormURI(value) {
        value = value ? value.replace(/\+/g, '%20') : value;
        return decodeURIComponent(value);
    }
    function addCustomQueryStringToBatch(qs, index) {
        if (!qs)
            return;
        if (qs.startsWith('?'))
            qs = qs.substring(1);
        var params = qs.split('&');
        params.forEach(function (param) {
            var nameValuePair = param.split('=');
            var name = decodeFormURI(nameValuePair[0]);
            var value = decodeFormURI(nameValuePair[1]);
            batchGA.addParam(index + '.' + name, value);
        });
    }
    return {
        execute: function (unprocessedCallback) {
            toProcess.forEach(function (ga, idx) {
                addParamsToBatch(ga.params, idx);
                addParamsToBatch(ga.additionalProcessorParams, idx);
                addCustomQueryStringToBatch(ga.postString, idx);
            });
            batchGA.addParam("sysparm_aggregation_size", toProcess.length);
            batchGA.setErrorCallback(batchErrorHandler(unprocessedCallback));
            batchGA.getXML(batchResponseHandler(unprocessedCallback));
        }
    }
};
;
/*! RESOURCE: /scripts/ga_batch/glideAjaxBatchQueue.js */
window.NOW.GlideAjaxBatchRequestQueue = (function () {
    var queue = [];
    var startProcessingTimeout;
    var MAX_TIME_IN_QUEUE = window.NOW.batch_glide_ajax_requests_max_time_in_queue || 50;
    if (MAX_TIME_IN_QUEUE < 0)
        MAX_TIME_IN_QUEUE = 50;
    function processQueue() {
        clearProcessingTimeout();
        var toProcess = queue.slice(0);
        if (toProcess.length == 0)
            return;
        var batchGa = window.NOW.batchedGlideAjax(toProcess);
        batchGa.execute(function requeueUnprocessed(unprocessedGas) {
            queue = unprocessedGas.concat(queue);
            processQueue();
        }
        );
        queue.length = 0;
    }
    function clearProcessingTimeout() {
        if (startProcessingTimeout) {
            clearTimeout(startProcessingTimeout);
            startProcessingTimeout = undefined;
        }
    }
    return {
        enqueue: function (glideAjax) {
            queue.push(glideAjax);
            if (!startProcessingTimeout)
                startProcessingTimeout = setTimeout(processQueue, MAX_TIME_IN_QUEUE);
        },
        processQueue: processQueue
    }
})();
;
;
/// <reference path="../classes/ajax/GlideAjax.js" />
/// <reference path="../classes/ajax/GlideAjaxForm.js" />
/// <reference path="../calendar.js" />
/// <reference path="../functions_clipboard.js" />
/*! RESOURCE: /scripts/context_actions.js */
function switchView(type, tableName, viewName) {
    ScriptLoader.getScripts('scripts/classes/GlideViewManager.js', function () {
        if (type == 'list')
            new GlideViewManager(tableName, viewName).refreshList();
        else
            new GlideViewManager(tableName, viewName).refreshDetail();
    })
}
function copyRowToClipboard(base, ref, sysId, view) {
    var url = base + "nav_to.do?uri=" + ref + ".do?sys_id=" + sysId;
    if (view)
        url += "%26sysparm_view=" + view;
    copyToClipboard(url);
}
function doUpdate(scope) {
    var name = gActiveContext.getTableName();
    var temp = name + '_update.do';
    var form = getControlForm(name);
    var msg = ['There are no rows selected', 'Update the entire list?', 'records'];
    var answer = getMessages(msg);
    if (scope == 'selected' && getChecked(form) == '') {
        alert(answer['There are no rows selected']);
        return;
    }
    form.action = temp;
    addInput(form, 'HIDDEN', 'sys_action', 'sysverb_multiple_update');
    addInput(form, 'HIDDEN', 'sysparm_multiple', 'true');
    addInput(form, 'HIDDEN', 'sysparm_nostack', 'yes');
    if (scope == 'selected')
        populateParmQuery(form, 'sys_idIN', 'NULL');
    else {
        if (!confirm(answer['Update the entire list?'] + " ("
            + form.sysparm_total_rows.value + " " + answer['records'] + ")")) {
            return;
        }
    }
    form.submit();
}
function contextAction(tableName, actionName) {
    var form = getControlForm(tableName);
    addInput(form, 'HIDDEN', 'sys_action', actionName);
    form.submit();
}
function contextConfirm(tableName, actionName) {
    var sysparm_rows = gel('sysparm_total_rows').value;
    var num_rows = parseInt(sysparm_rows);
    var sysparm_query = gel('sysparm_query');
    if (sysparm_query)
        sysparm_query = sysparm_query.value;
    else
        sysparm_query = '';
    var sysparm_view = getView(tableName);
    if (num_rows < g_export_warn_threshold) {
        var dialog = new GwtPollDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, actionName);
        dialog.execute();
        return;
    }
    var dialog = new GwtExportScheduleDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, actionName);
    dialog.execute();
}
function executeRecentSearch(searchTerm, url) {
    parent.document.getElementById('sysparm_search').value = decodeURIComponent(searchTerm);
    window.open(url, 'gsft_main');
    CustomEvent.fire('adjustsearch');
}
function getView(tableName) {
    var sysparm_view = '';
    if (isReport()) {
        var form = getControlForm(tableName);
        if (form) {
            var temp = form['sysparm_view'];
            if (temp)
                sysparm_view = temp.value;
        }
    }
    if (sysparm_view != '')
        return sysparm_view;
    var sp = gel('sysparm_view');
    if (sp)
        sysparm_view = sp.value;
    return sysparm_view;
    function isReport() {
        var list = gel('reportform_control');
        if (list)
            return true;
        return false;
    }
}
var copyToClipboard = typeof window.NOW.g_clipboard !== 'undefined' ? window.NOW.g_clipboard.copyToClipboard : null;
function showQuickForm(id, action, width, height) {
    var form;
    var tableName;
    var srcElement;
    var keyset;
    if (window.lastEvent) {
        srcElement = getSrcElement(window.lastEvent);
        form = srcElement.form;
        if (srcElement.tagName == "SELECT") {
            var o = srcElement.options[srcElement.selectedIndex];
            tableName = o.getAttribute("table");
        } else
            tableName = srcElement.getAttribute("table");
        if ((action == undefined || action == '') && srcElement.value)
            action = srcElement.value;
        if (!form)
            keyset = g_list.getChecked();
        else
            keyset = getChecked(form);
        window.lastEvent = null;
    }
    if (tableName == undefined) {
        if (typeof (gcm) == 'undefined')
            gcm = crumbMenu;
        tableName = gcm.getTableName();
        form = getFormForList(tableName);
        if (typeof (rowSysId) != 'undefined')
            keyset = rowSysId;
        else
            keyset = getChecked(form);
        gcm.setFiringObject();
    }
    if ((!form && !tableName) || (!tableName && g_list))
        return;
    if (!keyset || keyset == '') {
        alert("No records selected");
        return;
    }
    var gForm = new GlideDialogForm("", tableName + "_update");
    if (width && height)
        gForm.setDialogSize(width, height);
    gForm.addParm('sysparm_view', id);
    gForm.setMultiple(form);
    gForm.addParm('sysparm_checked_items', "sys_idIN" + keyset);
    if (action && action != '')
        gForm.addParm('sysparm_action_name', action);
    gForm.render();
}
function personalizeResponses(id) {
    var parts = id.split('.');
    var mytable = parts[0];
    var myfield = parts[1];
    var myreferurl = document.getElementById('sysparm_this_url_enc');
    var url = "response_list.do?sysparm_name=" + mytable +
        "&sysparm_element=" + myfield +
        "&sysparm_target=" + id +
        "&sysparm_view=sys_response_tailor";
    if (myreferurl)
        url += "&sysparm_referring_url=" + myreferurl.value;
    self.location = url;
}
function personalizeChoices(id) {
    var mytable = id.split('.')[0];
    var mydependent = document.getElementById('ni.dependent_reverse.' + id);
    var url = new GlideURL("slushbucket_choice.do");
    url.addParam('sysparm_ref', id);
    url.addParam('sysparm_form', 'sys_choice');
    url.addParam('sysparm_dependent', (mydependent ? mydependent.value : ""));
    url.addParam('sysparm_stack', 'no');
    if (mydependent != null) {
        var el = document.getElementsByName(mytable + "." + mydependent.value)[0];
        if (el != null) {
            var selectValue;
            if (el.options)
                selectValue = el.options[el.selectedIndex].value;
            else
                selectValue = el.value;
            url.addParam('sysparm_dependent_value', selectValue);
        }
    }
    self.location = url.getURL();
}
function personalizeControl(strIdent, id, query) {
    var url = 'sys_ui_list_control.do?sys_id=' + id;
    if (query && query != '')
        url += "&sysparm_query=" + query;
    window.location = url;
}
function personalizer(strIdent, strForm, strSysId) {
    if (strIdent == 'auto' && window.$j) {
        strIdent = $j('[data-section-id]').first().attr('data-section-id');
    }
    var parentForm = getControlForm(strIdent);
    var form = document.forms['sys_personalize'];
    if (parentForm && parentForm['sysparm_collection_relationship'])
        addInput(form, 'HIDDEN', 'sysparm_collection_relationship', parentForm['sysparm_collection_relationship'].value);
    else
        addInput(form, 'HIDDEN', 'sysparm_collection_relationship', '');
    addInput(form, 'HIDDEN', 'sysparm_list', strIdent);
    addInput(form, 'HIDDEN', 'sysparm_form', strForm);
    addInput(form, 'HIDDEN', 'sysparm_sys_id', strSysId);
    if (parentForm && parentForm['sysparm_collection'])
        addInput(form, 'HIDDEN', 'sysparm_collection', parentForm['sysparm_collection'].value);
    var scopeElement = gel('sysparm_domain_scope');
    if (scopeElement && scopeElement.value) {
        addInput(form, 'HIDDEN', 'sysparm_domain_scope', scopeElement.value);
    }
    if (typeof GlideTransactionScope != 'undefined') {
        GlideTransactionScope.appendTransactionScope(function (name, value) {
            addInput(form, 'HIDDEN', name, value);
        });
    }
    form.submit();
}
function personalizeList(listId, tableName) {
    var parentForm = getFormForList(listId);
    var form = document.forms['sys_personalize'];
    if (parentForm && parentForm['sysparm_collection_relationship'])
        addInput(form, 'HIDDEN', 'sysparm_collection_relationship', parentForm['sysparm_collection_relationship'].value);
    else
        addInput(form, 'HIDDEN', 'sysparm_collection_relationship', '');
    addInput(form, 'HIDDEN', 'sysparm_list', tableName);
    addInput(form, 'HIDDEN', 'sysparm_form', 'list');
    if (parentForm && parentForm['sysparm_collection'])
        addInput(form, 'HIDDEN', 'sysparm_collection', parentForm['sysparm_collection'].value);
    else
        addInput(form, 'HIDDEN', 'sysparm_collection', '');
    if (typeof GlideTransactionScope !== 'undefined') {
        GlideTransactionScope.appendTransactionScope(function (name, value) {
            addInput(form, 'HIDDEN', name, value);
        });
    }
    form.submit();
}
function personalizeField(identifier, formName) {
    var form = document.forms['sys_personalize'];
    var fields = 'name.element.language';
    if (formName && formName.indexOf('sys_dictionary') == 0)
        fields = 'name.element';
    addQueryFilter(form, fields, identifier, '', formName);
    form.action = formName;
    form.submit();
}
function personalizeFields(identifier, formName) {
    var form = document.forms['sys_personalize'];
    addQueryFilter(form, 'name', identifier);
    form.action = formName;
    form.submit();
}
function personalizeSecurity(identifier, field_name) {
    var a = field_name.split('.');
    var g_dialog = new GlideDialogWindow('security_mechanic');
    g_dialog.setPreference('table_name', a[0]);
    g_dialog.setPreference('field_name', a[1]);
    g_dialog.setSize(600, '');
    g_dialog.setTitle('Security Mechanic');
    g_dialog.render();
}
function showDictionary(identifier, field_id) {
    var a = field_id.split('.');
    var g_dialog = new GlideDialogWindow('dictionary_viewer');
    g_dialog.setPreference('table_name', a[0]);
    g_dialog.setPreference('field_name', a[1]);
    g_dialog.setTitle('Dictionary Info: ' + field_id);
    g_dialog.render();
}
function listSecurity(identifier, field_name) {
    var form = document.forms['sys_personalize'];
    addQueryFilter(form, 'CALCULATED:SecurityQueryCalculator', field_name);
    form.action = "sys_security_acl_list.do";
    form.submit();
}
function listCollection(coll_table, coll_field, of_table, view_name) {
    var form = document.forms['sys_personalize'];
    addQueryFilter(form, 'CALCULATED:CollectionQueryCalculator', of_table + ',' + coll_field + ',' + view_name);
    addInput(form, 'HIDDEN', 'sysparm_domain_restore', 'false');
    form.action = coll_table + "_list.do";
    form.submit();
}
function exportToPDF(table, sys_id, isLandscape, sysparm_view, sysparm_domain) {
    var relatedListFilters = "";
    if (window.g_tabs2List && g_tabs2List.tabIDs) {
        var relatedLists = g_tabs2List.tabIDs;
        var relatedListCount = relatedLists.length;
        if (relatedListCount > 0) {
            for (var i = 0; i < relatedListCount; i++) {
                var relatedListName = relatedLists[i].substring(0, relatedLists[i].lastIndexOf("_list"));
                var filter = getFilter(relatedListName);
                if (filter && filter.length > 0) {
                    if (i == relatedListCount - 1)
                        relatedListFilters += relatedListName + "=" + encodeURIComponent(encodeURIComponent(filter));
                    else
                        relatedListFilters += relatedListName + "=" + encodeURIComponent(encodeURIComponent(filter)) + "^";
                }
            }
        }
    }
    var url = table + ".do?sys_id=" + sys_id + "&PDF" + "&sysparm_view=" + sysparm_view + "&related_list_filter=" + relatedListFilters + "&sysparm_domain=" + sysparm_domain;
    if (isLandscape)
        url += "&landscape=true";
    window.location = url;
}
function showList(tableName, fields, ids) {
    if (!ids)
        ids = gActiveContext.getTableName();
    self.location = tableName + "_list.do?sysparm_query=" + addQueryFilter('', fields, ids, tableName);
}
function showItem(tableName, fields, ids, view) {
    if (!ids)
        ids = gActiveContext.getTableName();
    var url = tableName + ".do?sysparm_query=" + addQueryFilter('', fields, ids, tableName);
    if (typeof (view) != "undefined") {
        url += "&sysparm_view=" + view;
    }
    self.location = url;
}
function addQueryFilter(form, names, values, table, formName) {
    var tableName = table;
    if ((names == '' || names == null) || (values == '' || values == null))
        return;
    if (names.indexOf("CALCULATED") == 0) {
        var ec = "";
        if (names.indexOf("CollectionQueryCalculator") > 0)
            ec = collectionQueryCalculator(values);
        else
            ec = securityQueryCalculator(values);
        addInput(form, "HIDDEN", "sysparm_query", ec);
        addInput(form, "HIDDEN", "sysparm_query_encoced", ec);
        return;
    }
    var vNames = names.split(".");
    var vValues = values.split(".");
    if (names.indexOf("name.element") == 0) {
        if (vValues.length > 2) {
            var tableElement = TableElement.get(values);
            vValues[0] = tableElement.getTableName();
            vValues[1] = tableElement.getName();
        } else {
            var tableR = new Table(vValues[0]);
            var element = tableR.getElement(vValues[1]);
            var label = '';
            if (formName && formName.indexOf("sys_documentation") == 0)
                label = getTableLabel(tableR.getName(), element.getName());
            if (label == '' && element != null)
                vValues[0] = element.getTableName();
        }
    }
    if (names.indexOf("name.element.language") == 0) {
        vValues[2] = g_lang;
    }
    var query = new Array();
    for (var i = 0; i < vNames.length; i++) {
        if ("sys_choice" == tableName && "name" == vNames[i]) {
            query.push("nameINjavascript:getTableExtensions('" + vValues[i] + "')");
        }
        else if ("sys_ui_style" == tableName && "name" == vNames[i]) {
            query.push(buildQueryClause(values.split(".")[0], "name"));
        }
        else
            query.push(vNames[i] + "=" + vValues[i]);
    }
    if (tableName)
        return query.join('^');
    addInput(form, "HIDDEN", "sysparm_query", query.join('^'));
    addInput(form, "HIDDEN", "sysparm_query_encoded", query.join('^'));
    setStack(form);
}
function getTableLabel(tabel, element) {
    var ajax = new GlideAjax('ContextActionsAjax');
    ajax.addParam("sysparm_name", "getLabel");
    ajax.addParam("sysparm_type", tabel);
    ajax.addParam("sysparm_value", element);
    ajax.getXMLWait();
    return ajax.getAnswer();
}
function collectionQueryCalculator(args) {
    var sa = args.split(",");
    var tableName = sa[0];
    var collField = sa[1];
    return buildQueryClause(tableName, collField);
}
function buildQueryClause(tableName, collField) {
    var tableDef = Table.get(tableName);
    var tables = tableDef.getTables();
    var result = new Array();
    result.push(collField);
    result.push("=");
    result.push(tableName);
    result.push("^OR");
    result.push(collField);
    result.push("IN");
    result.push(tables.join());
    return result.join("");
}
function securityQueryCalculator(values) {
    var sa = values.split(".");
    var fieldName = null;
    var element = null;
    var tableName = sa[0];
    if (sa.length > 1)
        fieldName = sa[1];
    var allTables = new Array();
    var table = new Table(tableName);
    if (fieldName == null)
        allTables = table.getTables();
    else {
        allTables.push(tableName);
        element = table.getElement(fieldName);
        if (element != null && element.getTableName() != tableName)
            allTables.push(element.getTableName());
        allTables.push("*");
    }
    var rc = getRules(allTables, fieldName);
    return rc;
}
function getRules(allTables, fieldName) {
    var rules = null;
    if (fieldName == null) {
        rules = "name=*^ORnameSTARTSWITH*.";
        for (var i = 0; i < allTables.length; i++)
            rules += "^ORname=" + allTables[i] + "^ORnameSTARTSWITH" + allTables[i] + ".";
        return rules;
    }
    var rc = new Array();
    for (var x = 0; x < allTables.length; x++) {
        var tableName = allTables[x];
        rc.push(tableName);
        rc.push(tableName + ".*");
        if (fieldName != null)
            rc.push(tableName + "." + fieldName);
    }
    rules = "nameIN" + rc.join();
    return rules;
}
function setWatchField(id) {
    var ajax = new GlideAjax('ContextActionsAjax');
    ajax.addParam("sysparm_name", "setWatchField");
    ajax.addParam("sysparm_id", id);
    ajax.getXML(function () { CustomEvent.fire('glide_optics_inspect_watchfield', id) });
}
function showWatchField(id) {
    var ajax = new GlideAjax('ContextActionsAjax');
    ajax.addParam("sysparm_name", "setWatchField");
    ajax.addParam("sysparm_id", id);
    ajax.getXML(function () { CustomEvent.fire('glide_optics_inspect_show_watchfield', id) });
}
function clearWatchField(id) {
    var ajax = new GlideAjax('ContextActionsAjax');
    ajax.addParam("sysparm_name", "clearWatchField");
    ajax.getXML();
    ajax.getXML(function () { CustomEvent.fire('glide_optics_inspect_clear_watchfield', id) });
}
function setStack(form) {
    var url = new GlideURL(window.location.href);
    var stack = url.getParam('sysparm_nameofstack');
    if (stack)
        addInput(form, 'HIDDEN', 'sysparm_nameofstack', stack);
}
;
/*! RESOURCE: /scripts/depends.js */
function getNameFromElement(elementName) {
    var names = elementName.split(".");
    names = names.slice(1);
    return names.join(".");
}
function loadFilterColumns(fname, dependent) {
    var value = resolveDependentValue(fname, dependent);
    var names = fname.split(".");
    serverRequest("xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true&sysparm_value=" + names[0], getFilterColumnsResponse, [fname, dependent]);
    CustomEvent.fire('conditions:dependent_change');
}
function getFilterColumnsResponse(evt, args) {
    var fname = args[0];
    var dep = args[1];
    var hinput = document.getElementById(fname);
    filterExpanded = true;
    var table = resolveDependentValue(fname, dep);
    var xfilter = unescape(hinput.value);
    var form = findParentByTag(hinput, "FORM");
    if (table) {
        firstTable = table;
        createCondFilter(table + "." + fname, xfilter, fname);
    }
}
function onSelChange(elementName) {
    var elementId = elementName.replace("sys_select.", "");
    var df = new DerivedFields(elementId);
    df.clearRelated();
    df.updateRelated(gel(elementName).value);
    var vName = "ni.dependent." + getNameFromElement(elementName);
    var eDeps = document.getElementsByName(vName);
    jslog("*************---->" + eDeps.length);
    for (var i = 0; i < eDeps.length; i++) {
        var eDep = eDeps[i];
        if (eDep == null)
            continue;
        var f = eDep.attributes.getNamedItem('onDependentChange');
        if (f) {
            eval(f.nodeValue);
            continue;
        }
        var name = eDep.value;
        var eChanged = gel(elementName);
        var value;
        if (eChanged.options) {
            var selected = eChanged.selectedIndex;
            value = eChanged.options[selected].value;
        } else
            value = eChanged.value;
        var retFunc = selResponse;
        var ajax = new GlideAjax("set_from_attributes");
        var argCnt = 0;
        for (var ac = 0; ac < eDep.attributes.length; ac++) {
            var itemName = eDep.attributes[ac].name;
            if (itemName.substring(0, 7).toLowerCase() == "sysparm") {
                var pvalue = eDep.attributes[ac].value;
                ajax.addParam(itemName, pvalue);
                argCnt++;
            } else if (itemName == "function") {
                var fdef = eDep.attributes[ac].value;
                var index = fdef.indexOf("(");
                if (index == -1)
                    retFunc = eval(eDep.attributes[ac].value);
                else
                    retFunc = fdef;
            }
        }
        if (argCnt == 0)
            continue;
        ajax.addParam("sysparm_value", value);
        ajax.addParam("sysparm_name", name);
        ajax.addParam("sysparm_chars", "*");
        ajax.addParam("sysparm_nomax", "true");
        var scopeElement = gel('sysparm_domain_scope');
        if (scopeElement && scopeElement.value) {
            ajax.addParam("sysparm_domain_scope", scopeElement.value);
        }
        var domainElement = gel('sysparm_domain');
        if (domainElement && domainElement.value) {
            ajax.addParam("sysparm_domain", domainElement.value);
        }
        ajax.getXML(retFunc, null, eChanged);
    }
}
function selResponse(request) {
    if (!request || !request.responseXML)
        return;
    var e = request.responseXML.documentElement;
    var elementName = e.getAttribute("sysparm_name");
    var processorName = e.getAttribute("sysparm_processor");
    var defaultOption = e.getAttribute("default_option");
    var selectedItem = e.getAttribute("select_option");
    var select = gel(elementName);
    var currentValue = select.value;
    try {
        select.options.length = 0;
    } catch (e) {
    }
    if (processorName == "PickList")
        appendSelectOption(select, "", document.createTextNode((defaultOption ? defaultOption : getMessage('-- None --'))));
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var t = item.getAttribute("value");
        var label = item.getAttribute("label");
        var hint = item.getAttribute("hint");
        var opt = appendSelectOption(select, t, document.createTextNode(label));
        if (hint != '')
            opt.title = hint;
        if (selectedItem && label == selectedItem)
            opt.selected = true;
        else if (currentValue && t == currentValue) {
            opt.selected = true;
            currentValue = '';
        }
    }
    if (select['onchange'])
        select.onchange();
}
function hasDepends(elementName) {
    var vName = "ni.dependent." + getNameFromElement(elementName);
    var eDep = document.getElementsByName(vName)[0];
    return eDep;
}
function resolveDependentValue(id, depname, deptable) {
    var systable = id.split(".")[0];
    var table = null;
    var dep = document.getElementById(systable + '.' + depname);
    if (dep != null) {
        if (dep.tagName == 'SELECT')
            table = dep.options[dep.selectedIndex].value
        else
            table = dep.value;
        table = table.split(".")[0];
    } else {
        table = deptable;
    }
    if (table == '*' || table == '' || table == 'null')
        table = null;
    return table;
}
function loadFields(fname, dependent, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table) {
    var depValue = resolveDependentValue(fname, dependent, dependent);
    loadFieldsWithValue(fname, depValue, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table);
}
function loadFieldsWithValue(fname, table, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table) {
    var script_ref_types_dependent_value = "";
    if (script_ref_types_dependent) {
        var systable = fname.split(".")[0];
        var s_dep = gel(systable + '.' + script_ref_types_dependent);
        if (s_dep != null) {
            if (s_dep.tagName == 'SELECT')
                script_ref_types_dependent_value = s_dep.options[s_dep.selectedIndex].value;
            else
                script_ref_types_dependent_value = s_dep.value;
        }
    }
    if (table != null)
        getTableColumns(table, fname, types, script_types, ref_types, script_ref_types, script_ref_types_dependent_value, field_choices_script, show_field_name_on_label, access_table);
}
function getTableColumns(table, ref, types, script_types, ref_types, script_ref_types, script_ref_types_dependent_value, field_choices_script, show_field_name_on_label, access_table) {
    if (!types)
        types = "";
    if (!script_types)
        script_types = "";
    if (!ref_types)
        ref_types = "";
    if (!script_ref_types)
        script_ref_types = "";
    if (!script_ref_types_dependent_value)
        script_ref_types_dependent_value = "";
    var serverRequestString = "xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true" +
        "&sysparm_value=" + table +
        "&sysparm_types=" + types +
        "&sysparm_script_types=" + script_types +
        "&sysparm_script_ref_types_dependent_value=" + script_ref_types_dependent_value +
        "&sysparm_script_ref_types=" + script_ref_types +
        "&sysparm_ref_types=" + ref_types +
        "&sysparm_containing_table=" + $('sys_target').value;
    if (field_choices_script && field_choices_script != "")
        serverRequestString += "&sysparm_field_choices_script=" + field_choices_script;
    if (show_field_name_on_label && show_field_name_on_label != "")
        serverRequestString += "&sysparm_show_field_name_on_label=" + show_field_name_on_label;
    if (access_table)
        serverRequestString += "&sysparm_access_table=" + access_table;
    serverRequestString += "&sysparm_ref_field=" + encodeURIComponent(ref);
    serverRequest(serverRequestString, getTableColumnsResponse, ref);
}
function getTableColumnsResponse(request, ref) {
    var fname = ref;
    var tcols = request.responseXML;
    var scols = gel(fname);
    var currentvis = scols.style.visibility;
    scols.style.visibility = "hidden";
    var cfield = gel('sys_original.' + fname);
    cValue = cfield.value;
    if (typeof scols.options === 'undefined')
        scols.options = [];
    else
        scols.options.length = 0;
    var includeNone = scols.attributes.getNamedItem('include_none');
    if (includeNone) {
        if (includeNone.nodeValue == 'true')
            scols.options[scols.options.length] = new Option(getMessage('-- None --'), '');
    }
    var items = tcols.getElementsByTagName("item");
    var sindex = 0;
    for (var i = 0; i != items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        scols.options[scols.options.length] = new Option(label, value);
        if (cValue == value)
            sindex = scols.options.length - 1;
    }
    scols.selectedIndex = sindex;
    scols.style.visibility = currentvis;
    CustomEvent.fire('getTableColumnsResponse.received');
    fireSetValueEvent();
}
function fireSetValueEvent() {
    if (typeof g_form != 'undefined') {
        var form = g_form.getFormElement();
        if (typeof form != 'undefined')
            $(form).fire('glideform:setvalue');
    }
}
;
/*! RESOURCE: /scripts/email_activity.js */
function setEmailBody(id) {
    var iframeID = id + ".body";
    var iframe = gel(iframeID);
    if (iframe)
        return;
    iframe = cel("iframe");
    iframe.id = iframeID;
    iframe.width = "100%";
    iframe.frameBorder = "0";
    Event.observe(iframe, "load", emailResizeObserved.bind(iframe), true);
    iframe.src = "email_display.do?email_id=" + id;
    iframe.email_id = id;
    var cellID = id + ".mail_cell";
    var td = gel(cellID);
    if (!td) {
        alert("email_activity.js: TD missing for '" + cellID + "'");
        return;
    }
    td.appendChild(iframe);
}
function emailResizeObserved() {
    adjustEmailHeight(this);
}
function adjustEmailHeight(frame) {
    frame.style.height = frame.contentWindow.document.body.scrollHeight + 'px';
}
;
/*! RESOURCE: /scripts/doctype/condition_global_variables14.js */
var MAIN_LAYER = "filterdiv";
var TEXTQUERY = "123TEXTQUERY321";
var PLACEHOLDER = "123PLACEHOLDER321";
var PLACEHOLDERFIELD = '-- choose field --';
var DEFAULT_NAME = "report";
var DEFAULT_WIDTH = "10px";
var DEFAULT_BORDER = 0;
var JS_GS = 'javascript:gs.';
var useTextareas = false;
var noConditionals = false;
var noOps = false;
var noSort = false;
var gotShowRelated = false;
var gotoPart = false;
var calendars = 0;
var refcount = 0;
var sortIndex = 0;
var queryNumber = 0;
var calendarPopups = [];
var filter;
var orderBy;
var columns = null;
var currentTable = '';
var firstTable = '';
var oldStatus = '';
var showRelated = '';
var filterExpanded = false;
var queueTables = new Array();
var queueFilters = new Array();
var queueColumns = new Array();
var operators = [
    "BETWEEN",
    "!=",
    ">=",
    "<=",
    "=",
    ">",
    "<",
    "NOT IN",
    "IN",
    "NOT LIKE",
    "LIKE",
    "ON",
    "NOTON",
    "DATEPART",
    "RELATIVE",
    "STARTSWITH",
    "ENDSWITH",
    "EMPTYSTRING",
    "ISEMPTY",
    "ISNOTEMPTY",
    "INSTANCEOF",
    "ANYTHING",
    "VALCHANGES",
    "CHANGESFROM",
    "CHANGESTO",
    "MATCH_PAT",
    "MATCH_RGX",
    "SAMEAS",
    "NSAMEAS",
    "MORETHAN",
    "LESSTHAN",
    "DYNAMIC",
    "GT_FIELD",
    "LT_FIELD",
    "GT_OR_EQUALS_FIELD",
    "LT_OR_EQUALS_FIELD",
    "HASVARIABLE",
    "HASITEMVARIABLE",
    "HASQUESTION",
    "HASLABEL"
];
var fieldComparisonOperators = ["SAMEAS", "NSAMEAS", "MORETHAN", "LESSTHAN", "GT_FIELD", "LT_FIELD", "GT_OR_EQUALS_FIELD", "LT_OR_EQUALS_FIELD"];
var dateTypes = new Array();
dateTypes['glide_date_time'] = 1;
dateTypes['glide_date'] = 1;
dateTypes['date'] = 1;
dateTypes['datetime'] = 1;
dateTypes['due_date'] = 1;
var dateOnlyTypes = new Object();
dateOnlyTypes['glide_date'] = 1;
dateOnlyTypes['date'] = 1;
var dateTimeTypes = new Object();
dateTimeTypes['glide_date_time'] = 1;
dateTimeTypes['datetime'] = 1;
dateTimeTypes['due_date'] = 1;
var numericTypes = new Array();
numericTypes['integer'] = 1;
numericTypes['decimal'] = 1;
numericTypes['numeric'] = 1;
numericTypes['float'] = 1;
numericTypes['domain_number'] = 1;
numericTypes['auto_increment'] = 1;
numericTypes['percent_complete'] = 1;
var opersNS = {};
opersNS.opdef = {
    'af': ['>', 'after'],
    'ataf': ['>=', 'at or after'],
    'any': ['ANYTHING', 'is anything'],
    'are': ['=', 'are'],
    'asc': ['ascending', 'a to z'],
    'avg': ['avg', 'average'],
    'bf': ['<', 'before'],
    'atbf': ['<=', 'at or before'],
    'btw': ['BETWEEN', 'between'],
    'dsc': ['descending', 'z to a'],
    'dtpt': ['DATEPART', 'trend'],
    'em': ['ISEMPTY', 'is empty'],
    'es': ['EMPTYSTRING', 'is empty string'],
    'enwt': ['ENDSWITH', 'ends with'],
    'eq': ['=', 'is'],
    'eqd': ['DYNAMIC', 'is (dynamic)'],
    'fvc': ['VALCHANGES', 'changes'],
    'fvf': ['CHANGESFROM', 'changes from'],
    'fvt': ['CHANGESTO', 'changes to'],
    'gt': ['>', 'greater than'],
    'gteq': ['>=', 'greater than or is'],
    'inna': ['IN', 'is one of'],
    'inst': ['INSTANCEOF', 'is a'],
    'lk': ['LIKE', 'contains'],
    'lt': ['<', 'less than'],
    'lteq': ['<=', 'less than or is'],
    'max': ['max', 'maximum'],
    'min': ['min', 'minimum'],
    'mpat': ['MATCH_PAT', 'matches pattern'],
    'mreg': ['MATCH_RGX', 'matches regex'],
    'ntem': ['ISNOTEMPTY', 'is not empty'],
    'nteq': ['!=', 'is not'],
    'ntin': ['NOT IN', 'is not one of'],
    'ntlk': ['NOT LIKE', 'does not contain'],
    'nton': ['NOTON', 'not on'],
    'on': ['ON', 'on'],
    'oper': ['-- oper --', '-- oper --'],
    'rltv': ['RELATIVE', 'relative'],
    'saas': ['SAMEAS', 'is same'],
    'nsas': ['NSAMEAS', 'is different'],
    'snc': ['SINCE', 'since baseline'],
    'stwt': ['STARTSWITH', 'starts with'],
    'sum': ['sum', 'Total'],
    'date_more': ['MORETHAN', 'is more than'],
    'date_less': ['LESSTHAN', 'is less than'],
    'gtfd': ['GT_FIELD', 'greater than field'],
    'ltfd': ['LT_FIELD', 'less than field'],
    'gteqfd': ['GT_OR_EQUALS_FIELD', 'greater than or is field'],
    'lteqfd': ['LT_OR_EQUALS_FIELD', 'less than or is field']
};
opersNS.opdef_template = {
    'eq': ['=', 'To'],
    'saas': ['SAMEAS', 'Same as'],
    'eqd': ['DYNAMIC', 'To (dynamic)']
}
opersNS.compile = function (ops_input, opsdef) {
    for (var fieldType in ops_input) {
        var proto = ops_input[fieldType];
        if (proto.charAt(0) == '=')
            continue;
        var opers = proto.split(",");
        var opArray = [];
        for (var i = 0; i < opers.length; i++) {
            var oper = opers[i];
            if (oper)
                opArray.push(opsdef[oper]);
        }
        ops_input[fieldType] = opArray;
    }
    for (var fieldType in ops_input) {
        var proto = ops_input[fieldType];
        if (typeof proto != 'string')
            continue;
        ops_input[fieldType] = ops_input[proto.substring(1)];
    }
}
var sysopers = {
    'auto_increment': '=integer',
    'aggspec': 'sum,avg,min,max,any,fvc,fvf,fvt',
    'boolean': 'eq,nteq,em,ntem,any,fvc,fvf,fvt,saas,nsas',
    'calendar': 'on,nton,bf,atbf,af,ataf,btw,dtpt,rltv,snc,em,ntem,any,fvc,saas,nsas,date_more,date_less',
    'choice': 'eq,nteq,inna,ntin,lk,stwt,enwt,ntlk,any,fvc,fvf,fvt,saas,nsas',
    'referencechoice': 'eq,nteq,inna,ntin,lk,stwt,enwt,ntlk,any',
    'composite_field': 'stwt,lk,ntlk,any',
    'composite_name': '=string',
    'conditions': '=string',
    'condition_string': '=string',
    'css': '=html',
    'decimal': '=integer',
    'currency': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
    'currency2': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
    'default': 'eq,nteq,any,fvc,fvf,fvt',
    'edgeEncryptionOrder': 'eq,nteq,em,ntem,lt,gt,lteq,gteq',
    'edgeEncryptionEq': 'eq,nteq,em,ntem',
    'email': '=string',
    'email_script': '=string',
    'field_name': '=string',
    'glide_duration': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc',
    'glide_encrypted': 'eq,nteq,em,ntem',
    'glide_list': 'lk,ntlk,em,ntem,fvc,fvf,fvt,eqd',
    'GUID': '=string',
    'html': 'lk,ntlk,em,ntem,any,fvc,fvf,fvt',
    'html_script': '=string',
    'html_template': '=script',
    'integer': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas,gtfd,ltfd,gteqfd,lteqfd',
    'integer_choice': 'eq,nteq,inna,ntin,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas',
    'journal': 'fvc',
    'journal_input': '=journal',
    'keyword': 'are',
    'multi_two_lines': '=string',
    'percent_complete': '=integer',
    'ph_number': '=string',
    'phone_number_e164': '=string',
    'placeholder': 'oper',
    'price': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
    'reference': 'eq,nteq,em,ntem,stwt,enwt,lk,ntlk,any,saas,nsas,es,eqd,fvc,fvf,fvt',
    'referencevariable': 'eq,nteq,em,ntem',
    'replication_payload': '=string',
    'script': 'lk,ntlk,ntem,any,fvc,fvf,fvt',
    'script_plain': '=script',
    'script_server': '=script',
    'sortspec': 'asc,dsc,fvc,fvf,fvt',
    'string': 'stwt,enwt,lk,ntlk,eq,nteq,em,ntem,mpat,mreg,any,inna,es,fvc,fvf,fvt,lteq,gteq,btw,saas,nsas',
    'string_choice': '=choice',
    'string_clob': 'lk,ntlk,stwt,enwt,em,ntem,any,fvc,fvf,fvt',
    'string_full_utf8': '=string',
    'string_numeric': 'eq,nteq,lk,ntlk,stwt,enwt,btw,any,fvc,fvf,fvt,saas,nsas',
    'sys_class_name': 'eq,nteq,inst,any,fvc,fvf,fvt',
    'sysevent_name': '=string',
    'table_name': '=string',
    'timer': '=integer',
    'translated_field': '=string',
    'translated_html': '=html',
    'translated_text': '=string',
    'translated_basic': 'eq,nteq,em,ntem',
    'url': '=string',
    'workflow': '=choice',
    'xml': '=html',
    'domain_path': '=string',
    'tree_code': '=string',
    'tree_path': '=string',
    'source_id': '=string',
    'source_name': '=string',
    'source_table': '=string'
};
var sysopers_template = {
    'default': 'eq,saas,eqd'
}
opersNS.compile(sysopers, opersNS.opdef);
opersNS.compile(sysopers_template, opersNS.opdef_template);
var extopers = {};
extopers['MATCH_PAT'] = true;
extopers['MATCH_RGX'] = true;
extopers['VALCHANGES'] = true;
extopers['CHANGESTO'] = true;
extopers['CHANGESFROM'] = true;
(function () {
    var req = new XMLHttpRequest();
    req.open("GET", "/api/now/ui/date_time/legacy", true);
    req.setRequestHeader('Accept', 'application/json');
    if (typeof g_ck != 'undefined' && g_ck != "") {
        req.setRequestHeader('X-UserToken', g_ck);
    }
    function responseFunction(request) {
        var result = JSON.parse(request.response).result;
        var calendar = result.timeAgoDates;
        calendar.DATEPART = result.datePart;
        calendar.BETWEEN = result.between;
        calendar.RELATIVE = result.relative;
        calendar.TRENDVALUES = result.trendValues;
        calendar.WHEN = result.when;
        calendar.TRENDVALUES_WITH_FIELDS_PLURAL = result.trendValuesWithFieldsPlural;
        calendar.TRENDVALUES_WITH_FIELDS = result.trendValuesWithFields;
        calendar.WHEN_WITH_FIELDS = result.whenWithFields;
        sysvalues['calendar'] = calendar;
    }
    req.onreadystatechange = function () { processReqChange(req, responseFunction); };
    req.send(null);
}());
var sysvalues = {};
sysvalues['boolean'] = [["true", "true"], ["false", "false"]];
sysvalues['catalog_boolean'] = [["Yes", "Yes"], ["No", "No"]];
sysvalues['string_boolean'] = [["1", "true"], ["0", "false"]];
var MESSAGES_CONDITION_RELATED_FILES = ['lowercase_fields', 'Keywords', 'Show Related Fields', 'Remove Related Fields', '-- choose field --', '-- value --', '-- None --'];
var g_current_table = '';
var g_filter_extension_map = {};
;
/// <reference path="GlidePopupInterface.js" />
/*! RESOURCE: /scripts/scrollable.js */
var HOME_SCROLL_SPEED = 1;
var HOME_PAUSE_SPEED = 0;
var HOME_RESUME_SPEED = 1;
function scroller(divName) {
    var target = gel(divName);
    if (!target)
        return;
    var wrapper = gel(divName + "_wrap");
    var wrapperHeight = wrapper.offsetHeight;
    var containerHeight = target.offsetHeight;
    var actualheight = wrapperHeight
    if (wrapperHeight < containerHeight)
        actualheight = containerHeight;
    var currentScroll = parseInt(target.style.top) - HOME_SCROLL_SPEED;
    var bottom = actualheight + parseInt(target.style.top);
    if (bottom < 20)
        currentScroll = wrapperHeight;
    target.style.top = currentScroll + "px";
}
;
/*! RESOURCE: /scripts/classes/util/StopWatch.js */
var StopWatch = Class.create({
    MILLIS_IN_SECOND: 1000,
    MILLIS_IN_MINUTE: 60 * 1000,
    MILLIS_IN_HOUR: 60 * 60 * 1000,
    initialize: function (started) {
        this.started = started || new Date();
    },
    getTime: function () {
        var now = new Date();
        return now.getTime() - this.started.getTime();
    },
    restart: function () {
        this.initialize();
    },
    jslog: function (msg, src, date) {
        if (window.jslog) {
            jslog('[' + this.toString() + '] ' + msg, src, date);
            return;
        }
        if (window.console && window.console.log)
            console.log('[' + this.toString() + '] ' + msg);
    },
    toString: function () {
        return this.formatISO(this.getTime());
    },
    formatISO: function (millis) {
        var hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
        if (millis >= this.MILLIS_IN_HOUR) {
            hours = parseInt(millis / this.MILLIS_IN_HOUR);
            millis = millis - (hours * this.MILLIS_IN_HOUR);
        }
        if (millis >= this.MILLIS_IN_MINUTE) {
            minutes = parseInt(millis / this.MILLIS_IN_MINUTE);
            millis = millis - (minutes * this.MILLIS_IN_MINUTE);
        }
        if (millis >= this.MILLIS_IN_SECOND) {
            seconds = parseInt(millis / this.MILLIS_IN_SECOND);
            millis = millis - (seconds * this.MILLIS_IN_SECOND);
        }
        milliseconds = parseInt(millis);
        return doubleDigitFormat(hours) + ":" + doubleDigitFormat(minutes) + ":" + doubleDigitFormat(seconds) +
            "." + tripleDigitFormat(milliseconds);
    },
    type: "StopWatch"
});
;
/*! RESOURCE: /scripts/classes/Table.js */
var Table = Class.create({
    REF_ELEMENT_PREFIX: 'ref_',
    REFERENCE: "reference",
    initialize: function (tableName, parentTable, cols, callback, accessTable, isTemplate, loadExtensions, applyTemplateAcls) {
        this.tableName = tableName;
        this.parentTable = parentTable;
        this.label = tableName;
        this.callback = callback;
        this.accessTable = accessTable;
        this.columns = null;
        this.elements = {};
        this.elementsArray = [];
        this.extensions = {};
        this.extensionsArray = [];
        this.choiceExtensions = {};
        this.choiceExtensionsArray = [];
        this.tablesArray = [];
        this.sys_id = null;
        this.set_id = null;
        this.vars_id = null;
        this.glide_var = null;
        this.isTemplate = isTemplate;
        this.applyTemplateAcls = applyTemplateAcls;
        this.loadExtensions = loadExtensions;
        Table.setCachable(this);
        if (cols && this.cacheable)
            this.readResponse(cols);
        else
            this.readColumns();
        this.textIndex = null;
    },
    readColumns: function () {
        var ajax = new GlideAjax("SysMeta");
        ajax.addParam("sysparm_type", "column");
        ajax.addParam("sysparm_include_sysid", "true");
        ajax.addParam("sysparm_table_name", "false");
        ajax.addParam("sysparm_is_template", this.isTemplate ? 'true' : 'false');
        ajax.addParam("sysparm_apply_template_acls", this.applyTemplateAcls ? 'true' : 'false');
        ajax.addParam("sysparm_value", this.tableName);
        if (this.sys_id)
            ajax.addParam("sysparm_sys_id", this.sys_id);
        if (this.set_id)
            ajax.addParam("sysparm_set_id", this.set_id);
        if (this.vars_id)
            ajax.addParam("sysparm_vars_id", this.vars_id);
        if (this.parentTable)
            ajax.addParam("sysparm_parent_table", this.parentTable);
        if (this.accessTable)
            ajax.addParam("sysparm_access_table", this.accessTable);
        if (this.loadExtensions)
            ajax.addParam("sysparm_load_extended_fields", this.loadExtensions);
        if (this.callback)
            ajax.getXML(this.readColumnsResponse.bind(this));
        else {
            var xml = ajax.getXMLWait();
            this.readResponse(xml);
        }
    },
    readColumnsResponse: function (response) {
        if (!response || !response.responseXML)
            return;
        var xml = response.responseXML;
        this.readResponse(xml);
        this.callback(this);
    },
    readResponse: function (xml) {
        this.columns = xml;
        var root = this.columns.getElementsByTagName("xml");
        if (root == null || root.length == 0)
            root = this.columns;
        if (root != null && root.length == 1) {
            root = root[0];
            this.textIndex = root.getAttribute("textIndex");
            this.label = root.getAttribute("label");
        }
        var childNodes = root.childNodes;
        this.elements = {};
        this.elementsArray = [];
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].tagName == 'extensions')
                this.setExtensions(childNodes[i]);
            if (childNodes[i].tagName == 'tables')
                this.setTables(childNodes[i]);
            if (childNodes[i].tagName == 'sys_choice_extensions')
                this.setChoiceExtensions(childNodes[i]);
            if (childNodes[i].tagName != 'item')
                continue;
            var item = childNodes[i];
            var t = item.getAttribute("value");
            var label = item.getAttribute("label");
            var e = new TableElement(t, label);
            e.setClearLabel(item.getAttribute("cl"));
            e.setType(item.getAttribute("type"));
            e.setReference(item.getAttribute("reference"));
            e.setDynamicCreation(item.getAttribute("dynamic_creation") == "true");
            e.setRefQual(item.getAttribute("reference_qual"));
            e.setRefKey(item.getAttribute("reference_key"));
            e.setArray(item.getAttribute("array"));
            e.setChoice(item.getAttribute("choice"));
            e.setMulti(item.getAttribute("multitext"));
            e.setDependent(item.getAttribute("dependent"));
            e.setMaxLength(item.getAttribute("max_length"));
            e.setDisplayChars(item.getAttribute("display_chars"));
            e.setNamedAttributes(item.getAttribute("attributes"));
            e.setTableName(item.getAttribute("table"));
            e.setTable(this);
            if (e.isReference()) {
                e.setRefLabel(item.getAttribute("reflabel"));
                e.setRefDisplay(item.getAttribute("refdisplay"));
                e.setRefRotated(item.getAttribute("reference_rotated"));
            }
            this.elements[t] = e;
            this.elementsArray[this.elementsArray.length] = e;
            var attrs = item.attributes;
            for (var x = 0; x < attrs.length; x++)
                e.addAttribute(attrs[x].nodeName, attrs[x].nodeValue);
        }
        this.setDependencies();
    },
    setExtensions: function (extensions) {
        var items = extensions.childNodes;
        if (this.loadExtensions) {
            Table.getCache().ensureMaxEntries(items.length);
        }
        this.extensionsArray = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var t = item.getAttribute("name");
            var label = item.getAttribute("label");
            var e = new TableExtension(t, label);
            e.setTable(this);
            if (item.getElementsByTagName('item') && this.loadExtensions) {
                Table.setColumns(t, null, item);
            }
            this.extensions[t] = e;
            this.extensionsArray[this.extensionsArray.length] = e;
        }
    },
    setChoiceExtensions: function (choices) {
        items = choices.childNodes;
        this.choiceExtensionsArray = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var t = item.getAttribute("name");
            var label = item.getAttribute("label");
            var e = new TableExtension(t, label);
            e.setTable(this);
            this.choiceExtensions[t] = e;
            this.choiceExtensionsArray[this.choiceExtensionsArray.length] = e;
        }
    },
    setDependencies: function () {
        for (var i = 0; i < this.elementsArray.length; i++) {
            var element = this.elementsArray[i];
            if (element.isDependent()) {
                var parent = this.getElement(element.getDependent());
                if (parent)
                    parent.addDependentChild(element.getName())
            }
        }
    },
    setTables: function (tables) {
        var tableList = tables.getAttribute("table_list");
        this.tablesArray = [];
        this.tablesArray = tableList.split(',');
    },
    getColumns: function () {
        return this.columns;
    },
    getElements: function () {
        return this.elementsArray;
    },
    getTableElements: function (tableName) {
        jslog("Getting fields for table " + tableName);
        var elements = [];
        var items = this.getElements();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.getTableName() != tableName)
                continue;
            elements.push(item);
        }
        return elements;
    },
    getElement: function (elementName) {
        if (this.elements[elementName])
            return this.elements[elementName];
        if (this._nameIsExtension(elementName))
            return this._genExtensionElement(elementName);
        return null;
    },
    _genExtensionElement: function (name) {
        name = name.substring(this.REF_ELEMENT_PREFIX.length);
        var ext = this.extensions[name];
        var e = new TableElement(ext.getExtName(), ext.getLabel());
        e.setType(this.REFERENCE);
        e.setReference(ext.getName());
        e.setRefLabel(ext.getLabel());
        e.setExtensionElement(true);
        return e;
    },
    _nameIsExtension: function (name) {
        if (name.indexOf(this.REF_ELEMENT_PREFIX) != 0)
            return false;
        name = name.substring(this.REF_ELEMENT_PREFIX.length);
        return this.extensions[name];
    },
    getExtensions: function () {
        return this.extensionsArray;
    },
    getChoiceExtensions: function () {
        return this.choiceExtensionsArray;
    },
    getTables: function () {
        return this.tablesArray;
    },
    getName: function () {
        return this.tableName;
    },
    getLabel: function () {
        return this.label;
    },
    getDisplayName: function (column) {
        return this.getElement(column).getRefDisplay();
    },
    getSysId: function () {
        return this.sys_id;
    },
    setSysId: function () {
        return this.sys_id;
    },
    type: function () {
        return "Table";
    }
});
Table.get = function (tableName, parentTable, isTemplate, loadExtensions, callback, applyTemplateAcls) {
    var topWindow = getTopWindow();
    return (topWindow.Table || Table).getInTopWindow(tableName, parentTable, isTemplate, loadExtensions, callback, applyTemplateAcls);
};
Table.setColumns = function (tableName, parentTable, xmlString) {
    var cachedName = Table.getCacheKey(tableName, parentTable);
    var parentCache = Table.getCache();
    if (parentCache) {
        var table = parentCache.get(cachedName);
        if (table)
            return table;
    }
    var xml = typeof xmlString == 'string' ? loadXML(xmlString) : xmlString;
    var answer = new Table(tableName, parentTable, xml);
    if (parentCache && answer.cacheable)
        parentCache.put(cachedName, answer);
};
Table.isCached = function (tableName, parentTable, isTemplate) {
    var cachedName = Table.getCacheKey(tableName, parentTable, isTemplate);
    var parentCache = Table.getCache();
    if (parentCache) {
        var table = parentCache.get(cachedName);
        if (table)
            return true;
    }
    return false;
};
Table.getInTopWindow = function (tableName, parentTable, isTemplate, loadExtensions, callback, applyTemplateAcls) {
    var t = {};
    Table.setCachable(t);
    if (t.cacheable) {
        var cachedName = Table.getCacheKey(tableName, parentTable, isTemplate, loadExtensions);
        var parentCache = Table.getCache();
        if (parentCache) {
            var table = parentCache.get(cachedName);
            if (table) {
                try {
                    table.getName();
                    if (callback)
                        callback(table);
                    return table;
                } catch (error) {
                    console.warn("An error occurred with the Table object or the callback applied to the Table object. "
                        + "Due to limitations in IE11 this is expected when the form is inside the frameset and is "
                        + "refreshed (saved, updated,  etc) and should not affect functionality.", error);
                }
            }
        }
    }
    var answer = new Table(tableName, parentTable, null, callback, null, isTemplate, loadExtensions, applyTemplateAcls);
    if (parentCache && answer.cacheable)
        parentCache.put(cachedName, answer);
    return answer;
};
Table.setCachable = function (t) {
    t.cacheable = true;
    if (typeof g_table_sys_id != 'undefined') {
        t.sys_id = getTopWindow().g_table_sys_id;
        t.cacheable = false;
    }
    if (typeof g_table_set_id != 'undefined') {
        t.set_id = getTopWindow().g_table_set_id;
        t.cacheable = false;
    }
    if (typeof g_table_vars_id != 'undefined') {
        t.vars_id = getTopWindow().g_table_vars_id;
        t.cacheable = false;
    }
    if (typeof g_table_glide_var != 'undefined') {
        t.glide_var = getTopWindow().g_table_glide_var;
        t.cacheable = false;
    }
};
Table.getCacheKey = function (tableName, parentTable, isTemplate) {
    return (parentTable ? parentTable + "." : "") + tableName + "." + !!isTemplate;
};
Table.getCache = function () {
    var cache = getTopWindow().g_cache_td;
    if (cache)
        return cache;
    if (!window.g_cache_td)
        window.g_cache_td = new GlideClientCache(400);
    return window.g_cache_td;
};
;
/*! RESOURCE: /scripts/classes/TableElement.js */
var TableElement = Class.create({
    REF_ELEMENT_PREFIX: 'ref_',
    initialize: function (elementName, elementLabel) {
        this.name = elementName;
        this.label = elementLabel;
        this.clearLabel = '';
        this.tableName = '';
        this.type = 'string';
        this.isRef = false;
        this.refLabel = null;
        this.refDisplay = null;
        this.refQual = null;
        this.reference = null;
        this.refKey = null;
        this.refRotated = false;
        this.array = null;
        this.canread = 'unknown';
        this.canwrite = 'unknown';
        this.saveastemplate = 'unknown';
        this.choice = '';
        this.multi = false;
        this.active = 'unknown';
        this.table = null;
        this.dependent = null;
        this.maxLength = null;
        this.displayChars = "-1";
        this.attributes = {};
        this.dependentChildren = {};
        this.namedAttributes = {};
        this.extensionElement = false;
        this.dynamicCreation = false;
    },
    addAttribute: function (name, value) {
        this.attributes[name] = value;
    },
    getAttribute: function (name) {
        return this.attributes[name];
    },
    getBooleanAttribute: function (name, defaultValue) {
        var v = this.getAttribute(name);
        if (v == null)
            return (typeof defaultValue !== 'undefined') ? defaultValue : true;
        if (v == 'false' || v == 'no')
            return false;
        return true;
    },
    isDependent: function () {
        return this.dependent != null;
    },
    hasDependentChildren: function () {
        for (var key in this.dependentChildren)
            return true;
        return false;
    },
    getDependentChildren: function () {
        return this.dependentChildren;
    },
    setTable: function (t) {
        this.table = t;
    },
    setType: function (type) {
        this.type = type;
        if (type == 'glide_list')
            this.isRef = false;
        if (type == 'glide_var')
            this.isRef = true;
    },
    setReference: function (reference) {
        if (reference && reference != '')
            this.reference = reference;
        this.isRef = false;
        switch (this.type) {
            case 'glide_list':
                if (this.reference)
                    this.isRef = true;
                break;
            case 'reference':
            case 'domain_id':
            case 'glide_var':
            case 'currency2':
                this.isRef = true;
                break;
        }
    },
    setRefRotated: function (rotated) {
        if ('yes' == rotated)
            this.refRotated = true;
        else
            this.refRotated = false;
    },
    setCanWrite: function (ra) {
        if ('no' == ra)
            this.canwrite = false;
        else
            this.canwrite = true;
    },
    setSaveAsTemplate: function (ra) {
        if ('no' == ra)
            this.saveastemplate = false;
        else
            this.saveastemplate = true;
    },
    setCanRead: function (ra) {
        if ('no' == ra)
            this.canread = false;
        else
            this.canread = true;
    },
    setActive: function (active) {
        if ('no' == active)
            this.active = false;
        else
            this.active = true;
    },
    setRefQual: function (refQual) {
        this.refQual = refQual;
    },
    setRefKey: function (refKey) {
        this.refKey = refKey;
    },
    setRefLabel: function (label) {
        this.refLabel = label;
    },
    setRefDisplay: function (display) {
        this.refDisplay = display;
    },
    setArray: function (array) {
        this.array = array;
    },
    setClearLabel: function (cl) {
        this.clearLabel = cl;
    },
    setChoice: function (choice) {
        this.choice = choice;
    },
    setMulti: function (multi) {
        this.multi = multi;
    },
    setExtensionElement: function (b) {
        this.extensionElement = b;
    },
    setDependent: function (dep) {
        if (dep && dep != '')
            this.dependent = dep;
    },
    addDependentChild: function (name) {
        if (name)
            this.dependentChildren[name] = true;
    },
    setMaxLength: function (maxLength) {
        this.maxLength = maxLength;
    },
    setDisplayChars: function (displayChars) {
        this.displayChars = displayChars;
    },
    setNamedAttributes: function (attrs) {
        if (!attrs)
            return;
        var pairs = attrs.split(',');
        for (var i = 0; i < pairs.length; i++) {
            var parts = pairs[i].split('=');
            if (parts.length == 2)
                this.namedAttributes[parts[0]] = parts[1];
        }
    },
    setDynamicCreation: function (dynamic) {
        this.dynamicCreation = dynamic;
    },
    isReference: function () {
        return this.isRef;
    },
    isRefRotated: function () {
        return this.refRotated;
    },
    isExtensionElement: function () {
        return this.extensionElement;
    },
    isDate: function () {
        return dateTypes[this.type];
    },
    isDateOnly: function () {
        if (dateOnlyTypes[this.type])
            return true;
        else
            return false;
    },
    isDateTime: function () {
        if (dateTimeTypes[this.type])
            return true;
        else
            return false;
    },
    getName: function () {
        return this.name;
    },
    getLabel: function () {
        return this.label;
    },
    getClearLabel: function () {
        return this.clearLabel;
    },
    getReference: function () {
        return this.reference;
    },
    getMulti: function () {
        return this.multi;
    },
    isMulti: function () {
        return this.getMulti() == 'yes';
    },
    getDependent: function () {
        return this.dependent;
    },
    getRefQual: function () {
        return this.refQual;
    },
    getRefKey: function () {
        return this.refKey;
    },
    getRefLabel: function () {
        return this.refLabel;
    },
    getRefDisplay: function () {
        return this.refDisplay;
    },
    getType: function () {
        return this.type;
    },
    getChoice: function () {
        return this.choice;
    },
    getTable: function () {
        return this.table;
    },
    getTableName: function () {
        return this.tableName;
    },
    setTableName: function (t) {
        this.tableName = t;
    },
    isChoice: function () {
        return (this.choice == 1 ||
            this.choice == 3 ||
            this.type == "day_of_week" ||
            this.type == "week_of_month" ||
            this.type == "month_of_year");
    },
    getMaxLength: function () {
        return this.maxLength;
    },
    getDisplayChars: function () {
        return this.displayChars;
    },
    canRead: function () {
        if (this.canread == 'unknown')
            return this.getBooleanAttribute("canread");
        return this.canread;
    },
    canSaveAsTemplate: function () {
        if (this.saveastemplate == 'unknown')
            return this.getBooleanAttribute("save_as_template");
        return this.saveastemplate;
    },
    canWrite: function () {
        if (this.canwrite == 'unknown')
            return this.getBooleanAttribute("canwrite");
        return this.canwrite;
    },
    canMatch: function () {
        return this.getBooleanAttribute("canmatch");
    },
    isEdgeEncrypted: function () {
        return this.getBooleanAttribute("edge_encrypted", false);
    },
    isActive: function () {
        if (this.active == 'unknown')
            return this.getBooleanAttribute("active");
        return this.active;
    },
    isNumber: function () {
        return this.type == 'integer' ||
            this.type == 'decimal' ||
            this.type == 'numeric' ||
            this.type == 'float' ||
            this.type == 'percent_complete';
    },
    isArray: function () {
        if (this.array && this.array == 'yes')
            return true;
        return false;
    },
    canSort: function () {
        if (!this.getBooleanAttribute("cansort"))
            return false;
        if (this.name.indexOf("password") > -1)
            return false;
        if (this.name == 'sys_id')
            return false;
        if (this.type == "journal" || this.type == "journal_input")
            return false;
        if (this.isArray())
            return false;
        return true;
    },
    canSortI18N: function () {
        return this.getBooleanAttribute("cansorti18n");
    },
    canGroup: function () {
        if (this.getNamedAttribute("can_group") == "true")
            return true;
        if (this.isEdgeEncrypted() && this.canMatch())
            return true;
        if (!this.canSort())
            return false;
        if (this.isMulti())
            return false;
        if (this.name.indexOf(".") > -1 && this.name.indexOf(this.REF_ELEMENT_PREFIX) > -1)
            return false;
        if (this.type == "glide_duration")
            return true;
        if (this.type == 'glide_date_time' ||
            this.type == 'glide_date' ||
            this.type == 'glide_time' ||
            this.type == 'due_date')
            return false;
        return true;
    },
    getAttributes: function () {
        return this.attributes['attributes'];
    },
    getNamedAttribute: function (name) {
        if (this.namedAttributes[name])
            return this.namedAttributes[name];
        else
            return null;
    },
    type: function () {
        return "TableElement";
    },
    isDynamicCreation: function () {
        return this.dynamicCreation;
    },
    isEncrypted: function () {
        return this.getBooleanAttribute("glide_encrypted", false) || this.getType() == "glide_encrypted";
    }
});
TableElement.get = function (name) {
    var names = name.split('.');
    var table = names[0];
    var tableDef = Table.get(table);
    var e = null;
    for (var i = 1; i < names.length; i++) {
        e = tableDef.getElement(names[i]);
        if (i == names.length - 1)
            break;
        if (!e.isReference())
            break;
        tableDef = Table.get(e.getReference());
    }
    return e;
}
    ;
/*! RESOURCE: /scripts/classes/TableExtension.js */
var TableExtension = Class.create({
    REF_ELEMENT_PREFIX: 'ref_',
    initialize: function (elementName, elementLabel) {
        this.name = elementName;
        this.label = elementLabel;
        this.table = null;
        this.fields = null;
    },
    getName: function () {
        return this.name;
    },
    getExtName: function () {
        return this.REF_ELEMENT_PREFIX + this.getName();
    },
    getLabel: function () {
        return this.label;
    },
    setTable: function (t) {
        this.table = t;
    },
    addOption: function (select, namePrefix, labelPrefix) {
        var t = this.getName();
        var ext = this.getExtName();
        if (namePrefix && namePrefix != '') {
            var idx = namePrefix.lastIndexOf(".");
            var s = namePrefix.substring(idx + 1);
            var previousIsExtension = true;
            if (s.indexOf(this.REF_ELEMENT_PREFIX) == 0)
                ext = namePrefix.substring(0, idx + 1) + ext;
            else {
                ext = namePrefix + "." + ext;
                previousIsExtension = false;
            }
        }
        var label = this.getLabel();
        var reflabel = label;
        if (labelPrefix && labelPrefix != '')
            if (previousIsExtension)
                reflabel = labelPrefix.substring(0, labelPrefix.lastIndexOf(".")) + "." + reflabel;
            else
                reflabel = labelPrefix + "." + reflabel;
        tlabel = label + " (+)";
        appendSelectOption(select, ext, document.createTextNode(tlabel));
        var opt = select.options[select.options.length - 1];
        if (labelPrefix != '')
            opt.innerHTML = "&nbsp;&nbsp;&nbsp;" + tlabel;
        else
            opt.innerHTML = tlabel;
        opt.cl = reflabel;
        opt.cv = ext;
        opt.tl = reflabel;
        opt.style.color = 'darkred';
        opt.style.cursor = 'pointer';
        opt.title = "Show extended fields from " + label + " table";
        opt.doNotDelete = 'true';
        opt.doNotMove = 'true'
        opt.reference = t;
        opt.bt = this.table.getName();
        opt.btl = this.table.getLabel();
        opt.headerAttr = 'true';
        opt.tl = reflabel;
    },
    type: function () {
        return "TableExtension";
    }
});
;
/*! RESOURCE: /scripts/classes/GlideDecoration.js */
var GlideDecoration = Class.create({
    EDIT_DECORATION: "images/editor_view_small.gifx",
    initialize: function (node) {
        this.type = node.getAttribute('type');
        this.iconSRC = node.getAttribute('iconSRC');
        var left = node.getAttribute('left');
        if (left == 'true')
            this.left = true;
        else
            this.left = false;
        if (this.type == 'popup') {
            this.onMouseMove = node.getAttribute('onMouseMove');
            this.onMouseExit = node.getAttribute('onMouseOut');
        } else if (this.type == 'expandCollapseDecoration') {
            this.expandedIcon = node.getAttribute('expandedIcon');
            this.collapsedIcon = node.getAttribute('collapsedIcon');
            this.expandedIconAlt = node.getAttribute('expandedIconAlt');
            this.collapsedIconAlt = node.getAttribute('collapsedIconAlt');
            this.memory = node.getAttribute('memory');
            this.expanded = node.getAttribute('expanded');
            this.altText = node.getAttribute("collapsedText");
        } else if (this.type == 'editDecoration') {
            this.editLink = node.getAttribute('editLink');
        }
    },
    attach: function (window) {
        if (this.type == 'image')
            this.attachImage(window);
        else if (this.type == 'popup')
            this.attachPopup(window);
        else if (this.type == 'expandCollapseDecoration')
            this.attachExpandCollapse(window);
        else if (this.type == 'editDecoration')
            this.attachEdit(window);
    },
    attachImage: function (window) {
        var decoration = cel('img');
        decoration.setAttribute('src', this.iconSRC);
        decoration.setAttribute('alt', '');
        window.addDecoration(decoration, this.left);
    },
    attachEdit: function (window) {
        var an = cel('a');
        var d = cel('img');
        d.src = this.EDIT_DECORATION;
        d.alt = getMessage('Edit');
        if (this.editLink.indexOf('javascript:') == 0) {
            var toEval = this.editLink.substring('javascript:'.length);
            toEval = "var f = function(e) { if (!e) { e = event;}; " + toEval + "}";
            eval(toEval);
            an.onclick = f;
        } else
            an.href = this.editLink;
        an.appendChild(d);
        window.addDecoration(an, this.left);
    },
    attachPopup: function (window) {
        var span = cel('span');
        var toEval = this.onMouseMove;
        toEval = "var f = function(e) { if (!e) { e = event;}; " + toEval + "}";
        eval(toEval);
        span.onmousemove = f;
        toEval = this.onMouseExit;
        toEval = "var f = function(e) { if (!e) { e = event;}; " + toEval + "}";
        eval(toEval);
        span.onmouseout = f;
        var decoration = cel('img');
        decoration.setAttribute('src', this.iconSRC);
        decoration.setAttribute('alt', '');
        span.appendChild(decoration);
        window.addDecoration(span, this.left);
    },
    attachExpandCollapse: function (window) {
        this.img = cel('img');
        this.img.onclick = this.toggleExpand.bind(this);
        this.img.setAttribute('src', this.iconSRC);
        this.img.setAttribute('alt', getMessage('Collapse'));
        this.img.style.verticalAlign = "top";
        this.gwtWindow = window;
        window.addDecoration(this.img, this.left);
        if (this.expanded == 'false') {
            this.expanded = true;
            this.toggleExpand();
        }
    },
    toggleExpand: function (e) {
        this.expanded = !this.expanded;
        var localExpanded;
        if (this.expanded) {
            this.img.setAttribute('src', this.expandedIcon);
            this.img.setAttribute('alt', this.expandedIconAlt)
            var span = this.gwtWindow.body;
            var temp = span.innerHTML;
            span.innerHTML = this.altText;
            this.altText = temp;
            localExpanded = 'true';
        } else {
            this.img.setAttribute('src', this.collapsedIcon);
            this.img.setAttribute('alt', this.collapsedIconAlt)
            var span = this.gwtWindow.body;
            var temp = span.innerHTML;
            span.innerHTML = this.altText;
            this.altText = temp;
            localExpanded = 'false';
        }
        if (this.memory != null && this.memory != '')
            setPreference('render_' + this.memory + '.expanded', localExpanded);
    }
});
;
/*! RESOURCE: /scripts/classes/GwtCellSelector.js */
var GwtCellSelector = Class.create({
    initialize: function (tableElement) {
        this.tableElement = tableElement;
        this.setDisable(false);
        this.setSelectColumnOnly(false);
        this.setSelectNonContiguous(false);
        this.setSelectColor("#DFDFDF");
        this.browserColor = null;
        this.setUnselectColor("#FAFAFA");
        this.setCursor("crosshair");
        this.setBorderSize("2px solid black");
        this.onSelect = null;
        this.beforeSelect = null;
        this.selectMultipleColumns = false;
        this.selectMiscCells = false;
        this.isMouseDown = false;
        this.centerCellColVal = 0;
        this.centerCellRowVal = 0;
        this.atCol = 0;
        this.atRow = 0;
        this.colFrom = 0;
        this.colTo = 0;
        this.rowFrom = 0;
        this.rowTo = 0;
        this.maxCol = 0;
        this.maxRow = 0;
        this.selectCount = 0;
        this.returnObjects = new Object();
        this.cellBackgroundXref = new Object();
        this.ignoreColumns = new Object();
        this.ignoreRows = new Object();
        this.getGridInfo()
        Event.observe(this.tableElement, "mousedown", this._dragStart.bind(this));
        this.mouseUpTableListener = this._dragEnd.bindAsEventListener(this);
        this.mouseOverTableListener = this._dragOver.bindAsEventListener(this);
        this.mouseUpDocListener = this._dragCheck.bindAsEventListener(this);
    },
    _draw: function () {
        this._drawSelection(this.colFrom, this.colTo, this.rowFrom, this.rowTo);
    },
    _dragStart: function (e) {
        if (Event.isRightClick(e))
            return;
        if ($("cell_edit_cancel"))
            return;
        if (!this.disableGrid) {
            this.getGridInfo();
            if (this.selectNonContiguous)
                this._contiguousCheck(e);
            if (this.ignoreColumns[Event.element(e).cellIndex] ||
                this.ignoreRows[this._getRowIndex(Event.element(e).parentNode)]) {
                return;
            }
            if (this.beforeSelect) {
                if (!this.handleBeforeSelect(e))
                    return;
            }
            if (!this.isSelectColumnOnly)
                this.selectMultipleColumns = e.shiftKey;
            this.isMouseDown = true;
            document.body.style.cursor = this.cursor;
            stopSelection(document.body);
            this._setEpicenter(e);
            this._selectAndDrawCells(Event.element(e));
            Event.observe(this.tableElement, "mouseup", this.mouseUpTableListener);
            Event.observe(this.tableElement, "mouseover", this.mouseOverTableListener);
            Event.observe(document, "mouseup", this.mouseUpDocListener);
            e.preventDefault();
        }
    },
    _dragOver: function (e) {
        if (this.isMouseDown) {
            this._selectAndDrawCells(Event.element(e));
        }
    },
    _dragEnd: function (e) {
        this.returnObjects = new Object();
        this.isMouseDown = false;
        document.body.style.cursor = "default";
        this._selectAndDrawCells(Event.element(e));
        if (this.onSelect) {
            this.handleOnSelect(this.returnObjects);
        }
        restoreSelection(document.body);
        Event.stopObserving(this.tableElement, "mouseup", this.mouseUpTableListener);
        Event.stopObserving(this.tableElement, "mouseover", this.mouseOverTableListener);
        Event.stopObserving(document, "mouseup", this.mouseUpDocListener);
    },
    _dragCheck: function (e) {
        if (this.isMouseDown) {
            try {
                this._dragEnd(e);
            }
            catch (err) {
            }
        }
    },
    _contiguousCheck: function (e) {
        if (e.ctrlKey)
            this.selectMiscCells = e.ctrlKey;
        else if (e.metaKey)
            this.selectMiscCells = e.metaKey;
        else
            this.selectMiscCells = false;
    },
    getSelectedObjects: function () {
        return this.returnObjects;
    },
    getColFrom: function () {
        return this.colFrom;
    },
    getColTo: function () {
        return this.colTo;
    },
    getRowFrom: function () {
        return this.rowFrom;
    },
    getRowTo: function () {
        return this.rowTo;
    },
    setIgnoreColumn: function (column) {
        this.ignoreColumns[column] = column;
    },
    setIgnoreRow: function (row) {
        this.ignoreRows[row] = row;
    },
    setSelectColor: function (selectColor) {
        this.selectColor = selectColor;
    },
    setUnselectColor: function (unselectColor) {
        this.unselectColor = unselectColor;
    },
    setCursor: function (cursor) {
        this.cursor = cursor;
    },
    setSelectColumnOnly: function (flag) {
        this.isSelectColumnOnly = flag;
    },
    setDisable: function (flag) {
        this.disableGrid = flag;
    },
    setSelectNonContiguous: function (flag) {
        this.selectNonContiguous = flag;
    },
    setBorderSize: function (size) {
        this.borderSize = size;
    },
    _setSelectedCells: function (colFrom, colTo, rowFrom, rowTo) {
        this.colFrom = colFrom;
        this.colTo = colTo;
        this.rowFrom = rowFrom;
        this.rowTo = rowTo;
    },
    _selectAndDrawCells: function (e) {
        this._selectCells(e);
        this._drawSelection(this.colFrom, this.colTo, this.rowFrom, this.rowTo);
    },
    _selectCells: function (e) {
        this.atColVal = e.cellIndex;
        this.atRowVal = this._getRowIndex(e.parentNode);
        if (this.atColVal <= 0)
            return;
        if (this.atRowVal <= 0)
            return;
        if (this.selectMultipleColumns) {
            if (this.atColVal < this.centerCellColVal) {
                this.colFrom = this.atColVal;
                this.colTo = this.centerCellColVal;
                this._getRowSelection();
                return;
            }
            if (this.atColVal > this.centerCellColVal) {
                this.colFrom = this.centerCellColVal;
                this.colTo = this.atColVal;
                this._getRowSelection();
                return;
            }
        }
        if (this.atColVal == this.centerCellColVal) {
            this.colFrom = this.centerCellColVal;
            this.colTo = this.centerCellColVal;
            this._getRowSelection();
            return;
        }
        if (this.atRowVal < this.centerCellRowVal) {
            this.rowFrom = this.atRowVal;
            this.rowTo = this.centerCellRowVal;
            this._getColSelection();
            return;
        }
        if (this.atRowVal > this.centerCellRowVal) {
            this.rowFrom = this.centerCellRowVal;
            this.rowTo = this.atRowVal;
            this._getColSelection();
            return;
        }
        if (this.atRowVal == this.centerCellRowVal) {
            this.rowFrom = this.centerCellRowVal;
            this.rowTo = this.centerCellRowVal;
            this._getColSelection();
            return;
        }
    },
    _getRowSelection: function () {
        if (this.atRowVal <= this.centerCellRowVal) {
            this.rowFrom = this.atRowVal;
            this.rowTo = this.centerCellRowVal;
        } else {
            this.rowFrom = this.centerCellRowVal;
            this.rowTo = this.atRowVal;
        }
    },
    _getColSelection: function () {
        if (this.selectMultipleColumns) {
            if (this.atColVal < this.centerCellColVal) {
                this.colFrom = this.atColVal;
                this.colTo = this.centerCellColVal;
                return;
            }
            if (this.atColVal > this.centerCellColVal) {
                this.colFrom = this.centerCellColVal;
                this.colTo = this.atColVal;
                return;
            }
        }
        if (this.atColVal == this.centerCellColVal) {
            this.colFrom = this.centerCellColVal;
            this.colTo = this.centerCellColVal;
        }
    },
    _drawSelection: function (colFrom, colTo, rowFrom, rowTo) {
        this._highlightCells(colFrom, colTo, rowFrom, rowTo);
    },
    restoreCellColors: function () {
        for (var key in this.returnObjects) {
            var color = "";
            var cell = key.split(",");
            var e = this.getTableCell(parseInt(cell[1]) - 1, cell[0]);
            removeClassName(e, "list_edit_selected_cell");
        }
        this.returnObjects = new Object();
    },
    _highlightCells: function (colFrom, colTo, rowFrom, rowTo) {
        if (!this.selectMiscCells)
            this.restoreCellColors();
        for (var x = colFrom; x <= colTo; x++) {
            for (var y = rowFrom; y <= rowTo; y++) {
                try {
                    var e = this.tableElement.rows[y].cells[x];
                    addClassName(e, "list_edit_selected_cell");
                    this.returnObjects[x + "," + y] = e.id;
                }
                catch (err) {
                }
            }
        }
    },
    _clearAllCells: function () {
        for (var x = 1; x <= this.maxCol; x++) {
            for (var y = 1; y < this.maxRow; y++) {
                try {
                    var cell = this.getTableCell(y, x);
                    cell.style.backgroundColor = "";
                    cell.style.border = "0px";
                }
                catch (err) {
                }
            }
        }
    },
    clearRanges: function () {
        try {
            if (ie5)
                document.selection.empty();
            else
                window.getSelection().removeAllRanges();
        } catch (e) {
        }
    },
    getGridInfo: function () {
        var rows = this.getTableRows();
        this.maxRow = rows.length;
        if (rows.length > 0)
            this.maxCol = rows[0].cells.length;
    },
    setMaxRow: function (max) {
        this.maxRow = max;
    },
    _setEpicenter: function (e) {
        var element = this.retrieveCellFromNestedDOMElement(Event.element(e), 'DIV');
        this.centerCellColVal = element.cellIndex;
        this.centerCellRowVal = this._getRowIndex(element.parentNode);
    },
    handleBeforeSelect: function (e) {
    },
    retrieveCellFromNestedDOMElement: function (element, tagName) {
        if (element.tagName == tagName && element.parentNode.tagName == 'TD')
            return element.parentNode;
        return element;
    },
    handleOnSelect: function (selectedCells) {
    },
    setBeforeSelect: function (flag) {
        this.beforeSelect = flag;
    },
    setOnSelect: function (flag) {
        this.onSelect = flag;
    },
    _getRowIndex: function (element) {
        return this.getTableRows().indexOf(element) + 1;
    },
    getTableRows: function () {
        var rows = this.tableElement.rows;
        listRows = [];
        for (var i = 0, n = rows.length; i < n; i++) {
            var row = rows[i];
            if (!hasClassName(row, 'list_row'))
                continue;
            listRows.push(row);
        }
        return listRows;
    },
    getTableCell: function (rowNdx, colNdx) {
        var rows = this.getTableRows();
        if (!rows || !rows[rowNdx])
            return null;
        return rows[rowNdx].cells[colNdx];
    },
    z: null
});
;
/// <reference path="../classes/GlideRecord.js" />
/// <reference path="../classes/GlideWindow.js" />
/// <reference path="../classes/GlideDialogWindow.js" />
/// <reference path="../classes/GlideDialogForm.js" />
/// <reference path="../classes/GlidePaneForm.js" />
/// <reference path="../classes/GlidePane.js" />
/*! RESOURCE: /scripts/classes/GwtDraggable.js */
var GwtDraggable = Class.create(GwtObservable, {
    initialize: function (header, itemDragged) {
        this.header = $(header);
        if (!itemDragged)
            itemDragged = this.header;
        this.parentElement = getFormContentParent();
        this.setDraggable($(itemDragged));
        this.setCursor("move");
        this.setStart(this.genericStart.bind(this));
        this.setDrag(this.genericDrag.bind(this));
        this.setEnd(this.genericEnd.bind(this));
        this.scroll = false;
        this.differenceX = 0;
        this.differenceY = 0;
        this.shiftKey = false;
        this.fDrag = this.drag.bind(this);
        this.fEnd = this.end.bind(this);
        this.enable();
    },
    enable: function () {
        this.header.onmousedown = this.start.bind(this);
        this.header.ontouchstart = this.start.bind(this);
    },
    disable: function () {
        this.header.onmousedown = null;
        this.header.ontouchstart = null;
    },
    start: function (e) {
        e = getRealEvent(e);
        var ex, ey;
        if (e.type == 'touchstart') {
            ex = e.touches[0].pageX;
            ey = e.touches[0].pageY;
        } else {
            ex = e.clientX;
            ey = e.clientY;
        }
        if (this.getScroll()) {
            ex += getScrollX();
            ey += getScrollY();
        }
        this.differenceX = ex - grabOffsetLeft(this.draggable) + grabScrollLeft(this.draggable);
        this.differenceY = ey - grabOffsetTop(this.draggable) + grabScrollTop(this.draggable);
        this.shiftKey = e.shiftKey;
        Event.observe(this.parentElement, "mousemove", this.fDrag);
        Event.observe(this.parentElement, "mouseup", this.fEnd);
        Event.observe(this.parentElement, "touchmove", this.fDrag);
        Event.observe(this.parentElement, "touchend", this.fEnd);
        this.active = false;
        this._stopSelection(e);
        this.draggable.dragging_active = true;
        var ret = this.onDragStart(this, ex, ey, e);
        this.fireEvent("beforedrag", this, ex, ey, e);
        return ret;
    },
    destroy: function () {
        if (this.header) {
            this.header.onmousedown = null;
            this.header.ontouchstart = null;
        }
        this.header = null;
        this.draggable = null;
        this.parentElement = null;
    },
    drag: function (e) {
        if (!this.active) {
            createPageShim(this.parentElement);
            this.active = true;
        }
        this._stopSelection(e);
        e = getRealEvent(e);
        var ex, ey;
        if (e.type == 'touchmove') {
            ex = e.touches[0].pageX;
            ey = e.touches[0].pageY;
        } else {
            ex = e.clientX;
            ey = e.clientY;
        }
        if (this.getScroll()) {
            ex += getScrollX();
            ey += getScrollY();
        }
        var posX = parseInt(ex - this.differenceX);
        var posY = parseInt(ey - this.differenceY);
        var ret = this.onDrag(this, posX, posY, e);
        this.fireEvent("dragging", this, posX, posY, e);
        return ret;
    },
    end: function (e) {
        e = getRealEvent(e);
        Event.stopObserving(this.parentElement, "mousemove", this.fDrag);
        Event.stopObserving(this.parentElement, "mouseup", this.fEnd);
        Event.stopObserving(this.parentElement, "touchmove", this.fDrag);
        Event.stopObserving(this.parentElement, "touchend", this.fEnd);
        this.shiftKey = e.shiftKey;
        removePageShim(this.parentElement);
        this._restoreSelection();
        this.draggable.dragging_active = false;
        var ret = this.onDragEnd(this, e);
        if (!this.active)
            return;
        this.active = false;
        this.fireEvent("dragged", this, e);
        this.resetDraggable();
        return ret;
    },
    getDraggable: function () {
        return this.draggable;
    },
    getYDifference: function () {
        return this.differenceY;
    },
    getXDifference: function () {
        return this.differenceX;
    },
    getScroll: function () {
        return this.scroll;
    },
    setDraggable: function (e) {
        this.draggable = e;
    },
    setStart: function (f) {
        this.onDragStart = f;
    },
    setDrag: function (f) {
        this.onDrag = f;
    },
    setEnd: function (f) {
        this.onDragEnd = f;
    },
    setCursor: function (c) {
        if (this.header.style) {
            this.header.style.cursor = c;
        }
    },
    setScroll: function (s) {
        this.scroll = s;
    },
    saveAndSetDraggable: function (e) {
        this.origDraggable = this.draggable;
        this.setDraggable(e);
    },
    resetDraggable: function () {
        if (this.origDraggable) {
            this.draggable = this.origDraggable;
            this.origDraggable = null;
        }
    },
    genericStart: function (x, y) {
        return true;
    },
    genericEnd: function () {
        return true;
    },
    genericDrag: function (me, x, y) {
        me.draggable.style.left = x;
        me.draggable.style.top = y;
        return true;
    },
    _stopSelection: function (ev) {
        stopSelection(this.parentElement);
        if (ie5) {
            ev.cancelBubble = true;
            ev.returnValue = false;
        } else {
            if (typeof ev.preventDefault != 'undefined')
                ev.preventDefault();
            if (typeof ev.stopPropagation != 'undefined')
                ev.stopPropagation();
        }
    },
    _restoreSelection: function () {
        if (this.parentElement)
            restoreSelection(this.parentElement);
    },
    z: function () {
    }
});
function createPageShim(parentElement) {
    if (!parentElement)
        return;
    var w = (parentElement.scrollWidth ? parentElement.scrollWidth : parentElement.clientWidth);
    var h = (parentElement.scrollHeight ? parentElement.scrollHeight : parentElement.clientHeight);
    var pageShim = cel("div");
    pageShim.id = pageShim.name = "pageshim";
    pageShim.style.top = 0;
    pageShim.style.left = 0;
    pageShim.style.width = w + "px";
    pageShim.style.height = h + "px";
    pageShim.style.position = "absolute";
    pageShim.style.display = "block";
    pageShim.style.zIndex = "500";
    pageShim.style.backgroundColor = "red";
    pageShim.style.opacity = 0;
    pageShim.style.filter = "alpha(opacity=0)";
    parentElement.appendChild(pageShim);
}
function removePageShim(parentElement) {
    var pageShim = gel("pageshim");
    if (pageShim)
        parentElement.removeChild(pageShim);
}
;
/*! RESOURCE: /scripts/classes/ui/GlideDraggable.js */
var GlideDraggable = Class.create({
    V_SCROLL_REFRESH_FREQ_MS: 70,
    H_SCROLL_REFRESH_FREQ_MS: 50,
    initialize: function (hoverElem, dragElem) {
        this.setHoverElem(hoverElem);
        if (this.hoverElem == null)
            return;
        this.setDragElm(dragElem || this.hoverElem);
        this.boundElem = document.body;
        this.setDragFunction(this.genericDrag);
        this.onScroll = {};
        this.allowedClasses = [];
    },
    destroy: function () {
        this.reset();
        this.hoverElem = null;
        this.dragElem = null;
        this.boundElem = null;
        this.onStart = null;
        this.onDrag = null;
        this.onScroll = null;
        this.onEnd = null;
    },
    reset: function () {
        clearInterval(this.leftScrollId);
        clearInterval(this.rightScrollId);
        clearInterval(this.topScrollId);
        clearInterval(this.bottomScrollId);
        this.leftScrollId = null;
        this.rightScrollId = null;
        this.topScrollId = null;
        this.bottomScrollId = null;
        delete this._origDragElmCoords;
        delete this._origPageCoords;
        delete this._shift;
        delete this._pageCoords;
        delete this._dragElmCoords;
    },
    genericDrag: function (e, dragElem, pageCoords, shift, dragCoords) {
        dragElem.style.left = dragCoords.x + 'px';
        dragElem.style.top = dragCoords.y + 'px';
    },
    setHoverCursor: function (c) {
        this.hoverCursor = c;
        this.hoverElem.style.cursor = c;
    },
    setHoverElem: function (obj) {
        this.hoverElem = $(obj);
        if (this.hoverElem) {
            this.hoverElem.style.MozUserSelect = '-moz-none';
            this.hoverElem.onselectstart = function () { return false; };
        }
    },
    getHoverElem: function () {
        return this.hoverElem;
    },
    setDragCursor: function (c) {
        this.dragCursor = c;
        if (this.pageShim)
            this.pageShim.style.cursor = this.dragCursor;
    },
    setDragElm: function (obj) {
        this.dragElem = $(obj);
        this.dragElem.style.MozUserSelect = '-moz-none';
    },
    setStartFunction: function (f) {
        if (this._fDraggableStart)
            document.stopObserving('mousedown', this._fDraggableStart);
        this._fDraggableStart = this._draggableStart.bind(this);
        this.hoverElem.observe('mousedown', this._fDraggableStart);
        this.onStart = f;
    },
    setDragFunction: function (f) {
        this.onDrag = f;
    },
    setEndFunction: function (f) {
        this.onEnd = f;
    },
    setAutoScrollLeft: function (f, x) {
        this.onScroll.LEFT = f;
        this.onScroll.LEFTX = x;
    },
    setAutoScrollRight: function (f, x) {
        this.onScroll.RIGHT = f;
        this.onScroll.RIGHTX = x;
    },
    setAutoScrollTop: function (f, y) {
        this.onScroll.TOP = f;
        this.onScroll.TOPX = y;
    },
    setAutoScrollBottom: function (f, y) {
        this.onScroll.BOTTOM = f;
        this.onScroll.BOTTOMX = y;
    },
    addAllowedTargetClass: function (className) {
        this.allowedClasses.push(className);
    },
    start: function (event) {
        this._getCoords(event);
        if (window.GlideContextMenu && typeof GlideContextMenu.closeAllMenus == 'function' && event.target && !$(event.target).up('.cm_menuwrapper')) {
            GlideContextMenu.closeAllMenus();
        }
        this._fDraggableMove = this._draggableMove.bind(this);
        this._fdraggableEnd = this._draggableEnd.bind(this);
        document.observe('mousemove', this._fDraggableMove);
        document.observe('mouseup', this._fdraggableEnd);
        if (this.dragCursor)
            this.dragElem.style.cursor = this.dragCursor;
        document.body.focus();
        document.onselectstart = function () { return false; };
    },
    _createPageShim: function () {
        this.pageShim = document.createElement('div');
        this.boundElem.appendChild(this.pageShim);
        this.pageShim.style.top = 0;
        this.pageShim.style.left = 0;
        this.pageShim.style.width = '100%';
        this.pageShim.style.height = '100%';
        this.pageShim.style.position = 'absolute';
        this.pageShim.style.display = 'block';
        this.pageShim.style.zIndex = '9999';
        this.pageShim.style.backgroundColor = Prototype.Browser.IE ? '#ccc' : 'transparent';
        this.pageShim.style.opacity = '0';
        this.pageShim.style.filter = 'alpha(opacity=0)';
        if (this.dragCursor) {
            this.pageShim.style.cursor = this.dragCursor;
            this.dragElem.style.cursor = this.dragCursor;
        }
    },
    _removePageShim: function () {
        if (this.pageShim)
            this.pageShim.parentNode.removeChild(this.pageShim);
        this.pageShim = null;
    },
    _getCoords: function (event) {
        event = event || window.event;
        if (!event.pageX) {
            event.pageX = event.clientX;
            event.pageY = event.clientY;
        }
        if (!this._origPageCoords)
            this._origPageCoords = { x: event.pageX, y: event.pageY };
        if (!this._origDragElmCoords) {
            var cumulativeOffset = this.dragElem.cumulativeOffset();
            if (this.dragElem.style.right) {
                this.dragElem.style.left = (this.dragElem.up().getWidth() - this.dragElem.getWidth() - parseInt(this.dragElem.style.right, 10)) + 'px';
                this.dragElem.setStyle({ right: '' });
            }
            this._origDragElmCoords = {
                x: parseInt(this.dragElem.style.left, 10) || cumulativeOffset.left,
                y: parseInt(this.dragElem.style.top, 10) || cumulativeOffset.top
            };
        }
        this._shift = !this._pageCoords ? { x: 0, y: 0 } : { x: (event.pageX - this._pageCoords.x), y: (event.pageY - this._pageCoords.y) };
        this._pageCoords = { x: event.pageX, y: event.pageY };
        this._dragElmCoords = {
            x: this._origDragElmCoords.x + (this._pageCoords.x - this._origPageCoords.x),
            y: this._origDragElmCoords.y + (this._pageCoords.y - this._origPageCoords.y)
        };
    },
    _draggableStart: function (event) {
        var l = this.allowedClasses.length;
        if (l > 0) {
            var boolCanStart = false;
            for (var i = 0; i < l; i++) {
                if (event.target.className == this.allowedClasses[i]) {
                    boolCanStart = true;
                    break;
                }
            }
            if (!boolCanStart)
                return true;
        }
        this.start(event);
        return this.onStart(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this);
    },
    _draggableMove: function (event) {
        this._getCoords(event);
        if (!this.pageShim) {
            this._createPageShim();
            if (Prototype.Browser.IE)
                this.dragElem.up().onselectstart = function () { return false; };
        }
        if (this._shift.x == 0 && this._shift.y == 0)
            return;
        if (this.onScroll.LEFT && this._pageCoords.x < this.onScroll.LEFTX) {
            if (!this.leftScrollId)
                this.leftScrollId = setInterval(this._autoXScrollerInterceptor.bind(this, this.onScroll.LEFT, this.onScroll.LEFTX), this.H_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.y == 0)
                return;
        } else if (this.onScroll.LEFT && this.leftScrollId && this._pageCoords.x >= this.onScroll.LEFTX) {
            clearInterval(this.leftScrollId);
            this.leftScrollId = null;
        }
        if (this.onScroll.RIGHT && this._pageCoords.x > this.onScroll.RIGHTX) {
            if (!this.rightScrollId)
                this.rightScrollId = setInterval(this._autoXScrollerInterceptor.bind(this, this.onScroll.RIGHT, this.onScroll.RIGHTX), this.H_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.y == 0)
                return;
        } else if (this.onScroll.RIGHT && this.rightScrollId && this._pageCoords.x <= this.onScroll.RIGHTX) {
            clearInterval(this.rightScrollId);
            this.rightScrollId = null;
        }
        if (this.onScroll.TOP && this._pageCoords.y < this.onScroll.TOPX) {
            if (!this.topScrollId)
                this.topScrollId = setInterval(this._autoYScrollerInterceptor.bind(this, this.onScroll.TOP, this.onScroll.TOPX), this.V_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.x == 0)
                return;
        } else if (this.onScroll.TOP && this.topScrollId && this._pageCoords.y >= this.onScroll.TOPX) {
            clearInterval(this.topScrollId);
            this.topScrollId = null;
        }
        if (this.onScroll.BOTTOM && this._pageCoords.y > this.onScroll.BOTTOMX) {
            if (!this.bottomScrollId)
                this.bottomScrollId = setInterval(this._autoYScrollerInterceptor.bind(this, this.onScroll.BOTTOM, this.onScroll.BOTTOMX), this.V_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.x == 0)
                return;
        } else if (this.onScroll.BOTTOM && this.bottomScrollId && this._pageCoords.y <= this.onScroll.BOTTOMX) {
            clearInterval(this.bottomScrollId);
            this.bottomScrollId = null;
        }
        this.onDrag(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this);
        return false;
    },
    _autoXScrollerInterceptor: function (f, boundaryX) {
        f(this.dragElem, this._pageCoords.x - boundaryX, this._pageCoords);
    },
    _autoYScrollerInterceptor: function (f, boundaryY) {
        f(this.dragElem, this._pageCoords.y - boundaryY, this._pageCoords);
    },
    _draggableEnd: function (event) {
        this._removePageShim();
        document.onselectstart = null;
        if (Prototype.Browser.IE)
            this.dragElem.up().onselectstart = null;
        if (this.hoverCursor)
            this.hoverElem.style.cursor = this.hoverCursor;
        document.stopObserving('mousemove', this._fDraggableMove);
        document.stopObserving('mouseup', this._fdraggableEnd);
        event.stopPropagation();
        this._getCoords(event);
        var boolReturn = this.onEnd ? this.onEnd(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this) : true;
        this.reset();
        return boolReturn;
    },
    toString: function () { return 'GlideDraggable'; }
});
;
/*! RESOURCE: /scripts/classes/GwtDraggableSnap.js */
var debugId = 0;
var GwtDraggableSnap = Class.create(GwtDraggable, {
    initialize: function (header, itemDragged) {
        GwtDraggable.prototype.initialize.call(this, header, itemDragged);
        this.snapTable = null;
        this.dropZoneList = [];
        this.initDropZones = null;
        this.boundDirection = null;
        this.boundElement = null;
        this.setStart(this.snapStart.bind(this));
        this.setDrag(this.snapDrag.bind(this));
        this.setEnd(this.snapEnd.bind(this));
        this.setCreateFloat(this._createFloat.bind(this));
        this.setFloatClassName("drag_float_visible");
    },
    destroy: function () {
        this.snapTable = null;
        this.dropZoneList = null;
        this.onInitDropZones = null;
        this.boundElement = null;
        GwtDraggable.prototype.destroy.call(this);
    },
    setCreateFloat: function (f) {
        this.onCreateFloat = f;
        if (!f)
            this.onCreateFloat = this._createFloat.bind(this);
    },
    setFloatClassName: function (n) {
        this.floatClassName = n;
    },
    setSnapTable: function (table) {
        this.snapTable = table;
        this.dropZoneList = [];
    },
    setInitDropZones: function (f) {
        this.onInitDropZones = f;
        this.snapTable = null;
        this.dropZoneList = [];
    },
    setBoundLeftRight: function () {
        this.boundDirection = "l-r";
    },
    setBoundUpDown: function () {
        this.boundDirection = "u-d";
    },
    setBoundElement: function (element) {
        this.boundElement = element;
    },
    addDropZone: function (element) {
        this.dropZoneList.push(element);
    },
    removeDropZone: function (element) {
        for (var i = 0; i < this.dropZoneList.length; i++) {
            if (element.id == this.dropZoneList[i].id) {
                this.dropZoneList.remove(i);
                break;
            }
        }
    },
    clearDropZones: function () {
        this.dropZoneList = [];
    },
    snapStart: function (dragObj, x, y, e) {
        x -= this.differenceX;
        y -= this.differenceY;
        if (dragObj.draggable.style.position == "absolute")
            this.snapMode = "absolute";
        else
            this.snapMode = "relative";
        this.currentDropZone = null;
        this.snapElement = null;
        this.dragFloat = null;
        this._initDropZones(dragObj, x, y);
        this._initDragBounds(x, y);
        return true;
    },
    snapDrag: function (dragObj, x, y, e) {
        var pos = this._boundDragging(x, y);
        x = pos[0];
        y = pos[1];
        if (!this.dragFloat)
            this.dragFloat = this.onCreateFloat(dragObj, x, y);
        if (this.dragFloat) {
            this.dragFloat.style.left = x;
            this.dragFloat.style.top = y;
        }
        this._findDropZoneAndMove(dragObj, x + this.differenceX, y + this.differenceY);
        return true;
    },
    snapEnd: function (dragObj, x, y, e) {
        this.dropZones = [];
        if (this.dragFloat)
            this.floatIntv = this._floatBackAndDelete(this, 150, 15);
        return true;
    },
    hasSnapMoved: function () {
        return this.originalDropZone != this.currentDropZone;
    },
    _createFloat: function (dragObj, x, y) {
        var dfloat = cel("div");
        dfloat.id = "floater";
        dfloat.className = this.floatClassName;
        dfloat.style.position = "absolute";
        dfloat.style.width = dragObj.draggable.offsetWidth - (!isMSIE ? 2 : 0);
        dfloat.style.height = dragObj.draggable.offsetHeight - (!isMSIE ? 2 : 0);
        document.body.appendChild(dfloat);
        return dfloat;
    },
    _boundDragging: function (x, y) {
        if (this.boundDirection == "l-r")
            y = this.origY;
        else if (this.boundDirection == "u-d")
            x = this.origX;
        if (this.boundElement) {
            if (y < this.boundTop)
                y = this.boundTop;
            if (y > this.boundBottom)
                y = this.boundBottom;
            if (x < this.boundLeft)
                x = this.boundLeft;
            if (x > this.boundRight)
                x = this.boundRight;
        }
        return [x, y];
    },
    _findDropZoneAndMove: function (dragObj, x, y) {
        if (this.snapMode == "absolute") {
            if (this.currentDropZone && this._overlaps(this.currentDropZone, x, y))
                return false;
            var dz = this._findDropZoneAbsolute(dragObj, x, y);
            if (dz && dz != this.currentDropZone) {
                this.currentDropZone = dz;
                this.snapElement = dz.element;
                if (!this.fireEvent("beforedrop", dragObj, dz.element, dz.element, x, y))
                    return false;
                dragObj.draggable.style.left = this.currentDropZone.left;
                dragObj.draggable.style.top = this.currentDropZone.top;
                return true;
            }
        } else {
            var dz = this._findDropZoneRelative(dragObj, x, y);
            if (dz && dragObj.draggable.nextSibling != dz.element) {
                this.currentDropZone = dz;
                this.snapElement = dz.element.parentNode;
                if (!this.fireEvent("beforedrop", dragObj, dz.element.parentNode, dz.element, x, y))
                    return false;
                dz.element.parentNode.insertBefore(dragObj.draggable, dz.element);
                dragObj.draggable.parentNode.style.display = "none";
                dragObj.draggable.parentNode.style.display = "";
                return true;
            }
        }
        return false;
    },
    _findDropZoneAbsolute: function (dragObj, x, y) {
        var dz = null;
        for (var i = 0; i < this.dropZones.length; i++) {
            if (this._overlaps(this.dropZones[i], x, y)) {
                dz = this.dropZones[i];
                break;
            }
        }
        return dz;
    },
    _findDropZoneRelative: function (dragObj, x, y) {
        var draggable = dragObj.getDraggable();
        var cCell = null;
        var aLargeNumber = 100000000;
        for (var z = 0; z < this.dropZones.length; z++) {
            var dz = this.dropZones[z];
            if (draggable == dz)
                continue;
            var ai = Math.sqrt(Math.pow(x - dz.left, 2) + Math.pow(y - dz.top, 2));
            if (isNaN(ai))
                continue;
            if (ai < aLargeNumber) {
                aLargeNumber = ai;
                cCell = dz;
            }
        }
        return cCell;
    },
    _initDragBounds: function (x, y) {
        this.origX = x;
        this.origY = y;
        if (this.boundElement) {
            this.boundLeft = grabOffsetLeft(this.boundElement) - grabScrollLeft(this.boundElement);
            this.boundTop = grabOffsetTop(this.boundElement) - grabScrollTop(this.boundElement);
            this.boundRight = this.boundLeft + this.boundElement.offsetWidth - this.draggable.offsetWidth;
            this.boundBottom = this.boundTop + this.boundElement.offsetHeight - this.draggable.offsetHeight;
            this.boundLeft -= 4;
            this.boundTop -= 4;
            this.boundRight += 4;
            this.boundBottom += 4;
        }
    },
    _initDropZones: function (dragObj, x, y) {
        this.dropZones = [];
        var zones = [];
        if (this.onInitDropZones) {
            zones = this.onInitDropZones(this, x, y);
        } else if (this.snapTable) {
            zones = this._initDropZonesFromTable(this.snapTable);
        } else {
            for (var i = 0; i < this.dropZoneList.length; i++)
                zones.push(this.dropZoneList[i]);
        }
        for (var i = 0; i < zones.length; i++) {
            var zone = zones[i];
            if (this.snapMode == "absolute") {
                this._addDropZone(zone);
            } else {
                this._initDropZonesRelative(dragObj, zone);
            }
        }
        if (this.snapMode == "absolute") {
            this.originalDropZone = this._findDropZoneAbsolute(dragObj, x, y);
        } else {
            var nextSibling = dragObj.draggable.nextSibling;
            for (var i = 0; i < this.dropZones.length; i++) {
                if (this.dropZones[i].element == nextSibling) {
                    this.originalDropZone = this.dropZones[i];
                    break;
                }
            }
        }
    },
    _initDropZonesFromTable: function (t) {
        var zones = [];
        var rowCnt = t.rows.length;
        var colCnt = t.rows[0].cells.length;
        for (var row = 0; row < rowCnt; row++) {
            for (var col = 0; col < colCnt; col++) {
                var cell = t.rows[row].cells[col];
                if (getAttributeValue(cell, "dropzone") == "true" || cell.dropzone == "true")
                    zones.push(cell);
            }
        }
        return zones;
    },
    _initDropZonesRelative: function (dragObj, zone) {
        var myHeight = 0;
        var lastDivExists = false;
        for (var i = 0; i < zone.childNodes.length; i++) {
            var node = zone.childNodes[i];
            if (getAttributeValue(node, "dragpart")
                || node.dragpart == "true"
                || getAttributeValue(node, "dropzone")
                || node.dropzone == "true") {
                if ((node.id == "lastdiv") || (node.name == "lastdiv"))
                    lastDivExists = true;
                if (node == dragObj.draggable) {
                    myHeight = dragObj.draggable.offsetHeight;
                }
                if (this._isInScrollRegion(node, zone)) {
                    this._addDropZone(node, myHeight);
                }
            }
        }
        if (!lastDivExists) {
            var lastDiv = cel("DIV");
            lastDiv.name = "lastdiv";
            lastDiv.dropzone = "true";
            lastDiv.style.width = "100%";
            lastDiv.style.height = "0";
            zone.appendChild(lastDiv);
            this._addDropZone(lastDiv, myHeight);
        }
    },
    _addDropZone: function (element, topOffset) {
        if (!topOffset)
            topOffset = 0;
        var dropZone = {};
        dropZone.element = element;
        dropZone.left = grabOffsetLeft(element) - grabScrollLeft(element);
        dropZone.top = grabOffsetTop(element) - topOffset - grabScrollTop(element);
        dropZone.right = dropZone.left + element.offsetWidth;
        dropZone.bottom = dropZone.top + element.offsetHeight;
        this.dropZones.push(dropZone);
    },
    _isInScrollRegion: function (element, region) {
        var left = element.offsetLeft;
        var top = element.offsetTop;
        if (left < 0)
            left = 0;
        if (top < 0)
            top = 0;
        return (left >= region.scrollLeft)
            && (top >= region.scrollTop)
            && (left <= (region.scrollLeft + region.offsetWidth))
            && (top <= (region.scrollTop + region.offsetHeight));
    },
    _overlaps: function (dz, x, y) {
        return ((dz.left < x) && (x < dz.right) && (dz.top < y) && (y < dz.bottom));
    },
    _floatBackAndDelete: function (gd, tTime, tMoves) {
        var baseObj = gd.getDraggable();
        var movenObj = gd.dragFloat;
        var currentX = parseInt(movenObj.style.left);
        var currentY = parseInt(movenObj.style.top);
        var backX = (currentX - grabOffsetLeft(baseObj) - grabScrollLeft(baseObj)) / tMoves;
        var backY = (currentY - grabOffsetTop(baseObj) - grabScrollTop(baseObj)) / tMoves;
        return setInterval(
            function () {
                if (tMoves < 1) {
                    clearInterval(gd.floatIntv);
                    gd.dragFloat.parentNode.removeChild(gd.dragFloat);
                    gd.dragFloat = null;
                    return;
                }
                tMoves--;
                currentX -= backX;
                currentY -= backY;
                movenObj.style.left = parseInt(currentX) + "px";
                movenObj.style.top = parseInt(currentY) + "px"
            }, tTime / tMoves)
    },
    z: null
});
;
/*! RESOURCE: /scripts/classes/AutoComplete.js */
var AutoComplete = Class.create({
    initialize: function () {
        this.processor = "AutoComplete";
        this.table = null;
        this.column = null;
        this.query = null;
        this.typedChars = "";
        this.input = null;
        this.select = null;
        this.timeout = null;
        this.keyDelay = 500;
    },
    setTable: function (name) {
        this.table = name;
    },
    setColumn: function (name) {
        this.column = name;
    },
    setQuery: function (query) {
        this.query = query;
    },
    setSelect: function (o) {
        this.select = gel(o);
    },
    setInput: function (o) {
        this.input = gel(o);
    },
    onKeyUp: function (event) {
        if (this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(this._onKeyUp.bind(this), this.keyDelay);
    },
    _onKeyUp: function () {
        this.timeout = null;
        this.typedChars = this.input.value;
        this.ajaxRequest();
    },
    ajaxRequest: function (urlParameters) {
        var ajax = new GlideAjax(this.processor);
        ajax.addParam("sysparm_chars", this.typedChars);
        ajax.addParam("sysparm_name", this.table + "." + this.column);
        if (this.query)
            ajax.addParam("sysparm_query", this.query);
        ajax.getXML(this.ajaxResponse.bind(this));
    },
    ajaxResponse: function (request) {
        if (!request.responseXML.documentElement)
            return;
        this.populateSelect(request.responseXML.documentElement);
    },
    populateSelect: function (xml) {
        this.select.options.length = 0;
        var items = xml.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var o = new Option(item.getAttribute('label'), item.getAttribute('sys_id'));
            this.select.options[this.select.options.length] = o;
        }
    }
});
;
/*! RESOURCE: /scripts/classes/SlushBucket.js */
var SlushBucket = Class.create({
    initialize: function (id) {
        this.id = id;
        this.leftSelectJustify = "";
        this.rightSelectJustify = "";
        this.rightValues = "";
        this.evenOddColoring = false;
        this.isTemplating = false;
        this.ignoreDuplicates = false;
    },
    getLeftSelectJustify: function () {
        return this.leftSelectJustify;
    },
    setLeftSelectJustify: function (justify) {
        this.leftSelectJustify = justify;
        this.getLeftSelect().style.textAlign = justify;
    },
    getRightSelectJustify: function () {
        return this.rightSelectJustify;
    },
    setRightSelectJustify: function (justify) {
        this.rightSelectJustify = justify;
        this.getRightSelect().style.textAlign = justify;
    },
    getEvenOddColoring: function () {
        return this.evenOddColoring;
    },
    setEvenOddColoring: function (evenOdd) {
        this.evenOddColoring = evenOdd;
    },
    addLeftChoice: function (value, text) {
        var opt = cel("option");
        opt.value = value;
        opt.text = text;
        this.getLeftSelect().options.add(opt);
    },
    addRightChoice: function (value, text) {
        var opt = cel("option");
        opt.value = value;
        opt.text = text;
        this.getRightSelect().options.add(opt);
    },
    clear: function () {
        this.clearSelect(this.getLeftSelect());
        this.clearSelect(this.getRightSelect());
    },
    clearSelect: function (selectBox) {
        selectBox.options.length = 0;
    },
    getValues: function (selectBox) {
        var values = new Array();
        var options = selectBox.options;
        for (var i = 0; i < options.length; i++) {
            values[i] = options[i].value;
        }
        return values;
    },
    saveRightValues: function (values) {
        this.rightValues = values;
    },
    getRightValues: function () {
        return this.rightValues;
    },
    getSelected: function (selectBox) {
        var selectedIds = [];
        var sourceOptions = selectBox.options;
        for (var i = 0; i < sourceOptions.length; i++) {
            option = sourceOptions[i];
            if (!option.selected)
                continue;
            selectedIds.push(i);
        }
        return selectedIds;
    },
    getRightSelect: function () {
        return gel(this.id + "_right");
    },
    getLeftSelect: function () {
        return gel(this.id + "_left");
    },
    onKeyMoveLeftToRight: function (evt) {
        var desiredKeyCode = this._isRTL() ? 37 : 39;
        if (evt.keyCode != desiredKeyCode)
            return;
        this.moveOptions(this.getLeftSelect(), this.getRightSelect());
    },
    onKeyMoveRightToLeft: function (evt) {
        var desiredKeyCode = this._isRTL() ? 39 : 37;
        if (evt.keyCode != desiredKeyCode)
            return;
        this.moveOptions(this.getRightSelect(), this.getLeftSelect());
    },
    moveLeftToRight: function () {
        this.moveOptions(this.getLeftSelect(), this.getRightSelect());
    },
    moveRightToLeft: function () {
        this.moveOptions(this.getRightSelect(), this.getLeftSelect());
    },
    copyLeftToRight: function () {
        this.moveOptions(this.getLeftSelect(), this.getRightSelect(), true);
    },
    _isRTL: function () {
        return document.documentElement.getAttribute('dir') == 'rtl';
    },
    moveOptions: function (sourceSelect, targetSelect, copyFlag) {
        var selectedIds = this.getSelected(sourceSelect);
        if (selectedIds.length < 1)
            return;
        var sourceOptions = sourceSelect.options;
        var targetOptions = targetSelect.options;
        targetSelect.selectedIndex = -1;
        for (var i = 0; i < selectedIds.length; i++) {
            var soption = sourceOptions[selectedIds[i]];
            var label = soption.text;
            if ((this.ignoreDuplicates) && (this._isDuplicate(targetOptions, soption.value)))
                continue;
            option = new Option(label, sourceOptions[selectedIds[i]].value);
            option.cl = label;
            option.style.color = sourceOptions[selectedIds[i]].style.color;
            targetOptions[targetOptions.length] = option;
            targetOptions[targetOptions.length - 1].selected = true;
        }
        if (!copyFlag) {
            for (var i = selectedIds.length - 1; i > -1; i--)
                sourceSelect.remove(selectedIds[i]);
        }
        this.evenOddColorize();
        if (targetSelect["onchange"])
            targetSelect.onchange();
        if (sourceSelect["onchange"])
            sourceSelect.onchange();
        sourceSelect.disabled = true;
        sourceSelect.disabled = false;
        if (selectedIds.length > 0 && !this.isTemplating) {
            targetSelect.focus();
        }
        var rightElem = [gel(this.id + "_right").options];
        if (rightElem[0].length > 0) {
            var e = gel(this.id);
            var newVal = new Array;
            var rightElementOptions = rightElem[0];
            for (var i = 0; i < rightElementOptions.length; i++)
                newVal[i] = rightElementOptions[i].value;
            var newVal = newVal.join(',');
            var oldValue = e.value;
            if (oldValue != newVal) {
                e.value = newVal;
                multiModified(e);
            }
        } else {
            gel(this.id).value = "";
        }
    },
    moveUp: function () {
        sourceSelect = this.getRightSelect();
        var selectedIds = this.getSelected(sourceSelect);
        var options = sourceSelect.options;
        for (var i = 0; i < selectedIds.length; i++) {
            var selId = selectedIds[i];
            if (selId == 0)
                break;
            if (window['privateMoveUp'])
                privateMoveUp(options, selId);
            else
                this.swap(options[selId], options[selId - 1]);
            options[selId].selected = false;
            options[selId - 1].selected = true;
        }
        this.evenOddColorize();
        sourceSelect.focus();
        if (sourceSelect["onLocalMoveUp"])
            sourceSelect.onLocalMoveUp();
        function resetFields() {
            sourceSelect.removeAttribute("multiple");
            setTimeout(function () { sourceSelect.setAttribute("multiple", "multiple"); $(sourceSelect).stopObserving('click', resetFields); });
        }
        if (isMSIE8 || isMSIE9 || isMSIE10 || isMSIE11)
            $(sourceSelect).observe('click', resetFields);
    },
    moveDown: function () {
        var sourceSelect = this.getRightSelect();
        var selectedIds = this.getSelected(sourceSelect);
        selectedIds.reverse();
        var options = sourceSelect.options;
        for (var i = 0; i < selectedIds.length; i++) {
            var selId = selectedIds[i];
            if (selId + 1 == options.length)
                break;
            if (window['privateMoveDown'])
                privateMoveDown(options, selId);
            else
                this.swap(options[selId], options[selId + 1]);
            options[selId].selected = false;
            options[selId + 1].selected = true;
        }
        this.evenOddColorize();
        sourceSelect.focus();
        if (sourceSelect["onLocalMoveDown"])
            sourceSelect.onLocalMoveDown();
        function resetFields() {
            sourceSelect.removeAttribute("multiple");
            setTimeout(function () { sourceSelect.setAttribute("multiple", "multiple"); $(sourceSelect).stopObserving('click', resetFields); });
        }
        if (isMSIE8 || isMSIE9 || isMSIE10 || isMSIE11)
            $(sourceSelect).observe('click', resetFields);
    },
    swap: function (option1, option2) {
        if (!option2)
            return;
        var t = $j(option1).clone();
        t = t[0];
        t.text = option1.text;
        option1.value = option2.value;
        option1.text = option2.text;
        option2.value = t.value;
        option2.text = t.text;
    },
    evenOddColorize: function () {
        if (!this.evenOddColoring)
            return;
        rightSelect = this.getRightSelect();
        if (rightSelect.length < 1)
            return;
        var options = rightSelect.options;
        for (var i = 0; i < rightSelect.length; i++) {
            if ((i % 2) == 0)
                rightSelect.options[i].style.background = "white";
            else
                rightSelect.options[i].style.background = "#dddddd";
        }
    },
    _isDuplicate: function (options, value) {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == value)
                return true;
        }
        return false;
    },
    getClassName: function () {
        return "SlushBucket";
    },
    type: "Slushbucket"
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXCompleter.js */
var AJAXCompleter = Class.create({
    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_RETURN: 13,
    KEY_ESC: 27,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_DELETE: 46,
    KEY_HOME: 36,
    KEY_END: 35,
    KEY_PAGEUP: 33,
    KEY_PAGEDOWN: 34,
    initialize: function (name, elementName) {
        this.guid = guid();
        this.className = "AJAXCompleter";
        this.name = name;
        this.elementName = elementName;
        this.field = null;
        this.menuBorderSize = 1;
        this.resetSelected();
        this.ieIFrameAdjust = 4;
        this.initDropDown();
        this.initIFrame();
    },
    initDropDown: function () {
        var dd = gel(this.name);
        if (!dd) {
            dd = cel("div");
            dd.id = this.name;
            dd.className = "ac_dropdown";
            dd.setAttribute('aria-live', 'polite');
            dd.setAttribute('role', 'listbox');
            var style = dd.style;
            style.border = "black " + this.menuBorderSize + "px solid";
            this._setCommonStyles(style);
            style.backgroundColor = "white";
            style.zIndex = 20000;
        }
        this.dropDown = $(dd);
        addChild(dd);
        this.clearDropDown();
        this.currentMenuItems = [];
        this.currentMenuCount = this.currentMenuItems.length;
    },
    initIFrame: function () {
        var iFrame = gel(this.name + "_shim");
        if (!iFrame) {
            iFrame = cel("iframe");
            iFrame.name = this.name + "_shim";
            iFrame.scrolling = "no";
            iFrame.frameborder = "no";
            iFrame.src = "javascript:false;";
            iFrame.id = this.name + "_shim";
            var style = iFrame.style;
            style.height = 0;
            this._setCommonStyles(style);
            style.zIndex = this.dropDown.style.zIndex - 1;
            addChild(iFrame);
        }
        this.iFrame = $(iFrame);
    },
    _setCommonStyles: function (style) {
        style.padding = 1;
        style.visibility = "hidden";
        style.display = "none";
        style.position = "absolute";
    },
    setWidth: function (w) {
        this.dropDown.style.width = w + "px";
        this.iFrame.style.width = w + "px";
    },
    setHeight: function (height) {
        this.dropDown.height = height;
        if (g_isInternetExplorer)
            height += this.ieIFrameAdjust;
        this._setIframeHeight(height);
    },
    _setIframeHeight: function (height) {
        this.iFrame.style.height = height;
    },
    resetSelected: function () {
        this.selectedItemObj = null;
        this.selectedItemNum = -1;
    },
    clearDropDown: function () {
        this.hideDropDown();
        var dropDown = this.dropDown;
        while (dropDown.childNodes.length > 0)
            dropDown.removeChild(dropDown.childNodes[0]);
        this.currentMenuItems = [];
        this.currentMenuCount = this.currentMenuItems.length;
        this._setInactive();
    },
    _setActive: function () {
        window.g_active_ac = this;
    },
    _setInactive: function () {
        window.g_active_ac = null;
    },
    hideDropDown: function () {
        if (this.dropDown.style.visibility == "hidden")
            return;
        this._showHide("hidden", "none");
        this.element.removeAttribute('aria-activedescendant');
        this.element.setAttribute('aria-expanded', 'false');
        this.resetSelected();
    },
    onDisplayDropDown: function () {
    },
    showDropDown: function () {
        if (this.dropDown.style.visibility == "visible")
            return;
        this._showHide("visible", "inline");
        this.element.setAttribute('aria-expanded', 'true');
        this.onDisplayDropDown();
    },
    _showHide: function (type, display) {
        this.dropDown.style.visibility = type;
        this.iFrame.style.visibility = type;
        this.dropDown.style.display = display;
        this.iFrame.style.display = display;
    },
    isVisible: function () {
        return this.dropDown.style.visibility == "visible";
    },
    appendElement: function (element) {
        this.getDropDown().appendChild(element);
    },
    appendItem: function (item) {
        this.appendElement(item);
        if (this.currentMenuItems == null)
            this.currentMenuItems = [];
        item.acItemNumber = this.currentMenuItems.length;
        this.currentMenuItems.push(item);
        this.currentMenuCount = this.currentMenuItems.length;
    },
    selectNext: function () {
        var itemNumber = this.selectedItemNum;
        if (this.selectedItemNum < this.getMenuCount() - 1)
            itemNumber++;
        this.setSelection(itemNumber);
    },
    selectPrevious: function () {
        var itemNumber = this.selectedItemNum;
        if (this.selectedItemNum <= 0)
            return false;
        itemNumber--;
        this.setSelection(itemNumber);
        return true;
    },
    unsetSelection: function () {
        if (this.selectedItemNum == -1)
            return;
        this.setNonSelectedStyle(this.selectedItemObj);
        this.resetSelected();
    },
    setSelection: function (itemNumber) {
        this.unsetSelection();
        this.selectItem(itemNumber);
        this.setSelectedStyle(this.selectedItemObj);
    },
    selectItem: function (itemNumber) {
        this.selectedItemNum = itemNumber;
        this.selectedItemObj = this.currentMenuItems[itemNumber];
    },
    getMenuItems: function () {
        return this.currentMenuItems;
    },
    getObject: function (itemNumber) {
        return this.currentMenuItems[itemNumber];
    },
    getSelectedObject: function () {
        return this.getObject(this.selectedItemNum);
    },
    setSelectedStyle: function (element) {
        $(element).addClassName("ac_highlight");
        element.setAttribute('aria-selected', 'true');
        if (typeof element.displaySpan != "undefined") {
            alert("element.displaySpan.style.color");
            element.displaySpan.style.color = "white";
        }
    },
    setNonSelectedStyle: function (element) {
        $(element).removeClassName("ac_highlight");
        element.removeAttribute('aria-selected');
        if (element.displaySpan)
            element.displaySpan.style.color = "green";
    },
    setTargetTable: function (targetTable) {
        this.targetTable = targetTable;
    },
    getTargetTable: function () {
        return this.targetTable;
    },
    isPopulated: function () {
        return this.getMenuCount() > 0;
    },
    log: function (msg) {
        jslog(this.className + ": " + msg);
    },
    getIFrame: function () { return this.iFrame; },
    getField: function () { return this.field; },
    getDropDown: function () { return this.dropDown; },
    getMenuCount: function () { return this.currentMenuCount; }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceControls.js */
var AJAXReferenceControls = Class.create({
    initialize: function (tableElement, id, parentElement, refSysId, rowSysId, refQualTag) {
        this.refName = id;
        this.id = "LIST_EDIT_" + id;
        this.tableElement = tableElement;
        this.dependent = null;
        this.refQual = "";
        this.refImageFocused = false;
        this.refSysId = refSysId;
        this.rowSysId = rowSysId;
        this.createAdditionalValues(refQualTag);
        this.createInput(parentElement);
        this.createLookup(parentElement);
        this.createInputGroup(parentElement);
        this.createDependent(parentElement);
    },
    clearDropDown: function () {
        if (this.ac)
            this.ac.clearDropDown();
    },
    createAdditionalValues: function (refQualTag) {
        this.additionalValues = {};
        this.additionalValues.sys_uniqueValue = this.rowSysId;
        this.additionalValues.sys_target = this.tableElement.getTable().getName();
        this.additionalValues.sysparm_list_edit_ref_qual_tag = refQualTag;
    },
    createInput: function (parentElement) {
        var doctype = document.documentElement.getAttribute('data-doctype');
        this._createHidden(parentElement, this.id, '');
        this.input = cel("input", parentElement);
        input = this.input;
        if (doctype)
            input.className = 'form-control list-edit-input';
        input.id = "sys_display." + this.id;
        input.onfocus = this._onFocus.bind(this);
        input.onkeydown = this._onKeyDown.bindAsEventListener(this);
        input.onkeypress = this._onKeyPress.bindAsEventListener(this);
        input.onkeyup = this._onKeyUp.bindAsEventListener(this);
        input.autocomplete = "off";
        input.ac_columns = "";
        input.ac_order_by = "";
        input.setAttribute("data-ref-dynamic", this.tableElement.isDynamicCreation());
    },
    resolveReference: function () {
        if (this.ac)
            this.ac.onBlur();
    },
    setDisplayValue: function (value) {
        this.input.value = value;
    },
    getInput: function () {
        return this.input;
    },
    getValue: function () {
        return gel(this.id).value;
    },
    getDisplayValue: function () {
        return this.input.value;
    },
    isResolving: function () {
        return (this.ac && this.ac.isResolving());
    },
    isReferenceValid: function () {
        if (this.ac) {
            return this.ac.isReferenceValid();
        }
        return true;
    },
    setResolveCallback: function (f) {
        if (!this.ac)
            return;
        this.ac.setResolveCallback(f);
    },
    setReferenceQual: function (refQual) {
        this.refQual = refQual;
    },
    createLookup: function (parent) {
        var doctype = document.documentElement.getAttribute('data-doctype');
        var image = $(createImage("images/reference_list.gifx", "Lookup using list"));
        if (doctype)
            image = $(createIcon("icon-search"));
        image.width = 18;
        image.height = 16;
        image.id = "ref_list." + this.id;
        image.observe("click", this._refListOpen.bind(this));
        if (window.g_accessibility) {
            image.observe("keydown", function (evt) {
                if (evt && evt.keyCode == Event.KEY_RETURN) {
                    evt.stop();
                    return this._refListOpen(evt);
                }
            }.bind(this));
        }
        image.style.marginLeft = "5px";
        image.setAttribute("tabindex", 0);
        image.setAttribute("role", "button");
        if (doctype)
            image = image.wrap('span', { 'class': 'input-group-addon', 'id': 'list-edit-span' });
        parent.appendChild(image);
    },
    createDependent: function (parent) {
        if (!this.tableElement.isDependent())
            return;
        var input = cel("input");
        input.type = "hidden";
        this.dependent = "sys_dependent";
        input.id = this.tableElement.getTable().getName() + "." + this.dependent;
        input.name = input.id;
        parent.appendChild(input);
        this.dependentInput = input;
    },
    createInputGroup: function (parent) {
        if (document.documentElement.getAttribute('data-doctype') != 'true')
            return;
        var divInputGroup = $('sys_display.' + this.id).wrap('div', { 'class': 'input-group', 'style': 'border-spacing:0' });
        var referenceIcon = $('list-edit-span')
        $('list-edit-span').remove();
        divInputGroup.appendChild(referenceIcon);
    },
    setRecord: function (record) {
        this.record = record;
    },
    _createHidden: function (parent, id, value) {
        var input = cel("input");
        input.type = "hidden";
        input.id = id;
        input.value = value;
        parent.appendChild(input);
        return input;
    },
    _setDependent: function () {
        if (this.dependent == null)
            return;
        var value = this.record.getValue(this.tableElement.getDependent());
        if ('NULL' === value)
            this.dependentInput.value = '';
        else
            this.dependentInput.value = value;
    },
    _onFocus: function (evt) {
        if (this.ac)
            return;
        this._setDependent();
        var dep = '';
        if (this.dependentInput)
            dep = "sys_dependent";
        var referenceValid = true;
        if (this.record && this.record.isReferenceValid)
            referenceValid = this.record.isReferenceValid();
        this.ac = new AJAXTableCompleter(this.input, this.id, dep, null, null, referenceValid);
        this.ac.elementName = this.refName;
        this.ac.setRefQual(this.refQual);
        this.ac.referenceSelect(this.refSysId, this.input.value, !referenceValid);
        this.ac.clearDerivedFields = false;
        for (var n in this.additionalValues)
            this.ac.setAdditionalValue(n, this.additionalValues[n]);
    },
    _onKeyDown: function (evt) {
        acReferenceKeyDown(this.input, evt);
    },
    _onKeyPress: function (evt) {
        acReferenceKeyPress(this.input, evt);
    },
    _onKeyUp: function (evt) {
        acReferenceKeyUp(this.input, evt);
    },
    _refListOpen: function (evt) {
        var te = this.tableElement;
        this._setDependent();
        var url = reflistOpenUrl(this.refName, this.id, te.getName(), te.getReference());
        for (var n in this.additionalValues)
            url += "&" + n + "=" + encodeText(this.additionalValues[n]);
        if (this.dependentInput)
            url += "&sysparm_dependent=" + escape(this.dependentInput.value);
        popupOpenStandard(url, "lookup");
        return false;
    },
    type: function () {
        return "AJAXReferenceControls";
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXOtherCompleter.js */
var AJAXOtherCompleter = Class.create(AJAXCompleter, {
    initialize: function (element, reference) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        this.className = "AJAXReferenceCompleter";
        this.dirty = false;
        this.matched = false;
        this.fieldChanged = false;
        this.ignoreAJAX = false;
        this.type = null;
        this.refField = null;
        this.textValue = "";
        this.invisibleTextValue = "";
        this.savedTextValue = "";
        this.savedInvisibleTextValue = "";
        this.previousTextValue = "";
        this.resultsStorage = new Object();
        this.emptyResults = new Object();
        this.oldFunctionJunk();
    },
    setInvisibleField: function (f) {
        this.iField = f;
        this._setAC(f);
    },
    setField: function (f) {
        this.field = f;
        this.field.autocomplete = "off";
        this._setAC(f);
    },
    setUpdateField: function (f) {
        this.updateField = f;
        this._setAC(f);
    },
    _setAC: function (field) {
        if (field)
            field.ac = this;
    },
    setType: function (type) {
        this.type = type;
    },
    setSavedText: function (textArray) {
        if (textArray[0] != null)
            this.savedInvisibleTextValue = textArray[0];
        this.savedTextValue = textArray[1];
    },
    getMenu: function () { return this.getDropDown(); },
    getUpdateField: function () {
        return this.updateField;
    },
    oldFunctionJunk: function () {
        this.isOTM = function () { return this.type == ONE_TO_MANY; };
        this.getInvisibleField = function () { return this.iField; };
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleter.js */
function acReferenceKeyDown(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    return element.ac.keyDown(evt);
}
function acReferenceKeyPress(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    var rv = element.ac.keyPress(evt);
    if (rv == false)
        evt.cancelBubble = true;
    return rv;
}
function acReferenceKeyUp(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    return element.ac.keyUp(evt);
}
addRenderEvent(function () {
    var statusEl = document.getElementById('ac.status');
    if (!statusEl) {
        statusEl = document.createElement('span');
        statusEl.id = 'ac.status';
        statusEl.setAttribute('role', 'status');
        statusEl.setAttribute('aria-live', 'polite');
        statusEl.classList.add('sr-only');
        document.body.appendChild(statusEl);
    }
})
var AJAXReferenceCompleter = Class.create(AJAXCompleter, {
    PROCESSOR: "Reference",
    initialize: function (element, reference, dependentReference, refQualElements, targetTable, referenceValid) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        this.className = "AJAXReferenceCompleter";
        this.element = $(element);
        this.keyElement = gel(reference);
        this.setDependent(dependentReference);
        this.setRefQualElements(refQualElements);
        this.setTargetTable(targetTable);
        this.additionalValues = {};
        CustomEvent.observe('domain_scope_changed', this.cacheClear.bind(this));
        this._commonSetup();
        this.oneMatchSelects = true;
        this.clearDerivedFields = true;
        this.allowInvalid = this.element.readAttribute('allow_invalid') == 'true';
        this.dynamicCreate = this.element.readAttribute('data-ref-dynamic') == 'true';
        this.isList = this.element.readAttribute('islist') == 'true';
        if (!this.simpleQualifier)
            this.refQual = "";
        this.isFilterUsingContains = this.element.readAttribute('is_filter_using_contains') == 'true';
        this.referenceValid = referenceValid;
    },
    _commonSetup: function () {
        this.element.ac = this;
        Event.observe(this.element, 'blur', this.onBlurEvent.bind(this));
        Event.observe(this.element, 'focus', this.onFocus.bind(this));
        this.saveKeyValue = this.getKeyValue();
        this.currentDisplayValue = this.getDisplayValue();
        this.searchChars = "";
        this.rowCount = 0;
        this.ignoreFocusEvent = false;
        this.max = 0;
        this.cacheClear();
        this.hasFocus = true;
        this.isResolvingFlag = false;
        var f = this.element.readAttribute("function");
        if (f)
            this.selectionCallBack = f;
        addUnloadEvent(this.destroy.bind(this));
        this._setupAccessibility();
        this._setUpDocMouseDown();
    },
    isResolving: function () {
        return this.isResolvingFlag;
    },
    destroy: function () {
        this.element = null;
        this.keyElement = null;
    },
    keyDown: function (evt) {
        var typedChar = getKeyCode(evt);
        if (typedChar == KEY_ARROWUP) {
            if (!this.selectPrevious())
                this.hideDropDown();
        } else if (typedChar == KEY_ARROWDOWN) {
            if (!this.isVisible()) {
                if (!this.isPopulated())
                    return;
                this.showDropDown();
            }
            this.selectNext();
        } else if (typedChar == KEY_TAB && !window.g_accessibility) {
            if (this.hasDropDown() && this.select())
                this.clearTimeout();
            else
                this.onBlur();
        } else if (typedChar == KEY_TAB && window.g_accessibility) {
            if (this.searchChars && this.searchChars != this.currentDisplayValue)
                this.element.value = '';
            this.clearDropDown();
        } else if (typedChar == KEY_ESC) {
            this.element.value = '';
            this.clearDropDown();
        }
    },
    keyUp: function (evt) {
        var typedChar = getKeyCode(evt);
        if (!this.isDeleteKey(typedChar))
            return;
        this.clearTimeout();
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
    },
    setSelection: function (itemNumber) {
        AJAXCompleter.prototype.setSelection.call(this, itemNumber);
        this.element.setAttribute('aria-activedescendant', this.selectedItemObj.id);
        this.setStatus(this.selectedItemObj.innerText);
        this.selectedItemObj.setAttribute('aria-selected', 'true');
    },
    _handleDeleteKey: function () {
    },
    clearTimeout: function () {
        if (this.timer != null)
            clearTimeout(this.timer);
        this.timer = null;
    },
    keyPress: function (eventArg) {
        var evt = getEvent(eventArg);
        var typedChar = getKeyCode(evt);
        if (typedChar != KEY_ENTER && typedChar != KEY_RETURN)
            this.clearTimeout();
        if (this.isNavigation(typedChar))
            return true;
        if (!evt.shiftKey && (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP))
            return false;
        if (this.isDeleteKey(typedChar))
            return true;
        if (typedChar == KEY_ENTER || typedChar == KEY_RETURN) {
            if (this.hasDropDown() && this.select())
                this.clearTimeout();
            else
                this.onBlur();
            if (this.enterSubmits) {
                this.element.setValue(trim(this.element.getValue()));
                return true;
            }
            return false;
        }
        if (typedChar == this.KEY_ESC) {
            this.clearDropDown();
            return false;
        }
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
        return true;
    },
    isNavigation: function (typedChar) {
        if (typedChar == this.KEY_TAB)
            return true;
        if (typedChar == this.KEY_LEFT)
            return true;
        if (typedChar == this.KEY_RIGHT)
            return true;
    },
    isDeleteKey: function (typedChar) {
        if (typedChar == this.KEY_BACKSPACE || typedChar == this.KEY_DELETE)
            return true;
    },
    _getSearchChars: function () {
        if (this._checkDoubleByteEncodedCharacter(this.getDisplayValue()))
            return this._translateDoubleByteIntoSingleByte(this.getDisplayValue());
        else
            return this.getDisplayValue();
    },
    _checkDoubleByteEncodedCharacter: function (s) {
        if (typeof s === 'undefined' || s.length === 0)
            return false;
        var char = s.charCodeAt(0);
        return char === 12288 || (65280 < char && char < 65375);
    },
    _translateDoubleByteIntoSingleByte: function (s) {
        var str = '';
        for (var i = 0, l = s.length, char; i < l; i++) {
            char = s.charCodeAt(i);
            if (char == 12288)
                str += String.fromCharCode(32);
            else if (65280 < char && char < 65375)
                str += String.fromCharCode(char - 65248);
            else
                str += s[i];
        }
        return str;
    },
    ajaxRequest: function () {
        var s = this._getSearchChars();
        if (s.length == 0 && !this.isDoctype()) {
            this.clearDropDown();
            this.searchChars = null;
            return;
        }
        if (s == "*")
            return;
        this.searchChars = s;
        var xml = this.cacheGet(s);
        if (xml) {
            this.processXML(xml);
            return;
        }
        if (this.cacheEmpty()) {
            this.clearDropDown();
            this.hideDropDown();
            return;
        }
        var url = "";
        url += this.addSysParms();
        url += this.addDependentValue();
        url += this.addRefQualValues();
        url += this.addTargetTable();
        url += this.addAdditionalValues();
        url += this.addAttributes("ac_");
        this.callAjax(url);
    },
    callAjax: function (url) {
        this.isResolvingFlag = true;
        var ga = new GlideAjax(this.PROCESSOR);
        ga.setQueryString(url);
        ga.setErrorCallback(this.errorResponse.bind(this));
        ga.getXML(this.ajaxResponse.bind(this), null, null);
    },
    ajaxResponse: function (response) {
        if (!response.responseXML || !response.responseXML.documentElement) {
            this.isResolvingFlag = false;
            return;
        }
        var xml = response.responseXML;
        var e = xml.documentElement;
        var timer = e.getAttribute("sysparm_timer");
        if (timer != this.timer)
            return;
        this.timer = null;
        this.clearDropDown();
        this.cachePut(this.searchChars, xml);
        this.processXML(xml);
        this.isResolvingFlag = false;
        if (this.onResolveCallback)
            this.onResolveCallback();
    },
    errorResponse: function () {
        this.isResolvingFlag = false;
    },
    processXML: function (xml) {
        var e = xml.documentElement;
        this._processDoc(e);
        var values = this._processItems(xml);
        var recents = this._processRecents(xml);
        if (!this.hasFocus) {
            this._processBlurValue(values, recents);
            return;
        }
        this.createDropDown(values, recents);
    },
    _processItems: function (xml) {
        var items = xml.getElementsByTagName("item");
        var values = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var array = this.copyAttributes(item);
            array['XML'] = item;
            values[values.length] = array;
        }
        return values;
    },
    _processRecents: function (xml) {
        var recents = [];
        var items = xml.getElementsByTagName("recent");
        for (var i = 0; i < items.length; i++) {
            var rec = this.copyAttributes(items[i]);
            rec.XML = items[i];
            recents.push(rec);
        }
        return recents;
    },
    _processBlurValue: function (values, recents) {
        this.ignoreFocusEvent = false;
        values = values || [];
        recents = recents || [];
        if (values.length + recents.length === 0 && this.searchChars.length > 0) {
            this.setInvalid();
            return;
        }
        if (!this.oneMatchSelects || this.getDisplayValue() === '')
            return;
        var targetLabel, targetValue;
        if (values.length + recents.length == 1) {
            var target = recents.length == 1 ? recents[0] : values[0];
            targetLabel = target.label;
            targetValue = target.name;
        }
        if (recents[0] && recents[0].label == this.getDisplayValue()) {
            var matchesRecent = recents[1] && recents[0].label == recents[1].label;
            var matchesValue = values[0] && recents[0].label == values[0].label;
            if (!matchesRecent && !matchesValue) {
                targetLabel = recents[0].label;
                targetValue = recents[0].name;
            }
        } else if (values[0] && values[0].label == this.getDisplayValue()) {
            var matchesSecondValue = values[1] && values[0].label == values[1].label;
            if (!matchesSecondValue) {
                targetLabel = values[0].label;
                targetValue = values[0].name;
            }
        }
        if (targetLabel)
            this.referenceSelect(targetValue, targetLabel);
    },
    _processDoc: function (doc) {
        this.rowCount = doc.getAttribute('row_count');
        this.max = doc.getAttribute('sysparm_max');
    },
    addSysParms: function () {
        var name = this.elementName;
        if (this.elementName.indexOf('IO:') > -1)
            name = this.elementName.substring(this.elementName.indexOf("IO:"), this.elementName.length);
        var sp = "sysparm_name=" + name +
            "&sysparm_timer=" + this.timer +
            "&sysparm_max=" + this.max +
            "&sysparm_chars=" + encodeText(this.searchChars);
        if (this.guid)
            sp += "&sysparm_completer_id=" + this.guid;
        if (this.ignoreRefQual)
            sp += "&sysparm_ignore_ref_qual=true";
        else if (this.refQual != "" && typeof this.refQual != "undefined")
            sp += "&sysparm_ref_qual=" + this.refQual;
        var domain = gel("sysparm_domain");
        if (domain)
            sp += "&sysparm_domain=" + domain.value;
        return sp;
    },
    addTargetTable: function () {
        var answer = "";
        if (this.getTargetTable()) {
            answer = "&sysparm_reference_target=" + this.getTargetTable();
        }
        return answer;
    },
    addAdditionalValues: function () {
        var answer = "";
        for (var n in this.additionalValues)
            answer += "&" + n + "=" + encodeText(this.additionalValues[n]);
        return answer;
    },
    addAttributes: function (prefix) {
        var answer = "";
        var attributes = this.element.attributes;
        for (var n = 0; n < attributes.length; n++) {
            var attr = attributes[n];
            var name = attr.nodeName;
            if (name.indexOf(prefix) != 0)
                continue;
            var v = attr.nodeValue;
            answer += "&" + name + "=" + v;
        }
        return answer;
    },
    copyAttributes: function (node) {
        var attributes = new Array();
        for (var n = 0; n < node.attributes.length; n++) {
            var attr = node.attributes[n];
            var name = attr.nodeName;
            var v = attr.nodeValue;
            attributes[name] = v;
        }
        return attributes;
    },
    createDropDown: function (foundStrings, foundRecents) {
        this.clearDropDown();
        this.createInnerDropDown();
        if (foundRecents && foundRecents.length > 0) {
            this._showRecents();
            for (var i = 0; i < foundRecents.length; i++) {
                var rec = foundRecents[i];
                var recchild = this.createChild(rec);
                recchild.acItem = rec;
                this.appendItem(recchild);
                this.addMouseListeners(recchild);
            }
        }
        if (foundStrings && foundStrings.length > 0) {
            this._showMax(foundStrings, foundRecents);
            for (var c = 0; c < foundStrings.length; c++) {
                if (this.max > 0 && c >= this.max)
                    break;
                var x = foundStrings[c];
                var child = this.createChild(x);
                child.acItem = x;
                this.appendItem(child);
                this.addMouseListeners(child);
            }
        }
        if (this.currentMenuCount) {
            this.setDropDownSize();
            this.showDropDown();
            if (isTextDirectionRTL()) {
                var diff = parseInt(this.dropDown.style.width) - this.getWidth();
                if (diff < 0)
                    diff = 0;
                var w = 0;
                if (isMSIE8 || isMSIE7 || isMSIE6 || (isMSIE9 && (getPreference('glide.ui11.use') == "false"))) {
                    if (typeof g_form != "undefined")
                        w = this.element.offsetParent ? this.element.offsetParent.clientWidth : 0;
                }
                this.dropDown.style.left = (parseInt(this.dropDown.style.left) - diff) + w + "px";
                this.iFrame.style.left = (parseInt(this.iFrame.style.left) - diff) + w + "px";
                if (parseInt(this.dropDown.style.left) < 0) {
                    this.dropDown.style.left = 0 + "px";
                    this.iFrame.style.left = 0 + "px";
                }
            }
            var height = this.dropDown.clientHeight;
            this.setHeight(height);
            this.firefoxBump();
            var msg = '{0} suggestions. Please use the up and down arrow keys to select a value';
            if (this.currentMenuCount == 1)
                msg = '1 suggestion. Please use the up and down arrow keys to select a value';
            var messageAPI = new GwtMessage();
            messageAPI.fetch([msg], function (msgs) {
                var msgWithValues = messageAPI.format(msgs[msg], this.currentMenuCount);
                this.setStatus(msgWithValues);
            }.bind(this))
        }
        this._setActive();
        _frameChanged();
    },
    createInnerDropDown: function () {
    },
    _showRecents: function () {
        this._addHeaderRow("Recent selections");
    },
    _showMax: function (foundStrings, foundRecents) {
        if (foundRecents && foundRecents.length > 0)
            this._addHeaderRow("Search");
    },
    _addHeaderRow: function (message) {
        var row = cel("div");
        row.className = "ac_header";
        row.setAttribute("width", "100%");
        row.innerHTML = new GwtMessage().getMessage(message);
        this.appendElement(row);
    },
    select: function () {
        if (this.selectedItemNum < 0)
            return false;
        var o = this.getSelectedObject().acItem;
        this.referenceSelect(o['name'], o['label']);
        this.clearDropDown();
        return true;
    },
    _setDisplayValue: function (v) {
        var e = this.getDisplayElement();
        if (e.value == v)
            return;
        e.value = v;
    },
    referenceSelectTimeout: function (sys_id, displayValue) {
        this.selectedID = sys_id;
        this.selectedDisplayValue = displayValue;
        if (typeof reflistModalPick == "function")
            this._referenceSelectTimeout();
        else
            setTimeout(this._referenceSelectTimeout.bind(this), 0);
    },
    _referenceSelectTimeout: function () {
        this.referenceSelect(this.selectedID, this.selectedDisplayValue);
    },
    referenceSelect: function (sys_id, displayValue, referenceInvalid) {
        this._setDisplayValue(displayValue);
        var e = this.getKeyElement();
        if (e.value != sys_id) {
            e.value = sys_id;
            callOnChange(e);
        }
        this.searchChars = displayValue;
        this.currentDisplayValue = displayValue;
        this.showViewImage();
        if (!referenceInvalid)
            this.clearInvalid();
        this._clearDerivedFields();
        if (this.selectionCallBack && sys_id) {
            eval(this.selectionCallBack);
        }
        if (e["filterCallBack"]) {
            e.filterCallBack();
        }
    },
    setFilterCallBack: function (f) {
        var e = this.getKeyElement();
        e["filterCallBack"] = f
    },
    _clearDerivedFields: function () {
        if (this.clearDerivedFields && window['DerivedFields']) {
            var df = new DerivedFields(this.keyElement.id);
            df.clearRelated();
            df.updateRelated(this.getKeyValue());
        }
    },
    showViewImage: function () {
        var element = gel("view." + this.keyElement.id);
        var elementR = gel("viewr." + this.keyElement.id);
        var noElement = gel("view." + this.keyElement.id + ".no");
        var sys_id = this.getKeyValue();
        if (sys_id == "") {
            hideObject(element);
            hideObject(elementR);
            showObjectInlineBlock(noElement);
        } else {
            showObjectInlineBlock(element);
            showObjectInlineBlock(elementR);
            hideObject(noElement);
        }
    },
    createChild: function (item) {
        return this._createChild(item, item['label']);
    },
    _createChild: function (item, text) {
        var div = cel(TAG_DIV);
        div.ac = this;
        div.acItem = item;
        div.id = 'ac_option_' + item.name;
        div.setAttribute('role', 'option');
        var itemInRow = cel(TAG_SPAN, div);
        itemInRow.innerHTML = (text + '').escapeHTML();
        return div;
    },
    addMouseListeners: function (element) {
        element.onmousedown = this.onMouseDown.bind(this, element);
        element.onmouseup = this.onMouseUp.bind(this, element);
        element.onmouseover = this.onMouseOver.bind(this, element);
        element.onmouseout = this.onMouseOut.bind(this, element);
    },
    onMouseUp: function (element) {
        this.select();
    },
    onMouseDown: function (element) {
        if (g_isInternetExplorer) {
            this.select();
            window.event.cancelBubble = true;
            window.event.returnValue = false;
            setTimeout(this.focus.bind(this), 50);
        }
        return false;
    },
    onMouseOut: function (element) {
        this.unsetSelection();
    },
    onMouseOver: function (element) {
        this.setSelection(element.acItemNumber);
    },
    focus: function () {
        this.element.focus();
    },
    setDropDownSize: function () {
        var e, mLeft, mTop;
        if (window.$j) {
            e = $j(this.element);
            var offset = e.offset();
            var parent = $j(getFormContentParent());
            var parentOffset = {
                left: 0,
                top: 0
            };
            var parentIsBody = parent.get(0) == document.body;
            var parentScrolltop = (parentIsBody || parent.css('overflow') == 'visible') ? 0 : parent.scrollTop();
            if (!parentIsBody)
                parentOffset = parent.offset();
            mLeft = offset.left - parentOffset.left + 1 + 'px';
            mTop = offset.top - parentOffset.top + e.outerHeight() + parentScrolltop + 'px';
        } else {
            e = this.element;
            mLeft = grabOffsetLeft(e) + "px";
            mTop = grabOffsetTop(e) + (e.offsetHeight - 1) + "px";
        }
        var mWidth = this.getWidth();
        var dd = this.dropDown;
        if (dd.offsetWidth > parseInt(mWidth))
            mWidth = dd.offsetWidth;
        this.setTopLeft(dd.style, mTop, mLeft);
        this.setTopLeft(this.iFrame.style, mTop, mLeft);
        this.setWidth(mWidth);
    },
    setTopLeft: function (style, top, left) {
        style.left = left;
        style.top = top;
    },
    getWidth: function () {
        var field = this.element;
        if (g_isInternetExplorer)
            return field.offsetWidth - (this.menuBorderSize * 2);
        return field.clientWidth;
    },
    onFocus: function () {
        if (this.ignoreFocusEvent || this.element.getAttribute('readonly'))
            return;
        this.hasFocus = true;
        this.currentDisplayValue = this.getDisplayValue();
        this._setUpDocMouseDown();
        if (this.isDoctype() && this.currentDisplayValue == '')
            this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
    },
    isTablet: function () {
        return !(typeof isTablet == "undefined");
    },
    isDoctype: function () {
        return document.documentElement.getAttribute('data-doctype') == 'true';
    },
    _setupAccessibility: function () {
        this.element.setAttribute('role', 'combobox');
        this.element.setAttribute('aria-autocomplete', 'list');
        this.element.setAttribute('aria-owns', this.getDropDown().id);
        this.element.setAttribute('aria-activedescendant', '');
    },
    _setUpDocMouseDown: function () {
        if (this.isTablet()) {
            this.blurPause = true;
            this._boundOnDocMouseDown = this.onDocMouseDown.bind(this);
            Event.observe(document.body, 'mousedown', this._boundOnDocMouseDown);
        }
    },
    setStatus: function (text) {
        var statusEl = this._getStatusEl();
        if (!statusEl)
            return;
        statusEl.innerText = text;
    },
    _getStatusEl: function () {
        return document.getElementById('ac.status');
    },
    onDocMouseDown: function (evt) {
        if (evt.target == this.element)
            return;
        this.blurPause = false;
    },
    onBlurEvent: function (evt) {
        if (this.element.getAttribute('readonly'))
            return;
        if (this.isTablet() && this.blurPause == true)
            setTimeout(this.onBlur.bind(this), 4000);
        else
            this.onBlur();
    },
    onBlur: function () {
        if (this._boundOnDocMousedown) {
            Event.stopObserving(document.body, 'mousedown', this._boundOnDocMouseDown);
            delete this._boundOnDocMouseDown;
        }
        this.hasFocus = false;
        if (this.getDisplayValue().length == 0) {
            if (this.currentDisplayValue != "") {
                if (!this.isList) {
                    this.referenceSelect("", "");
                } else {
                    this.clearInvalid();
                }
            } else {
                this.clearInvalid();
            }
        } else if (this.selectedItemNum > -1) {
            this.select();
        } else if ((this.getKeyValue() == "") || (this.currentDisplayValue != this.getDisplayValue())) {
            if (!this.isFilterUsingContains) {
                var refInvalid = true;
                if (this.isExactMatch()) {
                    if (this.oneMatchSelects != false) {
                        var o = this.getObject(0).acItem;
                        this.referenceSelect(o['name'], o['label']);
                        refInvalid = false;
                    }
                }
                if (refInvalid)
                    this.setInvalid();
                if (refInvalid || !this.isPopulated()) {
                    this.clearTimeout();
                    this.searchChars = null;
                    this.ignoreFocusEvent = true;
                    this.timer = setTimeout(this.ajaxRequest.bind(this), 0);
                }
            }
        }
        this.clearDropDown();
    },
    isExactMatch: function () {
        if (this.isPopulated()) {
            if (this.getMenuCount() == 1) {
                var o0 = this.getObject(0).acItem;
                if ((o0['label'].toUpperCase().startsWith(this.getDisplayValue().toUpperCase())))
                    return true;
                return false;
            }
            var o0 = this.getObject(0).acItem;
            var o1 = this.getObject(1).acItem;
            if ((o0['label'] == this.getDisplayValue()) && (o1['label'] != this.getDisplayValue()))
                return true;
        }
    },
    getDisplayValue: function () {
        return this.getDisplayElement().value;
    },
    getKeyValue: function () {
        return this.getKeyElement().value;
    },
    clearKeyValue: function () {
        this.referenceSelect("", this.getDisplayValue());
    },
    getKeyElement: function () {
        return this.keyElement;
    },
    getDisplayElement: function () {
        return this.element;
    },
    setResolveCallback: function (f) {
        this.onResolveCallback = f;
    },
    setDependent: function (dependentReference) {
        this.dependentReference = dependentReference;
        var el = this.getDependentElement();
        if (!el)
            return;
        var n = dependentReference.replace(/\./, "_");
        n = this.getTableName() + "_" + n;
        var h = new GlideEventHandler('onChange_' + n, this.onDependentChange.bind(this), dependentReference);
        g_event_handlers.push(h);
    },
    onDependentChange: function () {
        this.cacheClear();
    },
    getDependentElement: function () {
        if (!this.dependentReference || 'null' == this.dependentReference)
            return null;
        var table = this.getTableName();
        var dparts = this.dependentReference.split(",");
        return gel(table + "." + dparts[0]);
    },
    addDependentValue: function () {
        var el = this.getDependentElement();
        if (!el)
            return "";
        var depValue = "";
        if (el.tagName == "INPUT")
            depValue = el.value;
        else
            depValue = el.options[el.selectedIndex].value;
        return "&sysparm_value=" + depValue;
    },
    setRefQualElements: function (elements) {
        this.simpleQualifier = false;
        if (!elements)
            this.refQualElements = null;
        else {
            if (elements.startsWith("QUERY:")) {
                this.setRefQual(elements.substring(6));
                this.simpleQualifier = true;
                return;
            }
            var tableDot = g_form.getTableName() + '.';
            this.refQualElements = [];
            var a = elements.split(';');
            if (a == "*") {
                a = [];
                var form = gel(tableDot + 'do');
                var elements = Form.getElements(form);
                for (var i = 0; i < elements.length; i++) {
                    if ((elements[i].id != this.keyElement.id) && (elements[i].id.startsWith(tableDot)))
                        a.push(elements[i].id);
                }
            }
            for (var i = 0; i < a.length; i++) {
                var n = a[i];
                var el = gel(n);
                if (!el)
                    continue;
                this.refQualElements.push(n);
                var h = new GlideEventHandler('onChange_' + n.replace(/\./, "_"), this.onDependentChange.bind(this), a[i]);
                g_event_handlers.push(h);
            }
        }
    },
    setRefQual: function (refQual) {
        this.refQual = refQual;
    },
    setIgnoreRefQual: function (ignoreRefQual) {
        this.ignoreRefQual = ignoreRefQual;
    },
    addRefQualValues: function () {
        if (this.refQualElements) {
            return "&" + g_form.serializeChanged();
        } else
            return "";
    },
    setAdditionalValue: function (name, value) {
        this.additionalValues[name] = value;
    },
    getTableName: function () {
        return this.elementName.split('.')[0];
    },
    setInvalid: function () {
        this.messages = new GwtMessage().getMessages(
            ["A new record with this value will be created automatically", "Invalid reference"]);
        this.referenceValid = false;
        var message;
        if (this.dynamicCreate) {
            message = this.messages["A new record with this value will be created automatically"];
            this.getDisplayElement().title = message;
            addClassName(this.getDisplayElement(), "ref_dynamic");
        } else {
            message = this.messages["Invalid reference"];
            this.getDisplayElement().title = message;
            addClassName(this.getDisplayElement(), "ref_invalid");
        }
        if (typeof g_form != "undefined") {
            var fieldName = this.elementName.substring(this.elementName.indexOf('.') + 1);
            var dynamicCreate = this.dynamicCreate;
            if (g_form.getGlideUIElement) {
                var el = g_form.getGlideUIElement(this.elementName);
                if (el)
                    el.isInvalid = true;
            }
            setTimeout(function () {
                g_form.hideFieldMsg(fieldName, false, 'invalid_reference');
                g_form.showFieldMsg(fieldName, message, dynamicCreate ? 'info' : 'error', null, 'invalid_reference');
            });
        }
        if (!this.allowInvalid && !this.isList) {
            this.getKeyElement().value = "";
        }
        this.showViewImage();
        var displayElement = this.getDisplayElement();
        if (displayElement) {
            displayElement.setAttribute('aria-invalid', 'true');
        }
        var e = this.getKeyElement();
        callOnChange(e);
    },
    clearInvalid: function () {
        this.referenceValid = true;
        if (this.dynamicCreate) {
            removeClassName(this.getDisplayElement(), "ref_dynamic");
        } else {
            removeClassName(this.getDisplayElement(), "ref_invalid");
        }
        this.getDisplayElement().title = "";
        if (typeof g_form != "undefined") {
            if (g_form.getGlideUIElement) {
                var el = g_form.getGlideUIElement(this.elementName);
                if (el)
                    el.isInvalid = false;
            }
        }
        var fieldName = this.elementName.substring(this.elementName.indexOf('.') + 1);
        if (typeof g_form != "undefined" && fieldName) {
            g_form.hideFieldMsg(fieldName, false, 'invalid_reference');
        }
        var displayElement = this.getDisplayElement();
        if (displayElement && typeof g_form !== 'undefined') {
            var isEmpty = !this.element.present();
            if (this.isList) {
                isEmpty = this.getKeyValue() === '';
            }
            if (g_form.isMandatory(fieldName) && g_form.submitAttemptsCount > 0 && isEmpty) {
                displayElement.setAttribute('aria-invalid', 'true');
            }
            else {
                displayElement.setAttribute('aria-invalid', 'false');
            }
        }
    },
    isReferenceValid: function () {
        return this.referenceValid;
    },
    firefoxBump: function () {
        var children = this.getMenuItems();
        for (var i = 0; i < children.length; i++) {
            if (children[i] && children[i].firstChild) {
                var dparentDivWidth = children[i].offsetWidth;
                var dchildSpanWidth = children[i].firstChild.offsetWidth;
                if (dchildSpanWidth > dparentDivWidth)
                    this.setWidth(dchildSpanWidth);
            }
        }
    },
    _setIframeHeight: function (height) {
        this.iFrame.style.height = height - 2;
    },
    hasDropDown: function () {
        if (!this.dropDown)
            return false;
        return this.dropDown.childNodes.length > 0;
    },
    cachePut: function (name, value) {
        if (this.refQualElements)
            return;
        this.cache[name] = value;
    },
    cacheGet: function (name) {
        if (this.refQualElements)
            return;
        return this.cache[name];
    },
    cacheClear: function () {
        this.cache = new Object();
    },
    cacheEmpty: function () {
        var s = this.searchChars;
        if (!s)
            return false;
        while (s.length > 2) {
            s = s.substring(0, s.length - 1);
            var xml = this.cacheGet(s);
            if (!xml)
                continue;
            var e = xml.documentElement;
            var rowCount = e.getAttribute('row_count');
            if (rowCount == 0 && e.childElementCount == 0)
                return true;
            break;
        }
        return false;
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleterMulti.js */
var AJAXReferenceCompleterMulti = Class.create(AJAXReferenceCompleter, {
    _hash: new Hash(),
    _SEPARATOR: ',',
    _handleDeleteKey: function () {
        this._rebuildFromInput();
    },
    _rebuildFromInput: function () {
        var s = this.getDisplayElement().value;
        var arr = s.split(this._SEPARATOR);
        var _hashNew = new Hash();
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].strip();
            if (this._hash.keys().indexOf(a) != -1)
                _hashNew.set(a, this._hash.get(a).escapeHTML());
            else {
                if (this.allowInvalid)
                    _hashNew.set(a, a.escapeHTML());
            }
        }
        this._hash = _hashNew;
        this._setFormValues();
    },
    _arrayToString: function (array, useSpacer) {
        var s = '';
        for (var i = 0; i < array.length; i++) {
            var a = array[i].strip();
            if (a.length == 0)
                continue;
            if (i > 0) {
                s += this._SEPARATOR;
                if (useSpacer)
                    s += " ";
            }
            s += a;
        }
        return s;
    },
    _setFormValues: function () {
        this.getDisplayElement().value = this.getDisplayValue();
        this.getKeyElement().value = this.getKeyValue();
        if (this.element.getAttribute("reference") == "sys_user") {
            var invalidContacts = false;
            var keyContacts = this.getKeyElement().value.split(",");
            var displayContacts = this.getDisplayElement().value.split(",");
            var matchedRef = false;
            if (!this.isBlur && this.currentDisplayValue) {
                keyContacts.splice((keyContacts.length - 1), 1);
                displayContacts.splice((keyContacts.length - 1), 1);
                this.getKeyElement().value = keyContacts;
                this.getDisplayElement().value = displayContacts;
                matchedRef = true;
            }
            for (i = 0; i < keyContacts.length; i++) {
                if (!matchedRef && keyContacts[i] != "" && !isEmailValid(keyContacts[i])) {
                    var hexSysId = /^[0-9A-F]{32}$/i.test(keyContacts[i]);
                    if (!hexSysId) {
                        keyContacts.splice(i, 1);
                        displayContacts.splice(i, 1);
                        this.getKeyElement().value = keyContacts;
                        this.getDisplayElement().value = displayContacts;
                        g_form.hideFieldMsg(this.element.parentNode, true);
                        g_form.showFieldMsg(this.element.parentNode, "Please enter a valid email address or User", "error");
                        invalidContacts = true;
                        this.isBlur = false;
                        this.onFocus();
                    }
                }
            }
            if (!invalidContacts) {
                g_form.hideFieldMsg(this.element.parentNode, true);
            }
        }
    },
    getDisplayValue: function () {
        return this._arrayToString(this._hash.keys(), true);
    },
    getKeyValue: function () {
        return this._arrayToString(this._hash.values(), false);
    },
    referenceSelect: function (sys_id, displayValue) {
        this._rebuildFromInput();
        this._hash.set(displayValue.strip(), sys_id.escapeHTML());
        this._setFormValues();
        this.showViewImage();
        this.clearInvalid();
        this._clearDerivedFields();
        if (this.selectionCallBack && sys_id) {
            eval(this.selectionCallBack);
        }
    },
    _getSearchChars: function () {
        var s = this.getDisplayElement().value;
        var sep_pos = s.lastIndexOf(this._SEPARATOR);
        if (sep_pos > 0) {
            s = s.substr(sep_pos + 1);
        }
        this.searchChars = s.replace(/^\s+|\s+$/g, '');
        return this.searchChars;
    },
    setDropDownSize: function () {
        var e = this.element;
        var mLeft = grabOffsetLeft(e) + (this.getDisplayElement().value.length * 5) + "px";
        var mTop = grabOffsetTop(e) + (e.offsetHeight - 1) + "px";
        var mWidth = this.getWidth();
        this.log("width:" + mWidth);
        var dd = this.dropDown;
        if (dd.offsetWidth > parseInt(mWidth)) {
            mWidth = dd.offsetWidth;
            this.log("width:" + mWidth);
        }
        this.setTopLeft(dd.style, mTop, mLeft);
        this.setTopLeft(this.iFrame.style, mTop, mLeft);
        this.setWidth(mWidth);
    },
    onBlur: function () {
        this.isBlur = true;
        this.log("blur event");
        this.hasFocus = false;
        this._rebuildFromInput();
        this.clearDropDown();
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXTableCompleter.js */
var AJAXTableCompleter = Class.create(AJAXReferenceCompleter, {
    _processDoc: function (doc) {
        AJAXReferenceCompleter.prototype._processDoc.call(this, doc);
        this.showDisplayValue = doc.getAttribute('show_display_value');
        this.queryType = doc.getAttribute('query_type');
        this.queryText = doc.getAttribute('sysparm_chars');
        this.columnsSearch = doc.getAttribute('columns_search');
    },
    appendElement: function (element) {
        this.tbody.appendChild(element);
    },
    createInnerDropDown: function () {
        if (this.dropDown.childNodes.length > 0)
            return;
        this._createTable();
    },
    createChild: function (item) {
        if (this.currentMenuCount == 0) {
            this.createInnerDropDown();
        }
        var tr = cel("tr");
        if (this.showDisplayValue != "false") {
            var displayValue = item['label'];
            this._createTD(tr, displayValue);
        }
        this._addColumns(tr, item);
        tr.id = 'ac_option_' + item.name;
        tr.setAttribute('role', 'option');
        return tr;
    },
    onDisplayDropDown: function () {
        var width = this.table.offsetWidth + 2;
        var height = this.table.offsetHeight + 2;
        this.getDropDown().style.width = width + "px";
        if (!g_isInternetExplorer) {
            width = width - 4;
            height = height - 4;
        }
        this.getIFrame().style.width = width + "px";
        this.getIFrame().style.height = height + "px";
    },
    _addColumns: function (tr, item) {
        var xml = item["XML"];
        var fields = xml.getElementsByTagName("field");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var value = field.getAttribute("value");
            var td = $(this._createTD(tr, value));
            if (this.prevText[i] == value)
                td.addClassName("ac_additional_repeat");
            else
                this.prevText[i] = value;
            td.addClassName("ac_additional");
        }
    },
    _showMax: function (foundStrings, foundRecents) {
        if (!this.rowCount)
            return;
        var max = 1 * this.max;
        var showing = Math.min(foundStrings.length, max);
        var recentsLength = foundRecents ? foundRecents.length : 0;
        var total = this.rowCount - recentsLength;
        var tr = cel("tr");
        $(tr).addClassName("ac_header");
        var td = cel("td", tr);
        td.setAttribute("colSpan", 99);
        td.setAttribute("width", "100%");
        var a = cel("a", td);
        a.onmousedown = this._showAll.bindAsEventListener(this);
        var x = "";
        if (this.rowCount >= 250)
            x = " more than ";
        a.innerHTML = new GwtMessage().getMessage("Showing 1 through {0} of {1}", showing, x + total);
        this.appendElement(tr);
    },
    _showRecents: function () {
        var tr = cel("tr");
        tr.className = "ac_header";
        var td = cel("td", tr);
        td.setAttribute('colspan', 99);
        td.setAttribute("width", "100%");
        td.innerHTML = new GwtMessage().getMessage("Recent selections");
        this.appendElement(tr);
    },
    _showAll: function () {
        this.clearTimeout();
        this.max = this.rowCount;
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_key_delay);
    },
    _createTD: function (tr, text) {
        var td = cel("td", tr);
        $(td).addClassName("ac_cell");
        td.innerHTML = text.escapeHTML();
        return td;
    },
    _createTable: function () {
        this.table = cel("table");
        $(this.table).addClassName("ac_table_completer");
        this.tbody = cel("tbody", this.table);
        this.dropDown.appendChild(this.table);
        this.prevText = new Object();
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXEmailClientCompleter.js */
var g_key_delay = 250;
var AJAXEmailClientCompleter = Class.create(AJAXTableCompleter, {
    PROCESSOR: "EmailClient",
    initialize: function (element, reference, dependentReference, refQualElements, targetTable, inputSpan, options) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        options = options || {};
        this.className = "AJAXEmailClientCompleter";
        this.inputSpan = inputSpan;
        this.element = $(element);
        this.keyElement = gel(reference);
        this.setTargetTable(targetTable);
        this.additionalValues = {};
        this.renderItemTemplate = null;
        if (options.renderItemTemplate) {
            this.renderItemTemplate = options.renderItemTemplate;
        }
        this._commonSetup();
        this.oneMatchSelects = true;
        this.clearDerivedFields = true;
        this.allowInvalid = this.element.readAttribute('allow_invalid') == 'true';
    },
    _processDoc: function (doc) {
        AJAXTableCompleter._processDoc(doc);
    },
    keyDown: function (evt) {
        var typedChar = getKeyCode(evt);
        if (typedChar == KEY_ARROWUP) {
            if (!this.selectPrevious())
                this.hideDropDown();
        } else if (typedChar == KEY_ARROWDOWN) {
            if (!this.isVisible()) {
                if (!this.isPopulated())
                    return;
                this.showDropDown();
            }
            this.selectNext();
        }
    },
    keyUp: function (evt) {
        var typedChar = getKeyCode(evt);
        if (!this.isDeleteKey(typedChar))
            return;
        this.clearTimeout();
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
    },
    clearTimeout: function () {
        if (this.timer != null)
            clearTimeout(this.timer);
        this.timer = null;
    },
    keyPress: function (evtArg) {
        var evt = getEvent(evtArg);
        var typedChar = getKeyCode(evt);
        if (typedChar != KEY_ENTER && typedChar != KEY_RETURN)
            this.clearTimeout();
        if (this.isNavigation(typedChar))
            return true;
        if (!evt.shiftKey && (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP))
            return false;
        if (this.isDeleteKey(typedChar))
            return true;
        if (typedChar == KEY_ENTER || typedChar == KEY_RETURN || typedChar == KEY_TAB) {
            if (this.hasDropDown() && this.select())
                this.clearTimeout();
            else
                this.onBlur();
            return false;
        }
        if (typedChar == this.KEY_ESC) {
            this.clearDropDown();
            return false;
        }
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_key_delay);
        return true;
    },
    isNavigation: function (typedChar) {
        if (typedChar == this.KEY_LEFT)
            return true;
        if (typedChar == this.KEY_RIGHT)
            return true;
        if (typedChar == KEY_TAB && this.currentDisplayValue == "")
            return true;
    },
    ajaxRequest: function () {
        var s = this.getDisplayValue();
        if (s.length == 0) {
            this.log("ajaxRequest returned no results");
            this.clearDropDown();
            this.searchChars = null;
            return;
        }
        if (s == "*")
            return;
        if (s == this.searchChars) {
            this.log("navigator key pressed");
            return;
        }
        this.searchChars = s;
        this.clearKeyValue();
        this.log("searching for characters '" + this.searchChars + "'");
        var xml = this.cacheGet(s);
        if (xml) {
            this.log("cached results found");
            this.processXML(xml);
            return;
        }
        if (this.cacheEmpty()) {
            this.log("cache is empty");
            this.clearDropDown();
            this.hideDropDown();
            return;
        }
        var url = "";
        url += this.addSysParms();
        url += this.addTargetTable();
        url += this.addAdditionalValues();
        url += this.addAttributes("ac_");
        this.callAjax(url);
    },
    processXML: function (xml) {
        this.log("processing XML results");
        var e = xml.documentElement;
        this.rowCount = e.getAttribute('row_count');
        this.max = e.getAttribute('sysparm_max');
        var items = xml.getElementsByTagName("item");
        values = new Array();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var array = this.copyAttributes(item);
            array['XML'] = item;
            values[values.length] = array;
        }
        if (!this.hasFocus) {
            this.log("checking value without focus");
            this.ignoreFocusEvent = false;
            if ((values.length == 1) ||
                ((values.length > 1)
                    && (values[0]['label'] == this.getDisplayValue())
                    && (values[1]['label'] != this.getDisplayValue()))) {
                this.log("setting value without focus to " + values[0]['label'] + "->" + values[0]['name']);
                var name = htmlEscape(values[0]['name']);
                var label = htmlEscape(values[0]['label']);
                this.referenceSelect(name, label);
                var s = gel(this.inputSpan);
                if (this.renderItemTemplate) {
                    s.innerHTML = s.innerHTML + this.renderItemTemplate(name, label);
                } else {
                    s.innerHTML = s.innerHTML + '<span class="address" tabindex="-1" onclick="addressOnClick(event, this)" style="white-space:nowrap;" value="' + name + '" aria-label="' + name + '">' + label + ';</span> ';
                }
                this._clearDisplayValue();
                this.currentDisplayValue = "";
            } else {
                if (e.getAttribute('allow_invalid') != 'true')
                    this.setInvalid();
            }
            return;
        }
        this.createDropDown(values);
    },
    addTargetTable: function () {
        var answer = "";
        if (this.getTargetTable()) {
            answer = "&sysparm_reference_target=" + this.getTargetTable();
        }
        return answer;
    },
    select: function () {
        if (this.selectedItemNum < 0)
            return false;
        var o = this.getSelectedObject().acItem;
        var name = htmlEscape(o['name']);
        var label = htmlEscape(o['label']);
        this.referenceSelect(name, label);
        var s = gel(this.inputSpan);
        if (this.renderItemTemplate) {
            s.innerHTML = s.innerHTML + this.renderItemTemplate(name, label);
        } else {
            s.innerHTML = s.innerHTML + '<span class="address" tabindex="-1" onclick="addressOnClick(event, this)" style="white-space:nowrap;" value="' + name + '" aria-label="' + label + '">' + label + ';</span> ';
        }
        this.clearDropDown();
        this._clearDisplayValue();
        this.currentDisplayValue = "";
        return true;
    },
    _clearDisplayValue: function (v) {
        var e = this.getDisplayElement();
        e.value = "";
    },
    referenceSelect: function (sys_id, displayValue) {
        this.log("referenceSelect called with a display value of " + displayValue);
        this._setDisplayValue(displayValue);
        var e = this.getKeyElement();
        if (e.value != sys_id) {
            e.value = sys_id;
            callOnChange(e);
        }
        this.searchChars = displayValue;
        this.currentDisplayValue = displayValue;
        this.clearInvalid();
        if (this.selectionCallBack && sys_id) {
            eval(this.selectionCallBack);
        }
    },
    onBlur: function () {
        this.log("blur event");
        this.hasFocus = false;
        if (this.getDisplayValue().length == 0) {
            if (this.currentDisplayValue != "")
                this.referenceSelect("", "");
        } else if (this.selectedItemNum > -1) {
            this.select();
        } else if ((this.getKeyValue() == "") || (this.currentDisplayValue != this.getDisplayValue())) {
            var refInvalid = true;
            if (this.isExactMatch()) {
                var o = this.getObject(0).acItem;
                this.referenceSelect(htmlEscape(o['name']), htmlEscape(o['label']));
                refInvalid = false;
            }
            if (refInvalid)
                this.setInvalid();
            if (refInvalid || !this.isPopulated()) {
                this.log("onBlur with no menu items requesting the reference for " + this.getDisplayValue());
                this.clearTimeout();
                this.searchChars = null;
                this.ignoreFocusEvent = true;
                this.timer = setTimeout(this.ajaxRequest.bind(this), 0);
            }
        }
        this.clearDropDown();
    },
    isExactMatch: function () {
        if (this.isPopulated()) {
            if (this.getMenuCount() == 1) {
                var o0 = this.getObject(0).acItem;
                if ((o0['label'] == this.getDisplayValue()))
                    return true;
                return false;
            }
            var o0 = this.getObject(0).acItem;
            var o1 = this.getObject(1).acItem;
            if ((o0['label'] == this.getDisplayValue()) && (o1['label'] != this.getDisplayValue()))
                return true;
        }
    },
    cachePut: function (name, value) {
        this.cache[name] = value;
    },
    cacheGet: function (name) {
        return this.cache[name];
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceChoice.js */
var AJAXReferenceChoice = Class.create(AJAXReferenceCompleter, {
    addSysParms: function () {
        var sp = "sysparm_processor=PickList" +
            "&sysparm_name=" + this.elementName +
            "&sysparm_timer=" + this.timer +
            "&sysparm_max=" + this.max +
            "&sysparm_chars=" + encodeText(this.searchChars);
        return sp;
    },
    ajaxRequest: function () {
        var url = "";
        url += this.addSysParms();
        url += this.addDependentValue();
        url += this.addRefQualValues();
        url += this.addTargetTable();
        url += this.addAdditionalValues();
        url += this.addAttributes("ac_");
        url += "&sysparm_max=250";
        serverRequestPost("xmlhttp.do", url, this.ajaxResponse.bind(this));
    },
    onBlur: function () { },
    onFocus: function () { },
    ajaxResponse: function (response) {
        if (!response.responseXML.documentElement) {
            this.isResolvingFlag = false;
            return;
        }
        var currentValue = this.element.value;
        this.element.options.length = 0;
        var items = response.responseXML.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var id = item.getAttribute('value');
            var l = item.getAttribute('name');
            var selected = id == currentValue;
            addOption(this.element, id, l, selected);
        }
    }
});
;
/*! RESOURCE: /scripts/classes/ajax/DerivedFields.js */
var DerivedFields = Class.create({
    initialize: function (elementName) {
        this.elementName = elementName;
    },
    clearRelated: function () {
        if (typeof (g_form) == 'undefined')
            return;
        var list = g_form.getDerivedFields(this.elementName);
        if (list == null)
            return;
        var prefix = this.elementName.split(".");
        prefix.shift();
        prefix = prefix.join(".");
        for (var i = 0; i < list.length; i++) {
            var elname = prefix + "." + list[i];
            if (!g_form.isDisabled(elname)) {
                g_form._addDerivedWaiting(elname);
                g_form.setReadOnly(elname, true);
            }
            g_form.clearValue(elname);
        }
    },
    updateRelated: function (key) {
        if (!key || typeof (g_form) == 'undefined')
            return;
        var list = g_form.getDerivedFields(this.elementName);
        if (list == null)
            return;
        var url = "xmlhttp.do?sysparm_processor=GetReferenceRecord" +
            "&sysparm_name=" + this.elementName +
            "&sysparm_value=" + key +
            "&sysparm_derived_fields=" + list.join(',');
        var args = new Array(this.elementName, list.join(','));
        serverRequest(url, refFieldChangeResponse, args);
    },
    toString: function () { return 'DerivedFields'; }
});
;
/*! RESOURCE: /scripts/classes/Select.js */
var Select = Class.create({
    initialize: function (select) {
        this.select = $(select);
    },
    addOption: function (value, label) {
        addOption(this.select, value, label);
    },
    addOptions: function (glideRecord, nameField, valueField) {
        if (!valueField)
            valueField = 'sys_id';
        if (!nameField)
            nameField = 'name';
        while (glideRecord.next())
            addOption(this.select, glideRecord[valueField], glideRecord[nameField]);
    },
    clear: function () {
        this.select.options.length = 0;
    },
    getSelect: function () {
        return this.select;
    },
    getValue: function () {
        return this.select.options[this.select.selectedIndex].value;
    },
    selectValue: function (value) {
        this.select.selectedIndex = -1;
        var options = this.select.options;
        for (oi = 0; oi < options.length; oi++) {
            var option = options[oi];
            var optval = option.value;
            if (optval != value)
                continue;
            option.selected = true;
            this.select.selectedIndex = oi;
        }
    },
    contains: function (value) {
        var options = this.select.options;
        for (oi = 0; oi < options.length; oi++) {
            if (options[oi].value == value)
                return true;
        }
        return false;
    },
    getClassName: function () {
        return "SelectList";
    }
});
function addOption(select, value, label, selected, optionalTitle) {
    var o;
    if (select.multiple == true)
        o = new Option(label, value, true, selected || false);
    else
        o = new Option(label, value);
    if (optionalTitle)
        o.title = optionalTitle;
    select.options[select.options.length] = o;
    if (select.multiple != true && selected)
        select.selectedIndex = select.options.length - 1;
    return o;
}
function addOptionAt(select, value, label, idx, optionalTitle) {
    for (var i = select.options.length; i > idx; i--) {
        var oldOption = select.options[i - 1];
        select.options[i] = new Option(oldOption.text, oldOption.value);
        if (oldOption.id)
            select.options[i].id = oldOption.id;
        if (oldOption.style.cssText)
            select.options[i].style.cssText = oldOption.style.cssText;
    }
    var o = new Option(label, value);
    if (optionalTitle)
        o.title = optionalTitle;
    select.options[idx] = o;
    return o;
}
function getSelectedOption(select) {
    if (typeof select == "undefined" || select.multiple == true || select.selectedIndex < 0)
        return null;
    return select.options[select.selectedIndex];
}
;
/*! RESOURCE: /scripts/classes/GlideClientCache.js */
var GlideClientCacheEntry = Class.create({
    initialize: function (value) {
        this.value = value;
        this.bump();
    },
    bump: function () {
        this.stamp = new Date().getTime();
    }
});
var GlideClientCache = Class.create({
    _DEFAULT_SIZE: 50,
    initialize: function (maxEntries) {
        if (maxEntries)
            this.maxEntries = maxEntries;
        else
            this.maxEntries = this._DEFAULT_SIZE;
        this._init('default');
    },
    _init: function (stamp) {
        this._cache = new Object();
        this._stamp = stamp;
    },
    put: function (key, value) {
        var entry = new GlideClientCacheEntry(value);
        this._cache[key] = entry;
        this._removeEldest();
    },
    get: function (key) {
        var entry = this._cache[key];
        if (!entry)
            return null;
        entry.bump();
        return entry.value;
    },
    stamp: function (stamp) {
        if (stamp == this._stamp)
            return;
        this._init(stamp);
    },
    ensureMaxEntries: function (max) {
        jslog("Cache resize to " + max);
        if (this.maxEntries < max)
            this.maxEntries = max;
    },
    _removeEldest: function () {
        var count = 0;
        var eldest = null;
        var eldestKey = null;
        for (key in this._cache) {
            count++;
            var current = this._cache[key];
            if (eldest == null || eldest.stamp > current.stamp) {
                eldestKey = key;
                eldest = current;
            }
        }
        if (count <= this.maxEntries)
            return;
        if (eldest != null)
            delete this._cache[key];
    }
});
;
/// <reference path="../classes/prototype.min.js" />

/// <reference path="../classes/GlideURLElement.js" />
/// <reference path="../classes/GlideListElement.js" />
/// <reference path="../classes/GlideUserImageElement.js" />
/// <reference path="../classes/FieldListElement.js" />
/// <reference path="../classes/GlideTimeElement.js" />
/// <reference path="../classes/GlideTimerElement.js" />
/// <reference path="../classes/UserRolesElement.js" />
/// <reference path="../classes/DaysOfWeekElement.js" />
/// <reference path="../classes/TextAreaElement.js" />
/// <reference path="../classes/AttachmentUploader.js" />
/*! RESOURCE: /scripts/classes/GwtDate.js */
var GwtDate = Class.create({
    MINUTES_IN_DAY: 1440,
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    MONTHS_IN_YEAR: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    AJAX_PROCESSOR: "xmlhttp.do?sysparm_processor=com.glide.schedules.AJAXDate",
    initialize: function (s) {
        if (s) {
            this.deserialize(s);
        } else {
            this.clear();
        }
    },
    clone: function () {
        var newDate = new GwtDate(this.serialize());
        return newDate;
    },
    clear: function () {
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
    },
    serialize: function (dateOnly) {
        var s = this.year + "-" + (this.month + 1) + "-" + this.day;
        if (!dateOnly)
            s += " " + this.formatTime(true);
        return s;
    },
    serializeInUserFormat: function (dateOnly) {
        if (dateOnly)
            return this.formatDate(g_user_date_format);
        else
            return this.formatDate(g_user_date_time_format);
    },
    serializeTimeInUserFormat: function (includeSeconds) {
        var spaceIndex = g_user_date_time_format.indexOf(" ");
        var timeFormat = g_user_date_time_format.substr(spaceIndex + 1);
        if (!includeSeconds)
            timeFormat = timeFormat.replace(/[:\.]ss/, '');
        var d = this.getDateObject(true);
        return formatDate(d, timeFormat);
    },
    deserialize: function (s) {
        this.clear();
        if (typeof s == 'number')
            return this.setFromMs(s);
        var components = s.split(" ");
        if (components) {
            var parts = components[0].split("-");
            this.year = parts[0] * 1;
            if (parts.length > 1) {
                this.month = (parts[1] * 1) - 1;
                if (parts.length > 2) {
                    this.day = parts[2] * 1;
                }
            }
            if (components.length >= 2) {
                var parts = components[1].split(":");
                this.hour = parts[0] * 1;
                if (parts.length > 1) {
                    this.minute = parts[1] * 1;
                }
                if (parts.length > 2) {
                    this.second = parts[2] * 1;
                }
            }
        }
    },
    getYear: function () {
        return this.year;
    },
    getMonth: function () {
        return this.month;
    },
    getDay: function () {
        return this.day;
    },
    getHour: function () {
        return this.hour;
    },
    getMinute: function () {
        return this.minute;
    },
    getSecond: function () {
        return this.second;
    },
    getTime: function () {
        var h = this.hour * 60;
        var m = this.minute * 1;
        if (this.second >= 30) {
            m++;
        }
        return h + m;
    },
    getDaysInMonth: function () {
        if ((this.month == 1) && ((this.year % 4) == 0) && (((this.year % 100) != 0) || ((this.year % 400) == 0))) {
            return 29;
        } else {
            return this.DAYS_IN_MONTH[this.month];
        }
    },
    setYear: function (year) {
        this.year = year;
    },
    setMonth: function (month) {
        this.month = month;
    },
    setDay: function (day) {
        this.day = day;
    },
    setHour: function (hour) {
        this.hour = hour;
    },
    setMinute: function (minute) {
        this.minute = minute;
    },
    setSecond: function (second) {
        this.second = second;
    },
    setStartOfDay: function () {
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
    },
    setEndOfDay: function () {
        this.hour = 23;
        this.minute = 59;
        this.second = 59;
    },
    setFromJsDate: function (date) {
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.day = date.getDate();
        this.hour = date.getHours();
        this.minute = date.getMinutes();
        this.second = date.getSeconds();
    },
    setFromMs: function (milliseconds) {
        this.setFromJsDate(new Date(milliseconds));
    },
    setFromDate: function (date) {
        this.year = date.getYear();
        this.month = date.getMonth();
        this.day = date.getDay();
        this.hour = date.getHour();
        this.minute = date.getMinute();
        this.second = date.getSecond();
    },
    setFromInt: function (intDate, intTime) {
        this.clear();
        var year = Math.floor(intDate / 10000);
        this.year = year;
        this.month = (Math.floor((intDate - (year * 10000)) / 100)) - 1;
        this.day = intDate % 100;
        if (intTime) {
            var hour = Math.floor(intTime / 10000);
            this.hour = hour;
            this.minute = Math.floor((intTime - (hour * 10000)) / 100);
            this.second = intTime % 100;
        }
    },
    formatTime: function (includeSeconds) {
        var h = doubleDigitFormat(this.hour);
        var m = doubleDigitFormat(this.minute);
        if (!includeSeconds)
            return h + ":" + m;
        return h + ":" + m + ":" + doubleDigitFormat(this.second);
    },
    formatDate: function (format) {
        var d = this.getDateObject(false);
        d.setYear(this.year);
        d.setMonth(this.month);
        d.setDate(this.day);
        d.setHours(this.hour);
        d.setMinutes(this.minute);
        d.setSeconds(this.second);
        return formatDate(d, format);
    },
    getDateObject: function (includeTime) {
        var d = new Date();
        d.setDate(1);
        d.setYear(this.year);
        d.setMonth(this.month);
        d.setDate(this.day);
        if (includeTime) {
            d.setHours(this.getHour());
            d.setMinutes(this.getMinute());
            d.setSeconds(this.getSecond());
        } else {
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
        }
        return d;
    },
    isAllDay: function (toDate) {
        return ((this.getTime() == 0) && (toDate.getTime() >= (this.MINUTES_IN_DAY)));
    },
    compare: function (otherDate, includeTimes) {
        if (this.getYear() != otherDate.getYear()) {
            return this.getYear() - otherDate.getYear();
        }
        if (this.getMonth() != otherDate.getMonth()) {
            return this.getMonth() - otherDate.getMonth();
        }
        if (this.getDay() != otherDate.getDay()) {
            return this.getDay() - otherDate.getDay();
        }
        if (includeTimes) {
            if (this.getHour() != otherDate.getHour()) {
                return this.getHour() - otherDate.getHour();
            }
            if (this.getMinute() != otherDate.getMinute()) {
                return this.getMinute() - otherDate.getMinute();
            }
            if (this.getSecond() != otherDate.getSecond()) {
                return this.getSecond() - otherDate.getSecond();
            }
        }
        return 0;
    },
    addSeconds: function (seconds) {
        if (seconds < 0)
            return this.subtractSeconds(seconds * -1);
        for (var i = 0; i < seconds; i++) {
            this._incrementSecond();
        }
    },
    addMinutes: function (minutes) {
        if (minutes < 0)
            return this.subtractMinutes(minutes * -1);
        for (var i = 0; i < minutes; i++) {
            this._incrementMinute();
        }
    },
    addHours: function (hours) {
        if (hours < 0)
            return this.subtractHours(hours * -1);
        for (var i = 0; i < hours; i++) {
            this._incrementHour();
        }
    },
    addDays: function (days) {
        for (var i = 0; i < days; i++) {
            this._incrementDay();
        }
    },
    addMonths: function (months) {
        for (var i = 0; i < months; i++) {
            this._incrementMonth();
        }
        if (this.day > this.getDaysInMonth()) {
            this.day = this.getDaysInMonth();
        }
    },
    addYears: function (years) {
        this.year += years;
    },
    subtractSeconds: function (seconds) {
        for (var i = 0; i < seconds; i++) {
            this._decrementSecond();
        }
    },
    subtractMinutes: function (minutes) {
        for (var i = 0; i < minutes; i++) {
            this._decrementMinute();
        }
    },
    subtractHours: function (hours) {
        for (var i = 0; i < hours; i++) {
            this._decrementHour();
        }
    },
    subtractDays: function (days) {
        for (var i = 0; i < days; i++) {
            this._decrementDay();
        }
    },
    subtractMonths: function (months) {
        for (var i = 0; i < months; i++) {
            this._decrementMonth();
        }
        if (this.day > this.getDaysInMonth()) {
            this.day = this.getDaysInMonth();
        }
    },
    subtractYears: function (years) {
        this.year -= years;
    },
    _incrementSecond: function () {
        this.second++;
        if (this.second > 59) {
            this.second = 0;
            this._incrementMinute();
        }
    },
    _incrementMinute: function () {
        this.minute++;
        if (this.minute > 59) {
            this.minute = 0;
            this._incrementHour();
        }
    },
    _incrementHour: function () {
        this.hour++;
        if (this.hour > 23) {
            this.hour = 0;
            this._incrementDay();
        }
    },
    _incrementDay: function () {
        this.day++;
        if (this.day > this.getDaysInMonth()) {
            this.day = 1;
            this._incrementMonth();
        }
    },
    _incrementMonth: function () {
        this.month++;
        if (this.month >= 12) {
            this.year++;
            this.month = 0;
        }
    },
    _decrementSecond: function () {
        this.second--;
        if (this.second < 0) {
            this.second = 59;
            this._decrementMinute();
        }
    },
    _decrementMinute: function () {
        this.minute--;
        if (this.minute < 0) {
            this.minute = 59;
            this._decrementHour();
        }
    },
    _decrementHour: function () {
        this.hour--;
        if (this.hour < 0) {
            this.hour = 23;
            this._decrementDay();
        }
    },
    _decrementDay: function () {
        this.day--;
        if (this.day == 0) {
            this._decrementMonth();
            this.day = this.getDaysInMonth();
        }
    },
    _decrementMonth: function () {
        this.month--;
        if (this.month < 0) {
            this.year--;
            this.month = 11;
        }
    },
    now: function () {
        var parms = "&sysparm_type=now";
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        this.clear();
        this.deserialize(e.getAttribute("now"));
        return this;
    },
    getCurrentTimeZone: function () {
        var parms = "&sysparm_type=now";
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("time_zone");
    },
    getDayOfWeek: function () {
        var parms = "&sysparm_type=day_of_week&date=" + this.serialize(true);
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("day_of_week");
    },
    getCurrentMonth: function () {
        return this.MONTHS_IN_YEAR[this.getMonth()];
    },
    getWeekNumber: function () {
        var parms = "&sysparm_type=week_number&date=" + this.serialize(true);
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("week_number");
    },
    toString: function () {
        return this.formatDate('yyyy-MM-dd HH:mm:ss');
    }
});
;
/*! RESOURCE: /scripts/PageTimingService.js */
(function () {
    "use strict";
    if (window.NOW.PageTimingService)
        return;
    window.NOW.PageTimingService = {
        send: function (data, success, error) {
            if (!data.transaction_id) {
                if (window.console && window.console.warn)
                    console.warn("missing data.transaction_id, could not send page timing");
                return;
            }
            var transactionID = data.transaction_id;
            delete data.transaction_id;
            if (!error) {
                error = function (request, textStatus, errorThrown) {
                    if (request.statusText !== 'abort') {
                        console.error(errorThrown);
                    }
                };
            }
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (typeof g_ck != 'undefined')
                headers['X-UserToken'] = g_ck;
            return $j.ajax({
                headers: headers,
                'type': 'PATCH',
                'url': "/api/now/ui/page_timing/" + transactionID,
                'data': JSON.stringify(data),
                'success': success,
                'error': error
            });
        }
    };
})();
;
/*! RESOURCE: /scripts/doctype/PageTiming14.js */
NOW.PageTiming = function () {
    "use strict";
    var categories = null;
    initialize();
    function initialize() {
        CustomEvent.observe('page_timing', _pageTiming);
        CustomEvent.observe('page_timing_network', _pageTimingNetwork);
        CustomEvent.observe('page_timing_show', _pageTimingShow);
        CustomEvent.observe('page_timing_clear', _clearTimingDiv);
        CustomEvent.observe('page_timing_client', _clientTransaction);
    }
    function _pageTiming(timing) {
        var ms;
        if (timing.startTime)
            ms = new Date() - timing.startTime;
        else
            ms = timing.ms;
        if (isNaN(ms))
            return;
        _initCategories();
        var category = timing.name + '';
        ms = new Number(ms);
        if (!categories[category]) {
            categories[category] = {
                children: [],
                ms: 0
            }
        }
        var cat = categories[category];
        if (timing.child) {
            if (timing.child.description)
                cat.children.push({ name: timing.child.description + '', script_type: timing.child.type, ms: ms, sys_id: timing.child.sys_id, source_table: timing.child.source_table });
            else
                cat.children.push({ name: timing.child + '', ms: ms });
        }
        cat.ms += ms;
    }
    function _pageTimingNetwork(timing) {
        if (!window._timingStartTime)
            timing.ms = 0;
        else if (window.performance && performance.timing.requestStart != performance.timing.responseStart)
            timing.ms = window.performance.timing.requestStart - window.performance.timing.navigationStart;
        else
            timing.ms = Math.max(0, timing.loadTime - window._timingStartTime - _getTiming('SERV'));
        if (isNaN(timing.ms))
            timing.ms = 0;
        _pageTiming(timing);
    }
    function _pageTimingShow(info) {
        if (!window._timingStartTime)
            return;
        _setRlCatName();
        var tot;
        if (window.performance)
            tot = (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart);
        else
            tot = new Date().getTime() - window._timingStartTime;
        if (tot > 900000) {
            _clearTimingDiv(info);
            return;
        }
        window._timingTotal = tot;
        var div = _getOrCreateTimingDiv();
        var o = { RESP: tot };
        for (var c in categories)
            o[c] = _getTiming(c) + '';
        var txt = new XMLTemplate('glide:page_timing_div').evaluate(o);
        div.innerHTML = txt + '';
        if (tot > 0) {
            var timingGraph = $j('.timing_graph');
            var timingGraphDiv = $j('.timingGraphDiv');
            var pageTimingExpand = $j('.page_timing_expand');
            timingGraph.find('.timing_network').width(Math.round((_getTiming('NETW') / tot) * 100) + '%');
            timingGraph.find('.timing_server').width(Math.round((_getTiming('SERV') / tot) * 100) + '%');
            timingGraph.find('.timing_browser').width(Math.round((_getTiming('REND') / tot) * 100) + '%');
            if (window.performance) {
                pageTimingExpand.attr("aria-expanded", "false");
                pageTimingExpand.attr("aria-controls", "glide:timingBreakdown_widget");
                pageTimingExpand.addClass('icon-chevron-down');
                pageTimingExpand.tooltip({
                    title: function () {
                        if (pageTimingExpand.attr('aria-expanded') === 'true') {
                            return pageTimingExpand.data('title-collapse');
                        }
                        return pageTimingExpand.data('title-expand');
                    },
                    placement: 'top'
                }).hideFix();
                pageTimingExpand.one('click', function () {
                    var timingBreakdown = $j('<table class="timing_breakdown" id="glide:timingBreakdown_widget" aria-hidden="false">' +
                        '<thead>' +
                        '       <th aria-hidden="true"></th>' +
                        '       <th class="timing_label">Timing Type</th>' +
                        '       <th>Time Range</th>' +
                        '       <th>Total Time</th>' +
                        '</thead>');
                    var events = [
                        ['timing_network', 'Cache/DNS/TCP', 'fetchStart', 'connectEnd'],
                        ['timing_server', 'Server', 'requestStart', 'responseEnd'],
                        ['timing_browser', 'Unload', 'unloadEventStart', 'unloadEventEnd'],
                        ['timing_browser', 'DOM Processing', 'domLoading', 'domComplete'],
                        ['timing_browser', 'onLoad', 'loadEventStart', 'loadEventEnd']
                    ];
                    for (var i = 0; i < events.length; i++) {
                        var runTime = window.performance.timing[events[i][3]] - window.performance.timing[events[i][2]];
                        var startTime = (window.performance.timing[events[i][2]] - window.performance.timing.navigationStart) + '-' + (window.performance.timing[events[i][3]] - window.performance.timing.navigationStart);
                        timingBreakdown.append($j('<tr><td aria-hidden="true" class="' + events[i][0] + '"></td><td class="timing_label">' + events[i][1] + '</td><td>' + startTime + 'ms</td><td>' + runTime + 'ms</td></tr>'));
                    }
                    timingBreakdown.insertAfter(timingGraphDiv);
                });
                pageTimingExpand.on('click', function (e) {
                    var isNotExpanded = (pageTimingExpand.attr('aria-expanded') === 'true');
                    if (isNotExpanded) {
                        pageTimingExpand.removeClass('icon-chevron-up')
                            .addClass('icon-chevron-down')
                    } else {
                        pageTimingExpand.removeClass('icon-chevron-down')
                            .addClass('icon-chevron-up')
                    }
                    var timingBreakdown = $j('.timing_breakdown');
                    pageTimingExpand.attr('aria-expanded', !isNotExpanded);
                    timingBreakdown.attr('aria-hidden', isNotExpanded);
                    (isNotExpanded) ? timingBreakdown.hide() : timingBreakdown.show();
                    pageTimingExpand.tooltip('hide');
                });
            }
        }
        var img = div.down('img');
        if (!img)
            img = div.down('button');
        if (!img)
            return;
        img.observe('click', toggle.bindAsEventListener(this));
        img.setAttribute('aria-expanded', info.show);
        if (info.show == 'true')
            _toggle(img);
        var a = div.down('a');
        $j(a).on('click keydown', toggleDetails)
        a.next().down().down().next().observe('click', toggleDetails);
    }
    function toggle(evt) {
        var img = Event.element(evt);
        var isVisible = _toggle(img);
        img.setAttribute('aria-expanded', isVisible);
        _setPreference(isVisible);
    }
    function _toggle(img) {
        var span = img.up().down('.timing_span');
        if (!span)
            return false;
        span.toggle();
        return span.visible();
    }
    function _setPreference(flag) {
        try {
            setPreference('glide.ui.response_time', flag + '');
        } catch (e) { }
    }
    function toggleDetails(e) {
        if (e.type === 'keydown' && e.which !== 32)
            return;
        var span = gel('page_timing_details');
        var a = gel('page_timing_div').down('a');
        var state = span.getAttribute('data-state');
        if (state === 'shown') {
            span.setAttribute('data-state', 'hidden');
            a.setAttribute('aria-expanded', 'false');
            span.up().up().setAttribute('aria-hidden', 'true');
            span.hide();
            return false;
        }
        if (state === 'hidden') {
            span.setAttribute('data-state', 'shown');
            a.setAttribute('aria-expanded', 'true');
            span.up().up().setAttribute('aria-hidden', 'false');
            span.show();
            return;
        }
        span.innerHTML = _buildDetails();
        span.setAttribute('data-state', 'shown');
        a.setAttribute('aria-expanded', 'true');
        span.up().up().setAttribute('aria-hidden', 'false');
        span.on('click', 'div.timing_detail_line', function (evt, element) {
            if (element.getAttribute('data-children') === '0')
                return;
            var div = element.down('div');
            if (div)
                div.toggle();
        });
    }
    function _buildDetails() {
        var txt = '';
        var o;
        var other = _getTiming('REND');
        var detailLine = new XMLTemplate('glide:page_timing_detail_line');
        CATEGORIES.forEach(function (cat) {
            if (!categories[cat.category])
                return;
            var ms = _getTiming(cat.category) + '';
            if ('RLV2' !== cat.category)
                other -= ms;
            var children = categories[cat.category].children;
            o = { name: cat.name, ms: ms, child_count: (children.length + ''), children: '', has_children: '' };
            if (children.length > 0) {
                o.children = _buildChildren(children);
                o.has_children = 'timing_detail_line_has_children';
            }
            txt += detailLine.evaluate(o);
        });
        if (other > 10)
            txt += detailLine.evaluate({ name: 'Other', ms: other, child_count: 0, has_children: '' });
        o = { details: txt };
        return new XMLTemplate('glide:page_timing_details').evaluate(o);
    }
    function _buildChildren(children) {
        var txt = '<div style="display:none; cursor:default">';
        var detailChild = new XMLTemplate('glide:page_timing_child_line');
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var o = { name: child.name, ms: (child.ms + '') };
            txt += detailChild.evaluate(o);
        }
        txt += '</div>';
        return txt;
    }
    function _initCategories() {
        if (categories)
            return;
        categories = {};
        var startTime = 0;
        if (window.performance)
            startTime = window.performance.timing.navigationStart;
        else
            startTime = parseInt(new CookieJar().get('g_startTime'), 10);
        window._timingStartTime = startTime;
    }
    function _getTiming(category) {
        if (!categories[category])
            return 0;
        return Math.max(0, categories[category].ms);
    }
    function _setRlCatName() {
        var isDeferred = window.g_related_list_timing != 'default';
        var postFix = (isDeferred === true) ? ' (async)' : ' (sync)';
        for (var i = 0; i < CATEGORIES.length; i++) {
            if ((CATEGORIES[i].category === 'RLV2') && (!hasPostFix(CATEGORIES[i].name)))
                CATEGORIES[i].name = CATEGORIES[i].name + postFix;
        }
        function hasPostFix(cat_name) {
            var cat_name_split = cat_name.split(' ');
            var len = cat_name_split.length;
            return !!((cat_name_split[len - 1] === '(async)') || (cat_name_split[len - 1] === '(sync)'));
        }
    }
    function _clearTimingDiv() {
        window._timingTotal = -1;
        var div = gel('page_timing_div');
        if (div) {
            div.innerHTML = '';
            div.style.visibility = 'hidden';
        }
    }
    function _getOrCreateTimingDiv() {
        var div = gel('page_timing_div');
        if (!div) {
            div = cel('div');
            div.id = 'page_timing_div';
            div.className = 'timingDiv';
            document.body.appendChild(div);
        }
        div.style.visibility = '';
        return div;
    }
    function _clientTransaction(o) {
        if (!window._timingStartTime || !window._timingTotal || window._timingTotal <= 0 || getActiveUser() === false || getTopWindow().loggingOut === true)
            return;
        var det = [];
        for (var i = 0; i < CATEGORIES.length; i++) {
            var cat = CATEGORIES[i];
            if (!o.types[cat.category])
                continue;
            if (!categories[cat.category])
                continue;
            var children = categories[cat.category].children;
            if (!children)
                continue;
            for (var ndx = 0; ndx < children.length; ndx++) {
                var child = children[ndx];
                var t = {};
                t.type_code = cat.category;
                t.type = cat.name;
                t.script_detail = child.script_type;
                t.name = child.name;
                t.duration = child.ms;
                t.sys_id = child.sys_id;
                t.source_table = child.source_table;
                det.push(t);
            }
        }
        var data = {
            'transaction_id': o.transaction_id,
            'table_name': o.table_name,
            'form_name': o.form_name,
            'view_id': o.view_id,
            'transaction_time': window._timingTotal,
            'browser_server_time': _getTiming('SERV'),
            'network_time': _getTiming('NETW'),
            'browser_time': _getTiming('REND'),
            'client_script_time': (_getTiming('CSOL') + _getTiming('CSOC')),
            'policy_time': _getTiming('UIOL'),
            'client_details': Object.toJSON(det)
        };
        if (o.logged_in !== false)
            window.NOW.PageTimingService.send(data);
    }
    var CATEGORIES = [
        { category: 'SCPT', name: 'Script Load/Parse' },
        { category: 'PARS', name: 'CSS and JS Parse' },
        { category: 'SECT', name: 'Form Sections' },
        { category: 'UIOL', name: 'UI Policy - On Load' },
        { category: 'CSOL', name: 'Client Scripts - On Load' },
        { category: 'CSOC', name: 'Client Scripts - On Change (initial load)' },
        { category: 'PROC', name: 'Browser processing before onload' },
        { category: 'DOMC', name: 'DOMContentLoaded to LoadEventEnd' },
        { category: 'LOADF', name: 'addLoadEvent functions' },
        { category: 'RLV2', name: 'Related Lists' }
    ]
};
addTopRenderEvent(function () {
    NOW.PageTiming();
});
;
/// <reference path="../classes/GlideUI.js" />
/*! RESOURCE: /scripts/classes/GlideUINotification.js */
var GlideUINotification = Class.create({
    initialize: function (options) {
        options = Object.extend({
            type: 'system',
            text: '',
            duration: 0,
            attributes: {},
            xml: null,
            window: window
        }, options || {});
        this.window = options.window;
        if (!options.xml) {
            this.type = options.type;
            this.text = options.text;
            this.attributes = options.attributes;
            this.duration = options.duration;
        } else
            this.xml = options.xml;
    },
    getType: function () {
        if (this.xml)
            return this.xml.getAttribute('data-type') || '';
        return this.type;
    },
    getText: function () {
        if (this.xml)
            return this.xml.getAttribute('data-text') || '';
        return this.text;
    },
    getDuration: function () {
        if (this.xml)
            return parseInt(this.xml.getAttribute('data-duration'), 10) || 0;
        return this.duration;
    },
    getAttribute: function (n) {
        var v;
        if (this.xml)
            v = this.xml.getAttribute('data-attr-' + n) || '';
        else
            v = this.attributes[n] || '';
        return v;
    },
    getWindow: function () {
        return this.window;
    },
    getChildren: function () {
        if (!this.xml)
            return [];
        var children = [];
        var spans = this.xml.childNodes;
        for (var i = 0; i < spans.length; i++) {
            if ((spans[i].getAttribute('class') == 'ui_notification_child') || (spans[i].getAttribute('className') == 'ui_notification_child'))
                children.push(new GlideUINotification({ xml: spans[i], window: this.window }));
        }
        return children;
    },
    toString: function () { return 'GlideUINotification'; }
});
;
/*! RESOURCE: /scripts/classes/GlideUIDefault.js */
var GlideUIDefault = {
    init: function () { },
    display: function (htmlTextOrOptions) {
        if (typeof htmlTextOrOptions == 'string')
            new NotificationMessage({ text: htmlTextOrOptions });
        else
            new NotificationMessage(htmlTextOrOptions);
    }
};
if (GlideUI.get())
    Object.extend(GlideUI.get(), GlideUIDefault).init();
;
/*! RESOURCE: /scripts/classes/doctype/NotificationMessage.js */
var NotificationMessage = Class.create({
    FADE_IN_DEFAULT_MS: 400,
    FADE_OUT_DEFAULT_MS: 200,
    CLOSE_DEFAULT_MS: 3000,
    initialize: function (options) {
        this.options = Object.extend({
            text: '',
            type: 'info',
            image: '',
            styles: {},
            sticky: false,
            fadeIn: this.FADE_IN_DEFAULT_MS,
            fadeOut: this.FADE_OUT_DEFAULT_MS,
            closeDelay: this.CLOSE_DEFAULT_MS,
            classPrefix: 'notification',
            container: 'ui_notification',
            classContainer: 'panel-body',
            bundleMessages: false,
            singleMessage: false,
            onBeforeOpen: function () { },
            onAfterOpen: function () { },
            onBeforeClose: function () { },
            onAfterClose: function () { }
        }, options || {});
        if (this.options.type == 'warn')
            this.options.type = 'warning';
        if (this.options.type === '')
            this.options.type = 'info';
        if (this.options.type == 'system')
            this.options.type = 'info';
        this.options.fadeIn = this._validNumber(this.options.fadeIn, this.FADE_IN_DEFAULT_MS);
        this.options.fadeOut = this._validNumber(this.options.fadeOut, this.FADE_OUT_DEFAULT_MS);
        this.options.closeDelay = this._validNumber(this.options.closeDelay, this.CLOSE_DEFAULT_MS);
        this._show();
    },
    _show: function () {
        var container = this._getContainer(this.options.container);
        this.options.onBeforeOpen.call(this);
        if (this.options.singleMessage)
            container.update("");
        this.notification = this._create();
        if (!this.options.bundleMessages || container.childElements().length === 0) {
            container.insert(this.notification);
            if (!this.options.sticky) {
                this.timeoutId = setTimeout(this._close.bind(this, false),
                    this.options.closeDelay + this.options.fadeIn);
                this.notification.observe('mouseover', this._makeSticky.bind(this));
            }
        } else {
            var notification = container.down('.' + this.options.classPrefix);
            if (!notification)
                notification = this.notification;
            this._showOuterPanel(notification);
            NotificationMessage.prototype.messages.push(this.notification);
            this._updateMoreText(notification, NotificationMessage.prototype.messages.length + " more...");
        }
        this.notification.on('click', '.notification_close_action', this._close.bind(this, true));
        this.notification.fadeIn(this.options.fadeIn, function () {
            this.options.onAfterOpen.call(this);
        }.bind(this));
    },
    _close: function (boolCloseImmediately, closeEvent) {
        if (!this.notification || this._isClosing === true)
            return;
        this._isClosing = true;
        this.options.onBeforeClose.call(this);
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        function _onClose(notification) {
            this._isClosing = false;
            notification.stopObserving();
            var parent = notification.up();
            if (notification.up('.' + this.options.classContainer)
                && notification
                    .up('.' + this.options.classContainer).select('.' + this.options.classPrefix).length <= 1)
                notification.up('#' + this.options.container).remove();
            else {
                if (notification.parentNode)
                    notification.remove();
                notification = null;
            }
            this.options.onAfterClose.call(this);
            if (isMSIE && parent) {
                parent.style.display = "none"
                parent.style.display = "block";
            }
        }
        var notification = this.notification;
        if (closeEvent && closeEvent.element)
            notification = closeEvent.element().up('.' + this.options.classPrefix + '-closable');
        if (boolCloseImmediately)
            _onClose.call(this, notification);
        else
            notification.animate({ height: 0, opacity: 0.2 }, this.options.fadeOut, _onClose.bind(this, notification));
    },
    _makeSticky: function () {
        clearTimeout(this.timeoutId);
        this.notification.stopObserving('mouseover');
        this.notification.down('.close').show();
        this.notification.addClassName(this.options.classPrefix + '_message_sticky');
    },
    _showAll: function (more) {
        if (this.notification.up(".panel-body").length === 0) {
            var notificationContainer = this._createContainer();
            this.notification.insert(notificationContainer)
            this.notification.wrap(notificationContainer);
            this.notification.addClassName("notification_inner");
            this.notification = notificationContainer;
        }
        for (var i = 0; i < NotificationMessage.prototype.messages.length; i++) {
            var notification = NotificationMessage.prototype.messages[i];
            this.notification.up('.panel-body').insert(notification);
            notification.stopObserving('mouseover');
            notification.down('.close').show();
            notification.addClassName(this.options.classPrefix + '_message_sticky');
        }
        more.up('.notification-more-container').hide();
        NotificationMessage.prototype.messages = [];
    },
    _getContainer: function (n) {
        var c = $(n);
        if (c)
            return c.down('.' + this.options.classContainer);
        c = new Element('div', {
            'id': n,
            'className': this.options.classPrefix + '_container notification-closable'
        });
        document.body.appendChild(c);
        this._createHeading(c);
        var body = this._createBody(c);
        this._createFooter(c);
        return body;
    },
    _createContainer: function () {
        return this._createMainDiv(true);
    },
    _createHeading: function (container) {
        var heading = new Element('div', { className: "panel-heading", style: 'display: none;' });
        var close = this._createCloseIcon();
        close.setStyle({ display: "block" });
        heading.insert(close);
        heading.insert("<h3 class=\"panel-title\">Current Notification Messages</h3>");
        container.insert(heading);
    },
    _createBody: function (container) {
        var el = new Element('div', { className: this.options.classContainer, style: 'padding: 0;' });
        container.insert(el);
        return el;
    },
    _createFooter: function (container) {
        var el = new Element('div', { className: 'panel-footer notification-more-container', style: 'display:none; ' });
        container.insert(el);
        el.insert(this._createMoreIcon());
    },
    _create: function () {
        var e = this._createMainDiv();
        e.appendChild(this._createCloseIcon());
        e.insert(this.options.text);
        e.style.display = 'none';
        return e;
    },
    _createCloseIcon: function () {
        var close = new Element('span', {
            className: 'icon-cross close',
            style: 'display: ' + (this.options.sticky ? 'block' : 'none')
        });
        close.observe('click', this._close.bind(this, true));
        return close;
    },
    _createMainDiv: function (isContainer) {
        var className = this.options.classPrefix;
        if (!isContainer && this.options.type)
            className += ' notification-closable ' + this.options.classPrefix + '-' + this.options.type;
        else if (isContainer)
            className = this.options.classPrefix + '_message_container panel-body';
        if (this.options.sticky)
            className += ' ' + this.options.classPrefix + '_sticky';
        var e = new Element('div', { 'className': className });
        e.setStyle(this.options.styles);
        return e;
    },
    _createMoreIcon: function () {
        var more = new Element("a", { "className": "notification-more" });
        more.observe('click', this._showAll.bind(this, more));
        return more;
    },
    _showOuterPanel: function (notification) {
        notification.up('.notification_container').down('.panel-heading').show();
        notification.up('.notification_container').down('.panel-body').style.padding = '';
        notification.up('.notification_container').addClassName('panel panel-default');
        notification.up('.panel').down(".notification-more-container").show();
    },
    _updateMoreText: function (notification, text) {
        notification.up('.panel').select(".notification-more")[0].update(text);
    },
    _validNumber: function (n, v) {
        n = parseInt(n, 10);
        return isNaN(n) ? v : n;
    },
    toString: function () { return 'NotificationMessage'; }
});
NotificationMessage.prototype.messages = [];
;
/*! RESOURCE: /scripts/section.js */
function expandCollapseAllSections(expandFlag) {
    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
        if (spans[i].id.substr(0, 8) != "section.")
            continue;
        var id = spans[i].id.substring(8);
        var state = collapsedState(id);
        if (state == expandFlag)
            toggleSectionDisplay(id);
    }
    CustomEvent.fire('toggle.sections', expandFlag);
}
function collapsedState(sectionName) {
    var el = $(sectionName);
    if (el)
        return (el.style.display == "none");
}
function setCollapseAllIcons(action, sectionID) {
    var exp = gel('img.' + sectionID + '_expandall');
    var col = gel('img.' + sectionID + '_collapseall');
    if (!exp || !col)
        return;
    if (action == "expand") {
        exp.style.display = "none";
        col.style.display = "inline";
        return;
    }
    exp.style.display = "inline";
    col.style.display = "none";
}
function toggleSectionDisplay(id, imagePrefix, sectionID) {
    var collapsed = collapsedState(id);
    setPreference("collapse.section." + id, !collapsed, null);
    hideReveal(id, imagePrefix);
    toggleDivDisplay(id + '_spacer');
    if (collapsed) {
        CustomEvent.fire("section.expanded", id);
        setCollapseAllIcons("expand", sectionID);
    }
}
;
/*! RESOURCE: /scripts/classes/doctype/GlideTabs2.js */
var GlideTabs2 = Class.create({
    initialize: function (className, parentElement, offset, tabClassPrefix, isPreloaded) {
        this._timeout = null;
        this._lastIndex = null;
        this.tabs = [];
        this.tabIDs = [];
        this.tabNames = [];
        this.isHidable = [];
        this.className = className;
        if (parentElement == null)
            return;
        this.parentElement = parentElement;
        this.isFormTabs = window.g_form && parentElement == g_form.getFormElement();
        this.tabs = this.getChildNodesWithClass(parentElement, className);
        if (offset == 1)
            this.tabs.shift();
        if (this.isFormTabs) {
            CustomEvent.observe("form.loaded", this.markMandatoryTabs.bind(this));
            CustomEvent.observe("ui_policy.loaded", this.startCatchingMandatory.bind(this));
            var initialIndex = parseInt($j('#tabs2_section').attr('data-initial-tab-index'), 10);
            this._lastIndex = isNaN(initialIndex) ? 0 : initialIndex;
        }
        CustomEvent.observe("change.handlers.run", this.showTabs.bind(this));
        CustomEvent.observe("change.handlers.run.all", this.showTabs.bind(this));
        if (className !== 'tabs2_list' || !window.NOW.g_relatedLists)
            CustomEvent.observe("partial.page.reload", this.updateTabs.bind(this));
        this.activated = false;
        this.tabDiv = gel(className);
        this.activeTab = -1;
        this.createTabs(tabClassPrefix, isPreloaded);
        this.state = new GlideTabs2State(className + "_" + g_tabs_reference);
        if (this.tabDiv) {
            $j(this.tabDiv).attr('role', 'tablist').on('keydown', this, this.handleKeydown);
            setTimeout(function (tabDiv) {
                $j(tabDiv.getElementsByClassName('tabs2_tab')).not('.tabs2_active').attr({ 'tabindex': -1, 'aria-selected': false });
            }, 0, this.tabDiv);
        }
    },
    handleKeydown: function (e) {
        var self = e.data;
        if (e.which == 37) {
            var newIndex = (self.activeTab - 1 + self.tabsTabs.length) % self.tabsTabs.length;
            var loopCount = 0;
            while (self.tabsTabs[newIndex].element.style['display'] == 'none' && loopCount < self.tabsTabs.length) {
                newIndex = (newIndex - 1 + self.tabsTabs.length) % self.tabsTabs.length;
                loopCount++;
            }
            self.setActive(newIndex);
        } else if (e.which == 39) {
            var newIndex = (self.activeTab + 1 + self.tabsTabs.length) % self.tabsTabs.length;
            var loopCount = 0;
            while (self.tabsTabs[newIndex].element.style['display'] == 'none' && loopCount < self.tabsTabs.length) {
                newIndex = (newIndex + 1 + self.tabsTabs.length) % self.tabsTabs.length;
                loopCount++;
            }
            self.setActive(newIndex);
        }
        for (var i = 0; i < self.tabs.length; i++) {
            self.tabs[i].setAttribute('aria-hidden', i != self.activeTab);
        }
        var activeTab = $j(this.getElementsByClassName('tabs2_active')[0]);
        activeTab.attr('tabindex', 0);
        activeTab.attr('aria-selected', true);
        activeTab.focus();
        $j(this.getElementsByClassName('tabs2_tab')).not('.tabs2_active').attr({ 'tabindex': -1, 'aria-selected': false });
    },
    setActive: function (index) {
        if (index < 0 || index > this.tabs.length - 1)
            index = 0;
        var tab = this.tabs[index];
        if (this.activeTab != -1) {
            var previousTab = this.tabs[this.activeTab];
            var previousTabRect = previousTab.getBoundingClientRect();
            this._bumpSpacer(previousTabRect.height);
            hide(previousTab);
            this.tabsTabs[this.activeTab].setActive(false);
        }
        show(tab);
        this.activeTab = parseInt(index, 10);
        this.state.set(this.activeTab);
        if (this.isFormTabs && this._lastIndex !== this.activeTab && this.tabsTabs[this._lastIndex]) {
            $j(this.tabsTabs[this._lastIndex].element).removeClass('tabs2_active');
            this.setFormTabIndex();
        }
        this.tabsTabs[index].setActive(true);
    },
    isActivated: function () {
        return this.activated;
    },
    setFormTabIndex: function () {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(function () {
            this._lastIndex = this.activeTab;
            setPreference('tabs2.section.' + g_form.getTableName(), this.activeTab);
        }.bind(this), 2000);
    },
    deactivate: function () {
        removeClassName(this.parentElement, 'tabs_enabled');
        removeClassName(this.parentElement, 'tabs_disabled');
        addClassName(this.parentElement, 'tabs_disabled');
        if (this.tabs.length == 0)
            return;
        if (isDoctype) {
            for (var i = 0; i < this.tabs.length; i++)
                $(this.tabs[i]).removeClassName("tab_section");
        }
        var count = this.tabsTabs.length;
        for (var i = 0; i < count; i++) {
            var tabsTab = this.tabsTabs[i];
            if (tabsTab.isVisible())
                show(this.tabs[i]);
        }
        for (var i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setAttribute('aria-hidden', false);
        }
        hide(this.tabDiv);
        this.activated = false;
    },
    activate: function () {
        if (this.className === "tabs2_vars")
            return;
        removeClassName(this.parentElement, 'tabs_enabled');
        removeClassName(this.parentElement, 'tabs_disabled');
        addClassName(this.parentElement, 'tabs_enabled');
        if (this.tabs.length < 2) {
            this.deactivate();
            return;
        }
        if (isDoctype) {
            for (var i = 0; i < this.tabs.length; i++)
                $(this.tabs[i]).addClassName("tab_section");
        }
        show(this.tabDiv);
        this.hideAll();
        var index = this.state.get();
        if (index == null)
            index = 0;
        if (!this.tabsTabs[index] || !this.tabsTabs[index].isVisible()) {
            index = this._findFirstVisibleTab();
            if (index != -1)
                this.setActive(index);
        }
        if (index != -1)
            this.setActive(index);
        for (var i = 0; i < this.tabs.length; i++) {
            if (i != index) {
                this.tabs[i].setAttribute('aria-hidden', true);
            }
        }
        this.activated = true;
    },
    hideAll: function () {
        var tabs = this.tabs;
        for (var i = 0; i < tabs.length; i++)
            hide(tabs[i]);
    },
    hideTabByID: function (tabID) {
        var tabIndex = this.findTabIndexByID(tabID);
        if (tabIndex == -1)
            return;
        this.hideTab(tabIndex);
    },
    hideTabByName: function (name) {
        var tabIndex = this.findTabIndexByName(name);
        if (tabIndex == -1)
            return;
        this.hideTab(tabIndex);
    },
    hideTab: function (index) {
        if (this.isHidable[index] === true) {
            hide(this.tabs[index].firstChild);
            this.showTabs();
        }
    },
    _findFirstVisibleTab: function () {
        var count = this.tabsTabs.length;
        for (var i = 0; i < count; i++) {
            var tabsTab = this.tabsTabs[i];
            if (tabsTab.isVisible()) {
                this.setActive(i);
                return i;
            }
        }
        return -1;
    },
    showAll: function () {
        var tabs = this.tabs;
        for (var i = 0; i < tabs.length; i++)
            show(tabs[i]);
    },
    showTabByID: function (tabID) {
        var tabIndex = this.findTabIndexByID(tabID);
        if (tabIndex == -1)
            return;
        this.showTab(tabIndex);
    },
    showTabByName: function (name) {
        var tabIndex = this.findTabIndexByName(name);
        if (tabIndex == -1)
            return;
        this.showTab(tabIndex);
    },
    isVisible: function (index) {
        var visibility = this.tabs[index].firstChild.style.display;
        return !(visibility == 'none');
    },
    showTab: function (index) {
        show(this.tabs[index].firstChild);
        this.showTabs();
    },
    findTabIndexByID: function (tabID) {
        var count = this.tabIDs.length;
        for (var i = 0; i < count; i++) {
            if (this.tabIDs[i] == tabID)
                return i;
        }
        this.log("findTabIndexByID could not find " + tabID);
        return -1;
    },
    findTabIndexByName: function (tabName) {
        var index = this.tabNames.indexOf(tabName);
        if (index === -1)
            this.log("findTabIndexByName could not find " + tabName);
        return index;
    },
    createTabs: function (tabClassPrefix, isPreloaded) {
        var tabs = this.tabs;
        this.tabsTabs = [];
        for (var i = 0, n = tabs.length, tab, title, name; i < n; i++) {
            tab = tabs[i];
            title = this._getCaption(tab);
            name = tab.getAttribute('tab_caption_raw');
            this.tabsTabs[i] = new GlideTabs2Tab(this, i, title, tabClassPrefix, isPreloaded);
            this.tabIDs[i] = tab.getAttribute('id');
            this.isHidable[i] = true;
            if (name) {
                this.tabNames[i] = name.toLowerCase().replace(" ", "_").replace(/[^0-9a-z_]/gi, "");
            } else {
                this.tabNames[i] = tab.getAttribute('tab_list_name_raw');
            }
            tab.setAttribute('role', 'tabpanel');
            tab.setAttribute('aria-hidden', true);
            tab.setAttribute('aria-labelledby', this.tabIDs[i]);
            if (!isPreloaded) {
                var header = isDoctype ? cel('span') : cel('h3');
                header.className = 'tab_header';
                if (isTextDirectionRTL()) {
                    header.dir = 'rtl';
                }
                header.appendChild(this.tabsTabs[i].getElement());
                if (!this.tabDiv) {
                    continue;
                }
                this.tabDiv.appendChild(header);
                var img = cel('img');
                img.className = 'tab_spacer';
                img.src = 'images/s.gifx';
                img.width = '4';
                img.height = '24';
                this.tabDiv.appendChild(img);
            }
        }
        this.showTabs();
    },
    showTabs: function () {
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            var s = tab.firstChild;
            var displayed = s.style.display != 'none';
            this.tabsTabs[i].showTab(displayed);
        }
        this._setActiveTab();
    },
    updateTabs: function () {
        var tabs = this.tabs;
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            var t = this._getCaption(tab)
            this.tabsTabs[i].updateCaption(t);
        }
    },
    _setActiveTab: function () {
        if (this.activeTab == -1)
            return;
        var currentTab = this.tabsTabs[this.activeTab];
        if (currentTab.isVisible())
            return;
        for (var i = 0; i < this.tabsTabs.length; i++) {
            var t = this.tabsTabs[i];
            if (!t.isVisible())
                continue;
            this.setActive(i);
            break;
        }
    },
    startCatchingMandatory: function () {
        this.markMandatoryTabs();
        CustomEvent.observe("mandatory.changed", this.markMandatoryTabs.bind(this));
    },
    markMandatoryTabs: function () {
        this.markAllTabsOK();
        if (typeof (g_form) == 'undefined')
            return;
        var missingFields = g_form.getMissingFields();
        for (var i = 0; i < missingFields.length; i++)
            this.markTabMandatoryByField(missingFields[i]);
    },
    markTabMandatoryByField: function (field) {
        var i = this.findTabIndex(field);
        if (i == -1)
            return;
        this.isHidable[i] = false;
        if (!this.isVisible(i))
            this.showTab(i);
        this.tabsTabs[i].markAsComplete(false);
    },
    findTabIndex: function (fieldName) {
        var answer = -1;
        if (typeof (g_form) == 'undefined')
            return;
        var element = g_form.getControl(fieldName);
        var tabSpan = findParentByTag(element, "span");
        while (tabSpan) {
            if (hasClassName(tabSpan, 'tabs2_section'))
                break;
            tabSpan = findParentByTag(tabSpan, "span");
        }
        for (i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i] == tabSpan) {
                answer = i;
                break;
            }
        }
        return answer;
    },
    markAllTabsOK: function () {
        for (var i = 0; i < this.tabsTabs.length; i++) {
            this.isHidable[i] = true;
            this.tabsTabs[i].markAsComplete(true);
        }
    },
    hasTabs: function () {
        return this.tabs.length > 1;
    },
    _bumpSpacer: function (newHeight) {
        var spacerDiv = gel('tabs2_spacer');
        if (!spacerDiv)
            return;
        var spacerHeight = spacerDiv.offsetHeight;
        if (newHeight < spacerHeight)
            return;
        spacerDiv.style.height = newHeight + "px";
        spacerDiv.style.minHeight = newHeight + "px";
    },
    _getCaption: function (tab) {
        var caption = tab.getAttribute('tab_caption');
        var rows = this._getRowCount(tab);
        if (!rows || rows == 0)
            return caption;
        var rows = formatNumber(rows);
        if (rows == 0)
            return caption;
        return new GwtMessage().getMessage("{0} ({1})", caption, rows);
    },
    _getRowCount: function (tab) {
        if (tab.firstChild && (tab.firstChild.tagName.toLowerCase() == "span") && tab.id && tab.id.endsWith("_tab")) {
            var rows = tab.getAttribute('tab_rows');
            if (!rows)
                return null;
            var span = tab.firstChild;
            if (!span)
                return null;
            var f;
            for (var i = 0; i < span.childNodes.length; i++) {
                f = span.childNodes[i];
                if (f.tagName.toLowerCase() == "form")
                    break;
            }
            if (!f || !f[rows])
                return 0;
            return f[rows].value;
        }
        var id = tab.id.substring(0, tab.id.length - 5) + "_table";
        var tab = gel(id);
        if (tab)
            return tab.getAttribute('total_rows');
        return "";
    },
    getChildNodesWithClass: function (p, className) {
        var children = p.childNodes;
        var answer = [];
        for (var i = 0, nodes = 0, n = children.length; i < n; i++) {
            var node = children[i];
            if (hasClassName(node, className))
                answer.push(node);
        }
        return answer;
    },
    log: function (msg) {
        jslog("GlideTabs2 " + msg);
    },
    type: 'GlideTabs2'
});
;
/*! RESOURCE: /scripts/classes/doctype/GlideTabs2Tab.js */
var GlideTabs2Tab = Class.create({
    initialize: function (parent, index, caption, classPrefix, isPreloaded) {
        var el;
        var tabs = isPreloaded ? $j('#tabs2_section').find('.tabs2_tab') : '';
        this.caption = caption.replace(/\s/g, "\u00a0");
        this.parent = parent;
        this.index = index;
        if (isPreloaded && tabs.length !== 0 && tabs[index]) {
            el = tabs[index];
            this.element = el;
            this.classPrefix = "tabs2";
            this.mandatorySpan = $j(el).find('[mandatory=true]')[0];
            this._createMandatorySpan(this.mandatorySpan);
        } else {
            this.element = cel("span");
            el = this.element;
            if (!classPrefix)
                this.classPrefix = "tabs2";
            else
                this.classPrefix = classPrefix;
            el.className = this.classPrefix + '_tab';
            el.tabIndex = "0";
            el.setAttribute('role', 'tab');
            this.mandatorySpan = this._createMandatorySpan();
            el.appendChild(this.mandatorySpan);
            var c = cel("span");
            c.className = "tab_caption_text";
            c.innerHTML = this.caption;
            el.appendChild(c);
        }
        if (isTextDirectionRTL() && (isMSIE6 || isMSIE7 || isMSIE8 || (isMSIE9 && !getTopWindow().document.getElementById('edge_west'))))
            $j(el).addClass('tabs2_tab_ie');
        Event.observe(el, 'click', this.onClick.bind(this));
        Event.observe(el, 'mouseover', this.onMouseOver.bind(this));
        Event.observe(el, 'mouseout', this.onMouseOut.bind(this));
    },
    setActive: function (yesNo) {
        if (yesNo) {
            this.element.setAttribute('tabindex', 0);
            addClassName(this.element, this.classPrefix + '_active');
            CustomEvent.fire("tab.activated", this.parent.className + (this.index + 1));
        } else {
            this.element.setAttribute('tabindex', -1);
            removeClassName(this.element, this.classPrefix + '_active');
        }
        this.element.setAttribute('aria-selected', yesNo);
        this.element.setAttribute('aria-controls', this.parent.tabIDs[this.index]);
        this.parent.tabs[this.index].setAttribute('aria-hidden', !yesNo);
    },
    showTab: function (yesNo) {
        var display = 'none';
        if (yesNo)
            display = '';
        this.element.style.display = display;
        var elementParent = this.element.parentElement;
        if (!elementParent || elementParent.tagName != 'H3')
            return;
        var elementParentSibling = elementParent.nextSibling;
        if (elementParentSibling && elementParentSibling.tagName == 'IMG')
            elementParentSibling.style.display = display;
    },
    updateCaption: function (caption) {
        this.caption = caption;
        this.getElement().getElementsByClassName('tab_caption_text')[0].innerHTML = this.caption;
    },
    isVisible: function () {
        return this.element.style.display == '';
    },
    getElement: function () {
        return this.element;
    },
    onClick: function () {
        this.parent.setActive(this.index);
    },
    onMouseOver: function () {
        addClassName(this.element, this.classPrefix + '_hover');
    },
    onMouseOut: function () {
        removeClassName(this.element, this.classPrefix + '_hover');
    },
    markAsComplete: function (yesNo) {
        this.mandatorySpan.style.visibility = yesNo ? 'hidden' : '';
        if (yesNo)
            this.element.removeAttribute('aria-describedby');
        else
            this.element.setAttribute('aria-describedby', 'tab2_section_mandatory_text_' + this.index);
        if (isDoctype())
            this.mandatorySpan.style.display = yesNo ? 'none' : 'inline-block';
    },
    _createMandatorySpan: function (element) {
        var answer = element || cel("span");
        answer.style.marginRight = '2px';
        answer.style.visibility = 'hidden';
        if (isDoctype()) {
            answer.setAttribute('mandatory', 'true');
            answer.setAttribute('aria-hidden', 'true');
            answer.className = 'label_description';
            answer.innerHTML = '*';
            answer.style.display = 'none';
        } else {
            answer.className = 'mandatory';
            var img = cel("img", answer);
            img.src = 'images/s.gifx';
            img.alt = '';
            img.style.width = '4px';
            img.style.height = '12px';
            img.style.margin = '0px';
        }
        return answer;
    }
});
;
/*! RESOURCE: /scripts/classes/GlideTabs2State.js */
var GlideTabs2State = Class.create({
    initialize: function (name) {
        this.name = name;
        this.cj = new CookieJar();
    },
    get: function () {
        return this.cj.get(this.name);
    },
    set: function (value) {
        this.cj.put(this.name, value);
    },
    type: 'GlideTabs2State'
});
;
/*! RESOURCE: /scripts/doctype/tabs2_14.js */
(function () {
    "use strict";
    window.g_tabs2Sections = null;
    window.g_tabs2List = null;
    function tabs2Init() {
        initFormTabs();
    }
    function initFormTabs() {
        var f = document.forms[0];
        window.g_tabs2Sections = new GlideTabs2('tabs2_section', f, 1, undefined, true);
        initTabs(window.g_tabs2Sections);
        initVariablesTabs();
    }
    function initRelatedListTabs() {
        var f = $j('#related_lists_wrapper')[0];
        window.g_tabs2List = new GlideTabs2('tabs2_list', f, 0);
        initTabs(window.g_tabs2List);
        for (var i = 0; i < hiddenOnLoad.length; i++)
            hideTab(hiddenOnLoad[i]);
        for (var i = 0; i < showOnLoad.length; i++)
            showTab(showOnLoad[i]);
        showOnLoad = [];
        hiddenOnLoad = [];
    }
    function initVariablesTabs() {
        var f = $j('[id^="var_container"]');
        for (var i = 0, l = f.length; l > i; i++) {
            var varTabs = new GlideTabs2("tabs2_vars", f[i], 0);
            initTabs(varTabs);
            varTabs.deactivate();
        }
    }
    function initTabs(tabSet) {
        if (window.g_tabs_print) {
            tabSet.deactivate();
            return;
        }
        if (window.g_tabs_preference)
            tabSet.activate();
        else
            tabSet.deactivate();
        if (!hasTabs(window.g_tabs2Sections) && !hasTabs(window.g_tabs2List))
            tabs2ToggleDisable();
    }
    function hasTabs(tabSet) {
        if (tabSet === null)
            return true;
        return tabSet.hasTabs();
    }
    function tabs2ToggleDisable() {
    }
    function tabs2Toggle() {
        window.g_tabs_preference = !window.g_tabs_preference;
        CustomEvent.fireAll('tabbed', window.g_tabs_preference);
    }
    CustomEvent.observe('tabbed', function (trueFalse) {
        window.NOW.tabbed = trueFalse;
        window.g_tabs_preference = window.NOW.tabbed;
        setPreference('tabbed.forms', window.g_tabs_preference);
        setTabbed();
    })
    function setTabbed() {
        if (window.g_tabs_preference) {
            window.g_tabs2Sections.activate();
            if (window.g_tabs2List)
                window.g_tabs2List.activate();
            CustomEvent.fire('tabs.enable');
        } else {
            window.g_tabs2Sections.deactivate();
            if (window.g_tabs2List)
                window.g_tabs2List.deactivate();
            CustomEvent.fire('tabs.disable');
        }
    }
    window.tabs2Init = tabs2Init;
    window.tabs2Toggle = tabs2Toggle;
    CustomEvent.observe('related_lists.ready', initRelatedListTabs);
    var hiddenOnLoad = [];
    var showOnLoad = [];
    CustomEvent.observe('related_lists.show', function (listTableName) {
        if (window.NOW.g_relatedLists) {
            if (!window.NOW.g_relatedLists.loaded) {
                showOnLoad.push(listTableName);
                return;
            }
        }
        if (!window.g_tabs2List) {
            if (showOnLoad.indexOf(listTableName) == -1)
                showOnLoad.push(listTableName);
            return;
        }
        showTab(listTableName);
    });
    CustomEvent.observe('related_lists.hide', function (listTableName) {
        if (window.NOW.g_relatedLists) {
            if (!window.NOW.g_relatedLists.loaded) {
                hiddenOnLoad.push(listTableName);
                return;
            }
        }
        if (!window.g_tabs2List) {
            if (hiddenOnLoad.indexOf(listTableName) == -1)
                hiddenOnLoad.push(listTableName);
            return;
        }
        hideTab(listTableName);
    });
    function showTab(listTableName) {
        var relatedListID = g_form._getRelatedListID(listTableName);
        window.g_tabs2List.showTabByID(relatedListID);
        if (!window.g_tabs2List.isActivated())
            show(relatedListID);
        if (window.NOW.g_relatedLists)
            if (window.NOW.g_relatedLists.loaded)
                CustomEvent.fire('calculate_fixed_headers');
    }
    function hideTab(listTableName) {
        var relatedListID = g_form._getRelatedListID(listTableName);
        window.g_tabs2List.hideTabByID(relatedListID);
        if (!g_tabs2List.isActivated())
            hide(relatedListID);
    }
})();
;
/*! RESOURCE: /scripts/annotations_toggle.js */
var SN = SN || {};
SN.formAnnotations = {
    preference: false,
    annotations: null,
    hide: function () {
        SN.formAnnotations.annotations.fadeOut();
        SN.formAnnotations.preference = false;
    },
    show: function () {
        SN.formAnnotations.annotations.fadeIn();
        SN.formAnnotations.preference = true;
    },
    toggle: function () {
        if (SN.formAnnotations.preference)
            SN.formAnnotations.hide();
        else
            SN.formAnnotations.show();
        setPreference('glide.ui.show_annotations', SN.formAnnotations.preference);
    },
    toggleFromInfoMsg: function () {
        SN.formAnnotations.toggle();
        GlideUI.get().clearOutputMessages();
    },
    init: function () {
        var selectors = ['.annotation-row[data-annotation-type="Info Box Blue"]',
            '.annotation-row[data-annotation-type="Info Box Red"]',
            '.annotation-row[data-annotation-type="Section Details"]',
            '.annotation-row[data-annotation-type="Text"]'];
        SN.formAnnotations.annotations = $j(selectors.join(','));
        var $annotationButton = $j('#header_toggle_annotations');
        if (SN.formAnnotations.annotations.length) {
            $annotationButton.show().click(SN.formAnnotations.toggle);
            if (!SN.formAnnotations.preference && SN.formAnnotations.infoPreference) {
                SN.formAnnotations.addHiddenAnnotationMessage();
                $j("#info_toggle_annotations").show().click(SN.formAnnotations.toggleFromInfoMsg);
            }
        } else {
            $annotationButton.prop('disabled', true)
            var $annotationTooltip = $annotationButton.closest('.annotation-tooltip');
            $annotationTooltip.attr('title', $annotationTooltip.attr('data-title-disabled'));
        }
        if (SN.formAnnotations.preference)
            SN.formAnnotations.show();
    },
    setInfoPref: function () {
        setPreference("glide.ui.annotations.show_hidden_msg", "false");
        GlideUI.get().clearOutputMessages();
    },
    addHiddenAnnotationMessage: function () {
        var msg = getMessage('This form has annotations - click');
        msg += ' <span id="info_toggle_annotations" tabindex="0" class="icon-button icon-help sn-cloak" title="Toggle annotations on / off" style="display: inline-block;color:#678;cursor:pointer;font-size:1.4em"></span> ';
        msg += getMessage("to toggle them");
        msg += ' - (<span style="text-decoration:underline;cursor:pointer;" onclick="SN.formAnnotations.setInfoPref()">';
        msg += getMessage("click here");
        msg += '</span> ';
        msg += getMessage("to never show this again");
        msg += ')';
        g_form.addInfoMessage(msg);
    }
}
    ;
/*! RESOURCE: /scripts/lib/jquery2_includes.js */
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function () {
    if (!window.jQuery)
        return;
    if (!window.$j_glide)
        window.$j = jQuery.noConflict();
    if (window.$j_glide && jQuery != window.$j_glide) {
        if (window.$j_glide)
            jQuery.noConflict(true);
        window.$j = window.$j_glide;
    }
})();
;
/*! RESOURCE: /scripts/lib/jquery/jquery-2.2.3.min.js */
/*! jQuery v2.2.3 | (c) jQuery Foundation | jquery.org/license */
!function (a, b) { "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) { if (!a.document) throw new Error("jQuery requires a window with a document"); return b(a) } : b(a) }("undefined" != typeof window ? window : this, function (a, b) {
    var c = [], d = a.document, e = c.slice, f = c.concat, g = c.push, h = c.indexOf, i = {}, j = i.toString, k = i.hasOwnProperty, l = {}, m = "2.2.3", n = function (a, b) { return new n.fn.init(a, b) }, o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, p = /^-ms-/, q = /-([\da-z])/gi, r = function (a, b) { return b.toUpperCase() }; n.fn = n.prototype = { jquery: m, constructor: n, selector: "", length: 0, toArray: function () { return e.call(this) }, get: function (a) { return null != a ? 0 > a ? this[a + this.length] : this[a] : e.call(this) }, pushStack: function (a) { var b = n.merge(this.constructor(), a); return b.prevObject = this, b.context = this.context, b }, each: function (a) { return n.each(this, a) }, map: function (a) { return this.pushStack(n.map(this, function (b, c) { return a.call(b, c, b) })) }, slice: function () { return this.pushStack(e.apply(this, arguments)) }, first: function () { return this.eq(0) }, last: function () { return this.eq(-1) }, eq: function (a) { var b = this.length, c = +a + (0 > a ? b : 0); return this.pushStack(c >= 0 && b > c ? [this[c]] : []) }, end: function () { return this.prevObject || this.constructor() }, push: g, sort: c.sort, splice: c.splice }, n.extend = n.fn.extend = function () { var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1; for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)if (null != (a = arguments[h])) for (b in a) c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d)); return g }, n.extend({ expando: "jQuery" + (m + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (a) { throw new Error(a) }, noop: function () { }, isFunction: function (a) { return "function" === n.type(a) }, isArray: Array.isArray, isWindow: function (a) { return null != a && a === a.window }, isNumeric: function (a) { var b = a && a.toString(); return !n.isArray(a) && b - parseFloat(b) + 1 >= 0 }, isPlainObject: function (a) { var b; if ("object" !== n.type(a) || a.nodeType || n.isWindow(a)) return !1; if (a.constructor && !k.call(a, "constructor") && !k.call(a.constructor.prototype || {}, "isPrototypeOf")) return !1; for (b in a); return void 0 === b || k.call(a, b) }, isEmptyObject: function (a) { var b; for (b in a) return !1; return !0 }, type: function (a) { return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? i[j.call(a)] || "object" : typeof a }, globalEval: function (a) { var b, c = eval; a = n.trim(a), a && (1 === a.indexOf("use strict") ? (b = d.createElement("script"), b.text = a, d.head.appendChild(b).parentNode.removeChild(b)) : c(a)) }, camelCase: function (a) { return a.replace(p, "ms-").replace(q, r) }, nodeName: function (a, b) { return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase() }, each: function (a, b) { var c, d = 0; if (s(a)) { for (c = a.length; c > d; d++)if (b.call(a[d], d, a[d]) === !1) break } else for (d in a) if (b.call(a[d], d, a[d]) === !1) break; return a }, trim: function (a) { return null == a ? "" : (a + "").replace(o, "") }, makeArray: function (a, b) { var c = b || []; return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : g.call(c, a)), c }, inArray: function (a, b, c) { return null == b ? -1 : h.call(b, a, c) }, merge: function (a, b) { for (var c = +b.length, d = 0, e = a.length; c > d; d++)a[e++] = b[d]; return a.length = e, a }, grep: function (a, b, c) { for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++)d = !b(a[f], f), d !== h && e.push(a[f]); return e }, map: function (a, b, c) { var d, e, g = 0, h = []; if (s(a)) for (d = a.length; d > g; g++)e = b(a[g], g, c), null != e && h.push(e); else for (g in a) e = b(a[g], g, c), null != e && h.push(e); return f.apply([], h) }, guid: 1, proxy: function (a, b) { var c, d, f; return "string" == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (d = e.call(arguments, 2), f = function () { return a.apply(b || this, d.concat(e.call(arguments))) }, f.guid = a.guid = a.guid || n.guid++, f) : void 0 }, now: Date.now, support: l }), "function" == typeof Symbol && (n.fn[Symbol.iterator] = c[Symbol.iterator]), n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (a, b) { i["[object " + b + "]"] = b.toLowerCase() }); function s(a) { var b = !!a && "length" in a && a.length, c = n.type(a); return "function" === c || n.isWindow(a) ? !1 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a } var t = function (a) { var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date, v = a.document, w = 0, x = 0, y = ga(), z = ga(), A = ga(), B = function (a, b) { return a === b && (l = !0), 0 }, C = 1 << 31, D = {}.hasOwnProperty, E = [], F = E.pop, G = E.push, H = E.push, I = E.slice, J = function (a, b) { for (var c = 0, d = a.length; d > c; c++)if (a[c] === b) return c; return -1 }, K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", L = "[\\x20\\t\\r\\n\\f]", M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", N = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + M + "))|)" + L + "*\\]", O = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + N + ")*)|.*)\\)|)", P = new RegExp(L + "+", "g"), Q = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"), R = new RegExp("^" + L + "*," + L + "*"), S = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"), T = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"), U = new RegExp(O), V = new RegExp("^" + M + "$"), W = { ID: new RegExp("^#(" + M + ")"), CLASS: new RegExp("^\\.(" + M + ")"), TAG: new RegExp("^(" + M + "|[*])"), ATTR: new RegExp("^" + N), PSEUDO: new RegExp("^" + O), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"), bool: new RegExp("^(?:" + K + ")$", "i"), needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i") }, X = /^(?:input|select|textarea|button)$/i, Y = /^h\d$/i, Z = /^[^{]+\{\s*\[native \w/, $ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, _ = /[+~]/, aa = /'|\\/g, ba = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"), ca = function (a, b, c) { var d = "0x" + b - 65536; return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320) }, da = function () { m() }; try { H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType } catch (ea) { H = { apply: E.length ? function (a, b) { G.apply(a, I.call(b)) } : function (a, b) { var c = a.length, d = 0; while (a[c++] = b[d++]); a.length = c - 1 } } } function fa(a, b, d, e) { var f, h, j, k, l, o, r, s, w = b && b.ownerDocument, x = b ? b.nodeType : 9; if (d = d || [], "string" != typeof a || !a || 1 !== x && 9 !== x && 11 !== x) return d; if (!e && ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, p)) { if (11 !== x && (o = $.exec(a))) if (f = o[1]) { if (9 === x) { if (!(j = b.getElementById(f))) return d; if (j.id === f) return d.push(j), d } else if (w && (j = w.getElementById(f)) && t(b, j) && j.id === f) return d.push(j), d } else { if (o[2]) return H.apply(d, b.getElementsByTagName(a)), d; if ((f = o[3]) && c.getElementsByClassName && b.getElementsByClassName) return H.apply(d, b.getElementsByClassName(f)), d } if (c.qsa && !A[a + " "] && (!q || !q.test(a))) { if (1 !== x) w = b, s = a; else if ("object" !== b.nodeName.toLowerCase()) { (k = b.getAttribute("id")) ? k = k.replace(aa, "\\$&") : b.setAttribute("id", k = u), r = g(a), h = r.length, l = V.test(k) ? "#" + k : "[id='" + k + "']"; while (h--) r[h] = l + " " + qa(r[h]); s = r.join(","), w = _.test(a) && oa(b.parentNode) || b } if (s) try { return H.apply(d, w.querySelectorAll(s)), d } catch (y) { } finally { k === u && b.removeAttribute("id") } } } return i(a.replace(Q, "$1"), b, d, e) } function ga() { var a = []; function b(c, e) { return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e } return b } function ha(a) { return a[u] = !0, a } function ia(a) { var b = n.createElement("div"); try { return !!a(b) } catch (c) { return !1 } finally { b.parentNode && b.parentNode.removeChild(b), b = null } } function ja(a, b) { var c = a.split("|"), e = c.length; while (e--) d.attrHandle[c[e]] = b } function ka(a, b) { var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C); if (d) return d; if (c) while (c = c.nextSibling) if (c === b) return -1; return a ? 1 : -1 } function la(a) { return function (b) { var c = b.nodeName.toLowerCase(); return "input" === c && b.type === a } } function ma(a) { return function (b) { var c = b.nodeName.toLowerCase(); return ("input" === c || "button" === c) && b.type === a } } function na(a) { return ha(function (b) { return b = +b, ha(function (c, d) { var e, f = a([], c.length, b), g = f.length; while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e])) }) }) } function oa(a) { return a && "undefined" != typeof a.getElementsByTagName && a } c = fa.support = {}, f = fa.isXML = function (a) { var b = a && (a.ownerDocument || a).documentElement; return b ? "HTML" !== b.nodeName : !1 }, m = fa.setDocument = function (a) { var b, e, g = a ? a.ownerDocument || a : v; return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = n.documentElement, p = !f(n), (e = n.defaultView) && e.top !== e && (e.addEventListener ? e.addEventListener("unload", da, !1) : e.attachEvent && e.attachEvent("onunload", da)), c.attributes = ia(function (a) { return a.className = "i", !a.getAttribute("className") }), c.getElementsByTagName = ia(function (a) { return a.appendChild(n.createComment("")), !a.getElementsByTagName("*").length }), c.getElementsByClassName = Z.test(n.getElementsByClassName), c.getById = ia(function (a) { return o.appendChild(a).id = u, !n.getElementsByName || !n.getElementsByName(u).length }), c.getById ? (d.find.ID = function (a, b) { if ("undefined" != typeof b.getElementById && p) { var c = b.getElementById(a); return c ? [c] : [] } }, d.filter.ID = function (a) { var b = a.replace(ba, ca); return function (a) { return a.getAttribute("id") === b } }) : (delete d.find.ID, d.filter.ID = function (a) { var b = a.replace(ba, ca); return function (a) { var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id"); return c && c.value === b } }), d.find.TAG = c.getElementsByTagName ? function (a, b) { return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0 } : function (a, b) { var c, d = [], e = 0, f = b.getElementsByTagName(a); if ("*" === a) { while (c = f[e++]) 1 === c.nodeType && d.push(c); return d } return f }, d.find.CLASS = c.getElementsByClassName && function (a, b) { return "undefined" != typeof b.getElementsByClassName && p ? b.getElementsByClassName(a) : void 0 }, r = [], q = [], (c.qsa = Z.test(n.querySelectorAll)) && (ia(function (a) { o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\r\\' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]") }), ia(function (a) { var b = n.createElement("input"); b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:") })), (c.matchesSelector = Z.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ia(function (a) { c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", O) }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = Z.test(o.compareDocumentPosition), t = b || Z.test(o.contains) ? function (a, b) { var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode; return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d))) } : function (a, b) { if (b) while (b = b.parentNode) if (b === a) return !0; return !1 }, B = b ? function (a, b) { if (a === b) return l = !0, 0; var d = !a.compareDocumentPosition - !b.compareDocumentPosition; return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === n || a.ownerDocument === v && t(v, a) ? -1 : b === n || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1) } : function (a, b) { if (a === b) return l = !0, 0; var c, d = 0, e = a.parentNode, f = b.parentNode, g = [a], h = [b]; if (!e || !f) return a === n ? -1 : b === n ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0; if (e === f) return ka(a, b); c = a; while (c = c.parentNode) g.unshift(c); c = b; while (c = c.parentNode) h.unshift(c); while (g[d] === h[d]) d++; return d ? ka(g[d], h[d]) : g[d] === v ? -1 : h[d] === v ? 1 : 0 }, n) : n }, fa.matches = function (a, b) { return fa(a, null, null, b) }, fa.matchesSelector = function (a, b) { if ((a.ownerDocument || a) !== n && m(a), b = b.replace(T, "='$1']"), c.matchesSelector && p && !A[b + " "] && (!r || !r.test(b)) && (!q || !q.test(b))) try { var d = s.call(a, b); if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d } catch (e) { } return fa(b, n, null, [a]).length > 0 }, fa.contains = function (a, b) { return (a.ownerDocument || a) !== n && m(a), t(a, b) }, fa.attr = function (a, b) { (a.ownerDocument || a) !== n && m(a); var e = d.attrHandle[b.toLowerCase()], f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0; return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null }, fa.error = function (a) { throw new Error("Syntax error, unrecognized expression: " + a) }, fa.uniqueSort = function (a) { var b, d = [], e = 0, f = 0; if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) { while (b = a[f++]) b === a[f] && (e = d.push(f)); while (e--) a.splice(d[e], 1) } return k = null, a }, e = fa.getText = function (a) { var b, c = "", d = 0, f = a.nodeType; if (f) { if (1 === f || 9 === f || 11 === f) { if ("string" == typeof a.textContent) return a.textContent; for (a = a.firstChild; a; a = a.nextSibling)c += e(a) } else if (3 === f || 4 === f) return a.nodeValue } else while (b = a[d++]) c += e(b); return c }, d = fa.selectors = { cacheLength: 50, createPseudo: ha, match: W, attrHandle: {}, find: {}, relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } }, preFilter: { ATTR: function (a) { return a[1] = a[1].replace(ba, ca), a[3] = (a[3] || a[4] || a[5] || "").replace(ba, ca), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4) }, CHILD: function (a) { return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || fa.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && fa.error(a[0]), a }, PSEUDO: function (a) { var b, c = !a[6] && a[2]; return W.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && U.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3)) } }, filter: { TAG: function (a) { var b = a.replace(ba, ca).toLowerCase(); return "*" === a ? function () { return !0 } : function (a) { return a.nodeName && a.nodeName.toLowerCase() === b } }, CLASS: function (a) { var b = y[a + " "]; return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function (a) { return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "") }) }, ATTR: function (a, b, c) { return function (d) { var e = fa.attr(d, a); return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(P, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0 } }, CHILD: function (a, b, c, d, e) { var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b; return 1 === d && 0 === e ? function (a) { return !!a.parentNode } : function (b, c, i) { var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h, t = !1; if (q) { if (f) { while (p) { m = b; while (m = m[p]) if (h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) return !1; o = p = "only" === a && !o && "nextSibling" } return !0 } if (o = [g ? q.firstChild : q.lastChild], g && s) { m = q, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n && j[2], m = n && q.childNodes[n]; while (m = ++n && m && m[p] || (t = n = 0) || o.pop()) if (1 === m.nodeType && ++t && m === b) { k[a] = [w, n, t]; break } } else if (s && (m = b, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n), t === !1) while (m = ++n && m && m[p] || (t = n = 0) || o.pop()) if ((h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) && ++t && (s && (l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), k[a] = [w, t]), m === b)) break; return t -= e, t === d || t % d === 0 && t / d >= 0 } } }, PSEUDO: function (a, b) { var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || fa.error("unsupported pseudo: " + a); return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ha(function (a, c) { var d, f = e(a, b), g = f.length; while (g--) d = J(a, f[g]), a[d] = !(c[d] = f[g]) }) : function (a) { return e(a, 0, c) }) : e } }, pseudos: { not: ha(function (a) { var b = [], c = [], d = h(a.replace(Q, "$1")); return d[u] ? ha(function (a, b, c, e) { var f, g = d(a, null, e, []), h = a.length; while (h--) (f = g[h]) && (a[h] = !(b[h] = f)) }) : function (a, e, f) { return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop() } }), has: ha(function (a) { return function (b) { return fa(a, b).length > 0 } }), contains: ha(function (a) { return a = a.replace(ba, ca), function (b) { return (b.textContent || b.innerText || e(b)).indexOf(a) > -1 } }), lang: ha(function (a) { return V.test(a || "") || fa.error("unsupported lang: " + a), a = a.replace(ba, ca).toLowerCase(), function (b) { var c; do if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType); return !1 } }), target: function (b) { var c = a.location && a.location.hash; return c && c.slice(1) === b.id }, root: function (a) { return a === o }, focus: function (a) { return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex) }, enabled: function (a) { return a.disabled === !1 }, disabled: function (a) { return a.disabled === !0 }, checked: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && !!a.checked || "option" === b && !!a.selected }, selected: function (a) { return a.parentNode && a.parentNode.selectedIndex, a.selected === !0 }, empty: function (a) { for (a = a.firstChild; a; a = a.nextSibling)if (a.nodeType < 6) return !1; return !0 }, parent: function (a) { return !d.pseudos.empty(a) }, header: function (a) { return Y.test(a.nodeName) }, input: function (a) { return X.test(a.nodeName) }, button: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && "button" === a.type || "button" === b }, text: function (a) { var b; return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase()) }, first: na(function () { return [0] }), last: na(function (a, b) { return [b - 1] }), eq: na(function (a, b, c) { return [0 > c ? c + b : c] }), even: na(function (a, b) { for (var c = 0; b > c; c += 2)a.push(c); return a }), odd: na(function (a, b) { for (var c = 1; b > c; c += 2)a.push(c); return a }), lt: na(function (a, b, c) { for (var d = 0 > c ? c + b : c; --d >= 0;)a.push(d); return a }), gt: na(function (a, b, c) { for (var d = 0 > c ? c + b : c; ++d < b;)a.push(d); return a }) } }, d.pseudos.nth = d.pseudos.eq; for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }) d.pseudos[b] = la(b); for (b in { submit: !0, reset: !0 }) d.pseudos[b] = ma(b); function pa() { } pa.prototype = d.filters = d.pseudos, d.setFilters = new pa, g = fa.tokenize = function (a, b) { var c, e, f, g, h, i, j, k = z[a + " "]; if (k) return b ? 0 : k.slice(0); h = a, i = [], j = d.preFilter; while (h) { c && !(e = R.exec(h)) || (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = S.exec(h)) && (c = e.shift(), f.push({ value: c, type: e[0].replace(Q, " ") }), h = h.slice(c.length)); for (g in d.filter) !(e = W[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({ value: c, type: g, matches: e }), h = h.slice(c.length)); if (!c) break } return b ? h.length : h ? fa.error(a) : z(a, i).slice(0) }; function qa(a) { for (var b = 0, c = a.length, d = ""; c > b; b++)d += a[b].value; return d } function ra(a, b, c) { var d = b.dir, e = c && "parentNode" === d, f = x++; return b.first ? function (b, c, f) { while (b = b[d]) if (1 === b.nodeType || e) return a(b, c, f) } : function (b, c, g) { var h, i, j, k = [w, f]; if (g) { while (b = b[d]) if ((1 === b.nodeType || e) && a(b, c, g)) return !0 } else while (b = b[d]) if (1 === b.nodeType || e) { if (j = b[u] || (b[u] = {}), i = j[b.uniqueID] || (j[b.uniqueID] = {}), (h = i[d]) && h[0] === w && h[1] === f) return k[2] = h[2]; if (i[d] = k, k[2] = a(b, c, g)) return !0 } } } function sa(a) { return a.length > 1 ? function (b, c, d) { var e = a.length; while (e--) if (!a[e](b, c, d)) return !1; return !0 } : a[0] } function ta(a, b, c) { for (var d = 0, e = b.length; e > d; d++)fa(a, b[d], c); return c } function ua(a, b, c, d, e) { for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (c && !c(f, d, e) || (g.push(f), j && b.push(h))); return g } function va(a, b, c, d, e, f) { return d && !d[u] && (d = va(d)), e && !e[u] && (e = va(e, f)), ha(function (f, g, h, i) { var j, k, l, m = [], n = [], o = g.length, p = f || ta(b || "*", h.nodeType ? [h] : h, []), q = !a || !f && b ? p : ua(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q; if (c && c(q, r, h, i), d) { j = ua(r, n), d(j, [], h, i), k = j.length; while (k--) (l = j[k]) && (r[n[k]] = !(q[n[k]] = l)) } if (f) { if (e || a) { if (e) { j = [], k = r.length; while (k--) (l = r[k]) && j.push(q[k] = l); e(null, r = [], j, i) } k = r.length; while (k--) (l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l)) } } else r = ua(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r) }) } function wa(a) { for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = ra(function (a) { return a === b }, h, !0), l = ra(function (a) { return J(b, a) > -1 }, h, !0), m = [function (a, c, d) { var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d)); return b = null, e }]; f > i; i++)if (c = d.relative[a[i].type]) m = [ra(sa(m), c)]; else { if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) { for (e = ++i; f > e; e++)if (d.relative[a[e].type]) break; return va(i > 1 && sa(m), i > 1 && qa(a.slice(0, i - 1).concat({ value: " " === a[i - 2].type ? "*" : "" })).replace(Q, "$1"), c, e > i && wa(a.slice(i, e)), f > e && wa(a = a.slice(e)), f > e && qa(a)) } m.push(c) } return sa(m) } function xa(a, b) { var c = b.length > 0, e = a.length > 0, f = function (f, g, h, i, k) { var l, o, q, r = 0, s = "0", t = f && [], u = [], v = j, x = f || e && d.find.TAG("*", k), y = w += null == v ? 1 : Math.random() || .1, z = x.length; for (k && (j = g === n || g || k); s !== z && null != (l = x[s]); s++) { if (e && l) { o = 0, g || l.ownerDocument === n || (m(l), h = !p); while (q = a[o++]) if (q(l, g || n, h)) { i.push(l); break } k && (w = y) } c && ((l = !q && l) && r--, f && t.push(l)) } if (r += s, c && s !== r) { o = 0; while (q = b[o++]) q(t, u, g, h); if (f) { if (r > 0) while (s--) t[s] || u[s] || (u[s] = F.call(i)); u = ua(u) } H.apply(i, u), k && !f && u.length > 0 && r + b.length > 1 && fa.uniqueSort(i) } return k && (w = y, j = v), t }; return c ? ha(f) : f } return h = fa.compile = function (a, b) { var c, d = [], e = [], f = A[a + " "]; if (!f) { b || (b = g(a)), c = b.length; while (c--) f = wa(b[c]), f[u] ? d.push(f) : e.push(f); f = A(a, xa(e, d)), f.selector = a } return f }, i = fa.select = function (a, b, e, f) { var i, j, k, l, m, n = "function" == typeof a && a, o = !f && g(a = n.selector || a); if (e = e || [], 1 === o.length) { if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) { if (b = (d.find.ID(k.matches[0].replace(ba, ca), b) || [])[0], !b) return e; n && (b = b.parentNode), a = a.slice(j.shift().value.length) } i = W.needsContext.test(a) ? 0 : j.length; while (i--) { if (k = j[i], d.relative[l = k.type]) break; if ((m = d.find[l]) && (f = m(k.matches[0].replace(ba, ca), _.test(j[0].type) && oa(b.parentNode) || b))) { if (j.splice(i, 1), a = f.length && qa(j), !a) return H.apply(e, f), e; break } } } return (n || h(a, o))(f, b, !p, e, !b || _.test(a) && oa(b.parentNode) || b), e }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ia(function (a) { return 1 & a.compareDocumentPosition(n.createElement("div")) }), ia(function (a) { return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href") }) || ja("type|href|height|width", function (a, b, c) { return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2) }), c.attributes && ia(function (a) { return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value") }) || ja("value", function (a, b, c) { return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue }), ia(function (a) { return null == a.getAttribute("disabled") }) || ja(K, function (a, b, c) { var d; return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null }), fa }(a); n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.uniqueSort = n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains; var u = function (a, b, c) { var d = [], e = void 0 !== c; while ((a = a[b]) && 9 !== a.nodeType) if (1 === a.nodeType) { if (e && n(a).is(c)) break; d.push(a) } return d }, v = function (a, b) { for (var c = []; a; a = a.nextSibling)1 === a.nodeType && a !== b && c.push(a); return c }, w = n.expr.match.needsContext, x = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/, y = /^.[^:#\[\.,]*$/; function z(a, b, c) { if (n.isFunction(b)) return n.grep(a, function (a, d) { return !!b.call(a, d, a) !== c }); if (b.nodeType) return n.grep(a, function (a) { return a === b !== c }); if ("string" == typeof b) { if (y.test(b)) return n.filter(b, a, c); b = n.filter(b, a) } return n.grep(a, function (a) { return h.call(b, a) > -1 !== c }) } n.filter = function (a, b, c) { var d = b[0]; return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function (a) { return 1 === a.nodeType })) }, n.fn.extend({ find: function (a) { var b, c = this.length, d = [], e = this; if ("string" != typeof a) return this.pushStack(n(a).filter(function () { for (b = 0; c > b; b++)if (n.contains(e[b], this)) return !0 })); for (b = 0; c > b; b++)n.find(a, e[b], d); return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d }, filter: function (a) { return this.pushStack(z(this, a || [], !1)) }, not: function (a) { return this.pushStack(z(this, a || [], !0)) }, is: function (a) { return !!z(this, "string" == typeof a && w.test(a) ? n(a) : a || [], !1).length } }); var A, B = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, C = n.fn.init = function (a, b, c) { var e, f; if (!a) return this; if (c = c || A, "string" == typeof a) { if (e = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : B.exec(a), !e || !e[1] && b) return !b || b.jquery ? (b || c).find(a) : this.constructor(b).find(a); if (e[1]) { if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(e[1], b && b.nodeType ? b.ownerDocument || b : d, !0)), x.test(e[1]) && n.isPlainObject(b)) for (e in b) n.isFunction(this[e]) ? this[e](b[e]) : this.attr(e, b[e]); return this } return f = d.getElementById(e[2]), f && f.parentNode && (this.length = 1, this[0] = f), this.context = d, this.selector = a, this } return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? void 0 !== c.ready ? c.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this)) }; C.prototype = n.fn, A = n(d); var D = /^(?:parents|prev(?:Until|All))/, E = { children: !0, contents: !0, next: !0, prev: !0 }; n.fn.extend({ has: function (a) { var b = n(a, this), c = b.length; return this.filter(function () { for (var a = 0; c > a; a++)if (n.contains(this, b[a])) return !0 }) }, closest: function (a, b) { for (var c, d = 0, e = this.length, f = [], g = w.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++)for (c = this[d]; c && c !== b; c = c.parentNode)if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) { f.push(c); break } return this.pushStack(f.length > 1 ? n.uniqueSort(f) : f) }, index: function (a) { return a ? "string" == typeof a ? h.call(n(a), this[0]) : h.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1 }, add: function (a, b) { return this.pushStack(n.uniqueSort(n.merge(this.get(), n(a, b)))) }, addBack: function (a) { return this.add(null == a ? this.prevObject : this.prevObject.filter(a)) } }); function F(a, b) { while ((a = a[b]) && 1 !== a.nodeType); return a } n.each({ parent: function (a) { var b = a.parentNode; return b && 11 !== b.nodeType ? b : null }, parents: function (a) { return u(a, "parentNode") }, parentsUntil: function (a, b, c) { return u(a, "parentNode", c) }, next: function (a) { return F(a, "nextSibling") }, prev: function (a) { return F(a, "previousSibling") }, nextAll: function (a) { return u(a, "nextSibling") }, prevAll: function (a) { return u(a, "previousSibling") }, nextUntil: function (a, b, c) { return u(a, "nextSibling", c) }, prevUntil: function (a, b, c) { return u(a, "previousSibling", c) }, siblings: function (a) { return v((a.parentNode || {}).firstChild, a) }, children: function (a) { return v(a.firstChild) }, contents: function (a) { return a.contentDocument || n.merge([], a.childNodes) } }, function (a, b) { n.fn[a] = function (c, d) { var e = n.map(this, b, c); return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (E[a] || n.uniqueSort(e), D.test(a) && e.reverse()), this.pushStack(e) } }); var G = /\S+/g; function H(a) { var b = {}; return n.each(a.match(G) || [], function (a, c) { b[c] = !0 }), b } n.Callbacks = function (a) { a = "string" == typeof a ? H(a) : n.extend({}, a); var b, c, d, e, f = [], g = [], h = -1, i = function () { for (e = a.once, d = b = !0; g.length; h = -1) { c = g.shift(); while (++h < f.length) f[h].apply(c[0], c[1]) === !1 && a.stopOnFalse && (h = f.length, c = !1) } a.memory || (c = !1), b = !1, e && (f = c ? [] : "") }, j = { add: function () { return f && (c && !b && (h = f.length - 1, g.push(c)), function d(b) { n.each(b, function (b, c) { n.isFunction(c) ? a.unique && j.has(c) || f.push(c) : c && c.length && "string" !== n.type(c) && d(c) }) }(arguments), c && !b && i()), this }, remove: function () { return n.each(arguments, function (a, b) { var c; while ((c = n.inArray(b, f, c)) > -1) f.splice(c, 1), h >= c && h-- }), this }, has: function (a) { return a ? n.inArray(a, f) > -1 : f.length > 0 }, empty: function () { return f && (f = []), this }, disable: function () { return e = g = [], f = c = "", this }, disabled: function () { return !f }, lock: function () { return e = g = [], c || (f = c = ""), this }, locked: function () { return !!e }, fireWith: function (a, c) { return e || (c = c || [], c = [a, c.slice ? c.slice() : c], g.push(c), b || i()), this }, fire: function () { return j.fireWith(this, arguments), this }, fired: function () { return !!d } }; return j }, n.extend({ Deferred: function (a) { var b = [["resolve", "done", n.Callbacks("once memory"), "resolved"], ["reject", "fail", n.Callbacks("once memory"), "rejected"], ["notify", "progress", n.Callbacks("memory")]], c = "pending", d = { state: function () { return c }, always: function () { return e.done(arguments).fail(arguments), this }, then: function () { var a = arguments; return n.Deferred(function (c) { n.each(b, function (b, f) { var g = n.isFunction(a[b]) && a[b]; e[f[1]](function () { var a = g && g.apply(this, arguments); a && n.isFunction(a.promise) ? a.promise().progress(c.notify).done(c.resolve).fail(c.reject) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments) }) }), a = null }).promise() }, promise: function (a) { return null != a ? n.extend(a, d) : d } }, e = {}; return d.pipe = d.then, n.each(b, function (a, f) { var g = f[2], h = f[3]; d[f[1]] = g.add, h && g.add(function () { c = h }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () { return e[f[0] + "With"](this === e ? d : this, arguments), this }, e[f[0] + "With"] = g.fireWith }), d.promise(e), a && a.call(e, e), e }, when: function (a) { var b = 0, c = e.call(arguments), d = c.length, f = 1 !== d || a && n.isFunction(a.promise) ? d : 0, g = 1 === f ? a : n.Deferred(), h = function (a, b, c) { return function (d) { b[a] = this, c[a] = arguments.length > 1 ? e.call(arguments) : d, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c) } }, i, j, k; if (d > 1) for (i = new Array(d), j = new Array(d), k = new Array(d); d > b; b++)c[b] && n.isFunction(c[b].promise) ? c[b].promise().progress(h(b, j, i)).done(h(b, k, c)).fail(g.reject) : --f; return f || g.resolveWith(k, c), g.promise() } }); var I; n.fn.ready = function (a) { return n.ready.promise().done(a), this }, n.extend({ isReady: !1, readyWait: 1, holdReady: function (a) { a ? n.readyWait++ : n.ready(!0) }, ready: function (a) { (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (I.resolveWith(d, [n]), n.fn.triggerHandler && (n(d).triggerHandler("ready"), n(d).off("ready")))) } }); function J() { d.removeEventListener("DOMContentLoaded", J), a.removeEventListener("load", J), n.ready() } n.ready.promise = function (b) { return I || (I = n.Deferred(), "complete" === d.readyState || "loading" !== d.readyState && !d.documentElement.doScroll ? a.setTimeout(n.ready) : (d.addEventListener("DOMContentLoaded", J), a.addEventListener("load", J))), I.promise(b) }, n.ready.promise(); var K = function (a, b, c, d, e, f, g) { var h = 0, i = a.length, j = null == c; if ("object" === n.type(c)) { e = !0; for (h in c) K(a, b, h, c[h], !0, f, g) } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) { return j.call(n(a), c) })), b)) for (; i > h; h++)b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c))); return e ? a : j ? b.call(a) : i ? b(a[0], c) : f }, L = function (a) { return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType }; function M() { this.expando = n.expando + M.uid++ } M.uid = 1, M.prototype = { register: function (a, b) { var c = b || {}; return a.nodeType ? a[this.expando] = c : Object.defineProperty(a, this.expando, { value: c, writable: !0, configurable: !0 }), a[this.expando] }, cache: function (a) { if (!L(a)) return {}; var b = a[this.expando]; return b || (b = {}, L(a) && (a.nodeType ? a[this.expando] = b : Object.defineProperty(a, this.expando, { value: b, configurable: !0 }))), b }, set: function (a, b, c) { var d, e = this.cache(a); if ("string" == typeof b) e[b] = c; else for (d in b) e[d] = b[d]; return e }, get: function (a, b) { return void 0 === b ? this.cache(a) : a[this.expando] && a[this.expando][b] }, access: function (a, b, c) { var d; return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b) }, remove: function (a, b) { var c, d, e, f = a[this.expando]; if (void 0 !== f) { if (void 0 === b) this.register(a); else { n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in f ? d = [b, e] : (d = e, d = d in f ? [d] : d.match(G) || [])), c = d.length; while (c--) delete f[d[c]] } (void 0 === b || n.isEmptyObject(f)) && (a.nodeType ? a[this.expando] = void 0 : delete a[this.expando]) } }, hasData: function (a) { var b = a[this.expando]; return void 0 !== b && !n.isEmptyObject(b) } }; var N = new M, O = new M, P = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, Q = /[A-Z]/g; function R(a, b, c) {
        var d; if (void 0 === c && 1 === a.nodeType) if (d = "data-" + b.replace(Q, "-$&").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
            try {
                c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : P.test(c) ? n.parseJSON(c) : c;
            } catch (e) { } O.set(a, b, c)
        } else c = void 0; return c
    } n.extend({ hasData: function (a) { return O.hasData(a) || N.hasData(a) }, data: function (a, b, c) { return O.access(a, b, c) }, removeData: function (a, b) { O.remove(a, b) }, _data: function (a, b, c) { return N.access(a, b, c) }, _removeData: function (a, b) { N.remove(a, b) } }), n.fn.extend({ data: function (a, b) { var c, d, e, f = this[0], g = f && f.attributes; if (void 0 === a) { if (this.length && (e = O.get(f), 1 === f.nodeType && !N.get(f, "hasDataAttrs"))) { c = g.length; while (c--) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), R(f, d, e[d]))); N.set(f, "hasDataAttrs", !0) } return e } return "object" == typeof a ? this.each(function () { O.set(this, a) }) : K(this, function (b) { var c, d; if (f && void 0 === b) { if (c = O.get(f, a) || O.get(f, a.replace(Q, "-$&").toLowerCase()), void 0 !== c) return c; if (d = n.camelCase(a), c = O.get(f, d), void 0 !== c) return c; if (c = R(f, d, void 0), void 0 !== c) return c } else d = n.camelCase(a), this.each(function () { var c = O.get(this, d); O.set(this, d, b), a.indexOf("-") > -1 && void 0 !== c && O.set(this, a, b) }) }, null, b, arguments.length > 1, null, !0) }, removeData: function (a) { return this.each(function () { O.remove(this, a) }) } }), n.extend({ queue: function (a, b, c) { var d; return a ? (b = (b || "fx") + "queue", d = N.get(a, b), c && (!d || n.isArray(c) ? d = N.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0 }, dequeue: function (a, b) { b = b || "fx"; var c = n.queue(a, b), d = c.length, e = c.shift(), f = n._queueHooks(a, b), g = function () { n.dequeue(a, b) }; "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire() }, _queueHooks: function (a, b) { var c = b + "queueHooks"; return N.get(a, c) || N.access(a, c, { empty: n.Callbacks("once memory").add(function () { N.remove(a, [b + "queue", c]) }) }) } }), n.fn.extend({ queue: function (a, b) { var c = 2; return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function () { var c = n.queue(this, a, b); n._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && n.dequeue(this, a) }) }, dequeue: function (a) { return this.each(function () { n.dequeue(this, a) }) }, clearQueue: function (a) { return this.queue(a || "fx", []) }, promise: function (a, b) { var c, d = 1, e = n.Deferred(), f = this, g = this.length, h = function () { --d || e.resolveWith(f, [f]) }; "string" != typeof a && (b = a, a = void 0), a = a || "fx"; while (g--) c = N.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h)); return h(), e.promise(b) } }); var S = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, T = new RegExp("^(?:([+-])=|)(" + S + ")([a-z%]*)$", "i"), U = ["Top", "Right", "Bottom", "Left"], V = function (a, b) { return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a) }; function W(a, b, c, d) { var e, f = 1, g = 20, h = d ? function () { return d.cur() } : function () { return n.css(a, b, "") }, i = h(), j = c && c[3] || (n.cssNumber[b] ? "" : "px"), k = (n.cssNumber[b] || "px" !== j && +i) && T.exec(n.css(a, b)); if (k && k[3] !== j) { j = j || k[3], c = c || [], k = +i || 1; do f = f || ".5", k /= f, n.style(a, b, k + j); while (f !== (f = h() / i) && 1 !== f && --g) } return c && (k = +k || +i || 0, e = c[1] ? k + (c[1] + 1) * c[2] : +c[2], d && (d.unit = j, d.start = k, d.end = e)), e } var X = /^(?:checkbox|radio)$/i, Y = /<([\w:-]+)/, Z = /^$|\/(?:java|ecma)script/i, $ = { option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""] }; $.optgroup = $.option, $.tbody = $.tfoot = $.colgroup = $.caption = $.thead, $.th = $.td; function _(a, b) { var c = "undefined" != typeof a.getElementsByTagName ? a.getElementsByTagName(b || "*") : "undefined" != typeof a.querySelectorAll ? a.querySelectorAll(b || "*") : []; return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c } function aa(a, b) { for (var c = 0, d = a.length; d > c; c++)N.set(a[c], "globalEval", !b || N.get(b[c], "globalEval")) } var ba = /<|&#?\w+;/; function ca(a, b, c, d, e) { for (var f, g, h, i, j, k, l = b.createDocumentFragment(), m = [], o = 0, p = a.length; p > o; o++)if (f = a[o], f || 0 === f) if ("object" === n.type(f)) n.merge(m, f.nodeType ? [f] : f); else if (ba.test(f)) { g = g || l.appendChild(b.createElement("div")), h = (Y.exec(f) || ["", ""])[1].toLowerCase(), i = $[h] || $._default, g.innerHTML = i[1] + n.htmlPrefilter(f) + i[2], k = i[0]; while (k--) g = g.lastChild; n.merge(m, g.childNodes), g = l.firstChild, g.textContent = "" } else m.push(b.createTextNode(f)); l.textContent = "", o = 0; while (f = m[o++]) if (d && n.inArray(f, d) > -1) e && e.push(f); else if (j = n.contains(f.ownerDocument, f), g = _(l.appendChild(f), "script"), j && aa(g), c) { k = 0; while (f = g[k++]) Z.test(f.type || "") && c.push(f) } return l } !function () { var a = d.createDocumentFragment(), b = a.appendChild(d.createElement("div")), c = d.createElement("input"); c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), l.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", l.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue }(); var da = /^key/, ea = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, fa = /^([^.]*)(?:\.(.+)|)/; function ga() { return !0 } function ha() { return !1 } function ia() { try { return d.activeElement } catch (a) { } } function ja(a, b, c, d, e, f) { var g, h; if ("object" == typeof b) { "string" != typeof c && (d = d || c, c = void 0); for (h in b) ja(a, h, c, d, b[h], f); return a } if (null == d && null == e ? (e = c, d = c = void 0) : null == e && ("string" == typeof c ? (e = d, d = void 0) : (e = d, d = c, c = void 0)), e === !1) e = ha; else if (!e) return a; return 1 === f && (g = e, e = function (a) { return n().off(a), g.apply(this, arguments) }, e.guid = g.guid || (g.guid = n.guid++)), a.each(function () { n.event.add(this, b, e, d, c) }) } n.event = { global: {}, add: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = N.get(a); if (r) { c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) { return "undefined" != typeof n && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0 }), b = (b || "").match(G) || [""], j = b.length; while (j--) h = fa.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({ type: o, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && n.expr.match.needsContext.test(e), namespace: p.join(".") }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0) } }, remove: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = N.hasData(a) && N.get(a); if (r && (i = r.events)) { b = (b || "").match(G) || [""], j = b.length; while (j--) if (h = fa.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) { l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length; while (f--) k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k)); g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o]) } else for (o in i) n.event.remove(a, o + b[j], c, d, !0); n.isEmptyObject(i) && N.remove(a, "handle events") } }, dispatch: function (a) { a = n.event.fix(a); var b, c, d, f, g, h = [], i = e.call(arguments), j = (N.get(this, "events") || {})[a.type] || [], k = n.event.special[a.type] || {}; if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) { h = n.event.handlers.call(this, a, j), b = 0; while ((f = h[b++]) && !a.isPropagationStopped()) { a.currentTarget = f.elem, c = 0; while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped()) a.rnamespace && !a.rnamespace.test(g.namespace) || (a.handleObj = g, a.data = g.data, d = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== d && (a.result = d) === !1 && (a.preventDefault(), a.stopPropagation())) } return k.postDispatch && k.postDispatch.call(this, a), a.result } }, handlers: function (a, b) { var c, d, e, f, g = [], h = b.delegateCount, i = a.target; if (h && i.nodeType && ("click" !== a.type || isNaN(a.button) || a.button < 1)) for (; i !== this; i = i.parentNode || this)if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) { for (d = [], c = 0; h > c; c++)f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) > -1 : n.find(e, this, null, [i]).length), d[e] && d.push(f); d.length && g.push({ elem: i, handlers: d }) } return h < b.length && g.push({ elem: this, handlers: b.slice(h) }), g }, props: "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: { props: "char charCode key keyCode".split(" "), filter: function (a, b) { return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a } }, mouseHooks: { props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (a, b) { var c, e, f, g = b.button; return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || d, e = c.documentElement, f = c.body, a.pageX = b.clientX + (e && e.scrollLeft || f && f.scrollLeft || 0) - (e && e.clientLeft || f && f.clientLeft || 0), a.pageY = b.clientY + (e && e.scrollTop || f && f.scrollTop || 0) - (e && e.clientTop || f && f.clientTop || 0)), a.which || void 0 === g || (a.which = 1 & g ? 1 : 2 & g ? 3 : 4 & g ? 2 : 0), a } }, fix: function (a) { if (a[n.expando]) return a; var b, c, e, f = a.type, g = a, h = this.fixHooks[f]; h || (this.fixHooks[f] = h = ea.test(f) ? this.mouseHooks : da.test(f) ? this.keyHooks : {}), e = h.props ? this.props.concat(h.props) : this.props, a = new n.Event(g), b = e.length; while (b--) c = e[b], a[c] = g[c]; return a.target || (a.target = d), 3 === a.target.nodeType && (a.target = a.target.parentNode), h.filter ? h.filter(a, g) : a }, special: { load: { noBubble: !0 }, focus: { trigger: function () { return this !== ia() && this.focus ? (this.focus(), !1) : void 0 }, delegateType: "focusin" }, blur: { trigger: function () { return this === ia() && this.blur ? (this.blur(), !1) : void 0 }, delegateType: "focusout" }, click: { trigger: function () { return "checkbox" === this.type && this.click && n.nodeName(this, "input") ? (this.click(), !1) : void 0 }, _default: function (a) { return n.nodeName(a.target, "a") } }, beforeunload: { postDispatch: function (a) { void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result) } } } }, n.removeEvent = function (a, b, c) { a.removeEventListener && a.removeEventListener(b, c) }, n.Event = function (a, b) { return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? ga : ha) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void (this[n.expando] = !0)) : new n.Event(a, b) }, n.Event.prototype = { constructor: n.Event, isDefaultPrevented: ha, isPropagationStopped: ha, isImmediatePropagationStopped: ha, preventDefault: function () { var a = this.originalEvent; this.isDefaultPrevented = ga, a && a.preventDefault() }, stopPropagation: function () { var a = this.originalEvent; this.isPropagationStopped = ga, a && a.stopPropagation() }, stopImmediatePropagation: function () { var a = this.originalEvent; this.isImmediatePropagationStopped = ga, a && a.stopImmediatePropagation(), this.stopPropagation() } }, n.each({ mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout" }, function (a, b) { n.event.special[a] = { delegateType: b, bindType: b, handle: function (a) { var c, d = this, e = a.relatedTarget, f = a.handleObj; return e && (e === d || n.contains(d, e)) || (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c } } }), n.fn.extend({ on: function (a, b, c, d) { return ja(this, a, b, c, d) }, one: function (a, b, c, d) { return ja(this, a, b, c, d, 1) }, off: function (a, b, c) { var d, e; if (a && a.preventDefault && a.handleObj) return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this; if ("object" == typeof a) { for (e in a) this.off(e, b, a[e]); return this } return b !== !1 && "function" != typeof b || (c = b, b = void 0), c === !1 && (c = ha), this.each(function () { n.event.remove(this, a, c, b) }) } }); var ka = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi, la = /<script|<style|<link/i, ma = /checked\s*(?:[^=]|=\s*.checked.)/i, na = /^true\/(.*)/, oa = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g; function pa(a, b) { return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a } function qa(a) { return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a } function ra(a) { var b = na.exec(a.type); return b ? a.type = b[1] : a.removeAttribute("type"), a } function sa(a, b) { var c, d, e, f, g, h, i, j; if (1 === b.nodeType) { if (N.hasData(a) && (f = N.access(a), g = N.set(b, f), j = f.events)) { delete g.handle, g.events = {}; for (e in j) for (c = 0, d = j[e].length; d > c; c++)n.event.add(b, e, j[e][c]) } O.hasData(a) && (h = O.access(a), i = n.extend({}, h), O.set(b, i)) } } function ta(a, b) { var c = b.nodeName.toLowerCase(); "input" === c && X.test(a.type) ? b.checked = a.checked : "input" !== c && "textarea" !== c || (b.defaultValue = a.defaultValue) } function ua(a, b, c, d) { b = f.apply([], b); var e, g, h, i, j, k, m = 0, o = a.length, p = o - 1, q = b[0], r = n.isFunction(q); if (r || o > 1 && "string" == typeof q && !l.checkClone && ma.test(q)) return a.each(function (e) { var f = a.eq(e); r && (b[0] = q.call(this, e, f.html())), ua(f, b, c, d) }); if (o && (e = ca(b, a[0].ownerDocument, !1, a, d), g = e.firstChild, 1 === e.childNodes.length && (e = g), g || d)) { for (h = n.map(_(e, "script"), qa), i = h.length; o > m; m++)j = e, m !== p && (j = n.clone(j, !0, !0), i && n.merge(h, _(j, "script"))), c.call(a[m], j, m); if (i) for (k = h[h.length - 1].ownerDocument, n.map(h, ra), m = 0; i > m; m++)j = h[m], Z.test(j.type || "") && !N.access(j, "globalEval") && n.contains(k, j) && (j.src ? n._evalUrl && n._evalUrl(j.src) : n.globalEval(j.textContent.replace(oa, ""))) } return a } function va(a, b, c) { for (var d, e = b ? n.filter(b, a) : a, f = 0; null != (d = e[f]); f++)c || 1 !== d.nodeType || n.cleanData(_(d)), d.parentNode && (c && n.contains(d.ownerDocument, d) && aa(_(d, "script")), d.parentNode.removeChild(d)); return a } n.extend({ htmlPrefilter: function (a) { return a.replace(ka, "<$1></$2>") }, clone: function (a, b, c) { var d, e, f, g, h = a.cloneNode(!0), i = n.contains(a.ownerDocument, a); if (!(l.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a))) for (g = _(h), f = _(a), d = 0, e = f.length; e > d; d++)ta(f[d], g[d]); if (b) if (c) for (f = f || _(a), g = g || _(h), d = 0, e = f.length; e > d; d++)sa(f[d], g[d]); else sa(a, h); return g = _(h, "script"), g.length > 0 && aa(g, !i && _(a, "script")), h }, cleanData: function (a) { for (var b, c, d, e = n.event.special, f = 0; void 0 !== (c = a[f]); f++)if (L(c)) { if (b = c[N.expando]) { if (b.events) for (d in b.events) e[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle); c[N.expando] = void 0 } c[O.expando] && (c[O.expando] = void 0) } } }), n.fn.extend({ domManip: ua, detach: function (a) { return va(this, a, !0) }, remove: function (a) { return va(this, a) }, text: function (a) { return K(this, function (a) { return void 0 === a ? n.text(this) : this.empty().each(function () { 1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = a) }) }, null, a, arguments.length) }, append: function () { return ua(this, arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) { var b = pa(this, a); b.appendChild(a) } }) }, prepend: function () { return ua(this, arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) { var b = pa(this, a); b.insertBefore(a, b.firstChild) } }) }, before: function () { return ua(this, arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this) }) }, after: function () { return ua(this, arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this.nextSibling) }) }, empty: function () { for (var a, b = 0; null != (a = this[b]); b++)1 === a.nodeType && (n.cleanData(_(a, !1)), a.textContent = ""); return this }, clone: function (a, b) { return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () { return n.clone(this, a, b) }) }, html: function (a) { return K(this, function (a) { var b = this[0] || {}, c = 0, d = this.length; if (void 0 === a && 1 === b.nodeType) return b.innerHTML; if ("string" == typeof a && !la.test(a) && !$[(Y.exec(a) || ["", ""])[1].toLowerCase()]) { a = n.htmlPrefilter(a); try { for (; d > c; c++)b = this[c] || {}, 1 === b.nodeType && (n.cleanData(_(b, !1)), b.innerHTML = a); b = 0 } catch (e) { } } b && this.empty().append(a) }, null, a, arguments.length) }, replaceWith: function () { var a = []; return ua(this, arguments, function (b) { var c = this.parentNode; n.inArray(this, a) < 0 && (n.cleanData(_(this)), c && c.replaceChild(b, this)) }, a) } }), n.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function (a, b) { n.fn[a] = function (a) { for (var c, d = [], e = n(a), f = e.length - 1, h = 0; f >= h; h++)c = h === f ? this : this.clone(!0), n(e[h])[b](c), g.apply(d, c.get()); return this.pushStack(d) } }); var wa, xa = { HTML: "block", BODY: "block" }; function ya(a, b) { var c = n(b.createElement(a)).appendTo(b.body), d = n.css(c[0], "display"); return c.detach(), d } function za(a) { var b = d, c = xa[a]; return c || (c = ya(a, b), "none" !== c && c || (wa = (wa || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = wa[0].contentDocument, b.write(), b.close(), c = ya(a, b), wa.detach()), xa[a] = c), c } var Aa = /^margin/, Ba = new RegExp("^(" + S + ")(?!px)[a-z%]+$", "i"), Ca = function (b) { var c = b.ownerDocument.defaultView; return c && c.opener || (c = a), c.getComputedStyle(b) }, Da = function (a, b, c, d) { var e, f, g = {}; for (f in b) g[f] = a.style[f], a.style[f] = b[f]; e = c.apply(a, d || []); for (f in b) a.style[f] = g[f]; return e }, Ea = d.documentElement; !function () { var b, c, e, f, g = d.createElement("div"), h = d.createElement("div"); if (h.style) { h.style.backgroundClip = "content-box", h.cloneNode(!0).style.backgroundClip = "", l.clearCloneStyle = "content-box" === h.style.backgroundClip, g.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute", g.appendChild(h); function i() { h.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%", h.innerHTML = "", Ea.appendChild(g); var d = a.getComputedStyle(h); b = "1%" !== d.top, f = "2px" === d.marginLeft, c = "4px" === d.width, h.style.marginRight = "50%", e = "4px" === d.marginRight, Ea.removeChild(g) } n.extend(l, { pixelPosition: function () { return i(), b }, boxSizingReliable: function () { return null == c && i(), c }, pixelMarginRight: function () { return null == c && i(), e }, reliableMarginLeft: function () { return null == c && i(), f }, reliableMarginRight: function () { var b, c = h.appendChild(d.createElement("div")); return c.style.cssText = h.style.cssText = "-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", c.style.marginRight = c.style.width = "0", h.style.width = "1px", Ea.appendChild(g), b = !parseFloat(a.getComputedStyle(c).marginRight), Ea.removeChild(g), h.removeChild(c), b } }) } }(); function Fa(a, b, c) { var d, e, f, g, h = a.style; return c = c || Ca(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, "" !== g && void 0 !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), c && !l.pixelMarginRight() && Ba.test(g) && Aa.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f), void 0 !== g ? g + "" : g } function Ga(a, b) { return { get: function () { return a() ? void delete this.get : (this.get = b).apply(this, arguments) } } } var Ha = /^(none|table(?!-c[ea]).+)/, Ia = { position: "absolute", visibility: "hidden", display: "block" }, Ja = { letterSpacing: "0", fontWeight: "400" }, Ka = ["Webkit", "O", "Moz", "ms"], La = d.createElement("div").style; function Ma(a) { if (a in La) return a; var b = a[0].toUpperCase() + a.slice(1), c = Ka.length; while (c--) if (a = Ka[c] + b, a in La) return a } function Na(a, b, c) { var d = T.exec(b); return d ? Math.max(0, d[2] - (c || 0)) + (d[3] || "px") : b } function Oa(a, b, c, d, e) { for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2)"margin" === c && (g += n.css(a, c + U[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + U[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + U[f] + "Width", !0, e))) : (g += n.css(a, "padding" + U[f], !0, e), "padding" !== c && (g += n.css(a, "border" + U[f] + "Width", !0, e))); return g } function Pa(b, c, e) { var f = !0, g = "width" === c ? b.offsetWidth : b.offsetHeight, h = Ca(b), i = "border-box" === n.css(b, "boxSizing", !1, h); if (d.msFullscreenElement && a.top !== a && b.getClientRects().length && (g = Math.round(100 * b.getBoundingClientRect()[c])), 0 >= g || null == g) { if (g = Fa(b, c, h), (0 > g || null == g) && (g = b.style[c]), Ba.test(g)) return g; f = i && (l.boxSizingReliable() || g === b.style[c]), g = parseFloat(g) || 0 } return g + Oa(b, c, e || (i ? "border" : "content"), f, h) + "px" } function Qa(a, b) { for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++)d = a[g], d.style && (f[g] = N.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && V(d) && (f[g] = N.access(d, "olddisplay", za(d.nodeName)))) : (e = V(d), "none" === c && e || N.set(d, "olddisplay", e ? c : n.css(d, "display")))); for (g = 0; h > g; g++)d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none")); return a } n.extend({ cssHooks: { opacity: { get: function (a, b) { if (b) { var c = Fa(a, "opacity"); return "" === c ? "1" : c } } } }, cssNumber: { animationIterationCount: !0, columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: { "float": "cssFloat" }, style: function (a, b, c, d) { if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) { var e, f, g, h = n.camelCase(b), i = a.style; return b = n.cssProps[h] || (n.cssProps[h] = Ma(h) || h), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = T.exec(c)) && e[1] && (c = W(a, b, e), f = "number"), null != c && c === c && ("number" === f && (c += e && e[3] || (n.cssNumber[h] ? "" : "px")), l.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0) } }, css: function (a, b, c, d) { var e, f, g, h = n.camelCase(b); return b = n.cssProps[h] || (n.cssProps[h] = Ma(h) || h), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = Fa(a, b, d)), "normal" === e && b in Ja && (e = Ja[b]), "" === c || c ? (f = parseFloat(e), c === !0 || isFinite(f) ? f || 0 : e) : e } }), n.each(["height", "width"], function (a, b) { n.cssHooks[b] = { get: function (a, c, d) { return c ? Ha.test(n.css(a, "display")) && 0 === a.offsetWidth ? Da(a, Ia, function () { return Pa(a, b, d) }) : Pa(a, b, d) : void 0 }, set: function (a, c, d) { var e, f = d && Ca(a), g = d && Oa(a, b, d, "border-box" === n.css(a, "boxSizing", !1, f), f); return g && (e = T.exec(c)) && "px" !== (e[3] || "px") && (a.style[b] = c, c = n.css(a, b)), Na(a, c, g) } } }), n.cssHooks.marginLeft = Ga(l.reliableMarginLeft, function (a, b) { return b ? (parseFloat(Fa(a, "marginLeft")) || a.getBoundingClientRect().left - Da(a, { marginLeft: 0 }, function () { return a.getBoundingClientRect().left })) + "px" : void 0 }), n.cssHooks.marginRight = Ga(l.reliableMarginRight, function (a, b) { return b ? Da(a, { display: "inline-block" }, Fa, [a, "marginRight"]) : void 0 }), n.each({ margin: "", padding: "", border: "Width" }, function (a, b) { n.cssHooks[a + b] = { expand: function (c) { for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++)e[a + U[d] + b] = f[d] || f[d - 2] || f[0]; return e } }, Aa.test(a) || (n.cssHooks[a + b].set = Na) }), n.fn.extend({ css: function (a, b) { return K(this, function (a, b, c) { var d, e, f = {}, g = 0; if (n.isArray(b)) { for (d = Ca(a), e = b.length; e > g; g++)f[b[g]] = n.css(a, b[g], !1, d); return f } return void 0 !== c ? n.style(a, b, c) : n.css(a, b) }, a, b, arguments.length > 1) }, show: function () { return Qa(this, !0) }, hide: function () { return Qa(this) }, toggle: function (a) { return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () { V(this) ? n(this).show() : n(this).hide() }) } }); function Ra(a, b, c, d, e) { return new Ra.prototype.init(a, b, c, d, e) } n.Tween = Ra, Ra.prototype = { constructor: Ra, init: function (a, b, c, d, e, f) { this.elem = a, this.prop = c, this.easing = e || n.easing._default, this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px") }, cur: function () { var a = Ra.propHooks[this.prop]; return a && a.get ? a.get(this) : Ra.propHooks._default.get(this) }, run: function (a) { var b, c = Ra.propHooks[this.prop]; return this.options.duration ? this.pos = b = n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Ra.propHooks._default.set(this), this } }, Ra.prototype.init.prototype = Ra.prototype, Ra.propHooks = { _default: { get: function (a) { var b; return 1 !== a.elem.nodeType || null != a.elem[a.prop] && null == a.elem.style[a.prop] ? a.elem[a.prop] : (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) }, set: function (a) { n.fx.step[a.prop] ? n.fx.step[a.prop](a) : 1 !== a.elem.nodeType || null == a.elem.style[n.cssProps[a.prop]] && !n.cssHooks[a.prop] ? a.elem[a.prop] = a.now : n.style(a.elem, a.prop, a.now + a.unit) } } }, Ra.propHooks.scrollTop = Ra.propHooks.scrollLeft = { set: function (a) { a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now) } }, n.easing = { linear: function (a) { return a }, swing: function (a) { return .5 - Math.cos(a * Math.PI) / 2 }, _default: "swing" }, n.fx = Ra.prototype.init, n.fx.step = {}; var Sa, Ta, Ua = /^(?:toggle|show|hide)$/, Va = /queueHooks$/; function Wa() { return a.setTimeout(function () { Sa = void 0 }), Sa = n.now() } function Xa(a, b) { var c, d = 0, e = { height: a }; for (b = b ? 1 : 0; 4 > d; d += 2 - b)c = U[d], e["margin" + c] = e["padding" + c] = a; return b && (e.opacity = e.width = a), e } function Ya(a, b, c) { for (var d, e = (_a.tweeners[b] || []).concat(_a.tweeners["*"]), f = 0, g = e.length; g > f; f++)if (d = e[f].call(c, b, a)) return d } function Za(a, b, c) { var d, e, f, g, h, i, j, k, l = this, m = {}, o = a.style, p = a.nodeType && V(a), q = N.get(a, "fxshow"); c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () { h.unqueued || i() }), h.unqueued++, l.always(function () { l.always(function () { h.unqueued--, n.queue(a, "fx").length || h.empty.fire() }) })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = n.css(a, "display"), k = "none" === j ? N.get(a, "olddisplay") || za(a.nodeName) : j, "inline" === k && "none" === n.css(a, "float") && (o.display = "inline-block")), c.overflow && (o.overflow = "hidden", l.always(function () { o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2] })); for (d in b) if (e = b[d], Ua.exec(e)) { if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) { if ("show" !== e || !q || void 0 === q[d]) continue; p = !0 } m[d] = q && q[d] || n.style(a, d) } else j = void 0; if (n.isEmptyObject(m)) "inline" === ("none" === j ? za(a.nodeName) : j) && (o.display = j); else { q ? "hidden" in q && (p = q.hidden) : q = N.access(a, "fxshow", {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function () { n(a).hide() }), l.done(function () { var b; N.remove(a, "fxshow"); for (b in m) n.style(a, b, m[b]) }); for (d in m) g = Ya(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0)) } } function $a(a, b) { var c, d, e, f, g; for (c in a) if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) { f = g.expand(f), delete a[d]; for (c in f) c in a || (a[c] = f[c], b[c] = e) } else b[d] = e } function _a(a, b, c) { var d, e, f = 0, g = _a.prefilters.length, h = n.Deferred().always(function () { delete i.elem }), i = function () { if (e) return !1; for (var b = Sa || Wa(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++)j.tweens[g].run(f); return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1) }, j = h.promise({ elem: a, props: n.extend({}, b), opts: n.extend(!0, { specialEasing: {}, easing: n.easing._default }, c), originalProperties: b, originalOptions: c, startTime: Sa || Wa(), duration: c.duration, tweens: [], createTween: function (b, c) { var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing); return j.tweens.push(d), d }, stop: function (b) { var c = 0, d = b ? j.tweens.length : 0; if (e) return this; for (e = !0; d > c; c++)j.tweens[c].run(1); return b ? (h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j, b])) : h.rejectWith(a, [j, b]), this } }), k = j.props; for ($a(k, j.opts.specialEasing); g > f; f++)if (d = _a.prefilters[f].call(j, a, k, j.opts)) return n.isFunction(d.stop) && (n._queueHooks(j.elem, j.opts.queue).stop = n.proxy(d.stop, d)), d; return n.map(k, Ya, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, { elem: a, anim: j, queue: j.opts.queue })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always) } n.Animation = n.extend(_a, { tweeners: { "*": [function (a, b) { var c = this.createTween(a, b); return W(c.elem, a, T.exec(b), c), c }] }, tweener: function (a, b) { n.isFunction(a) ? (b = a, a = ["*"]) : a = a.match(G); for (var c, d = 0, e = a.length; e > d; d++)c = a[d], _a.tweeners[c] = _a.tweeners[c] || [], _a.tweeners[c].unshift(b) }, prefilters: [Za], prefilter: function (a, b) { b ? _a.prefilters.unshift(a) : _a.prefilters.push(a) } }), n.speed = function (a, b, c) { var d = a && "object" == typeof a ? n.extend({}, a) : { complete: c || !c && b || n.isFunction(a) && a, duration: a, easing: c && b || b && !n.isFunction(b) && b }; return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, null != d.queue && d.queue !== !0 || (d.queue = "fx"), d.old = d.complete, d.complete = function () { n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue) }, d }, n.fn.extend({ fadeTo: function (a, b, c, d) { return this.filter(V).css("opacity", 0).show().end().animate({ opacity: b }, a, c, d) }, animate: function (a, b, c, d) { var e = n.isEmptyObject(a), f = n.speed(b, c, d), g = function () { var b = _a(this, n.extend({}, a), f); (e || N.get(this, "finish")) && b.stop(!0) }; return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g) }, stop: function (a, b, c) { var d = function (a) { var b = a.stop; delete a.stop, b(c) }; return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () { var b = !0, e = null != a && a + "queueHooks", f = n.timers, g = N.get(this); if (e) g[e] && g[e].stop && d(g[e]); else for (e in g) g[e] && g[e].stop && Va.test(e) && d(g[e]); for (e = f.length; e--;)f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1)); !b && c || n.dequeue(this, a) }) }, finish: function (a) { return a !== !1 && (a = a || "fx"), this.each(function () { var b, c = N.get(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = n.timers, g = d ? d.length : 0; for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;)f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1)); for (b = 0; g > b; b++)d[b] && d[b].finish && d[b].finish.call(this); delete c.finish }) } }), n.each(["toggle", "show", "hide"], function (a, b) { var c = n.fn[b]; n.fn[b] = function (a, d, e) { return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Xa(b, !0), a, d, e) } }), n.each({ slideDown: Xa("show"), slideUp: Xa("hide"), slideToggle: Xa("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function (a, b) { n.fn[a] = function (a, c, d) { return this.animate(b, a, c, d) } }), n.timers = [], n.fx.tick = function () { var a, b = 0, c = n.timers; for (Sa = n.now(); b < c.length; b++)a = c[b], a() || c[b] !== a || c.splice(b--, 1); c.length || n.fx.stop(), Sa = void 0 }, n.fx.timer = function (a) { n.timers.push(a), a() ? n.fx.start() : n.timers.pop() }, n.fx.interval = 13, n.fx.start = function () { Ta || (Ta = a.setInterval(n.fx.tick, n.fx.interval)) }, n.fx.stop = function () { a.clearInterval(Ta), Ta = null }, n.fx.speeds = { slow: 600, fast: 200, _default: 400 }, n.fn.delay = function (b, c) { return b = n.fx ? n.fx.speeds[b] || b : b, c = c || "fx", this.queue(c, function (c, d) { var e = a.setTimeout(c, b); d.stop = function () { a.clearTimeout(e) } }) }, function () { var a = d.createElement("input"), b = d.createElement("select"), c = b.appendChild(d.createElement("option")); a.type = "checkbox", l.checkOn = "" !== a.value, l.optSelected = c.selected, b.disabled = !0, l.optDisabled = !c.disabled, a = d.createElement("input"), a.value = "t", a.type = "radio", l.radioValue = "t" === a.value }(); var ab, bb = n.expr.attrHandle; n.fn.extend({ attr: function (a, b) { return K(this, n.attr, a, b, arguments.length > 1) }, removeAttr: function (a) { return this.each(function () { n.removeAttr(this, a) }) } }), n.extend({ attr: function (a, b, c) { var d, e, f = a.nodeType; if (3 !== f && 8 !== f && 2 !== f) return "undefined" == typeof a.getAttribute ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), e = n.attrHooks[b] || (n.expr.match.bool.test(b) ? ab : void 0)), void 0 !== c ? null === c ? void n.removeAttr(a, b) : e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : (a.setAttribute(b, c + ""), c) : e && "get" in e && null !== (d = e.get(a, b)) ? d : (d = n.find.attr(a, b), null == d ? void 0 : d)) }, attrHooks: { type: { set: function (a, b) { if (!l.radioValue && "radio" === b && n.nodeName(a, "input")) { var c = a.value; return a.setAttribute("type", b), c && (a.value = c), b } } } }, removeAttr: function (a, b) { var c, d, e = 0, f = b && b.match(G); if (f && 1 === a.nodeType) while (c = f[e++]) d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c) } }), ab = { set: function (a, b, c) { return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c } }, n.each(n.expr.match.bool.source.match(/\w+/g), function (a, b) { var c = bb[b] || n.find.attr; bb[b] = function (a, b, d) { var e, f; return d || (f = bb[b], bb[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, bb[b] = f), e } }); var cb = /^(?:input|select|textarea|button)$/i, db = /^(?:a|area)$/i; n.fn.extend({ prop: function (a, b) { return K(this, n.prop, a, b, arguments.length > 1) }, removeProp: function (a) { return this.each(function () { delete this[n.propFix[a] || a] }) } }), n.extend({
        prop: function (a, b, c) {
            var d, e, f = a.nodeType; if (3 !== f && 8 !== f && 2 !== f) return 1 === f && n.isXMLDoc(a) || (b = n.propFix[b] || b,
                e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]
        }, propHooks: { tabIndex: { get: function (a) { var b = n.find.attr(a, "tabindex"); return b ? parseInt(b, 10) : cb.test(a.nodeName) || db.test(a.nodeName) && a.href ? 0 : -1 } } }, propFix: { "for": "htmlFor", "class": "className" }
    }), l.optSelected || (n.propHooks.selected = { get: function (a) { var b = a.parentNode; return b && b.parentNode && b.parentNode.selectedIndex, null }, set: function (a) { var b = a.parentNode; b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex) } }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () { n.propFix[this.toLowerCase()] = this }); var eb = /[\t\r\n\f]/g; function fb(a) { return a.getAttribute && a.getAttribute("class") || "" } n.fn.extend({ addClass: function (a) { var b, c, d, e, f, g, h, i = 0; if (n.isFunction(a)) return this.each(function (b) { n(this).addClass(a.call(this, b, fb(this))) }); if ("string" == typeof a && a) { b = a.match(G) || []; while (c = this[i++]) if (e = fb(c), d = 1 === c.nodeType && (" " + e + " ").replace(eb, " ")) { g = 0; while (f = b[g++]) d.indexOf(" " + f + " ") < 0 && (d += f + " "); h = n.trim(d), e !== h && c.setAttribute("class", h) } } return this }, removeClass: function (a) { var b, c, d, e, f, g, h, i = 0; if (n.isFunction(a)) return this.each(function (b) { n(this).removeClass(a.call(this, b, fb(this))) }); if (!arguments.length) return this.attr("class", ""); if ("string" == typeof a && a) { b = a.match(G) || []; while (c = this[i++]) if (e = fb(c), d = 1 === c.nodeType && (" " + e + " ").replace(eb, " ")) { g = 0; while (f = b[g++]) while (d.indexOf(" " + f + " ") > -1) d = d.replace(" " + f + " ", " "); h = n.trim(d), e !== h && c.setAttribute("class", h) } } return this }, toggleClass: function (a, b) { var c = typeof a; return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : n.isFunction(a) ? this.each(function (c) { n(this).toggleClass(a.call(this, c, fb(this), b), b) }) : this.each(function () { var b, d, e, f; if ("string" === c) { d = 0, e = n(this), f = a.match(G) || []; while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b) } else void 0 !== a && "boolean" !== c || (b = fb(this), b && N.set(this, "__className__", b), this.setAttribute && this.setAttribute("class", b || a === !1 ? "" : N.get(this, "__className__") || "")) }) }, hasClass: function (a) { var b, c, d = 0; b = " " + a + " "; while (c = this[d++]) if (1 === c.nodeType && (" " + fb(c) + " ").replace(eb, " ").indexOf(b) > -1) return !0; return !1 } }); var gb = /\r/g, hb = /[\x20\t\r\n\f]+/g; n.fn.extend({ val: function (a) { var b, c, d, e = this[0]; { if (arguments.length) return d = n.isFunction(a), this.each(function (c) { var e; 1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function (a) { return null == a ? "" : a + "" })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e)) }); if (e) return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(gb, "") : null == c ? "" : c) } } }), n.extend({ valHooks: { option: { get: function (a) { var b = n.find.attr(a, "value"); return null != b ? b : n.trim(n.text(a)).replace(hb, " ") } }, select: { get: function (a) { for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)if (c = d[i], (c.selected || i === e) && (l.optDisabled ? !c.disabled : null === c.getAttribute("disabled")) && (!c.parentNode.disabled || !n.nodeName(c.parentNode, "optgroup"))) { if (b = n(c).val(), f) return b; g.push(b) } return g }, set: function (a, b) { var c, d, e = a.options, f = n.makeArray(b), g = e.length; while (g--) d = e[g], (d.selected = n.inArray(n.valHooks.option.get(d), f) > -1) && (c = !0); return c || (a.selectedIndex = -1), f } } } }), n.each(["radio", "checkbox"], function () { n.valHooks[this] = { set: function (a, b) { return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) > -1 : void 0 } }, l.checkOn || (n.valHooks[this].get = function (a) { return null === a.getAttribute("value") ? "on" : a.value }) }); var ib = /^(?:focusinfocus|focusoutblur)$/; n.extend(n.event, { trigger: function (b, c, e, f) { var g, h, i, j, l, m, o, p = [e || d], q = k.call(b, "type") ? b.type : b, r = k.call(b, "namespace") ? b.namespace.split(".") : []; if (h = i = e = e || d, 3 !== e.nodeType && 8 !== e.nodeType && !ib.test(q + n.event.triggered) && (q.indexOf(".") > -1 && (r = q.split("."), q = r.shift(), r.sort()), l = q.indexOf(":") < 0 && "on" + q, b = b[n.expando] ? b : new n.Event(q, "object" == typeof b && b), b.isTrigger = f ? 2 : 3, b.namespace = r.join("."), b.rnamespace = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = e), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, f || !o.trigger || o.trigger.apply(e, c) !== !1)) { if (!f && !o.noBubble && !n.isWindow(e)) { for (j = o.delegateType || q, ib.test(j + q) || (h = h.parentNode); h; h = h.parentNode)p.push(h), i = h; i === (e.ownerDocument || d) && p.push(i.defaultView || i.parentWindow || a) } g = 0; while ((h = p[g++]) && !b.isPropagationStopped()) b.type = g > 1 ? j : o.bindType || q, m = (N.get(h, "events") || {})[b.type] && N.get(h, "handle"), m && m.apply(h, c), m = l && h[l], m && m.apply && L(h) && (b.result = m.apply(h, c), b.result === !1 && b.preventDefault()); return b.type = q, f || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !L(e) || l && n.isFunction(e[q]) && !n.isWindow(e) && (i = e[l], i && (e[l] = null), n.event.triggered = q, e[q](), n.event.triggered = void 0, i && (e[l] = i)), b.result } }, simulate: function (a, b, c) { var d = n.extend(new n.Event, c, { type: a, isSimulated: !0 }); n.event.trigger(d, null, b), d.isDefaultPrevented() && c.preventDefault() } }), n.fn.extend({ trigger: function (a, b) { return this.each(function () { n.event.trigger(a, b, this) }) }, triggerHandler: function (a, b) { var c = this[0]; return c ? n.event.trigger(a, b, c, !0) : void 0 } }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) { n.fn[b] = function (a, c) { return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b) } }), n.fn.extend({ hover: function (a, b) { return this.mouseenter(a).mouseleave(b || a) } }), l.focusin = "onfocusin" in a, l.focusin || n.each({ focus: "focusin", blur: "focusout" }, function (a, b) { var c = function (a) { n.event.simulate(b, a.target, n.event.fix(a)) }; n.event.special[b] = { setup: function () { var d = this.ownerDocument || this, e = N.access(d, b); e || d.addEventListener(a, c, !0), N.access(d, b, (e || 0) + 1) }, teardown: function () { var d = this.ownerDocument || this, e = N.access(d, b) - 1; e ? N.access(d, b, e) : (d.removeEventListener(a, c, !0), N.remove(d, b)) } } }); var jb = a.location, kb = n.now(), lb = /\?/; n.parseJSON = function (a) { return JSON.parse(a + "") }, n.parseXML = function (b) { var c; if (!b || "string" != typeof b) return null; try { c = (new a.DOMParser).parseFromString(b, "text/xml") } catch (d) { c = void 0 } return c && !c.getElementsByTagName("parsererror").length || n.error("Invalid XML: " + b), c }; var mb = /#.*$/, nb = /([?&])_=[^&]*/, ob = /^(.*?):[ \t]*([^\r\n]*)$/gm, pb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, qb = /^(?:GET|HEAD)$/, rb = /^\/\//, sb = {}, tb = {}, ub = "*/".concat("*"), vb = d.createElement("a"); vb.href = jb.href; function wb(a) { return function (b, c) { "string" != typeof b && (c = b, b = "*"); var d, e = 0, f = b.toLowerCase().match(G) || []; if (n.isFunction(c)) while (d = f[e++]) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c) } } function xb(a, b, c, d) { var e = {}, f = a === tb; function g(h) { var i; return e[h] = !0, n.each(a[h] || [], function (a, h) { var j = h(b, c, d); return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1) }), i } return g(b.dataTypes[0]) || !e["*"] && g("*") } function yb(a, b) { var c, d, e = n.ajaxSettings.flatOptions || {}; for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]); return d && n.extend(!0, a, d), a } function zb(a, b, c) { var d, e, f, g, h = a.contents, i = a.dataTypes; while ("*" === i[0]) i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type")); if (d) for (e in h) if (h[e] && h[e].test(d)) { i.unshift(e); break } if (i[0] in c) f = i[0]; else { for (e in c) { if (!i[0] || a.converters[e + " " + i[0]]) { f = e; break } g || (g = e) } f = f || g } return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0 } function Ab(a, b, c, d) { var e, f, g, h, i, j = {}, k = a.dataTypes.slice(); if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g]; f = k.shift(); while (f) if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i; else if ("*" !== i && i !== f) { if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) { g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1])); break } if (g !== !0) if (g && a["throws"]) b = g(b); else try { b = g(b) } catch (l) { return { state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f } } } return { state: "success", data: b } } n.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: jb.href, type: "GET", isLocal: pb.test(jb.protocol), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": ub, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": n.parseJSON, "text xml": n.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function (a, b) { return b ? yb(yb(a, n.ajaxSettings), b) : yb(n.ajaxSettings, a) }, ajaxPrefilter: wb(sb), ajaxTransport: wb(tb), ajax: function (b, c) { "object" == typeof b && (c = b, b = void 0), c = c || {}; var e, f, g, h, i, j, k, l, m = n.ajaxSetup({}, c), o = m.context || m, p = m.context && (o.nodeType || o.jquery) ? n(o) : n.event, q = n.Deferred(), r = n.Callbacks("once memory"), s = m.statusCode || {}, t = {}, u = {}, v = 0, w = "canceled", x = { readyState: 0, getResponseHeader: function (a) { var b; if (2 === v) { if (!h) { h = {}; while (b = ob.exec(g)) h[b[1].toLowerCase()] = b[2] } b = h[a.toLowerCase()] } return null == b ? null : b }, getAllResponseHeaders: function () { return 2 === v ? g : null }, setRequestHeader: function (a, b) { var c = a.toLowerCase(); return v || (a = u[c] = u[c] || a, t[a] = b), this }, overrideMimeType: function (a) { return v || (m.mimeType = a), this }, statusCode: function (a) { var b; if (a) if (2 > v) for (b in a) s[b] = [s[b], a[b]]; else x.always(a[x.status]); return this }, abort: function (a) { var b = a || w; return e && e.abort(b), z(0, b), this } }; if (q.promise(x).complete = r.add, x.success = x.done, x.error = x.fail, m.url = ((b || m.url || jb.href) + "").replace(mb, "").replace(rb, jb.protocol + "//"), m.type = c.method || c.type || m.method || m.type, m.dataTypes = n.trim(m.dataType || "*").toLowerCase().match(G) || [""], null == m.crossDomain) { j = d.createElement("a"); try { j.href = m.url, j.href = j.href, m.crossDomain = vb.protocol + "//" + vb.host != j.protocol + "//" + j.host } catch (y) { m.crossDomain = !0 } } if (m.data && m.processData && "string" != typeof m.data && (m.data = n.param(m.data, m.traditional)), xb(sb, m, c, x), 2 === v) return x; k = n.event && m.global, k && 0 === n.active++ && n.event.trigger("ajaxStart"), m.type = m.type.toUpperCase(), m.hasContent = !qb.test(m.type), f = m.url, m.hasContent || (m.data && (f = m.url += (lb.test(f) ? "&" : "?") + m.data, delete m.data), m.cache === !1 && (m.url = nb.test(f) ? f.replace(nb, "$1_=" + kb++) : f + (lb.test(f) ? "&" : "?") + "_=" + kb++)), m.ifModified && (n.lastModified[f] && x.setRequestHeader("If-Modified-Since", n.lastModified[f]), n.etag[f] && x.setRequestHeader("If-None-Match", n.etag[f])), (m.data && m.hasContent && m.contentType !== !1 || c.contentType) && x.setRequestHeader("Content-Type", m.contentType), x.setRequestHeader("Accept", m.dataTypes[0] && m.accepts[m.dataTypes[0]] ? m.accepts[m.dataTypes[0]] + ("*" !== m.dataTypes[0] ? ", " + ub + "; q=0.01" : "") : m.accepts["*"]); for (l in m.headers) x.setRequestHeader(l, m.headers[l]); if (m.beforeSend && (m.beforeSend.call(o, x, m) === !1 || 2 === v)) return x.abort(); w = "abort"; for (l in { success: 1, error: 1, complete: 1 }) x[l](m[l]); if (e = xb(tb, m, c, x)) { if (x.readyState = 1, k && p.trigger("ajaxSend", [x, m]), 2 === v) return x; m.async && m.timeout > 0 && (i = a.setTimeout(function () { x.abort("timeout") }, m.timeout)); try { v = 1, e.send(t, z) } catch (y) { if (!(2 > v)) throw y; z(-1, y) } } else z(-1, "No Transport"); function z(b, c, d, h) { var j, l, t, u, w, y = c; 2 !== v && (v = 2, i && a.clearTimeout(i), e = void 0, g = h || "", x.readyState = b > 0 ? 4 : 0, j = b >= 200 && 300 > b || 304 === b, d && (u = zb(m, x, d)), u = Ab(m, u, x, j), j ? (m.ifModified && (w = x.getResponseHeader("Last-Modified"), w && (n.lastModified[f] = w), w = x.getResponseHeader("etag"), w && (n.etag[f] = w)), 204 === b || "HEAD" === m.type ? y = "nocontent" : 304 === b ? y = "notmodified" : (y = u.state, l = u.data, t = u.error, j = !t)) : (t = y, !b && y || (y = "error", 0 > b && (b = 0))), x.status = b, x.statusText = (c || y) + "", j ? q.resolveWith(o, [l, y, x]) : q.rejectWith(o, [x, y, t]), x.statusCode(s), s = void 0, k && p.trigger(j ? "ajaxSuccess" : "ajaxError", [x, m, j ? l : t]), r.fireWith(o, [x, y]), k && (p.trigger("ajaxComplete", [x, m]), --n.active || n.event.trigger("ajaxStop"))) } return x }, getJSON: function (a, b, c) { return n.get(a, b, c, "json") }, getScript: function (a, b) { return n.get(a, void 0, b, "script") } }), n.each(["get", "post"], function (a, b) { n[b] = function (a, c, d, e) { return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax(n.extend({ url: a, type: b, dataType: e, data: c, success: d }, n.isPlainObject(a) && a)) } }), n._evalUrl = function (a) { return n.ajax({ url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 }) }, n.fn.extend({ wrapAll: function (a) { var b; return n.isFunction(a) ? this.each(function (b) { n(this).wrapAll(a.call(this, b)) }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () { var a = this; while (a.firstElementChild) a = a.firstElementChild; return a }).append(this)), this) }, wrapInner: function (a) { return n.isFunction(a) ? this.each(function (b) { n(this).wrapInner(a.call(this, b)) }) : this.each(function () { var b = n(this), c = b.contents(); c.length ? c.wrapAll(a) : b.append(a) }) }, wrap: function (a) { var b = n.isFunction(a); return this.each(function (c) { n(this).wrapAll(b ? a.call(this, c) : a) }) }, unwrap: function () { return this.parent().each(function () { n.nodeName(this, "body") || n(this).replaceWith(this.childNodes) }).end() } }), n.expr.filters.hidden = function (a) { return !n.expr.filters.visible(a) }, n.expr.filters.visible = function (a) { return a.offsetWidth > 0 || a.offsetHeight > 0 || a.getClientRects().length > 0 }; var Bb = /%20/g, Cb = /\[\]$/, Db = /\r?\n/g, Eb = /^(?:submit|button|image|reset|file)$/i, Fb = /^(?:input|select|textarea|keygen)/i; function Gb(a, b, c, d) { var e; if (n.isArray(b)) n.each(b, function (b, e) { c || Cb.test(a) ? d(a, e) : Gb(a + "[" + ("object" == typeof e && null != e ? b : "") + "]", e, c, d) }); else if (c || "object" !== n.type(b)) d(a, b); else for (e in b) Gb(a + "[" + e + "]", b[e], c, d) } n.param = function (a, b) { var c, d = [], e = function (a, b) { b = n.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b) }; if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a)) n.each(a, function () { e(this.name, this.value) }); else for (c in a) Gb(c, a[c], b, e); return d.join("&").replace(Bb, "+") }, n.fn.extend({ serialize: function () { return n.param(this.serializeArray()) }, serializeArray: function () { return this.map(function () { var a = n.prop(this, "elements"); return a ? n.makeArray(a) : this }).filter(function () { var a = this.type; return this.name && !n(this).is(":disabled") && Fb.test(this.nodeName) && !Eb.test(a) && (this.checked || !X.test(a)) }).map(function (a, b) { var c = n(this).val(); return null == c ? null : n.isArray(c) ? n.map(c, function (a) { return { name: b.name, value: a.replace(Db, "\r\n") } }) : { name: b.name, value: c.replace(Db, "\r\n") } }).get() } }), n.ajaxSettings.xhr = function () { try { return new a.XMLHttpRequest } catch (b) { } }; var Hb = { 0: 200, 1223: 204 }, Ib = n.ajaxSettings.xhr(); l.cors = !!Ib && "withCredentials" in Ib, l.ajax = Ib = !!Ib, n.ajaxTransport(function (b) { var c, d; return l.cors || Ib && !b.crossDomain ? { send: function (e, f) { var g, h = b.xhr(); if (h.open(b.type, b.url, b.async, b.username, b.password), b.xhrFields) for (g in b.xhrFields) h[g] = b.xhrFields[g]; b.mimeType && h.overrideMimeType && h.overrideMimeType(b.mimeType), b.crossDomain || e["X-Requested-With"] || (e["X-Requested-With"] = "XMLHttpRequest"); for (g in e) h.setRequestHeader(g, e[g]); c = function (a) { return function () { c && (c = d = h.onload = h.onerror = h.onabort = h.onreadystatechange = null, "abort" === a ? h.abort() : "error" === a ? "number" != typeof h.status ? f(0, "error") : f(h.status, h.statusText) : f(Hb[h.status] || h.status, h.statusText, "text" !== (h.responseType || "text") || "string" != typeof h.responseText ? { binary: h.response } : { text: h.responseText }, h.getAllResponseHeaders())) } }, h.onload = c(), d = h.onerror = c("error"), void 0 !== h.onabort ? h.onabort = d : h.onreadystatechange = function () { 4 === h.readyState && a.setTimeout(function () { c && d() }) }, c = c("abort"); try { h.send(b.hasContent && b.data || null) } catch (i) { if (c) throw i } }, abort: function () { c && c() } } : void 0 }), n.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /\b(?:java|ecma)script\b/ }, converters: { "text script": function (a) { return n.globalEval(a), a } } }), n.ajaxPrefilter("script", function (a) { void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET") }), n.ajaxTransport("script", function (a) { if (a.crossDomain) { var b, c; return { send: function (e, f) { b = n("<script>").prop({ charset: a.scriptCharset, src: a.url }).on("load error", c = function (a) { b.remove(), c = null, a && f("error" === a.type ? 404 : 200, a.type) }), d.head.appendChild(b[0]) }, abort: function () { c && c() } } } }); var Jb = [], Kb = /(=)\?(?=&|$)|\?\?/; n.ajaxSetup({ jsonp: "callback", jsonpCallback: function () { var a = Jb.pop() || n.expando + "_" + kb++; return this[a] = !0, a } }), n.ajaxPrefilter("json jsonp", function (b, c, d) { var e, f, g, h = b.jsonp !== !1 && (Kb.test(b.url) ? "url" : "string" == typeof b.data && 0 === (b.contentType || "").indexOf("application/x-www-form-urlencoded") && Kb.test(b.data) && "data"); return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Kb, "$1" + e) : b.jsonp !== !1 && (b.url += (lb.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () { return g || n.error(e + " was not called"), g[0] }, b.dataTypes[0] = "json", f = a[e], a[e] = function () { g = arguments }, d.always(function () { void 0 === f ? n(a).removeProp(e) : a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Jb.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0 }), "script") : void 0 }), n.parseHTML = function (a, b, c) { if (!a || "string" != typeof a) return null; "boolean" == typeof b && (c = b, b = !1), b = b || d; var e = x.exec(a), f = !c && []; return e ? [b.createElement(e[1])] : (e = ca([a], b, f), f && f.length && n(f).remove(), n.merge([], e.childNodes)) }; var Lb = n.fn.load; n.fn.load = function (a, b, c) { if ("string" != typeof a && Lb) return Lb.apply(this, arguments); var d, e, f, g = this, h = a.indexOf(" "); return h > -1 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && n.ajax({ url: a, type: e || "GET", dataType: "html", data: b }).done(function (a) { f = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a) }).always(c && function (a, b) { g.each(function () { c.apply(this, f || [a.responseText, b, a]) }) }), this }, n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) { n.fn[b] = function (a) { return this.on(b, a) } }), n.expr.filters.animated = function (a) { return n.grep(n.timers, function (b) { return a === b.elem }).length }; function Mb(a) { return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView } n.offset = { setOffset: function (a, b, c) { var d, e, f, g, h, i, j, k = n.css(a, "position"), l = n(a), m = {}; "static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, n.extend({}, h))), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m) } }, n.fn.extend({ offset: function (a) { if (arguments.length) return void 0 === a ? this : this.each(function (b) { n.offset.setOffset(this, a, b) }); var b, c, d = this[0], e = { top: 0, left: 0 }, f = d && d.ownerDocument; if (f) return b = f.documentElement, n.contains(b, d) ? (e = d.getBoundingClientRect(), c = Mb(f), { top: e.top + c.pageYOffset - b.clientTop, left: e.left + c.pageXOffset - b.clientLeft }) : e }, position: function () { if (this[0]) { var a, b, c = this[0], d = { top: 0, left: 0 }; return "fixed" === n.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (d = a.offset()), d.top += n.css(a[0], "borderTopWidth", !0), d.left += n.css(a[0], "borderLeftWidth", !0)), { top: b.top - d.top - n.css(c, "marginTop", !0), left: b.left - d.left - n.css(c, "marginLeft", !0) } } }, offsetParent: function () { return this.map(function () { var a = this.offsetParent; while (a && "static" === n.css(a, "position")) a = a.offsetParent; return a || Ea }) } }), n.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (a, b) { var c = "pageYOffset" === b; n.fn[a] = function (d) { return K(this, function (a, d, e) { var f = Mb(a); return void 0 === e ? f ? f[b] : a[d] : void (f ? f.scrollTo(c ? f.pageXOffset : e, c ? e : f.pageYOffset) : a[d] = e) }, a, d, arguments.length) } }), n.each(["top", "left"], function (a, b) { n.cssHooks[b] = Ga(l.pixelPosition, function (a, c) { return c ? (c = Fa(a, b), Ba.test(c) ? n(a).position()[b] + "px" : c) : void 0 }) }), n.each({ Height: "height", Width: "width" }, function (a, b) { n.each({ padding: "inner" + a, content: b, "": "outer" + a }, function (c, d) { n.fn[d] = function (d, e) { var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border"); return K(this, function (b, c, d) { var e; return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g) }, b, f ? d : void 0, f, null) } }) }), n.fn.extend({ bind: function (a, b, c) { return this.on(a, null, b, c) }, unbind: function (a, b) { return this.off(a, null, b) }, delegate: function (a, b, c, d) { return this.on(b, a, c, d) }, undelegate: function (a, b, c) { return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c) }, size: function () { return this.length } }), n.fn.andSelf = n.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () { return n }); var Nb = a.jQuery, Ob = a.$; return n.noConflict = function (b) { return a.$ === n && (a.$ = Ob), b && a.jQuery === n && (a.jQuery = Nb), n }, b || (a.jQuery = a.$ = n), n
});
/*! RESOURCE: /scripts/lib/jquery/jquery_no_conflict.js */
(function () {
    if (window.$j_glide) {
        jQuery.noConflict(true);
        window.jQuery = $j_glide;
    }
    window.$j = window.$j_glide = jQuery.noConflict();
})();
;
;
/*! RESOURCE: /scripts/lib/jquery/jquery_csrf.js */
(function ($) {
    setToken();
    CustomEvent.observe('ck_updated', setToken);
    function setToken() {
        $.ajaxPrefilter(function (options) {
            if (!options.crossDomain) {
                if (!options.headers)
                    options.headers = {};
                var token = window.g_ck || 'token_intentionally_left_blank';
                options.headers['X-UserToken'] = token;
            }
        });
    }
})(jQuery);
;
/*! RESOURCE: scripts/classes/WFStageSet.js */
var WFStageSet = (function () {
    function getWorkflowVersionFromQuery(qry) {
        if (!qry)
            return null;
        var exps = qry.split("^");
        for (var i = 0; i < exps.length; i++) {
            var exp = exps[i];
            var parts = exp.split('=');
            if (parts.length == 2 && parts[0].trim() == 'workflow_version' && parts[1].trim() != '')
                return parts[1].trim();
        }
        return null;
    }
    function exportStageSet(setName, workflowVersionId, filter) {
        var ga = new GlideAjax('WFStageSet');
        ga.addParam('sysparm_name', 'exportStageSet');
        ga.addParam('sysparm_set_name', setName);
        ga.addParam('sysparm_workflow', workflowVersionId);
        if (filter != null)
            ga.addParam('sysparm_filter', filter);
        ga.getXMLWait();
        return ga.getAnswer();
    }
    function importStages(source, workflowVersionId, setId) {
        var ga = new GlideAjax('WFStageSet');
        ga.addParam('sysparm_name', 'import' + source);
        ga.addParam('sysparm_set_id', setId);
        ga.addParam('sysparm_workflow', workflowVersionId);
        ga.getXMLWait();
        return ga.getAnswer();
    }
    function incrementCounter(table, column, sys_id, increment) {
        var ga = new GlideAjax('WFStageSet');
        ga.addParam('sysparm_name', 'incrementCounter');
        ga.addParam('sysparm_sys_id', sys_id);
        ga.addParam('sysparm_table', table);
        ga.addParam('sysparm_column', column);
        ga.addParam('sysparm_increment', increment);
        ga.getXMLWait();
        return ga.getAnswer();
    }
    function warnNoWorkflow(msg) {
        var dialog = new GlideDialogWindow('glide_warn');
        var msgs = new GwtMessage();
        dialog.setPreference('title', msgs.getMessage('Operation not supported.')
            + '<br/>'
            + msgs.getMessage(msg));
        dialog.render();
        return 'ok';
    }
    return {
        getWorkflowVersionFromQuery: getWorkflowVersionFromQuery,
        exportStageSet: exportStageSet,
        importStages: importStages,
        incrementCounter: incrementCounter,
        warnNoWorkflow: warnNoWorkflow
    }
}());
;
/*! RESOURCE: scripts/TestClient.js */
function popTestClient(test_definition, test_subject) {
    var test_execution;
    if (!test_subject)
        test_execution = test_definition;
    var dialog = new GlideDialogWindow('test_client', false, "50em", "25em");
    if (test_execution) {
        dialog.setPreference('sysparm_test_execution', test_execution);
    } else {
        dialog.setPreference('sysparm_test_definition', test_definition);
        dialog.setPreference('sysparm_test_subject', test_subject);
    }
    dialog.render();
}
var TestClient = Class.create();
TestClient.prototype = {
    TEST_STATES: ["Pending", "Running", "Succeeded", "Failed"],
    STATUS_IMAGES: ["images/workflow_skipped.gif",
        "images/loading_anim2.gifx", "images/workflow_complete.gifx",
        "images/workflow_rejected.gifx"],
    TRANSLATED_TEXT: ["Pending", "Running", "Succeeded", "Failed",
        "Details", "more", "Hide Details", "Show Details"],
    TIMEOUT_INTERVAL: 1000,
    translator: new GwtMessage(),
    detailStates: {},
    id: "",
    container: null,
    initialize: function (test_definition, test_subject) {
        this.container = $("container");
        this._setContainerStyles(this.container);
        this.translator.getMessages(this.TRANSLATED_TEXT);
        var test_execution;
        if (!test_subject) {
            this.id = test_definition
            return
        }
        this.testDefinition = test_definition;
        this.testSubject = test_subject;
    },
    start: function () {
        if (this.id) {
            this.getStatus();
            return;
        }
        var ga = new GlideAjax('AJAXTestProcessor');
        ga.addParam('sysparm_name', 'startTest');
        ga.addParam('sysparm_test_definition', this.testDefinition);
        ga.addParam('sysparm_test_subject', this.testSubject);
        ga.getXML(this.handleStart.bind(this));
    },
    handleStart: function (response) {
        this.id = response.responseXML.documentElement.getAttribute("answer");
        this.getStatus();
    },
    getStatus: function () {
        var ga = new GlideAjax('AJAXTestProcessor');
        ga.addParam('sysparm_name', 'getStatus');
        ga.addParam('sysparm_execution_id', this.id);
        if (typeof this.id != "string" || this.id == "")
            return;
        ga.getXML(this.handleGetStatus.bind(this));
    },
    handleGetStatus: function (response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        eval("var so = " + answer);
        this.renderStatus(so);
        this.container = $("container");
        if (this.container == null)
            return;
        if (so.state == "0" || so.state == "1")
            setTimeout(this.getStatus.bind(this), this.TIMEOUT_INTERVAL);
    },
    renderStatus: function (so) {
        if (!so)
            return;
        var new_container = new Element("div");
        this._setContainerStyles(new_container);
        new_container.appendChild(this.getStatusRow(so));
        this.container.replace(new_container);
        this.container = new_container;
    },
    getStatusRow: function (obj, order) {
        var name = obj.name;
        var state = obj.state;
        var message = obj.message;
        var percent = NaN;
        if (obj.percent_complete) {
            percent = parseInt(obj.percent_complete);
        }
        var hasPercent = (!isNaN(percent) && percent > 0 && percent <= 100);
        var hasDetails = (obj.results.length >= 1 || message != "");
        var tr = new Element("div", {
            id: "row_container-" + obj.sys_id
        });
        tr.style.padding = "5px";
        var simp = new Element("div");
        simp.appendChild(this._getImage(obj));
        simp.appendChild(this._getItemTitleElement(name, order));
        var det = this._getDetailElement();
        var dtl;
        if (hasDetails || hasPercent)
            dtl = det.appendChild(this._getShowDetailsLink(obj.sys_id));
        simp.appendChild(det);
        simp.appendChild(this._getFloatClear("both"));
        tr.appendChild(simp);
        if (hasDetails || hasPercent) {
            var dtd = new Element("div");
            var ddc = new Element("div");
            ddc.style.marginTop = ".5em";
            ddc.style.marginLeft = "30px";
            ddc.id = "detail_cont-" + obj.sys_id;
            dtd.appendChild(ddc);
            if (hasPercent) {
                ddc.appendChild(this._getProgressBar(percent));
                ddc.appendChild(this._getFloatClear("both"));
            }
            if (message != "") {
                var dds = new Element("div");
                dds.appendChild(this._getDetailsText(message, obj));
                dds.style.fontSize = "smaller";
                dds.style.marginBottom = ".5em";
                ddc.appendChild(dds);
            }
            dtl.details_container = ddc;
            if (typeof this.detailStates[obj.sys_id] == "boolean" && this.detailStates[obj.sys_id] == false && dtl != null)
                dtl.onclick();
            tr.appendChild(dtd);
            this.renderChildren(obj, ddc);
        }
        return tr;
    },
    _getItemTitleElement: function (name, order) {
        var nameHtml = "<b>" + name + "</b>";
        if (order) {
            nameHtml = "\t" + order + ".\t" + nameHtml;
        }
        var nsp = new Element("span");
        nsp.innerHTML = nameHtml;
        nsp.style.float = "left";
        return nsp;
    },
    _getImage: function (obj) {
        var state = obj.state;
        var si = new Element("img");
        si.id = "img-" + obj.sys_id;
        si.src = this.STATUS_IMAGES[state];
        si.style.marginRight = "10px";
        si.style.float = "left";
        si.title = this.TEST_STATES[state];
        return si;
    },
    _getDetailElement: function () {
        var det = new Element("span");
        det.style.marginLeft = "10px";
        det.style.float = "left";
        return det;
    },
    _getShowDetailsLink: function (objSysID) {
        var da = new Element("a");
        da.id = objSysID;
        da.controller = this;
        da.innerHTML = "(" + this.translator.getMessage("Hide Details") + ")";
        da.toggleText = "(" + this.translator.getMessage("Show Details") + ")";
        da.style.fontSize = "8pt";
        da.style.float = "left";
        da.onclick = this.__detailsToggle;
        return da;
    },
    __detailsToggle: function () {
        var cont = this.details_container;
        cont.toggle();
        this.controller.detailStates[this.id] = cont.visible();
        var nt = this.toggleText;
        this.toggleText = this.innerHTML;
        this.innerHTML = nt;
    },
    _getDetailsText: function (message, obj) {
        if (message.length > 150) {
            var new_message = new Element("span");
            new_message.innerHTML = "<b>"
                + this.translator.getMessage("Details") + ": </b>"
                + message.slice(0, 150) + "... ";
            var anch = new Element("a");
            anch.href = "test_execution.do?sys_id=" + obj.sys_id;
            anch.innerHTML = "<b>(" + this.translator.getMessage("more")
                + ")</b>";
            new_message.appendChild(anch);
            return new_message;
        } else {
            var new_message = new Element("span")
            new_message.innerHTML = "<b>"
                + this.translator.getMessage("Details") + ": </b>"
                + message;
            return new_message;
        }
    },
    _getProgressBar: function (percent) {
        percent = Math.max(0, Math.min(100, percent));
        var progressContainer = new Element("div");
        progressContainer.style.width = "300px";
        progressContainer.style.height = "8px";
        progressContainer.style.border = "1px solid black";
        progressContainer.style.borderRadius = "10px";
        progressContainer.style.padding = "2px";
        progressContainer.style.marginTop = "2px";
        progressContainer.style.marginBottom = "2px";
        progressContainer.style.float = "left";
        var progressBar = new Element("div");
        progressBar.style.width = percent + "%";
        progressBar.style.height = "100%";
        progressBar.style.borderRadius = "10px";
        progressBar.style.backgroundColor = "#667788";
        progressContainer.appendChild(progressBar);
        return progressContainer;
    },
    _getFloatClear: function (which) {
        var br = new Element("br");
        br.style.clear = which;
        return br;
    },
    renderChildren: function (so, pr_cont) {
        if (!so.results)
            return;
        for (var i = 0; i < so.results.length; i++) {
            pr_cont.appendChild(this.getStatusRow(so.results[i], i + 1)).style.marginLeft = "15px";
        }
    },
    _setContainerStyles: function (container) {
        container.id = "container";
        container.style.overflowY = "auto";
        container.style.maxHeight = "50em";
        container.style.marginRight = ".25em";
        container.style.marginLeft = ".25em";
    },
    type: 'TestClient'
};
;
/*! RESOURCE: scripts/labels.js */
var refreshRateProperty = "60";
var refreshLabelRate = (refreshRateProperty != null && refreshRateProperty > 0 ? refreshRateProperty : 60);
var refreshLabelTimer = null;
var g_label_status = initLabelStatus();
CustomEvent.observe('nav.loaded', refreshLabels);
function initLabelStatus() {
    var answer = new Object();
    answer.loading = false;
    answer.error_count = 0;
    return answer;
}
function refreshLabels() {
    var labelList = new Array();
    var divTags = document.getElementsByTagName('div');
    if (divTags) {
        for (var c = 0; c != divTags.length; ++c) {
            var divTag = divTags[c];
            var label = divTag.sclabel || divTag.getAttribute('sclabel');
            if (label && label == 'true') {
                var id = divTag.appid || divTag.getAttribute('appid');
                labelList.push(id);
            }
        }
    }
    startRefresh(labelList);
}
function clearLabelRefresh() {
    if (refreshLabelTimer == null)
        return;
    clearTimeout(refreshLabelTimer);
    refreshLabelTimer = null;
}
function startRefresh(labelRefresh) {
    clearLabelRefresh();
    if (labelRefresh.length < 1)
        return;
    if (labelsGetRequest(labelRefresh))
        refreshLabelTimer = setTimeout(refreshLabels, refreshLabelRate * 1000);
}
function labelsGetRequest(labelIds) {
    if (g_label_status.loading)
        return true;
    if (g_label_status.error_count > 3) {
        jslog('Stopped tag fetch due to excessive error counts');
        return false;
    }
    g_label_status.loading = true;
    var aj = new GlideAjax("LabelsAjax");
    aj.addParam("sysparm_value", labelIds.join(","));
    aj.addParam("sysparm_type", 'get');
    aj.getXML(labelsGetResponse);
    return true;
}
function labelsGetResponse(request) {
    g_label_status.loading = false;
    if (request.status == 200)
        g_label_status.error_count = 0;
    else
        g_label_status.error_count += 1;
    if (!request.responseXML)
        return;
    var labels = request.responseXML.getElementsByTagName("label");
    if (labels && labels.length > 0) {
        for (var i = 0; i < labels.length; i++) {
            var labelEntry = labels[i];
            updateMenuItems(labelEntry);
        }
    }
}
function updateMenuItems(labelElement) {
    var appid = labelElement.getAttribute("id");
    var divElem = gel('div.' + appid)
    var tds = divElem.getElementsByTagName("td");
    var appTD = tds[0];
    var notRead = 0;
    var span = gel(appid);
    var table = cel("table");
    var tbody = cel("tbody", table);
    var label;
    var items = labelElement.getElementsByTagName("item");
    if (items && items.length > 0) {
        for (var i = 0; i < items.length; i++) {
            label = items[i].getAttribute("label");
            var lid = items[i].getAttribute("name");
            var style = items[i].getAttribute("style");
            var read = items[i].getAttribute("read");
            if ("true" != read)
                notRead++;
            var url = items[i].getAttribute("url");
            var title = items[i].getAttribute("title");
            var image = items[i].getAttribute("image");
            createLabelMod(tbody, style, lid, url, title, image, appid);
        }
    }
    updateLabelReadCount(appTD, notRead);
    clearNodes(span)
    span.appendChild(table);
    table = null;
}
function createLabelMod(parent, style, id, url, title, image, appid) {
    var tr = cel("tr", parent);
    var scrollIcon = isTextDirectionRTL() ? "images/scroll_lft.gifx" : "images/scroll_rt.gifx";
    if (image == "images/s.gifx")
        image = scrollIcon;
    var img;
    if (image == null || image == '')
        img = '<img style="width:16px; cursor:hand" src="images/icons/remove.gifx" alt="Click me to remove the tag entry" onmouseover="this.src = \'images/closex_hover.gifx\'" onmouseout="this.src = \'images/icons/remove.gifx\'" src="images/icons/remove.gifx"/>';
    else
        img = "<img style='width:16px' src='" + image + "' alt='' />";
    var tdimg = cel("td", tr);
    tdimg.style.width = "16px";
    var tdhtml;
    if (image == scrollIcon)
        tdhtml = img;
    else
        tdhtml = '<a onclick="removeLabel(\'' + appid + '\',\'' + id + '\');" onmouseover="this.src = \'images/closex_hover.gifx\'" onmouseout="this.src = \'images/icons/remove.gifx\'" title="Click me to remove the tag entry">' + img + '</a>';
    tdimg.innerHTML = tdhtml;
    var td = cel("td", tr);
    var html = '<a class="menulabel" style="' + style + '" id= "' + id + '"';
    html += ' target="gsft_main" href="' + url + '">' + title + '</a>';
    td.innerHTML = html;
    tr = null;
    tdimg = null;
    td = null;
}
function updateLabelReadCount(appTD, notRead) {
    var inner = appTD.innerHTML;
    var term = '</H2>';
    var paren = inner.indexOf("</H2>");
    if (paren < 0) {
        paren = inner.indexOf("</h2");
        term = '</h2>';
    }
    if (paren > -1) {
        inner = inner.substring(0, paren);
        paren--;
        var c = inner.substring(paren, paren + 1);
        if (c == ')') {
            while (paren > 0 && c != '(') {
                paren--;
                c = inner.substring(paren, paren + 1)
            }
            if (paren > 0) {
                inner = inner.substring(0, paren);
            }
        }
        inner = inner.trim();
        if (notRead > 0)
            inner = inner + ' (' + notRead + ')';
        inner = inner + term;
        clearNodes(appTD);
        appTD.innerHTML = inner;
    }
}
function doAssignLabel(tableName, label, sysId) {
    var form = getFormByTableName(tableName);
    if (sysId == null || !sysId) {
        if (!populateParmQuery(form, '', 'NULL'))
            return false;
    } else {
        addInput(form, 'HIDDEN', 'sysparm_checked_items', sysId);
    }
    if (!label && typeof option != 'undefined' && option.getAttribute("gsft_base_label"))
        label = option.getAttribute("gsft_base_label");
    addInput(form, 'HIDDEN', 'sys_action', 'java:com.glide.labels.LabelActions');
    addInput(form, 'HIDDEN', 'sys_action_type', 'assign_label');
    addInput(form, 'HIDDEN', 'sysparm_label_picked', label);
    form.submit();
}
function doRemoveLabel(tableName, label, sysId) {
    var form = getFormByTableName(tableName);
    if (sysId == null || !sysId) {
        if (!populateParmQuery(form, '', 'NULL'))
            return false;
    } else {
        addInput(form, 'HIDDEN', 'sysparm_checked_items', sysId);
    }
    if (!label && typeof option != 'undefined' && option.getAttribute("gsft_base_label"))
        label = option.getAttribute("gsft_base_label");
    addInput(form, 'HIDDEN', 'sys_action', 'java:com.glide.labels.LabelActions');
    addInput(form, 'HIDDEN', 'sys_action_type', 'remove_label');
    addInput(form, 'HIDDEN', 'sysparm_label_picked', label);
    form.submit();
}
function assignLabelActionViaLookupModal(tableName, listId) {
    var list = GlideList2.get(listId);
    if (!list)
        return;
    var sysIds = list.getChecked();
    if (!sysIds)
        return;
    assignLabelViaLookup(tableName, sysIds, list.getView());
}
function assignLabelViaLookup(tableName, sysId, viewName) {
    var assignCallback = function (labelId) {
        assignLabel(labelId, tableName, sysId, viewName);
    };
    showLabelLookupWindow("Assign Tag", tableName, sysId, assignCallback);
}
function removeLabelActionViaLookupModal(tableName, listId) {
    var list = GlideList2.get(listId);
    if (!list)
        return;
    var sysIds = list.getChecked();
    if (!sysIds)
        return;
    removeLabelViaLookup(tableName, sysIds);
}
function removeLabelViaLookup(tableName, sysId) {
    var removeCallback = function (labelId) {
        removeLabelById(labelId, sysId);
    };
    showLabelLookupWindow("Remove Tag", tableName, sysId, removeCallback);
}
function showLabelLookupWindow(actionName, tableName, sysID, callback) {
    var tagLookupForm = new GlideDialogWindow("tag_lookup_form");
    tagLookupForm.setTitle(actionName);
    tagLookupForm.setPreference("sys_ids", sysID);
    tagLookupForm.setPreference("table_name", tableName);
    tagLookupForm.setPreference('on_accept', callback);
    tagLookupForm.removeCloseDecoration();
    tagLookupForm.render();
}
function newLabel(tableName, sysID, callback, focusTrap) {
    var isDoctype = document.documentElement.getAttribute("data-doctype") == "true";
    if (isDoctype) {
        var tagForm = new GlideDialogWindow("tag_form");
        tagForm.setTitle("");
        tagForm.setPreference("sys_ids", sysID);
        tagForm.setPreference("table_name", tableName);
        tagForm.removeCloseDecoration();
        tagForm.render();
        if (focusTrap) {
            $j('#tag_form').on('ft-ready', function () { tagForm.enableFocusTrap(); });
            $j('#tag_form').on('select2-open', function () { tagForm.disableFocusTrap(); });
            $j('#tag_form').on('select2-close', function () { tagForm.enableFocusTrap(); });
        }
    } else {
        var keys = ["Please enter the name for the new tag", "New tag"];
        var msgs = getMessages(keys);
        if (!callback)
            gsftPrompt(msgs["New tag"], msgs["Please enter the name for the new tag"], function (labelName) { newLabelRequest(tableName, labelName, sysID) });
        else
            gsftPrompt(msgs["New tag"], msgs["Please enter the name for the new tag"], callback);
    }
}
function newLabelRequest(tableName, labelName, sysID) {
    if (labelName == null)
        return;
    var viewName;
    var view = gel('sysparm_view');
    if (view != null)
        viewName = view.value;
    assignLabel(labelName, tableName, sysID, viewName);
}
function assignLabel(labelName, tableName, sysId, viewName) {
    if (!labelName)
        return;
    var url = new GlideAjax("LabelsAjax");
    url.addParam("sysparm_name", tableName);
    url.addParam("sysparm_value", sysId);
    url.addParam("sysparm_chars", labelName);
    url.addParam("sysparm_type", "create");
    if (viewName)
        url.addParam("sysparm_view", viewName);
    url.getXML(refreshNavIfNotDoctypeUI);
}
function removeLabel(appid, labelid) {
    var aj = new GlideAjax("LabelsAjax");
    aj.addParam("sysparm_name", appid);
    aj.addParam("sysparm_value", labelid);
    aj.addParam("sysparm_type", 'delete');
    aj.getXML(removeLabelResponse);
}
function removeLabelByName(labelName, sysId) {
    var aj = new GlideAjax("LabelsAjax");
    aj.addParam("sysparm_name", labelName);
    aj.addParam("sysparm_value", sysId);
    aj.addParam("sysparm_type", 'removeByName');
    aj.getXML(refreshNavIfNotDoctypeUI);
}
function removeLabelById(labelId, sysId) {
    var aj = new GlideAjax("LabelsAjax");
    aj.addParam("sysparm_name", labelId);
    aj.addParam("sysparm_value", sysId);
    aj.addParam("sysparm_type", 'remove');
    aj.getXML(refreshNavIfNotDoctypeUI);
}
function removeLabelResponse(response, args) {
    var labelId = response.responseXML.documentElement.getAttribute("sysparm_name");
    if (!labelId)
        refreshNavIfNotDoctypeUI();
    else {
        var labelIds = new Array();
        labelIds.push(labelId);
        labelsGetRequest(labelIds);
    }
}
function newLabelPromptListAction(tableName, listId) {
    var nonDoctypeUICallback = function (labelName) { assignLabelToCheckedSysIds(labelName, tableName, listId) };
    var list = GlideList2.get(listId);
    if (!list)
        return;
    var sysIds = list.getChecked();
    if (!sysIds)
        return;
    newLabel(tableName, sysIds, nonDoctypeUICallback, true);
}
function assignLabelToCheckedSysIds(labelName, tableName, listId) {
    if (!labelName || labelName.strip() == '')
        return;
    var list = GlideList2.get(listId);
    if (!list)
        return;
    var sysIds = list.getChecked();
    if (!sysIds)
        return;
    assignLabel(labelName, tableName, sysIds, list.getView());
}
function removeLabelFromCheckedSysIds(labelName, listId) {
    var list = GlideList2.get(listId);
    var sysIds = list.getChecked();
    if (!sysIds)
        return;
    removeLabelByName(labelName, sysIds);
}
function getFormByTableName(tableName) {
    var form = getControlForm(tableName);
    if (!form)
        form = document.forms[tableName + '.do'];
    return form;
}
function refreshNavIfNotDoctypeUI() {
    var isDoctype = document.documentElement.getAttribute("data-doctype") == "true";
    if (!isDoctype)
        refreshNav();
}
;
/*! RESOURCE: scripts/SNCredStoreFormUtil.js */
var SNCredStoreFormUtil = {
    mandatoryFieldMap: {
        name: 'Name',
        type: 'Type',
        hostname: 'Hostname',
    },
    validateMandatoryFields: function () {
        var unfilledMandatoryFields = [];
        for (var key in this.mandatoryFieldMap) {
            g_form.hideErrorBox(key);
            if (!g_form.getValue(key)) {
                g_form.showErrorBox(key, this.mandatoryFieldMap[key] + " is required");
                unfilledMandatoryFields.push(this.mandatoryFieldMap[key]);
            }
        }
        if (unfilledMandatoryFields.length > 0)
            g_form.addErrorMessage(g_scratchpad.unfilledMandatoryFieldsMsg + unfilledMandatoryFields.join());
        return unfilledMandatoryFields;
    },
    isValidHistoryLimit: function () {
        var limit;
        if (g_form.getBooleanValue('enforce_history_policy')) {
            limit = this.getPwdHistoryLimit();
            if (limit === -1) {
                g_form.addErrorMessage(g_scratchpad.mandatoryHistoryParamMsg);
                return false;
            }
        }
        return true;
    },
    _showHistoryLimitConfirmation: function (newLimit, oldLimit, action) {
        var modal = new GlideModal('pwd_history_change_confirmation');
        modal.setTitle('Confirmation');
        modal.setPreference('sysparm_old_limit', oldLimit);
        modal.setPreference('sysparm_new_limit', newLimit);
        modal.setPreference('sysparm_action', action);
        modal.setPreference('sysparm_conf_type', 'limit_decrease_confirmation');
        modal.setWidth(350);
        modal.render();
    },
    _showEnforceHistoryUncheckConfirmation: function (action) {
        var modal = new GlideModal('pwd_history_change_confirmation');
        modal.setTitle('Confirmation');
        modal.setPreference('sysparm_action', action);
        modal.setPreference('sysparm_conf_type', 'history_uncheck_confirmation');
        modal.setWidth(350);
        modal.render();
    },
    getPwdHistoryLimit: function () {
        var list = GlideList2.getListsForTable('pwd_cred_store_param')[0];
        if (list) {
            var numRows = list.table.rows.length;
            for (var i = 1; i < numRows - 1; i++) {
                var curRow = list.table.rows[i];
                var paramId = curRow.getAttribute('sys_id');
                var paramName = list.getCell(paramId, 'name').textContent;
                if (paramName == 'password_history_limit') {
                    if (curRow.className.indexOf("list_delete") > 0) {
                        return -1;
                    }
                    if (list.getCell(paramId, 'value').textContent)
                        return parseInt(list.getCell(paramId, 'value').textContent);
                    return -1;
                }
            }
        }
        return -1;
    },
    save: function () {
        this.saveOrSubmit("save");
    },
    update: function () {
        this.saveOrSubmit("submit");
    },
    saveOrSubmit: function (action) {
        if (!action)
            action = "submit";
        var hasIssues = false;
        if (this.validateMandatoryFields().length > 0) {
            hasIssues = true;
            return;
        }
        if (!g_form.getBooleanValue('enforce_history_policy') && g_scratchpad.cur_enforce_history_policy) {
            hasIssues = true
            this._showEnforceHistoryUncheckConfirmation(action);
        }
        if (g_form.getBooleanValue('enforce_history_policy')) {
            if (!this.isValidHistoryLimit()) {
                hasIssues = true;
                return;
            }
            var newLimit = this.getPwdHistoryLimit();
            var oldLimit = g_scratchpad.cur_password_history_limit;
            if (newLimit < oldLimit) {
                hasIssues = true;
                this._showHistoryLimitConfirmation(newLimit, oldLimit, action);
            }
        }
        if (!hasIssues) {
            if (action == "submit") {
                gsftSubmit(null, g_form.getFormElement(), "sysverb_update");
                return;
            }
            gsftSubmit(null, g_form.getFormElement(), "sysverb_update_and_stay");
        }
    }
};
;
/*! RESOURCE: scripts/OpticsInspector.js */
var OpticsInspector = Class
    .create({
        CATEGORIES: {
            "sys_script": "BUSINESS RULE",
            "sys_script_client": "CLIENT SCRIPT",
            "data_lookup": "DATA LOOKUP",
            "sys_data_policy2": "DATA POLICY",
            "ui_policy": "UI POLICY",
            "wf_context": "WORKFLOW",
            "request_action": "REQUEST ACTION",
            "script_engine": "SCRIPT ENGINE",
            "wf_activity": "WORKFLOW ACTIVITY",
            "acl": "ACL",
            "sys_ui_action": "UI ACTION",
            "reference_qual": "REFERENCE QUALIFIER QUERY",
            "container_action": "CONTAINER ACTION"
        },
        initialize: function () {
            this.opticsContextStack = new Array();
            this.tableName = null;
            this.fieldName = null;
            this.enabled = false;
        },
        pushOpticsContext: function (category, name, sys_id, sourceTable) {
            if (category == 'sys_script_client')
                name = "\"" + name + "\"";
            var context = {
                "category": category,
                "name": name,
                "sys_id": sys_id,
                "startTime": new Date(),
                actions: [],
                type: 'context',
                "sourceTable": sourceTable || category
            };
            if ((typeof g_form !== 'undefined') && g_form.actionStack)
                g_form.actionStack.push(context);
            if (this.isInspecting() && category !== 'container_action')
                this.opticsContextStack.push(context);
        },
        popOpticsContext: function () {
            var context;
            if ((typeof g_form !== 'undefined') && g_form.actionStack) {
                context = g_form.actionStack.pop();
                if (g_form._pushAction)
                    g_form._pushAction(context);
            }
            if (this.isInspecting() && this.opticsContextStack.length > 0 && (context && context.category !== 'container_action'))
                return this.opticsContextStack.pop();
            return null;
        },
        isInspecting: function (tableName, fieldName) {
            if (this.tableName == null && this.fieldName == null)
                return false;
            if (arguments.length == 0)
                return (this.tableName && this.tableName.length > 0
                    && this.fieldName && this.fieldName.length > 0);
            if (arguments.length == 2)
                return tableName == this.tableName
                    && fieldName == this.fieldName;
            return false;
        },
        getTableName: function () {
            return (this.tableName && this.tableName.length > 0) ? this.tableName
                : '';
        },
        getFieldName: function () {
            return (this.fieldName && this.fieldName.length > 0) ? this.fieldName
                : '';
        },
        hideWatchIcons: function () {
            if (isDoctype()) {
                $$(".icon-debug.watch_icon").each(function (element) {
                    $(element).hide()
                });
            } else {
                $$("img.watch_icon").each(function (element) {
                    $(element).hide()
                });
            }
        },
        addWatchIcon: function (watchField) {
            if (!watchField) {
                return;
            }
            var td = $('label.' + watchField);
            if (!td) {
                var fieldParts = watchField.split(".");
                if ((fieldParts.length == 2 && fieldParts[0].length > 0 && fieldParts[1].length > 0)) {
                    td = $('label_' + fieldParts[1]);
                    if (td && td.tagName !== 'TD') {
                        var tds = td.getElementsByTagName("TD");
                        if (tds && tds.length > 0) {
                            td = tds[0];
                        }
                    }
                    if (!td) {
                        td = $('ni.' + fieldParts[1] + '_label');
                    }
                }
            }
            var icon;
            if (td) {
                if (isDoctype()) {
                    var label = td.select('label');
                    if (label.length > 0) {
                        label = label[0];
                    } else {
                        label = td.select('legend');
                        if (label.length > 0) {
                            label = label[0];
                        } else if (td.nodeName == "LABEL") {
                            label = td;
                        }
                    }
                    icon = '<span class="label-icon icon-debug watch_icon" id="'
                        + watchField
                        + '.watch_icon"'
                        + ' onclick="CustomEvent.fireTop(\'showFieldWatcher\')" '
                        + ' src="images/debug.gifx" '
                        + ' alt="Field is being watched"'
                        + ' title="Field is being watched"></span>';
                    if (label) {
                        $(label).insert(icon);
                    }
                } else {
                    if (fieldParts.length === 2
                        && fieldParts[1].startsWith("IO:")) {
                        var legend = td.select('legend');
                        if (legend.length > 0) {
                            td = legend[0];
                        }
                    }
                    icon = '<img class="watch_icon" id="'
                        + watchField
                        + '.watch_icon"'
                        + ' onclick="CustomEvent.fireTop(\'showFieldWatcher\')" '
                        + ' src="images/debug.gifx" '
                        + ' alt="Field is being watched"'
                        + ' title="Field is being watched" />';
                    td.insert(icon);
                }
            }
        },
        clearWatchField: function (watchfield) {
            this.opticsContextStack = new Array();
            this.tableName = null;
            this.fieldName = null;
            this.hideWatchIcons();
            var debuggerTools = getTopWindow().debuggerTools;
            if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                var wndw = debuggerTools.getJsDebugWindow();
                if (wndw.updateFieldInfo)
                    wndw.updateFieldInfo(null);
            } else {
                debuggerTools = parent.parent.debuggerTools;
                if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                    var wndw = debuggerTools.getJsDebugWindow();
                    if (wndw.updateFieldInfo)
                        wndw.updateFieldInfo(null);
                }
            }
        },
        setWatchField: function (watchField) {
            if (!watchField)
                return;
            var fieldParts = watchField.split(".");
            if (!(fieldParts.length == 2 && fieldParts[0].length > 0 && fieldParts[1].length > 0))
                return;
            this.tableName = fieldParts[0];
            this.fieldName = fieldParts[1];
            this.hideWatchIcons();
            var icon = $(watchField + ".watch_icon");
            if (icon) {
                icon.show();
            }
            else {
                this.addWatchIcon(watchField);
            }
            var debuggerTools = getTopWindow().debuggerTools;
            if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                var wndw = debuggerTools.getJsDebugWindow();
                if (wndw.updateFieldInfo)
                    wndw.updateFieldInfo(watchField);
            } else {
                debuggerTools = parent.parent.debuggerTools;
                if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                    var wndw = debuggerTools.getJsDebugWindow();
                    if (wndw.updateFieldInfo)
                        wndw.updateFieldInfo(watchField);
                }
            }
        },
        showWatchField: function (watchField) {
            var debuggerTools = getTopWindow().debuggerTools;
            if (debuggerTools) {
                if (!debuggerTools.isDebugPanelVisible())
                    debuggerTools.showFieldWatcher();
                setWatchField(watchField);
            } else {
                debuggerTools = parent.parent.debuggerTools;
                if (debuggerTools) {
                    if (!debuggerTools.isDebugPanelVisible())
                        debuggerTools.showFieldWatcher();
                    setWatchField(watchField);
                }
            }
        },
        processClientMessage: function (notification) {
            var opticsContext = this.opticsContextStack[this.opticsContextStack.length - 1];
            if (!opticsContext) {
                jslog("No optics context found");
                return;
            }
            var info = {
                type: 'CLIENT ',
                message: notification.message,
                message_type: "static",
                category: opticsContext.category,
                name: opticsContext.name,
                level: this.opticsContextStack.length,
                time: getFormattedTime(new Date()),
                call_trace: this._getCallTrace(this.opticsContextStack),
                sys_id: opticsContext["sys_id"],
                sourceTable: opticsContext["sourceTable"]
            };
            if (notification["oldvalue"] && notification["newvalue"]) {
                info.message_type = "change";
                info.oldvalue = notification["oldvalue"];
                info.newvalue = notification["newvalue"];
            }
            this.process(info);
        },
        processServerMessages: function () {
            var spans = $$('span[data-type="optics_debug"]');
            for (var i = 0; i < spans.length; i++) {
                var notification = new GlideUINotification({
                    xml: spans[i]
                });
                this.processServerMessage(notification);
                spans[i].setAttribute("data-attr-processed", "true");
            }
        },
        processServerMessage: function (notification) {
            if (notification.getAttribute('processed') == "true")
                return;
            var info = {
                type: 'SERVER',
                category: notification.getAttribute('category'),
                name: notification.getAttribute('name'),
                message: notification.getAttribute('message'),
                message_type: notification.getAttribute('message_type'),
                oldvalue: notification.getAttribute('oldvalue'),
                newvalue: notification.getAttribute('newvalue'),
                level: notification.getAttribute('level'),
                time: notification.getAttribute('time'),
                sys_id: notification.getAttribute('sys_id'),
                sourceTable: notification.getAttribute('sourceTable'),
                call_trace: this._getCallTrace(eval(notification
                    .getAttribute('call_trace')))
            };
            this.process(info);
        },
        process: function (notification) {
            var msg = '<div class="debug_line ' + notification['category'] + '">' + this._getMessage(notification) + '</div>';
            this._log(msg);
        },
        addLine: function () {
            this._log('<hr class="logs-divider"/>');
        },
        openScriptWindow: function (tablename, sysid) {
            if (tablename && sysid) {
                if (tablename == "request_action")
                    tablename = "sys_ui_action";
                var url = "/" + tablename + ".do?sys_id=" + sysid;
                window.open(url, "tablewindow");
            }
        },
        _log: function (msg) {
            var debuggerTools = getTopWindow().debuggerTools;
            if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                var wndw = debuggerTools.getJsDebugWindow();
                if (wndw.insertJsDebugMsg)
                    wndw.insertJsDebugMsg(msg);
            } else {
                if (parent && parent.parent) {
                    debuggerTools = parent.parent.debuggerTools;
                    if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
                        var wndw = debuggerTools.getJsDebugWindow();
                        if (wndw.insertJsDebugMsg)
                            wndw.insertJsDebugMsg(msg);
                    }
                }
            }
        },
        _getCallTrace: function (contextStack) {
            var trace = '';
            var arrows = '<span class="rtl-arrow"> &larr;</span><span class="lrt-arrow">&rarr; </span>';
            var space = arrows;
            for (i = 0, maxi = contextStack.length; i < maxi; i++) {
                var context = contextStack[i];
                if (i > 0)
                    space = arrows + space;
                if (context['name'] && context['name'].length > 0)
                    trace += '<div>' + space
                        + this._getCategoryName(context['category'])
                        + '&nbsp;-&nbsp;' + context['name'] + '</div>';
                else
                    trace += '<div>' + space
                        + this._getCategoryName(context['category'])
                        + '</div>';
            }
            if (trace && trace.length > 0)
                trace = '<div class="call_trace">' + trace + '</div>';
            return trace;
        },
        _getMessage: function (notification) {
            var notif_type = notification['type'];
            var legend_title = (notif_type.indexOf('CLIENT') > -1) ? 'Client-side activity'
                : 'Server-side activity';
            var msg = '<span class="expand-button" onclick="toggleCallTrace(this);">&nbsp;</span>';
            msg += '<img class="infoIcon" height="16"  width="16" border="0" src="images/info-icon.png" title="'
                + legend_title + '" alt="' + legend_title + '">';
            msg += '<span class="log-time ' + notif_type + '">'
                + notification['time'] + '</span>';
            msg += '<span class="log-category">'
                + this.CATEGORIES[notification['category']];
            if (notification['name'] && notification['name'].length > 0) {
                if (notification["sys_id"])
                    msg += '&nbsp;-&nbsp;<a data-tablename="'
                        + notification['sourceTable']
                        + '" data-sys_id="'
                        + notification['sys_id']
                        + '" onclick="javascript:openScriptWindow(this);">'
                        + notification['name'] + '</a></span>';
                else
                    msg += '&nbsp;-&nbsp;' + notification['name']
                        + '</span>';
            } else
                msg += '</span>';
            msg += '<span class="log-value">';
            if ("request_action" === notification['category']) {
                msg += 'Value received from client is: <span class="value" title="Value">'
                    + notification['message'] + '</span>';
            } else if (notification["message_type"] == "change") {
                msg += '<span>'
                    + notification["oldvalue"]
                    + '</span><span class="rtl-arrow"> &larr; </span><span class="lrt-arrow"> &rarr; </span><span>'
                    + notification["newvalue"] + '</span>';
            } else {
                msg += notification['message'];
            }
            msg += '</span>';
            msg += notification['call_trace'];
            return msg;
        },
        _getCategoryName: function (category) {
            var name = this.CATEGORIES[category];
            if (name === 'undefined' || name === null)
                name = category;
            return name;
        },
        _getLevelStr: function (level) {
            if (level == 'undefined' || level == null || level <= 0)
                level = 1;
            var levelStr = '';
            for (i = 0; i < level; i++)
                levelStr += '-';
            return levelStr + '>';
        },
        toString: function () {
            return 'OpticsInspector';
        }
    });
var g_optics_inspect_handler = new OpticsInspector();
OpticsInspector.WATCH_EVENT = 'glide:ui_notification.optics_debug';
OpticsInspector.WATCH_EVENT_UI = 'glide:ui_notification.optics_debug_ui';
OpticsInspector.WATCH_FIELD = 'glide_optics_inspect_watchfield';
OpticsInspector.SHOW_WATCH_FIELD = 'glide_optics_inspect_watchfield';
OpticsInspector.UPDATE_WATCH_FIELD = 'glide_optics_inspect_update_watchfield';
OpticsInspector.CLEAR_WATCH_FIELD = 'glide_optics_inspect_clear_watchfield';
OpticsInspector.SHOW_WATCH_FIELD = 'glide_optics_inspect_show_watchfield';
OpticsInspector.PUT_CONTEXT = 'glide_optics_inspect_put_context';
OpticsInspector.POP_CONTEXT = 'glide_optics_inspect_pop_context';
OpticsInspector.PUT_CS_CONTEXT = 'glide_optics_inspect_put_cs_context';
OpticsInspector.POP_CS_CONTEXT = 'glide_optics_inspect_pop_cs_context';
OpticsInspector.PUT_CONTEXT = 'glide_optics_inspect_put_context';
OpticsInspector.POP_CONTEXT = 'glide_optics_inspect_pop_context';
OpticsInspector.LOG_MESSAGE = 'glide_optics_inspect_log_message';
OpticsInspector.WINDOW_OPEN = 'glide_optics_inspect_window_open';
function getClientScriptContextName(name, type) {
    var csname = null;
    if (type === "submit")
        csname = g_event_handlers_onSubmit[name];
    else if (type === "load")
        csname = g_event_handlers_onLoad[name];
    else if (type === "change")
        csname = g_event_handlers_onChange[name];
    return csname;
}
CustomEvent.observe(OpticsInspector.PUT_CONTEXT, function (category, name, sys_id, sourceTable) {
    g_optics_inspect_handler.pushOpticsContext(category, name, sys_id, sourceTable);
});
CustomEvent.observe(OpticsInspector.POP_CONTEXT, function () {
    g_optics_inspect_handler.popOpticsContext();
});
CustomEvent.observe(OpticsInspector.PUT_CS_CONTEXT, function (name, type) {
    var csname = getClientScriptContextName(name, type);
    if (csname)
        g_optics_inspect_handler.pushOpticsContext("sys_script_client", csname,
            g_event_handler_ids[name]);
});
CustomEvent.observe(OpticsInspector.POP_CS_CONTEXT, function (name, type) {
    var csname = getClientScriptContextName(name, type);
    if (csname)
        g_optics_inspect_handler.popOpticsContext();
});
CustomEvent.observe(OpticsInspector.LOG_MESSAGE, function (notification) {
    if (g_optics_inspect_handler.isInspecting(notification["table"],
        notification["field"])) {
        g_optics_inspect_handler.processClientMessage(notification);
    }
});
CustomEvent.observe(OpticsInspector.WATCH_EVENT_UI, function (notification) {
    g_optics_inspect_handler.process(notification);
});
CustomEvent.observe(OpticsInspector.WATCH_EVENT, function (notification) {
    g_optics_inspect_handler.processServerMessage(notification);
});
CustomEvent.observe(OpticsInspector.WATCH_FIELD, function (watchfield) {
    g_optics_inspect_handler.setWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.SHOW_WATCH_FIELD, function (watchfield) {
    g_optics_inspect_handler.showWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.CLEAR_WATCH_FIELD, function (watchfield) {
    g_optics_inspect_handler.clearWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.UPDATE_WATCH_FIELD, function (watchfield) {
    g_optics_inspect_handler.setWatchField(watchfield);
    if (window.name !== "jsdebugger") {
        g_optics_inspect_handler.addLine();
        g_optics_inspect_handler.processServerMessages();
    }
});
;
/*! RESOURCE: scripts/classes/GlideMenu.js */
var GlideMenu = Class.create();
GlideMenu.prototype = {
    initialize: function (idSuffix, type) {
        this.suffix = idSuffix;
        this.type = type;
        this.clear();
    },
    destroy: function () {
        this.clear();
    },
    clear: function () {
        this.menuItems = [];
        this.variables = {};
        this.onShowScripts = [];
    },
    isEmpty: function () {
        var e = gel('context.' + this.type + "." + this.suffix);
        if (e) {
            var script = e.innerHTML;
            if (window.execScript)
                window.execScript(script);
            else
                eval.call(window, script);
            Element.remove(e);
        }
        for (var i = 0; i < this.menuItems.length; i++) {
            if (this.menuItems[i].parentId == '')
                return false;
        }
        return true;
    },
    load: function () {
    },
    add: function (sysId, id, parentId, label, type, action, order, img, trackSelected) {
        var item = {};
        item.sysId = sysId;
        item.id = id;
        item.parentId = parentId;
        item.label = label;
        item.type = type;
        item.action = action || "";
        item.order = order;
        item.image = img;
        item.trackSelected = (trackSelected == "true");
        this._add(item);
    },
    addItem: function (id, parentId, label, type, action, order, img, trackSelected, onShowScript) {
        var item = {};
        item.id = id;
        item.parentId = parentId;
        item.label = label;
        item.type = type;
        item.action = action;
        item.order = order;
        item.image = img;
        item.trackSelected = (trackSelected == "true");
        item.onShowScript = onShowScript;
        this._add(item);
    },
    _add: function (item) {
        if (!item.order)
            item.order = 0;
        this.menuItems.push(item);
    },
    increaseItemsOrder: function (increase) {
        for (var i = 0; i < this.menuItems.length; i++)
            this.menuItems[i].order += increase;
    },
    addAction: function (label, action, order) {
        this.addItem("", "", label, "action", action, order);
    },
    showContextMenu: function (evt, id, variables) {
        this.variables = variables;
        id += this.suffix;
        if (!getMenuByName(id))
            this._createMenu(id);
        var cm = getMenuByName(id);
        if (cm.context.isEmpty())
            return;
        this._loadVariables(variables);
        for (var i = 0; i < this.onShowScripts.length; i++) {
            var onShow = this.onShowScripts[i];
            g_menu = getMenuByName(onShow.menuId);
            if (!g_menu)
                continue;
            g_menu = g_menu.context;
            if (!g_menu)
                continue;
            g_item = g_menu.getItem(onShow.itemId);
            if (!g_item)
                continue;
            this._runOnShowScript(onShow.script, onShow.itemId);
        }
        this._clearVariables(variables);
        g_menu = null;
        g_item = null;
        return contextShow(evt, id, 0, 0, 0, 0);
    },
    _createMenu: function (id) {
        var cm = new GwtContextMenu(id);
        cm.clear();
        this._sort();
        this._buildMenu("", cm);
    },
    _sort: function () {
        this.menuItems = this.menuItems.sort(function (a, b) {
            var aOrder = parseInt("0" + a.order, 10);
            var bOrder = parseInt("0" + b.order, 10);
            if ((aOrder) < (bOrder)) {
                return -1;
            }
            if ((aOrder) > (bOrder)) {
                return 1;
            }
            return 0;
        });
    },
    _buildMenu: function (parentId, cm) {
        var lastType;
        var itemsAfterLine = 0;
        for (var i = 0; i < this.menuItems.length; i++) {
            var item = this.menuItems[i];
            if (parentId != item.parentId)
                continue;
            if (lastType == "line" && item.type == "line")
                continue;
            if (lastType == "line" && itemsAfterLine > 0) {
                this._addLine(cm);
                itemsAfterLine = 0;
            }
            lastType = item.type;
            if (lastType == "line")
                continue;
            if (this._addMenuItem(cm, item))
                itemsAfterLine++;
        }
    },
    _addLine: function (cm) {
        cm.addLine();
    },
    _addMenuItem: function (cm, item) {
        var added = true;
        var mi;
        if (item.type == "action") {
            if (!this._getAction(item))
                mi = cm.addLabel(item.label);
            else
                mi = cm.addFunc(item.label, this._runMenuAction.bind(this, item), item.id);
        } else if (item.type == "label") {
            mi = cm.addLabel(item.label);
        } else if (item.type == "menu") {
            var sm = new GwtContextMenu(item.id + '_' + this.suffix);
            if (item.trackSelected)
                sm.setTrackSelected(true);
            this._buildMenu(item.id, sm);
            if (sm.isEmpty())
                added = false;
            else
                mi = cm.addMenu(item.label, sm, item.id);
        }
        if (mi && item.image)
            cm.setImage(mi, item.image);
        if (added && this._getOnShowScript(item)) {
            var o = {};
            o.menuId = cm.id;
            o.itemId = item.id;
            o.script = this._getOnShowScript(item);
            this.onShowScripts.push(o);
        }
        return added;
    },
    _getAction: function (item) {
        var action = '';
        if (item.action)
            action = item.action;
        if (item.sysId)
            action += '\n' + GlideMenu.scripts[item.sysId];
        return action;
    },
    _getOnShowScript: function (item) {
        if (item.sysId)
            return GlideMenu.onScripts[item.sysId];
        return item.onShowScript;
    },
    _runMenuAction: function (item) {
        this._loadVariables(this.variables);
        try {
            eval(this._getAction(item));
        } catch (ex) {
            jslog("Error running context menu '" + item.label + "': " + ex);
        }
        this._clearVariables(this.variables);
    },
    _runOnShowScript: function (script, itemId) {
        try {
            eval(script);
        } catch (ex) {
            jslog("Error running onShow script for item '" + itemId + "': " + ex);
        }
    },
    _loadVariables: function (variables) {
        for (var n in variables) {
            var s = n + '=variables["' + n + '"]';
            eval(s);
        }
    },
    _clearVariables: function (variables) {
        for (var n in variables) {
            var s = n + '=null;';
            eval(s);
        }
    },
    type: 'GlideMenu'
};
GlideMenu.scripts = {};
GlideMenu.onScripts = {};
GlideMenu.addScripts = function (o) {
    if (o == null)
        return;
    for (var s in o.scripts)
        GlideMenu.scripts[s] = o.scripts[s];
    for (var s in o.onScripts)
        GlideMenu.onScripts[s] = o.onScripts[s];
}
    ;
/*! RESOURCE: scripts/spell.js */
var TAG_DIV = "div";
var TAG_SPAN = "span";
var TAG_FORM = "form";
var TAG_TEXTAREA = "textarea";
var TAG_INPUT = "input";
var TAG_A = "a";
var SMENU_TAG = "_suggestmenu";
var DISPLAY_TAG = "_display";
var MENU_BGCOLOR = "#DDDDDD";
var HTML_TEXT = 0;
var FLAT_TEXT = 1;
var POSITION = 0;
var WORD = 1;
var SETWORD = 2;
var MODE = 3;
var SUGGESTS = 4;
var TEXT_MODE = 0;
var BOX_MODE = 1;
var ITEM_HEIGHT = 16;
var FONT_SIZE = 9;
var FONT_FACE = "Arial";
var PREVIEW_BORDER = 1;
var PREVIEW_PADDING = 2;
var SUGGEST_TOP_BORDER = 3;
var SUGGEST_BOT_BORDER = 2;
var mods = new Array();
var originalSpellValue = new Array();
var keys = ["Checking...", "Resume", "Resume editing", "No misspellings found"];
var processing = false;
function spellCheck(elementName) {
    var msgs = getMessages(keys);
    var linkName = "link." + elementName;
    var link = getObjectByName(linkName, TAG_A);
    var textField = getObjectByName(elementName, TAG_TEXTAREA);
    if (textField == null)
        textField = getObjectByName(elementName, TAG_INPUT);
    textField.parentNode.onsubmit = saveAllChanges;
    if (!link.savedHTML)
        link.savedHTML = link.innerHTML;
    setStatus(linkName, msgs["Checking..."]);
    jslog("element:  " + elementName);
    if (!textField.mode) {
        if (!processing)
            grabSpellData(elementName, textField, linkName, msgs);
    } else {
        var previewDiv = getObjectByName(elementName + DISPLAY_TAG, TAG_DIV);
        setStatus(linkName, "");
        textField.mode = 0;
        updateTextBox(elementName);
        hideDiv(previewDiv);
        hideAllMenus();
        delete originalSpellValue[elementName];
    }
}
function displaySpellText(elementName) {
    var sDiv = getObjectByName(elementName + DISPLAY_TAG, TAG_DIV);
    var textField = getObjectByName(elementName, TAG_TEXTAREA);
    if (textField == null)
        textField = getObjectByName(elementName, TAG_INPUT);
    var scroll = 'auto';
    if (textField.tagName == 'INPUT')
        scroll = 'visible';
    if (!sDiv) {
        sDiv = createEditDiv(elementName + DISPLAY_TAG, textField, scroll);
        addChild(sDiv);
    }
    var displayText = buildDisplayText(elementName, HTML_TEXT);
    sDiv.innerHTML = "<pre wrap='wrap' style=\"" +
        "margin-top: 0px; margin-bottom: 0px; " +
        "font-family: " + FONT_FACE + "; " +
        "white-space: pre-wrap; " +
        "word-wrap: break-word; " +
        "font-size: " + FONT_SIZE + "pt;" +
        "\">" + displayText + "</pre>";
    saveAllChanges();
    showDiv(sDiv);
}
function buildDisplayText(elementName, flatText) {
    var rText;
    var prevPos = 0;
    var curPos = 0;
    var spellCheckText = new Array();
    var textField = getObjectByName(elementName, TAG_TEXTAREA);
    if (textField == null)
        textField = getObjectByName(elementName, TAG_INPUT);
    var baseText = textField.value;
    for (var zo = 0; zo < mods[elementName].length; zo++) {
        var mod = mods[elementName][zo];
        var zPos = mod[POSITION];
        var zWord = mod[WORD];
        var zSetWord = mod[SETWORD];
        var zMode = mod[MODE];
        var fName = buildRefID(elementName, zPos);
        if (zPos > 0) {
            spellCheckText.push(baseText.substring(prevPos, zPos));
            curPos += zPos - prevPos;
        }
        if (flatText) {
            if (zMode == BOX_MODE) {
                var iField = getObjectByName(fName, TAG_INPUT);
                spellCheckText.push(iField.value);
                mod[WORD] = iField.value;
                mod[POSITION] = curPos;
            } else {
                spellCheckText.push(zSetWord);
                mod[WORD] = zSetWord;
                mod[POSITION] = curPos;
            }
        } else {
            if (zMode == BOX_MODE) {
                var iField = getObjectByName(fName, TAG_INPUT);
                if (iField)
                    zSetWord = iField.value;
                spellCheckText.push("<input type=input " +
                    "id=\"" + fName + "\" name=\"" + fName + "\" " +
                    "style=\"font-weight: bold; font-family: " + FONT_FACE +
                    "; font-size: " + FONT_SIZE +
                    "pt; color: black;\"" +
                    "value=\"" + zSetWord + "\" " +
                    "size=" + ((zWord.length < 4 ? 4 : zWord.length - 2)) + ">");
            } else {
                spellCheckText.push("<a " +
                    "id=\"" + fName + "\" name=\"" + fName + "\" " +
                    "style=\"color: " +
                    (zWord == zSetWord ? "red" : "green") +
                    "; font-weight: bold;\" onclick=\"showSuggestions(" +
                    zo + ", '" + fName +
                    "', '" + elementName + "');Event.stop(event);\">" + zSetWord + "</a>");
            }
        }
        prevPos = parseInt(zPos) + (zWord.length);
        curPos += mod[WORD].length;
    }
    spellCheckText.push(baseText.substring(prevPos));
    rText = spellCheckText.join("")
    return rText;
}
function buildRefID(elementName, position) {
    return elementName + "_pos_" + position;
}
function hideDiv(theDiv) {
    if (theDiv)
        theDiv.style.visibility = "hidden";
}
function showDiv(theDiv) {
    if (theDiv)
        theDiv.style.visibility = "visible";
}
function createEditDiv(id, field, overflow) {
    var menu = document.createElement(TAG_DIV);
    menu.id = id;
    menu.name = id;
    menu.style.borderRight = "black " + PREVIEW_BORDER + "px solid";
    menu.style.borderLeft = "black " + PREVIEW_BORDER + "px solid";
    menu.style.borderTop = "black " + PREVIEW_BORDER + "px solid";
    menu.style.borderBottom = "black " + PREVIEW_BORDER + "px solid";
    menu.style.paddingRight = PREVIEW_PADDING;
    menu.style.paddingLeft = PREVIEW_PADDING;
    menu.style.paddingTop = PREVIEW_PADDING;
    menu.style.paddingBottom = PREVIEW_PADDING;
    menu.style.visibility = "hidden";
    menu.style.position = "absolute";
    menu.style.backgroundColor = "#CCCCEE";
    menu.style.overflow = overflow;
    menu.style.fontFamily = FONT_FACE;
    menu.style.fontSize = FONT_SIZE + "pt";
    menu.style.whiteSpace = "pre";
    menu.style.wordWrap = "break-word";
    menu.style.zIndex = 20000;
    adjustSpellCheckEditDiv(menu, field);
    menu.onclick = hideAllMenus;
    menu.onscroll = hideAllMenus;
    menu.onkeyup = saveAllChanges;
    return menu;
}
function adjustSpellCheckEditDiv(menu, field) {
    menu.style.left = grabOffsetLeft(field) + "px";
    menu.style.top = grabOffsetTop(field) + "px";
    var setWidth = field.offsetWidth;
    var setHeight = field.offsetHeight;
    if (!isMSIE) {
        var borderSizes = (PREVIEW_BORDER * 2) + (PREVIEW_PADDING * 2);
        setHeight -= borderSizes;
        setWidth -= borderSizes;
    }
    menu.style.height = (setHeight - 2) + "px";
    menu.style.width = (setWidth - 2) + "px";
}
var hideAllMenus = function () {
    var divs = document.getElementsByTagName(TAG_DIV);
    for (var ca = 0; ca < divs.length; ca++) {
        var daDiv = divs[ca];
        var divID = daDiv.id;
        if (divID.length > SMENU_TAG.length &&
            (divID.substring(divID.length - SMENU_TAG.length) == SMENU_TAG)) {
            hideDiv(daDiv);
        }
    }
    return;
}
var saveAllChanges = function () {
    var divs = document.getElementsByTagName(TAG_DIV);
    for (var ca = 0; ca < divs.length; ca++) {
        var daDiv = divs[ca];
        var divID = daDiv.id;
        var displayTag = elementName + DISPLAY_TAG;
        if (divID.length > displayTag.length &&
            (divID.substring(divID.length - displayTag.length) == displayTag)) {
            var elementName = divID.substring(0, divID.length - DISPLAY_TAG.length);
            updateTextBox(elementName);
        }
    }
    return;
}
function createSuggestDiv(link, id, elementName) {
    var menu = document.createElement(TAG_DIV);
    menu.id = id;
    menu.name = menu.id;
    menu.elementName = elementName;
    menu.style.borderRight = "gray 2px outset";
    menu.style.borderLeft = "white 2px outset";
    menu.style.borderTop = "white " + SUGGEST_TOP_BORDER + "px outset";
    menu.style.borderBottom = "gray " + SUGGEST_BOT_BORDER + "px outset";
    menu.style.paddingRight = "1";
    menu.style.paddingLeft = "1";
    menu.style.paddingTop = "2";
    menu.style.paddingBottom = "2";
    menu.style.visibility = "hidden";
    menu.style.position = "absolute";
    menu.style.backgroundColor = MENU_BGCOLOR;
    menu.style.fontFamily = FONT_FACE;
    menu.style.fontSize = "8pt";
    menu.style.zIndex = 20000;
    return menu;
}
function grabSpellData(nam, textField, linkName, msgs) {
    processing = true;
    mods = new Array();
    var request = findXMLObject();
    var searchURL = "xmlhttp.do";
    var textField = getObjectByName(nam, TAG_TEXTAREA);
    if (textField == null)
        textField = getObjectByName(nam, TAG_INPUT);
    var baseText = textField.value;
    originalSpellValue[nam] = baseText;
    var aj = new GlideAjax("SpellCheckerAjax");
    aj.setEncode(false);
    aj.addParam("sysparm_name", encodeText(nam));
    aj.addParam("sysparm_chars", encodeText(baseText));
    aj.getXML(afterGrabSpellData, null, [nam, textField, linkName, msgs, processing]);
}
function afterGrabSpellData(response, args) {
    if (!response || !response.responseXML)
        return;
    elementName = args[0];
    textField = args[1];
    linkName = args[2];
    msgs = args[3];
    processing = args[4];
    var changes = extractSpellChanges(response.responseXML);
    mods[elementName] = changes;
    if (changes.length) {
        textField.mode = 1;
        displaySpellText(elementName);
        if (textField.tagName == 'INPUT')
            setStatus(linkName, msgs["Resume"]);
        else
            setStatus(linkName, msgs["Resume editing"]);
    } else {
        setStatus(linkName, msgs["No misspellings found"]);
        setTimeout("setStatus('" + linkName + "', '');", 3000);
    }
    processing = false;
}
function extractSpellChanges(responseXML) {
    if (responseXML && responseXML.documentElement) {
        var items = responseXML.getElementsByTagName("match");
        var elementName = responseXML.documentElement.getAttribute("sysparm_name");
        var origText = responseXML.documentElement.getAttribute("sysparm_chars");
        for (i = 0; i < items.length; i++) {
            var item = items[i];
            var word = item.getAttribute("word");
            var pos = item.getAttribute("position");
            var sugs = item.getElementsByTagName("suggest")
            mods[mods.length] = new Array(pos, word, word, TEXT_MODE, sugs);
        }
    }
    return mods;
}
function encodeText(txt) {
    if (encodeURIComponent)
        return encodeURIComponent(txt);
    if (escape)
        return escape(txt)
}
function findXMLObject() {
    var obj = null;
    try {
        obj = new ActiveXObject("Msxml2.XMLHTTP")
    } catch (e) {
        try {
            obj = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (sc) {
            obj = null
        }
    }
    if (!obj && typeof XMLHttpRequest != "undefined") {
        obj = new XMLHttpRequest()
    }
    return obj;
}
function showSuggestions(mod, name, elementName) {
    var link = getObjectByName(name, TAG_A);
    var widSize = 6;
    if (link) {
        var previewDiv = getObjectByName(elementName + DISPLAY_TAG, TAG_DIV);
        var sugsDiv = getObjectByName(name + "_" + elementName + SMENU_TAG, TAG_DIV);
        if (!sugsDiv) {
            sugsDiv = createSuggestDiv(link, name + "_" + elementName + SMENU_TAG, elementName);
            addChild(sugsDiv);
        }
        while (sugsDiv.childNodes.length > 0)
            sugsDiv.removeChild(sugsDiv.childNodes[0]);
        for (var gs = 0; gs < mods[elementName][mod][SUGGESTS].length; gs++) {
            var itemName = mods[elementName][mod][SUGGESTS][gs].getAttribute("word");
            sugsDiv.appendChild(makeMenuItem(TEXT_MODE, mod, itemName));
            if (itemName.length > widSize)
                widSize = itemName.length;
        }
        var msg = getMessage('Edit...');
        if (msg.length > widSize)
            widSize = msg.length;
        sugsDiv.appendChild(makeMenuItem(BOX_MODE, mod, "<i>" + msg + "</i>"));
        sugsDiv.style.left = grabOffsetLeft(link) + "px";
        sugsDiv.style.top = ((grabOffsetTop(link) + link.offsetHeight + 2) - previewDiv.scrollTop) + "px";
        sugsDiv.style.width = link.offsetWidth + "px";
        var menuItems = mods[elementName][mod][SUGGESTS].length + 1;
        var sHeight = (ITEM_HEIGHT * menuItems) + (SUGGEST_TOP_BORDER + SUGGEST_BOT_BORDER);
        if (navigator && navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
            sugsDiv.style.height = sHeight;
        } else {
            sugsDiv.style.height = sHeight - (SUGGEST_TOP_BORDER + SUGGEST_BOT_BORDER);
            sugsDiv.style.width = ((FONT_SIZE - 2) * widSize - 1) + "px";
        }
        showDiv(sugsDiv);
    }
}
function makeMenuItem(mode, mNum, item) {
    var theDiv = document.createElement(TAG_DIV);
    var menuRow = document.createElement(TAG_SPAN);
    var itemInRow = document.createElement(TAG_SPAN);
    theDiv.onmousedown = spellClickedDropDown;
    theDiv.onmouseover = spellMouseOverDropDown;
    theDiv.onmouseout = spellMouseOutDropDown;
    theDiv.cmod = mNum;
    theDiv.cmode = mode;
    itemInRow.innerHTML = item;
    menuRow.appendChild(itemInRow);
    theDiv.appendChild(menuRow);
    setSpellStyle(menuRow, "dropDownRowStyle");
    setSpellStyle(itemInRow, "dropDownItemStyle");
    return theDiv;
}
function getObjectByName(name, type) {
    var objs = document.getElementsByTagName(type);
    for (var ca = 0; ca < objs.length; ca++) {
        var daObj = objs[ca];
        if (daObj && (daObj.id == name || daObj.name == name))
            return daObj;
    }
    return;
}
function setSpellStyle(child, styleName) {
    child.className = styleName;
    if (styleName == "nonSelectedItemStyle") {
        child.style.backgroundColor = MENU_BGCOLOR;
        child.style.color = "black";
        if (child.displaySpan)
            child.displaySpan.style.color = "green"
    } else if (styleName == "selectedItemStyle") {
        child.style.backgroundColor = "#000070";
        child.style.color = "white";
        child.style.cursor = "pointer";
        if (child.displaySpan)
            child.displaySpan.style.color = "white"
    } else if (styleName == "dropDownItemStyle") {
        child.style.width = "100%";
        child.style.cssFloat = "left";
    } else if (styleName == "dropDownRowStyle") {
        child.style.display = "block";
        child.style.paddingLeft = "5";
        child.style.paddingRight = "5";
        child.style.height = ITEM_HEIGHT + "px";
        child.style.overflow = "hidden";
    }
}
function updateTextBox(elementName) {
    var textField = getObjectByName(elementName, TAG_TEXTAREA);
    if (textField == null)
        textField = getObjectByName(elementName, TAG_INPUT);
    var newValue = buildDisplayText(elementName, FLAT_TEXT);
    if (newValue != originalSpellValue[elementName]) {
        textField.value = newValue;
        multiModified(textField);
    }
}
var spellClickedDropDown = function () {
    var elementName = this.parentNode.elementName;
    var position = mods[elementName][this.cmod][POSITION];
    if (this.cmode == BOX_MODE) {
        mods[elementName][this.cmod][MODE] = BOX_MODE;
        mods[elementName][this.cmod][SETWORD] = mods[elementName][this.cmod][WORD];
    } else {
        mods[elementName][this.cmod][MODE] = TEXT_MODE;
        mods[elementName][this.cmod][SETWORD] = spellMenuInfo(this);
    }
    displaySpellText(elementName);
    if (this.cmode == BOX_MODE) {
        var fName = buildRefID(elementName, position);
        setTimeout("fieldFocus('" + fName + "')", 500);
    }
    hideDiv(this.parentNode);
}
function fieldFocus(fieldName) {
    var textField = getObjectByName(fieldName, TAG_INPUT);
    if (textField)
        textField.focus();
}
var spellMouseOverDropDown = function () {
    setSpellStyle(this, "selectedItemStyle");
}
var spellMouseOutDropDown = function () {
    setSpellStyle(this, "nonSelectedItemStyle");
}
function spellMenuInfo(j) {
    var theStyleType = "dropDownItemStyle";
    var spanTag = j.getElementsByTagName(TAG_SPAN);
    var spanInfo = new Array();
    if (spanTag) {
        for (var c = 0; c < spanTag.length; ++c) {
            if (spanTag[c].className == theStyleType) {
                var spanData = spanTag[c].innerHTML;
                if (spanData != "&nbsp;") {
                    spanInfo = spanData;
                }
                break;
            }
        }
    }
    return spanInfo;
}
function setStatus(elementName, text) {
    var link = getObjectByName(elementName, TAG_A);
    if (link) {
        if (text && text.length > 0) {
            link.innerHTML = "<b><u>" + text + "</u></b>";
        } else {
            link.innerHTML = link.savedHTML;
        }
        var realName = elementName.substring(5);
        var displayField = gel(realName + DISPLAY_TAG);
        if (displayField)
            adjustSpellCheckEditDiv(displayField, gel(realName));
    }
}
;
/*! RESOURCE: scripts/AJAXTextSearchCompleter.js */
var AJAXTextSearchCompleter = Class.create(AJAXTableCompleter, {
    PROCESSOR: "TSSuggestProcessor",
    initialize: function (name, elementName, horizontalAlign, searchContainer) {
        AJAXCompleter.prototype.initialize.call(this, name, elementName);
        this.className = "AJAXTextSearchCompleter";
        this.element = $(elementName);
        this.keyElement = this.element;
        this.horizontalAlign = horizontalAlign;
        this.enterSubmits = true;
        this.searchContainer = searchContainer;
        this.allowInvalid = true;
        this.ieIFrameAdjust = 2;
        this.oneMatchSelects = false;
        AJAXReferenceCompleter.prototype._commonSetup.call(this);
    },
    copyAttributes: function (node) {
        var text = node.childNodes[0].nodeValue;
        var attributes = new Array();
        attributes['label'] = text;
        attributes['name'] = text;
        return attributes;
    },
    setTopLeft: function (style, top, left) {
        if (this.horizontalAlign == "right")
            this._rightAlign(style, parseInt(left, 10));
        else
            style.left = left;
        style.top = top;
    },
    setInvalid: function () {
    },
    clearInvalid: function () {
    },
    onDisplayDropDown: function () {
        AJAXTableCompleter.prototype.onDisplayDropDown.call(this);
        if (this.horizontalAlign == "right") {
            var mLeft = grabOffsetLeft(this.element);
            var x = this._rightAlign(this.dropDown.style, mLeft);
            this.iFrame.style.left = x;
        }
    },
    _rightAlign: function (style, left) {
        var containerWidth = this._getContainerWidth();
        var dropWidth = this.dropDown.getWidth();
        var adjust = 0;
        if (isWebKit)
            adjust = 2;
        this.log("_rightAlign: " + left + "+" + containerWidth + "-" + dropWidth + "-" + adjust);
        var x = left + containerWidth - dropWidth - adjust + "px";
        style.left = x;
        return x;
    },
    _createTable: function () {
        AJAXTableCompleter.prototype._createTable.call(this);
        var tableWidth = this._getContainerWidth();
        if (!g_isInternetExplorer)
            tableWidth -= 2;
        this.table.style.width = tableWidth + "px";
    },
    _getContainerWidth: function () {
        var adjust = 1;
        if (!g_isInternetExplorer)
            adjust = 2;
        var width = 0;
        if (this.searchContainer)
            width = $(this.searchContainer).getWidth() - adjust;
        return width;
    }
});
;
/*! RESOURCE: scripts/CloudApiSCClient.js */
var CloudApiSCClient = {
    _fieldsInfo: {},
    validateCatItemParameterVariables: function (ajaxProcessor, variableSysId, oldValue, newValue, isLoading, g_form) {
        if (isLoading || oldValue == newValue)
            return;
        var parameters = {};
        parameters.variableSysId = variableSysId;
        parameters.parameterValue = newValue.trim();
        this.callAjax(ajaxProcessor, "validateVariableValue", parameters, function (answer) {
            var result = JSON.parse(answer);
            result.variableSysId = "IO:" + variableSysId;
            CloudApiSCClient._fieldsInfo[result["name"]] = result;
            CloudApiSCClient.showAllFieldMessages(g_form);
        });
    },
    callAjax: function (ajaxName, methodName, parameters, callback) {
        var glideAjax = new GlideAjax(ajaxName);
        glideAjax.addParam("sysparm_name", methodName);
        if (parameters) {
            for (var name in parameters) {
                glideAjax.addParam(name, parameters[name]);
            }
        }
        if (callback) {
            glideAjax.getXMLAnswer(callback);
        } else {
            glideAjax.getXMLWait();
            return glideAjax.getAnswer();
        }
    },
    beforeSubmitCloudRsrcTemplate: function (g_form) {
        if (this.isFormValid())
            return true;
        var msg = "Please correct errors to submit order";
        g_form.addErrorMessage(msg);
        this.showAllFieldMessages(g_form);
        return false;
    },
    isFormValid: function () {
        if (!this._fieldsInfo)
            return true;
        for (var name in this._fieldsInfo) {
            if (!this._fieldsInfo[name].isValid)
                return false;
        }
        return true;
    },
    showAllFieldMessages: function (g_form) {
        g_form.hideAllFieldMsgs("error");
        g_form.hideAllFieldMsgs("error");
        g_form.clearMessages();
        for (var name in this._fieldsInfo) {
            var fieldInfo = this._fieldsInfo[name];
            if (fieldInfo.message.length > 0) {
                for (var i = 0; i < fieldInfo.message.length; i++) {
                    g_form.showFieldMsg(fieldInfo.variableSysId, fieldInfo.message[i], fieldInfo.msgtype);
                }
            }
        }
    }
};
;
/*! RESOURCE: /scripts/jquery-ui-1.9.2.custom.js */
(function ($, undefined) {
    var uuid = 0,
        runiqueId = /^ui-id-\d+$/;
    $.ui = $.ui || {};
    if ($.ui.version) {
        return;
    }
    $.extend($.ui, {
        version: "1.9.2",
        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        }
    });
    $.fn.extend({
        _focus: $.fn.focus,
        focus: function (delay, fn) {
            return typeof delay === "number" ?
                this.each(function () {
                    var elem = this;
                    setTimeout(function () {
                        $(elem).focus();
                        if (fn) {
                            fn.call(elem);
                        }
                    }, delay);
                }) :
                this._focus.apply(this, arguments);
        },
        scrollParent: function () {
            var scrollParent;
            if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function () {
                    return (/(relative|absolute|fixed)/).test($.css(this, 'position')) && (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                }).eq(0);
            } else {
                scrollParent = this.parents().filter(function () {
                    return (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                }).eq(0);
            }
            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        },
        zIndex: function (zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }
            if (this.length) {
                var elem = $(this[0]), position, value;
                while (elem.length && elem[0] !== document) {
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }
            return 0;
        },
        uniqueId: function () {
            return this.each(function () {
                if (!this.id) {
                    this.id = "ui-id-" + (++uuid);
                }
            });
        },
        removeUniqueId: function () {
            return this.each(function () {
                if (runiqueId.test(this.id)) {
                    $(this).removeAttr("id");
                }
            });
        }
    });
    function focusable(element, isTabIndexNotNaN) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ?
            !element.disabled :
            "a" === nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
            visible(element);
    }
    function visible(element) {
        return $.expr.filters.visible(element) &&
            !$(element).parents().andSelf().filter(function () {
                return $.css(this, "visibility") === "hidden";
            }).length;
    }
    $.extend($.expr[":"], {
        data: $.expr.createPseudo ?
            $.expr.createPseudo(function (dataName) {
                return function (elem) {
                    return !!$.data(elem, dataName);
                };
            }) :
            function (elem, i, match) {
                return !!$.data(elem, match[3]);
            },
        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },
        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
    $(function () {
        var body = document.body,
            div = body.appendChild(div = document.createElement("div"));
        $.extend(div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        });
        $.support.minHeight = true;
        $.support.selectstart = "onselectstart" in div;
        body.removeChild(div).style.display = "none";
    });
    if (!$("<a>").outerWidth(1).jquery) {
        $.each(["Width", "Height"], function (i, name) {
            var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
                type = name.toLowerCase(),
                orig = {
                    innerWidth: $.fn.innerWidth,
                    innerHeight: $.fn.innerHeight,
                    outerWidth: $.fn.outerWidth,
                    outerHeight: $.fn.outerHeight
                };
            function reduce(elem, size, border, margin) {
                $.each(side, function () {
                    size -= parseFloat($.css(elem, "padding" + this)) || 0;
                    if (border) {
                        size -= parseFloat($.css(elem, "border" + this + "Width")) || 0;
                    }
                    if (margin) {
                        size -= parseFloat($.css(elem, "margin" + this)) || 0;
                    }
                });
                return size;
            }
            $.fn["inner" + name] = function (size) {
                if (size === undefined) {
                    return orig["inner" + name].call(this);
                }
                return this.each(function () {
                    $(this).css(type, reduce(this, size) + "px");
                });
            };
            $.fn["outer" + name] = function (size, margin) {
                if (typeof size !== "number") {
                    return orig["outer" + name].call(this, size);
                }
                return this.each(function () {
                    $(this).css(type, reduce(this, size, true, margin) + "px");
                });
            };
        });
    }
    if ($("<a>").data("a-b", "a").removeData("a-b").data("a-b")) {
        $.fn.removeData = (function (removeData) {
            return function (key) {
                if (arguments.length) {
                    return removeData.call(this, $.camelCase(key));
                } else {
                    return removeData.call(this);
                }
            };
        })($.fn.removeData);
    }
    (function () {
        var uaMatch = /msie ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
        $.ui.ie = uaMatch.length ? true : false;
        $.ui.ie6 = parseFloat(uaMatch[1], 10) === 6;
    })();
    $.fn.extend({
        disableSelection: function () {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
                ".ui-disableSelection", function (event) {
                    event.preventDefault();
                });
        },
        enableSelection: function () {
            return this.unbind(".ui-disableSelection");
        }
    });
    $.extend($.ui, {
        plugin: {
            add: function (module, option, set) {
                var i,
                    proto = $.ui[module].prototype;
                for (i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([option, set[i]]);
                }
            },
            call: function (instance, name, args) {
                var i,
                    set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11) {
                    return;
                }
                for (i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args);
                    }
                }
            }
        },
        contains: $.contains,
        hasScroll: function (el, a) {
            if ($(el).css("overflow") === "hidden") {
                return false;
            }
            var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
                has = false;
            if (el[scroll] > 0) {
                return true;
            }
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has;
        },
        isOverAxis: function (x, reference, size) {
            return (x > reference) && (x < (reference + size));
        },
        isOver: function (y, x, top, left, height, width) {
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
        }
    });
})(jQuery);
(function ($, undefined) {
    var uuid = 0,
        slice = Array.prototype.slice,
        _cleanData = $.cleanData;
    $.cleanData = function (elems) {
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            try {
                $(elem).triggerHandler("remove");
            } catch (e) { }
        }
        _cleanData(elems);
    };
    $.widget = function (name, base, prototype) {
        var fullName, existingConstructor, constructor, basePrototype,
            namespace = name.split(".")[0];
        name = name.split(".")[1];
        fullName = namespace + "-" + name;
        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }
        $.expr[":"][fullName.toLowerCase()] = function (elem) {
            return !!$.data(elem, fullName);
        };
        $[namespace] = $[namespace] || {};
        existingConstructor = $[namespace][name];
        constructor = $[namespace][name] = function (options, element) {
            if (!this._createWidget) {
                return new constructor(options, element);
            }
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };
        $.extend(constructor, existingConstructor, {
            version: prototype.version,
            _proto: $.extend({}, prototype),
            _childConstructors: []
        });
        basePrototype = new base();
        basePrototype.options = $.widget.extend({}, basePrototype.options);
        $.each(prototype, function (prop, value) {
            if ($.isFunction(value)) {
                prototype[prop] = (function () {
                    var _super = function () {
                        return base.prototype[prop].apply(this, arguments);
                    },
                        _superApply = function (args) {
                            return base.prototype[prop].apply(this, args);
                        };
                    return function () {
                        var __super = this._super,
                            __superApply = this._superApply,
                            returnValue;
                        this._super = _super;
                        this._superApply = _superApply;
                        returnValue = value.apply(this, arguments);
                        this._super = __super;
                        this._superApply = __superApply;
                        return returnValue;
                    };
                })();
            }
        });
        constructor.prototype = $.widget.extend(basePrototype, {
            widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
        }, prototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetBaseClass: fullName,
            widgetFullName: fullName
        });
        if (existingConstructor) {
            $.each(existingConstructor._childConstructors, function (i, child) {
                var childPrototype = child.prototype;
                $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
            });
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push(constructor);
        }
        $.widget.bridge(name, constructor);
    };
    $.widget.extend = function (target) {
        var input = slice.call(arguments, 1),
            inputIndex = 0,
            inputLength = input.length,
            key,
            value;
        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    if ($.isPlainObject(value)) {
                        target[key] = $.isPlainObject(target[key]) ?
                            $.widget.extend({}, target[key], value) :
                            $.widget.extend({}, value);
                    } else {
                        target[key] = value;
                    }
                }
            }
        }
        return target;
    };
    $.widget.bridge = function (name, object) {
        var fullName = object.prototype.widgetFullName || name;
        $.fn[name] = function (options) {
            var isMethodCall = typeof options === "string",
                args = slice.call(arguments, 1),
                returnValue = this;
            options = !isMethodCall && args.length ?
                $.widget.extend.apply(null, [options].concat(args)) :
                options;
            if (isMethodCall) {
                this.each(function () {
                    var methodValue,
                        instance = $.data(this, fullName);
                    if (!instance) {
                        return $.error("cannot call methods on " + name + " prior to initialization; " +
                            "attempted to call method '" + options + "'");
                    }
                    if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                        return $.error("no such method '" + options + "' for " + name + " widget instance");
                    }
                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue && methodValue.jquery ?
                            returnValue.pushStack(methodValue.get()) :
                            methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function () {
                    var instance = $.data(this, fullName);
                    if (instance) {
                        instance.option(options || {})._init();
                    } else {
                        $.data(this, fullName, new object(options, this));
                    }
                });
            }
            return returnValue;
        };
    };
    $.Widget = function () { };
    $.Widget._childConstructors = [];
    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            disabled: false,
            create: null
        },
        _createWidget: function (options, element) {
            element = $(element || this.defaultElement || this)[0];
            this.element = $(element);
            this.uuid = uuid++;
            this.eventNamespace = "." + this.widgetName + this.uuid;
            this.options = $.widget.extend({},
                this.options,
                this._getCreateOptions(),
                options);
            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();
            if (element !== this) {
                $.data(element, this.widgetName, this);
                $.data(element, this.widgetFullName, this);
                this._on(true, this.element, {
                    remove: function (event) {
                        if (event.target === element) {
                            this.destroy();
                        }
                    }
                });
                this.document = $(element.style ?
                    element.ownerDocument :
                    element.document || element);
                this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
            }
            this._create();
            this._trigger("create", null, this._getCreateEventData());
            this._init();
        },
        _getCreateOptions: $.noop,
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop,
        destroy: function () {
            this._destroy();
            this.element
                .unbind(this.eventNamespace)
                .removeData(this.widgetName)
                .removeData(this.widgetFullName)
                .removeData($.camelCase(this.widgetFullName));
            this.widget()
                .unbind(this.eventNamespace)
                .removeAttr("aria-disabled")
                .removeClass(
                    this.widgetFullName + "-disabled " +
                    "ui-state-disabled");
            this.bindings.unbind(this.eventNamespace);
            this.hoverable.removeClass("ui-state-hover");
            this.focusable.removeClass("ui-state-focus");
        },
        _destroy: $.noop,
        widget: function () {
            return this.element;
        },
        option: function (key, value) {
            var options = key,
                parts,
                curOption,
                i;
            if (arguments.length === 0) {
                return $.widget.extend({}, this.options);
            }
            if (typeof key === "string") {
                options = {};
                parts = key.split(".");
                key = parts.shift();
                if (parts.length) {
                    curOption = options[key] = $.widget.extend({}, this.options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        curOption[parts[i]] = curOption[parts[i]] || {};
                        curOption = curOption[parts[i]];
                    }
                    key = parts.pop();
                    if (value === undefined) {
                        return curOption[key] === undefined ? null : curOption[key];
                    }
                    curOption[key] = value;
                } else {
                    if (value === undefined) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }
            this._setOptions(options);
            return this;
        },
        _setOptions: function (options) {
            var key;
            for (key in options) {
                this._setOption(key, options[key]);
            }
            return this;
        },
        _setOption: function (key, value) {
            this.options[key] = value;
            if (key === "disabled") {
                this.widget()
                    .toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!value)
                    .attr("aria-disabled", value);
                this.hoverable.removeClass("ui-state-hover");
                this.focusable.removeClass("ui-state-focus");
            }
            return this;
        },
        enable: function () {
            return this._setOption("disabled", false);
        },
        disable: function () {
            return this._setOption("disabled", true);
        },
        _on: function (suppressDisabledCheck, element, handlers) {
            var delegateElement,
                instance = this;
            if (typeof suppressDisabledCheck !== "boolean") {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }
            if (!handlers) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                element = delegateElement = $(element);
                this.bindings = this.bindings.add(element);
            }
            $.each(handlers, function (event, handler) {
                function handlerProxy() {
                    if (!suppressDisabledCheck &&
                        (instance.options.disabled === true ||
                            $(this).hasClass("ui-state-disabled"))) {
                        return;
                    }
                    return (typeof handler === "string" ? instance[handler] : handler)
                        .apply(instance, arguments);
                }
                if (typeof handler !== "string") {
                    handlerProxy.guid = handler.guid =
                        handler.guid || handlerProxy.guid || $.guid++;
                }
                var match = event.match(/^(\w+)\s*(.*)$/),
                    eventName = match[1] + instance.eventNamespace,
                    selector = match[2];
                if (selector) {
                    delegateElement.delegate(selector, eventName, handlerProxy);
                } else {
                    element.bind(eventName, handlerProxy);
                }
            });
        },
        _off: function (element, eventName) {
            eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
            element.unbind(eventName).undelegate(eventName);
        },
        _delay: function (handler, delay) {
            function handlerProxy() {
                return (typeof handler === "string" ? instance[handler] : handler)
                    .apply(instance, arguments);
            }
            var instance = this;
            return setTimeout(handlerProxy, delay || 0);
        },
        _hoverable: function (element) {
            this.hoverable = this.hoverable.add(element);
            this._on(element, {
                mouseenter: function (event) {
                    $(event.currentTarget).addClass("ui-state-hover");
                },
                mouseleave: function (event) {
                    $(event.currentTarget).removeClass("ui-state-hover");
                }
            });
        },
        _focusable: function (element) {
            this.focusable = this.focusable.add(element);
            this._on(element, {
                focusin: function (event) {
                    $(event.currentTarget).addClass("ui-state-focus");
                },
                focusout: function (event) {
                    $(event.currentTarget).removeClass("ui-state-focus");
                }
            });
        },
        _trigger: function (type, event, data) {
            var prop, orig,
                callback = this.options[type];
            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ?
                type :
                this.widgetEventPrefix + type).toLowerCase();
            event.target = this.element[0];
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }
            this.element.trigger(event, data);
            return !($.isFunction(callback) &&
                callback.apply(this.element[0], [event].concat(data)) === false ||
                event.isDefaultPrevented());
        }
    };
    $.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
        $.Widget.prototype["_" + method] = function (element, options, callback) {
            if (typeof options === "string") {
                options = { effect: options };
            }
            var hasOptions,
                effectName = !options ?
                    method :
                    options === true || typeof options === "number" ?
                        defaultEffect :
                        options.effect || defaultEffect;
            options = options || {};
            if (typeof options === "number") {
                options = { duration: options };
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }
            if (hasOptions && $.effects && ($.effects.effect[effectName] || $.uiBackCompat !== false && $.effects[effectName])) {
                element[method](options);
            } else if (effectName !== method && element[effectName]) {
                element[effectName](options.duration, options.easing, callback);
            } else {
                element.queue(function (next) {
                    $(this)[method]();
                    if (callback) {
                        callback.call(element[0]);
                    }
                    next();
                });
            }
        };
    });
    if ($.uiBackCompat !== false) {
        $.Widget.prototype._getCreateOptions = function () {
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
        };
    }
})(jQuery);
(function ($, undefined) {
    $.ui = $.ui || {};
    var cachedScrollbarWidth,
        max = Math.max,
        abs = Math.abs,
        round = Math.round,
        rhorizontal = /left|center|right/,
        rvertical = /top|center|bottom/,
        roffset = /[\+\-]\d+%?/,
        rposition = /^\w+/,
        rpercent = /%$/,
        _position = $.fn.position;
    function getOffsets(offsets, width, height) {
        return [
            parseInt(offsets[0], 10) * (rpercent.test(offsets[0]) ? width / 100 : 1),
            parseInt(offsets[1], 10) * (rpercent.test(offsets[1]) ? height / 100 : 1)
        ];
    }
    function parseCss(element, property) {
        return parseInt($.css(element, property), 10) || 0;
    }
    $.position = {
        scrollbarWidth: function () {
            if (cachedScrollbarWidth !== undefined) {
                return cachedScrollbarWidth;
            }
            var w1, w2,
                div = $("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
                innerDiv = div.children()[0];
            $("body").append(div);
            w1 = innerDiv.offsetWidth;
            div.css("overflow", "scroll");
            w2 = innerDiv.offsetWidth;
            if (w1 === w2) {
                w2 = div[0].clientWidth;
            }
            div.remove();
            return (cachedScrollbarWidth = w1 - w2);
        },
        getScrollInfo: function (within) {
            var overflowX = within.isWindow ? "" : within.element.css("overflow-x"),
                overflowY = within.isWindow ? "" : within.element.css("overflow-y"),
                hasOverflowX = overflowX === "scroll" ||
                    (overflowX === "auto" && within.width < within.element[0].scrollWidth),
                hasOverflowY = overflowY === "scroll" ||
                    (overflowY === "auto" && within.height < within.element[0].scrollHeight);
            return {
                width: hasOverflowX ? $.position.scrollbarWidth() : 0,
                height: hasOverflowY ? $.position.scrollbarWidth() : 0
            };
        },
        getWithinInfo: function (element) {
            var withinElement = $(element || window),
                isWindow = $.isWindow(withinElement[0]);
            return {
                element: withinElement,
                isWindow: isWindow,
                offset: withinElement.offset() || { left: 0, top: 0 },
                scrollLeft: withinElement.scrollLeft(),
                scrollTop: withinElement.scrollTop(),
                width: isWindow ? withinElement.width() : withinElement.outerWidth(),
                height: isWindow ? withinElement.height() : withinElement.outerHeight()
            };
        }
    };
    $.fn.position = function (options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }
        options = $.extend({}, options);
        var atOffset, targetWidth, targetHeight, targetOffset, basePosition,
            target = $(options.of),
            within = $.position.getWithinInfo(options.within),
            scrollInfo = $.position.getScrollInfo(within),
            targetElem = target[0],
            collision = (options.collision || "flip").split(" "),
            offsets = {};
        if (targetElem.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            targetOffset = { top: 0, left: 0 };
        } else if ($.isWindow(targetElem)) {
            targetWidth = target.width();
            targetHeight = target.height();
            targetOffset = { top: target.scrollTop(), left: target.scrollLeft() };
        } else if (targetElem.preventDefault) {
            options.at = "left top";
            targetWidth = targetHeight = 0;
            targetOffset = { top: targetElem.pageY, left: targetElem.pageX };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            targetOffset = target.offset();
        }
        basePosition = $.extend({}, targetOffset);
        $.each(["my", "at"], function () {
            var pos = (options[this] || "").split(" "),
                horizontalOffset,
                verticalOffset;
            if (pos.length === 1) {
                pos = rhorizontal.test(pos[0]) ?
                    pos.concat(["center"]) :
                    rvertical.test(pos[0]) ?
                        ["center"].concat(pos) :
                        ["center", "center"];
            }
            pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
            pos[1] = rvertical.test(pos[1]) ? pos[1] : "center";
            horizontalOffset = roffset.exec(pos[0]);
            verticalOffset = roffset.exec(pos[1]);
            offsets[this] = [
                horizontalOffset ? horizontalOffset[0] : 0,
                verticalOffset ? verticalOffset[0] : 0
            ];
            options[this] = [
                rposition.exec(pos[0])[0],
                rposition.exec(pos[1])[0]
            ];
        });
        if (collision.length === 1) {
            collision[1] = collision[0];
        }
        if (options.at[0] === "right") {
            basePosition.left += targetWidth;
        } else if (options.at[0] === "center") {
            basePosition.left += targetWidth / 2;
        }
        if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
        } else if (options.at[1] === "center") {
            basePosition.top += targetHeight / 2;
        }
        atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
        basePosition.left += atOffset[0];
        basePosition.top += atOffset[1];
        return this.each(function () {
            var collisionPosition, using,
                elem = $(this),
                elemWidth = elem.outerWidth(),
                elemHeight = elem.outerHeight(),
                marginLeft = parseCss(this, "marginLeft"),
                marginTop = parseCss(this, "marginTop"),
                collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
                collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
                position = $.extend({}, basePosition),
                myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());
            if (options.my[0] === "right") {
                position.left -= elemWidth;
            } else if (options.my[0] === "center") {
                position.left -= elemWidth / 2;
            }
            if (options.my[1] === "bottom") {
                position.top -= elemHeight;
            } else if (options.my[1] === "center") {
                position.top -= elemHeight / 2;
            }
            position.left += myOffset[0];
            position.top += myOffset[1];
            if (!$.support.offsetFractions) {
                position.left = round(position.left);
                position.top = round(position.top);
            }
            collisionPosition = {
                marginLeft: marginLeft,
                marginTop: marginTop
            };
            $.each(["left", "top"], function (i, dir) {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth: targetWidth,
                        targetHeight: targetHeight,
                        elemWidth: elemWidth,
                        elemHeight: elemHeight,
                        collisionPosition: collisionPosition,
                        collisionWidth: collisionWidth,
                        collisionHeight: collisionHeight,
                        offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
                        my: options.my,
                        at: options.at,
                        within: within,
                        elem: elem
                    });
                }
            });
            if ($.fn.bgiframe) {
                elem.bgiframe();
            }
            if (options.using) {
                using = function (props) {
                    var left = targetOffset.left - position.left,
                        right = left + targetWidth - elemWidth,
                        top = targetOffset.top - position.top,
                        bottom = top + targetHeight - elemHeight,
                        feedback = {
                            target: {
                                element: target,
                                left: targetOffset.left,
                                top: targetOffset.top,
                                width: targetWidth,
                                height: targetHeight
                            },
                            element: {
                                element: elem,
                                left: position.left,
                                top: position.top,
                                width: elemWidth,
                                height: elemHeight
                            },
                            horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                            vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                        };
                    if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                        feedback.horizontal = "center";
                    }
                    if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                        feedback.vertical = "middle";
                    }
                    if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                        feedback.important = "horizontal";
                    } else {
                        feedback.important = "vertical";
                    }
                    options.using.call(this, props, feedback);
                };
            }
            elem.offset($.extend(position, { using: using }));
        });
    };
    $.ui.position = {
        fit: {
            left: function (position, data) {
                var within = data.within,
                    withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                    outerWidth = within.width,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = withinOffset - collisionPosLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                    newOverRight;
                if (data.collisionWidth > outerWidth) {
                    if (overLeft > 0 && overRight <= 0) {
                        newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                        position.left += overLeft - newOverRight;
                    } else if (overRight > 0 && overLeft <= 0) {
                        position.left = withinOffset;
                    } else {
                        if (overLeft > overRight) {
                            position.left = withinOffset + outerWidth - data.collisionWidth;
                        } else {
                            position.left = withinOffset;
                        }
                    }
                } else if (overLeft > 0) {
                    position.left += overLeft;
                } else if (overRight > 0) {
                    position.left -= overRight;
                } else {
                    position.left = max(position.left - collisionPosLeft, position.left);
                }
            },
            top: function (position, data) {
                var within = data.within,
                    withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                    outerHeight = data.within.height,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = withinOffset - collisionPosTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                    newOverBottom;
                if (data.collisionHeight > outerHeight) {
                    if (overTop > 0 && overBottom <= 0) {
                        newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                        position.top += overTop - newOverBottom;
                    } else if (overBottom > 0 && overTop <= 0) {
                        position.top = withinOffset;
                    } else {
                        if (overTop > overBottom) {
                            position.top = withinOffset + outerHeight - data.collisionHeight;
                        } else {
                            position.top = withinOffset;
                        }
                    }
                } else if (overTop > 0) {
                    position.top += overTop;
                } else if (overBottom > 0) {
                    position.top -= overBottom;
                } else {
                    position.top = max(position.top - collisionPosTop, position.top);
                }
            }
        },
        flip: {
            left: function (position, data) {
                var within = data.within,
                    withinOffset = within.offset.left + within.scrollLeft,
                    outerWidth = within.width,
                    offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = collisionPosLeft - offsetLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                    myOffset = data.my[0] === "left" ?
                        -data.elemWidth :
                        data.my[0] === "right" ?
                            data.elemWidth :
                            0,
                    atOffset = data.at[0] === "left" ?
                        data.targetWidth :
                        data.at[0] === "right" ?
                            -data.targetWidth :
                            0,
                    offset = -2 * data.offset[0],
                    newOverRight,
                    newOverLeft;
                if (overLeft < 0) {
                    newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                    if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                        position.left += myOffset + atOffset + offset;
                    }
                }
                else if (overRight > 0) {
                    newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                    if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                        position.left += myOffset + atOffset + offset;
                    }
                }
            },
            top: function (position, data) {
                var within = data.within,
                    withinOffset = within.offset.top + within.scrollTop,
                    outerHeight = within.height,
                    offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = collisionPosTop - offsetTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                    top = data.my[1] === "top",
                    myOffset = top ?
                        -data.elemHeight :
                        data.my[1] === "bottom" ?
                            data.elemHeight :
                            0,
                    atOffset = data.at[1] === "top" ?
                        data.targetHeight :
                        data.at[1] === "bottom" ?
                            -data.targetHeight :
                            0,
                    offset = -2 * data.offset[1],
                    newOverTop,
                    newOverBottom;
                if (overTop < 0) {
                    newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                    if ((position.top + myOffset + atOffset + offset) > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
                        position.top += myOffset + atOffset + offset;
                    }
                }
                else if (overBottom > 0) {
                    newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                    if ((position.top + myOffset + atOffset + offset) > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
                        position.top += myOffset + atOffset + offset;
                    }
                }
            }
        },
        flipfit: {
            left: function () {
                $.ui.position.flip.left.apply(this, arguments);
                $.ui.position.fit.left.apply(this, arguments);
            },
            top: function () {
                $.ui.position.flip.top.apply(this, arguments);
                $.ui.position.fit.top.apply(this, arguments);
            }
        }
    };
    (function () {
        var testElement, testElementParent, testElementStyle, offsetLeft, i,
            body = document.getElementsByTagName("body")[0],
            div = document.createElement("div");
        testElement = document.createElement(body ? "div" : "body");
        testElementStyle = {
            visibility: "hidden",
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: "none"
        };
        if (body) {
            $.extend(testElementStyle, {
                position: "absolute",
                left: "-1000px",
                top: "-1000px"
            });
        }
        for (i in testElementStyle) {
            testElement.style[i] = testElementStyle[i];
        }
        testElement.appendChild(div);
        testElementParent = body || document.documentElement;
        testElementParent.insertBefore(testElement, testElementParent.firstChild);
        div.style.cssText = "position: absolute; left: 10.7432222px;";
        offsetLeft = $(div).offset().left;
        $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;
        testElement.innerHTML = "";
        testElementParent.removeChild(testElement);
    })();
    if ($.uiBackCompat !== false) {
        (function ($) {
            var _position = $.fn.position;
            $.fn.position = function (options) {
                if (!options || !options.offset) {
                    return _position.call(this, options);
                }
                var offset = options.offset.split(" "),
                    at = options.at.split(" ");
                if (offset.length === 1) {
                    offset[1] = offset[0];
                }
                if (/^\d/.test(offset[0])) {
                    offset[0] = "+" + offset[0];
                }
                if (/^\d/.test(offset[1])) {
                    offset[1] = "+" + offset[1];
                }
                if (at.length === 1) {
                    if (/left|center|right/.test(at[0])) {
                        at[1] = "center";
                    } else {
                        at[1] = at[0];
                        at[0] = "center";
                    }
                }
                return _position.call(this, $.extend(options, {
                    at: at[0] + offset[0] + " " + at[1] + offset[1],
                    offset: undefined
                }));
            };
        }(jQuery));
    }
}(jQuery));
(function ($, undefined) {
    var requestIndex = 0;
    $.widget("ui.autocomplete", {
        version: "1.9.2",
        defaultElement: "<input>",
        options: {
            appendTo: "body",
            autoFocus: false,
            delay: 300,
            minLength: 1,
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            source: null,
            change: null,
            close: null,
            focus: null,
            open: null,
            response: null,
            search: null,
            select: null
        },
        pending: 0,
        _create: function () {
            var suppressKeyPress, suppressKeyPressRepeat, suppressInput;
            this.isMultiLine = this._isMultiLine();
            this.valueMethod = this.element[this.element.is("input,textarea") ? "val" : "text"];
            this.isNewMenu = true;
            this.element
                .addClass("ui-autocomplete-input")
                .attr("autocomplete", "off");
            this._on(this.element, {
                keydown: function (event) {
                    if (this.element.prop("readOnly")) {
                        suppressKeyPress = true;
                        suppressInput = true;
                        suppressKeyPressRepeat = true;
                        return;
                    }
                    suppressKeyPress = false;
                    suppressInput = false;
                    suppressKeyPressRepeat = false;
                    var keyCode = $.ui.keyCode;
                    switch (event.keyCode) {
                        case keyCode.PAGE_UP:
                            suppressKeyPress = true;
                            this._move("previousPage", event);
                            break;
                        case keyCode.PAGE_DOWN:
                            suppressKeyPress = true;
                            this._move("nextPage", event);
                            break;
                        case keyCode.UP:
                            suppressKeyPress = true;
                            this._keyEvent("previous", event);
                            break;
                        case keyCode.DOWN:
                            suppressKeyPress = true;
                            this._keyEvent("next", event);
                            break;
                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                            if (this.menu.active) {
                                suppressKeyPress = true;
                                event.preventDefault();
                                this.menu.select(event);
                            }
                            break;
                        case keyCode.TAB:
                            if (this.menu.active) {
                                this.menu.select(event);
                            }
                            break;
                        case keyCode.ESCAPE:
                            if (this.menu.element.is(":visible")) {
                                this._value(this.term);
                                this.close(event);
                                event.preventDefault();
                            }
                            break;
                        default:
                            suppressKeyPressRepeat = true;
                            this._searchTimeout(event);
                            break;
                    }
                },
                keypress: function (event) {
                    if (suppressKeyPress) {
                        suppressKeyPress = false;
                        event.preventDefault();
                        return;
                    }
                    if (suppressKeyPressRepeat) {
                        return;
                    }
                    var keyCode = $.ui.keyCode;
                    switch (event.keyCode) {
                        case keyCode.PAGE_UP:
                            this._move("previousPage", event);
                            break;
                        case keyCode.PAGE_DOWN:
                            this._move("nextPage", event);
                            break;
                        case keyCode.UP:
                            this._keyEvent("previous", event);
                            break;
                        case keyCode.DOWN:
                            this._keyEvent("next", event);
                            break;
                    }
                },
                input: function (event) {
                    if (suppressInput) {
                        suppressInput = false;
                        event.preventDefault();
                        return;
                    }
                    this._searchTimeout(event);
                },
                focus: function () {
                    this.selectedItem = null;
                    this.previous = this._value();
                },
                blur: function (event) {
                    if (this.cancelBlur) {
                        delete this.cancelBlur;
                        return;
                    }
                    clearTimeout(this.searching);
                    this.close(event);
                    this._change(event);
                }
            });
            this._initSource();
            this.menu = $("<ul>")
                .addClass("ui-autocomplete")
                .appendTo(this.document.find(this.options.appendTo || "body")[0])
                .menu({
                    input: $(),
                    role: null
                })
                .zIndex(this.element.zIndex() + 1)
                .hide()
                .data("menu");
            this._on(this.menu.element, {
                mousedown: function (event) {
                    event.preventDefault();
                    this.cancelBlur = true;
                    this._delay(function () {
                        delete this.cancelBlur;
                    });
                    var menuElement = this.menu.element[0];
                    if (!$(event.target).closest(".ui-menu-item").length) {
                        this._delay(function () {
                            var that = this;
                            this.document.one("mousedown", function (event) {
                                if (event.target !== that.element[0] &&
                                    event.target !== menuElement &&
                                    !$.contains(menuElement, event.target)) {
                                    that.close();
                                }
                            });
                        });
                    }
                },
                menufocus: function (event, ui) {
                    if (this.isNewMenu) {
                        this.isNewMenu = false;
                        if (event.originalEvent && /^mouse/.test(event.originalEvent.type)) {
                            this.menu.blur();
                            this.document.one("mousemove", function () {
                                $(event.target).trigger(event.originalEvent);
                            });
                            return;
                        }
                    }
                    var item = ui.item.data("ui-autocomplete-item") || ui.item.data("item.autocomplete");
                    if (false !== this._trigger("focus", event, { item: item })) {
                        if (event.originalEvent && /^key/.test(event.originalEvent.type)) {
                            this._value(item.value);
                        }
                    } else {
                        this.liveRegion.text(item.value);
                    }
                },
                menuselect: function (event, ui) {
                    var item = ui.item.data("ui-autocomplete-item") || ui.item.data("item.autocomplete"),
                        previous = this.previous;
                    if (this.element[0] !== this.document[0].activeElement) {
                        this.element.focus();
                        this.previous = previous;
                        this._delay(function () {
                            this.previous = previous;
                            this.selectedItem = item;
                        });
                    }
                    if (false !== this._trigger("select", event, { item: item })) {
                        this._value(item.value);
                    }
                    this.term = this._value();
                    this.close(event);
                    this.selectedItem = item;
                }
            });
            this.liveRegion = $("<span>", {
                role: "status",
                "aria-live": "polite"
            })
                .addClass("ui-helper-hidden-accessible")
                .insertAfter(this.element);
            if ($.fn.bgiframe) {
                this.menu.element.bgiframe();
            }
            this._on(this.window, {
                beforeunload: function () {
                    this.element.removeAttr("autocomplete");
                }
            });
        },
        _destroy: function () {
            clearTimeout(this.searching);
            this.element
                .removeClass("ui-autocomplete-input")
                .removeAttr("autocomplete");
            this.menu.element.remove();
            this.liveRegion.remove();
        },
        _setOption: function (key, value) {
            this._super(key, value);
            if (key === "source") {
                this._initSource();
            }
            if (key === "appendTo") {
                this.menu.element.appendTo(this.document.find(value || "body")[0]);
            }
            if (key === "disabled" && value && this.xhr) {
                this.xhr.abort();
            }
        },
        _isMultiLine: function () {
            if (this.element.is("textarea")) {
                return true;
            }
            if (this.element.is("input")) {
                return false;
            }
            return this.element.prop("isContentEditable");
        },
        _initSource: function () {
            var array, url,
                that = this;
            if ($.isArray(this.options.source)) {
                array = this.options.source;
                this.source = function (request, response) {
                    response($.ui.autocomplete.filter(array, request.term));
                };
            } else if (typeof this.options.source === "string") {
                url = this.options.source;
                this.source = function (request, response) {
                    if (that.xhr) {
                        that.xhr.abort();
                    }
                    that.xhr = $.ajax({
                        url: url,
                        data: request,
                        dataType: "json",
                        success: function (data) {
                            response(data);
                        },
                        error: function () {
                            response([]);
                        }
                    });
                };
            } else {
                this.source = this.options.source;
            }
        },
        _searchTimeout: function (event) {
            clearTimeout(this.searching);
            this.searching = this._delay(function () {
                if (this.term !== this._value()) {
                    this.selectedItem = null;
                    this.search(null, event);
                }
            }, this.options.delay);
        },
        search: function (value, event) {
            value = value != null ? value : this._value();
            this.term = this._value();
            if (value.length < this.options.minLength) {
                return this.close(event);
            }
            if (this._trigger("search", event) === false) {
                return;
            }
            return this._search(value);
        },
        _search: function (value) {
            this.pending++;
            this.element.addClass("ui-autocomplete-loading");
            this.cancelSearch = false;
            this.source({ term: value }, this._response());
        },
        _response: function () {
            var that = this,
                index = ++requestIndex;
            return function (content) {
                if (index === requestIndex) {
                    that.__response(content);
                }
                that.pending--;
                if (!that.pending) {
                    that.element.removeClass("ui-autocomplete-loading");
                }
            };
        },
        __response: function (content) {
            if (content) {
                content = this._normalize(content);
            }
            this._trigger("response", null, { content: content });
            if (!this.options.disabled && content && content.length && !this.cancelSearch) {
                this._suggest(content);
                this._trigger("open");
            } else {
                this._close();
            }
        },
        close: function (event) {
            this.cancelSearch = true;
            this._close(event);
        },
        _close: function (event) {
            if (this.menu.element.is(":visible")) {
                this.menu.element.hide();
                this.menu.blur();
                this.isNewMenu = true;
                this._trigger("close", event);
            }
        },
        _change: function (event) {
            if (this.previous !== this._value()) {
                this._trigger("change", event, { item: this.selectedItem });
            }
        },
        _normalize: function (items) {
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            return $.map(items, function (item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({
                    label: item.label || item.value,
                    value: item.value || item.label
                }, item);
            });
        },
        _suggest: function (items) {
            var ul = this.menu.element
                .empty()
                .zIndex(this.element.zIndex() + 1);
            this._renderMenu(ul, items);
            this.menu.refresh();
            ul.show();
            this._resizeMenu();
            ul.position($.extend({
                of: this.element
            }, this.options.position));
            if (this.options.autoFocus) {
                this.menu.next();
            }
        },
        _resizeMenu: function () {
            var ul = this.menu.element;
            ul.outerWidth(Math.max(
                ul.width("").outerWidth() + 1,
                this.element.outerWidth()
            ));
        },
        _renderMenu: function (ul, items) {
            var that = this;
            $.each(items, function (index, item) {
                that._renderItemData(ul, item);
            });
        },
        _renderItemData: function (ul, item) {
            return this._renderItem(ul, item).data("ui-autocomplete-item", item);
        },
        _renderItem: function (ul, item) {
            return $("<li>")
                .append($("<a>").text(item.label))
                .appendTo(ul);
        },
        _move: function (direction, event) {
            if (!this.menu.element.is(":visible")) {
                this.search(null, event);
                return;
            }
            if (this.menu.isFirstItem() && /^previous/.test(direction) ||
                this.menu.isLastItem() && /^next/.test(direction)) {
                this._value(this.term);
                this.menu.blur();
                return;
            }
            this.menu[direction](event);
        },
        widget: function () {
            return this.menu.element;
        },
        _value: function () {
            return this.valueMethod.apply(this.element, arguments);
        },
        _keyEvent: function (keyEvent, event) {
            if (!this.isMultiLine || this.menu.element.is(":visible")) {
                this._move(keyEvent, event);
                event.preventDefault();
            }
        }
    });
    $.extend($.ui.autocomplete, {
        escapeRegex: function (value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        },
        filter: function (array, term) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
            return $.grep(array, function (value) {
                return matcher.test(value.label || value.value || value);
            });
        }
    });
    $.widget("ui.autocomplete", $.ui.autocomplete, {
        options: {
            messages: {
                noResults: "No search results.",
                results: function (amount) {
                    return amount + (amount > 1 ? " results are" : " result is") +
                        " available, use up and down arrow keys to navigate.";
                }
            }
        },
        __response: function (content) {
            var message;
            this._superApply(arguments);
            if (this.options.disabled || this.cancelSearch) {
                return;
            }
            if (content && content.length) {
                message = this.options.messages.results(content.length);
            } else {
                message = this.options.messages.noResults;
            }
            this.liveRegion.text(message);
        }
    });
}(jQuery));
(function ($, undefined) {
    var mouseHandled = false;
    $.widget("ui.menu", {
        version: "1.9.2",
        defaultElement: "<ul>",
        delay: 300,
        options: {
            icons: {
                submenu: "ui-icon-carat-1-e"
            },
            menus: "ul",
            position: {
                my: "left top",
                at: "right top"
            },
            role: "menu",
            blur: null,
            focus: null,
            select: null
        },
        _create: function () {
            this.activeMenu = this.element;
            this.element
                .uniqueId()
                .addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
                .toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length)
                .attr({
                    role: this.options.role,
                    tabIndex: 0
                })
                .bind("click" + this.eventNamespace, $.proxy(function (event) {
                    if (this.options.disabled) {
                        event.preventDefault();
                    }
                }, this));
            if (this.options.disabled) {
                this.element
                    .addClass("ui-state-disabled")
                    .attr("aria-disabled", "true");
            }
            this._on({
                "mousedown .ui-menu-item > a": function (event) {
                    event.preventDefault();
                },
                "click .ui-state-disabled > a": function (event) {
                    event.preventDefault();
                },
                "click .ui-menu-item:has(a)": function (event) {
                    var target = $(event.target).closest(".ui-menu-item");
                    if (!mouseHandled && target.not(".ui-state-disabled").length) {
                        mouseHandled = true;
                        this.select(event);
                        if (target.has(".ui-menu").length) {
                            this.expand(event);
                        } else if (!this.element.is(":focus")) {
                            this.element.trigger("focus", [true]);
                            if (this.active && this.active.parents(".ui-menu").length === 1) {
                                clearTimeout(this.timer);
                            }
                        }
                    }
                },
                "mouseenter .ui-menu-item": function (event) {
                    var target = $(event.currentTarget);
                    target.siblings().children(".ui-state-active").removeClass("ui-state-active");
                    this.focus(event, target);
                },
                mouseleave: "collapseAll",
                "mouseleave .ui-menu": "collapseAll",
                focus: function (event, keepActiveItem) {
                    var item = this.active || this.element.children(".ui-menu-item").eq(0);
                    if (!keepActiveItem) {
                        this.focus(event, item);
                    }
                },
                blur: function (event) {
                    this._delay(function () {
                        if (!$.contains(this.element[0], this.document[0].activeElement)) {
                            this.collapseAll(event);
                        }
                    });
                },
                keydown: "_keydown"
            });
            this.refresh();
            this._on(this.document, {
                click: function (event) {
                    if (!$(event.target).closest(".ui-menu").length) {
                        this.collapseAll(event);
                    }
                    mouseHandled = false;
                }
            });
        },
        _destroy: function () {
            this.element
                .removeAttr("aria-activedescendant")
                .find(".ui-menu").andSelf()
                .removeClass("ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons")
                .removeAttr("role")
                .removeAttr("tabIndex")
                .removeAttr("aria-labelledby")
                .removeAttr("aria-expanded")
                .removeAttr("aria-hidden")
                .removeAttr("aria-disabled")
                .removeUniqueId()
                .show();
            this.element.find(".ui-menu-item")
                .removeClass("ui-menu-item")
                .removeAttr("role")
                .removeAttr("aria-disabled")
                .children("a")
                .removeUniqueId()
                .removeClass("ui-corner-all ui-state-hover")
                .removeAttr("tabIndex")
                .removeAttr("role")
                .removeAttr("aria-haspopup")
                .children().each(function () {
                    var elem = $(this);
                    if (elem.data("ui-menu-submenu-carat")) {
                        elem.remove();
                    }
                });
            this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content");
        },
        _keydown: function (event) {
            var match, prev, character, skip, regex,
                preventDefault = true;
            function escape(value) {
                return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
            }
            switch (event.keyCode) {
                case $.ui.keyCode.PAGE_UP:
                    this.previousPage(event);
                    break;
                case $.ui.keyCode.PAGE_DOWN:
                    this.nextPage(event);
                    break;
                case $.ui.keyCode.HOME:
                    this._move("first", "first", event);
                    break;
                case $.ui.keyCode.END:
                    this._move("last", "last", event);
                    break;
                case $.ui.keyCode.UP:
                    this.previous(event);
                    break;
                case $.ui.keyCode.DOWN:
                    this.next(event);
                    break;
                case $.ui.keyCode.LEFT:
                    this.collapse(event);
                    break;
                case $.ui.keyCode.RIGHT:
                    if (this.active && !this.active.is(".ui-state-disabled")) {
                        this.expand(event);
                    }
                    break;
                case $.ui.keyCode.ENTER:
                case $.ui.keyCode.SPACE:
                    this._activate(event);
                    break;
                case $.ui.keyCode.ESCAPE:
                    this.collapse(event);
                    break;
                default:
                    preventDefault = false;
                    prev = this.previousFilter || "";
                    character = String.fromCharCode(event.keyCode);
                    skip = false;
                    clearTimeout(this.filterTimer);
                    if (character === prev) {
                        skip = true;
                    } else {
                        character = prev + character;
                    }
                    regex = new RegExp("^" + escape(character), "i");
                    match = this.activeMenu.children(".ui-menu-item").filter(function () {
                        return regex.test($(this).children("a").text());
                    });
                    match = skip && match.index(this.active.next()) !== -1 ?
                        this.active.nextAll(".ui-menu-item") :
                        match;
                    if (!match.length) {
                        character = String.fromCharCode(event.keyCode);
                        regex = new RegExp("^" + escape(character), "i");
                        match = this.activeMenu.children(".ui-menu-item").filter(function () {
                            return regex.test($(this).children("a").text());
                        });
                    }
                    if (match.length) {
                        this.focus(event, match);
                        if (match.length > 1) {
                            this.previousFilter = character;
                            this.filterTimer = this._delay(function () {
                                delete this.previousFilter;
                            }, 1000);
                        } else {
                            delete this.previousFilter;
                        }
                    } else {
                        delete this.previousFilter;
                    }
            }
            if (preventDefault) {
                event.preventDefault();
            }
        },
        _activate: function (event) {
            if (!this.active.is(".ui-state-disabled")) {
                if (this.active.children("a[aria-haspopup='true']").length) {
                    this.expand(event);
                } else {
                    this.select(event);
                }
            }
        },
        refresh: function () {
            var menus,
                icon = this.options.icons.submenu,
                submenus = this.element.find(this.options.menus);
            submenus.filter(":not(.ui-menu)")
                .addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
                .hide()
                .attr({
                    role: this.options.role,
                    "aria-hidden": "true",
                    "aria-expanded": "false"
                })
                .each(function () {
                    var menu = $(this),
                        item = menu.prev("a"),
                        submenuCarat = $("<span>")
                            .addClass("ui-menu-icon ui-icon " + icon)
                            .data("ui-menu-submenu-carat", true);
                    item
                        .attr("aria-haspopup", "true")
                        .prepend(submenuCarat);
                    menu.attr("aria-labelledby", item.attr("id"));
                });
            menus = submenus.add(this.element);
            menus.children(":not(.ui-menu-item):has(a)")
                .addClass("ui-menu-item")
                .attr("role", "presentation")
                .children("a")
                .uniqueId()
                .addClass("ui-corner-all")
                .attr({
                    tabIndex: -1,
                    role: this._itemRole()
                });
            menus.children(":not(.ui-menu-item)").each(function () {
                var item = $(this);
                if (!/[^\-—–\s]/.test(item.text())) {
                    item.addClass("ui-widget-content ui-menu-divider");
                }
            });
            menus.children(".ui-state-disabled").attr("aria-disabled", "true");
            if (this.active && !$.contains(this.element[0], this.active[0])) {
                this.blur();
            }
        },
        _itemRole: function () {
            return {
                menu: "menuitem",
                listbox: "option"
            }[this.options.role];
        },
        focus: function (event, item) {
            var nested, focused;
            this.blur(event, event && event.type === "focus");
            this._scrollIntoView(item);
            this.active = item.first();
            focused = this.active.children("a").addClass("ui-state-focus");
            if (this.options.role) {
                this.element.attr("aria-activedescendant", focused.attr("id"));
            }
            this.active
                .parent()
                .closest(".ui-menu-item")
                .children("a:first")
                .addClass("ui-state-active");
            if (event && event.type === "keydown") {
                this._close();
            } else {
                this.timer = this._delay(function () {
                    this._close();
                }, this.delay);
            }
            nested = item.children(".ui-menu");
            if (nested.length && (/^mouse/.test(event.type))) {
                this._startOpening(nested);
            }
            this.activeMenu = item.parent();
            this._trigger("focus", event, { item: item });
        },
        _scrollIntoView: function (item) {
            var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
            if (this._hasScroll()) {
                borderTop = parseFloat($.css(this.activeMenu[0], "borderTopWidth")) || 0;
                paddingTop = parseFloat($.css(this.activeMenu[0], "paddingTop")) || 0;
                offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
                scroll = this.activeMenu.scrollTop();
                elementHeight = this.activeMenu.height();
                itemHeight = item.height();
                if (offset < 0) {
                    this.activeMenu.scrollTop(scroll + offset);
                } else if (offset + itemHeight > elementHeight) {
                    this.activeMenu.scrollTop(scroll + offset - elementHeight + itemHeight);
                }
            }
        },
        blur: function (event, fromFocus) {
            if (!fromFocus) {
                clearTimeout(this.timer);
            }
            if (!this.active) {
                return;
            }
            this.active.children("a").removeClass("ui-state-focus");
            this.active = null;
            this._trigger("blur", event, { item: this.active });
        },
        _startOpening: function (submenu) {
            clearTimeout(this.timer);
            if (submenu.attr("aria-hidden") !== "true") {
                return;
            }
            this.timer = this._delay(function () {
                this._close();
                this._open(submenu);
            }, this.delay);
        },
        _open: function (submenu) {
            var position = $.extend({
                of: this.active
            }, this.options.position);
            clearTimeout(this.timer);
            this.element.find(".ui-menu").not(submenu.parents(".ui-menu"))
                .hide()
                .attr("aria-hidden", "true");
            submenu
                .show()
                .removeAttr("aria-hidden")
                .attr("aria-expanded", "true")
                .position(position);
        },
        collapseAll: function (event, all) {
            clearTimeout(this.timer);
            this.timer = this._delay(function () {
                var currentMenu = all ? this.element :
                    $(event && event.target).closest(this.element.find(".ui-menu"));
                if (!currentMenu.length) {
                    currentMenu = this.element;
                }
                this._close(currentMenu);
                this.blur(event);
                this.activeMenu = currentMenu;
            }, this.delay);
        },
        _close: function (startMenu) {
            if (!startMenu) {
                startMenu = this.active ? this.active.parent() : this.element;
            }
            startMenu
                .find(".ui-menu")
                .hide()
                .attr("aria-hidden", "true")
                .attr("aria-expanded", "false")
                .end()
                .find("a.ui-state-active")
                .removeClass("ui-state-active");
        },
        collapse: function (event) {
            var newItem = this.active &&
                this.active.parent().closest(".ui-menu-item", this.element);
            if (newItem && newItem.length) {
                this._close();
                this.focus(event, newItem);
            }
        },
        expand: function (event) {
            var newItem = this.active &&
                this.active
                    .children(".ui-menu ")
                    .children(".ui-menu-item")
                    .first();
            if (newItem && newItem.length) {
                this._open(newItem.parent());
                this._delay(function () {
                    this.focus(event, newItem);
                });
            }
        },
        next: function (event) {
            this._move("next", "first", event);
        },
        previous: function (event) {
            this._move("prev", "last", event);
        },
        isFirstItem: function () {
            return this.active && !this.active.prevAll(".ui-menu-item").length;
        },
        isLastItem: function () {
            return this.active && !this.active.nextAll(".ui-menu-item").length;
        },
        _move: function (direction, filter, event) {
            var next;
            if (this.active) {
                if (direction === "first" || direction === "last") {
                    next = this.active
                    [direction === "first" ? "prevAll" : "nextAll"](".ui-menu-item")
                        .eq(-1);
                } else {
                    next = this.active
                    [direction + "All"](".ui-menu-item")
                        .eq(0);
                }
            }
            if (!next || !next.length || !this.active) {
                next = this.activeMenu.children(".ui-menu-item")[filter]();
            }
            this.focus(event, next);
        },
        nextPage: function (event) {
            var item, base, height;
            if (!this.active) {
                this.next(event);
                return;
            }
            if (this.isLastItem()) {
                return;
            }
            if (this._hasScroll()) {
                base = this.active.offset().top;
                height = this.element.height();
                this.active.nextAll(".ui-menu-item").each(function () {
                    item = $(this);
                    return item.offset().top - base - height < 0;
                });
                this.focus(event, item);
            } else {
                this.focus(event, this.activeMenu.children(".ui-menu-item")
                [!this.active ? "first" : "last"]());
            }
        },
        previousPage: function (event) {
            var item, base, height;
            if (!this.active) {
                this.next(event);
                return;
            }
            if (this.isFirstItem()) {
                return;
            }
            if (this._hasScroll()) {
                base = this.active.offset().top;
                height = this.element.height();
                this.active.prevAll(".ui-menu-item").each(function () {
                    item = $(this);
                    return item.offset().top - base + height > 0;
                });
                this.focus(event, item);
            } else {
                this.focus(event, this.activeMenu.children(".ui-menu-item").first());
            }
        },
        _hasScroll: function () {
            return this.element.outerHeight() < this.element.prop("scrollHeight");
        },
        select: function (event) {
            this.active = this.active || $(event.target).closest(".ui-menu-item");
            var ui = { item: this.active };
            if (!this.active.has(".ui-menu").length) {
                this.collapseAll(event, true);
            }
            this._trigger("select", event, ui);
        }
    });
}(jQuery));
;
/*! RESOURCE: /scripts/doctype/html_class_setter.js */
(function () {
    if (window.NOW.htmlClassSetterInitialized)
        return;
    window.NOW.htmlClassSetterInitialized = true;
    var df = window.NOW.dateFormat;
    var shortDateFormat = window.NOW.shortDateFormat;
    var $h = $j('HTML');
    $j(function () {
        if (!df)
            return;
        CustomEvent.observe('timeago_set', function (timeAgo) {
            df.timeAgo = timeAgo;
            df.dateBoth = false;
            setDateClass();
        });
        CustomEvent.observe('shortdates_set', function (trueFalse) {
            shortDateFormat = trueFalse;
            setDateClass();
        });
        CustomEvent.observe('date_both', function (trueFalse) {
            df.dateBoth = trueFalse;
            df.timeAgo = false;
            setDateClass();
        })
    });
    function setDateClass() {
        $h.removeClass('date-timeago');
        $h.removeClass('date-calendar');
        $h.removeClass('date-calendar-short');
        $h.removeClass('date-both');
        if (df.dateBoth) {
            $h.addClass('date-both');
            if (shortDateFormat)
                $h.addClass('date-calendar-short');
            else
                $h.addClass('date-calendar');
        } else if (df.timeAgo)
            $h.addClass('date-timeago');
        else {
            if (shortDateFormat)
                $h.addClass('date-calendar-short');
            else
                $h.addClass('date-calendar');
        }
    }
    setDateClass();
    var toggleTemplate = function (trueFalse) {
        var bool = (typeof trueFalse !== "undefined") ? trueFalse : !window.NOW.templateToggle;
        window.NOW.templateToggle = bool;
        setPreference('glide.ui.templateToggle', bool);
        setTemplateToggle();
        if (CustomEvent.events.templateToggle.length > 1)
            CustomEvent.un('templateToggle', toggleTemplate);
    };
    CustomEvent.observe('templateToggle', toggleTemplate);
    CustomEvent.observe('compact', function (trueFalse) {
        window.NOW.compact = trueFalse;
        setCompact();
    });
    CustomEvent.observe('cc_listv3_tablerow_striped', function (bool) {
        if (bool) {
            $j('.table-container table.list-grid').addClass('table-striped');
        } else {
            $j('.table-container table.list-grid').removeClass('table-striped');
        }
    });
    function setTemplateToggle() {
        var toggleBtn = $j('#template-toggle-button'),
            ariaLiveEl = $j('#template-bar-aria-live');
        var ariaLiveMsg = '';
        if (window.NOW.templateToggle) {
            $h.addClass('templates');
            toggleBtn.attr('aria-expanded', 'true');
            ariaLiveMsg = getMessage('Added Template bar landmark to bottom of form.');
        }
        else {
            $h.removeClass('templates');
            toggleBtn.removeAttr('aria-expanded');
            ariaLiveMsg = getMessage('Removed Template bar landmark from bottom of form.');
        }
        ariaLiveEl.text(ariaLiveMsg);
    }
    CustomEvent.observe('form.loaded', setTemplateToggle);
    function setCompact() {
        try {
            var modalDiv = window.top.document.getElementById("settings_modal");
        } catch (e) {
        }
        if (modalDiv)
            modalDiv = modalDiv.childNodes[0];
        var $pH;
        if (parent.$j)
            $pH = parent.$j('HTML');
        if (window.NOW.compact) {
            $h.addClass('compact');
            if ($pH)
                $pH.addClass('compact');
            if (modalDiv && modalDiv.className.indexOf(' compact') == -1)
                modalDiv.className += ' compact';
        } else {
            $h.removeClass('compact');
            if ($pH)
                $pH.removeClass('compact');
            if (modalDiv && modalDiv.className.indexOf(' compact') > -1)
                modalDiv.className = modalDiv.className.replace(" compact", "");
        }
    }
    setCompact();
    CustomEvent.observe('tabbed', function (trueFalse) {
        window.NOW.tabbed = trueFalse;
        setTabbed();
    });
    function setTabbed() {
        if (window.NOW.tabbed)
            $h.addClass('tabbed');
        else
            $h.removeClass('tabbed');
    }
    setTabbed();
    function setListTableWrap() {
        if (window.NOW.listTableWrap)
            $j('HTML').removeClass('list-nowrap-whitespace');
        else
            $j('HTML').addClass('list-nowrap-whitespace');
    }
    setListTableWrap();
    CustomEvent.observe('table_wrap', function (trueFalse) {
        window.NOW.listTableWrap = trueFalse;
        setListTableWrap();
        CustomEvent.fire('calculate_fixed_headers');
    });
})();
function printList(maxRows) {
    var mainWin = getMainWindow();
    if (mainWin && mainWin.CustomEvent && mainWin.CustomEvent.fire && mainWin.CustomEvent.fire("print", maxRows) === false)
        return false;
    var veryLargeNumber = "999999999";
    var print = true;
    var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
    if (isChrome && isMacintosh)
        features = "";
    var href = "";
    var frame = top.gsft_main;
    if (!frame)
        frame = top;
    if (frame.document.getElementById("printURL") != null) {
        href = frame.document.getElementById("printURL").value;
        href = printListURLDecode(href);
    }
    if (!href) {
        if (frame.document.getElementById("sysparm_total_rows") != null) {
            var mRows = parseInt(maxRows);
            if (mRows < 1)
                mRows = 5000;
            var totalrows = frame.document.getElementById("sysparm_total_rows").value;
            if (parseInt(totalrows) > parseInt(mRows))
                print = confirm(getMessage("Printing large lists may affect system performance. Continue?"));
        }
        var formTest;
        var f = 0;
        var form = frame.document.forms['sys_personalize'];
        if (form && form.sysparm_referring_url) {
            href = form.sysparm_referring_url.value;
            if (href.indexOf("?sys_id=-1") != -1 && !href.startsWith('sys_report_template')) {
                alert(getMessage("Please save the current form before printing."));
                return false;
            }
            if (isMSIE) {
                var isFormPage = frame.document.getElementById("isFormPage");
                if (isFormPage != null && isFormPage.value == "true")
                    href = href.replace(/javascript%3A/gi, "_javascript_%3A");
            }
            href = printListURLDecode(href);
        } else
            href = document.getElementById("gsft_main").contentWindow.location.href;
    }
    if (href.indexOf("?") < 0)
        href += "?";
    else
        href += "&";
    href = href.replace("partial_page=", "syshint_unimportant=");
    href = href.replace("sysparm_media=", "syshint_unimportant=");
    href += "sysparm_stack=no&sysparm_force_row_count=" + veryLargeNumber + "&sysparm_media=print";
    if (print) {
        if (href != null && href != "") {
            win = window.open(href, "Printer_friendly_format", features);
            win.focus();
        } else {
            alert("Nothing to print");
        }
    }
    function printListURLDecode(href) {
        href = href.replace(/@99@/g, "&");
        href = href.replace(/@88@/g, "@99@");
        href = href.replace(/@77@/g, "@88@");
        href = href.replace(/@66@/g, "@77@");
        return href;
    }
}
function clearCacheSniperly() {
    var aj = new GlideAjax("GlideSystemAjax");
    aj.addParam("sysparm_name", "cacheFlush");
    aj.getXML(clearCacheDone);
}
function clearCacheDone() {
    window.status = "Cache flushed";
}
;
/*! RESOURCE: /scripts/doctype/floating_scrollbar.min.js */
!function (t) { function o(t) { b.toggle(!!t) } function e() { s && b.scrollLeft(s.scrollLeft()) } function n() { var t = $j(".navbar-fixed-bottom"); return t.length && window.NOW.templateToggle ? t.outerHeight() : 0 } function i() { if (c = s, s = null, v.each(function () { var o = t(this).offset().top, e = o + t(this).height(), n = h.height(); return n > o + u && e > n ? (s = t(this), !1) : void 0 }), !s) return void o(); var i = s.scrollLeft(), l = s.scrollLeft(90019001).scrollLeft(), r = s.innerWidth(), a = r + l; return s.scrollLeft(i), r >= a ? void o() : (o(!0), c && c[0] === s[0] || (c && (c[0].onscroll = void 0), s[0].onscroll = e, s.after(b)), b.css({ left: s.offset().left - f.scrollLeft(), width: r, bottom: n() }).scrollLeft(i), void g.width(a)) } function l() { var o = t(".custom-form-group"); o.length && (a || (f = t(".section_header_content_no_scroll"), o.floatingScrollbar(), a = !0)) } function r(t, o, e) { function n() { clearTimeout(r), r = setTimeout(i.bind(null, arguments), s) } function i(o, e, n) { l = o, t.apply(e, n) } var l, r, s = o || 100; return function () { var t = e || this, o = +new Date, r = arguments; l && l + s > o ? n(o, t, r) : i(o, t, r) } } if (!isMSIE9 && window.NOW.floatingScrollbars) { var s, c, f, a, d = 30, u = 30, h = t(this), v = t([]), b = t('<div id="floating-scrollbar"><div/></div>'), g = b.children(); b.hide().css({ position: "fixed", bottom: n(), height: "30px", "overflow-x": "auto", "overflow-y": "hidden" }).scroll(function () { s && s.scrollLeft(b.scrollLeft()) }), g.css({ border: "1px solid #fff", opacity: .01 }), t.fn.floatingScrollbar = function (o) { o === !1 ? (v = v.not(this), this.unbind("scroll", e), v.length || (b.detach(), h.unbind("resize", i), f.unbind("scroll", i))) : this.length && (v = v.add(this), isChrome && v.each(function () { t(this).css({ "-webkit-transform": "translate3d(0,0,0)" }) })), h.bind("resize", r(i, d)), f.bind("scroll", r(i, d)), i() }, CustomEvent.observe("list.loaded", l), CustomEvent.observe("tab.activated", i), CustomEvent.observe("partial.page.reload", l), CustomEvent.observe("related_lists.render", l), CustomEvent.observe("templateToggle", function () { b.css({ bottom: n() }) }) } }(jQuery);
/*! RESOURCE: /scripts/doctype/page_title.js */
$j(function ($) {
    var title = $('[data-form-title]').first().attr('data-form-title');
    if (!title || title == "null")
        title = $(".tabs2_section").first().attr('tab_caption');
    if (!title || title == "null")
        title = $('.list_title').first().text();
    if (!title || title == "null")
        return;
    document.title = title + ' | ' + document.title;
});
;
/*! RESOURCE: /scripts/responsive_form_header.js */
(function ($) {
    var cache = null;
    var MIN_HEADER_HEIGHT = 60;
    var DEFAULT_TIMEOUT_IN_MS = 100;
    addLoadEvent(initializeFormHeader);
    function initializeFormHeader() {
        if ($('.section_header_div_no_scroll').length === 0) {
            return;
        }
        setupCache();
        CustomEvent.observe("frame.resized", adjustFormHeaderElements);
        Event.observe(window, "resize", debounceAdjustFormHeaderElements);
    }
    function adjustFormHeaderElements() {
        if (!cache.hasLoaded && cache.$header.height() < MIN_HEADER_HEIGHT) {
            cache.hasLoaded = true;
            return;
        }
        recalculateDynamicHeaderElements();
        fitUiActions();
        cache.$content.css({ height: cache.$window.innerHeight() - cache.$header.height() });
    }
    function debounceAdjustFormHeaderElements() {
        clearTimeout(cache.timeout);
        cache.timeout = setTimeout(adjustFormHeaderElements, DEFAULT_TIMEOUT_IN_MS);
    }
    function setupCache() {
        if (cache == null) {
            cache = {};
            cache.timeout = null;
            cache.hasLoaded = false;
            cache.$window = $(window);
            cache.$header = $('.section_header_div_no_scroll');
            cache.$content = $('.section_header_content_no_scroll');
            cache.$spacer = $('div[data-position-below-header="true"]');
            cache.$navbar = $('nav.navbar-default:first');
            cache.$primaryContainer = cache.$navbar.find('.ui_action_container_primary');
            cache.$overflowContainer = cache.$navbar.find('.ui_action_container_overflow');
            cache.$uiActionContainer = cache.$primaryContainer.children(0);
            cache.$navbarDisplayValueElement = cache.$navbar.find('.navbar-header:first .navbar-title-display-value');
            cache.uiActionWidth = cache.$uiActionContainer.width();
            cache.navbarRightWidth = cache.$navbar.find('.navbar-right:first').width() - cache.uiActionWidth;
            cache.navbarTitleCaption = cache.$navbar.find('.navbar-header:first .navbar-title-caption').width();
        }
    }
    function recalculateDynamicHeaderElements() {
        cache.navbarHeaderWidth = cache.$navbar.find('.navbar-header:first').width();
        cache.navbarDisplayWidth = cache.$navbar.find('.navbar-header:first .navbar-title-display-value').width();
    }
    function fitUiActions() {
        cache.$navbarDisplayValueElement.css('max-width', '');
        recalculateDynamicHeaderElements();
        var navbarWidth = cache.$navbar.width();
        var headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
        if ((cache.navbarHeaderWidth + cache.navbarRightWidth) > cache.$window.width()) {
            var maxWidth = cache.navbarDisplayWidth - (cache.navbarHeaderWidth - cache.$window.width) - 20;
            if (navbarWidth > headerSize - cache.navbarDisplayWidth) {
                maxWidth -= cache.navbarRightWidth + cache.uiActionWidth;
            }
            cache.$navbarDisplayValueElement.css('max-width', Math.max(maxWidth, cache.navbarTitleCaption));
            navbarWidth = cache.$navbar.width();
            recalculateDynamicHeaderElements();
        }
        headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
        if (headerSize > navbarWidth) {
            if (cache.$uiActionContainer.parent().get(0) === cache.$primaryContainer.get(0)) {
                cache.$overflowContainer.append(cache.$uiActionContainer.detach());
            }
        } else if (cache.$uiActionContainer.parent().get(0) === cache.$overflowContainer.get(0)) {
            cache.$primaryContainer.append(cache.$uiActionContainer.detach());
        }
    }
})(jQuery);
;
/*! RESOURCE: /scripts/classes/doctype/streamButton.js */
$j(function ($) {
    "use strict";
    var closeButtonPadding = 32;
    var isOpen = false;
    var wrapperSelector = '.list_wrap_n_scroll';
    $('.list_stream_button').click(function () {
        $('.list_stream_button').attr("aria-expanded", !isOpen);
        if (!isOpen) {
            isOpen = true;
            var table = $('table.list_table[data-list_id]');
            var listid = table.attr('data-list_id');
            var query = table.attr('query');
            query = encodeURIComponent(query);
            var url = "$stream.do?sysparm_table=" + listid + "&sysparm_nostack=yes&sysparm_query=" + query;
            var target = 'parent';
            if (shouldUseFormPane())
                target = 'form_pane';
            url += "&sysparm_link_target=" + target;
            createStreamReader(url);
        } else {
            isOpen = false;
            var $readerDiv = $('.list_stream_reader');
            closeStreamReader($readerDiv);
        }
    });
    $(document).on('click', '.form_stream_button', function () {
        var url = "$stream.do?sysparm_table=" + g_form.getTableName();
        url += "&sysparm_sys_id=" + g_form.getUniqueValue();
        url += "&sysparm_stack=no";
        createStreamReader(url);
    });
    function shouldUseFormPane() {
        try {
            if (self == top)
                return false;
            if (window.top.g_navManager)
                return !!window.top.g_navManager.options.formTarget;
        } catch (e) { }
        return false;
    }
    function createStreamReader(url) {
        if ($('.list_stream_reader').length)
            return;
        var frame = '	<iframe src="' + url + '" id="list_stream_reader_frame"></iframe>';
        var $div = $('<div class="list_stream_reader" role="region" aria-labelledby="stream_header">' +
            '<div class="list_stream_plank_header" role="heading">' +
            '<span class="list_stream_reader_close"><button id="list_stream_reader_close_button" aria-label="' + getMessage('Close Activity Stream') + '" class="plank_close_button icon-double-chevron-right"></button></span><h4 id="stream_header">' + getMessage('Activity Stream') + '</h4>' +
            '</div>' +
            frame +
            '</div>');
        $('body').append($div);
        $('#list_stream_reader_frame').bind('load', function () {
            if (NOW.compact) {
                $(this).contents().find('html').addClass('compact');
            }
            CustomEvent.observe('compact', function (newValue) {
                var method = newValue ? 'addClass' : 'removeClass';
                $('#list_stream_reader_frame').contents()
                    .find('html')[method]('compact');
            })
        });
        $('#list_stream_reader_close_button')[0].focus();
        resizeStreamReader($div);
        $(window).bind('resize.streamreader', function () {
            unfreezeTableWidth();
            if ($div.parent().length === 0) {
                $(window).unbind('resize.streamreader');
                return;
            }
            resizeStreamReader($div);
        })
    }
    function setListWrapperStyles(stylesObject) {
        var $listWrapper = $(wrapperSelector);
        if ($listWrapper.length === 0) {
            return;
        }
        $listWrapper.closest('body').css(stylesObject);
    }
    function resizeStreamReader($div) {
        freezeTableWidth();
        var width = $div.outerWidth() + closeButtonPadding;
        var listWrapperStyles = {
            'padding-right': width,
            'position': 'absolute'
        };
        setListWrapperStyles(listWrapperStyles);
        var top = 50;
        if (typeof g_form == 'undefined')
            top = $('.list_nav_spacer').offset().top;
        else
            top = $('.section_header_content_no_scroll').offset().top;
        $div.css('top', top);
        if ("ontouchstart" in window) {
            $div.css('absolute');
            window.scrollTo(0, top);
        }
    }
    $('body').on('click', '.list_stream_reader_close', function () {
        isOpen = false;
        var $readerDiv = $(this).closest('.list_stream_reader');
        closeStreamReader($readerDiv);
        var streamButton = $('.list_stream_button');
        if (streamButton.length > 0) {
            streamButton.attr("aria-expanded", isOpen);
            streamButton.focus();
        }
    });
    function closeStreamReader($readerDiv) {
        unfreezeTableWidth();
        $readerDiv.remove();
        var listWrapperStyles = {
            'position': '',
            'padding-right': 0
        };
        setListWrapperStyles(listWrapperStyles);
    }
    function freezeTableWidth() {
        $('table.list_table').each(function (index, el) {
            var $el = $(el);
            var width = $el.width();
            $el.css('width', width);
        })
    }
    function unfreezeTableWidth() {
        $('table.list_table').each(function (index, el) {
            $(el).css('width', '');
        })
    }
});
;
/*! RESOURCE: /scripts/js_includes_weba.js */
/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function () {
    function subscribe() {
        if (window.NOW.webaConfig.subscribed == true)
            return;
        var ambClient = getAMB();
        if (ambClient == undefined || ambClient == "")
            return;
        var webaChannelId = "/weba/config";
        var webaCh = ambClient.getChannel(webaChannelId);
        webaCh.subscribe(function (response) {
            if (window.NOW.webaConfig == undefined)
                window.NOW.webaConfig = {};
            var oldConfig = {
                siteId: window.NOW.webaConfig.siteId,
                trackerURL: window.NOW.webaConfig.trackerURL
            };
            window.NOW.webaConfig.siteId = response.data.weba_site_id;
            window.NOW.webaConfig.trackerURL = response.data.weba_rx_url;
            handleConfigUpdate(oldConfig, window.NOW.webaConfig);
        });
        ambClient.connect();
        window.NOW.webaConfig.subscribed = true;
    }
    function getAMB() {
        var ambClient = window.NOW.webaConfig.ambClient;
        if (ambClient == undefined || ambClient == "")
            window.NOW.webaConfig.ambClient = (window.g_ambClient) ? window.g_ambClient : ((window.amb) ? window.amb.getClient() : "");
        return window.NOW.webaConfig.ambClient;
    }
    function handleConfigUpdate(oldConfig, newConfig) {
        if (newConfig.siteId == "0")
            removeTracker();
        else if (oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
            updateTracker(oldConfig, newConfig);
        else if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
            insertTracker(newConfig);
    }
    function removeTracker() {
        if (!trackerExists())
            return;
        removeWebaTracker();
        removeWebaScript();
        removeWebaElements();
    }
    function removeWebaTracker() {
        var document = window.parent.document;
        var trackerScriptId = "webaTracker";
        var trackEle = document.getElementById(trackerScriptId);
        trackEle.parentNode.removeChild(trackEle);
    }
    function removeWebaScript() {
        var document = window.parent.document;
        var asyncTrackEle = document.getElementById('webaScript');
        if (asyncTrackEle == undefined)
            return;
        var src = asyncTrackEle.src;
        if (src != undefined && src.indexOf("piwik") > 0)
            asyncTrackEle.parentNode.removeChild(asyncTrackEle);
    }
    function removeWebaElements() {
        var document = window.parent.document;
        var webaEle = document.getElementsByClassName("weba");
        var webaSize = webaEle.length - 1;
        while (webaSize >= 0) {
            webaEle[webaSize].parentNode.removeChild(webaEle[webaSize]);
            webaSize--;
        }
    }
    function updateTracker(oldConfig, newConfig) {
        if (!trackerExists())
            return;
        var document = window.parent.document;
        var head = document.head || document.getElementsByTagName('head')[0];
        var updateScript = "_paq.push(['setSiteId', " + newConfig.siteId + "]);" + "_paq.push(['setTrackerUrl', " + "'" + newConfig.trackerURL + "'" + "]);";
        var uEle = window.document.createElement("script");
        uEle.text = updateScript;
        uEle.className = "weba";
        head.appendChild(uEle);
    }
    function insertTracker(newConfig) {
        var document = window.parent.document;
        var head = document.head || document.getElementsByTagName('head')[0];
        if (trackerExists())
            return;
        if (!isConfigValid(newConfig))
            return;
        var trackerScript = generateTrackerScript(newConfig);
        var trackerElement = getOrCreateTracker();
        trackerElement.text = trackerScript;
        head.appendChild(trackerElement);
    }
    function applyTracker() {
        insertTracker(window.NOW.webaConfig);
        subscribe();
    }
    function applyTrackEvent(category, key, value, additionalValue) {
        insertEventTracker(category, key, value, additionalValue);
        subscribe();
    }
    function insertEventTracker(category, key, value, additionalValue) {
        if (!isConfigValid(window.NOW.webaConfig))
            return;
        if (!trackerExists())
            insertTracker(window.NOW.webaConfig);
        var eventItems = ["trackEvent", category, key, value, additionalValue];
        var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
        var document = window.parent.document;
        var head = document.head || document.getElementsByTagName('head')[0];
        var scriptEle = window.document.createElement("script");
        scriptEle.className = "weba";
        scriptEle.text = eventScript;
        head.appendChild(scriptEle);
    }
    function trackerExists() {
        var document = window.parent.document;
        var trackEle = document.getElementById("webaTracker");
        if (trackEle != undefined && trackEle != null)
            return true;
        return false;
    }
    function isConfigValid(newConfig) {
        var zero = "0";
        var webaSiteId = (newConfig != undefined) ? newConfig.siteId : zero;
        var trackerURL = (newConfig != undefined) ? newConfig.trackerURL : "";
        if (webaSiteId == undefined || webaSiteId == "")
            return false;
        if (webaSiteId == zero)
            return false;
        if (trackerURL == undefined || trackerURL == "")
            return false;
        return true;
    }
    function getOrCreateTracker() {
        var trackerScriptId = "webaTracker";
        var document = window.parent.document;
        var trackEle = document.getElementById(trackerScriptId);
        if (trackEle != undefined && trackEle != null)
            return trackEle;
        trackEle = document.createElement("script");
        trackEle.id = trackerScriptId;
        trackEle.type = "text/javascript";
        return trackEle;
    }
    function getUserId() {
        if (window.NOW.user_id != undefined && window.NOW.user_id != "")
            return window.NOW.user_id;
        else if (window.NOW.session_id != undefined)
            return window.NOW.session_id;
        else {
            var userObj = window.NOW.user;
            if (userObj != undefined)
                return userObj.userID;
        }
    }
    function generateTrackerScript(webaConfig) {
        var trackerURL = webaConfig.trackerURL;
        if (trackerURL.endsWith("/"))
            trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
        var userId = getUserId();
        var script = "var _paq = _paq || [];";
        script += "_paq.push(['setUserId', '" + userId + "']);";
        script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
        script += "(function() {_paq.push(['setTrackerUrl','" + trackerURL + "']);"
            + "_paq.push(['setSiteId', " + webaConfig.siteId + "]);"
            + "var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; "
            + "g.defer=true; g.src='" + webaConfig.webaScriptPath + "'; "
            + "g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
        return script;
    }
    var api = {
        trackPage: function () {
            if (window.document.readyState == "complete")
                applyTracker();
            else
                window.addEventListener("load", function () {
                    applyTracker();
                }, false);
        },
        trackEvent: function (category, key, value, additionalValue, delayInMs) {
            if (delayInMs == undefined)
                delayInMs = 3000;
            window.setTimeout(function () {
                applyTrackEvent(category, key, value, additionalValue);
            }, delayInMs);
        }
    }
    return api;
})();
;
;
;