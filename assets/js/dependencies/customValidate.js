$(document).ready(function()
	{
		$('#sign-up-form').validate({
				rules:
					{
						name:
							{
								required: true
							},
						email:
							{
								required: true,
								email: true
							},
						password:
							{
								minlength: 8,
								required: true
							},
						confirmation:
							{
								minlength: 8,
								equalTo: "#password"
							}
					},
				success: function(element)
					{
						element
						.text('OK!').addClass('valid')
					}
			});
	});