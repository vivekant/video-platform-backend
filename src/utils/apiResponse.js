class apiResponse {
    constructor(statusCode,data,message="success"){
        this.statusCode=statusCode,
        this.data=data,
        this.message=statusCode<400
    }
}

export {apiResponse}