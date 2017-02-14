/**
 * Allow any authenticated user.
 */
module.exports = function(req, res, ok) {

  // User is allowed, proceed to controller
//  if (req.session.User) {
  if (req.session.authenticated) {
    return ok();
  }
  

  // User is not allowed
  else {
	//  return req.session.me;
		var requireLoginError = [{name: 'requireLogin', message: 'authenticated policy: You must be signed in.'}]
     req.session.flash = {
     	err: requireLoginError
     }
	return res.backToHomePage();
  //  res.send(403);
  }
};