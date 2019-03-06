/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./dev/js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dev/js/main.js":
/*!************************!*\
  !*** ./dev/js/main.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("document.querySelector('#logout-button').addEventListener('click', (e) => {\n\n\te.preventDefault();\n\n\tlocalStorage && localStorage.removeItem('motivatorApp');\n\n\t// todo: revoke token on logout\n\n\tinit();\n\n});\n\nfunction init(){\n\n\tlet sessionData = localStorage && localStorage.getItem('motivatorApp') || {};\n\n\tif(!Object.keys(sessionData).length){\n\n\t\tlet hashData = window.location.hash;\n\n\t\thashData ? readDataFromHash(hashData, sessionData) : login();\n\n\t} else { displayData(JSON.parse(sessionData)); }\n\n}\n\nfunction login(){\n\n\tdocument.querySelector('#login-view').classList.remove('hide');\n\tdocument.querySelector('#data-view').classList.add('hide');\n\n\tconst data = {\n\t\tresponse_type: 'token',\n\t\tclient_id: '22DJKC',\n\t\tredirect_uri: 'https%3A%2F%2Fmskyda.github.io',\n\t\tscope: 'activity nutrition heartrate location nutrition profile settings sleep social weight',\n\t\texpires_in: '31536000'\n\t};\n\n\tlet loginUrl = 'https://www.fitbit.com/oauth2/authorize?';\n\n\tfor(const key in data){ loginUrl += `${key}=${data[key]}&`; }\n\n\tdocument.querySelector('#login-button').setAttribute('href', loginUrl.substr(0, loginUrl.length - 1));\n\n}\n\nfunction readDataFromHash(hashData, sessionData){\n\n\thashData = hashData.substr(1).split('&');\n\n\thashData.forEach(chunk => { sessionData[chunk.split('=')[0]] = chunk.split('=')[1]; });\n\n\tlocalStorage.setItem('motivatorApp', JSON.stringify(sessionData));\n\n\thistory.pushState('', document.title, `${window.location.pathname}${window.location.search}`);\n\n\tdisplayData(sessionData);\n\n}\n\nfunction displayData(appData){\n\n\tdocument.querySelector('#data-view').classList.remove('hide');\n\tdocument.querySelector('#login-view').classList.add('hide');\n\n\tconst infoBox = document.querySelector('#info-box');\n\tconst requestOpts = { headers: {'Authorization': `Bearer ${appData.access_token}`} };\n\n\tinfoBox.innerHTML = '';\n\n\tfetch('https://api.fitbit.com/1/user/-/profile.json', requestOpts).then(res => res.json()).then(res => {\n\n\t\tinfoBox.innerHTML += `<h2>Hello ${res.user.displayName}!</h2>`;\n\n\t\tlet date = new Date();\n\n\t\tdate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;\n\n\t\tfetch(`https://api.fitbit.com/1/user/${appData.user_id}/body/log/weight/date/${date}/1m.json`, requestOpts).then(res => res.json()).then(res => {\n\n\t\t\tlet weeks = [];\n\n\t\t\tres.weight.reverse().forEach((obj, index) => {\n\n\t\t\t\tconst week = Math.floor(index / 7);\n\n\t\t\t\tweeks[week] = weeks[week] ? weeks[week] += obj.weight : obj.weight;\n\n\t\t\t});\n\n\t\t\tweeks = weeks.map((week, index) => {\n\n\t\t\t\tlet divider = 7;\n\n\t\t\t\tif(index === weeks.length - 1){ divider = res.weight.length % 7; }\n\n\t\t\t\treturn `${index === 0 ? 'This week: ' : `${index} week(s) ago: `} ${(week / divider).toFixed(2)} kg <br>`\n\n\t\t\t});\n\n\t\t\tinfoBox.innerHTML += `<h3>Your average weight:<br><br> ${weeks.join('<br>')}<h3><h3>Great job!</h3>`;\n\n\t\t});\n\n\t});\n\n}\n\ninit();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9kZXYvanMvbWFpbi5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL2Rldi9qcy9tYWluLmpzPzk0Y2YiXSwic291cmNlc0NvbnRlbnQiOlsiZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvZ291dC1idXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG5cblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbW90aXZhdG9yQXBwJyk7XG5cblx0Ly8gdG9kbzogcmV2b2tlIHRva2VuIG9uIGxvZ291dFxuXG5cdGluaXQoKTtcblxufSk7XG5cbmZ1bmN0aW9uIGluaXQoKXtcblxuXHRsZXQgc2Vzc2lvbkRhdGEgPSBsb2NhbFN0b3JhZ2UgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21vdGl2YXRvckFwcCcpIHx8IHt9O1xuXG5cdGlmKCFPYmplY3Qua2V5cyhzZXNzaW9uRGF0YSkubGVuZ3RoKXtcblxuXHRcdGxldCBoYXNoRGF0YSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG5cdFx0aGFzaERhdGEgPyByZWFkRGF0YUZyb21IYXNoKGhhc2hEYXRhLCBzZXNzaW9uRGF0YSkgOiBsb2dpbigpO1xuXG5cdH0gZWxzZSB7IGRpc3BsYXlEYXRhKEpTT04ucGFyc2Uoc2Vzc2lvbkRhdGEpKTsgfVxuXG59XG5cbmZ1bmN0aW9uIGxvZ2luKCl7XG5cblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvZ2luLXZpZXcnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkYXRhLXZpZXcnKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG5cblx0Y29uc3QgZGF0YSA9IHtcblx0XHRyZXNwb25zZV90eXBlOiAndG9rZW4nLFxuXHRcdGNsaWVudF9pZDogJzIyREpLQycsXG5cdFx0cmVkaXJlY3RfdXJpOiAnaHR0cHMlM0ElMkYlMkZtc2t5ZGEuZ2l0aHViLmlvJyxcblx0XHRzY29wZTogJ2FjdGl2aXR5IG51dHJpdGlvbiBoZWFydHJhdGUgbG9jYXRpb24gbnV0cml0aW9uIHByb2ZpbGUgc2V0dGluZ3Mgc2xlZXAgc29jaWFsIHdlaWdodCcsXG5cdFx0ZXhwaXJlc19pbjogJzMxNTM2MDAwJ1xuXHR9O1xuXG5cdGxldCBsb2dpblVybCA9ICdodHRwczovL3d3dy5maXRiaXQuY29tL29hdXRoMi9hdXRob3JpemU/JztcblxuXHRmb3IoY29uc3Qga2V5IGluIGRhdGEpeyBsb2dpblVybCArPSBgJHtrZXl9PSR7ZGF0YVtrZXldfSZgOyB9XG5cblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvZ2luLWJ1dHRvbicpLnNldEF0dHJpYnV0ZSgnaHJlZicsIGxvZ2luVXJsLnN1YnN0cigwLCBsb2dpblVybC5sZW5ndGggLSAxKSk7XG5cbn1cblxuZnVuY3Rpb24gcmVhZERhdGFGcm9tSGFzaChoYXNoRGF0YSwgc2Vzc2lvbkRhdGEpe1xuXG5cdGhhc2hEYXRhID0gaGFzaERhdGEuc3Vic3RyKDEpLnNwbGl0KCcmJyk7XG5cblx0aGFzaERhdGEuZm9yRWFjaChjaHVuayA9PiB7IHNlc3Npb25EYXRhW2NodW5rLnNwbGl0KCc9JylbMF1dID0gY2h1bmsuc3BsaXQoJz0nKVsxXTsgfSk7XG5cblx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21vdGl2YXRvckFwcCcsIEpTT04uc3RyaW5naWZ5KHNlc3Npb25EYXRhKSk7XG5cblx0aGlzdG9yeS5wdXNoU3RhdGUoJycsIGRvY3VtZW50LnRpdGxlLCBgJHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9JHt3aW5kb3cubG9jYXRpb24uc2VhcmNofWApO1xuXG5cdGRpc3BsYXlEYXRhKHNlc3Npb25EYXRhKTtcblxufVxuXG5mdW5jdGlvbiBkaXNwbGF5RGF0YShhcHBEYXRhKXtcblxuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0YS12aWV3JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbG9naW4tdmlldycpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcblxuXHRjb25zdCBpbmZvQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2luZm8tYm94Jyk7XG5cdGNvbnN0IHJlcXVlc3RPcHRzID0geyBoZWFkZXJzOiB7J0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXBwRGF0YS5hY2Nlc3NfdG9rZW59YH0gfTtcblxuXHRpbmZvQm94LmlubmVySFRNTCA9ICcnO1xuXG5cdGZldGNoKCdodHRwczovL2FwaS5maXRiaXQuY29tLzEvdXNlci8tL3Byb2ZpbGUuanNvbicsIHJlcXVlc3RPcHRzKS50aGVuKHJlcyA9PiByZXMuanNvbigpKS50aGVuKHJlcyA9PiB7XG5cblx0XHRpbmZvQm94LmlubmVySFRNTCArPSBgPGgyPkhlbGxvICR7cmVzLnVzZXIuZGlzcGxheU5hbWV9ITwvaDI+YDtcblxuXHRcdGxldCBkYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdGRhdGUgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9LSR7KCcwJyArIChkYXRlLmdldE1vbnRoKCkgKyAxKSkuc2xpY2UoLTIpfS0keygnMCcgKyBkYXRlLmdldERhdGUoKSkuc2xpY2UoLTIpfWA7XG5cblx0XHRmZXRjaChgaHR0cHM6Ly9hcGkuZml0Yml0LmNvbS8xL3VzZXIvJHthcHBEYXRhLnVzZXJfaWR9L2JvZHkvbG9nL3dlaWdodC9kYXRlLyR7ZGF0ZX0vMW0uanNvbmAsIHJlcXVlc3RPcHRzKS50aGVuKHJlcyA9PiByZXMuanNvbigpKS50aGVuKHJlcyA9PiB7XG5cblx0XHRcdGxldCB3ZWVrcyA9IFtdO1xuXG5cdFx0XHRyZXMud2VpZ2h0LnJldmVyc2UoKS5mb3JFYWNoKChvYmosIGluZGV4KSA9PiB7XG5cblx0XHRcdFx0Y29uc3Qgd2VlayA9IE1hdGguZmxvb3IoaW5kZXggLyA3KTtcblxuXHRcdFx0XHR3ZWVrc1t3ZWVrXSA9IHdlZWtzW3dlZWtdID8gd2Vla3Nbd2Vla10gKz0gb2JqLndlaWdodCA6IG9iai53ZWlnaHQ7XG5cblx0XHRcdH0pO1xuXG5cdFx0XHR3ZWVrcyA9IHdlZWtzLm1hcCgod2VlaywgaW5kZXgpID0+IHtcblxuXHRcdFx0XHRsZXQgZGl2aWRlciA9IDc7XG5cblx0XHRcdFx0aWYoaW5kZXggPT09IHdlZWtzLmxlbmd0aCAtIDEpeyBkaXZpZGVyID0gcmVzLndlaWdodC5sZW5ndGggJSA3OyB9XG5cblx0XHRcdFx0cmV0dXJuIGAke2luZGV4ID09PSAwID8gJ1RoaXMgd2VlazogJyA6IGAke2luZGV4fSB3ZWVrKHMpIGFnbzogYH0gJHsod2VlayAvIGRpdmlkZXIpLnRvRml4ZWQoMil9IGtnIDxicj5gXG5cblx0XHRcdH0pO1xuXG5cdFx0XHRpbmZvQm94LmlubmVySFRNTCArPSBgPGgzPllvdXIgYXZlcmFnZSB3ZWlnaHQ6PGJyPjxicj4gJHt3ZWVrcy5qb2luKCc8YnI+Jyl9PGgzPjxoMz5HcmVhdCBqb2IhPC9oMz5gO1xuXG5cdFx0fSk7XG5cblx0fSk7XG5cbn1cblxuaW5pdCgpOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./dev/js/main.js\n");

/***/ })

/******/ });