$(document).ready(function () {
    // Run multiple versions of jQuery
    $.noConflict();

    $('#user-reg-form').validate({
        rules: {
            'username': {
                required: true
            },
            'password': {
                required: true,
                minlength: 6
            },
            'repassword': {
                required: true,
                minlength: 6,
                equalTo: '#password'
            }
        },
        messages: {
            'username': {
                required: "Username is required"
            },
            'password': {
                required: "Password is required",
                minlength: "Password must at least 6 characters long"

            },
            'repassword': {
                required: "Password is required",
                minlength: "Password must at least 6 characters long",
                equalTo: "Password does not match"
            }
        }
    });
});