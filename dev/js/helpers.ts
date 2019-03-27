export const checkHash = () => {

		const hashData = window.location.hash;

		if(!hashData){ return; }

		const dataSession : { [key: string]: string } = {};

		hashData.substr(1).split('&').forEach(chunk => { dataSession[chunk.split('=')[0]] = chunk.split('=')[1]; });

		history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);

		return dataSession;

};

export class Storage {

	private storage: { [key: string]: any };

	private identifier: string;

	private isSupported: boolean;

	public constructor(identifier : string) {


		this.storage = localStorage;
		this.identifier = identifier;
		this.isSupported = this.checkSupport();

		if(!this.isSupported){ console.warn('Storage is not supported'); }

	}

	private checkSupport() {

		try {

			if (this.storage) {

				this.storage.setItem('test', 'test');

				this.storage.removeItem('test');

				return true;

			}

		} catch(e) { return false; }

		return false;

	}

	public set(json: { [key: string]: any }) {

		if(!this.isSupported){ return; }

		const storedData = this.get() || {};
		const mergedData = (<any>Object).assign(storedData, json);

		this.storage.setItem(this.identifier, JSON.stringify(mergedData));

	}

	public get(key ?: string) {

		if(!this.isSupported){ return; }

		const storedData = this.storage[this.identifier] && JSON.parse(this.storage[this.identifier]);

		if(key){

			return storedData && storedData[key] || false;

		} else {

			return storedData || false;

		}

	}

	public remove(key ?: string) {

		if(!this.isSupported){ return; }

		if(key){

			const storedData = this.get();

			if(storedData && storedData[key]){

				delete storedData[key];

				this.remove(storedData);

				this.set(storedData);

			}

		} else {

			this.storage.removeItem(this.identifier);

		}


	}
}
