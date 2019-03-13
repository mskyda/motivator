export const checkHash = (hashData : string) => {

		const dataSession : { [key: string]: string } = {};

		hashData.split('&').forEach(chunk => { dataSession[chunk.split('=')[0]] = chunk.split('=')[1]; });

		localStorage.setItem('motivatorApp', JSON.stringify(dataSession));

		history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);

		return dataSession;

};