
$(document).ready(function () {
    // Socket IO
    var socket = io.connect();

    // Variables
    var $issueBox = $('#issue-box');

    function displayIssue(data) {
        var old_height = $(document).height();  // Store document height before modifications
        var old_scroll = $(window).scrollTop(); // Remember the scroll position

        $issueBox.prepend('<ul class="accordion" data-accordion data-allow-all-closed="true">' +
        '<li class="accordion-item" data-accordion-item>' +
            '<a name="'+ data._id +'" class="accordion-title">' +
                '<p>' + data.issue + '</p>' +
            '</a>' +
            '<div class="accordion-content" data-tab-content>' +
                '<div id="'+ data._id +'" class="message-list"></div>' +
                    '<form id="message-form" name="'+ data._id +'">' +
                    '<div class="input-group">' +
                        '<input id="'+ data._id +'" class="input-group-field message-input" type="text" autocomplete="off">' +
                        '<div class="input-group-button">' +
                            '<input id="'+ data._id +'" class="button send-message" type="submit" value="Send" disabled>' +
                        '</div>' +
                    '</div>' +
                    '</form>' +
               '</div>' +
            '</li>' +
        '</ul>').foundation();

        $(document).scrollTop(old_scroll + $(document).height() - old_height); // Return to the original scroll
    }

    socket.on('load-all-issues', function (oldIssues) {
        for (var i = 0; i < oldIssues.length; i++) {
            displayIssue(oldIssues[i]);
        }
    });

    socket.on('create-new-issue', function (data) {
        displayIssue(data);
    });

});
