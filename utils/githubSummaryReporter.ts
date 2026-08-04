import { FullResult, Reporter, Suite, TestCase } from '@playwright/test/reporter';
import fs from 'fs';

class GithubSummaryReporter implements Reporter {
  private suite!: Suite;

  onBegin(config: any, suite: Suite) {
    console.log('[GithubSummaryReporter] Initialized.');
    this.suite = suite;
  }

  onEnd(result: FullResult) {
    console.log('[GithubSummaryReporter] Generating summary...');
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    const suiteName = process.env.TEST_SUITE_NAME || 'Playwright Test Results';

    let passed = 0;
    let failed = 0;
    let flaky = 0;
    let skipped = 0;
    const failedTestTitles: string[] = [];

    const countTests = (suite: Suite) => {
      for (const test of suite.tests) {
        const outcome = test.outcome();
        if (outcome === 'expected') passed++;
        else if (outcome === 'unexpected') {
          failed++;
          failedTestTitles.push(test.title);
        }
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
    
    let summary = `
## ${statusIcon} ${suiteName}

| Status | Count |
| --- | --- |
| **Total** | **${total}** |
| ✅ Passed | ${passed} |
| ❌ Failed | ${failed} |
| ⚠️ Flaky | ${flaky} |
| ⏭️ Skipped | ${skipped} |

**Duration:** ${(result.duration / 1000).toFixed(1)}s
`;

    if (failedTestTitles.length > 0) {
      summary += `\n### ❌ Failed Test Cases:\n`;
      for (const title of failedTestTitles) {
        summary += `- ${title}\n`;
      }
    }

    if (summaryFile) {
      try {
        fs.appendFileSync(summaryFile, summary + '\n');
        console.log(`[GithubSummaryReporter] Successfully appended to ${summaryFile}`);
      } catch (e) {
        console.error('[GithubSummaryReporter] Failed to write to GITHUB_STEP_SUMMARY', e);
      }
    } else {
      console.log('::group::' + suiteName);
      console.log(summary);
      console.log('::endgroup::');
    }
  }
}

export default GithubSummaryReporter;
