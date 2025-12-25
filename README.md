# Finance-Tracker

The Finance Tracker backend is a NestJS project that demonstrates modular architecture and reusable components. Its core module, which handles finance-related logic, can be used in other projects, while the main focus is on showing how to structure and integrate a system rather than providing a full-featured finance tool.

The app allows you to **analyze finance data from CSV files** and perform various calculations depending on what you want to track, such as totals, averages, or custom metrics. The main goals are:

- Demonstrate a proper NestJS application structure.
- Offer a reusable `core` package that can be installed independently in other projects.
- Provide a set of REST controllers for easy testing and usage.

## Setup

```bash
npm i
npm run start
```

### Build

```bash
# build everything
npm run build

# build only core logic
npm run build:core

# build only app
npm run build:app
```

## Using the core package

We will use [npm link](https://docs.npmjs.com/cli/v9/commands/npm-link?v=true) for this.

```bash
# Go to the core module folder
cd src/core
npm link

# Go to your application folder
cd ../../app
npm link finance-core
```

```typescript
// Example Usage in application
import { CsvParser, FinanceAnalyzer } from 'finance-core'
import { mapRowToBankStatement } from 'finance-core/common/helpers/finance-mapping.helper'

const parser = new CsvParser()
const filePath = 'path/to/csv'

const rows = parser.parseCSVData(filePath)
const statements = rows.map(mapRowToBankStatement)

const analyzer = new FinanceAnalyzer(statements)
const perWeekday = analyzer.getMostAmountSpentPerWeekday()
const topCategories = analyzer.getTopSpendingCategoriesForMonth(3, 5, 2025)
```
