/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt');

module.exports =
	{
		login: function (req, res)
			{
				User.findOne
					({
						email: req.body.email
					 },
				function(err, user)
					{
						if (err)
							{
								res.json({ error: 'DB error' }, 500);
							}
						if (!user)
							{
								res.view('static/index');
							}
			 			else
							{
								bcrypt.compare(req.body.password, user.password, function(err, match)
									{
										if (match)
											{
												//console.log('login');
												req.session.name = user.name;
												req.session.user = user.id;
												res.redirect('/');
											}
									});
							}
					});
			},
	logout: function (req, res)
		{
			//console.log(req.session);
			req.session.destroy(function() {
				res.redirect('/');
			});
		},
		create: function(req, res) {
			User.create(req.body).exec(function(err, user){
				if (err) {
					return res.view('static/error', {error: 'Username/Email May Already Be Taken, Or Incorrect Password'});
				}
				req.session.name = user.name;
				req.session.user = user.id;
				return res.redirect('/');
			});
		}
};
