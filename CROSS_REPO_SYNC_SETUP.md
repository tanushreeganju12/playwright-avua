# Setup Guide: Cross-Repo CI/CD Synchronization

I have updated the `playwright.yml` workflow in your **automation repository** to automatically push commit statuses (pending, success, or failure) back to your frontend repository using the GitHub Status API!

To make the two repositories talk to each other securely (using Option B with a fine-grained token as you wisely suggested), please follow these final two steps.

## Step 1: Create and add the `FRONTEND_SYNC_TOKEN`
We need to give the automation repo permission to post the "Pass/Fail" check on the frontend repo's PRs.

1. **Generate the Token:** 
   - Go to your GitHub account settings -> Developer settings -> Personal access tokens -> Fine-grained tokens.
   - Click **Generate new token**.
   - Under **Repository access**, select **Only select repositories** and choose your **Frontend repository**.
   - Under **Repository permissions**, grant **Read and Write** access to **Commit statuses**.
   - Click **Generate token** and copy it. *(If you prefer a GitHub App, you can install the App on both repos with the same `Commit statuses: Read & Write` permission and use an Action to generate an installation token, but a fine-grained PAT is identical in security scope for this use case and much faster to set up).*
2. **Add it to the Automation Repo:**
   - Go to your **Automation (Playwright) Repository** -> Settings -> Secrets and variables -> Actions.
   - Click **New repository secret**.
   - Name: `FRONTEND_SYNC_TOKEN`
   - Secret: Paste the token you just copied.

## Step 2: Update the Frontend Repo Workflow
We need to update the `repository_dispatch` trigger in your Frontend repository so that it sends its repository name and commit SHA to the automation repo. 

Open the GitHub Actions YAML file in your **Frontend repository** that triggers the E2E tests, and find the step that currently fires the `repository_dispatch`. Update its `client-payload` to include the `repository` and `sha` like this:

```yaml
      - name: Trigger E2E Automation Tests
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.YOUR_TOKEN_THAT_TRIGGERS_DISPATCH }}
          repository: aakarshitsharma06/playwright-avua # Your automation repo
          event-type: frontend-pr-update
          # 👇 THIS IS THE NEW PART 👇
          client-payload: '{"repository": "${{ github.repository }}", "sha": "${{ github.event.pull_request.head.sha || github.sha }}"}'
```
*(Note: If you are using `curl` instead of the `peter-evans` action, simply add those two JSON fields to the `client_payload` in your curl request).*

---

### How it works now
1. A PR is opened on the Frontend.
2. The Frontend fires the dispatch and immediately passes its own check.
3. The Automation repo starts up, reads the `repository` and `sha`, and immediately posts a **Pending** status ("Running automation suite...") to the Frontend PR.
4. When the Playwright tests finish, the Automation repo posts a **Success** or **Failure** status to the Frontend PR with a direct link to the Playwright logs.

The Frontend PR cannot be merged until the Playwright check turns green!
