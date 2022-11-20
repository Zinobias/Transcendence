export function mapGetter(key : any, map : Map<any, any>) : any {
	for (let entry of map.entries()) {
		if (key == entry[0]) {
			return entry[1];
		}
	}
	return undefined;
}