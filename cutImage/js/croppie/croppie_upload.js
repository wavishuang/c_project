/* 畫出modal */
var cr_modal =	'<div class="cr-modal">'+
					'<div class="cr-layer">'+
						'<span class="close">&times;</span>'+
						'<form id="crop_form" name="crop_form" enctype="multipart/form-data" accept-charset="utf-8">'+
							'<input type="hidden" id="x1"   name="x1" 	class="x1"   value="" />'+
							'<input type="hidden" id="y1"   name="y1"	class="y1"   value="" />'+
							'<input type="hidden" id="x2"   name="x2" 	class="x2"   value="" />'+
							'<input type="hidden" id="y2"   name="y2" 	class="y2"   value="" />'+
							'<input type="hidden" id="zoom" name="zoom" 	class="zoom" value="" />'+

							'<div style="width: 72px; overflow: hidden;">'+
								'<input type="file" id="userfile" name="userfile" accept="image/*" />'+
							'</div>'+

							'<div style="display: none;">'+
								'<input type="submit" id="crop_submit" value="上傳" />'+
							'</div>'+
						'</form>'+

						'<div id="crop-upload"></div>'+

						'<div class="crop-action-buttons" style="text-align: center;">'+
							'<button class="upload-result">裁切</button>'+
							'<button class="cr-cancel">取消</button>'+
						'</div>'+
					'</div>'+
				'</div>';


/* 
****** 圖片裁切 ******
cover_w: 外圍寬度
cover_h: 外為高度
inside_w: 裁切的寬度
inside_h: 裁切的高度
*/
var showRequest = function(){
	//swal('Send Before');
}

// 從server回傳的訊息
var showResponse = function(data){

	if( data.stat == 0 ){	// failure
		$("#upload_stat").html("<h3>上傳狀態</h3>上傳錯誤!!!<br />"+ data.msg);
	}
	else{					// success
		$("#upload_stat").html("<h3>上傳狀態</h3>上傳成功!!!<br />檔案名稱: "+ data.msg +"<br />座標: "+ data.points +"<br />縮放比: "+ data.zoom );
	}
}

function demoUpload(cover_w, cover_h, inside_w, inside_h, formObj) {
	var $uploadCrop;

	function readFile(input) {
 		if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	            $uploadCrop.croppie('bind', {
	            	url: e.target.result
	            });
	            $('#crop-upload').addClass('ready');
	        }
	        reader.readAsDataURL(input.files[0]);
	    }
	    else {
		    swal("Sorry - you're browser doesn't support the FileReader API");
		}
	}

	$uploadCrop = $('#crop-upload').croppie({
		viewport: {
			width: inside_w,
			height: inside_h
		},
		boundary: {
			width: cover_w,
			height: cover_h
		},
		exif: true,
		update: function($uploadCrop){
			formObj.find(".x1").val($uploadCrop.points[0]);
			formObj.find(".y1").val($uploadCrop.points[1]);
			formObj.find(".x2").val($uploadCrop.points[2]);
			formObj.find(".y2").val($uploadCrop.points[3]);
			formObj.find(".zoom").val($uploadCrop.zoom);
		}
	});

	// 當檔案改變時
	$('#userfile').on('change', function () { readFile(this); });

	$('.upload-result').on('click', function (ev) {
		$uploadCrop.croppie('result', {
			type: 'canvas',
			size: 'viewport'
		}).then(function (resp) {
			popupResult({
				src: resp
			});
		});
	});

	var options = {
		beforeSubmit: 	showRequest,		// 提交前
		success: 		showResponse,		// 提交後
		// 另外的一些屬性:
		url: '/index.php/upload/do_upload',	// 預設是 form 的 action, 如果寫的話, 會覆蓋 form 的 action
		type: 'post', 						// 預設是form的method，如果寫的話，會覆蓋from的method.('get' or 'post').
		dataType: 'json',					// 'xml', 'script', or 'json' (接受服務端返回的類型.) 
		clearForm: true,					// 成功提交後，清除所有的表單元素的值.
		resetForm: true,					// 成功提交後，重置所有的表單元素的值.
	}

	$("#crop_form").ajaxForm(options);
}

/* Pop Up 視窗, 裁切後的圖 */
function popupResult(result) {
	var html;
	if (result.html) {
		html = result.html;
	}

	if (result.src) {
		html = '<img src="' + result.src + '" />';
	}

	swal({
		title: '',
		html: true,
		text: html,
		showCancelButton: true,
		allowOutsideClick: true
	},
	function(isConfirm){
		if(isConfirm){
			// 送出處理, 裁切後處理寫在這裡.....

			var sendData = {
				x1: $("#x1").val(),
				y1: $("#y1").val(),
				x2: $("#x2").val(),
				y2: $("#y2").val(),
				zoom: $("#zoom").val(),
				imgBase64: result.src
			}

			// alert( sendData );

			$(".cr-modal .close").click();
			$("#processImg").empty().append("<img src='"+ result.src +"' />" );
			$("#crop_form").submit();
		}
	});

	setTimeout(function(){
		$('.sweet-alert').css('margin', function() {
			var top = -1 * ($(this).height() / 2),
				left = -1 * ($(this).width() / 2);

			return top + 'px 0 0 ' + left + 'px';
		});
	}, 1);
}


// ======================= 程式開始 =========================
$(document).ready(function(){

	$("body").append(cr_modal);

	// Init 裁切圖片套件
	var thisForm = $("#crop_form");	// 傳入要上傳的form Object
	demoUpload(520, 315, 470, 265, thisForm);

	// 開啟 modal
	$("#open").on("click", function(e){
		$(".cr-modal").show();
	})

	// 關閉 modal ( 取消 & X )
	$(".cr-modal .close, .cr-modal .cr-cancel").on("click", function(e){
		$(".cr-modal").find(".cr-image").attr("src", "");
		e.preventDefault();
		$(".cr-modal").hide();
	});
});

