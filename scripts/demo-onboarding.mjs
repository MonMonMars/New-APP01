/**
 * Shared Playwright helpers for demo onboarding (rules-first → guest → map → profile).
 */

export async function dismissCookies(page) {
  const essential = page.getByText(/essential only/i).first();
  if (await essential.isVisible({ timeout: 1500 }).catch(() => false)) {
    await essential.click();
    await page.waitForTimeout(400);
  }
  const accept = page.getByRole('button', { name: /^accept$/i }).first();
  if (await accept.isVisible({ timeout: 800 }).catch(() => false)) {
    await accept.click();
    await page.waitForTimeout(400);
  }
}

export async function clickContinue(page) {
  const cont18 = page.getByText(/continue.*18/i).first();
  if (await cont18.isVisible({ timeout: 1200 }).catch(() => false)) {
    await cont18.click();
    await page.waitForTimeout(700);
    return true;
  }
  const cont = page.getByText(/^continue$/i).first();
  if (await cont.isVisible({ timeout: 1200 }).catch(() => false)) {
    await cont.click();
    await page.waitForTimeout(700);
    return true;
  }
  const openSpark = page.getByRole('button', { name: /open spark|got it/i }).first();
  if (await openSpark.isVisible({ timeout: 800 }).catch(() => false)) {
    await openSpark.click({ force: true });
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function tapContinueWithoutAccount(page) {
  const guest = page.getByText(/continue without account/i).first();
  if (await guest.isVisible({ timeout: 4000 }).catch(() => false)) {
    await guest.click();
    await page.waitForTimeout(800);
    return true;
  }
  return false;
}

async function reachedAppShell(page) {
  const text = await page.locator('body').innerText();
  if (/miles away|\d+\s*mi\b/i.test(text)) {
    return true;
  }
  if (
    await page
      .getByLabel(/tap .+ logo to leave/i)
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  const discoverTab = page.getByRole('tab', { name: /^discover$/i }).first();
  if (await discoverTab.isVisible().catch(() => false)) {
    return true;
  }
  const likesTab = page.getByRole('tab', { name: /^likes$/i }).first();
  if (await likesTab.isVisible().catch(() => false)) {
    return true;
  }
  const chatTab = page.getByRole('tab', { name: /^chat$/i }).first();
  if (await chatTab.isVisible().catch(() => false)) {
    return true;
  }
  if (/^pass$/im.test(text) && /super like|boost|rewind/i.test(text)) {
    return true;
  }
  return false;
}

async function selectGenderChip(page, gender) {
  if (!gender) {
    return false;
  }
  const pattern =
    gender === 'woman'
      ? /^woman$/i
      : gender === 'man'
        ? /^man$/i
        : /non-?binary/i;
  const chip = page.getByText(pattern).first();
  if (await chip.isVisible({ timeout: 1500 }).catch(() => false)) {
    await chip.click();
    await page.waitForTimeout(300);
    return true;
  }
  return false;
}

/** Walk onboarding until Spark discover or Pulse disguise shell is visible. */
export async function completeDemoOnboarding(page, { maxSteps = 26, gender } = {}) {
  for (let step = 0; step < maxSteps; step += 1) {
    await dismissCookies(page);

    if (await reachedAppShell(page)) {
      return;
    }

    const text = await page.locator('body').innerText();

    if (/i have read and agree|terms of service|community guidelines/i.test(text)) {
      const box = page.getByText(/i have read and agree/i).first();
      if (await box.isVisible({ timeout: 1500 }).catch(() => false)) {
        await box.click();
        await page.waitForTimeout(300);
      }
      if (await clickContinue(page)) {
        continue;
      }
    }

    if (/continue without account/i.test(text)) {
      if (await tapContinueWithoutAccount(page)) {
        continue;
      }
    }

    if (/choose your region/i.test(text)) {
      const confirmArea = page
        .getByRole('button', { name: /continue with this area/i })
        .or(page.getByText(/continue with this area/i))
        .first();
      await confirmArea.scrollIntoViewIfNeeded().catch(() => {});
      if (await confirmArea.isVisible({ timeout: 5000 }).catch(() => false)) {
        await confirmArea.click({ force: true });
        await page.waitForTimeout(1200);
        continue;
      }
      const useLoc = page.getByText(/use my location/i).first();
      if (await useLoc.isVisible({ timeout: 2000 }).catch(() => false)) {
        await useLoc.click();
        await page.waitForTimeout(900);
        continue;
      }
    }

    if (/personalize your feed/i.test(text)) {
      if (await clickContinue(page)) {
        continue;
      }
    }

    if (/i am a/i.test(text)) {
      await selectGenderChip(page, gender);
      if (await clickContinue(page)) {
        continue;
      }
    }

    if (/your public profile/i.test(text) && !/create your profile/i.test(text)) {
      if (await clickContinue(page)) {
        continue;
      }
    }

    if (/create your profile|your public profile/i.test(text)) {
      const openPulse = page
        .getByRole('button', { name: /open pulse/i })
        .or(page.getByText(/open pulse/i))
        .first();
      if (await openPulse.isVisible({ timeout: 4000 }).catch(() => false)) {
        await openPulse.click({ force: true });
        await page.waitForTimeout(2500);
        if (await reachedAppShell(page)) {
          return;
        }
      }
    }

    if (/what are you looking for|personalize your feed/i.test(text)) {
      const firstIntent = page.getByText(/long.term|short.term|new friends|not sure/i).first();
      if (await firstIntent.isVisible({ timeout: 1500 }).catch(() => false)) {
        await firstIntent.click();
        await page.waitForTimeout(300);
      }
      if (await clickContinue(page)) {
        continue;
      }
    }

    if (await clickContinue(page)) {
      continue;
    }

    await page.waitForTimeout(400);
  }
}

export async function unlockSparkFromPulse(page) {
  await dismissCookies(page);
  const unlock = page.getByLabel(/tap .+ logo to leave/i).first();
  await unlock.waitFor({ state: 'visible', timeout: 8000 });
  await unlock.click({ force: true });
  await page.waitForTimeout(600);

  const leave = page
    .getByRole('button', { name: /^Leave (Spark|Pulse)$/i })
    .or(page.getByText(/^Leave (Spark|Pulse)$/i))
    .first();
  if (await leave.isVisible({ timeout: 3000 }).catch(() => false)) {
    await leave.click();
    await page.waitForTimeout(600);
  }

  const policy = page.getByText(/i understand — leave (spark|pulse)/i).first();
  if (await policy.isVisible({ timeout: 3000 }).catch(() => false)) {
    await policy.click();
    await page.waitForTimeout(1200);
  }
}

/** Open Pulse disguise feed (For You) from Spark discover or confirm already in disguise. */
export async function enterPulseForYouFeed(page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const leave = page.getByLabel(/tap .+ logo to leave/i).first();
    if (await leave.isVisible().catch(() => false)) {
      break;
    }

    const pulseTab = page
      .getByLabel(/pulse disguise mode/i)
      .or(page.getByRole('tab', { name: /^pulse$/i }))
      .first();
    if (await pulseTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pulseTab.click();
      await page.waitForTimeout(1000);
    }

    const forYou = page.getByRole('tab', { name: /for you/i }).first();
    if (await forYou.isVisible({ timeout: 3000 }).catch(() => false)) {
      await forYou.click();
      await page.waitForTimeout(800);
    }
  }

  await page
    .getByLabel(/tap .+ logo to leave/i)
    .first()
    .waitFor({ state: 'visible', timeout: 12000 });
}
