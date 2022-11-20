export interface LoginDTO {
	user_id 	: number,
	auth_cookie	: string,
}

export interface CreateAccountDTO {
	user_id 	: number,
	auth_cookie	: string,
}
export interface FrontEndDTO {
    userId?: number;
    authToken?: string;
    eventPattern: string;
    data: any;
}