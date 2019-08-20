;(function ()
{
	"use strict";

	ymaps.ready(init);

	function init()
	{
		//new
		// INIT
		var centerCoords = [54.709653, 20.519702],
			ymap = new ymaps.Map("map", {
				center: centerCoords,
				zoom: 12
			}),
			peoples = [],
			shava,
			maxPeopleCoords = [],
			minPeopleCoords = [],

			// todo: name
			routesSum;

		// events
		ymap.events.add('click', onMapClick);
		addShava.addEventListener("click", onAddShavaClick);

		function onMapClick(e)
		{
			// todo: if doublicate - just move. Now not work (click ryadom)
			// add point to map
			var coords = e.get('coords');
			var point = createPlacemark(coords);
			ymap.geoObjects.add(point);

			// save point
			peoples.push({point: point});

			// save min max coords
			updateMinMax(coords);

			point.events.add('click', onPeopleClick);

			// drag event for rematch routes
			point.events.add('dragend', matchRouts);
			matchRouts();
		}

		function onPeopleClick(e)
		{
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
					+ '<input id="contextMenuName" type="text" name="contextMenuName" value="' + targetPeople.properties.get('iconCaption')
					+ '"></div><div align="center"><input id="contextMenuSave" type="submit" value="Сохранить" /></div>';
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
				ymap.geoObjects.add(shava);
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
			if (maxPeopleCoords.length === 0 && minPeopleCoords.length === 0)
			{
				return centerCoords;
			}
			else
			{
				return [
					minPeopleCoords[0] + (maxPeopleCoords[0] - minPeopleCoords[0]) / 2,
					minPeopleCoords[1] + (maxPeopleCoords[1] - minPeopleCoords[1]) / 2,
				];
			}
		}

		function updateMinMax(coords)
		{
			if (maxPeopleCoords.length === 0 && minPeopleCoords.length === 0)
			{
				maxPeopleCoords = coords;
				minPeopleCoords = coords;
			}
			else
			{
				maxPeopleCoords = [
					Math.max(maxPeopleCoords[0], coords[0]),
					Math.max(maxPeopleCoords[1], coords[1]),
				];
				minPeopleCoords = [
					Math.min(minPeopleCoords[0], coords[0]),
					Math.min(minPeopleCoords[1], coords[1]),
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
			routesSum = 0;
			// todo: mark max and min route

			peoples.forEach(function (people)
			{
				// set route
				if(people.route)
				{
					updatePeopleRoute(people);
				}
				else
				{
					people.route = createPeopleRoute(people);
					ymap.geoObjects.add(people.route);
					people.route.model.events.add('requestsuccess', onRouteUpdated);
				}

				// create text
				var p = document.createElement('li');
				p.innerHTML =
					'<i>' + people.point.properties.get('iconCaption') + '</i>'
					+ ' протопает до шавухи <b>' + people.point.geometry.getCoordinates() + 'км</b>';
				resultResults.append(p);
			});

			// todo: remove old routes from map -> need save routes


			// todo: distance
			// var distance = multiRoute.getActiveRoute().properties.get("distance").text;
			// todo: add route time
			// todo: mark min and max route
			// todo: save by URL params


		}

		function createPeopleRoute(people)
		{
			return new ymaps.multiRouter.MultiRoute({
					// Точки маршрута. Точки могут быть заданы как координатами, так и адресом.
					referencePoints: [
						people.point.geometry.getCoordinates(),
						shava
					],
					params: {
						routingMode: "pedestrian",
					}
				}, {
					routeActiveStrokeStyle: 'solid',
					routeActiveStrokeWidth: 3,
					routeStrokeStyle: 'dot',
					routeStrokeWidth: 1,
					// pinIconLayout: "default#image",
					// pinIconColor: "#f00",
					// pinIconFillColor: "#0f0",
					// wayPointVisible: false,
					// wayPointIconImageSize: [10, 10],
					// wayPointIconImageOffset: [-5, -5],
				}
			);
		}

		function updatePeopleRoute(people)
		{
			people.route.model.setReferencePoints([
				people.point.geometry.getCoordinates(),
				shava.geometry.getCoordinates()
			]);
		}

		function onRouteUpdated(e)
		{
			var targetRoutes =e.get('target').getRoutes();
			if(targetRoutes.length > 0)
			{
				routesSum += targetRoutes[0].properties.get("distance").value;
				resultSumm.innerHTML = 'Все вместе намотаем <b>' + routesSum/1000 + ' км</b>';
			}
		}
	}
})();