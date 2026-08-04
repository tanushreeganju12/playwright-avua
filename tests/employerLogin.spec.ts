import { test, expect } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

const EMAIL = 'pranjil+test@avua.com';
const PASS  = 'Test@123';

test.describe('Employer Authentication & Login Suite', () => {
  test('TC01 - should redirect employer to dashboard upon valid credentials login', async ({ page }) => {
    const employer = new AvuaEmployerPage(page);
    await employer.login(EMAIL, PASS);
    await expect(page).toHaveURL(/\/employer\/dashboard/i);
  });

  test('TC02 - should keep sign-in button disabled when email and password fields are empty', async ({ page }) => {
    await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    const passwordTab = page.getByRole('button', { name: 'Password' }).first();
    await passwordTab.click({ force: true });

    const signInButton = page.getByRole('button', { name: 'Sign in' });
    await expect(signInButton).toBeDisabled();
  });

  test('TC03 - should display success notification and request OTP when submitting a valid work email', async ({ page }) => {
    await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    const otpTab = page.getByRole('button', { name: 'One-time code' }).first();
    await otpTab.click({ force: true });

    const emailInput = page.getByPlaceholder('you@company.com');
    await emailInput.fill('pranjil+test@avua.com');

    const sendCodeBtn = page.getByRole('button', { name: 'Send sign-in code' });
    await sendCodeBtn.click({ force: true });

    await expect(page.getByText('One-time code sent successfully!')).toBeVisible();
    await expect(page.getByText(/We've sent an one-time code to your email/i)).toBeVisible();
  });

  test('TC04 - should display error message when submitting an unregistered email address', async ({ page }) => {
    await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    const otpTab = page.getByRole('button', { name: 'One-time code' }).first();
    await otpTab.click({ force: true });

    const emailInput = page.getByPlaceholder('you@company.com');
    await emailInput.fill('user@company.com');

    const sendCodeBtn = page.getByRole('button', { name: 'Send sign-in code' });
    await sendCodeBtn.click({ force: true });

    await expect(page.getByText(/user does not exist/i)).toBeVisible();
  });

  test('TC05 - should keep send sign-in code button disabled when email input is left blank', async ({ page }) => {
    await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    const otpTab = page.getByRole('button', { name: 'One-time code' }).first();
    await otpTab.click({ force: true });

    const emailInput = page.getByPlaceholder('you@company.com');
    await expect(emailInput).toBeEmpty();

    const sendCodeBtn = page.getByRole('button', { name: 'Send sign-in code' });
    await expect(sendCodeBtn).toBeDisabled();
  });

  test('TC06 - should transition to password recovery view when clicking forgot password link', async ({ page }) => {
    await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    const passwordTab = page.getByRole('button', { name: 'Password' }).first();
    await passwordTab.click({ force: true });

    const forgotPasswordBtn = page.getByText('Forgot password?');
    await forgotPasswordBtn.click({ force: true });

    await expect(page.getByText('Reset password in two quick steps')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset password' })).toBeVisible();
  });
});