export const getCurrencies = (selectedBank: string): string[] => {
    if (selectedBank === "PRB") {
      return [
        "USD",
        "EUR",
        "RUB",
        "MDL",
        "UAH",
        "GBP",
        "PLN",
        "CHF",
        "BGN",
        "RON",
        "AED",
        "CNY",
        "JPY",
        "TRY",
        "BYN",
      ];
    }
    return ["RUP", "USD", "EUR", "RUB", "MDL", "UAH"];
  };