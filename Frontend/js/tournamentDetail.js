$( document ).ready(function() {
    initTournamentDetail();
	initTournamentPlaner();
	initTournamentPageHandler();
	initTournamentRegister();
	initTournamentDeregister();
});

function initTournamentDetail() {
	$.ajax({
		url: 'http://localhost:8000/api/tournament/gib/' + getUrlParameterValue('id'),
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
		var obj = response.daten;
		var content = obj.title;
		
		$('#tournamentTitle').html(content);

		content = '<img src="' + obj.picture + '" class="img-responsive center-block" alt="' + obj.picture.replace('img/', '').replace('.jpg', '') + '">';
		content += '<div class="textContainer">';
		content += '<div class="h2 container-block">';
		content += obj.title + '<br>';
		content += obj.date;
		content += '</div>';
		content += '</div>';
		
		$('#tournamentImage').replaceWith(content);
		
		content = obj.description;
		
		$('#tournamentText').html(content);
		
	}).fail(function (jqXHR, statusText, error) {
		alert(jqXHR.responseText);
	});
}

function initTournamentPlaner() {
	$teams = [];
	
	$formData = {
		id : getUrlParameterValue('id'),
	}
	
	$.ajax({
		type : 'POST',
		contentType : 'application/json',
		url : 'http://localhost:8000/api/tournament/tournamentPlaner',
		data : JSON.stringify($formData),
		dataType : 'json',
		success : function(tournament) {
			if (tournament.daten) {
				$teams = tournament.daten;
				
				var matchData = {
					teams : $teams,
					results : []
				}

				function onclick(data) {
					$('#matchCallback').text("onclick(data: '" + data + "')")
				}

				function onhover(data, hover) {
					$('#matchCallback').text("onhover(data: '" + data + "', hover: " + hover + ")")
				}

				$(function() {
					$('#tournamentPlaner').bracket({
						init: matchData,
						onMatchClick: onclick,
						onMatchHover: onhover
					})
				})
			} else {
				alert("Konnte Turnierplan nicht laden");
			}
		},
		error : function(e) {
			alert("unbekannter Server-Fehler");
		}
	});
}

function initTournamentPageHandler() {
	/*$.ajax({
		url: 'http://localhost:8000/api/staff/alle',
		method: 'get',
		dataType: 'json'
	}).done(function (response) {
			var content = '';
		}
		$('#dyntarget').replaceWith(content);
		$registered = true;
	}).fail(function (jqXHR, statusText, error) {
		$registered = false;
	});*/
	
	if (false) {
		$('body').addClass('registered').removeClass('notRegistered');
	} else {
		$('body').addClass('notRegistered').removeClass('registered');
	}
	
	/*if ($('body').hasClass('loggedIn')) {
		$formData = {
			userid: 1, //TODO
		}
		
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/tournament/getUser',
			data : JSON.stringify($formData),
			dataType : 'json',
			success : function(user) {
				if (user.daten) {
					$('#registerTournamentNick').val(user.daten.Nickname);
					$('#registerTournamentName').val(user.daten.Name);
				} else {
					alert("unbekannter Server-Fehler");
				}
			},
			error : function(e) {
				alert("unbekannter Server-Fehler");
			}
		});
	}*/
}

function initTournamentRegister() {
	$('#tournamentRegisterButton').click(function(e) {
		e.preventDefault();
		$formData = {
			nickname: $('#registerTournamentNick').val(),
			name: $('#registerTournamentName').val(),
			id : getUrlParameterValue('id'),
			userid: 1, //TODO
		}
		
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : 'http://localhost:8000/api/tournament/register',
			data : JSON.stringify($formData),
			dataType : 'json',
			success : function(tournament) {
				if (tournament.daten) {
					location.reload();
				} else {
					alert("unbekannter Server-Fehler");
				}
			},
			error : function(e) {
				alert("unbekannter Server-Fehler");
			}
		});
	});
}

function initTournamentDeregister() {
	$('#tournamentDeregisterButton').click(function(e) {
		e.preventDefault();
		if ($('#deregisterCheckbox').is(":checked")) {
			$formData = {
				id : getUrlParameterValue('id'),
				userid: 1, //TODO
			}
			
			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : 'http://localhost:8000/api/tournament/deregister',
				data : JSON.stringify($formData),
				dataType : 'json',
				success : function(tournament) {
					if (tournament) {
						location.reload();
					} else {
						alert("unbekannter Server-Fehler");
					}
				},
				error : function(e) {
					alert("unbekannter Server-Fehler");
				}
			});
		} else {
			$('#deregisterCheckboxLabel').addClass('error');
		}
	});
}