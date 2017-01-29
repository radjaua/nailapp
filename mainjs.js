;
function NailAppClass () {
	this.monthNumber = 0;
	this.selectedDate = getCurrentDate ();  // Это просто объект, не Date. Тут месяцы от 1 до 12
	Object.defineProperty (this, "selectedDateText", {
		get: function() {
			return (this.selectedDate.day < 10 ? '0':'') + this.selectedDate.day + '.' + (this.selectedDate.month < 10 ? '0':'') + this.selectedDate.month + '.' + this.selectedDate.year;
		}
	});
};

NailAppClass.prototype.makeCalendar = function (idMonthMessage, idTbody) {
	var serverCurrentDate = getCurrentDate (),
		alreadyDisactivated = false;
	if (serverCurrentDate.nextDayFlag == true) {
		alreadyDisactivated = true;
	};
	var now = new Date (serverCurrentDate.year, serverCurrentDate.month-1, serverCurrentDate.day);
	now.setMonth (now.getMonth () + this.monthNumber, this.monthNumber ? 1 : now.getDate ());
	document.getElementById (idMonthMessage).innerHTML = nameOfMonth (now.getMonth());
	var monthTable = document.getElementById (idTbody),
		horizontalPosition = dayName1Number (now.getMonth (), now.getFullYear ()) - 1,
		verticalPosition = 0,
		currentDayHorizontalPosition,
		currentDayVerticalPosition,
		flagForCurrentDay = false;
	for (var i = 1; i <= daysInMonth (now.getMonth(), now.getFullYear()); i++) {
		monthTable.children[verticalPosition].children[horizontalPosition].innerHTML = i;
		if ((i < now.getDate ()) && (this.monthNumber == 0) || (horizontalPosition == 6)) {  // horizontalPosition - выходной
			monthTable.children[verticalPosition].children[horizontalPosition].style.color = 'silver';
		} else {
			if ((flagForCurrentDay == false) && (this.monthNumber == 0)) {      // выясняем позицию сегодняшнего дня в таблице в ДОМе
				currentDayHorizontalPosition = horizontalPosition;
				currentDayVerticalPosition = verticalPosition;
				flagForCurrentDay = true;
			};
			monthTable.children[verticalPosition].children[horizontalPosition].onclick = function() {      ////// ФУНКЦИЯ КЛИКА
				serverCurrentDate = getCurrentDate ();  // Актуализируем дату при клике
				var selectedDate = {
					day: this.innerHTML,
					month: now.getMonth () + 1,
					year: now.getFullYear (),
					hour: 0,
					minute: 0
				};
				if ((serverCurrentDate.nextDayFlag == true) && (this.monthNumber == 0) && (alreadyDisactivated == false)) {
					var DOMofCurrentDay = document.getElementById ('currentMonthTbodyId').children[currentDayVerticalPosition].children[currentDayHorizontalPosition];
					alreadyDisactivated = true;
					DOMofCurrentDay.style.color = 'silver';
					DOMofCurrentDay.onclick = '';
					DOMofCurrentDay.onmouseover = '';
					DOMofCurrentDay.onmouseout = '';
					DOMofCurrentDay.style.backgroundColor = '';
					if ((selectedDate.day < serverCurrentDate.day) && (this.monthNumber == 0)) {   // Учет выходных дней при переносе на следующий день
						selectedDate.day++;
						if (currentDayHorizontalPosition == 5) {
							selectedDate.day++
						};
					};
				};
				if ((this.innerHTML == serverCurrentDate.day) && (this.monthNumber == 0)) {
					selectedDate.hour = serverCurrentDate.hour;
					selectedDate.minute = serverCurrentDate.minute;
				};
				nailAppObj.selectedDate = selectedDate;
				nailAppObj.fillSelectedDayTable ();     // Метод заполнения таблицы с часами  !!!!!!!!!!!!!!
			};
			monthTable.children[verticalPosition].children[horizontalPosition].onmouseover = function() {
				this.style.backgroundColor = '#f5f5f5';
				this.style.cursor='pointer';
			};
			monthTable.children[verticalPosition].children[horizontalPosition].onmouseout = function() {
				this.style.backgroundColor = '';
			};
		};
		horizontalPosition++;
		if (horizontalPosition > 6) {
			horizontalPosition = 0;
			verticalPosition++;
		};
	};
	//alert (this.monthNumber);
	if (this.monthNumber == 0) {
		this.monthNumber++;
	};
	//alert (this.monthNumber);
};
NailAppClass.prototype.fillSelectedDayTable = function () {
	var selectedDateObj = new Date (this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day, this.selectedDate.hour, this.selectedDate.minute),
		daySchedule = [];
	$.ajax({
				async: false,
				type: "POST",
				url: "freedays.php",
				data: {
					'day': selectedDateObj.getDate (),
					'month': selectedDateObj.getMonth () + 1,
					'year': selectedDateObj.getFullYear ()
				},
				success: function (freeJson) {
					daySchedule = JSON.parse (freeJson);
				}
			});
	document.getElementById ('selectedDayTableMessage').innerHTML = this.selectedDateText;
	var selectedDayTable = document.getElementById ('selectedDayTable'),
		verticalPosition = 0,
		horizontalPosition = 0,
		j,
		makeLinkFlag = true,
		recordsQuantity = daySchedule['timefrom'].length,
		timeToDate = new Date (this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day),
		timeFromDate = new Date (this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day),
		timeCounter = new Date (this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day, 8, 0);   // Эта переменная выступает переменной цикла. Отсчет времени дня указывается тут (8, 0). Надо переделать на то, что б эти данные брались из БД
	for (var i = 1; i <= 24; i++) {          // И количество ячеек тоже должно братся из БД
		selectedDayTable.children[verticalPosition].children[horizontalPosition].innerHTML = (timeCounter.getHours () < 10 ? '0':'') + timeCounter.getHours () + ':' + (timeCounter.getMinutes () < 10 ? '0':'') + timeCounter.getMinutes ();
		if ((timeCounter.valueOf() < selectedDateObj.valueOf()) && (getCurrentDate ().day == this.selectedDate.day)) {   // valueOf для даты - количество мс, прошедших с 1.1.1970
			selectedDayTable.children[verticalPosition].children[horizontalPosition].style.color = 'silver';
		} else {
			makeLinkFlag = true;
			j = 0;
			while ((j <= recordsQuantity - 1) && (makeLinkFlag == true)) {
				timeFromDate.setHours (daySchedule['timefrom'][j][0] + daySchedule['timefrom'][j][1], daySchedule['timefrom'][j][3] + daySchedule['timefrom'][j][4]);
				timeToDate.setHours (daySchedule['timeto'][j][0] + daySchedule['timeto'][j][1], daySchedule['timeto'][j][3] + daySchedule['timeto'][j][4]);
				if ((timeCounter >= timeFromDate) && (timeCounter < timeToDate)) {
					selectedDayTable.children[verticalPosition].children[horizontalPosition].style.color = 'red';
					selectedDayTable.children[verticalPosition].children[horizontalPosition].onclick = '';
					selectedDayTable.children[verticalPosition].children[horizontalPosition].onmouseover = '';
					selectedDayTable.children[verticalPosition].children[horizontalPosition].onmouseout = '';
					selectedDayTable.children[verticalPosition].children[horizontalPosition].style.cursor = '';
					selectedDayTable.children[verticalPosition].children[horizontalPosition].backgroundColor = '';
					makeLinkFlag = false;
				};
				j++;
			};
			if (makeLinkFlag == true) {
				selectedDayTable.children[verticalPosition].children[horizontalPosition].style.color = 'black';
				selectedDayTable.children[verticalPosition].children[horizontalPosition].onmouseover = function () {
					this.style.backgroundColor = '#f5f5f5';
					this.style.cursor='pointer';
				};
				selectedDayTable.children[verticalPosition].children[horizontalPosition].onmouseout = function () {
					this.style.backgroundColor = '';
				};
				selectedDayTable.children[verticalPosition].children[horizontalPosition].onclick = function () {
					if (authorization.cookieRequest() == false) {
						var errorMessage = new Message ('Записыватся можно только после авторизации!');
						errorMessage.show ();
						setTimeout (function () {
							errorMessage.hide ();
						}, 1500);
					} else {
						nailAppObj.fillTimePrice (this.innerHTML);
						$('#dimming').fadeIn('fast');
						$('#recordForm').fadeIn('fast');
					};
				};
			};
		};
		timeCounter.setMinutes (timeCounter.getMinutes() + 30);
		horizontalPosition++;
		if (horizontalPosition > 5) {
			horizontalPosition = 0;
			verticalPosition++;
		};
	};
};
NailAppClass.prototype.fillTimePrice = function (selectedTime) {
	if (selectedTime == undefined) {										//
		selectedTime = document.getElementById ('timeFrom').innerHTML;		//  Этот if надо заменить на использование selectedTime как переменной класса
	};																		//
	var time, price,
		selectedOption = document.forms.workTypeForm.elements.workType.value;
	switch (selectedOption) {
		case '1':
			time = 1.5;
			price = 150;
			break;
		case '2':
			time = 2.5;
			price = 250;
			break;
		case '3':
			time = 2.5;
			price = 300;
			break;
		case '4':
			time = 2.5;
			price = 350;
			break;
	};
	if (document.forms.workTypeForm.elements.manikyurCheckbox.checked) {
		time += 0.5;
		price += 50;		
	};
	document.getElementById ('duration').innerHTML = time;			//
	document.getElementById ('price').innerHTML = price;			//   Тут надо проверить на тему выноса переменных в общую видимость
	document.getElementById ('timeFrom').innerHTML = selectedTime;	//
	timeTo = new Date (this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day, selectedTime.substr (0, 2), selectedTime.substr (3, 2)); // В старой версии месяц был без -1. Так же надо разобратся зачем тут полная дата
	timeTo.setMilliseconds (time * 60 * 60 * 1000);
	document.getElementById ('timeTo').innerHTML = (timeTo.getHours() < 10 ? '0':'') + timeTo.getHours () + ':' + (timeTo.getMinutes () < 10 ? '0':'') + timeTo.getMinutes ();
	document.getElementById ('recordFormButton').onclick = function () {
		nailAppObj.makeRecord ();
	};	
};

NailAppClass.prototype.makeRecord = function () {
	var res;
	$.ajax ({
		async: false,
		type: "POST",
		url: "makerecord.php",
		data: {
			"cookiesToken": authorization.token,
			"workType": document.forms.workTypeForm.elements.workType.value,
			"date": this.selectedDateText,
			"manicyur": document.forms.workTypeForm.elements.manikyurCheckbox.checked, // true/false
			"timeFrom": document.getElementById ('timeFrom').innerHTML,    // надо переделать на общую видимость
			"timeTo": document.getElementById ('timeTo').innerHTML   // а тут вместо считывания из поля должна быть математика, вынесенная в отдельный метод
		},
		success: function (resJson) {
			res = resJson;//JSON.parse (resJson);
		}
	});
	document.getElementById ('tratata').innerHTML = res;  //   Сделать проверку на возврат правильности из бэкенда и УБРАТЬ!!!! Так же нужно добавить варианты с ошибками например на предмет занятости
	nailAppObj.fillSelectedDayTable ();
	var successMessage = new Message ('Вы успешно записались');
	successMessage.show ();
	$('#recordForm').fadeOut ('fast');
	setTimeout (function () {
		successMessage.hide ();
	}, 2000);			
};

var nailAppObj = new NailAppClass ();

function displayRegistration () {
	$('#dimming').fadeIn ('fast');
	$('#registrationForm').fadeIn ('fast');
};

function nameOfMonth (num) {
	switch (num) {
		case 0: 
			return 'Январь';
			break;
		case 1:
			return 'Февраль';
			break;
		case 2:
			return 'Март';
			break;
		case 3:
			return 'Апрель';
			break;
		case 4:
			return 'Май';
			break;
		case 5:
			return 'Июнь';
			break;
		case 6:
			return 'Июль';
			break;
		case 7:
			return 'Август';
			break;
		case 8:
			return 'Сентябрь';
			break;
		case 9:
			return 'Октябрь';
			break;
		case 10:
			return 'Ноябрь';
			break;
		case 11:
			return 'Декабрь';
			break;
	};
};
function daysInMonth (month, year) {
	switch (month) {
		case 0:
		case 2:
		case 4:
		case 6:
		case 7:
		case 9:
		case 11:
			return 31;
			break;
		case 3:
		case 5:
		case 8:
		case 10:
			return 30;
			break;
		case 1:
			if (year % 4 == 0) { return 29 } else { return 28 };
			break;
	};
};
function dayName1Number (month, year) {
	var day = new Date (year, month, 1);
	var temp = day.getDay();
	if (temp === 0) { temp = 7; }; // 1 - пд, 7 - вс
	return temp;
};
function getCurrentDate () {
	var serverCurrentDate = {};
	$.ajax({
		async: false,
		type: "POST",
		url: "currenttime.php",
		success: function (serverCurrentDateJson) {
			serverCurrentDate = JSON.parse (serverCurrentDateJson);
		}
	});
	if (((serverCurrentDate.hour >= 19) && (serverCurrentDate.minute >= 30)) || (serverCurrentDate.hour >= 20)) {
		serverCurrentDate.day++; // Здесь нужно сделать проверку на выходной день и если он положительно, то добавлять через while
		serverCurrentDate.hour = 0;
		serverCurrentDate.nextDayFlag = true;
	};
	return serverCurrentDate;
};
function ShowErrorMessage() {
	this.message = [];
};
ShowErrorMessage.prototype.show = function (coords, txt, id, th) {
	var message = this.message;
	if ((message[id] == undefined) || (message[id].flag == false)) {
		message[id] = document.createElement ('div');
		message[id].style.cssText = "position: fixed; color: red; border-radius: 7px; text-align: center; font-weight: bold; padding: 4px; ";
		message[id].style.width = 170 + 'px';
		message[id].style.backgroundColor = '#fbfbfb';
		message[id].style.left = coords.right + 12 + 'px';
		message[id].style.top = coords.top + 1 + 'px';
		message[id].id = "errorMessage"+id;
		message[id].flag = true;
		message[id].innerHTML = txt;
		/*message[id].onclick = function () {
			this.parentNode.removeChild (this);
		};*/
		document.getElementById (th).appendChild (message[id]);
		//alert (this.id);
	};	
};
ShowErrorMessage.prototype.hide = function (id) {
	if ((this.message[id] != undefined) && (this.message[id].flag == true)) {
		document.getElementById ('errorMessage'+id).parentNode.removeChild (document.getElementById ('errorMessage'+id));
		this.message[id].flag = false;
	};
};
var showErrorMessageObj = new ShowErrorMessage ();
function Authorization () {
	this.name = '';
	this.token = '';
	this.schedule = '';
};
Authorization.prototype.showEnterForm = function () {
	document.getElementById ('authorization').innerHTML = '' +
		'<form name="authorizationForm">\n' +
		'<strong>Вход</strong><br />\n' +
		'<input type="email" name="email" class="form-control" placeholder="E-mail" oninput="showErrorMessageObj.hide (5); " required />\n' +
		'<input type="password" name="pass" class="form-control" placeholder="Пароль" oninput="showErrorMessageObj.hide (6); " required />\n' +
		'<button class="btn btn-primary btn-block" type="submit" onclick="authorization.signIn (); return false; ">Войти</button>\n' +
		'<a href="#" title="Регистрация" onclick="displayRegistration (); ">Регистрация</a>\n' +
		'</form>';
};
Authorization.prototype.cookieRequest = function () {     //  Тут добыть ближайшую запись
	this.token = $.cookie ('token');
	var res;
	if (this.token != undefined) {
		$.ajax({
			async: false,
			type: "POST",
			url: "tokenverify.php",
			data: {
				'cookiesToken': this.token
			},
			success: function (resJson) {
				res = JSON.parse (resJson);
				//res = resJson;
			}
		});
		this.schedule = res['schedule'];
		if (res['access'] == 1) {
			this.name = res['name'];
			return true;
		} else return false;
	} else return false;
};
Authorization.prototype.showGreeting = function () {
	var recordsTable;
	if (this.schedule['date'] == '') {
		recordsTable = 'У Вас нет записей!';
	} else {
		recordsTable = 'Ближайшие записи:' +
			'<table class="table">\n' +
				'<thead>\n' +
					'<tr>\n' +
						'<td>Дата</td><td>Время</td><td>Работа</td>\n' +
					'</tr>\n' +
				'</thead>\n' +
				'<tbody>\n';
		for (var i = 0; i < this.schedule['date'].length; i++) {
			// Тут <tr> и с открытием и с закрытием!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			recordsTable += '' +
			'<tr>' +
			'<td>'+this.schedule['date'][i]+'</td><td>'+this.schedule['timefrom'][i]+'</td><td>'+this.schedule['worktype'][i]+'</td>' +
			'</tr>';
		};
		recordsTable += '' +
				'</tbody>\n' +
			'</table>';
	};
	document.getElementById ('authorization').innerHTML = 'Привет ' + this.name + '!<br />' + recordsTable;
};
Authorization.prototype.signIn = function () {
	var errorFlag = false,
		res;
	if ((document.forms.authorizationForm.elements.email.value == '') || (document.forms.authorizationForm.elements.email.value.indexOf ('@') == -1)) {
		showErrorMessageObj.show (document.forms.authorizationForm.elements.email.getBoundingClientRect(), 'Введите e-mail!', 5, 'authorization');
		errorFlag = true;
	};
	if (document.forms.authorizationForm.elements.pass.value == '') {
		showErrorMessageObj.show (document.forms.authorizationForm.elements.pass.getBoundingClientRect(), 'Введите пароль!', 6, 'authorization');
		errorFlag = true;
	};
	var res = [];
	if (errorFlag == false) {
		$.ajax ({
			async: false,
			type: "POST",
			url: "signin.php",
			data: {
				'email': document.forms.authorizationForm.elements.email.value,
				'pass': document.forms.authorizationForm.elements.pass.value
			},
			success: function (resJson) {
				res = JSON.parse(resJson);
			}
		});
		if (res.access == 0) {
			showErrorMessageObj.show (document.forms.authorizationForm.elements.pass.getBoundingClientRect(), 'Неправильный пароль!', 6, 'authorization');
			errorFlag = true;
		} else {
			var successMessage = new Message ('Вы успешно авторизовались!');
			successMessage.show ();
			setTimeout (function () {
				successMessage.hide ();
				authorization.cookieRequest ();
				document.forms.authorizationForm.reset ();
				authorization.showGreeting ();
			}, 2000);
		};	
	};
};
var authorization = new Authorization ();

function Message (messageText) {
	this.messageText = messageText;
};
Message.prototype.show = function () {
	var message = document.createElement ('div');
	message.style.cssText = 'position: absolute; display: none; top: 50%; left: 50%; padding: 10px; border-radius: 7px; background-color: #fff; width: 250px; margin: -50px 0 0 -75px; z-index: 10; color: red; ';
	message.id = 'message';
	message.innerHTML = this.messageText;
	document.body.appendChild (message);
	$('#dimming').fadeIn ('fast');
	$('#message').fadeIn ('fast');
};
Message.prototype.hide = function () {
	$('#dimming').fadeOut ('fast');
	$('#message').fadeOut ('fast');
	document.getElementById ('message').parentNode.removeChild (document.getElementById ('message'));
};

function register () {
	var errorFlag = false,
		regFormElem = document.forms.regForm.elements;
	if (regFormElem.pass1.value != regFormElem.pass2.value) {
		showErrorMessageObj.show (regFormElem.pass2.getBoundingClientRect (), 'Пароли не совпадают!', 4, 'registrationForm');
		errorFlag = true;
	};
	if (regFormElem.pass1.value == '') {
		showErrorMessageObj.show (regFormElem.pass1.getBoundingClientRect (), 'Задайте пароль!', 3, 'registrationForm');
		errorFlag = true;
	};
	if ((regFormElem.email.value == '') || (regFormElem.email.value.indexOf ('@') == -1 )) {
		showErrorMessageObj.show (regFormElem.email.getBoundingClientRect (), 'Введите e-mail!', 2, 'registrationForm');
		errorFlag = true;
	};
	if (regFormElem.userName.value == '') {
		showErrorMessageObj.show (regFormElem.userName.getBoundingClientRect (), 'Введите имя!', 1, 'registrationForm');
		errorFlag = true;
	};
	if (regFormElem.phone.value == '') {
		showErrorMessageObj.show (regFormElem.userName.getBoundingClientRect (), 'Введите номер телефона', 7, 'registrationForm');
		errorFlag = true;
	};
	var errorNum;
	if (errorFlag == false) {
		$.ajax({
			async: false,
			type: "POST",
			url: "register.php",
			data: {
				'username': regFormElem.userName.value,
				'email': regFormElem.email.value,
				'phone': regFormElem.phone.value,
				'pass': regFormElem.pass1.value
			},
			success: function (err) {
				errorNum = err;
			}
		});
		if (errorNum == 'email') {
			showErrorMessageObj.show (regFormElem.email.getBoundingClientRect (), 'Такой e-mail занят', 2, 'registrationForm');
			errorFlag = true;
		} else {
			var successRegistrationMessage = document.createElement ('div');
			successRegistrationMessage.style.cssText = 'position: absolute; display: none; top: 50%; left: 50%; padding: 10px; border-radius: 7px; background-color: #fff; width: 250px; margin: -50px 0 0 -75px; z-index: 10; color: red; ';
			successRegistrationMessage.id = 'successRegistrationMessage';
			successRegistrationMessage.innerHTML = 'Вы успешно зарегистрировались!';
			document.body.appendChild (successRegistrationMessage);
			$('#successRegistrationMessage').fadeIn('fast');
			$('#registrationForm').fadeOut('fast');
			document.forms.regForm.reset ();
			setTimeout (function () {
				$('#successRegistrationMessage').fadeOut('fast');
				$('#dimming').fadeOut('fast');
				document.getElementById ('successRegistrationMessage').parentNode.removeChild (document.getElementById ('successRegistrationMessage'));
				authorization.cookieRequest ();
				authorization.showGreeting ();
			}, 2000);
		};
	};	
};

function closeForms () {
	$('#dimming').fadeOut('fast');
	$('#recordForm').fadeOut('fast');
	$('#registrationForm').fadeOut('fast');
};

function start() {
	nailAppObj.makeCalendar ('currentMonthMessage', 'currentMonthTbodyId');
	nailAppObj.makeCalendar ('nextMonthMessage', 'nextMonthTbodyId');
	nailAppObj.fillSelectedDayTable ();
	setInterval (function () {
		nailAppObj.fillSelectedDayTable ();
	}, 60000);
	$(document).keyup(function (e) {
		if (e.keyCode == 27) {
			closeForms ();
		};
	});
	authorization.cookieRequest () ? authorization.showGreeting () : authorization.showEnterForm ();
	setInterval (function() {
		authorization.cookieRequest () ? authorization.showGreeting () : authorization.showEnterForm ();
	}, 900000);
};