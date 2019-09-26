
//Chart defaults
Chart.defaults.global.defaultFontColor = 'rgba(255,255,255, .9)';
var triggerhappy=false;
var carefulshooter=false;
var quality = 0;
var hp = 0;
var touch = 0.75;
var short = 0.96;
var medium = 0.96;
var long = 0.90;
var maxrange = 20;
var selectedWeapon = "";
var damage = 0;
var shottime = 1;
var shootingskill = 6;
var sight = 100;
var Manipulation = 100;
var Consciousness = 100;
var PostCurve = 0.5;
var cooltime=0;
var warmtime=0;
var bursttime=0;
var xmlDoc;
loadXMLDoc();
function MainCalc() {
    triggerhappy = document.getElementById("trigger_id").checked;
    carefulshooter = document.getElementById("carefulshooter_id").checked;
    hp = Number(document.getElementById("hp_slider").value);
    document.getElementById("HPtext").innerHTML = "HP: " + hp + "% (" + (HP() * 100).toFixed(0) + "%)";;
    quality = Number(document.getElementById("quality_slider").value);
    shootingskill = Number(document.getElementById("slider_shooting").value);
    document.getElementById("id_shootingskill").innerHTML = shootingskill + " (" + ShootingStatLookupTable(shootingskill) * 100 + "%)";
    sight = Number(document.getElementById("slider_sight").value);
    document.getElementById("id_sight").innerHTML = sight + "%";
    Manipulation = Number(document.getElementById("slider_manipulation").value);
    document.getElementById("id_manipulation").innerHTML = Manipulation + "%";
    Consciousness = Number(document.getElementById("slider_consciousness").value);
    document.getElementById("id_consciousness").innerHTML = Consciousness + "%";
    CharacterShootingAccuracyF();
    hp = Number(document.getElementById("hp_slider").value);
    document.getElementById("HPtext").innerHTML = "HP: " + hp + "% (Accuracy Multiplier: " + (HP() * 100).toFixed(0) + "%)";;
    quality = Number(document.getElementById("quality_slider").value);
    var q = QualityName(quality);
    document.getElementById("id_touch").innerHTML = ((touch * Quality() * HP() * 100).toFixed(1) + "%");
    document.getElementById("id_short").innerHTML = ((short * Quality() * HP() * 100).toFixed(1) + "%");
    document.getElementById("id_medium").innerHTML = ((medium * Quality() * HP() * 100).toFixed(1) + "%");
    document.getElementById("id_long").innerHTML = ((long * Quality() * HP() * 100).toFixed(1) + "%");
    document.getElementById("QualityText").innerHTML = q + " Quality (Accuracy Multiplier: " + (Quality() * 100).toFixed(0) + "%)";
    var newwarm=warmtime;
    if(triggerhappy){
        newwarm*=0.5;
    }
    if(carefulshooter){
        newwarm*=1.25;
    }
    document.getElementById("Cooldown").innerHTML = (cooltime + " Seconds");
    document.getElementById("WarmUp").innerHTML = (newwarm.toFixed(2) + " Seconds");
    shottime = Number(cooltime) + Number(newwarm)+bursttime;
    document.getElementById("totaltime").innerHTML = shottime.toFixed(2) + " Seconds";
    document.getElementById("MaxDPS").innerHTML = (damage / shottime).toFixed(2);
    
    DrawAccuracyChart();
    DrawDamageChart();
}

function GetCharacterAccuracy(range) {
    var acc = 1;
    acc = Math.pow(PostCurve, range) * sight / 100;
    acc = Math.max(0.02, Math.min(acc, 1));
    return acc;
}

function CharacterShootingAccuracyF() {
    var precurve = ShootingStatLookupTable(shootingskill);
    precurve *= 1 - .95 * (1 - (sight / 100));
    precurve *= 1 - .5 * (1 - (Manipulation / 100));
    precurve *= 1 - 1 * (1 - (Consciousness / 100));
    if(carefulshooter){precurve*=1.5;}
    if(triggerhappy){
        precurve*=0.5;
    }
    var postcurve = 0;

    if (precurve < 0.2) {
        postcurve = CurveLerp(precurve, 0, 0.2, 0, 0.7);
    }

    if (precurve >= 0.2 && precurve < 0.5) {
        postcurve = CurveLerp(precurve, 0.2, 0.5, 0.7, 0.86);
    }

    if (precurve >= 0.5 && precurve < 0.8) {
        postcurve = CurveLerp(precurve, 0.5, 0.8, 0.86, 0.93);
    }

    if (precurve >= 0.8 && precurve < 0.96) {
        postcurve = CurveLerp(precurve, 0.8, 0.96, 0.93, 0.96);
    }

    if (precurve >= 0.96 && precurve < 1.0) {
        postcurve = CurveLerp(precurve, 0.96, 1.0, 0.96, 0.98);
    }

    if (precurve >= 1.0 && precurve < 1.1) {
        postcurve = CurveLerp(precurve, 1.0, 1.1, 0.98, 0.985);
    }

    if (precurve >= 1.1 && precurve < 1.3) {
        postcurve = CurveLerp(precurve, 1.1, 1.3, 0.985, 0.99);
    }

    if (precurve >= 1.3 && precurve < 1.8) {
        postcurve = CurveLerp(precurve, 1.3, 1.8, 0.99, 0.995);
    }

    if (precurve >= 1.8 && precurve < 10) {
        postcurve = CurveLerp(precurve, 1.8, 10, 0.995, 1.0);
    }
    PostCurve = postcurve;
    document.getElementById("id_charactershootingaccuracy").innerHTML = "Pre-Curve:" + (100 * precurve).toFixed(0) + "%  ➔  Post-Curve: " + (100 * postcurve).toFixed(1) + "%";
    // (0,0), (0.2,0.7), (0.5,0.86), (0.8,0.93), (0.96,0.96), (1.0,0.98), (1.1,0.985), (1.3,0.99), (1.8,0.995), (10,1)
}
function ShootingStatLookupTable(num) {
    var arr = [0.50, 0.70, 0.80, 0.90, 0.93, 0.95, 0.96, 0.965, 0.97, 0.975, 0.98, 0.985, 0.9875, 0.99, 0.991, 0.992, 0.993, 0.994, 0.995, 0.996, 0.997];
    return arr[num];
}

function CurveLerp(pre, startpoint, endpoint, startvalue, endvalue) {
    return startvalue + (endvalue - startvalue) * (pre - startpoint) / (endpoint - startpoint);
}

function QualityName(quality) {
    q = "";
    switch (quality) {
        case 0:
            q = "Awful";
            break;
        case 0:
            q = "Awful";
            break;
        case 1:
            q = "Shoddy";
            break;
        case 2:
            q = "Poor";
            break;
        case 3:
            q = "Normal";
            break;
        case 4:
            q = "Good";
            break;
        case 5:
            q = "Superior";
            break;
        case 6:
            q = "Excellent";
            break;
        case 7:
            q = "Masterwork";
            break;
        case 8:
            q = "Legendary";
            break;
        default:
            q = "other";
            break;
    }
    return q;
}

function GetAccuracyForRange(range) {
    var acc = 0;
    const t = 4;
    const s = 15;
    const m = 30;
    const l = 50;
    if (range >= 0 && range < t) {
        acc = touch;
    }
    if (range >= t && range < s) {
        acc = RangeLerp(touch, short, range, t, s);
    }
    if (range >= s && range < m) {
        acc = RangeLerp(short, medium, range, s, m);
    }
    if (range >= m && range < l) {
        acc = RangeLerp(medium, long, range, m, l);
    }
    if (range > maxrange) {
        acc = 0;
        extratext = "Out of Range";
    }
    acc *= Quality() * HP();
    acc = Math.max(0, Math.min(acc, 1));
    return acc;
}
function HP() {
    return 1 - (1 - hp / 100) * .4;
}
function Quality() {
    var q = 1;
    switch (quality) {
        case 0:
            q = 70;
            break;
        case 1:
            q = 80;
            break;
        case 2:
            q = 93;
            break;
        case 3:
            q = 100;
            break;
        case 4:
            q = 105;
            break;
        case 5:
            q = 110;
            break;
        case 6:
            q = 120;
            break;
        case 7:
            q = 135;
            break;
        case 8:
            q = 150;
            break;
    }
    return (q / 100);
}
function RangeLerp(short_acc, long_acc, range, short_dist, long_dist) {
    var t = (range - short_dist) / (long_dist - short_dist);
    return short_acc * (1 - t) + long_acc * t;
}
function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            GetGunInfo(this);
        }
    };
    xmlhttp.open("GET", "Weapons_Guns.xml", true);
    xmlhttp.send();
}
function GetGunInfo(xml) {
    var x, i
    xlmstore = xml;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("ThingDef");
    for (i = 0; i < x.length; i++) {
        var y = x[i].getAttribute("ParentName");
        if (y == "BaseHumanMakeableGun" || y == "BaseGun" || y == "BaseWeaponNeolithic") {
            var label = x[i].getElementsByTagName("label")[0];
            NewOption("gunchooser", label.firstChild.nodeValue);
        }
    }
    function NewOption(selectID, text) {
        var x = document.createElement("OPTION");
        x.setAttribute("value", text);

        var t = document.createTextNode(toTitleCase(text));
        x.appendChild(t);
        document.getElementById(selectID).appendChild(x);
    }
    SelectGun()
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1) });
}

function SelectGun() {
    var value =document.getElementById("gunchooser").value;
    var Imagestring = toTitleCase(value);
    selectedWeapon = Imagestring;
    document.getElementById("WeaponSelectText").innerHTML = "Selected Weapon Type: " + Imagestring;
    Imagestring = Imagestring.replace(/ /g, '')
    document.getElementById("image2").src = "RimWorldGuns/" + Imagestring + ".png";
    document.getElementById("image2").alt = Imagestring;
    var x = xmlDoc.getElementsByTagName("label");
    var bulletname = "";
    var burstcount = 1;
    var ticksBetweenBurstShots=0;
    for (i = 0; i < x.length; i++) {
        if (x[i].firstChild.nodeValue == value) {
            var parent_1 = x[i].parentElement;
            document.getElementById("weaponDescription").innerHTML = parent_1.getElementsByTagName("description")[0].firstChild.nodeValue;

            touch = parent_1.getElementsByTagName("AccuracyTouch")[0].firstChild.nodeValue;
            short = parent_1.getElementsByTagName("AccuracyShort")[0].firstChild.nodeValue;
            medium = parent_1.getElementsByTagName("AccuracyMedium")[0].firstChild.nodeValue;
            long = parent_1.getElementsByTagName("AccuracyLong")[0].firstChild.nodeValue;
            maxrange = parent_1.getElementsByTagName("range")[0].firstChild.nodeValue;
            document.getElementById("id_range").innerHTML = (maxrange + " Tiles");
            bulletname = parent_1.getElementsByTagName("projectileDef")[0].firstChild.nodeValue;
            if (parent_1.getElementsByTagName("burstShotCount").length > 0) {
                burstcount = parent_1.getElementsByTagName("burstShotCount")[0].firstChild.nodeValue;
            }
            if (parent_1.getElementsByTagName("forcedMissRadius").length > 0) {
                var forcedMissRadius = parent_1.getElementsByTagName("forcedMissRadius")[0].firstChild.nodeValue;
                document.getElementById("id_forcemiss").innerHTML=forcedMissRadius;
                document.getElementById("id_forcemiss").setAttribute("style",'color:red');
            }
            else{
                document.getElementById("id_forcemiss").innerHTML=0;
                document.getElementById("id_forcemiss").setAttribute("style",'color:#cccccc');
            }
            
            if (parent_1.getElementsByTagName("ticksBetweenBurstShots").length > 0) {
                ticksBetweenBurstShots = parent_1.getElementsByTagName("ticksBetweenBurstShots")[0].firstChild.nodeValue;
            }
            else{
                ticksBetweenBurstShots=0;
            }
            cooltime = parent_1.getElementsByTagName("RangedWeapon_Cooldown")[0].firstChild.nodeValue;
            warmtime = parent_1.getElementsByTagName("warmupTicks")[0].firstChild.nodeValue/60;
        }
    }

    var y = xmlDoc.getElementsByTagName("defName");
    for (i = 0; i < y.length; i++) {
        if (y[i].firstChild.nodeValue == bulletname) {
            var parent_1 = y[i].parentElement;
            var damagetemp = parent_1.getElementsByTagName("damageAmountBase")[0].firstChild.nodeValue;
            damage = damagetemp * burstcount;
        }
    }
    document.getElementById("burstdamage").innerHTML = damage + " ( " + burstcount + " * " + damage / burstcount + " )";
    bursttime=(burstcount-1)*ticksBetweenBurstShots/60;
    document.getElementById("BurstTime").innerHTML=(bursttime).toFixed(2) +" Seconds";
    MainCalc();
}
function getTotalAccuracyForRange(range) {
    return GetAccuracyForRange(range) * GetCharacterAccuracy(range);
}
function setAccuracyData() {
    var data1 = [];
    for (i = 0; i < 50; i++) {
        var Acc_ = (100 * GetAccuracyForRange(i));
        data1.push({ x: i, y: Acc_.toFixed(3) });
    }
    return data1;
}

function GetTotalAccuracy() {
    var data1 = [];
    for (i = 0; i < 50; i++) {
        var Acc_ = (100 * getTotalAccuracyForRange(i));
        data1.push({ x: i, y: Acc_.toFixed(3) });
    }
    return data1;
}
var acc_chart;
var dam_chart;
function DrawAccuracyChart() {
    var scatterChartData;
    var ctx = document.getElementById("myChartAccuracy").getContext("2d");
    ctx.canvas.width = window.innerWidth * .8 * .4;
    ctx.canvas.height = window.innerHeight * .3;

    if (acc_chart) { acc_chart.destroy(); }
    acc_chart = new Chart.Scatter(ctx, {
        data: {
            datasets: [
            {
                tension: 0,
                borderColor:"rgba(0,0,150,.9)",
                pointBackgroundColor:"rgba(0,0,150,.9)",
                    
                backgroundColor: "rgba(0,0,0,0)",
                label: "Total Accuracy",
                data: GetTotalAccuracy(),
            },
                {
                    tension: 0,
                    
                    borderColor: "rgba(128, 0, 0,0.9)",
                    pointBackgroundColor:"rgba(128, 0, 0,0.9)",
                        
                    
                    backgroundColor: "rgba(0,0,0,0)",
                    label: ("Weapon Accuracy: " + QualityName(quality) + " " + selectedWeapon + " (" + hp + "%)"),
                    data: setAccuracyData(),
                },
            {
                tension: 0,
                borderColor: "rgba(0, 153, 0,0.9)",
                pointBackgroundColor: "rgba(0, 153, 0,0.9)",    
                    
                backgroundColor: "rgba(0,0,0,0)",
                label: "Character Accuracy",
                data: getCharacterData(),
            }
            ]
        },
        options: {
            animation : false,
            legend:
            {
                labels:{
                usePointStyle:true,
                padding:15,
                boxWidth:12,
                fontSize:10
                }
            },
            title: {
                display: true,
                text: 'Accuracy',
            },
            scales: {
                xAxes: [{
                    position: 'bottom',
                    gridLines: {
                        color:'rgba(128,255,128, .2)',
                        zeroLineWidth:4,
                    },
                    
                    
                    ticks: {
                        min: 0,
                        max: 50,
                        stepsize: 5,
                    },
                    
                    scaleLabel: {
                    display: true,
                    labelString: "Range (tiles)"
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color:'rgba(128,255,128, .2)',
                        zeroLineWidth:4,
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        stepsize: 10,
                    },
                    scaleLabel: {
                        display: true,

                        labelString: 'Accuracy %'
                    }
                }]
            }
        }
    });
}

function mix(a, b, v)
{
return (1-v)*a + v*b;
}

function HSVtoRGB(H, S, V)
{
var V2 = V * (1 - S);
var r  = ((H>=0 && H<=60) || (H>=300 && H<=360)) ? V : ((H>=120 && H<=240) ? V2 : ((H>=60 && H<=120) ? mix(V,V2,(H-60)/60) : ((H>=240 && H<=300) ? mix(V2,V,(H-240)/60) : 0)));
var g  = (H>=60 && H<=180) ? V : ((H>=240 && H<=360) ? V2 : ((H>=0 && H<=60) ? mix(V2,V,H/60) : ((H>=180 && H<=240) ? mix(V,V2,(H-180)/60) : 0)));
var b  = (H>=0 && H<=120) ? V2 : ((H>=180 && H<=300) ? V : ((H>=120 && H<=180) ? mix(V2,V,(H-120)/60) : ((H>=300 && H<=360) ? mix(V,V2,(H-300)/60) : 0)));

return {
r : Math.round(r * 255),
g : Math.round(g * 255),
b : Math.round(b * 255)
};
}
var hue=174;
function RandomColor(){
    var rgb=HSVtoRGB(hue,0.7,0.75);
    hue+=86;
    if(hue>360){
        hue-=360;
    }
    return "rgba("+rgb.r+","+rgb.g +","+rgb.b+","+.8+")";
    // return "rgba("+ Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255) +","+Math.floor(Math.random() * 255) +","+.8+")";
}

function getCharacterData() {
    var data1 = [];
    for (i = 0; i < 50; i++) {
        var Acc_ = (100 * GetCharacterAccuracy(i));
        data1.push({ x: i, y: Acc_.toFixed(3) });
    }
    return data1;
}

function SetDamageData() {
    var data1 = [];
    for (i = 0; i <50; i++) {
        var damage2 = (getTotalAccuracyForRange(i)) * damage / shottime;
        data1.push({ x: i, y: damage2.toFixed(3) });
    }
    return data1;
}
var DamageDataArray=[];
var tempDamageData;

function DamageData(){
    var TempArray=[];
    var x={ tension: 0,
            radius:2,
            borderWidth:5,
            borderColor:"rgba(255,255,255,1)",
            backgroundColor: "rgba(20,20,20,0)",
            label: selectedWeapon,
            data: SetDamageData()
    };
    tempDamageData=x;
    TempArray.push(x);
    for(i=0;i<DamageDataArray.length;i++){
        TempArray.push(DamageDataArray[i]);
    }
    return TempArray;
}

function StoreData(){
    tempDamageData.borderColor=RandomColor();
    DamageDataArray.push(tempDamageData);
}

function DrawDamageChart() {
    var scatterChartData;
    var ctx = document.getElementById("myChartDamage").getContext("2d");
    ctx.canvas.width = window.innerWidth * .8 * .4;
    ctx.canvas.height = window.innerHeight * .3;
    if (dam_chart) { dam_chart.destroy(); }
    dam_chart = new Chart.Scatter(ctx, {
        data: {
            datasets: DamageData()
        },
        options: {
            animation : false,
            legend:
            {
                position:'right',
                labels:{
                usePointStyle:true,
                padding:10,
                boxWidth:15,
                fontSize:10
                }
            },
            title: {
                display: true,
                text: 'Average DPS on Target',
            },
            scales: {
                xAxes: [{
                    position: 'bottom',
                    gridLines: {
                        color:'rgba(128,255,128, .2)',
                        zeroLineWidth:4,
                    },
                    
                    ticks: {
                        min: 0,
                        max: 50,
                        stepsize: 5,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Range (tiles)"
                    }
                }],
                yAxes: [{
                        gridLines: {
                        color:'rgba(128,255,128, .2)',
                        zeroLineWidth:4,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'DPS (Damage per Second)'
                    }
                }]
            }
        }
    });
}
