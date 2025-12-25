export interface CommonResponse {
    successful: boolean;
    error: string;

    /**
     * true then the operation that produced the response caused a modification, false otherwise
     */
    modified?: boolean;

    /**
     *  true then a confirmation question must be answered, the result field is SUCCESSFUL, the question itself is in the error field
     */
    confirmed?: boolean;
}
