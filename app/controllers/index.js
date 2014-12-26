$.main_header_title.font = {fontSize: fs_h2+"sp", fontWeight: "bold"};

var select_renew_array=[];
var all_renew_array=[];
var PatronLoan_data_array=[];
var mylib_num={'mylib_loan':['借閱清單',0], 'mylib_almostover':['即將到期',0], 'mylib_overdue':['借閱逾期',0], 'mylib_request':['預約到館',0]};

// if (login_check(false)){
//	Ti.API.info("＃＃＃＃　NCHULIB-APP: 程式初始，檢查讀者是否登入: 讀者帳號已登入。");
// }else{
//	Ti.API.info("＃＃＃＃　NCHULIB-APP: 程式初始，檢查讀者是否登入: 讀者帳號未登入。");
// }

setTimeout(function(){
	$.drawer.open();

	menu_init();
	leave_confirm();
	
	if(Ti.App.Properties.getInt('UseTimes')==1){
		var first_use_timeout = 3000;
	}else{
		var first_use_timeout = 1000;
	}
	 
	
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: *********************** 開始進行 payload 值檢查 ***********************");
	if(Ti.App.Properties.hasProperty('payload')){
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: payload檢查點: 1.0");
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: index中的 payload: "+Ti.App.Properties.getString('payload'));
		if(Ti.App.Properties.getString('payload').length>0){
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: payload檢查點: 2.0");
			var payload = JSON.parse(Ti.App.Properties.getString('payload'));
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-func_type: "+payload.func_type);
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-Position: "+payload.Position);
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-ContentUrl: "+payload.ContentUrl);
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-func_txt: "+payload.func_txt);
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: 收到推播訊息-附加資訊-showNum: "+payload.showNum);
			switch(payload.ContentUrl){
	 		case "NormalNews": case "NewBibs":
	 			// Ti.API.info("＃＃＃＃　NCHULIB-APP: payload檢查點: 3");
	 			common.getInfoData(payload.ContentUrl,1);
	 			setTimeout(function(){
					get_data_list(payload.Position, payload.ContentUrl, payload.func_txt, payload.howNum);
				}, 1000); //setTimeout
				break;
	 		case "mylib_loan": case "mylib_almostover": case "mylib_overdue": case "mylib_request":
				// Ti.API.info("＃＃＃＃　NCHULIB-APP: 執行個人借閱");	 		
				if (login_check(true)){
					my_lib_init();
					setTimeout(function(){
						//if (mylib_num[payload.ContentUrl][1]>0){
							    my_lib_list(payload.ContentUrl, mylib_num[payload.ContentUrl][0], mylib_num[payload.ContentUrl][1], payload.Position);
								menu_init();
						//}else{
						//	alert("您目前沒有"+mylib_num[payload.ContentUrl][0]+"資料");
						//}
					}, 2000); //setTimeout
				}
				break;
			}
			Ti.App.Properties.removeProperty('payload');
		}else{
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: payload檢查點: 2.1");
			common.getInfoData('NormalNews',1);
			setTimeout(function(){
				main_page_init();
			}, first_use_timeout); //setTimeout
			common.getInfoData('NewBibs',0);
		}
		// Ti.App.Properties.removeProperty('payload');
	}else{
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: payload檢查點: 1.1");
		common.getInfoData('NormalNews',1);
		setTimeout(function(){
			main_page_init();
		}, first_use_timeout); //setTimeout
		common.getInfoData('NewBibs',0);
	}
	Ti.App.Properties.removeProperty('payload');
	
	setTimeout(function(){
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: UseTimes: "+Ti.App.Properties.getInt('UseTimes'));
		if(Ti.App.Properties.getInt('UseTimes')==1){use_guide();}
	}, 3000); //setTimeout
	Ti.App.Properties.setInt('UseTimes', Ti.App.Properties.getInt('UseTimes')+1);
	
	//檢查網路狀態
	common.check_net_state('提醒您，\n\n您的行動載具目前無法連接網路，這將使得本程式多項功能無法正常使用，以及資訊無法即時更新。\n\n為確保您資料的正確性，請您開啟網路連線後再次使用。');
}, 1500); //setTimeout

function toggle(e) {
    var fn = 'toggle' + e.source.title + 'Window';
    $.drawer[fn]();
}

function leave_confirm(){
	var dialog = Ti.UI.createAlertDialog({
		cancel: 0,
		buttonNames: ['否','是'],
		message: '\n請問您是否要離開本程式?\n',
		title: '離開確認'
	});
	dialog.addEventListener('click', function(e){
		if (e.index === 1){
			clear_view();
			var activity = Titanium.Android.currentActivity;
			activity.finish();
		}
	});
	
	$.drawer.addEventListener('android:back',function(e){
		dialog.show();
	});
}

function main_page_init(Position){	// 資訊首頁
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(main_page_init) 資訊首頁\n--------------------------------------------------------------------------\n");
	
	if(Position=='Left'){
		$.drawer.toggleLeftWindow();
	}else if(Position=='Right'){
		$.drawer.toggleRightWindow();
	}
	
	clear_view();
	$.main_header_title.text="資訊首頁 (資料載入中…)";
	// sys_info();

	if (login_check(false)){	
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: mylib_num['mylib_loan'][1]: "+mylib_num['mylib_loan'][1]);
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: mylib_num['mylib_request'][1]: "+mylib_num['mylib_request'][1]);	
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 檢查及產生資訊首頁框-個人借閱資訊");
		my_lib_sum();
	}
	setTimeout(function(){	
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 產生資訊首頁框-最新消息");
		get_data_list("", "NormalNews", "最新消息", 4);
		$.main_header_title.text="資訊首頁";
	}, 1000); //setTimeout
	
	menu_init();
}


function menu_init(){
	//Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(menu_init) 更新左右功能選單\n--------------------------------------------------------------------------\n");
	
	var sv = Ti.App.Properties.getString('AppStableVersion').split('.');
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: sv[0]:"+sv[0]+" sv[1]:"+sv[1]+" sv[2]:"+sv[2]);
	var lv = (Titanium.App.version).split('.');
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: lv[0]:"+lv[0]+" lv[1]:"+lv[1]+" lv[2]:"+lv[2]);
	if (parseFloat(sv[0]+'.'+sv[1])>parseFloat(lv[0]+'.'+lv[1]) || parseFloat(sv[1]+'.'+sv[2])>parseFloat(lv[1]+'.'+lv[2])){
		var msg = Ti.UI.createNotification({message:"本程式已推出新版本，\n敬請更新程式以獲得較佳服務品質。", duration: Ti.UI.NOTIFICATION_DURATION_LONG});
		msg.show();
	}
	
	$.left_menu.removeAllChildren();
	$.right_menu.removeAllChildren();
	
	function draw_func(Position, func_type, func_txt, func_name, ContentUrl, ShowNum, font_color, bg_color){
	    func_type = func_type || "h2";
	    font_color = font_color || "#FFEECD";
	    bg_color = bg_color || "#24245A";
	    
	 	var var_top=0;	var var_left=0; var var_height=0; var var_font=""; var var_bgcolor="";
	 	switch(func_type){
	 		case "h1":
	 			var_top=(fh_append*4)+"dp";
	 			var_bottom="0dp";
	 			var_left="15dp";
	 			var_height=(fs_h1+fh_append-1)+"dp";
	 			var_font=fs_h1+"sp";
	 			var_label_bgclolor="#24245A";
	 			var_row_bgclolor="#24245A";
	 			break;
	 		case "h2":
	 			var_top=(fh_append*1.2)+"dp";
	 			var_bottom=(fh_append*1.2)+"dp";
	 			var_left="42dp";
	 			var_height=(fs_h2+fh_append)+"dp";
	 			var_font=fs_h2+"sp";
	 			var_label_bgclolor="#24245A";
	 			var_row_bgclolor= bg_color;
	 			break;
	 		case "hr":
	 			var_bottom=(fh_append*1.2)+"dp";
	 			var_left="16dp";
	 			var_height="3dp";
	 			var_label_bgclolor=bg_color;
	 			var_row_bgclolor="#24245A";
	 			break;
	 	}

		if (func_type=='hr'){
			var label = Ti.UI.createLabel({text:func_txt, top:var_top, bottom:var_bottom, left:var_left, height:var_height, font:{fontSize:var_font}, color:font_color, backgroundColor:var_label_bgclolor,width:"100%", textAlign:"left"});			
		}else{
			var label = Ti.UI.createLabel({text:func_txt, top:var_top, bottom:var_bottom, left:var_left, height:var_height, font:{fontSize:var_font}, color:font_color, width:"100%", textAlign:"left"});
		}

		var row = Ti.UI.createTableViewRow({height:"auto", backgroundSelectedColor: var_row_bgclolor});
		
		switch(func_name){
	 		case "get_data_list":
				row.addEventListener('click', function(){
					get_data_list(Position, ContentUrl, func_txt, ShowNum);
					menu_init();
				});	break;
	 		case "open_url":
				row.addEventListener('click', function(){
						open_url(Position, ContentUrl, func_txt);
						menu_init();
					});	break;
			
			//資訊公告
	 		case "main_page_init": 	//資訊首頁
	 			row.addEventListener('click', function(){main_page_init('Left');menu_init(); }); break;
	 
	 		//館藏查詢
 			case "isbn_query": 	//ISBN掃描查詢
			row.addEventListener('click', function(){isbn_query(); menu_init();}); break;
			
			//我的圖書館
	 		case "mylib":
				row.addEventListener('click', function(){
					if (login_check(true)){
						//if (mylib_num[ContentUrl][1]>0){
								my_lib_list(ContentUrl, mylib_num[ContentUrl][0], mylib_num[ContentUrl][1], Position);
								menu_init();
						//}else{
						//	alert("您目前沒有"+mylib_num[ContentUrl][0]+"資料");
						//}
					}
				}); break;
				
			//個人化設定
	 		case "notification_select": 	//通知功能開關
				row.addEventListener('click', function(){notification_select();menu_init(); }); break;
	 		case "personal_login": 			//讀者帳號登入
				row.addEventListener('click', function(){personal_login('Right'); menu_init();}); break;
	 		case "personal_logout": 		//讀者帳號登出
				row.addEventListener('click', function(){personal_logout();menu_init(); }); break;
			
			//程式設定
	 		case "about_app": 	//關於本程式
				row.addEventListener('click', function(){about_app(); menu_init();}); break;			
	 		case "use_guide": 	//操作說明
				row.addEventListener('click', function(){use_guide('Right'); menu_init();}); break;
	 		case "feedback": 	//Email意見反饋
				row.addEventListener('click', function(){feedback('Right'); menu_init();}); break;
			case "app_exit": 	//離開本程式
				row.addEventListener('click', function(){app_exit(); menu_init();}); break;	
		}
		
	    row.add(label);
	    if(Position=='Left'){data_left.push(row);}else if(Position=='Right'){data_right.push(row);}
	}
	
	var data_left = []; var data_right = [];
	// 保留系統彈性，如果某天其他組同仁同意在讀者登入前後呈現不同的選單資訊，這時候就可以把sql值設成不一樣。
	if (login_check(false)){
		var sql_string = "SELECT * FROM APP_tab_Function WHERE OnOffCheck='1' AND FunctionType<>'personal_login' ORDER BY ID ASC;";
	}else{
		var sql_string = "SELECT * FROM APP_tab_Function WHERE OnOffCheck='1' AND FunctionType<>'personal_logout' ORDER BY ID ASC;";
	}
	
	var rs = NchuLibdb.execute(sql_string);
	while (rs.isValidRow()){
		// Ti.API.info('ID:\t\t\t'+rs.fieldByName('ID')+'\n'+
					// 'FuncLayoutType:\t'+rs.fieldByName('FuncLayoutType')+'\n'+
					// 'Position:\t\t'+rs.fieldByName('Position')+'\n'+
					// 'TitleText:\t\t'+rs.fieldByName('TitleText')+'\n'+
					// 'FontColor:\t\t'+rs.fieldByName('FontColor')+'\n'+
					// 'BgColor:\t\t'+rs.fieldByName('BgColor')+'\n'+
					// 'FunctionType:\t'+rs.fieldByName('FunctionType')+'\n'+
					// 'ContentUrl:\t\t'+rs.fieldByName('ContentUrl')+'\n'+
					// 'ShowNum:\t\t'+rs.fieldByName('ShowNum')+'\n'+
					// 'LoginCheck:\t\t'+rs.fieldByName('LoginCheck')+'\n'+
					// 'OnOffCheck:\t\t'+rs.fieldByName('OnOffCheck')+"\n-------------------------------------------\n");
		draw_func(rs.fieldByName('Position'), rs.fieldByName('FuncLayoutType'), rs.fieldByName('TitleText'), rs.fieldByName('FunctionType'), rs.fieldByName('ContentUrl'), rs.fieldByName('ShowNum'), rs.fieldByName('FontColor'), rs.fieldByName('BgColor'));
		rs.next();
	}
	draw_func('Left', 'h2', '', '', '', '', '', ''); draw_func('Right', 'h2', '', '', '', '', '', '');
	var tableview = Titanium.UI.createTableView({data:data_left, separatorColor: "#24245A"});
	$.left_menu.add(tableview);
	var tableview = Titanium.UI.createTableView({data:data_right, separatorColor: "#24245A"});
	$.right_menu.add(tableview);
	rs.close();
	
	$.drawer.setLeftDrawerWidth((base_menu_width)+'dp');
	$.drawer.setRightDrawerWidth((base_menu_width)+'dp');
	
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 選單寬度: "+(base_menu_width)+'dp');
	// NchuLibdb.execute("DROP TABLE APP_tab_Function;");
}

// function sys_info(){	// 系統公告
	// var info_box = Titanium.UI.createView({
		// top: (fh_append*2)+'dp',
		// bottom: (fh_append*2)+'dp',
		// borderRadius:4,
		// borderWidth: 1,
		// borderColor:"#CCC",
		// backgroundColor:"#FFF",
		// width:"92%",
		// height:Ti.UI.SIZE
	// });
//  	
    // var data = [];
//     
    // var row = Ti.UI.createTableViewRow({height:"auto", backgroundColor: "#CCC"});
    // var label = Ti.UI.createLabel({
        // text:"系統公告",
        // left: 10,
        // top: (fh_append/1.5)+'dp',
        // bottom: (fh_append/1.5)+'dp',
        // color: "#F00",
        // font: {fontSize: fs_h2+'sp', fontWeight: 'bold'},
    // });
    // row.add(label);
	// data[0] = row;
// 
    // var row = Ti.UI.createTableViewRow({height:"auto"});
    // var label = Ti.UI.createLabel({
        // text: "範例系統公告訊息",
        // left:10,
        // top: (fh_append/2)+'dp',
        // bottom: (fh_append/2)+'dp',
        // right:5,
        // color: "#333",
        // font: {fontSize: fs+'sp'}
    // });
    // row.add(label);
    // data[1] = row;
//     
    // var row = Ti.UI.createTableViewRow({height:"auto"});
    // var label = Ti.UI.createLabel({
        // text: "若有系統公告訊息的話，本區塊強制出現在最上方。",
        // left:10,
        // top: (fh_append/2)+'dp',
        // bottom: (fh_append/2)+'dp',
        // right:3,
        // color: "#333",
        // font: {fontSize: fs+'sp'}
    // });
    // row.add(label);
    // data[2] = row;
// 
    // var tableview = Titanium.UI.createTableView({data:data, separatorColor: "#CCC"});
    // info_box.add(tableview);
//  
	// $.main_page.add(info_box);
// }


function my_lib_sum(){	// 資訊首頁-首頁個資借閱資訊框
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(my_lib_sum) 資訊首頁-首頁個資借閱資訊框\n--------------------------------------------------------------------------\n");
	
	common.getInfoData('LOAN',1);
	common.getInfoData('REQUEST',1);
	
	setTimeout(function(){
		my_lib_init();
		
		if(login_check(false) && mylib_num['mylib_loan'][1]+mylib_num['mylib_request'][1]>0){
	
			var info_box = Titanium.UI.createView({
				top:(fh_append*2)+'dp',	bottom:fh_append+'dp', borderRadius:4, borderWidth:1, borderColor:"#BBB", backgroundColor:"#FFF", width:"94%", height:Ti.UI.SIZE
			});
		 	
		    var data = [];
		    var counter=0;
		    
		    var row = Ti.UI.createTableViewRow({height:"auto", backgroundColor: "#BBB"});
		    var label = Ti.UI.createLabel({
		        text:"個人借閱資訊", left:10, top:(fh_append/1.5)+'dp', bottom:(fh_append/1.5)+'dp', color:"#333", font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
		    });
		    row.add(label);
			data[counter++] = row;
			
			for(var key in mylib_num) {
			    // alert(mylib_num[key]);
				if (mylib_num[key][1]>0){
					if (counter%2==0){row_bg_color="#EEE";}else{row_bg_color="#FFFFFF";}
				    var row = Ti.UI.createTableViewRow({height:"auto", backgroundColor: row_bg_color});
				    
				    switch(key){
		 			case "mylib_loan":
						var font_color = "#333";	break;
					case "mylib_almostover":
						var font_color = "#00F";	break;
					case "mylib_overdue":
						var font_color = "#F00";	break;
					case "mylib_request":
						var font_color = "#006400";	break;
					}
					
				    var label = Ti.UI.createLabel({
				        text: mylib_num[key][0]+": "+mylib_num[key][1]+" 筆",
				        left:10,
				        top: (fh_append/2)+'dp',
				        bottom: (fh_append/2)+'dp',
				        right:5,
				        color: font_color,
				        font: {fontSize: fs+'sp'},
				        key: key
				    });
				    row.add(label);
				    row.key=key;
				    data[counter++] = row;
				}
			}
		
		    var tableview = Titanium.UI.createTableView({data:data, separatorColor: "#BBB"});
		    info_box.add(tableview);
		 
			tableview.addEventListener('click', function(e){
				if(e.row.key){
					my_lib_list(e.row.key, mylib_num[e.row.key][0], mylib_num[e.row.key][1], "");
					menu_init();					
				}
			});
		 
			$.main_page.add(info_box);
		}
	}, 1000); //setTimeout
}

function my_lib_init(){
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(my_lib_init) 讀者借閱資訊更新\n--------------------------------------------------------------------------\n");

	PatronLoan_data_array.length=0;
	mylib_num['mylib_loan'][1]=0;
	mylib_num['mylib_almostover'][1]=0;
	mylib_num['mylib_overdue'][1]=0;
	mylib_num['mylib_request'][1]=0;
	
	var check_array = ['LOAN','REQUEST'];
	for (var j=0; j<check_array.length; j++) {
		
		InfoType=check_array[j];
		
		var sql_string = "SELECT InfoData FROM APP_tab_Data WHERE InfoType='"+InfoType+"' AND length(InfoData)>0;";
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 取得載具端"+InfoType+"資料: "+sql_string);
		
		var rs = NchuLibdb.execute(sql_string);
		if(rs.isValidRow()){
			// Ti.API.info("NCHULIB-API: 取得"+InfoType+"資料: " + decodeURIComponent(rs.fieldByName('InfoData')));
			json = JSON.parse(common.decodeUrlParameter(rs.fieldByName('InfoData')));
			var item_counter = json.TITLE.length;
			for (var i=0; i<item_counter; i++){
				var list_type = "";
				if (InfoType=="LOAN"){
					mylib_num['mylib_loan'][1]+=1;	//借閱清單數量
					list_type = "mylib_loan";
					var end_date_reform = json.END_DATE[i].substr(0,4)+"/"+json.END_DATE[i].substr(4,2)+"/"+json.END_DATE[i].substr(6,2);
					var date_diff = Date.parse(end_date_reform).valueOf() - Date.parse(new Date().toDateString()).valueOf();
	
					if (date_diff<0) {
						mylib_num['mylib_overdue'][1]+=1;	//借閱逾期數量
						list_type = "mylib_overdue"; 
					}else if((date_diff/1000/3600/24)<=7){
						mylib_num['mylib_almostover'][1]+=1;	//即將到期數量(前7天)
						list_type = "mylib_almostover";
					}
				}else if(InfoType=="REQUEST"){
					mylib_num['mylib_request'][1]+=1;	//預約到館數量
					list_type = "mylib_request";
				}
				
				PatronLoan_data_array.push({
					title: json.TITLE[i],
					author: json.AUTHOR[i],
					barcode: json.BARCODE[i],
					isbn: json.ISBN_ISSN[i],
					end_date: json.END_DATE[i],
					list_type: list_type
				});
	 		}
			
			
		}
		rs.close();
	}
	Ti.API.info("＃＃＃＃　NCHULIB-APP: 完成各類借閱數量更新!  借閱清單: "+mylib_num['mylib_loan'][1]+"冊\t即將到期: "+mylib_num['mylib_almostover'][1]+"冊\t借閱逾期: "+mylib_num['mylib_overdue'][1]+"冊\t預約到館: "+mylib_num['mylib_request'][1]+"冊");
}

function my_lib_list(op_type, op_title, op_num, Position){
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(my_lib_list) 繪製借閱清單，類型為: "+op_type+"\n--------------------------------------------------------------------------\n");
	
	clear_view();
	$.main_header_title.text = op_title+" (資料載入中…)";
	
	if(Position=='Left'){
		$.drawer.toggleLeftWindow();
	}else if(Position=='Right'){
		$.drawer.toggleRightWindow();
	}
	
	if(op_type=='mylib_request'){
		common.getInfoData('REQUEST',1);
	}else{
		common.getInfoData('LOAN',1);
	}
		
	my_lib_init();
	
	setTimeout(function(){
		if (mylib_num[op_type][1]>0){
			$.main_header_title.text = op_title+" ("+mylib_num[op_type][1]+"筆)";
		
			Ti.API.info("＃＃＃＃　NCHULIB-APP: 開始繪製清單，類型為:"+op_type);
		
			if(op_num<1){
				
			}else{
				select_renew_array.length=0;
				all_renew_array.length=0;
				
				var Title_array = [];
				Title_array.length=0;
				var row_counter=0;
				for( var i=0; i<PatronLoan_data_array.length; i++){
					// Ti.API.info("表格繪製類型:"+op_type+"\t\t資料類型:"+PatronLoan_data_array[i]['list_type']);
					//if (PatronLoan_data_array[i]['list_type']==op_type || op_type=="loan_list"){
					if (PatronLoan_data_array[i]['list_type']==op_type || (op_type=='mylib_loan' && PatronLoan_data_array[i]['list_type']=='mylib_almostover') || (op_type=='mylib_loan' && PatronLoan_data_array[i]['list_type']=='mylib_overdue')){
						row_counter+=1;
						if (row_counter%2==1){row_bg_color="#FFF";}else{row_bg_color="#EEE";}
						
						//各類型都要加的部份1 ========================================= start
						var row = Ti.UI.createTableViewRow({backgroundColor:row_bg_color, separatorColor:"#BBB"});
						
						var end_date_reform = PatronLoan_data_array[i]['end_date'].substr(0,4)+"/"+PatronLoan_data_array[i]['end_date'].substr(4,2)+"/"+PatronLoan_data_array[i]['end_date'].substr(6,2);
						var date_diff = Date.parse(end_date_reform).valueOf() - Date.parse(new Date().toDateString()).valueOf();
						if (date_diff<0) {
							text_color="#f00";	//逾期 
						}else if((date_diff/1000/3600/24)<=7){
							text_color="#00f";	//即將到期(前7天)
						}else{
							text_color="#000";	//未逾期
						}
						//各類型都要加的部份1 ========================================= end
						
						var row_view = Ti.UI.createView({layout:"horizontal", width:"100%"});
						//依不同類型的特別判斷 ======================================= start
						if (op_type=="mylib_loan" || op_type=="mylib_almostover"){
							all_renew_array.push(PatronLoan_data_array[i]['barcode']);
							
							//原方式============================================================================== start
							var row_checkbox = Ti.UI.createSwitch({
								backgroundColor:'#CCC',
								borderRadius:3,
								borderColor:'#555',
								value:false, 
								style:Ti.UI.Android.SWITCH_STYLE_CHECKBOX, 
								width:(fs*1.9)+'dp', 
								height:Titanium.UI.FILL, 
								top:(fh_append/2)+'dp', 
								bottom:(fh_append/2)+'dp', 
								left:(fh_append/2)+'dp', 
								right:(fh_append/2)+'dp', 
								barcode:PatronLoan_data_array[i]['barcode'], 
							});
	
							row_checkbox.addEventListener('change', function(e) {
								var target_index=select_renew_array.indexOf(e.source.barcode);
								if (target_index>=0){ //已存在清單中，將它移除
									this.backgroundColor='#CCC';
									select_renew_array.splice(target_index,1);
								}else{ //不在清單中，將它加入
									this.backgroundColor='#A4C722';
									select_renew_array.splice(target_index,0,e.source.barcode);
								}
								// alert(select_renew_array.toString());
							});
							//原方式============================================================================== end
							
							//新方式============================================================================== start
							// var row_checkbox = Ti.UI.createButton({
								// barcode:PatronLoan_data_array[i]['barcode'],
								// title: '',
								// width: '8%',
								// height: (fs*1.8)+'dp',
								// // top: (fh_append/1.5)+'dp',
								// // bottom: (fh_append/1.5)+'dp',
								// // left: (fh_append/1.5)+'dp',
								// // right:(fh_append/1.5)+'dp',
								// borderColor: '#555',
								// borderWidth: 1,
								// borderRadius: 2,
								// backgroundColor: '#BBB',
								// backgroundImage: 'none',
								// color: '#fff',
								// font:{fontSize: fs+'sp', fontWeight: 'bold'},
								// value: false,
								// zIndex:5
							// });
							
							// row_checkbox.addEventListener('click', function(e) {
							    // if(false == e.source.value) {
								    // this.backgroundColor = '#A4C722';
								    // this.title='\u2713';
								    // this.value = true;
								    // Ti.API.info("＃＃＃＃　NCHULIB-APP: 勾選 :"+ e.source.barcode);
							    // } else {
								    // this.backgroundColor = '#BBB';
								    // this.title='';
								    // this.value = false;
								    // Ti.API.info("＃＃＃＃　NCHULIB-APP: 取消勾選 :"+ e.source.barcode);
								// }
								// this.show();
								// var target_index=select_renew_array.indexOf(this.barcode);
								// if (target_index>=0){ //已存在清單中，將它移除
									// select_renew_array.splice(target_index,1);
								// }else{ //不在清單中，將它加入
									// select_renew_array.splice(target_index,0,this.barcode);
								// }
								// Ti.API.info("＃＃＃＃　NCHULIB-APP: 目前已選擇項目: "+select_renew_array.toString());
							// });
							//新方式============================================================================== end
							
							row_view.add(row_checkbox);
							row_view.add(Ti.UI.createLabel({backgroundColor:"#BBB", top:0, bottom:0, width:1}));
		
							var row_title_width="65%";
							var row_EndDate_data_width="22%";
						}else{
							var row_title_width="72%";
							var row_EndDate_data_width="24%";
						}
						//依不同類型的特別判斷 ======================================= end
						
						//各類型都要加的部份2 ========================================= start
						// var view1 = Ti.UI.createView({
							// left:view1_left, width:view1_width
						// });
						
						var row_title = Ti.UI.createLabel({
							text: PatronLoan_data_array[i]['title'], color:text_color, left:4, right:4, top:(fh_append/1.5)+'dp', bottom:(fh_append/1.5)+'dp', width:row_title_width, font:{fontSize:(fs-2)+'sp'}, textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT,
							title:PatronLoan_data_array[i]['title'],
							author: PatronLoan_data_array[i]['author'],
							barcode: PatronLoan_data_array[i]['barcode'],
							isbn: PatronLoan_data_array[i]['isbn']
						});
						row_view.add(row_title);
						
						row_title.addEventListener('click', function(e) {
							var popup_window = Ti.UI.createWindow({layout:"vertical", backgroundColor:"#FFEECD", borderWidth:1, borderColor:"#555555",	width:"80%", height:"80%"});
				
							var bib_head = Ti.UI.createLabel({text:"書目資訊",	font:{fontSize:fs_h2+"sp", fontWeight:"bold"}, backgroundColor:"#26A095", borderColor:"#555555", color:text_color, top:0, width:"100%", height:(fs_h2*3)+'dp', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER});
							popup_window.add(bib_head);
							
							var bib_view = Ti.UI.createView({layout:"vertical", height:"100%", width:"100%"});
							popup_window.add(bib_view);
				
							var bib_title = Ti.UI.createLabel({text:"題名："+e.source.title, font:{fontSize:fs+'sp'}, color:text_color, top:15+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT});
							bib_view.add(bib_title);
				
							var bib_author = Ti.UI.createLabel({text:"作者："+e.source.author, font:{fontSize:fs+'sp'}, color:text_color,	top:5+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT});
							bib_view.add(bib_author);
				
							var bib_barcode = Ti.UI.createLabel({text: "登錄號："+e.source.barcode, font: {fontSize: fs+'sp'}, color:text_color, top:5+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT});
							bib_view.add(bib_barcode);
										
							var bib_cover = Ti.UI.createImageView({
								image:"http://static.findbook.tw/image/book/"+e.source.isbn+"/large",
								top:15,	width:'150dp', height:'200dp', borderWidth:1, borderColor:"#555555"
							});
							bib_view.add(bib_cover);
							
							var close_button = Ti.UI.createButton({title:'關閉本視窗', font:{fontSize:fs_h2+'sp',fontWeight:"bold"}, borderRadius:4, color:"#DDD", backgroundColor:"#000", top:20+'dp', bottom:0, height:(fs_h2*4)+"dp", width:"100%"});
							bib_view.add(close_button);
							
							close_button.addEventListener('click', function(e) {
								popup_window.close();
							});
							
							popup_window.open({ modal : true });
						});
						row_view.add(Ti.UI.createLabel({backgroundColor:"#BBB", top:0, bottom:0, width:1}));
						row_view.add(Ti.UI.createLabel({text: PatronLoan_data_array[i]['end_date'], color:text_color, width:row_EndDate_data_width, top:(fh_append/1.5)+'dp', bottom:(fh_append/1.5)+'dp', left:'0dp', right:'0dp', font: {fontSize: (fs-4)+'sp'}, textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER}));
						row.add(row_view);
				
						Title_array.push(row);
						//各類型都要加的部份2 ========================================= end
					}
				}
			}
		
			var title_view = Ti.UI.createView({layout:"horizontal", width:"100%", height:(fs*2)+'dp', backgroundColor:"#BBB"});
			if (op_type=="mylib_loan" || op_type=="mylib_almostover"){
				
				var renew_view = Ti.UI.createView({
					layout: "horizontal",
					width: "100%",
					height: ((fs*2.5)+6)+'dp',
					borderWidth:"1dp",
					borderColor:"#777"
				});
				
				var renew_all_button = Ti.UI.createButton({
					title: '全部續借',
					textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER,
					borderRadius: 5,
					font: {fontSize: fs+'sp', fontWeight:'bold'},
					color: "#DDD",
					backgroundColor: "#333",
					height: (fs*2.5)+'dp',
					width: "50%",
					top:'3dp', bottom:'3dp', left:'3dp', right:'1dp'
				});
				
				var renew_select_button = Ti.UI.createButton({
					title: '續借所選項目',
					textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER,
					borderRadius: 5,
					font: {fontSize: fs+'sp', fontWeight:'bold'},
					color: "#DDD",
					backgroundColor: "#333",
					height: (fs*2.5)+'dp',
					width: Ti.UI.FILL,
					top:'3dp', bottom:'3dp', left:'1dp', right:'2dp'
				});
	
				renew_all_button.addEventListener('click', function(e) {
					renew_select_button.title = "敬請稍後";
					renew_select_button.enabled = false;
					// renew_select_button.setColor("#333");
					renew_all_button.title = "執行續借中…";
					renew_all_button.enabled = false;
					// renew_all_button.setColor("#333");
					renew_all(op_type);				
				});
	
				renew_select_button.addEventListener('click', function(e) {
					if (select_renew_array.length>0){
						renew_select_button.title = "敬請稍後";
						renew_select_button.enabled = false;
						// renew_select_button.setColor("#333");
						renew_all_button.title = "執行續借中…";
						renew_all_button.enabled = false;
						// renew_all_button.setColor("#333");
						renew_select(op_type);			
					}else{
						alert("請勾選您要續借的項目。");
					}
				});
				
				renew_view.add(renew_all_button);
				renew_view.add(Ti.UI.createLabel({backgroundColor:"#BBB", top:0, bottom:0, width:1}));
				renew_view.add(renew_select_button);
				
				$.main_page.add(renew_view);
								
				title_view.add(Ti.UI.createLabel({text: "\u2713", color:"#000", font:{fontSize:(fs-2)+'sp', fontWeight:'bold'}, width:(fs*1.9)+'dp', height:(fs*1.5)+'dp', left:(fh_append/2)+'dp', right:(fh_append/2)+'dp', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER}));
				title_view.add(Ti.UI.createLabel({backgroundColor:"#777", top:0, bottom:0, width:1, height:"100%"}));
				
				var row_title_width="65%";
				var row_EndDate_head_width="23%";
			}else{
				var row_title_width="72%";
				var row_EndDate_head_width="25%";
			}
			
			title_view.add(Ti.UI.createLabel({text:"題名", color:"#000", font:{fontSize:(fs-2)+'sp', fontWeight:'bold'}, left:"4", right:"4", width:row_title_width, height:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER}));
			title_view.add(Ti.UI.createLabel({backgroundColor:"#777", top:0, bottom:0, width:1, height:"100%"}));
			title_view.add(Ti.UI.createLabel({text:"到期日", color:"#000", font:{fontSize:(fs-2)+'sp', fontWeight:'bold'}, width:row_EndDate_head_width, height:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER}));
			$.main_page.add(title_view);
			
			var tableview = Ti.UI.createTableView({data:Title_array, separatorColor:"#BBB", zIndex:1});
			$.main_page.add(Ti.UI.createLabel({backgroundColor:"#777", top:0, bottom:0, width:"100%", height:1}));
			$.main_page.add(tableview);
		}else{
			$.main_header_title.text = op_title+" (0筆)";
			alert("您目前沒有"+mylib_num[op_type][0]+"資料");
		}
	}, 1000); //setTimeout
	// alert("完成借閱資料表格繪製");
}

function renew_select(op_type){
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(renew_select) 續借所選，類型為: "+op_type+"\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		
		common.getInfoData('LOAN',1);
		
		setTimeout(function(){
			my_lib_init();
		
			if (select_renew_array.length>0){
				
				try{
					var url = "https://www.lib.nchu.edu.tw/lib_api/php/appagent/index_get_2014.php?OP=Renew&UserToken="+Ti.App.Properties.getString('UserToken')+"&PID="+Ti.App.Properties.getString('PID')+"&RenewList=["+select_renew_array.toString()+"]";
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 續借所選api: " + url);
					var client = Ti.Network.createHTTPClient({
					onload : function(e) {
						// Ti.API.info("Received text: " + this.responseText);
						var all_data = JSON.parse(this.responseText);
						var RenewResult_data = JSON.parse(JSON.stringify(all_data.RenewResult));
					
						var return_string="";
						for( var i=0; i<RenewResult_data.Barcode.length; i++){
							return_string+="題名："+RenewResult_data.Title[i]+"\n"+"續借結果："+RenewResult_data.OpInfo[i]+"\n\n";
						}
				
						// 更新借閱清單
						my_lib_init();
			
						var dialog = Ti.UI.createAlertDialog({
							buttonNames: ['確定'],
							message: return_string,
							title: '續借結果'
						});
						
						dialog.show();
									
						
						dialog.addEventListener('click', function(e){
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 執行續借所選，重新繪製清單。");
							if (login_check(false)){
								if (mylib_num[op_type][1]>0){
									//setTimeout(function(){
										my_lib_list(op_type, mylib_num[op_type][0], mylib_num[op_type][1], "");
									//}, 3000);
									menu_init();
									
								}else{
									alert("續借完成，\n\n您目前已沒有"+mylib_num[op_type][0]+"資料。");
								}
							}
						});
			
					},
					onerror : function(e) {
						Ti.API.debug(e.error);
						alert('續借失敗。');
					},
					timeout : 10000
					});
					client.validatesSecureCertificate=false;
					client.open("GET", url);
					client.send();
					// while (client.readyState!=4) {}
				}catch(err_info){
					var msg = Ti.UI.createNotification({message:'續借失敗', duration:Ti.UI.NOTIFICATION_DURATION_SHORT});
					msg.show();
				}
			}
		}, 1000); //setTimeout
	}
}

function renew_all(op_type){
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(renew_all) 全部續借，類型為: "+op_type+"\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		
		common.getInfoData('LOAN',1);
		
		setTimeout(function(){
			my_lib_init();
		
			if (all_renew_array.length>0){
				try{
					var url = "https://www.lib.nchu.edu.tw/lib_api/php/appagent/index_get_2014.php?OP=Renew&UserToken="+Ti.App.Properties.getString('UserToken')+"&PID="+Ti.App.Properties.getString('PID')+"&RenewList=["+all_renew_array.toString()+"]";
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 全部續借api: " + url);
					var client = Ti.Network.createHTTPClient({
					onload : function(e) {
						// Ti.API.info("Received text: " + this.responseText);
						var all_data = JSON.parse(this.responseText);
						var RenewResult_data = JSON.parse(JSON.stringify(all_data.RenewResult));
					
						var return_string="";
						for( var i=0; i<RenewResult_data.Barcode.length; i++){
							return_string+="題名："+RenewResult_data.Title[i]+"\n"+"續借結果："+RenewResult_data.OpInfo[i]+"\n\n";
						}
		
						// 更新借閱清單
						my_lib_init();
			
						var dialog = Ti.UI.createAlertDialog({
							buttonNames: ['確定'],
							message: return_string,
							title: '續借結果'
						});
						dialog.show();
						dialog.addEventListener('click', function(e){
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 執行全部續借，重新繪製清單。");
							if (login_check(false)){
								if (mylib_num[op_type][1]>0){
									//setTimeout(function(){
										my_lib_list(op_type, mylib_num[op_type][0], mylib_num[op_type][1], "");
									//}, 3000);
									menu_init();
								}else{
									alert("續借完成，\n\n您目前已沒有"+mylib_num[op_type][0]+"資料。");
								}
							}
						});
					},
					onerror : function(e) {
						Ti.API.debug(e.error);
						alert('續借失敗。');
					},
					timeout : 10000
					});
					client.validatesSecureCertificate=false;
					client.open("GET", url);
					client.send();
				}catch(err_info){
					var msg = Ti.UI.createNotification({message:'續借失敗', duration:Ti.UI.NOTIFICATION_DURATION_SHORT});
					msg.show();
				}
				// while (client.readyState!=4) {}
			}else{
				alert("您目前沒有借閱項目。");
			}
		}, 1000); //setTimeout
	}
}


// 館藏查詢 ==================================================================================================== start
function isbn_query(){	// 館藏查詢/ISBN掃描查詢
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(isbn_query) ISBN掃描查詢\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		$.drawer.toggleLeftWindow();
		var scanditsdk = require("com.mirasense.scanditsdk");
		picker = scanditsdk.createView({width: "100%", height: "80%"});  
		picker.init("cmvVACEnEeSH1Icj9AdIz+tKLQiLX2mvTbP+9GXFbp4", 0);
		var popup_window = Ti.UI.createWindow({layout:"vertical", backgroundColor:"#FFEECD", borderWidth:1, borderColor:"#555555", width:"80%", height:"80%"});
		var main_view = Ti.UI.createView({layout: "vertical", height: "100%", width: "100%",});
		main_view.add(picker);
		var button_view = Ti.UI.createView({layout: "horizontal", height: "20%", width: "100%",});
		var exit_button = Titanium.UI.createButton({title: '關閉Barcode掃描器', color: "#DDD", backgroundColor: "#000", borderRadius:4, borderWidth:1, borderColor:"#FFFFFF", width: "85%", height: "100%", font: {fontSize: fs_h2, fontWeight: 'bold'}	});
		var info_button = Titanium.UI.createButton({title: '？', color: "#DDD", backgroundColor: "#000", borderRadius:4, borderWidth:1, borderColor:"#FFFFFF", width: "15%", height: "100%", font: {fontSize: fs_h1, fontWeight: 'bold'}	});
		exit_button.addEventListener('click',function(e){
	        picker.stopScanning();
	        popup_window.remove(picker);
	        popup_window.close();
		});
		info_button.addEventListener('click',function(e){
			var info_dialog = Ti.UI.createAlertDialog({
				cancel:0, buttonNames: ['確認'],	message:'\n使用手機掃描書籍封底的 ISBN 條碼，即可查詢本館是否有此藏書。\n',	title:'ISBN條碼查詢'
			});
			info_dialog.show();
		});
		button_view.add(exit_button);
		button_view.add(info_button);
		main_view.add(button_view);
		popup_window.add(main_view);
		popup_window.open({ modal : true });
		picker.disableStandbyState(); 
		picker.setTorchEnabled(false);  
		picker.setCameraSwitchVisibility(0);  
		picker.setViewfinderSize(0.6,0.6,0.6,0.6);
		picker.showSearchBar(true);
	
		picker.setSuccessCallback(function(e) {  
		    // Ti.API.info("＃＃＃＃　NCHULIB-APP: success (" + e.symbology + "): " + e.barcode);
			var isbn10 = common.ISBN13toISBN10(e.barcode);
			var isbn13 = e.barcode;
		    var url = "https://www.lib.nchu.edu.tw/lib_api/php/appagent/isbn_get_bib.php?isbn10="+isbn10+"&isbn13="+isbn13;
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: isbn_get_bib url: "+url);
			var xhr = Ti.Network.createHTTPClient({
				onload : function(e) {
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: Received text: " + this.responseText);
					if (this.responseText){
						json = JSON.parse(this.responseText);
						
				        picker.stopScanning();
						popup_window.removeAllChildren();
		
						var bib_head = Ti.UI.createLabel({
							text:"本館有該筆館藏，資訊如下:", font:{fontSize:fs_h2+"sp",fontWeight:"bold"}, backgroundColor:"#26A095", borderColor:"#555555", color:"#000000", top:0, width:"100%", height:(fs_h2*3)+"dp", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER
						});
						popup_window.add(bib_head);
							
						var bib_view = Ti.UI.createView({
							layout: "vertical",	height:"100%", width:"100%"
						});
						var bib_title = Ti.UI.createLabel({
							text: "題名："+json.Z13_TITLE, font: {fontSize: fs}, color:"#000000", top:15+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT
						});
						bib_view.add(bib_title);
				
						var bib_author = Ti.UI.createLabel({
							text: "作者："+json.Z13_AUTHOR, font: {fontSize: fs},	color:"#000000", top:5+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT
						});
						bib_view.add(bib_author);
		
						var bib_imprint = Ti.UI.createLabel({
							text: "出版社："+json.Z13_IMPRINT, font: {fontSize: fs}, color:"#000000", top:5+'dp', width:"90%",	textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT
						});
						bib_view.add(bib_imprint);
			
						var bib_call_no = Ti.UI.createLabel({
							text: "索書號："+json.Z13_CALL_NO,	font: {fontSize: fs}, color:"#000000", top:5+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT
						});
						bib_view.add(bib_call_no);
						
						var bib_check_aleph = Ti.UI.createLabel({
							text: "查詢館藏狀況",	font: {fontSize: fs}, color:"#0000FF", top:5+'dp', width:"90%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT
						});
						bib_view.add(bib_check_aleph);
						bib_check_aleph.addEventListener('click', function(e){
							Titanium.Platform.openURL("http://webpac.lib.nchu.edu.tw/F?func=find-b&local_base=TOP02&adjacent=1&find_code=ISBN&request="+isbn13);
						});
		
						var bib_cover = Ti.UI.createImageView({
							image: "http://static.findbook.tw/image/book/"+json.Z13_ISBN_ISSN+"/large", top:15+'dp', width:'150dp', height:'200dp', borderWidth:1, borderColor:"#555555"
						});
						bib_view.add(bib_cover);
						
						var close_button_bib = Ti.UI.createButton({
							title:"關閉本視窗", font:{fontSize:fs_h2+'sp',fontWeight:"bold"}, borderRadius:4, color:"#DDD", backgroundColor:"#000",	top:20+'dp', bottom:0, height:(fs_h2*4)+"dp", width:"100%"
						});
						bib_view.add(close_button_bib);
		 					
						popup_window.add(bib_view);
							
						close_button_bib.addEventListener('click', function(e) {
								popup_window.close();
						});
					}else{
						alert("圖書館查無此館藏資料");
					}
				},
				onerror : function(e) {
					Ti.API.debug(e.error);
	 			},
	 			timeout : 5000
	 		});
	 		xhr.validatesSecureCertificate=false;
	 		xhr.open("GET", url);
			xhr.send();
			// while (xhr.readyState!=4) {}
		});  
	  
		picker.setCancelCallback(function(e) {  
		    closeScanner();  
		});
	}
}


function bibquery_loanrank(){	// 館藏查詢/借閱排行榜
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(bibquery_loanrank) 借閱排行榜\n--------------------------------------------------------------------------\n");
	
	clear_view();
	open_url("館藏查詢/借閱排行榜","https://wwww.lib.nchu.edu.tw/index.php/libpubservice/bookrank?showtype=app");
	$.drawer.toggleLeftWindow();
}
// 館藏查詢 ==================================================================================================== end


// 個人化設定 ==================================================================================================== start
function notification_select(){	// 個人化設定/通知功能開關
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(notification_select) 通知功能開關\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		clear_view();
		$.drawer.toggleRightWindow();
		$.main_header_title.text="通知功能開關";
		
		var main_view = Ti.UI.createView({
			layout: "vertical",
			height: "100%",
			width: "80%",
		});
		var description_view = Ti.UI.createView({
			top: (sHeight*0.03)+'dp',
			bottom: (sHeight*0.01)+'dp',
			layout: "horizontal",
			width: "100%",
			height: Ti.UI.SIZE,
		});
		var description_label = Ti.UI.createLabel({
			text: "請選擇允許本程式通知您的資料類型:",
			width:"auto",
			color: "#333",
		    font: {fontSize: fs_h2+'sp'}
		});
		description_view.add(description_label);
		main_view.add(description_view);
	
	
		var sql_string = "SELECT InfoType, NotificationCheck FROM APP_tab_Data WHERE InfoType<>'REQUEST';";
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 資料檢查sql: "+sql_string);
	
		var rs = NchuLibdb.execute(sql_string);
		var notification_array=[];
		while(rs.isValidRow()){
			var show_string = "";
			switch(rs.fieldByName('InfoType')){
	 		case "NormalNews":
	 			show_string = "最新消息";
				break;
	 		case "NewBibs":
	 			show_string = "新書通報";
				break;
	 		case "LOAN":
	 			show_string = "借閱通知";
				break;
			}
			var item_view = Ti.UI.createView({
				top: (sHeight*0.01)+'dp',
				layout: "horizontal",
				width: "80%",
				height: (fs*3)+'dp'
			});
			
			notification_array[rs.fieldByName('InfoType')]=rs.fieldByName('NotificationCheck');
			// Ti.API.info("＃＃＃＃　NCHULIB-APP: notification_array["+rs.fieldByName('InfoType')+"]: "+notification_array[rs.fieldByName('InfoType')]);
	
			if (rs.fieldByName('NotificationCheck')=='1'){
			    var var_backgroundColor = '#A4C722';
			    var var_title='\u2713';
			    var var_value = true;
			} else {
			    var var_backgroundColor = '#BBB';
			    var var_title='';
			    var var_value = false;
			}
			
			var checkbox = Ti.UI.createButton({
				InfoType: rs.fieldByName('InfoType'),
				title: var_title,
				show_string: show_string,
				width: (fs*2)+'dp',
				height: (fs*2)+'dp',
				borderColor: '#555',
				borderWidth: 1,
				borderRadius: 2,
				backgroundColor: var_backgroundColor,
				backgroundImage: 'none',
				color: '#fff',
				font:{fontSize: fs+'sp', fontWeight: 'bold'},
				value: var_value 
			});
			 
			item_view.add(checkbox);
			 
			checkbox.addEventListener('click', function(e) {
				var e_checkbox = e;
			    if(false == e.source.value) {
			    	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 勾選"+e.source.show_string);
				    this.backgroundColor = '#A4C722';
				    this.title='\u2713';
				    this.value = true;
				    notification_array[this.InfoType]='1';
			    } else {
			    	
					var dialog = Ti.UI.createAlertDialog({
						cancel:0, buttonNames:['否','是'], message:'\n請問您是否要取消「'+e.source.show_string+'」通知?\n\n取消後您將不會收到該類訊息的即時通知。\n', title:'變更確認'
					});
					dialog.addEventListener('click', function(e){
						if (e.index === 1){
						    e_checkbox.source.backgroundColor = '#BBB';
						    e_checkbox.source.title='';
						    e_checkbox.source.value = false;
						    notification_array[e_checkbox.source.InfoType]='0';
						    // Ti.API.info("＃＃＃＃　NCHULIB-APP: 取消勾選"+e_checkbox.source.show_string);							
						}
					});
					dialog.show();

				}
				// Ti.API.info("＃＃＃＃　NCHULIB-APP: notification_array["+this.InfoType+"]: "+notification_array[this.InfoType]);
			});
	
			var row_label = Ti.UI.createLabel({
				text: " "+show_string,
				width: "80%",
				height: (fs*2)+'dp',
				color: "#333",
				font: {fontSize: fs_h2+'sp'},
				textAlign: "left",
			});
			item_view.add(row_label);
			main_view.add(item_view);
			rs.next();
		}
		rs.close();

		var submit_button = Titanium.UI.createButton({
			title: '變　更　設　定',
			top: sHeight*0.04+'dp',
			color: "#DDD",
			backgroundColor: "#000",
			borderRadius:2,
			width: "100%",
			height:(fs_h2*3)+"dp",
			font: {fontSize: fs_h2+'sp', fontWeight: 'bold'}
		});
		
		submit_button.addEventListener('click',function(e){
			try{
				for (var key in notification_array) {
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: notification_array["+key+"]: "+notification_array[key]);
					//更新載具端資料庫
				   	NchuLibdb.execute("UPDATE APP_tab_Data SET NotificationCheck='"+notification_array[key]+"' WHERE InfoType='"+key+"';");
					
					//回傳設定資料到Agent
					var url="https://www.lib.nchu.edu.tw/lib_api/php/appagent/index_get_2014.php?OP=SetNotification&UserToken="+Ti.App.Properties.getString('UserToken')+"&InfoType="+key+"&OnOff="+notification_array[key]; 
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 回傳使用者通知資訊到Agent進行設定url: "+url);
					var xhr = Ti.Network.createHTTPClient({
						onload : function(e) {
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者通知資訊異動成功!");
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者通知資訊異動成功後回傳的資料: "+this.responseText);
							// json = JSON.parse(this.responseText);
						},
						onerror : function(e) {
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者通知資訊異動失敗!"+e.error);
			 			},
			 			timeout : 10000
			 		});
			 		xhr.validatesSecureCertificate=false;
			 		xhr.open("GET", url);
					xhr.send();
					// while (xhr.readyState!=4) {}
				}
				alert('已完成通知功能開關異動。');
				setTimeout(function(){
					main_page_init();
				}, 1000); //setTimeout
			}catch(err_info){
				// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者通知資訊異動失敗!  "+err_info);
				alert('通知功能開關異動失敗。');
			}
		});

		main_view.add(submit_button);
		$.main_page.add(main_view);
	}
}

function personal_login(Position){	// 個人化設定/讀者帳號登入
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(personal_login) 讀者帳號登入\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		clear_view();
		$.main_header_title.text="讀者帳號登入";
		
		if(Position=='Left'){
			$.drawer.toggleLeftWindow();
		}else if(Position=='Right'){
			$.drawer.toggleRightWindow();
		}
		
		var main_view = Ti.UI.createView({layout:"vertical", height:"100%", width:"100%"});

		var account_view = Ti.UI.createView({top:sHeight*0.02, layout:"horizontal", width:"80%",	height:Ti.UI.SIZE});
		var account_label = Ti.UI.createLabel({text:"帳號: ", width:"auto", color:"#333", font:{fontSize:fs+'sp', fontWeight:'bold'}});
		account_view.add(account_label);
		
		var account_TextField = Titanium.UI.createTextField({
			// borderStyle: Ti.UI.INPUT_BORDERSTYLE_BEZEL,
			// borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			// borderColor: "#333", 
			keyboardType:Titanium.UI.KEYBOARD_EMAIL, id:"account", width:"80%",	height:"auto", color:"#333", borderColor:'#777', backgroundColor:'#BBB', font:{fontSize: fs+'sp'}, textAlign:"left", hintText:"單一簽入系統帳號"
		});
		account_TextField.addEventListener('focus', function(e){this.borderColor='#777'; this.backgroundColor='#BBB';});
		account_TextField.addEventListener('blur', function(e){this.borderColor='#DDD'; this.backgroundColor='#DDD';});
		account_view.add(account_TextField);
		main_view.add(account_view);
	
		var pwd_view = Ti.UI.createView({top:sHeight*0.01, layout:"horizontal", width:"80%", height:Ti.UI.SIZE});
		var pwd_label = Ti.UI.createLabel({text:"密碼: ", width:"auto", color:"#333", font:{fontSize:fs+'sp', fontWeight:'bold'}});
		pwd_view.add(pwd_label);
		var pwd_TextField = Titanium.UI.createTextField({
			// borderStyle: Ti.UI.INPUT_BORDERSTYLE_BEZEL,
			// borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			keyboardType:Titanium.UI.KEYBOARD_EMAIL, id:"pwd", width:"80%", height:"auto", color:"#333", backgroundColor:'#DDD', font:{fontSize:fs+'sp'}, textAlign:"left",	hintText:"密碼", passwordMask:true
		});
		pwd_TextField.addEventListener('focus', function(e){this.borderColor='#777'; this.backgroundColor='#BBB';});
		pwd_TextField.addEventListener('blur', function(e){this.borderColor='#DDD'; this.backgroundColor='#DDD';});
		pwd_view.add(pwd_TextField);
		
		main_view.add(pwd_view);
		//account_TextField.focus();
		
		var login_description_label = Ti.UI.createLabel({
			text:"1.「帳號」為學生證(10碼)、服務證(職員編號)或圖書館借書證的條碼號。\n2.「密碼」與學校單一簽入網站相同，系統預設為「身階證字號末4碼+出生月日4碼」(預設密碼共8碼數字)。",
			top:sHeight*0.01, color:"#333", width:"80%", font:{fontSize:(fs-2)+'sp'}
		});
		main_view.add(login_description_label);
		
		var use_agree_view = Ti.UI.createView({top:sHeight*0.02, layout:"horizontal", width:"80%", height:Ti.UI.SIZE});
		var use_agree_checkbox = Ti.UI.createButton({title:'', width:(fs*1.8)+'dp', height:(fs*1.8)+'dp', borderColor:'#555', borderWidth:1, borderRadius:2, backgroundColor:'#BBB', backgroundImage:'none',color:'#fff', font:{fontSize:fs+'sp', fontWeight:'bold'},value:false});
		use_agree_checkbox.addEventListener('click', function(e) {
		    if(false == e.source.value) {
			    this.backgroundColor='#A4C722'; this.title='\u2713'; this.value=true;
		    }else{
			    this.backgroundColor='#BBB'; this.title=''; this.value=false;
			}
		});
		
		var use_agree_label = Ti.UI.createLabel({text:"　同意讀者使用條款　", width:"auto", color:"#333", font:{fontSize:fs_h2+'sp'}});
		
		use_agree_checkbox.addEventListener('click', function(e){
		    use_agree_checkbox.backgroundColor='#A4C722'; use_agree_checkbox.title='\u2713'; use_agree_checkbox.value=true;
			var use_agree_dialog = Ti.UI.createAlertDialog({
				cancel: 0,
				buttonNames: ['不同意','同意'],
				message: '\n一、本服務係以APP通知方式「提醒」讀者有關借還書資料作業之訊息，包括即將到期通知(到期前7,3,1天)、逾期通知(逾期第1,3,7天及之後每日)及預約書到館通知。\n二、提醒您APP通知係為圖書館之提醒服務，讀者仍應經常查詢個人借閱狀況，以維護個人借書權益，並不得以未接獲推播通知作為減免逾期滯還金之理由。\n三、若登出讀者帳號將無法接收到借還書資料作業之各項推播通知。。\n',
				title: '中興大學圖書館 APP使用條款'
			});
			use_agree_dialog.show();
			
			use_agree_dialog.addEventListener('click', function(e){
				if (e.index === 1){
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 使用者點選同意使用條款，進行讀者帳密認證。");
				    use_agree_checkbox.backgroundColor='#A4C722'; use_agree_checkbox.title='\u2713'; use_agree_checkbox.value=true;
				}else{
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 使用者點選不同意使用條款。");
					use_agree_checkbox.value=false; use_agree_checkbox.backgroundColor='#BBB'; use_agree_checkbox.title=''; use_agree_checkbox.value = false;
				}
			});
		});
		
		use_agree_label.addEventListener('click', function(e){
		    use_agree_checkbox.backgroundColor='#A4C722'; use_agree_checkbox.title='\u2713'; use_agree_checkbox.value=true;
			var use_agree_dialog = Ti.UI.createAlertDialog({
				cancel: 0,
				buttonNames: ['不同意','同意'],
				message: '\n一、本服務係以APP通知方式「提醒」讀者有關借還書資料作業之訊息，包括即將到期通知(到期前7,3,1天)、逾期通知(逾期第1,3,7天及之後每日)及預約書到館通知。\n二、提醒您APP通知係為圖書館之提醒服務，讀者仍應經常查詢個人借閱狀況，以維護個人借書權益，並不得以未接獲推播通知作為減免逾期滯還金之理由。\n三、若登出讀者帳號將無法接收到借還書資料作業之各項推播通知。。\n',
				title: '中興大學圖書館 APP使用條款'
			});
			use_agree_dialog.show();
			
			use_agree_dialog.addEventListener('click', function(e){
				if (e.index === 1){
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 使用者點選同意使用條款，進行讀者帳密認證。");
				    use_agree_checkbox.backgroundColor='#A4C722'; use_agree_checkbox.title='\u2713'; use_agree_checkbox.value=true;
				}else{
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 使用者點選不同意使用條款。");
					use_agree_checkbox.value=false; use_agree_checkbox.backgroundColor='#BBB'; use_agree_checkbox.title=''; use_agree_checkbox.value=false;
				}
			});
		});
		
		use_agree_view.add(use_agree_checkbox);
		use_agree_view.add(use_agree_label);
		main_view.add(use_agree_view);
		
		function AccAuth(sid, pwd){
			try{
				//回傳使用者資料到Agent進行讀者帳密認證
				var url = "https://www.lib.nchu.edu.tw/lib_api/php/appagent/index_get_2014.php?OP=AccAuth&UserToken="+Ti.App.Properties.getString('UserToken')+"&SID="+sid+"&PWD="+pwd;
				// Ti.API.info("＃＃＃＃　NCHULIB-APP: Agent帳密認證url: "+url);
				var xhr = Ti.Network.createHTTPClient({
					onload : function(e) {
						// Ti.API.info("＃＃＃＃　NCHULIB-APP: 回傳資料: " + this.responseText);
						json = JSON.parse(this.responseText);
						
						if(json.Status.AuthResult=='Success'){
							Ti.App.Properties.setString('PID', json.PatronInfo.PID);
							var sql_string = "UPDATE APP_tab_User SET PID='"+json.PatronInfo.PID+"', PatronBarCode='"+json.PatronInfo.PatronBarCode+"', BorStatus='"+json.PatronInfo.BorStatus+"', BorType='"+json.PatronInfo.BorType+"' WHERE UserToken='"+Ti.App.Properties.getString('UserToken')+"';";
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 寫入載具端讀者認證資料sql_string: "+sql_string);
							NchuLibdb.execute(sql_string);
	
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者資料註冊成功，將讀者資料回寫至載具端資料庫!");
							var success_dialog = Ti.UI.createAlertDialog({
								cancel: 0,
								buttonNames: ['確認'],
								message: '\n您已成功完成身分認證。\n',
								title: '讀者帳密認證成功'
							});
		
							success_dialog.addEventListener('click', function(e){
								if (e.index === 0){
									setTimeout(function(){
										Ti.App.Properties.setInt('UseTimes', Ti.App.Properties.getInt('UseTimes')+1);
										main_page_init();
										menu_init();
									}, 1500); //setTimeout
								}
							});
							success_dialog.show();
						}else{
							login_button.enabled = true;
							login_button.title = "登　　入";
							var error_dialog = Ti.UI.createAlertDialog({
								cancel: 0,
								buttonNames: ['確認'],
								message: '\n抱歉，您的身分認證失敗，請您再次確認帳號密碼資料。\n',
								title: '讀者帳密認證失敗'
							});
							error_dialog.show();
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者認證失敗!");
						}
					},
					onerror : function(e) {
						common.error_alert("network", "身分認證");
		 			},
		 			timeout : 10000
		 		});
		 		xhr.validatesSecureCertificate=false;
		 		xhr.open("GET", url);
				xhr.send();
				//while (xhr.readyState!=4) {}
			}catch(err_info){
				// Ti.API.info("＃＃＃＃　NCHULIB-APP: 載具端讀者認證資料寫入異常!"+err_info);
			}
		}
		
		var login_button = Titanium.UI.createButton({
			title:'登　　入', top:(sHeight*0.02)+'dp', color:"#DDD", backgroundColor:"#000", borderRadius:2, width:"80%", height:(fs_h2*3)+"dp", font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
		});
		
		login_button.addEventListener('click',function(e){
			if(use_agree_checkbox.value == true){
				login_button.enabled = false;
				login_button.title = "讀者帳號登入中…";
				AccAuth(account_TextField.value, pwd_TextField.value);
			}else{
				alert("\n抱歉，您必須先同意使用條款後才能進行讀者身分認證。\n");
			}
		});
		main_view.add(login_button);
		
		$.main_page.add(main_view);
	}
}

function personal_logout(){	// 個人化設定/讀者帳號登出
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(personal_logout) 讀者帳號登出\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		$.drawer.toggleRightWindow();
		
		var PatronBarCode = '';
		var rs = NchuLibdb.execute("SELECT PatronBarCode FROM APP_tab_User;");
		if (rs.isValidRow()){
			PatronBarCode = rs.fieldByName('PatronBarCode');
		}
		rs.close();
	
		var dialog = Ti.UI.createAlertDialog({
			cancel:0, buttonNames:['否','是'], message:'\n請問您是否要登出讀者帳號('+PatronBarCode+')?\n\n登出後將無法取得個人借閱資訊及通知。\n', title:'讀者帳號登出確認'
		});
		dialog.addEventListener('click', function(e){
			if (e.index === 1){
				try{
					//回傳使用者資料到Agent進行讀者登出
					var url = "https://www.lib.nchu.edu.tw/lib_api/php/appagent/index_get_2014.php?OP=AccLogout&UserToken="+Ti.App.Properties.getString('UserToken')+"&PID="+Ti.App.Properties.getString('PID');
			
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: Agent讀者登出url: "+url);
					var xhr = Ti.Network.createHTTPClient({
						onload : function(e) {
							// Ti.API.info("＃＃＃＃　NCHULIB-APP: 回傳資料: " + this.responseText);
							json = JSON.parse(this.responseText);
							
							if(json.Status.AuthResult=='Success'){
								var sql_string = "UPDATE APP_tab_User SET PID='', PatronBarCode='', BorStatus='', BorType='' WHERE UserToken='"+Ti.App.Properties.getString('UserToken')+"';";
								// Ti.API.info("＃＃＃＃　NCHULIB-APP: 清除載具端讀者認證資料sql_string: "+sql_string);
								NchuLibdb.execute(sql_string);
								Ti.App.Properties.setString('PID', "");
	
							   	// 刪除讀者借閱通知資訊
							   	NchuLibdb.execute("DELETE FROM APP_tab_Data WHERE InfoType IN ('LOAN','REQUEST');");
								
								// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者帳號登出成功，清除載具端讀者讀者資料");
								var success_dialog = Ti.UI.createAlertDialog({
									cancel:0, buttonNames:['確認'], message: '\n您已成功完成讀者帳號登出。\n', title:'讀者帳號登出成功'
								});
								success_dialog.addEventListener('click', function(e){main_page_init();});
								success_dialog.show();
							}else{
								var error_dialog = Ti.UI.createAlertDialog({
									cancel:0, buttonNames:['確認'], message:'\n抱歉，您的讀者帳號登出失敗。\n', title:'讀者帳號登出失敗'
								});
								error_dialog.show();
								// Ti.API.info("＃＃＃＃　NCHULIB-APP: 伺服器端讀者帳號登出失敗!");
							}
						},
						onerror : function(e) {
							common.error_alert("network", "讀者帳號登出");
			 			},
			 			timeout : 10000
			 		});
			 		xhr.validatesSecureCertificate=false;
			 		xhr.open("GET", url);
					xhr.send();
					// while (xhr.readyState!=4) {}
				}catch(err_info){
					// Ti.API.info("＃＃＃＃　NCHULIB-APP: 載具端清除讀者帳號資料寫入異常!"+err_info);
				}
			}
		});
		dialog.show();
	}
}
// 個人化設定 ==================================================================================================== end


// 程式設定 ==================================================================================================== start
function about_app(){	// 程式設定/關於本程式
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(about_app) 關於本程式\n--------------------------------------------------------------------------\n");
	
	clear_view();
	$.drawer.toggleRightWindow();
	$.main_header_title.text="關於本程式";
	
	var main_view = Ti.UI.createScrollView({
		layout:"vertical", height: "100%", width:"80%"
	});
	var label = Ti.UI.createLabel({
	    text:"　　為提高圖書館服務的行動性，我們將陸續推出適用於不同行動載具的應用程式app，提供讀者更便利的圖書館行動服務。\n\n"+
	    "　　借閱資料訊息app(Android版本)於103年4月17日正式上架，提供教職員工生利用智慧型手機，輕鬆快速地獲得借閱資料相關訊息及推播通知，包括借閱資料即將到期、逾期、預約書到館通知。收到即將到期通知的同時，亦可立即進行續借功能。並可查詢借閱紀錄，連結圖書館首頁及圖書館的臉書。\n\n"+
	    "　　圖書館於103年11月推出進階版app，除原有個人借閱紀錄查詢及推播通知功能外，另新增最新消息推播通知、關鍵字及掃描ISBN查詢館藏、瀏覽最新消息、館訊、新書通報、借閱排行榜、開閉館時間、各樓層說明等訊息，歡迎您多加利用。",
	    top:sHeight*0.03+'dp', width:"100%", color:"#333", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT, font:{fontSize:fs+'sp'}
	});
	main_view.add(label);
	
	var label = Ti.UI.createLabel({
	    text:"本應用程式由圖書館app團隊開發\n版本 v"+Titanium.App.version+"\n\n",
	    top:sHeight*0.03+'dp', width:"100%", color:"#333", textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT, font:{fontSize:fs+'sp'}
	});
	main_view.add(label);
	
	$.main_page.add(main_view);
}

function use_guide(Position){	// 程式設定/操作說明
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(use_guide) 操作說明\n--------------------------------------------------------------------------\n");
	
	if(Position=='Left'){
		$.drawer.toggleLeftWindow();
	}else if(Position=='Right'){
		$.drawer.toggleRightWindow();
	}

	var guide_touch_counter = 0;
	var guide_window = Ti.UI.createWindow({width:"100%", height:"100%", navBarHidden:true});
	
	var guide_view = Ti.UI.createView({height:"100%", width:"100%"});
	guide_window.add(guide_view);
	
	var guide_info_1 = Ti.UI.createLabel({
		text:"\n感謝您的安裝使用\n\n為您介紹本程式的主要操作模式\n\n(請輕觸畫面)\n",
		color:"#FFF",backgroundColor:"#000", top:"10%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER,	font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
	});
	guide_view.add(guide_info_1);
	
	var guide_info_2 = Ti.UI.createLabel({
		text:"\n為簡化版面、呈現更多資訊\n\n本程式所有的資訊皆呈現於中央主畫面\n",
		color:"#FFF", backgroundColor:"#000", top:"20%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
	});
		
	var guide_info_3 = Ti.UI.createLabel({
		text:"\n　－－－－－－－－＞－－＞＞－＞＞＞\n\n　但當您由左向右滑動螢幕時\n\n　可帶出位於左側的一般性功能選單\n",
		color:"#FFF", backgroundColor:"#000", top:"30%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT,	font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
	});
	
	var guide_info_4 = Ti.UI.createLabel({
		text:"\n＜＜＜－＜＜－－＜－－－－－－－－　\n\n由右向左滑動螢幕時　\n\n可帶出位於右側的個人化及設定選單　\n",
		color:"#FFF", backgroundColor:"#000", top:"40%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT, font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
	});
	
	var guide_info_5 = Ti.UI.createLabel({
		text:"\n一切就是這麼地簡單使用\n\n\n現在\n\n就請您點選擊畫面任意處開始使用吧!\n",
		color:"#FFF", backgroundColor:"#000", top:"10%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, font:{fontSize:fs_h2+'sp', fontWeight:'bold'}
	});

	var guide_info_6 = Ti.UI.createLabel({
		text:"\n國立中興大學圖書館\n",
		color:"#FFF", backgroundColor:"#000", top:"50%", width:"100%", textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, font:{fontSize:fs_h1+'sp', fontWeight:'bold'}
	});

	var guide_info_7 = Ti.UI.createLabel({
		text:"\n感謝您的支持與愛護\n",
		color:"#FFF", backgroundColor: "#000", top:"65%", width:"100%",	textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, font:{fontSize:fs_h1+'sp', fontWeight:'bold'}
	});

	//Titanium.App.Properties.setBool("touch", false);
	function touchEnd(){
	    //Titanium.App.Properties.setBool("touch", true);
	    guide_touch_counter+=1;
	    if (guide_touch_counter==1) {
	    	guide_info_1.hide();
	    	guide_view.add(guide_info_2);
	    }else if (guide_touch_counter==2) {
	    	guide_info_2.hide();
			setTimeout(function(){$.drawer.toggleLeftWindow();}, 600);
	    	guide_view.add(guide_info_3);
	    }else if (guide_touch_counter==3) {
	    	guide_info_3.hide();
			setTimeout(function(){$.drawer.toggleRightWindow();}, 600);
	    	guide_view.add(guide_info_4);
	    }else if (guide_touch_counter==4) {
	    	guide_info_4.hide();
			setTimeout(function(){$.drawer.toggleLeftWindow();}, 800);
	    	guide_view.add(guide_info_5);
			setTimeout(function(){guide_view.add(guide_info_6);}, 1000);
			setTimeout(function(){guide_view.add(guide_info_7);}, 2000);
	    }else if (guide_touch_counter==5) {
	    	guide_info_5.hide();
	    	guide_info_6.hide();
	    	guide_window.close();
	    }
	}
	guide_window.addEventListener("touchend", touchEnd);
	guide_window.open({modal: true});
}

function feedback(){	// 程式設定/問題反應
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(feedback) 問題反應\n--------------------------------------------------------------------------\n");
	
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.subject = "中興大學圖書館APP使用意見反應";
		emailDialog.toRecipients = ["reflib@nchu.edu.tw"];
		emailDialog.ccRecipients = ["infdis316@gmail.com"];
		//emailDialog.bccRecipients = ["javanxu@nchu.edu.tw"];

		emailDialog.messageBody = "圖書館，您好!\n\n"+
		"我在使用圖書館APP時有遇到一些問題及建議，提供館方參考改進。\n\n"+
		"意見內容: \n\n\n"+
		"我的聯絡電話是:    (若希望圖書館電話回覆您請留電話)\n\n"+
		"=======================================\n"+
		"我所使用的載具資訊如下，供館方問題追蹤使用。(若不想提供可自行刪除)\n"+
		"#作業系統類型: "+Titanium.Platform.osname+"\n"+
		"#作業系統版本: "+Titanium.Platform.version+"\n"+
		"#手機廠牌: "+Titanium.Platform.manufacturer+"\n"+
		"#手機型號: "+Titanium.Platform.model+"\n"+
		"#語言別: "+Titanium.Locale.currentLocale+"\n"+
		"#解析度: "+sWidth+"x"+sHeight+"\n"+
		"#目前安裝的APP版本: "+Titanium.App.version+"\n"+		
		"========================================\n\n";
		emailDialog.open();
	}
}

function app_exit(){	// 程式設定/離開本程式
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(app_exit) 離開本程式\n--------------------------------------------------------------------------\n");
	
	var dialog = Ti.UI.createAlertDialog({
		cancel:0, buttonNames:['否','是'], message:'\n請問您是否要離開本程式?\n', title:'離開確認'
	});
	dialog.addEventListener('click', function(e){
		if (e.index === 1){
			var activity = Titanium.Android.currentActivity;
			activity.finish();
		}
	});
	dialog.show();
}
// 程式設定 ==================================================================================================== end


// Title Bar ==================================================================================================== start
function toggleLeftWindow(){	// 開啟左邊功能選單
	$.drawer.toggleLeftWindow();
}
function toggleRightWindow(){	// 開啟右邊功能選單
	$.drawer.toggleRightWindow();
}
// Title Bar ==================================================================================================== end


function get_data_list(Position, InfoType, var_header, var_num){	//取得清單資料
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(get_data_list) 取得"+var_header+"清單資料\n--------------------------------------------------------------------------\n");
	
	
	var sql_string = "SELECT InfoData FROM APP_tab_Data WHERE InfoType='"+InfoType+"' AND length(InfoData)>0;";
	// Ti.API.info("＃＃＃＃　NCHULIB-APP: 資料檢查sql: "+sql_string);
	
	var rs = NchuLibdb.execute(sql_string);
	if(rs.isValidRow()){
		if(Position=='Left'){
			$.drawer.toggleLeftWindow();
		}else if(Position=='Right'){
			$.drawer.toggleRightWindow();
		}
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 資料檢查: 有資料");
		if(Position){
			$.main_header_title.text=var_header;
			clear_view();
			var x = 0;
			var view_width = "100%";
			var tb_var = '0dp';
			var borderRadius_var = 0;
		}else{
			var x = 1;
			var view_width = "94%";
			var tb_var = (fh_append*2)+'dp';
			var borderRadius_var = 4;
		}
	
		var info_box = Titanium.UI.createView({
			top:tb_var, borderRadius:borderRadius_var, borderWidth:1, borderColor:"#BBB", backgroundColor:"#FFF", width:view_width,	height:Ti.UI.SIZE
		});
		
	   	var row = Ti.UI.createTableViewRow({height:"auto", backgroundColor:"#BBB"});
    	var data = [];
    	if(!Position){
			// title ============================================= start
		    var label = Ti.UI.createLabel({
		        text:var_header, left:10, top:(fh_append/1.2)+'dp', bottom:(fh_append/1.2)+'dp', color:"#333", font:{fontSize:fs_h2+'sp', fontWeight:'bold'},
		    });
		    row.add(label);
			data[0] = row;
			// title ============================================= end
    	}
    	
		// json = JSON.parse(decodeURIComponent(rs.fieldByName('InfoData')));
		json = JSON.parse(common.decodeUrlParameter(rs.fieldByName('InfoData')));
		var item_counter = json.title.length;
		if (item_counter>0){
			for (var i=0; i<item_counter; i++){
				var row_bg_color="#FFFFFF";
				if (i%2==1){row_bg_color="#EEE";}else{row_bg_color="#FFF";}
			    var row = Ti.UI.createTableViewRow({backgroundColor:row_bg_color, height:"auto"});
			    if(var_header=="最新消息"){
			    	var var_text="["+json.category[i]+"] - "+json.title[i];
			    }else{
			    	var var_text=json.title[i];
			    }
			    var label = Ti.UI.createLabel({
			        text:var_text, left:10, top:(fh_append/1.5)+'dp', bottom:(fh_append/1.5)+'dp', right:5, color:"#333", font:{fontSize:fs+'sp'}
			    });
			    row.add(label);
			    row.url=json.link[i];
			    data[x++] = row;
			    if (i>=var_num){break;}
			}
		    var tableview = Titanium.UI.createTableView({data:data, separatorColor: "#BBB"});
		    info_box.add(tableview);
		    
			tableview.addEventListener('click', function(e){
				if(e.row.url){
					Titanium.Platform.openURL(e.row.url);
				}
			});
			$.main_page.add(info_box);			
		}else{
			alert('\n抱歉，目前沒有'+var_header+'資料。\n');
		}
	}else{
		alert('\n抱歉，目前沒有'+var_header+'資料。\n');
		// Ti.API.info("＃＃＃＃　NCHULIB-APP: 資料檢查: 沒有資料");
	}
	rs.close();
	
	common.getInfoData(InfoType,0);
}

function open_url(Position, var_url, var_header){	// 開啟某網頁
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(open_url) 開啟"+var_header+"網頁\n--------------------------------------------------------------------------\n");
	if (common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
		if(Position){
			$.main_header_title.text=var_header;
			clear_view();
			var x = 0;
			var view_width = "100%";
			var tb_var = '0dp';
			var borderRadius_var = 0;
		}else{
			var x = 1;
			var view_width = "94%";
			var tb_var = (fh_append*2)+'dp';
			var borderRadius_var = 4;
		}
		
		var info_box = Titanium.UI.createView({
			top:tb_var, bottom:tb_var, borderRadius:borderRadius_var, borderWidth:1, borderColor:"#CCC", backgroundColor:"#FFF", width:view_width, height:Ti.UI.SIZE
		});
		
		var data = [];
		var row = Ti.UI.createTableViewRow({height:"auto", backgroundColor: "#CCC"});
		if(!Position){
			var label = Ti.UI.createLabel({
			    text:var_header, left:10, top:5, bottom:5, color:"#333", font:{fontSize:fs_h2, fontWeight:'bold'},
			});
			row.add(label);
			data[0] = row;
		}
	
		var tableview = Titanium.UI.createTableView({data:data, separatorColor: "#CCC"});
		info_box.add(tableview);
		$.main_page.add(info_box);
		
		var wb = Ti.UI.createWebView({url:var_url, bottom:5, borderRadius:4, borderWidth: 1, borderColor:"#CCC", width:"100%", height:"100%"});
		wb.scalesPageToFit = true;
		info_box.add(wb);
		$.main_page.add(info_box);
		
		if(Position=='Left'){
			$.drawer.toggleLeftWindow();
		}else if(Position=='Right'){
			$.drawer.toggleRightWindow();
		}
	}
}

function clear_view(){
	$.main_page.removeAllChildren();
}


function login_check(alert_flag) {
	Ti.API.info("--------------------------------------------------------------------------\n＃＃＃＃　NCHULIB-APP: 執行function(login_check) 檢查讀者身分是否已認證\n--------------------------------------------------------------------------\n");
	
	if (Ti.App.Properties.hasProperty('PID') && Ti.App.Properties.getString('PID').length>0){
		return true;			
	}else{
		if (alert_flag){		
			var dialog = Ti.UI.createAlertDialog({
				cancel: 0,
				buttonNames: ['否','是'],
				message: '\n本功能需要登入圖書館讀者帳密，\n\n請問您是否要進行登入作業?\n',
				title: '讀者登入認證'
			});
			dialog.addEventListener('click', function(e){
				if (e.index === 1 && common.check_net_state('您的行動載具目前無法連接網路，所以無法使用本功能。')){
					personal_login('Left'); menu_init();
				}
			});
			dialog.show();
		}
		return false;
	}
}