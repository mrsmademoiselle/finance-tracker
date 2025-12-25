import { Injectable } from '@nestjs/common'
import { CsvParser } from '../core'

@Injectable()
export class CsvParserService extends CsvParser {}
