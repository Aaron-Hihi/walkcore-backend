export class ResponseError extends Error {
    constructor(public status: number, public message: string) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype);
    } 
}