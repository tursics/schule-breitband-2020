var main = document.querySelector('main');
var scrolly = main.querySelector('#scrolly');
var figure = scrolly.querySelector('figure');
var article = scrolly.querySelector('article');
var step = article.querySelectorAll('.step');
var currentDistrict = '';
var currentType = 'today';
var dataLoaded = false;

var scroller = scrollama();

function handleResize() {
	scroller.resize();
}

function handleStepEnter(response) {
	if (response.element.dataset.district && response.element.dataset.type) {
		currentDistrict = response.element.dataset.district;
		currentType = response.element.dataset.type;

		if (currentDistrict === 'all') {
			currentDistrict = '';
		}

		if (dataLoaded) {
			ddj.marker.update();
			ddj.map.get().flyToBounds(
				ddj.marker.default.layerGroup.getBounds(),
				{
					paddingBottomRight: L.point(300, 0)
				}
			);
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

function init() {
	setupStickyfill();

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
