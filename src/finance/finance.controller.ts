import {
    Body,
    Controller,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { FinanceService } from './finance.service'

import { FileInterceptor } from '@nestjs/platform-express'
import { type CsvColumnMappings } from 'src/common/common.dto'
import {
    ExecutionTypeWithAmounts,
    TopSpendingCategoryForMonth,
    AmountPerWeekday,
} from './finance.model'

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadCSVFile(
        @Body('columnMappings') columnMappingsString: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1 MB
                ],
            })
        )
        file: Express.Multer.File
    ) {
        const columnMappings = JSON.parse(
            columnMappingsString
        ) as CsvColumnMappings

        this.financeService.overrideCsvColumnNames(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `${process.env.CSV_FILE_UPLOAD_DESTINATION}/${file.filename}`,
            columnMappings
        )

        return { message: 'File uploaded successfully!' }
    }

    @Get('calculate/execution-types-sums/:fileName')
    getExecutionTypesWithAmounts(
        @Param('fileName') fileName: string
    ): ExecutionTypeWithAmounts[] | { message: string } {
        const appendedFileName = `${process.env.CSV_FILE_UPLOAD_DESTINATION}/${fileName}`
        const result =
            this.financeService.getExecutionTypesWithAmounts(appendedFileName)
        if (!result)
            return {
                message: 'Required fields missing in CSV for this calculation.',
            }
        return result
    }

    @Get('calculate/top-spending-categories/:fileName')
    getTopSpendingCategoriesForMonth(
        @Param('fileName') fileName: string
    ): TopSpendingCategoryForMonth[] | { message: string } {
        const appendedFileName = `${process.env.CSV_FILE_UPLOAD_DESTINATION}/${fileName}`
        const result = this.financeService.getTopSpendingCategoriesForMonth(
            appendedFileName,
            3,
            5,
            2023
        )
        if (!result || result.length === 0)
            return {
                message: 'Required fields missing in CSV for this calculation.',
            }
        return result
    }

    @Get('calculate/most-amount-per-weekday/:fileName')
    getMostAmountSpentPerWeekday(
        @Param('fileName') fileName: string
    ): AmountPerWeekday[] | { message: string } {
        const appendedFileName = `${process.env.CSV_FILE_UPLOAD_DESTINATION}/${fileName}`
        const result =
            this.financeService.getMostAmountSpentPerWeekday(appendedFileName)
        if (!result || result.length === 0)
            return {
                message: 'Required fields missing in CSV for this calculation.',
            }
        return result
    }

    @Get('calculate/highest-spending-day/:fileName')
    getHighestSpendingDay(
        @Param('fileName') fileName: string
    ): AmountPerWeekday | { message: string } {
        const appendedFileName = `${process.env.CSV_FILE_UPLOAD_DESTINATION}/${fileName}`
        const result =
            this.financeService.getHighestSpendingDay(appendedFileName)
        if (!result)
            return {
                message: 'Required fields missing in CSV for this calculation.',
            }
        return result
    }
}
