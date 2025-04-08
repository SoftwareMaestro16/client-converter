import React, { useState, useEffect } from "react";
import styles from ".././styles/App.module.css";
import Block from "./Block";
import prbIcon from ".././assets/prb-logo.jpg";
import agroIcon from ".././assets/agro-logo.jpg";
import usdFlag from ".././assets/usd-flag.jpg";
import eurFlag from ".././assets/eur-flag.jpg";
import rubFlag from ".././assets/rub-flag.jpg";
import mdlFlag from ".././assets/mdl-flag.jpg";
import uahFlag from ".././assets/uah-flag.jpg";
import axios from "axios";
import { getCurrencies } from "./utils/getCurrencies";
import WebApp from '@twa-dev/sdk';

declare global {
  interface Window {
    Telegram?: any;
  }
}

type Rate = {
  ticker: string;
  buy: number;
  sell: number;
};

type Rates = {
  prb: Rate[] | null;
  sber: Rate[] | null;
  agro: Rate[] | null;
};

const App = () => {
  const [rates, setRates] = useState<Rates>({
    prb: null,
    sber: null,
    agro: null,
  });

  const [sellCurrency, setSellCurrency] = useState<string>("RUP");
  const [receiveCurrency, setReceiveCurrency] = useState<string>("USD");
  const [selectedBank, setSelectedBank] = useState<string>("PRB");
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<number>(0);

  useEffect(() => {
    const isTgCheck = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData;

    if (isTgCheck) {
      WebApp.ready();
      WebApp.enableClosingConfirmation();
      WebApp.expand();
      WebApp.setHeaderColor('#d41c28'); 
      
      document.body.style.backgroundColor = '#ffffff';
    }
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get("https://server-converter-kiav.onrender.com/");
        const data = response.data;

        if (data && (data.prb || data.sber || data.agro)) {
          const { agro, prb, sber } = data;

          setRates({
            prb: prb || null,
            sber: sber || null,
            agro: agro || null,
          });
          setIsLoading(false);
        } else {
          console.error("Данные о курсах валют не получены");
        }
      } catch (error) {
        console.error("Ошибка при запросе данных:", error);
      }
    };

    fetchRates();
  }, []);

  const calculateConversion = (): number => {
    const selectedRates =
      selectedBank === "PRB"
        ? rates.prb
        : selectedBank === "SBER"
        ? rates.sber
        : rates.agro;

    if (!selectedRates) {
      console.error("Курсы не загружены для выбранного банка");
      return 0;
    }

    if (sellCurrency === "RUP") {
      const receiveRate = selectedRates.find((rate) => rate.ticker === receiveCurrency);
      if (!receiveRate) {
        console.error(`Курс для покупки ${receiveCurrency} не найден`);
        return 0;
      }
      return sellAmount / receiveRate.buy;
    }

    if (receiveCurrency === "RUP") {
      const sellRate = selectedRates.find((rate) => rate.ticker === sellCurrency);
      if (!sellRate) {
        console.error(`Курс для продажи ${sellCurrency} не найден`);
        return 0;
      }
      return sellAmount * sellRate.sell;
    }

    const sellRate = selectedRates.find((rate) => rate.ticker === sellCurrency);
    const receiveRate = selectedRates.find((rate) => rate.ticker === receiveCurrency);

    if (!sellRate) {
      console.error(`Курс для продажи ${sellCurrency} не найден`);
      return 0;
    }

    if (!receiveRate) {
      console.error(`Курс для покупки ${receiveCurrency} не найден`);
      return 0;
    }

    return (sellAmount * sellRate.sell) / receiveRate.buy;
  };

  useEffect(() => {
    if (!isLoading && rates) {
      const result = calculateConversion();
      setConversionResult(result);
    }
  }, [sellAmount, sellCurrency, receiveCurrency, selectedBank, rates, isLoading]);

  const handleCurrencyChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    otherSetter: React.Dispatch<React.SetStateAction<string>>,
    otherCurrency: string
  ) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = event.target.value;

    if (selectedCurrency === "RUP" && otherCurrency === "RUP") {
      return;
    }

    if (selectedCurrency !== "RUP" && otherCurrency !== "RUP") {
      otherSetter("RUP");
    }
    setter(selectedCurrency);
  };

  const handleSwap = () => {
    if (sellCurrency === "RUP" && receiveCurrency === "RUP") {
      setReceiveCurrency("USD");
    } else if (sellCurrency === "RUP") {
      setSellCurrency(receiveCurrency);
      setReceiveCurrency("RUP");
    } else {
      setSellCurrency("RUP");
      setReceiveCurrency(sellCurrency);
    }
  };

  const currencies = getCurrencies(selectedBank);

  const tableCurrencies = [
    { ticker: "USD", flag: usdFlag },
    { ticker: "EUR", flag: eurFlag },
    { ticker: "RUB", flag: rubFlag },
    { ticker: "MDL", flag: mdlFlag },
    { ticker: "UAH", flag: uahFlag },
  ];

  const selectedRates =
    selectedBank === "PRB"
      ? rates.prb
      : selectedBank === "SBER"
      ? rates.sber
      : rates.agro;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>Загрузка курсов...</h1>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div>
      <br />
      <h1 className={styles.mainText}>ПМР Конвертер</h1>
      <div className={styles.exchangeBlock}>
        <Block
          label="Продажа:"
          currencies={currencies}
          selectedCurrency={sellCurrency}
          onCurrencyChange={handleCurrencyChange(
            setSellCurrency,
            setReceiveCurrency,
            receiveCurrency
          )}
          amount={sellAmount}
          onAmountChange={(value: number) => setSellAmount(value)}
          isLoading={false}
        />
        <div className={styles.swapButton} onClick={handleSwap}>
          <img
            className={styles.imageSwap}
            src="https://cdn-icons-png.flaticon.com/512/7133/7133490.png"
            alt="⟷"
          />
        </div>
        <Block
          label="Покупка:"
          currencies={currencies}
          selectedCurrency={receiveCurrency}
          onCurrencyChange={handleCurrencyChange(
            setReceiveCurrency,
            setSellCurrency,
            sellCurrency
          )}
          amount={parseFloat(conversionResult.toFixed(4))}
          isLoading={false}
          onAmountChange={() => {}}
        />
      </div>

      <div className={styles.ratesTable}>
        <table>
          <thead>
            <tr>
              <th>Валюта</th>
              <th>Покупка</th>
              <th>Продажа</th>
            </tr>
          </thead>
          <tbody>
            {tableCurrencies.map(({ ticker, flag }) => {
              const rate = selectedRates?.find((r) => r.ticker === ticker);
              return (
                <tr key={ticker}>
                  <td>
                    <img src={flag} alt={`${ticker} flag`} className={styles.flagIcon} />
                    {ticker}
                  </td>
                  <td>{rate ? rate.buy.toFixed(2) : "0,00"}</td>
                  <td>{rate ? rate.sell.toFixed(2) : "0,00"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.bankSelector}>
        <button
          className={`${styles.bankButton} ${
            selectedBank === "PRB" ? styles.activeBank : ""
          }`}
          onClick={() => setSelectedBank("PRB")}
        >
          <img src={prbIcon} alt="PRB" className={styles.bankIcon} />
        </button>
        <button
          className={`${styles.bankButton} ${
            selectedBank === "AGRO" ? styles.activeBank : ""
          }`}
          onClick={() => setSelectedBank("AGRO")}
        >
          <img src={agroIcon} alt="AGRO" className={styles.bankIcon} />
        </button>
      </div>
    </div>
  );
};

export default App;