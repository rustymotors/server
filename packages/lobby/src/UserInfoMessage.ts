// eslint-disable-next-line no-unused-vars
import { BytableStructure } from "@rustymotors/binary";

export class MiniUserInfo extends BytableStructure {
	constructor() {
		super();
		this.setSerializeOrder([
			{ name: "userId", field: "Dword" },
			{ name: "userName", field: "PString" },
		]);
	}
}


export function align8(value: number) {
	return value + (8 - (value % 8));
}

