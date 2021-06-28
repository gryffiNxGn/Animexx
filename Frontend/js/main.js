$(document).ready(function() {
    initNavToggle();
	initCarousel();
	initResizeHandler();
	initAutoHeight();
	initMultiTabHandler();
	initAccountBoxHandler();
	initAccountBoxOpener();
	initAccountLogin();
	initAccountRegistration();
	initAccountForgotPassword();
	initLoginPageViewHandler();
});

function stringToHash(string) {
	var hash = 0;
	if (string.length == 0) return hash;
	for (var i = 0; i < string.length; i++) {
		var char = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash;
}

function initNavToggle() {
	$('.navbar-toggler').click(function(e) {
		$('body').toggleClass('navOpen');
	});
}

function initCarousel() {
	$('.carousel').carousel();
}

function initResizeHandler() {
	$(window).on("resize orientationchange", function() {
		$('body').removeClass('navOpen');
	});
}

function initAutoHeight() {
	$('main').css('min-height', ($(window).height() - $('header').outerHeight() - $('footer').outerHeight()));
	
	$(window).on("resize orientationchange", function() {
		$('main').css('min-height', ($(window).height() - $('header').outerHeight() - $('footer').outerHeight()));
	});
}

function initMultiTabHandler() {
	$('.nav-tabs a').click(function(e) {
		$('.tab-contentSecond .tab-pane.active').addClass('fade').removeClass('active');
		$($(this).attr('href') + 'a').addClass('active').removeClass('fade');
	});
}

function initAccountBoxHandler() {
	var login = $('.navExt .login');
	var forgotPassword = $('.navExt .forgotPassword');
	var register = $('.navExt .register');
	
	var forgotPasswordButton = $('.navExt .login .forgotPasswordOpener');
	var registerButton = $('.navExt .login #registerLink');
	var loginButton = $('.navExt #loginBtn');
	
	var dropdown = $('.navExt .accountDropdownBox');
	
	var registerBackButton = $('.navExt .register .backToLogin');
	var forgotPasswordBackButton = $('.navExt .forgotPassword .backToLogin');
	
	forgotPasswordButton.click(function(e) {
		e.preventDefault();
		dropdown.addClass('forgotPasswordActive');
		login.addClass('removing').removeClass('active');
		setTimeout(function(){
			login.removeClass('removing');
			forgotPassword.addClass('transitioning');
			setTimeout(function(){
				forgotPassword.addClass('active');
				forgotPassword.removeClass('transitioning');
			}, 10);
		}, 250);
	});
	
	forgotPasswordBackButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation()
		forgotPassword.addClass('removing').removeClass('active');
		setTimeout(function(){
			dropdown.removeClass('forgotPasswordActive');
			forgotPassword.removeClass('removing');
			login.addClass('transitioning');
			setTimeout(function(){
				login.addClass('active');
				login.removeClass('transitioning');
			}, 10);
		}, 250);
	});
	
	registerButton.click(function(e) {
		e.preventDefault();
		login.addClass('removing').removeClass('active');
		setTimeout(function(){
			dropdown.addClass('registerActive');
			login.removeClass('removing');
			register.addClass('transitioning');
			setTimeout(function(){
				register.addClass('active');
				register.removeClass('transitioning');
			}, 10);
		}, 250);
	});
	
	registerBackButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation()
		register.addClass('removing').removeClass('active');
		dropdown.removeClass('registerActive');
		setTimeout(function(){
			register.removeClass('removing');
			login.addClass('transitioning');
			setTimeout(function(){
				login.addClass('active');
				login.removeClass('transitioning');
			}, 10);
		}, 250);
	});
	
	loginButton.click(function(e) {
		dropdown.removeClass('registerActive').removeClass('forgotPasswordActive');
		login.addClass('active');
		forgotPassword.removeClass('active');
		register.removeClass('active');
	});
	
	$('.dropdown-menu').click(function(e) {
		e.stopPropagation();
	});
	$('.accountDropdownBox .closeDropdown').click(function(e) {
		$('.accountDropdownBox').closest('.dropdown').dropdown('toggle');
	});
}

function initAccountBoxOpener() {
	$('#toLogin').click(function(e) {
		e.preventDefault();
        $("html, body").animate({ scrollTop: "0" }, 250);
		//$('.accountDropdownBox').closest('.dropdown').dropdown('toggle');
	});
	
	$('#toRegister').click(function(e) {
		e.preventDefault();
        $("html, body").animate({ scrollTop: "0" }, 250);
		//$('.accountDropdownBox').closest('.dropdown').dropdown('toggle');
	});
}

function initAccountLogin() {
	$('#loginEmail').focusout(function() {
        validateEmail();
    });
	
	$('#loginPassword').focusout(function() {
        validatePassword();
    });
	
	var $loginEmail = $('#loginEmail');
	var $loginEmailInvalid = $('#loginEmailInvalid');
	var $loginPassword = $('#loginPassword');
	var $loginPasswordInvalid = $('#loginPasswordInvalid');
	
	var $loginEmailError = false;
	var $loginPasswordError = false;
	
	function validateEmail() {
		$loginEmailValue = $loginEmail.val();
		$regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		if($regex.test($loginEmailValue)) {
			$formData = {
				email : $loginEmailValue,
			}
			
			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : 'http://localhost:8000/api/user/unique',
				data : JSON.stringify($formData),
				dataType : 'json',
				success : function(user) {
					if (user.daten.unique == 1) {
						$loginEmail.removeClass('invalid').addClass('valid');
						$loginEmailInvalid.removeClass('triggered');
						$loginEmailError = false;
					} else {
						$loginEmail.removeClass('valid').addClass('invalid');
						$loginEmailInvalid.addClass('triggered');
						$loginEmailError = true;
					}
				},
				error : function(e) {
					alert("unbekannter Server-Fehler");
				}
			});
		} else {
			$loginEmail.removeClass('valid').addClass('invalid');
			$loginEmailInvalid.addClass('triggered');
			$loginEmailError = true;
		}
	}
	
	function validatePassword() {
		$loginEmailVal = $("#loginEmail").val();
		$loginPasswordVal = $("#loginPassword").val();
		var hashedpw =   stringToHash($loginPasswordVal).toString();
		
		$loginPasswordValue = $loginPassword.val();
		if($loginPasswordValue.length >= 6 && $loginPasswordValue.length <= 26) {
			$formData = {
				email : $loginEmailVal,
				password : hashedpw,
			}

			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : 'http://localhost:8000/api/user/check',
				data : JSON.stringify($formData),
				dataType : 'json',
				success : function(response) {
					if (response.accessToken) {
						$loginPassword.removeClass('invalid').addClass('valid');
						$loginPasswordInvalid.removeClass('triggered');
						$loginPasswordError = false;
					} else {
						$loginPassword.removeClass('valid').addClass('invalid');
						$loginPasswordInvalid.addClass('triggered');
						$loginPasswordError = true;
					}
				},
				error : function(e) {
					$loginPassword.removeClass('valid').addClass('invalid');
					$loginPasswordInvalid.addClass('triggered');
					$loginPasswordError = true;
				}
			});
		} else {
			$loginPassword.removeClass('valid').addClass('invalid');
			$loginPasswordInvalid.addClass('triggered');
			$loginPasswordError = true;
		}
	}
	
	
	$("#loginButton").click(function(e){
		e.preventDefault();
        validateEmail();
        validatePassword();
        if ($loginEmailError == false && $loginPasswordError == false) {
			loginAccount();
        }
	});
	
	function loginAccount() {
		$loginEmailVal = $("#loginEmail").val();
		$loginPasswordVal = $("#loginPassword").val();
		var hashedpw =   stringToHash($loginPasswordVal).toString();
		
		$formData = {
			email : $loginEmailVal,
			password : hashedpw,
		}

		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/user/check',
			data : JSON.stringify($formData),
			dataType : 'json',
			success : function(response) {
				if (response.accessToken) {
					localStorage.setItem("animexxUserToken", response.accessToken);
					location.reload();
				} else {
					alert("Login fehlgeschlagen");
				}
			},
			error : function(e) {
				alert("Unbekannter Server-Fehler: Wir arbeiten schon daran!");
			}
		});
	}
}

function initAccountRegistration() {
    $('#registerNick').focusout(function() {
        validateNick();
    });
	
	$('#registerName').focusout(function() {
        validateName();
    });
	
	$('#registerEmail').focusout(function() {
        validateEmail();
    });
	
	$('#registerPassword').focusout(function() {
        validatePassword();
    });
	
	$('#registerPasswordRepeat').focusout(function() {
        validatePasswordRepeat();
    });
	
	var $nick = $('#registerNick');
	var $name = $('#registerName');
	var $email = $('#registerEmail');
	var $password = $('#registerPassword');
	var $passwordRepeat = $('#registerPasswordRepeat');
	
	var $regNickInvalid = $('#regNickInvalid');
	var $regNameInvalid = $('#regNameInvalid');
	var $regEmailTaken = $('#regEmailTaken');
	var $regEmailInvalid = $('#regEmailInvalid');
	var $regPasswordInvalid = $('#regPasswordInvalid');
	var $regPasswordRepeatInvalid = $('#regPasswordRepeatInvalid');
	
	var $nickError = false;
	var $nameError = false;
	var $emailError = false;
	var $passwordError = false;
	var $passwordRepeatError = false;
      
    function validateNick() {
		$nickValue = $nick.val();
		if($nickValue.length >= 3 && $nickValue.length <= 12) {
			$nick.removeClass('invalid').addClass('valid');
			$regNickInvalid.removeClass('triggered');
			$nickError = false;
		} else {
			$nick.removeClass('valid').addClass('invalid');
			$regNickInvalid.addClass('triggered');
			$nickError = true;
		}
    }
	
	function validateName() {
		$nameValue = $name.val();
		if($nameValue.length >= 3 && $nameValue.length <= 26) {
			$name.removeClass('invalid').addClass('valid');
			$regNameInvalid.removeClass('triggered');
			$nameError = false;
		} else {
			$name.removeClass('valid').addClass('invalid');
			$regNameInvalid.addClass('triggered');
			$nameError = true;
		}
	}
	
	function validateEmail() {
		$emailValue = $email.val();
		$regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		
		if($regex.test($emailValue)) {
			$formData = {
				email : $emailValue,
			}
			
			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : 'http://localhost:8000/api/user/unique',
				data : JSON.stringify($formData),
				dataType : 'json',
				success : function(user) {
					if (user.daten.unique == 0) {
						$email.removeClass('invalid').addClass('valid');
						$regEmailInvalid.removeClass('triggered');
						$regEmailTaken.removeClass('triggered');
						$emailError = false;
					} else {
						$email.removeClass('valid').addClass('invalid');
						$regEmailInvalid.removeClass('triggered');
						$regEmailTaken.addClass('triggered');
						$emailError = true;
					}
				},
				error : function(e) {
					alert("unbekannter Server-Fehler");
				}
			});
		} else {
			$email.removeClass('valid').addClass('invalid');
			$regEmailInvalid.addClass('triggered');
			$emailError = true;
		}
	}
	
	function validatePassword() {
		$passwordValue = $password.val();
		if($passwordValue.length >= 6 && $passwordValue.length <= 26) {
			$password.removeClass('invalid').addClass('valid');
			$regPasswordInvalid.removeClass('triggered');
			$passwordError = false;
		} else {
			$password.removeClass('valid').addClass('invalid');
			$regPasswordInvalid.addClass('triggered');
			$passwordError = true;
		}
	}
	
	function validatePasswordRepeat() {
		$passwordRepeatValue = $passwordRepeat.val();
		if($passwordValue.length >= 6 && $passwordValue.length <= 26 && $passwordRepeatValue == $('#registerPassword').val()) {
			$passwordRepeat.removeClass('invalid').addClass('valid');
			$regPasswordRepeatInvalid.removeClass('triggered');
			$passwordRepeatError = false;
		} else {
			$passwordRepeat.removeClass('valid').addClass('invalid');
			$regPasswordRepeatInvalid.addClass('triggered');
			$passwordRepeatError = true;
		}
	}
	
    $('#regButton').click(function(e) {
		e.preventDefault();
        validateNick();
        validateName();
        validateEmail();
        validatePassword();
		validatePasswordRepeat();
        if ($nickError == false && $nameError == false && $emailError == false && $passwordError == false && $passwordRepeatError == false) {
			createAccount();
        }
    });
	
	function createAccount() {
		$registerPasswordVal = $("#registerPassword").val();
		var hashedpw = stringToHash($registerPasswordVal).toString();
		
		$formData = {
			name : $('#registerName').val(),
			nickname : $('#registerNick').val(),
			email : $('#registerEmail').val(),
			password : hashedpw,
		}
		
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/user',
			data : JSON.stringify($formData),
			dataType : 'json',
			success : function(user) {
				if (user.accessToken) {
					localStorage.setItem("animexxUserToken", user.accessToken);
					location.reload();
				} else {
					alert("unbekannter Server-Fehler");
				}
			},
			error : function(e) {
				alert("unbekannter Server-Fehler");
			}
		});
	}
}

function initAccountForgotPassword() {
	$('#forgotPasswordEmail').focusout(function() {
        validateEmail();
    });
	
	var $forgotPasswordEmail = $('#forgotPasswordEmail');
	
	var $forgotPasswordEmailFalse = $('#forgotPasswordEmailFalse');
	var $forgotPasswordInvalid = $('#forgotPasswordEmailInvalid');
	
	var $forgotPasswordEmailError = false;
	
	function validateEmail() {
		$emailValue = $forgotPasswordEmail.val();
		$regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		
		if($regex.test($emailValue)) {
			$formData = {
				email : $emailValue,
			}
			
			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : 'http://localhost:8000/api/user/unique',
				data : JSON.stringify($formData),
				dataType : 'json',
				success : function(user) {
					if (user.daten.unique == 1) {
						$forgotPasswordEmail.removeClass('invalid').addClass('valid');
						$forgotPasswordInvalid.removeClass('triggered');
						$forgotPasswordEmailFalse.removeClass('triggered');
						$forgotPasswordEmailError = false;
					} else {
						$forgotPasswordEmail.removeClass('valid').addClass('invalid');
						$forgotPasswordInvalid.removeClass('triggered');
						$forgotPasswordEmailFalse.addClass('triggered');
						$forgotPasswordEmailError = true;
					}
				},
				error : function(e) {
					alert("unbekannter Server-Fehler");
				}
			});
		} else {
			$forgotPasswordEmail.removeClass('valid').addClass('invalid');
			$forgotPasswordInvalid.addClass('triggered');
			$forgotPasswordEmailFalse.removeClass('triggered');
			$forgotPasswordEmailError = true;
		}
	}
	
	$('#forgotPasswordButton').click(function(e) {
		e.preventDefault();
        validateEmail
        if ($forgotPasswordEmailError == false) {
			resetPassword();
        }
    });
	
	function resetPassword() {
		$formData = {
			email : $forgotPasswordEmail.val(),
		}
		
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/forgotPassword',
			data : JSON.stringify($formData),
			dataType : 'json',
			success : function(user) {
				if (user) {
					location.reload();
				} else {
					alert("unbekannter Server-Fehler");
				}
			},
			error : function(e) {
				alert("unbekannter Server-Fehler");
			}
		});
	}
}

function initLoginPageViewHandler() {
	if (localStorage.getItem("animexxUserToken")) {
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/user/tokenToUsername',
			data : JSON.stringify(),
			dataType : 'json',
			headers: {
				'authorization': "Bearer " + localStorage.getItem("animexxUserToken") + ""
			},
			success : function(response) {
				if (response) {
					$('body').addClass('loggedIn').removeClass('loggedOut');
					$('#profiledyntarget').replaceWith(response.username);
				} else {
					$('body').addClass('loggedOut').removeClass('loggedIn');
				}
			},
			error : function(e) {
				alert("Unbekannter Server-Fehler: Wir arbeiten schon daran!");
			}
		});
	} else {
		$('body').addClass('loggedOut').removeClass('loggedIn');
	}
}

exports.stringToHash = stringToHash;
