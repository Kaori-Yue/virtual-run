// Already in _app.tsx
// BigInt.prototype.toJSON = function () {
// 	return Number.parseInt(this.toString()) // for type number
// 	// return this.toString(); // for type string
// }

interface BigInt {
	toJSON(params: BigInt): number
}