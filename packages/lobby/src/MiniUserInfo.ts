import { BytableStructure } from "@rustymotors/binary";


export class MiniUserInfo extends BytableStructure {
	constructor() {
		super();
		this.setSerializeOrder([
			{ name: "userId", field: "Dword" },
			{ name: "userName", field: "String" },
		]);
	}
}
