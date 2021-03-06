'use strict';
var map;
var marker1;
var marker2;
var flightPath;
var flagLine = false;
var masDOM = [];

function Route(userData) {
    if (userData) { // если указаны данные -- одна ветка if
        var Num = userData.num;
        var Start = userData.start;
        var Finish = userData.finish;
        var serialNumber = 0;
    } else { // если не указаны -- другая
        var Num = "";
        var Start = "";
        var Finish = "";
        var serialNumber = 0;
    }
    
    this.SetNum = function (str) {
        Num = str;
    }

    this.SetStart = function (str) {
        Start = str;
    }

    this.SetFinish = function (str) {
        Finish = str;
    }

    this.SetSN = function (str) {
        serialNumber = str;
    }

    this.GetSN = function () {
        return serialNumber;
    }

    this.GetNum = function () {
        return Num;
    }

    this.GetStart = function () {
        return Start;
    }

    this.GetFinish = function () {
        return Finish;
    }
} //Клас маршруту

function SetRoute(data) {
    Route.count = 0;
    var j = 0;
    var u = 0;

    var num = "";
    var start = "";
    var finish = "";

    var flag_m = false;
    var flag_S = false;
    var flag_F = false;

    for (var i = 0; i < data.length; i++) {

        if (data[i] == '|') {
            flag_m = false;
            flag_S = false;
            flag_F = false;

            j++;
        }

        if (flag_m) {
            num += data[i];
        }

        if (data[i] == '$') {
            flag_m = true;
            flag_F = false;

            if (j != 0) {
                j = 0;

                var ObjectR = new Route();
                ObjectR.SetNum(num);
                ObjectR.SetStart(start);
                ObjectR.SetFinish(finish);
                ObjectR.SetSN(Route.count + 1);

                Route.count++;

                ColDiv(Route.count, ObjectR);

                num = "";
                start = "";
                finish = "";
            }
        }

        if (flag_S) {
            start += data[i];
        }

        if (flag_F) {
            finish += data[i];
        }

        if (j == 1) {
            flag_S = true;
        }

        if (j == 2) {
            flag_F = true;
        }
    }
} //Обробка інформації з сервера

function ColDiv(col, Object) {
    var span = document.createElement('span');
    span.setAttribute('id', 'new' + col);
    span.setAttribute('data-num', Object.GetNum());
    span.setAttribute('data-St1', Object.GetStart());
    span.setAttribute('data-St2', Object.GetFinish());

    span.className = "Way";
    span.innerHTML = " <span style='padding-left:10px;'>" + Object.GetNum() + "</span><span></span><span>, </span>";
    var t = document.getElementById("box_text");
    t.appendChild(span);
    masDOM.push(span);
} //Вивід інформації

function CoAtt() {
    $('#computing').attr("disabled", "disabled");
} //Доки чекаємо відповіді

function Computing(data) {
    var error = "";

    if (data == "Not Train") {
        error += "Не знайдено маршрутів по філії. ";
        $('#St').css("border-color", "#f7b4b4");
    }
    if (data == "Not type") {
        error += "Не знайдено маршрутів по типу. ";
        $('#dat').css("border-color", "#f7b4b4");
    }
    if (data == "false" || data == "") {
        error += "Помилка бази даних. ";
    }

    if (error != "") {
        alert(error);
    } else {
        var t = document.getElementById("box_text");
        t.getAttribute('hidden', 'true');
        SetRoute(data);
    }
    data = "";
    $('#computing').removeAttr("disabled");
} //Відповідь сервера

$('#computing').click(function () {
    var t = document.getElementById("box_text");
    for (var i = 0; i < masDOM.length; i++) {
        t.removeChild(masDOM[i]);
    }
    masDOM = [];
    ClearMarkerAndLine();

    var Fil = $('#Fil').val();

    var v = [];

    var gr = document.getElementsByName('v');
    for (var i = 0; i < gr.length; i++) {
        if (gr[i].checked) {
            v[i] = 1;
        } else {
            v[i] = 0;
        }
    }

    var v1 = v[0];
    var v2 = v[1];
    var v3 = v[2];
    var v4 = v[3];
    var v5 = v[4];

    if (v1 == 0 && v2 == 0 && v3 == 0 && v4 == 0 && v5 == 0) {
        alert("Оберіть тип потягу");
    } else {
        $.ajax({
            url: "php/CheckWay.php",
            type: "POST",
            cache: false,
            data: ({
                'C': "10",
                'Fil': Fil,
                'v1': v1,
                'v2': v2,
                'v3': v3,
                'v4': v4,
                'v5': v5
            }),
            dataType: "html",
            beforeSend: CoAtt,
            success: Computing
        });
    }
}); //Перевірка введеної інформації

//Map function -------------------------

function initialize() {
    var mapOptions = {
        zoom: 6,
        center: new google.maps.LatLng(48.45, 35.02)
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
} //Намалювати мапу

google.maps.event.addDomListener(window, "load", initialize);

function SetMarker(location, title, MarkerCounter) {

    if (MarkerCounter == 1) {
        marker1 = new google.maps.Marker({
            position: location, //new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            title: title
        });
    }

    if (MarkerCounter == 2) {
        marker2 = new google.maps.Marker({
            position: location, //new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            title: title
        });
    }

} //Поставити маркер

function SetLine(flightPlanCoordinates) {
    flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
    flagLine = true;
} //Відмалювати криву 

function ClearMarkerAndLine() {
    if (flagLine) {
        marker1.setMap(null);
        marker2.setMap(null);
        flightPath.setMap(null);
        flagLine = false;
    }
} //Прибрати маркери та криву

$("#box_text").on("click", ".Way", function () {
    var St_1 = $(this).attr("data-st1");
    var St_2 = $(this).attr("data-st2");

    $.ajax({
        url: "php/CheckWay.php",
        type: "POST",
        cache: false,
        data: ({
            'Num': $(this).attr("data-num"),
            'St_1': St_1,
            'St_2': St_2
        }),
        dataType: "html",
        success: NewLine
    });
}); //Обрання маршруту зі списку

function NewLine(data) {
    ClearMarkerAndLine();
    var number = "";
    var flag = false;
    var flag_t1 = false;
    var flag_t2 = false;
    var flag_c1 = false;
    var flag_c2 = false;
    var j, u = 0;
    var t = 0;
    var title1 = "";
    var title2 = "";
    var Loc1 = "";
    var Loc2 = "";
    var Coo1 = "";
    var Coo2 = "";
    var Object;
    var flightPlanCoordinates = [];

    for (var i = 0; i < 10; i++) {

        if (data[i] == '|') {
            flag = false;
            j = i;
            break;
        }

        if (flag) {
            number += data[i];
        }

        if (data[i] == '$') {
            flag = true;
        }


    }

    for (var i = j + 1; i < data.length; i++) {

        if (data[i] == '|' || data[i] == '*') {
            if (data[i] == '*') {
                flag_t1 = false;
                flag_t2 = false;
                t++;
            }
            flag_c1 = true;
            flag_c2 = false;
            i++;
        }

        if (data[i] == '!' || data[i] == '$' || data[i] == '&') {

            flag_c1 = false;
            flag_c2 = false;

            if (data[i] == '&') {
                if (t == 0) {
                    flag_t1 = true;
                    i++;
                } else {
                    flag_t2 = true;
                    i++;
                }
                t++;
            }

            if (t == 2) {
                Loc1 = {
                    lat: +Coo1,
                    lng: +Coo2
                };
                t++;
            }
            if (t == 5) {
                Loc2 = {
                    lat: +Coo1,
                    lng: +Coo2
                };
                t++;
            }

            if (Coo1 != "" && Coo2 != "") {

                if (u == 0) {
                    Object = {
                        lat: +Coo1,
                        lng: +Coo2
                    };
                    flightPlanCoordinates.push(Object);
                } else {
                    Object = {
                        lat: +Coo1,
                        lng: +Coo2
                    };
                    flightPlanCoordinates.push(Object);
                }
                Coo1 = "";
                Coo2 = "";
                u++;
            }
        }

        if (flag_t1) {
            title1 += data[i];
        }

        if (flag_t2) {
            title2 += data[i];
        }

        if (data[i] == ',') {
            flag_c1 = false;
            flag_c2 = true;
            i += 2;
        }

        if (flag_c1) {
            Coo1 += data[i];
        }

        if (flag_c2) {
            Coo2 += data[i];
        }
    }

    SetLine(flightPlanCoordinates);
    SetMarker(Loc1, title1, 1);
    SetMarker(Loc2, title2, 2);
} //Обробка відповіді сервера по координатам

/*function RU_EN(a) {
    var p = "";

    for (var i = 0; i < a.length; i++) {
        if (a[i] == "а") {
            p += "a";
        }
        if (a[i] == "б") {
            p += "b";
        }
        if (a[i] == "в") {
            p += "c";
        }
        if (a[i] == "г") {
            p += "d";
        }
        if (a[i] == "д") {
            p += "e";
        }
        if (a[i] == "е") {
            p += "f";
        }
        if (a[i] == "є") {
            p += "g";
        }
        if (a[i] == "ж") {
            p += "h";
        }
        if (a[i] == "з") {
            p += "i";
        }
        if (a[i] == "и") {
            p += "j";
        }
        if (a[i] == "і") {
            p += "k";
        }
        if (a[i] == "ї") {
            p += "l";
        }
        if (a[i] == "й") {
            p += "m";
        }
        if (a[i] == "к") {
            p += "n";
        }
        if (a[i] == "л") {
            p += "o";
        }
        if (a[i] == "м") {
            p += "p";
        }
        if (a[i] == "н") {
            p += "q";
        }
        if (a[i] == "о") {
            p += "r";
        }
        if (a[i] == "п") {
            p += "s";
        }
        if (a[i] == "р") {
            p += "t";
        }
        if (a[i] == "с") {
            p += "u";
        }
        if (a[i] == "т") {
            p += "v";
        }
        if (a[i] == "у") {
            p += "w";
        }
        if (a[i] == "ф") {
            p += "x";
        }
        if (a[i] == "х") {
            p += "y";
        }
        if (a[i] == "ш") {
            p += "z";
        }
        if (a[i] == "ц") {
            p += "+";
        }
        if (a[i] == "ч") {
            p += "=";
        }
        if (a[i] == "щ") {
            p += "&";
        }
        if (a[i] == "ь") {
            p += "~";
        }
        if (a[i] == "ю") {
            p += "[";
        }
        if (a[i] == "я") {
            p += "]";
        }
        if (a[i] == "А") {
            p += "A";
        }
        if (a[i] == "Б") {
            p += "B";
        }
        if (a[i] == "В") {
            p += "C";
        }
        if (a[i] == "Г") {
            p += "D";
        }
        if (a[i] == "Д") {
            p += "E";
        }
        if (a[i] == "Е") {
            p += "F";
        }
        if (a[i] == "Є") {
            p += "G";
        }
        if (a[i] == "Ж") {
            p += "H";
        }
        if (a[i] == "З") {
            p += "I";
        }
        if (a[i] == "И") {
            p += "J";
        }
        if (a[i] == "І") {
            p += "K";
        }
        if (a[i] == "Ї") {
            p += "L";
        }
        if (a[i] == "Й") {
            p += "M";
        }
        if (a[i] == "К") {
            p += "N";
        }
        if (a[i] == "Л") {
            p += "O";
        }
        if (a[i] == "М") {
            p += "P";
        }
        if (a[i] == "Н") {
            p += "Q";
        }
        if (a[i] == "О") {
            p += "R";
        }
        if (a[i] == "П") {
            p += "S";
        }
        if (a[i] == "Р") {
            p += "T";
        }
        if (a[i] == "С") {
            p += "U";
        }
        if (a[i] == "Т") {
            p += "V";
        }
        if (a[i] == "У") {
            p += "W";
        }
        if (a[i] == "Ф") {
            p += "X";
        }
        if (a[i] == "Х") {
            p += "Y";
        }
        if (a[i] == "Ш") {
            p += "Z";
        }
        if (a[i] == "Ц") {
            p += "!";
        }
        if (a[i] == "Ч") {
            p += "@";
        }
        if (a[i] == "Щ") {
            p += "#";
        }
        if (a[i] == "Ю") {
            p += "$";
        }
        if (a[i] == "Я") {
            p += "%";
        }
        if (a[i] == " ") {
            p += "_";
        }
        if (a[i] == "-") {
            p += "-";
        }
        if (a[i] == "'") {
            p += "''";
        }
        if (a[i] == ".") {
            p += ".";
        }
    }
    return p;
} *///Кодування кирилиці
