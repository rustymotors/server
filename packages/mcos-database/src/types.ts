export type ResponseJSON = {
    /** A valid HTTP status code */
    statusCode: number;
    responseContent: {
        /** If present, holds an error message. The value of `message` should be discarded in this case */
        error?: string;
        /** Depending on the expected result, this field may be a string-ified JSON object */
        message: string;
    };
};

export type RequestJSON = {
    /**
     * This is a valid command that there is a requestHandler registered for,
     */
    requestCode: string;
    /**
     * This is most likely a string-ified JSON object.
     */
    requestContent: string;
};

export type RequestHandler = {
    requestCode: string;
    handlerFunction: (requestJSON: RequestJSON) => ResponseJSON;
};

export type SessionRecord = {
    skey: string;
    sessionkey: string;
};
