// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Ti.API.info("=========================================================================\n=========================================================================\n＃＃＃＃　NCHULIB-APP: 程式初始化。\n=========================================================================\n=========================================================================");
// 檢查是否存在舊資料庫，有的話將它刪除
var oldDb = Ti.Database.open("nchulib.db");
oldDb.remove();
oldDb = null;


// 資料庫檢查初始
if (!NchuLibdb){
	var NchuLibdb = Ti.Database.open('NchuLibDB');
}

// Ti.App.Properties.setString('UserToken', "");
// Ti.App.Properties.setString('PID', "");

// Ti.App.Properties.setString('UserToken', "b9c42e27-504e-4bb4-a710-49a8bf4cbc3d");
// Ti.App.Properties.setString('PID', "M121626541");

var common = require('common');
common.db_check();

Ti.App.Properties.setString('AppStableVersion', Titanium.App.version);


// Ti.API.info("=========================================================================\n=========================================================================\n");
// Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
// Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
// Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
// Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
// if(Ti.Platform.osname === 'android'){
  // Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  // Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
  // Ti.API.info('＃＃＃＃　NCHULIB-APP: Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
// }
Ti.API.info("=========================================================================\n=========================================================================\n");





var sWidth=Titanium.Platform.displayCaps.platformWidth;
var sHeight=Titanium.Platform.displayCaps.platformHeight;


// 動態設定字型大小
var fs_0 = Math.round(Math.pow(sHeight,(1/2.8))+3);
var fs_h2_0 = Math.round(Math.pow(sHeight,(1/2.57))+2);
var fh_append = Math.round(Math.pow(sHeight,(1/2.6))-10);

var fs = fs_0;
var fs_h2 = fs_h2_0;
var fs_h1 = (fs_h2_0+3);

// Ti.API.info("＃＃＃＃　NCHULIB-APP: text Font Size: fs: "+fs);
// Ti.API.info("＃＃＃＃　NCHULIB-APP: h1 Font Size: fs_h1: "+fs_h1);
// Ti.API.info("＃＃＃＃　NCHULIB-APP: h2 Font Size: fs_h2: "+fs_h2);
// Ti.API.info("＃＃＃＃　NCHULIB-APP: fh_append: "+fh_append);

// 調整左右選單大小
var base_menu_width = Math.round(Math.pow(sWidth,(1/1.42))+93);



var first_use = 0;

//	Service ========================================================================== start
	// var intent = Ti.Android.createServiceIntent({url: 'NCHULIB_Service.js'});
	// var service = Titanium.Android.createService(intent);
	// service.start();
//	Service ========================================================================== end



// 推播服務 ========================================================================== start
// var UserToken = "";
var UrbanAirship = require('ti.urbanairship');
// Ti.API.info("＃＃＃＃　NCHULIB-APP: UrbanAirship Module:"+UrbanAirship);
// Ti.API.info("=================================\nUrbanAirship.pushId: "+UrbanAirship.pushId+"\n=================================");
// if (Ti.App.Properties.hasProperty('UserToke')){
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: ******** UserToken已存在，UserToken: "+Ti.App.Properties.getString('UserToken'));
// }else{
	// if (UrbanAirship.pushId){
		// Ti.App.Properties.setString('UserToken', UrbanAirship.pushId);
	// }else{
		// Ti.App.Properties.setString('UserToken', "11111111-1111-1111-1111-111111111111");
	// }
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: ******** UserToken不存在，成功取得新UserToken: "+Ti.App.Properties.getString('UserToken'));
	// common.user_reg();		
// }

// Set UA options
UrbanAirship.pushEnabled = true;
UrbanAirship.showOnAppClick = true;
UrbanAirship.tags = ['NCHULIB-APP'];

function eventSuccess(e) {
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 推播ID註冊成功。\n--------------------------------------------------------------------------\n");
	Ti.API.info("========================================================================================================");
	Ti.API.info("========================================================================================================");
	Ti.API.info("========================================================================================================");
	// ********************************************** 可能要補修正APP跟Agent端UserToken的程序***************************************************************
	// UserToken=e.deviceToken;
	if (Ti.App.Properties.hasProperty('UserToke')){
		if(Ti.App.Properties.setString('UserToke').length>30){
			Ti.API.info("＃＃＃＃　NCHULIB-APP: UserToken已存在，UserToken: "+Ti.App.Properties.getString('UserToken'));
		}else{
			Ti.API.info("＃＃＃＃　NCHULIB-APP: UserToken已存在，但是資料內容不正常，異常的UserToken: "+Ti.App.Properties.getString('UserToken'));
			Ti.App.Properties.setString('UserToken', e.deviceToken);
			common.user_reg();			
		}
	}else{
		Ti.App.Properties.setString('UserToken', e.deviceToken);
		Ti.API.info("＃＃＃＃　NCHULIB-APP: UserToken不存在，成功取得新UserToken: "+Ti.App.Properties.getString('UserToken'));
		common.user_reg();
	}
	Ti.API.info("========================================================================================================");
	Ti.API.info("========================================================================================================");
	Ti.API.info("========================================================================================================");
}

function eventError(e) {
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 推播ID註冊失敗。 錯誤訊息: "+e.error+"\n--------------------------------------------------------------------------\n");
	var msg = Ti.UI.createNotification({message:"使用者推播ID註冊失敗，您暫時將無法接收到各類訊息的推播。", duration: Ti.UI.NOTIFICATION_DURATION_LONG});
	msg.show();
}

function eventCallback(e) {
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 收到推播訊息。 \n顯示資訊: "+e.message+"\n附加資訊 "+e.payload+"\n--------------------------------------------------------------------------\n");
	Ti.App.Properties.removeProperty('payload');
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-顯示資訊: "+e.message);
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊: "+e.payload);
    var payload = e.payload.split("{").join("{\"").split("=").join("\":\"").split(", ").join("\",\"").split("}").join("\"}");
    Ti.App.Properties.setString('payload',payload);
    // Ti.API.info("＃＃＃＃　NCHULIB-APP: ******************* 設定 payload");
	if (e.clicked) {
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 使用者點擊推播訊息開啟APP");
	}else{
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息");
		var payload = JSON.parse(Ti.App.Properties.getString('payload'));
		var dialog = Ti.UI.createAlertDialog({
			cancel:0, buttonNames:['否','是'], message:'\n您已收到「'+payload.func_txt+'」訊息通知，\n\n請問是否要前往觀看?\n', title:'訊息接收通知'
		});
		dialog.addEventListener('click', function(e){
			if (e.index === 1){
				Alloy.createController('index').getView().open();
			}else{
				Ti.App.Properties.removeProperty('payload');
			}
		});
		dialog.show();
	}
    
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-func_type: "+payload.func_type);
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-Position: "+payload.Position);
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-ContentUrl: "+payload.ContentUrl);
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-func_txt: "+payload.func_txt);
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-showNum: "+payload.showNum);
}


UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_SUCCESS, eventSuccess);
UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_ERROR, eventError);
UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_CALLBACK, eventCallback);
// 推播服務 ========================================================================== end

// }catch(err){
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 發生系統錯誤: 擷取到 index.js 執行錯誤: 廠牌: "+Titanium.Platform.manufacturer+" 型號: "+Titanium.Platform.model+" 錯誤訊息: "+err.message);
	// var api_url="http://140.120.80.45/gtalk-nchu.php?receiver=javan.nchu@gmail.com&message=中興大學圖書館APP: 擷取到 index.js 執行錯誤: 廠牌: "+Titanium.Platform.manufacturer+" 型號: "+Titanium.Platform.model+" 錯誤訊息: "+err.message;
	// var client = Ti.Network.createHTTPClient();
	// client.setTimeout(10000);
	// client.open("GET", api_url);
	// client.send();
// }









