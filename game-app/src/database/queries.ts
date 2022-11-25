import {InsertResult} from 'typeorm';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Database} from './data-source';
import {UserTable} from './entities/user-table';

@Injectable()
export class Queries {

    private readonly logger = new Logger('queries');

    constructor(@Inject(Database) private database: Database) {
    }

}
