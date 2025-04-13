export function splitPackets(data: Buffer, separator: Buffer): Buffer[] {
	const packets: Buffer[] = [];

	let remainingData = data;

	let endIndex = remainingData.indexOf(separator, 2);

	if (endIndex === -1) {
		// No separator found, return the entire buffer
		return [remainingData];
	}

	// Extract the packets
	let startIndex = 0;
	while (endIndex !== -1) {
		// Check if the separator is at the end
		if (endIndex === remainingData.length - separator.length) {
			// If the separator is at the end, we should throw an error
			throw new Error("Separator found at the end of the buffer");
		}

		const packet = remainingData.subarray(startIndex, endIndex);
		packets.push(packet);

		remainingData = remainingData.subarray(endIndex);
		endIndex = remainingData.indexOf(separator, separator.length);
	}
	// Add the last packet if there's any data left
	if (startIndex < remainingData.length) {
		packets.push(remainingData.subarray(startIndex));
	}
	return packets;
}
