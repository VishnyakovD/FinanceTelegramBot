/*
cursn - Наличный курс
cursb - Безналичный курс
chast - Лимит оплаты частями
version - Версия бота
help - Список команд
*/

var vers="0.1.1";
var TelegramBot = require('node-telegram-bot-api');
//var Http = require('http');
const https = require('https');
var token = '407638065:AAE152FPuTHUfcava0yZgx_5kG14YvskaKc';
var bot = new TelegramBot(token, {polling: true});
    
bot.on('error', function (msg) {
    console.log(msg);
});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
 
    try {
        switch (msg.text) {
            case "/version":
            bot.sendMessage(chatId, vers, { caption: 'Версия бота' });
            break;
            case "/cursb":
                var msgOpt={
                    title1:`          Безналичный курс\n`,title2:'Валюта     Покупка       Продажа\n'
                } 
                SendRequestGet({hostname: 'api.privatbank.ua',port: 443,path: '/p24api/pubinfo?exchange&json&coursid=11', method: 'GET'},chatId,msgOpt);
                break;
            case "/cursn":
                var msgOpt={
                    title1:`          Наличный курс\n`,title2:'Валюта     Покупка       Продажа\n'
                } 
                SendRequestGet({hostname: 'api.privatbank.ua',port: 443,path: '/p24api/pubinfo?exchange&json&coursid=5', method: 'GET'},chatId,msgOpt);
            break;
        
            case "/chast":
            bot.sendMessage(chatId, "Оплата частями в разработке...", { caption: 'Финансы' });
            break;
        
            case "/help":
            case "/start":
            bot.sendMessage(chatId, `
/cursn - Наличный курс
/cursb - Безналичный курс
/chast - Лимит оплаты частями
/version - Версия бота
            `, { caption: 'Финансы' });
            break;
        
            default:
            bot.sendMessage(chatId, `Ой!!! У меня нет команды "${msg.text}". Напиши /help, чтоб узнать что я умею :)`, { caption: 'Финансы' });
            break;
        }
    } catch (error) {
        bot.sendMessage(chatId, `Ошибка!!! "${error.message}`, { caption: 'Финансы' });
        console.log(error);
    }	
 });



function SendRequestGet(options, chatId, msgOpt){
  /*  const options = {
        hostname: 'api.privatbank.ua',
        port: 443,
        path: '/p24api/pubinfo?exchange&json&coursid=11',
        method: 'GET'
      };*/
      const req = https.request(options, (res) => {    
        res.on('data', (d) => {      
            //process.stdout.write(d);
            var dResult=JSON.parse(d);
            bot.sendMessage(chatId, FormatMessage(dResult,msgOpt), { caption: 'Курс валют' });
        });
      });
      
      req.on('error', (e) => {
        console.error(e);
        bot.sendMessage(chatId,e.message, { caption: 'Ошибка' });
      });
      req.end();
}

function FormatMessage(data,msgOpt){
    var txt= msgOpt.title1;
    txt+=msgOpt.title2;
   
    //dResult=dResult.sort(function(item){return item.ccy;});
    var rurSpace="";
    for (var index = 0; index < data.length; index++) {
        var element = data[index];
        if (element.ccy==="BTC") {
           break;
        }
        if (element.ccy==="RUR") {
          rurSpace="  ";
        }else{
          rurSpace="";
        }

        txt+=`${element.ccy}            ${rurSpace}${parseFloat(element.buy * 100 / 100).toFixed(3)}          ${rurSpace}${parseFloat(element.sale * 100 / 100).toFixed(3)}\n`;
    }
    return txt;
}

function GetTodayDate() {
    var tdate = new Date();
    var dd = tdate.getDate().toString();
    if (dd.length==1) {
        dd = "0" + dd;
    }
    var MM = (tdate.getMonth() + 1).toString();
    if (MM.length ==1) {
        MM = "0" + MM;
    }
    var yyyy = tdate.getFullYear(); 
    var resDate = dd + "." + MM + "." + yyyy;

    return resDate;
}