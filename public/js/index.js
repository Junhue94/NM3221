
$(document).ready(function () {
    // Run multiple versions of jQuery
    $.noConflict();


    // Variables
    var $userName = $('#user-name'),
        $userMatricNo = $('#user-matric-no'),
        $userList = $('#user-list'),

        $userDetailsName = $('#user-details-name'),
        $userDetailsMatricNo = $('#user-details-matric-no'),

        $newIssueForm = $('#new-issue-form'),
        $newIssueTitle = $('#new-issue-title'),
        $newIssueCreate = $('#new-issue-create');


    // Focus on input upon page visit
    $userName.focus();


    // HTML Escape
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function htmlEscape(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }


    // Prevent sending of empty message
    $.fn.preventNilInput = function (input_id, btn_id) {
        $(input_id).keyup(function() {
            if($(this).val().length !=0)
                btn_id.attr('disabled', false);
            else
                btn_id.attr('disabled',true);
        });
    };

    // For New Issue
    $newIssueTitle.preventNilInput($newIssueTitle, $newIssueCreate);

    // For New Message
    $(document).delegate('.accordion-title', 'click', function () {
        var $title = $(this),
            $issue_id = $title.attr('name'),
            $messageInput = $('#'+ $issue_id +'.input-group-field.message-input'),
            $submitButton = $('#'+ $issue_id +'.button.send-message');
        $messageInput.preventNilInput($messageInput, $submitButton);
    });


    // Login Form Validation
    $('#user-form').validate({
        rules: {
            'user-name': {
                required: true
            },
            'user-matric-no': {
                required: true
                /*minlength: 8,
                maxlength: 8*/
            }
        },
        messages: {
            'user-name': {
                required: "Name is required"
            },
            'user-matric-no': {
                required: "Matric No. is required"
                /*minlength: "Matric No. must be exactly 8 characters long",
                maxlength: "Matric No. must be exactly 8 characters long"*/
            }
        },
        submitHandler: function () {
            var userMatricNo = htmlEscape($userMatricNo.val());
            var userName = htmlEscape($userName.val());
            // Last parameter is callback from server
            socket.emit('user-login', {userMatricNo: userMatricNo, userName: userName}, function (username) {
                if (username) {
                    $('#login-window').hide();
                    $('#chat-layout').show();
                    $userDetailsName.html(userName);
                    $userDetailsMatricNo.html(userMatricNo);
                } else {
                    $('#error-layout').show();
                    $('#error-message').html('Matric No. had been used by other user');
                }
            });
        }
    });

    // Socket IO
    var socket = io.connect();

    // User - Create New Issue
    $newIssueForm.submit(function (e) {
        e.preventDefault();
        var newIssueTitle = htmlEscape($newIssueTitle.val());
        socket.emit('submit-new-issue', newIssueTitle);

        $('.reveal-overlay').hide();
        $newIssueTitle.val('');
        $newIssueCreate.attr('disabled', true);
    });

    // User - Send Message
    $(document).delegate('#message-form', 'submit', function (e) {
        // Prevent page refresh upon submit
        e.preventDefault();
        var $form = $(this),
            $issue_id = $form.attr('name'),
            $message_input = $('#'+ $issue_id +'.message-input'),
            messageInput = htmlEscape($message_input.val());

        socket.emit('send-message', {
            issue_id: $issue_id,
            messageInput: messageInput
        });

        // Clear #messageInput
        $message_input.val('');
    });



   function displayOldMessage(data) {
       var issue_id = data._id;
       for (var i = 0; i < (data.message).length; i++) {
           $('#'+ issue_id +'.message-list').append(
               '<p class="message-list-user">' + (data.message)[i].username + ': </p>' +
               '<p class="message-list-comment">' + (data.message)[i].message + "</p>"
           );
       }
   }

   function displayNewMessage(data) {
       var issue_id = data.issue_id;
       $('#'+ issue_id +'.message-list').append(
           '<p class="message-list-user">' + data.newMessage.username + ': </p>' +
           '<p class="message-list-comment">' + data.newMessage.message + "</p>"
       );
   }
    
    socket.on('load-old-messages', function (oldMessages) {
        for (var i = 0; i < oldMessages.length; i++) {
            displayOldMessage(oldMessages[i]);
        }
    });

    socket.on('new-message', function (data) {
        displayNewMessage(data);
    });

    socket.on('updated-user-list', function (users) {
        var user_list = '';
        for (var i = 0; i < users.users.length; i++) {
            user_list += '<li><p>' + users.users[i]['user_name'] + '</p></li>'
        }
        $('#no-of-users').html(users.no_of_users);
        $userList.html(user_list)
    });
});