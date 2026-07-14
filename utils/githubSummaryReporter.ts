import { FullResult, Reporter, Suite } from '@playwright/test/reporter';
import fs from 'fs';

class GithubSummaryReporter implements Reporter {
  private suite!: Suite;

  onBegin(config: any, suite: Suite) {
    this.suite = suite;
  }

  onEnd(result: FullResult) {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) {
      return;
    }

    let passed = 0;
    let failed = 0;
    let flaky = 0;
    let skipped = 0;

    const countTests = (suite: Suite) => {
      for (const test of suite.tests) {
        const outcome = test.outcome();
        if (outcome === 'expected') passed++;
        else if (outcome === 'unexpected') failed++;
        else if (outcome === 'flaky') flaky++;
        else if (outcome === 'skipped') skipped++;
      }
      for (const child of suite.suites) {
        countTests(child);
      }
    };

    if (this.suite) {
      countTests(this.suite);
    }

    const total = passed + failed + flaky + skipped;
    const statusIcon = result.status === 'passed' ? '✅' : '❌';
    
    const summary = `
## ${statusIcon} Playwright Test Results

| Status | Count |
| --- | --- |
| **Total** | **${total}** |
| ✅ Passed | ${passed} |
| ❌ Failed | ${failed} |
| ⚠️ Flaky | ${flaky} |
| ⏭️ Skipped | ${skipped} |

**Duration:** ${(result.duration / 1000).toFixed(1)}s
`;

    try {
      fs.appendFileSync(summaryFile, summary + '\n');
    } catch (e) {
      console.error('Failed to write to GITHUB_STEP_SUMMARY', e);
    }
  }
}

export default GithubSummaryReporter;
