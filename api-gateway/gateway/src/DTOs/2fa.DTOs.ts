export interface IResponse {
	event?		: string,
	success 	: boolean,
	msg		 	: string,
};

export interface enableTFADTO extends IResponse {
	qrCode? : string | undefined,
};

export interface verifyTFADTO extends IResponse {};

export interface isEnabledTFADTO extends IResponse {};

export interface removeTFADTO extends IResponse {};
