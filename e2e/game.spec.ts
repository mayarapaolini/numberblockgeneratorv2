import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

async function freshGame(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("number-primary")).toBeVisible();
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

test.describe("Laboratório dos Números", () => {
  test("soma e subtração alteram o número exibido", async ({ page }) => {
    await freshGame(page);
    await expect(page.getByTestId("number-primary")).toHaveText("1");

    await page.getByRole("button", { name: "Somar 1", exact: true }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("2");

    await page.getByRole("button", { name: "Somar 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("12");

    await page.getByRole("button", { name: "Subtrair 1", exact: true }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("11");

    await page.getByRole("button", { name: "Subtrair 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("1");
  });

  test("multiplicação, divisão e entrada decimal funcionam sem gerar NaN", async ({ page }) => {
    await freshGame(page);

    await page.getByRole("button", { name: "Multiplicar por 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("10");

    await page.getByRole("button", { name: "Dividir por 2" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("5");

    const multiplierInput = page.getByLabel("Valor do multiplicador ou divisor personalizado");
    await multiplierInput.fill("1.5");
    await page.getByRole("button", { name: "Multiplicar pelo valor digitado" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("7,5");

    await multiplierInput.fill("0.001");
    await page.getByRole("button", { name: "Dividir pelo valor digitado" }).click();
    const text = await page.getByTestId("number-primary").textContent();
    expect(text).not.toContain("NaN");
    expect(text).not.toContain("Infinity");
  });

  test("dividir por zero mostra mensagem amigável em vez de travar", async ({ page }) => {
    await freshGame(page);
    const multiplierInput = page.getByLabel("Valor do multiplicador ou divisor personalizado");
    await multiplierInput.fill("0");
    await page.getByRole("button", { name: "Dividir pelo valor digitado" }).click();
    await expect(page.getByRole("alert")).toContainText("zero");
    await expect(page.getByTestId("number-primary")).not.toHaveText("NaN");
  });

  test("navegação entre modos e atalhos de teclado funcionam", async ({ page }) => {
    await freshGame(page);

    await page.getByRole("button", { name: /Modo Negativos/ }).click();
    await expect(page.getByRole("button", { name: /Modo Negativos/ })).toHaveAttribute("aria-pressed", "true");

    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("number-primary")).toHaveText("2");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("number-primary")).toHaveText("0");

    await page.keyboard.press("r");
    await expect(page.getByTestId("number-primary")).toHaveText("1");
  });

  test("modo automático inicia, roda e pausa sem travar a interface", async ({ page }) => {
    await freshGame(page);
    await page.getByRole("button", { name: /Modo Automático/ }).click();
    await page.getByRole("button", { name: "Iniciar modo automático" }).click();

    await page.waitForTimeout(1200);
    const runningValue = await page.getByTestId("number-primary").textContent();
    expect(Number(runningValue?.replace(/\./g, "").replace(",", "."))).toBeGreaterThan(1);

    await page.getByRole("button", { name: "Pausar modo automático", exact: true }).click();
    const pausedValue = await page.getByTestId("number-primary").textContent();
    await page.waitForTimeout(600);
    await expect(page.getByTestId("number-primary")).toHaveText(pausedValue ?? "");

    // Interface must remain responsive after automatic mode has run.
    await page.getByRole("button", { name: /Modo Livre/ }).click();
    await expect(page.getByRole("button", { name: /Modo Livre/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("desfazer e refazer restauram valores anteriores", async ({ page }) => {
    await freshGame(page);
    await page.getByRole("button", { name: "Somar 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("11");

    await page.getByRole("button", { name: "Desfazer última ação" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("1");

    await page.getByRole("button", { name: "Refazer última ação desfeita" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("11");
  });

  test("tela verde ativa e desativa pelo atalho G", async ({ page }) => {
    await freshGame(page);
    await page.keyboard.press("g");
    await expect(page.getByTestId("green-screen-stage")).toBeVisible();

    await page.keyboard.press("g");
    await expect(page.getByTestId("green-screen-stage")).toHaveCount(0);
  });

  test("troca para representação simbólica em números grandes", async ({ page }) => {
    await freshGame(page);
    await page.getByRole("button", { name: /Modo Potências de 10/ }).click();
    await page.getByRole("button", { name: "Ir para 10 elevado a 12" }).click();

    const text = await page.getByTestId("number-primary").textContent();
    expect(text).toContain("×");
    expect(text).toContain("10");
  });

  test("funciona em tela pequena sem estourar a largura ou esconder botões", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await freshGame(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await expect(page.getByRole("button", { name: "Somar 1", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Somar 1", exact: true }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("2");
  });

  test("estado é restaurado após recarregar a página", async ({ page }) => {
    await freshGame(page);
    await page.getByRole("button", { name: "Somar 10" }).click();
    await page.getByRole("button", { name: "Somar 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("21");

    await page.waitForTimeout(600); // let debounced localStorage write flush
    await page.reload();
    await expect(page.getByTestId("number-primary")).toHaveText("21");
  });

  test("fluxo crítico: aumenta, entra no modo exponencial e chega a 10^3000003 sem Infinity, NaN ou erros", async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await freshGame(page);

    await page.getByRole("button", { name: "Somar 1", exact: true }).click();
    await page.getByRole("button", { name: "Somar 10" }).click();
    await expect(page.getByTestId("number-primary")).toHaveText("12");

    await page.getByRole("button", { name: /Modo Potências de 10/ }).click();
    await page
      .getByRole("button", { name: "Ir para o expoente máximo, 10 elevado a 3000003" })
      .click();

    await expect(page.getByRole("heading", { name: /expoente atual: 3000003/ })).toBeVisible();

    const primaryText = await page.getByTestId("number-primary").textContent();
    expect(primaryText).not.toContain("Infinity");
    expect(primaryText).not.toContain("NaN");
    expect(primaryText).toContain("³⁰⁰⁰⁰⁰³");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Infinity");
    expect(bodyText).not.toContain("NaN");

    // Orientation change: landscape then back to portrait.
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.waitForTimeout(200);
    await expect(page.getByTestId("number-primary")).toContainText("³⁰⁰⁰⁰⁰³");
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(200);

    // Interface must still respond after reaching the maximum exponent.
    await page.getByRole("button", { name: "Diminuir expoente em 1" }).click();
    await expect(page.getByRole("heading", { name: /expoente atual: 3000002/ })).toBeVisible();

    expect(errors, `Unexpected console errors: ${errors.join("; ")}`).toHaveLength(0);
  });
});
