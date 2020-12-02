var main = document.querySelector('main');
var scrolly = main.querySelector('#scrolly');
var figure = scrolly.querySelector('figure');
var article = scrolly.querySelector('article');
var step = article.querySelectorAll('.step');
var currentDistrict = 'none';
var currentType = 'today';
var dataLoaded = false;

var scroller = scrollama();

function handleResize() {
	scroller.resize();
}

function convertRemToPixels(rem) {    
	return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function statistics() {
	var data = ddj.data.get();
	if (data) {
		var districts = ['01','02','03','04','05','06','07','08','09','10','11','12',''];

		for (d = 0; d < districts.length; ++d) {
			var district = districts[d];
			var valueCount = 0;
			var AktuelleBandbreite = 0;
			var cAktuelleBandbreite = 0;
			var cAktuelleBandbreite16 = 0;
			var TelekomDownload = 0;
			var cTelekomDownload = 0;
			var TelekomUpload = 0;
			var cTelekomUpload = 0;
			var cTelekomLTE = 0;
			console.log('->', district);

			for (v = 0; v < data.length; ++v) {
				var value = data[v];

				if (value.BSN.indexOf(district) === 0) {
					++valueCount;
					
					var vAktuelleBandbreite = parseInt(value.AktuelleBandbreite, 10);
					if (!isNaN(vAktuelleBandbreite)) {
						AktuelleBandbreite += vAktuelleBandbreite;
						++cAktuelleBandbreite;
						if (vAktuelleBandbreite <= 16) {
							++cAktuelleBandbreite16;
						}
					}

					var vTelekomDownload = parseInt(value.TelekomDownload, 10);
					if (!isNaN(vTelekomDownload)) {
						TelekomDownload += vTelekomDownload;
						++cTelekomDownload;
					}

					var vTelekomUpload = parseInt(value.TelekomUpload, 10);
					if (!isNaN(vTelekomUpload)) {
						TelekomUpload += vTelekomUpload;
						++cTelekomUpload;
					}

					var vTelekomLTE = parseInt(value.TelekomLTE, 10);
					if (!isNaN(vTelekomLTE)) {
						++cTelekomLTE;
					}
				}
			}

			console.log('schools:', valueCount);
			console.log('AktuelleBandbreite:', AktuelleBandbreite,'/',cAktuelleBandbreite,'=',parseInt(AktuelleBandbreite / cAktuelleBandbreite, 10),'MBit/s');
			console.log('AktuelleBandbreite <= 16:', cAktuelleBandbreite16,'=',parseInt(cAktuelleBandbreite16 / valueCount * 100, 10),'%');
			console.log('TelekomDownload:', TelekomDownload,'/',cTelekomDownload,'=',parseInt(TelekomDownload / cTelekomDownload, 10),'MBit/s');
			console.log('TelekomUpload:', TelekomUpload,'/',cTelekomUpload,'=',parseInt(TelekomUpload / cTelekomUpload, 10),'MBit/s');
			console.log('TelekomLTE:', cTelekomLTE);
		}
	}
}

function handleStepEnter(response) {
	if (response.element.dataset.district && response.element.dataset.type) {
		currentDistrict = response.element.dataset.district;
		currentType = response.element.dataset.type;

		if (currentDistrict === 'all') {
			currentDistrict = '';
		}

		if (dataLoaded) {
			var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
			var rem40 = convertRemToPixels(40);

//			ddj.tools.showSelection('.visibleWithoutData', true);
			ddj.marker.update();

			var layerGroup = ddj.marker.default.layerGroup;
			var layerCount = 0;
			if (layerGroup) {
				layerCount = layerGroup.getLayers().length;
			}
			if (layerCount > 0) {
				ddj.map.get().flyToBounds(
					ddj.marker.default.layerGroup.getBounds(),
					{
						paddingTopLeft: L.point(15, 40),
						paddingBottomRight: L.point(vw < rem40 ? 15 : 300, 0)
					}
				);
			}
//			ddj.tools.showSelection('.visibleWithoutData', false);
		}
	}
}

function setupStickyfill() {
	var sticky = document.querySelectorAll('.sticky');
	if (sticky) {
		for (var s = 0; s < sticky.length; ++s) {
			Stickyfill.add(sticky[s]);
		}

	}
}

function setupScrollerController() {
	var openElement = document.querySelector('.overMap .open');
	var closeElement = document.querySelector('.overMap .close');
	var overMapElement = document.querySelector('.overMap');
	var articleElement = document.querySelector('article');
	var openMapElementList = document.querySelectorAll('.openMap');
	var openElementClass = openElement.className;
	var closeElementClass = closeElement.className;

	function openElementCb(event) {
		event.preventDefault();

		openElement.className = openElementClass;
		closeElement.className += ' show';
		articleElement.className += ' small';
		overMapElement.className += ' small';

		ddj.map.get().scrollWheelZoom.enable();
	}

	function closeElementCb(event) {
		event.preventDefault();

		openElement.className += ' show';
		closeElement.className = closeElementClass;
		articleElement.className = articleElement.className.substring(0, articleElement.className.length - 6);
		overMapElement.className = overMapElement.className.substring(0, overMapElement.className.length - 6);

		ddj.map.get().scrollWheelZoom.disable();
	}

	openElement.className += ' show';

	openElement.addEventListener('click', openElementCb, false);
	closeElement.addEventListener('click', closeElementCb, false);
	for (o = 0; o < openMapElementList.length; ++o) {
		var element = openMapElementList[o];
		element.addEventListener('click', openElementCb, false);
	}
}

function init() {
	setupStickyfill();
	setupScrollerController();

	handleResize();

	scroller
	.setup({
		step: '#scrolly article .step',
		offset: 0.4,
		debug: false
	})
	.onStepEnter(handleStepEnter);

	window.addEventListener('resize', handleResize);
}

init();

ddj.autostart.onDone(function() {
	ddj.map.get().scrollWheelZoom.disable();
	dataLoaded = true;

//	statistics();
});

ddj.autostart.onAddMarker(function(marker, value) {
	if (value.BSN.indexOf(currentDistrict) !== 0) {
		return false;
	}

	var data = '';
	if (currentType === 'today') {
		data = value.AktuelleBandbreite;
	} else if (currentType === 'telekom') {
		data = value.TelekomDownload;
	} else if (currentType === 'diff') {
		data = Math.max(0, parseInt(value.TelekomDownload, 10) - parseInt(value.AktuelleBandbreite, 10));
	} else if (currentType === 'perHead') {
	}

	var dataInt = parseInt(data, 10);
	var iconFace = '';
	var iconColor = '';
	if (currentType === 'diff') {
		if (data === 0) {
			iconColor = 'beige';
			iconFace = 'fa-minus';
		} else if (data <= 100) {
			iconColor = 'blue';
			iconFace = 'fa-angle-up';
		} else {
			iconColor = 'darkblue';
			iconFace = 'fa-angle-double-up';
		}
	} else if (currentType === 'perHead') {
		iconColor = 'pink';
		iconFace = 'fa-circle';
	} else {
		if (data === '') {
			iconColor = 'white';
			iconFace = 'fa-question';
		} else if (data === '-') {
			iconColor = 'white';
			iconFace = 'fa-question';
		} else if (dataInt < 1) {
			iconColor = 'red';
			iconFace = 'fa-times';
		} else if (dataInt < 7) {
			iconColor = 'lightred';
			iconFace = 'fa-battery-empty';
		} else if (dataInt < 17) {
			iconColor = 'orange'
			iconFace = 'fa-battery-quarter'
		} else if (dataInt < 51) {
			iconColor = 'lightgreen'
			iconFace = 'fa-battery-half'
		} else if (dataInt < 101) {
			iconColor = 'green';
			iconFace = 'fa-battery-three-quarters';
		} else if (dataInt < 1000) {
			iconColor = 'darkgreen';
			iconFace = 'fa-battery-full';
		} else {
			iconColor = 'black';
			iconFace = 'fa-rocket';
		}
	}

//	marker.index
//	marker.count
//	marker.lat
//	marker.lng
	marker.color = iconColor;
//	marker.opacity = 1;
//	marker.clickable = 1;
	marker.iconPrefix = 'fas';
	marker.iconFace = iconFace;

	return true;
});
