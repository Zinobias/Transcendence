import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

const logger = new Logger("Main");

async function bootstrap() {
	// const app = await NestFactory.create(AppModule);
	// await app.listen(3000);
	const app = await NestFactory.createMicroservice<MicroserviceOptions> (
		AppModule,
		{
			transport: Transport.TCP,
			options: {// might change the hostname
				host: "front-end",
				port: 3000,
			}
		},
	);
	app.listen().then(() => {logger.log("Microservice is listening");});
}
bootstrap();
