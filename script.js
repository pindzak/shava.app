;(function ()
{
	"use strict";

	ymaps.ready(init);

	function init()
	{
		//new
		// INIT
		var centerCoords = [54.709653, 20.519702],
			map = new ymaps.Map("map", {
				center: centerCoords,
				zoom: 12
			}),
			peoplePoints = [],
			maxCoords = [],
			minCoords = [],
			shava,
			routesSumm;

		// events
		map.events.add('click', onMapClick);
		addShava.addEventListener("click", onAddShavaClick);

		function onMapClick(e)
		{
			// todo: if doublicate - just move. Now not work (click ryadom)
			// add point to map
			var coords = e.get('coords');
			var point = createPlacemark(coords);
			map.geoObjects.add(point);

			// save point
			peoplePoints.push(point);

			// save min max coords
			updateMinMax(coords);

			point.events.add('click', onPeopleClick);

			// drag event for rematch routes
			point.events.add('dragend', function ()
			{
				matchRouts();
			});
			matchRouts();
		}

		function onPeopleClick(e)
		{
			var contextMenu = document.getElementById('contextMenu');
			if (contextMenu)
			{
				contextMenu.remove();
			}
			else
			{
				var targetPeople = e.get('target');

				var contextMenu = document.createElement('div');
				contextMenu.id = 'contextMenu';
				contextMenu.style.background = 'white';
				contextMenu.innerHTML =
					'<div><i>Кто это?</i><br>'
					+ '<input type="text" name="contextMenuName" value="' + targetPeople.properties.get('iconCaption')
					+ '"></div><div align="center"><input type="submit" value="Сохранить" /></div>';

				contextMenu.style.position = 'absolute';
				contextMenu.style.padding = '15px';
				contextMenu.style.left = e.get('pagePixels')[0] + 'px';
				contextMenu.style.top = e.get('pagePixels')[1] + 'px';

				document.getElementsByTagName('body')[0].append(contextMenu);
				contextMenuSave.addEventListener("click", function(){
					targetPeople.properties.set({
						iconCaption: contextMenuName.value,
					});
					contextMenu.remove();
				});
			}
		}

		function onAddShavaClick()
		{
			// todo: find centerCoords
			if (!shava)
			{
				// todo: random icon
				var coords = centerCoords;
				shava = new ymaps.Placemark(
					findShavaCoords(),
					{
						iconCaption: 'Шава!'
					}, {
						preset: 'islands#darkGreenBarIcon',
						draggable: true
					}
				);
				map.geoObjects.add(shava);
			}

			// drag event
			shava.events.add('dragend', function ()
			{
				matchRouts();
			});
			matchRouts();
		}

		function findShavaCoords()
		{
			if (maxCoords.length === 0 && minCoords.length === 0)
			{
				return centerCoords;
			}
			else
			{
				return [
					minCoords[0] + (maxCoords[0] - minCoords[0]) / 2,
					minCoords[1] + (maxCoords[1] - minCoords[1]) / 2,
				];
			}
		}

		function updateMinMax(coords)
		{
			if (maxCoords.length === 0 && minCoords.length === 0)
			{
				maxCoords = coords;
				minCoords = coords;
			}
			else
			{
				maxCoords = [
					Math.max(maxCoords[0], coords[0]),
					Math.max(maxCoords[1], coords[1]),
				];
				minCoords = [
					Math.min(minCoords[0], coords[0]),
					Math.min(minCoords[1], coords[1]),
				];
			}
		}

		// todo: random styles
		//styles = https://tech.yandex.ru/maps/jsapi/doc/2.1/ref/reference/option.presetStorage-docpage/
		function createPlacemark(coords)
		{
			return new ymaps.Placemark(coords, {
				iconCaption: 'Кто это?'
			}, {
				preset: 'islands#redIcon',
				draggable: true
			});
		}

		function matchRouts()
		{
			if (!shava)
			{
				return;
			}

			resultResults.innerHTML = '';
			routesSumm = 0;

			peoplePoints.forEach(function (point)
			{
				var p = document.createElement('li');
				p.innerHTML =
					'От <i>' + point.properties.get('iconCaption') + '</i>'
					+ ' до шавухи <b>' + point.geometry.getCoordinates() + 'км</b>';
				resultResults.append(p);
			});

			var multiRoute = new ymaps.multiRouter.MultiRoute({
					// Точки маршрута. Точки могут быть заданы как координатами, так и адресом.
					referencePoints: [
						peoplePoints[0].geometry.getCoordinates(),
						shava, // улица Льва Толстого.
					],
					params: {
						routingMode: "pedestrian",
					}
				}, {
					routeActiveStrokeStyle: 'solid',
					routeActiveStrokeWidth: 3,
					routeStrokeStyle: 'dot',
					routeStrokeWidth: 1,
					pinIconLayout: "default#image",
					pinIconColor: "#f00",
					pinIconFillColor: "#0f0",
					wayPointVisible: false,
					wayPointIconImageSize: [10, 10],
					wayPointIconImageOffset: [-5, -5],
				}
			);
			// todo: remove old routes from map -> need save routes
			map.geoObjects.add(multiRoute);

			// todo: distance
			// var distance = multiRoute.getActiveRoute().properties.get("distance").text;
			console.log("distance");
			// todo: add route time
			// todo: mark min and max route
			// todo: save by URL params

			resultSumm.innerHTML = 'Все вместе пройдём <b>' + routesSumm + 'км</b>';
		}
	}
})();